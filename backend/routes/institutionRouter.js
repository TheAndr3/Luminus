const express = require('express');
const routerInstitution = express.Router();
const institutionController = require('../controller/institutionController.js');

//Login
routerInstitution.post('/institution/login', institutionController.Login);

//Deletar instituição
routerInstitution.delete('/institution/:id/delete', institutionController.Delete);

//Adicionar professor
routerInstitution.post('/institution/:id/professor', institutionController.AddProfessor);

//Ver dossiês da instituição
routerInstitution.get('/institution/:id/dossier', institutionController.GetDossier);

//Ver perfil da instituição
routerInstitution.get('/institution/:id/profile', institutionController.Profile);


// Cadastro de instituicao
routerInstitution.post('/institution/:id/register', institutionController.Create);


// Cadastro de instituicao
routerInstitution.post('/institution/:id/register', institutionController.Create);

module.exports = routerInstitution;