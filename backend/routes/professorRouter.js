const express = require('express');
const routerProfessor = express.Router();
const professorController = require('../controller/professorController.js');

//Solicitar chave publica
routerProfessor.get('/professor/get/public-key', professorController.GetPublicKey);  

//Enviar chave Publica
routerProfessor.post('/professor/post/public-key', professorController.SendPublicKey);  

//Login
routerProfessor.post('/professor/login', professorController.Login);

//Cadastro
routerProfessor.post('/professor', professorController.Create);

//Perfil
routerProfessor.get('/professor/:id', professorController.GetProfile);

//Deletar
routerProfessor.delete('/professor/:id', professorController.Delete);

//Home
routerProfessor.get('/professor/:id/home', professorController.Home);

//Recuperar senha
routerProfessor.post('/professor/recover-password/:id', professorController.RecoverPassword);

//Enviar email
routerProfessor.get('/professor/send-email/:id', professorController.SendEmail);

//Nova Senha
routerProfessor.post('/professor/new-password/:id', professorController.NewPassword);

module.exports = routerProfessor;
