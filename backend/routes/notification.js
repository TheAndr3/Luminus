const express = require('express');
const routerNotification = express.Router();
const notificationController = require('../controller/notificationController.js');

//listar notificações
routerNotification.get('/notification', notificationController.Listar);

//enviar notificação
routerNotification.post('/notification/:id', notificationController.Enviar);

//aceitar soliticação
routerNotification.post('/notification/:id/aceitar', notificationController.Aceitar);

//rejeitar soliticação
routerNotification.post('/notification/:id/rejeitar', notificationController.Rejeitar);

//deletar notificação
routerNotification.delete('/notification/:id/deletar', notificationController.Deletar);

module.exports = routerNotification;