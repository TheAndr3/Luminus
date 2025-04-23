//Controller de dossie

exports.criar = (req, res) => {
  res.status(201).send('Rota para criar dossiê');
};

exports.listar = (req, res) => {
  res.status(200).send('Rota para listar dossiês');
};

exports.obter = (req, res) => {
  const id = req.params.id;
  res.status(200).send(`Rota para obter o dossiê ${id}`);
};

exports.editar = (req, res) => {
  const id = req.params.id;
  res.status(200).send(`Rota para atualizar o dossiê ${id}`);
};

exports.deletar = (req, res) => {
  const id = req.params.id;
  res.status(204).send();
};
