//Controller do professor

exports.login = (req, res) => {
    res.status(200).send('Login do professor');
};

exports.cadastrar = (req, res) => {
    res.status(201).send('Cadastrar novo professor');
};

exports.verPerfil = (req, res) => {
    const id = req.params.id;
    res.status(200).send(`Perfil do professor ${id}`);
};

exports.deletar = (req, res) => {
    const id = req.params.id;
    res.status(204).send();
};

exports.recuperarSenha = (req, res) => {
    res.status(200).send('Recuperar senha do professor');
};

exports.home = (req, res) => {
    const id = req.params.id;
    res.status(200).send(`Página inicial do professor ${id}`);
};
