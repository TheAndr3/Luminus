// NotificacaoController.js

//daqui para baixo não foi feito até o dia de feratoração
exports.List = async (req, res) =>{
    res.status(200).send('Rota para listar notificações');
}

exports.Send = async (req, res) =>{
    res.status(201).send('Rota para enviar notificação');
}

exports.Accept = async (req, res) =>{
    res.status(201).send('Rota para aceitar solicitação');
}

exports.Reject = async (req, res) =>{
    res.status(201).send('Rota para rejeitar solicitação');
}

exports.Delete = async (req, res) =>{
    res.status(204).send();
}