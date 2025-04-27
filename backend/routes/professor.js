const express = require('express');
const routerProfessor = express.Router();
const professorController = require('../controller/professorController.js');

//Login
routerProfessor.post('/professor/login', professorController.login);

//Cadastro
routerProfessor.post('/professores', professorController.cadastrar);

//Perfil
routerProfessor.get('/professores/:id', professorController.verPerfil);

//Home
routerProfessor.get('/professores/:id/home', professorController.home);

//Deletar
routerProfessor.delete('/professores/:id', professorController.deletar);

//Recuperar senha
routerProfessor.post('/professor/recuperar-senha', professorController.recuperarSenha);

module.exports = routerProfessor;
