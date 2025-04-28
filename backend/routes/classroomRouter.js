const express = require('express');
const routerClassroom = express.Router();
const classroomController = require('../controller/classroomController.js');

//Listar class
routerClassroom.get('/class', classroomController.List);

//Obter class específica
routerClassroom.get('/class/:id', classroomController.Get);

//Criar nova class
routerClassroom.post('/class', classroomController.Create);

//Editar class
routerClassroom.put('/class/:id', classroomController.Update);

//Deletar class
routerClassroom.delete('/class/:id', classroomController.Delete);

module.exports = routerClassroom;
