//Controller de instituicao

exports.login = (req, res) => {
  res.status(200).send('Rota para instituicao fazer login');
};

exports.deletar = (req, res) => {
  const id = req.params.id;
  res.status(204).send();
};

exports.adicionarProfessor = (req, res) => {
  res.status(201).send('Rota para adicionar professor');
};

exports.verDossies = (req, res) => {
  res.status(200).send('Rota para ver dossies da instituicao');
};

exports.perfil = (req, res) => {
  const id = req.params.id;
  res.status(200).send(`Perfil da instituição ${id}`);
};
