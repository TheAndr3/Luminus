const express = require('express');
const routerTeacher = express.Router();
const teacherController = require('../controller/teacherController.js');

//Login
routerTeacher.post('/teacher/login', teacherController.Login);

//Cadastro
routerTeacher.post('/teacher', teacherController.Create);

//Perfil
routerTeacher.get('/teacher/:id', teacherController.GetProfile);

//Home
routerTeacher.get('/teacher/:id/home', teacherController.Home);

//Deletar
routerTeacher.delete('/teacher/:id', teacherController.Delete);

//Recuperar senha
routerTeacher.post('/teacher/recuperar-senha', teacherController.RecoverPassword);

//Enviar chave publica
routerTeacher.get('/teacher/public-key', teacherController.GetPublicKey);  

module.exports = routerTeacher;
