//Controller de turmas

exports.List = (req, res) => {
  res.status(200).send("Rota de visualizar turmas");
}

exports.Get = (req, res) => {
  const id = req.params.id;
  res.status(200).send(`Rota de visualizar turma ${id}`);
}

exports.Create = (req, res) => {
  res.status(201).send("Rota de criar turma");
}

exports.Update = (req, res) => {
  const id = req.params.id;
  res.status(200).send(`Rota de editar turma ${id}`);
}

exports.Delete = (req, res) => {
  const id = req.params.id;
  res.status(204).send(); 
}
