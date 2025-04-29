//Controller de instituicao

exports.Cadastro = async (req, res) =>{
  res.status(201).send('Cadastro de instuição');
}
exports.Login = (req, res) => {
  res.status(200).send('Rota para instituicao fazer login');
}

exports.Delete = async (req, res) => {
  const id = req.params.id;
  res.status(204).send();
}

exports.addTeacher = async (req, res) => {
  res.status(201).send('Rota para adicionar professor');
}

exports.ReadDossier = async (req, res) => {
  res.status(200).send('Rota para ver dossies da instituicao');
}

exports.Profile = async (req, res) => {
  const id = req.params.id;
  res.status(200).send(`Perfil da instituição ${id}`);
}
