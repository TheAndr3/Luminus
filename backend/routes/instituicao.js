const express = require('express');
const routerInstituicao = express.Router();
const instituicaoController = require('../controller/instituicaoController.js');

//Login
routerInstituicao.post('/instituicao/login', instituicaoController.login);

//Deletar instituição
routerInstituicao.delete('/instituicao/:id', instituicaoController.deletar);

//Adicionar professor
routerInstituicao.post('/instituicao/:id/professores', instituicaoController.adicionarProfessor);

//Ver dossiês da instituição
routerInstituicao.get('/instituicao/:id/dossies', instituicaoController.verDossies);

//Ver perfil da instituição
routerInstituicao.get('/instituicao/:id', instituicaoController.perfil);

module.exports = routerInstituicao;
