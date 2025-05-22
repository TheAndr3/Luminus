const express = require('express');
const routerProfessor = express.Router();
const professorController = require('../controller/professorController.js');

//Enviar chave Publica
routerProfessor.get('/professor/public-key', professorController.GetPublicKey);  

//Cadastro
routerProfessor.post('/professor/register', professorController.Create);

//Login
routerProfessor.post('/professor/login', professorController.Login);

//Perfil
routerProfessor.get('/professor/:id', professorController.GetProfile);

//Deletar
routerProfessor.delete('/professor/:id', professorController.Delete);

//Home
routerProfessor.get('/professor/:id/home', professorController.Home);

//Recuperar senha
routerProfessor.post('/professor/recover-password', professorController.RecoverPassword);

//Enviar email
routerProfessor.get('/professor/send-email/:id', professorController.SendEmail);

//Nova Senha
routerProfessor.post('/professor/new-password/:token', professorController.NewPassword);

module.exports = routerProfessor;