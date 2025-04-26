const express = require('express');
const routerNotificacao = express.Router();
const notificacaoController = require('../controller/notificacaoController.js');

//listar notificações
routerNotificacao.get('/notificacao', notificacaoController.Listar);

//enviar notificação
routerNotificacao.post('/notificacao/:id', notificacaoController.Enviar);

//aceitar soliticação
routerNotificacao.post('/notificacao/:id/aceitar', notificacaoController.Aceitar);

//rejeitar soliticação
routerNotificacao.post('/notificacao/:id/rejeitar', notificacaoController.Rejeitar);

//deletar notificação
routerNotificacao.delete('/notificacao/:id/deletar', notificacaoController.Deletar);