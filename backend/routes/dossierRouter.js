const express = require('express');
const routerDossier = express.Router();
const dossierController = require('../controller/dossierController.js');

//Criar dossiê
routerDossier.post('/dossier', dossierController.Create);

//Listar todos os dossiês
routerDossier.get('/dossier', dossierController.List);

//Obter dossiê específico
routerDossier.get('/dossier/:id', dossierController.Get);

//Editar dossiê
routerDossier.put('/dossier/:id', dossierController.Update);

//Deletar dossiê
routerDossier.delete('/dossier/:id', dossierController.Delete);

module.exports = routerDossier;
