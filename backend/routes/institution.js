const express = require('express');
const routerInstitution = express.Router();
const institutionController = require('../controller/institutionController.js');

//Login
routerInstitution.post('/institution/login', institutionController.Login);

//Deletar instituição
routerInstitution.delete('/institution/:id', institutionController.Delete);

//Adicionar professor
routerInstitution.post('/institution/:id/professores', institutionController.addTeacher);

//Ver dossiês da instituição
routerInstitution.get('/institution/:id/dossies', institutionController.ReadDossier);

//Ver perfil da instituição
routerInstitution.get('/institution/:id', institutionController.Profile);

module.exports = routerInstitution;
