const express = require('express');
const routerTeacher = express.Router();
const teacherController = require('../controller/teacherController.js');

//Enviar chave publica
routerTeacher.get('/teacher/public-key', teacherController.GetPublicKey);  

//Login
routerTeacher.post('/teacher/login', teacherController.Login);

//Cadastro
routerTeacher.post('/teacher', teacherController.Create);

//Perfil
routerTeacher.get('/teacher/:id', teacherController.GetProfile);

//Deletar
routerTeacher.delete('/teacher/:id', teacherController.Delete);

//Recuperar senha
routerTeacher.post('/teacher/recuperar-senha', teacherController.RecoverPassword);

//Home
routerTeacher.get('/teacher/:id/home', teacherController.Home);

module.exports = routerTeacher;
