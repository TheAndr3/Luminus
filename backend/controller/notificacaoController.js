// NotificacaoController.js

exports.Listar = (req, res) =>{
    res.status(200).send('Rota para listar notificações');
}

exports.Enviar = (req, res) =>{
    res.status(201).send('Rota para enviar notificação');
}

exports.Aceitar = (req, res) =>{
    res.status(201).send('Rota para aceitar solicitação');
}

exports.Rejeitar = (req, res) =>{
    res.status(201).send('Rota para rejeitar solicitação');
}

exports.Deletar = (req, res) =>{
    res.status(204).send();
}