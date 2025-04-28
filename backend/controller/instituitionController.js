//Controller de instituicao

exports.Login = (req, res) => {
  res.status(200).send('Rota para instituicao fazer login');
}

exports.Delete = (req, res) => {
  const id = req.params.id;
  res.status(204).send();
}

exports.addTeacher = (req, res) => {
  res.status(201).send('Rota para adicionar professor');
}

exports.ReadDossier = (req, res) => {
  res.status(200).send('Rota para ver dossies da instituicao');
}

exports.Profile = (req, res) => {
  const id = req.params.id;
  res.status(200).send(`Perfil da instituição ${id}`);
}
