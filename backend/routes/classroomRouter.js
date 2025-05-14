const express = require('express');
const routerClassroom = express.Router();
const classroomController = require('../controller/classroomController.js');

//Listar class
routerClassroom.get('/class/list/:professorid', classroomController.List);

//Obter class específica
routerClassroom.get('/class/:id', classroomController.Get);

//Criar nova class
routerClassroom.post('/class/create', classroomController.Create);

//Editar class
routerClassroom.put('/class/:id/update', classroomController.Update);

//Deletar class
routerClassroom.delete('/class/:id/delete', classroomController.Delete);

//Associar dossiê
routerClassroom.put('/class/:classid/associate-dossier/:dossierid', classroomController.AssociateDossier);

module.exports = routerClassroom;
