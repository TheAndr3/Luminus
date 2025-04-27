const express = require('express');
const routerInstituition = express.Router();
const instituitionController = require('../controller/instituitionController.js');

//Login
routerInstituition.post('/instituition/login', instituitionController.Login);

//Deletar instituição
routerInstituition.delete('/instituition/:id', instituitionController.Delete);

//Adicionar professor
routerInstituition.post('/instituition/:id/professores', instituitionController.addTeacher);

//Ver dossiês da instituição
routerInstituition.get('/instituition/:id/dossies', instituitionController.ReadDossier);

//Ver perfil da instituição
routerInstituition.get('/instituition/:id', instituitionController.Profile);

module.exports = routerInstituition;
