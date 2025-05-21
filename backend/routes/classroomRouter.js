const express = require('express');
const routerClassroom = express.Router();
const classroomController = require('../controller/classroomController.js');

//Listar class

routerClassroom.get('/classroom/list/:professorid', classroomController.List);


//Obter class específica
routerClassroom.get('/classroom/:id', classroomController.Get);

//Criar nova class

routerClassroom.post('/classroom/create', classroomController.Create);

//Editar class
routerClassroom.put('/classroom/:id/update', classroomController.Update);

//Deletar class
routerClassroom.delete('/classroom/:id/delete', classroomController.Delete);


//Associar dossiê
routerClassroom.put('/classroom/:classid/associate-dossier/:dossierid', classroomController.AssociateDossier);


module.exports = routerClassroom;