//Controller de dossie

exports.Create = async (req, res) => {
  res.status(201).send('Rota para criar dossiê');
}

exports.List = async(req, res) => {
  res.status(200).send('Rota para listar dossiês');
}

exports.Get = async (req, res) => {
  const id = req.params.id;
  res.status(200).send(`Rota para obter o dossiê ${id}`);
}

exports.Update = async (req, res) => {
  const id = req.params.id;
  res.status(200).send(`Rota para atualizar o dossiê ${id}`);
}

exports.Delete = async (req, res) => {
  const id = req.params.id;
  res.status(204).send();
}
