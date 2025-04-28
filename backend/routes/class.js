const express = require('express');
const routerClass = express.Router();
const classController = require('../controller/classController.js');

//Listar class
routerClass.get('/class', classController.List);

//Obter class específica
routerClass.get('/class/:id', classController.Get);

//Criar nova class
routerClass.post('/class', classController.Create);

//Editar class
routerClass.put('/class/:id', classController.Update);

//Deletar class
routerClass.delete('/class/:id', classController.Delete);

module.exports = routerClass;
