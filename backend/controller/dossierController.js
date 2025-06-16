const db = require('../bd');

exports.Create = async (req, res) => {

  try{
    const {name, professor_id, description, evaluation_method, sections} = req.body;

    var payload = {
      name:evaluation_method[0].name,
      costumUser_id:professor_id,
    };

    //insere o metodo de avaliação no banco de dados
    await db.pgInsert('EvaluationMethod', payload);
    const evMethod = await db.pgSelect('EvaluationMethod', {costumUser_id:professor_id, name:evaluation_method[0].name});

    //insere os campos de avaliação
    for (let i = 0; i < evaluation_method.length; i++) {
      var type = evaluation_method[i];
      payload = {
        name:type.name,
        value:type.value,
        evaluation_method:evMethod.id,
        costumUser_id:professor_id
      }
      await db.pgInsert('EvaluationType', payload);
    
    } 

    payload = {
      name:name, 
      costumUser_id:professor_id,
      description:description,
      evaluation_method:evMethod.id,
    }
    
    //insere no banco de dados o novo dossie
    const dossie = await db.pgInsert('dossier', payload);
    const lastDossie = await db.pgSelect('dossier', {costumUser_id:professor_id, name:name});

    //pra cada sessao existente insere no banco de dados as sessoes pertencentes a esse dossie
    for (let i = 0; i < sections.length; i++) {
      var section = sections[i];
      const questions = section.questions;
      payload = {
        dossier_id:lastDossie[0].id,
        costumUser_id:professor_id,
        name:section.name,
        description:section.description,
        weigth:section.weigth
      }

      //atualiza o objeto sessao para conter agora tambem seu Id
      await db.pgInsert('Section', payload);
      var lastSection = await db.pgSelect('Section', {costumUser_id:professor_id, name:section.name, dossier_id:lastDossie[0].id});

      //para cada questao dentro desta sessao, cria uma nova entrada no banco de dados
      for (let j = 0; j < questions.length; j++) {
        var question = questions[j];
        payload = {
          costumUser_id:professor_id,
          dossier_id:lastDossie[0].id,
          section_id:lastSection[0].id,
          description:question.description
        }
        await db.pgInsert('question', payload);
      }
    }

    return res.status(201).json({msg:'dossie criado com sucesso', data:dossie});
  } catch (err) {
    console.log(err);
    return res.status(400).json({msg:'nao foi possivel atender a sua solicitacao'});
  }
}

exports.List = async(req, res) => {
  const professor_id = req.params.professorid;
  let start;
  let size;

  try{
    start = (parseInt(req.query.start)==NaN) ? 0:parseInt(req.query.start);
    size = (parseInt(req.query.size)==NaN) ? 6:parseInt(req.query.size);
  } catch (erro) {
    console.log(erro);
  }
  
  try {
    const payload = {costumUser_id:professor_id};
    const result = await db.pgSelect('dossier', payload);

    return res.status(200).json({msg:'sucesso', data:result.slice(start, start+size), ammount:result.length});
  } catch (error) {
    console.log(error);
    return res.status(400).json({msg:'falha ao atender sua solicitacao'});
  }
}

exports.Get = async (req, res) => {
  const id = req.params.id;

  try {
    const dossier = await db.pgDossieSelect(id);
    if (!dossier) {
      return res.status(404).json({msg:'Dossiê não encontrado'});
    }
    return res.status(200).json({msg:'sucesso', data:dossier});
  } catch (error) {
    console.error('Erro ao buscar dossiê:', error);
    return res.status(500).json({msg:'Erro interno ao buscar dossiê'});
  }
}

exports.Update = async (req, res) => {
  const id = req.params.id;
  const body = req.body;

  try {
    const haveAssociationInAnyClass = await db.pgSelect('appraisal', {dossier_id:id})

    if (haveAssociationInAnyClass.length > 0) {
      return res.status(403).json({msg:'o dossie ja esta associado a uma turma e tem uma avaliação ja preenchida'})
    } else {
      const response = await db.pgDossieUpdate(body)
      return res.status(202).json({msg:'sucess', data:response});
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({msg:'erro no envio das informações'})
  }
}

exports.Delete = async (req, res) => {
  const id = req.params.id;

  try {
    // Primeiro verifica se o dossiê existe
    const dossier = await db.pgSelect('dossier', {id: id});
    if (!dossier || dossier.length === 0) {
      return res.status(404).json({msg: "Dossiê não encontrado"});
    }

    // Deleta o dossiê
    const resp = await db.pgDelete('dossier', {id: id});
    return res.status(204).json({msg: 'Dossiê removido com sucesso', data: resp});
  } catch (error) {
    console.log(error);
    return res.status(400).json({msg: "falha ao remover o dossiê"});
  }
}
