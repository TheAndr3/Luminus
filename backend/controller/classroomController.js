const db = require('../bd');

exports.List = async (req, res) => {

  const profesor_id = req.params.profesorid;

  try{
    const classData = await db.pgSelect('classroom', {professor_id:profesor_id});
    res.status(200).json(classData);
  }
    catch (err) {
      console.log(err)
      res.status(400).json({msg:'falha ao atender solicitacao'});
    }
  
}

exports.Get = async (req, res) => {
  const id = req.params.id;

  try{
    const classData = await db.pgSelect('classroom',{id:id});
    res.status(200).json(classData);
  } catch(err) {
    res.status(400).json({msg:'id invalido'});
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

      res.status(201).json({msg:'classe criada com sucesso'});

    } else {
      res.status(400).json({msg:'id de professor invalido'});
    }
  } catch (error) {
    res.status(400).json({msg:'nao foi possivel atender a solicitacao'})
  }
}

exports.Update = async (req, res) => {
  try {
    const professor = await db.pgSelect('professor', { id: req.body.professor_id });

    if (Object.values(professor).length > 0) {
      const payload = {
        id: req.params.id,
        professor_id: req.body.professor_id,
        name: req.body.name,
        description: req.body.description,
        season: req.body.season,
        institution: req.body.institution,
        dossier_id: req.body.dossier_id,
        dossier_professor_id: req.body.dossier_professor_id
      };

      await db.pgUpdate('classroom', payload, ['id', 'professor_id']);

      res.status(200).json({ msg: 'turma atualizada com sucesso' });
    } else {
      res.status(400).json({ msg: 'id de professor invalido' });
    }
  } catch (error) {
    res.status(400).json({ msg: 'nao foi possivel atender a solicitacao' });
  }
};



exports.Delete = async (req, res) => {
  try {
    const payload = {
      id: req.params.id,
      professor_id: req.body.professor_id
    };

    await db.pgDelete('classroom', payload);

    res.status(200).json({ msg: 'turma removida com sucesso' });
  } catch (error) {
    res.status(400).json({ msg: 'nao foi possivel atender a solicitacao' });
  }
};

