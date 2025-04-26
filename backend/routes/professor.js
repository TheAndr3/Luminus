const express = require('express');
const routerProfessor = express.Router();
const professorController = require('../controller/professorController.js');

//Login
routerProfessor.post('/professor/login', professorController.login);

//Cadastro
routerProfessor.post('/professor', professorController.cadastrar);

//Perfil
routerProfessor.get('/professor/:id', professorController.verPerfil);

//Home
routerProfessor.get('/professor/:id/home', professorController.home);

//Deletar
routerProfessor.delete('/professor/:id', professorController.deletar);

//Recuperar senha
routerProfessor.post('/professor/recuperar-senha', professorController.recuperarSenha);

//Enviar chave publica
routerProfessor.get('/professor/public-key', professorController.Key);  

module.exports = routerProfessor;
