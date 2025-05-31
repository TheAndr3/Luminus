const db = require('../bd');

exports.List = async (req, res) => {

  const profesor_id = req.params.profesorid;
  var start = 0;
  var size = 0;

  try {
    start = req.query.start;
    size = req.query.size;
  } catch (error) {
    console.log(error);
  }

  try{
    const classData = await db.pgSelect('classroom', {professor_id:profesor_id});
    return res.status(200).json({msg:'sucesso', data:classData.slice(start, start+size-1), ammount:classData.length});
  }
    catch (err) {
      console.log(err)

      return res.status(400).json({msg:'falha ao atender solicitacao'});

    }
  
}

exports.Get = async (req, res) => {
  const id = req.params.id;

  try{
    const classData = await db.pgSelect('classroom',{id:id});
    return res.status(200).json({msg:'sucesso', data:classData});
  } catch(err) {
    return res.status(400).json({msg:'id invalido'});
  }
}

exports.Create = async (req, res) => {

  try {
    const professor = db.pgSelect('professor', {id: req.body.professor_id})

    if (Object.values(professor).length > 0) {
      const payload = {
        professor_id: req.body.professor_id,
        name: req.body.name,
        description: req.body.description,
        season: req.body.season,
        institution: req.body.institution
      }

      const resp = await db.pgInsert('classroom', payload);

      return res.status(201).json({msg:'classe criada com sucesso', data:resp});

    } else {
      return res.status(400).json({msg:'id de professor invalido'});
    }
  } catch (error) {
    return res.status(400).json({msg:'nao foi possivel atender a solicitacao'})
  }
}

exports.Update = async (req, res) => {
  try {
    const professor = await db.pgSelect('professor', { id: req.body.professor_id });

    if (Object.values(professor).length > 0) {
      const payload = {};
      
      if (req.body.name) payload.name = req.body.name;
      if (req.body.description) payload.description = req.body.description;
      if (req.body.season) payload.season = req.body.season;
      if (req.body.institution) payload.institution = req.body.institution;
      if (req.body.dossier_id) payload.dossier_id = req.body.dossier_id;
      if (req.body.dossier_professor_id) payload.dossier_professor_id = req.body.dossier_professor_id;

      const resp = await db.pgUpdate('classroom', payload, { 
        id: req.params.id,
        professor_id: req.body.professor_id 
      });

      return res.status(200).json({ msg: 'turma atualizada com sucesso', data:resp});
    } else {
      return res.status(400).json({ msg: 'id de professor invalido' });
    }
  } catch (error) {
    return res.status(400).json({ msg: 'nao foi possivel atender a solicitacao' });
  }
};

exports.Delete = async (req, res) => {
  const id = req.params.id;
    try {
    const payload = {
      classroom_id: req.params.id,
      professor_id: req.body.professor_id
    };

    await db.pgDelete('classroom', { id: payload.classroom_id, professor_id: payload.professor_id });

    return res.status(200).json({ msg: 'turma e registros relacionados removidos com sucesso' });
  } catch (error) {
    return res.status(400).json({ msg: 'nao foi possivel atender a solicitacao' });
}
}

exports.AssociateDossier = async (req, res) => {
  const classId = req.params.classid;
  const dossierId = req.params.dossierid;

  try {
    //Verifica se o dossiê existe e obtém o professor_id
    const dossier = await db.pgSelect('Dossier', { id: dossierId });
    if (!dossier) {
      return res.status(404).json({ msg: 'Dossiê não encontrado' });
    }

    //Atualiza a classe com os dois campos exigidos pela FK composta
    await db.pgUpdate(
      'Classroom',
      { id: classId },
      { dossier_id: dossier.id, dossier_professor_id: dossier.professor_id }
    );

    

    return res.status(200).json({ msg: 'Dossiê associado' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Erro ao associar dossiê' });
  }
};


