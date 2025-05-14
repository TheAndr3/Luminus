const express = require('express');
const routerStudent = express.Router();
const studenController = require('../controller/studentController.js');

//Listar studantes de uma turma
routerStudent.get('/student/:classid/list', studenController.List);

//Obter um estudante especifico
routerStudent.get('/student/:classid/:id', studenController.Get);

//Criar novo estudante
routerStudent.post('/student/:classid/create', studenController.Create);

//criar a partir de um arquivo
routerStudent.post('/student/:classid/importcsv', studenController.ImportCsv)

//Editar estudante
routerStudent.put('/student/:classid/update/:id', studenController.Update);

//Deletar class
routerStudent.delete('/student/:classid/delete/:id', studenController.Delete);

module.exports = routerStudent;