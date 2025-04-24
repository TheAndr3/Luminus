//Controller de turmas

exports.listar = (req, res) => {
  res.status(200).send("Rota de visualizar turmas");
}

exports.obter = (req, res) => {
  const id = req.params.id;
  res.status(200).send(`Rota de visualizar turma ${id}`);
}

exports.criar = (req, res) => {
  res.status(201).send("Rota de criar turma");
}

exports.editar = (req, res) => {
  const id = req.params.id;
  res.status(200).send(`Rota de editar turma ${id}`);
}

exports.deletar = (req, res) => {
  const id = req.params.id;
  res.status(204).send(); 
}
