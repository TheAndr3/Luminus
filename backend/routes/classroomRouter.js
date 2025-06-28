const express = require('express');
const routerClassroom = express.Router();
const classroomController = require('../controller/classroomController.js');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

// 'csvfile' deve ser o nome do campo no FormData do frontend que contém o arquivo
routerClassroom.post(
    '/classroom/create-with-csv', 
    upload.single('csvfile'), // Middleware do multer para um único arquivo no campo 'csvfile'
    classroomController.CreateWithCsv // Nova função de controller
);


module.exports = routerClassroom;