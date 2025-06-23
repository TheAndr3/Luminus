const db = require('../bd');

exports.Create = async (req, res) => {
  try{
    const {name, customUserId, description, evaluationMethod, sections} = req.body;

    if (!name || !customUserId || !description || !evaluationMethod || !sections) {
      console.error('Campos obrigatórios faltando:', { 
        hasName: !!name, 
        hasCostumUser_id: !!customUserId, 
        hasDescription: !!description, 
        hasEvaluation_method: !!evaluationMethod, 
        hasSections: !!sections 
      });
      return res.status(403).json({msg:'Campos obrigatórios faltando'});
    }

    const payloadEvaluationMethod = {
      name:evaluationMethod.name,
      customUserId:customUserId
    };

    //insere o metodo de avaliação no banco de dados
    const evMethodResult = await db.pgInsert('EvaluationMethod', payloadEvaluationMethod);

    if (!evMethodResult || !evMethodResult.rows || evMethodResult.rows.length === 0) {
      return res.status(400).json({msg:'Erro ao criar método de avaliação'});
    }

    const evMethodId = evMethodResult.rows[0].id;

    //insere os campos de avaliação
    if (evaluationMethod.evaluationType && Array.isArray(evaluationMethod.evaluationType)) {
      for (let i = 0; i < evaluationMethod.evaluationType.length; i++) {
        var type = evaluationMethod.evaluationType[i];
        var payloadEvaluationType = {
          name:type.name,
          value:type.value,
          evaluationMethodId:evMethodId,
          customUserId:customUserId
        }
        await db.pgInsert('EvaluationType', payloadEvaluationType);
      }
    }

    const payloadDossier = {
      name:name, 
      customUserId:customUserId, 
      description:description,
      evaluationMethodId:evMethodId,
    }
    
    //insere no banco de dados o novo dossie
    const dossierResult = await db.pgInsert('Dossier', payloadDossier);

    if (!dossierResult || !dossierResult.rows || dossierResult.rows.length === 0) {
      return res.status(400).json({msg:'Erro ao criar dossiê'});
    }

    const dossierId = dossierResult.rows[0].id;

    //pra cada sessao existente insere no banco de dados as sessoes pertencentes a esse dossie
    for (let i = 0; i < sections.length; i++) {
      var section = sections[i];
      const questions = section.questions;
      var payloadSection = {
        dossierId:dossierId,
        customUserId:customUserId,
        name:section.name,
        description:section.description,
        weigth:section.weigth
      }

      //atualiza o objeto sessao para conter agora tambem seu Id
      var sectionResult = await db.pgInsert('Section', payloadSection);

      if (!sectionResult || !sectionResult.rows || sectionResult.rows.length === 0) {
        return res.status(400).json({msg:'Erro ao criar seção'});
      }

      const sectionId = sectionResult.rows[0].id;

      //para cada questao dentro desta sessao, cria uma nova entrada no banco de dados
      for (let j = 0; j < questions.length; j++) {
        var question = questions[j];
        var payloadQuestion = {
          customUserId:customUserId,
          dossierId:dossierId,
          sectionId:sectionId,
          evaluationMethodId:evMethodId,
          name: question.name
        }
        await db.pgInsert('Question', payloadQuestion);
      }
    }
    return res.status(201).json({msg:'dossie criado com sucesso', data:{id: dossierId}});

  } catch (err) {
    console.error('Erro ao criar dossiê:', err);
    return res.status(500).json({msg:'nao foi possivel atender a sua solicitacao'});
  }
}

exports.List = async(req, res) => {
  const customUserId = req.params.professorid;
  let start = 0;
  let size = 6;
  let search = req.query.search || '';

  //para debug
  if ('start' in req.query || 'size' in req.query) {
    console.log('Parâmetros de paginação fornecidos')
  }
  else {
    console.log('Nenhum parâmetro de paginação fornecido')
  }

  if ('start' in req.query) {
    start = parseInt(req.query.start);
  }
  if ('size' in req.query) {
    size = parseInt(req.query.size);
  }
  
  try {
    const payload = {customUserId:customUserId};
    const result = await db.pgSelect('Dossier', payload);

    // Filtra os resultados com base no termo de busca
    const filteredResults = result.filter(dossier => 
      dossier.name.toLowerCase().includes(search.toLowerCase()) ||
      dossier.description.toLowerCase().includes(search.toLowerCase())
    );

    
    if (!filteredResults || filteredResults.length === 0 && search !== '') {
      return res.status(404).json({msg:'nenhum dossie encontrado que atenda a solicitação'});
    } 

    return res.status(200).json({
      msg:'sucesso', 
      data:filteredResults.slice(start, start+size), 
      ammount:filteredResults.length
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({msg:'falha ao atender sua solicitacao'});
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
    const body = req.body; //depois ver se isso não pode ser mudado, é certo que pode dar errado em algum momento
    try {
        const haveAssociationInAnyClass = await db.pgSelect('Appraisal', {
            dossierId: id,
            customUserId: body.customUserId
        });
        
        if (haveAssociationInAnyClass.length > 0) {
            return res.status(403).json({msg:'o dossie ja esta associado a uma turma e tem uma avaliação ja preenchida'});
        } else {
            const { name, customUserId, description, evaluationMethod, sections } = body;

            if (!id || !name || !customUserId || !description || !evaluationMethod || !sections) {
                return res.status(400).json({msg:'Campos obrigatórios faltando'});
            }

            //leiam o que as funções fazem, bastava apenas chamar a função de update que ela ja se preocupava com os pormenores de atualizar o dossier
            await db.pgDossieUpdate(body);

            return res.status(200).json({msg:'dossie atualizado com sucesso'});
        }
    } catch (err) {
        console.error('Erro ao atualizar dossiê:', err);
        return res.status(500).json({msg:'não foi possivel atender a sua solicitação'});
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
    
    //era importante verificar se ele não esta associado a alguma turma

    // Deleta o dossiê
    const resp = await db.pgDelete('dossier', {id: id});
    return res.status(204).json({msg: 'Dossiê removido com sucesso', data: resp});
  } catch (error) {
    console.log(error);
    return res.status(400).json({msg: "falha ao remover o dossiê"});
  }
}
