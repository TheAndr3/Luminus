const express = require('express');
const routerInstituicao = express.Router();
const instituicaoController = require('../controller/instituicaoController.js');

//Login
routerInstituicao.post('/instituicao/login', instituicaoController.login);

//Deletar instituição
routerInstituicao.delete('/instituicoes/:id', instituicaoController.deletar);

//Adicionar professor
routerInstituicao.post('/instituicoes/:id/professores', instituicaoController.adicionarProfessor);

//Ver dossiês da instituição
routerInstituicao.get('/instituicoes/:id/dossies', instituicaoController.verDossies);

//Ver perfil da instituição
routerInstituicao.get('/instituicoes/:id', instituicaoController.perfil);

module.exports = routerInstituicao;
