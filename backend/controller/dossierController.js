const db = require('../bd');

exports.Create = async (req, res) => {

  try{
    const {name, professor_id, description, evaluation_method, sections} = req.body;
    var payload = {
      name:name, 
      professor_id:professor_id,
      description:description,
      evaluation_method:evaluation_method,
    }
    
    //insere no banco de dados o novo dossie
    const dossie = await db.pgInsert('dossier', payload);

    //pra cada sessao existente insere no banco de dados as sessoes pertencentes a esse dossie
    for (let i = 0; i < sections.length; i++) {
      var section = sections[i];
      const questions = section.questions;
      payload = {
        dossier_id:dossie.id,
        professor_id:professor_id,
        name:section.name,
        description:section.description,
        weigth:section.weigth
      }

      //atualiza o objeto sessao para conter agora tambem seu Id
      section = await db.pgInsert('Section', payload);

      //para cada questao dentro desta sessao, cria uma nova entrada no banco de dados
      for (let j = 0; j < questions.length; j++) {
        var question = questions[j];
        payload = {
          professor_id:professor_id,
          dossier_id:dossie.id,
          section_id:section.id,
          description:question.description
        }
        
        await db.pgInsert('question', payload);
      }
    }
    res.status(201).json({msg:'dossie criado com sucesso'});
  } catch (err) {
    console.log(err);
    res.status(400).json({msg:'nao foi possivel atender a sua solicitacao'});
  }
}

exports.List = async(req, res) => {
  const professor_id = req.params.professorid;

  try {
    const payload = {professor_id:professor_id};
    const result = db.pgSelect('dossier', payload);

    res.status(200).json({msg:'sucesso', data:result});
  } catch (error) {
    console.log(error);
    res.status(400).json({msg:'falha ao atender sua solicitacao'});
  }
}

exports.Get = async (req, res) => {
  const id = req.params.id;

  try {
    const dossier = await db.pgDossieSelect(id);
    res.status(200).json({msg:'sucesso', data:dossier});
  } catch (error) {
    res.status(400).json({msg:'falha no envio da solicitação'})
  }
}

exports.Update = async (req, res) => {
  const id = req.params.id;
  const body = req.body;

  try {
    const haveAssociationInAnyClass = await db.pgSelect('appraisal', {dossier_id:id})

    if (haveAssociationInAnyClass.length > 0) {
      res.status(400).json({msg:'o dossie ja esta associado a uma turma e tem uma avaliação ja preenchida'})
    } else {
      const sections = body.sections;

      for (let i = 0; i < sections.length; i++) {
        var section = sections[i]

        var questions = section.questions;

        for(let j=0; j < questions.length; j++){
          var question = questions[j];
          var payload = {description:question.description};

          try {
            const resp = db.pgUpdate('question', payload, {id:question.id});
          } catch (error) {
            console.log(error);
            res.status(500).json({msg:'erro interno do servidor'});
          }
        }
        var payload = {
            name:section.name,
            weigth:section.weigth,
            description:section.description
          }
        try {
          const resp = db.pgUpdate('section', payload, {id:section.id});
        } catch (error) {
          console.log(error)
          res.status(500).json({msg:'erro interno do banco de dados'});
        }
      }
      res.status(202).json({msg:'sucess'});
    }
  } catch (error) {
    console.log(error)
    res.status(400).json({msg:'erro no envio das informações'})
  }
}

exports.Delete = async (req, res) => {
  const id = req.params.id;
  
  try {
    const resp = await db.pgDelete('dossier', {id:id});
  } catch (error) {
    
  }
  res.status(204).send();
}
