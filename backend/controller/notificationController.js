// NotificacaoController.js

exports.Listar = async (req, res) =>{
    res.status(200).send('Rota para listar notificações');
}

exports.Enviar = async (req, res) =>{
    res.status(201).send('Rota para enviar notificação');
}

exports.Aceitar = async (req, res) =>{
    res.status(201).send('Rota para aceitar solicitação');
}

exports.Rejeitar = async (req, res) =>{
    res.status(201).send('Rota para rejeitar solicitação');
}

exports.Deletar = async (req, res) =>{
    res.status(204).send();
}