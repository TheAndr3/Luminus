//Controller de dossie

exports.Create = (req, res) => {
  res.status(201).send('Rota para criar dossiê');
}

exports.List = (req, res) => {
  res.status(200).send('Rota para listar dossiês');
}

exports.Get = (req, res) => {
  const id = req.params.id;
  res.status(200).send(`Rota para obter o dossiê ${id}`);
}

exports.Update = (req, res) => {
  const id = req.params.id;
  res.status(200).send(`Rota para atualizar o dossiê ${id}`);
}

exports.Delete = (req, res) => {
  const id = req.params.id;
  res.status(204).send();
}
