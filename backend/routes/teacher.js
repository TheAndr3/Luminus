const express = require('express');
const routerTeacher = express.Router();
const teacherController = require('../controller/teacherController.js');

//Login
routerTeacher.post('/teacher/login', teacherController.login);

//Cadastro
routerTeacher.post('/teacher', teacherController.cadastrar);

//Perfil
routerTeacher.get('/teacher/:id', teacherController.verPerfil);

//Home
routerTeacher.get('/teacher/:id/home', teacherController.home);

//Deletar
routerTeacher.delete('/teacher/:id', teacherController.deletar);

//Recuperar senha
routerTeacher.post('/teacher/recuperar-senha', teacherController.recuperarSenha);

//Enviar chave publica
routerTeacher.get('/teacher/public-key', teacherController.GetPublicKey);  

module.exports = routerTeacher;
