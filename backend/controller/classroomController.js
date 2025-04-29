//Controller de turmas

exports.List = async (req, res) => {
  res.status(200).send("Rota de visualizar turmas");
}

exports.Get = async (req, res) => {
  const id = req.params.id;
  res.status(200).send(`Rota de visualizar turma ${id}`);
}

exports.Create = async (req, res) => {
  res.status(201).send("Rota de criar turma");
}

exports.Update = async (req, res) => {
  const id = req.params.id;
  res.status(200).send(`Rota de editar turma ${id}`);
}

exports.Delete = async (req, res) => {
  const id = req.params.id;
  res.status(204).send(); 
}
