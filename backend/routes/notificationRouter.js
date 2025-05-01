const express = require('express');
const routerNotification = express.Router();
const notificationController = require('../controller/notificationController.js');

//listar notificações
routerNotification.get('/notification/list', notificationController.List);

//enviar notificação
routerNotification.post('/notification/:id', notificationController.Send);

//aceitar soliticação
routerNotification.post('/notification/:id/accept', notificationController.Accept);

//rejeitar soliticação
routerNotification.post('/notification/:id/reject', notificationController.Reject);

//deletar notificação
routerNotification.delete('/notification/:id/delete', notificationController.Delete);

module.exports = routerNotification;