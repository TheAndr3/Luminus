const db = require('../bd');

exports.List = async (req, res) => {

  const profesor_id = req.params.profesorid;

  try{
    const classData = await db.pgSelect('classroom', {professor_id:profesor_id});
    res.status(200).json(classData);
  }
    catch (err) {
      console.log(err)
      res.status(400).json({msg:'Falha ao atender solicitação'});
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
  const id = req.params.id;
  res.status(200).send(`Rota de editar turma ${id}`);
}

exports.Delete = async (req, res) => {
  const id = req.params.id;
  res.status(204).send(); 
}