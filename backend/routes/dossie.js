const express = require('express');
const routerDossie = express.Router();
const dossieController = require('../controller/dossieController.js');

//Criar dossiê
routerDossie.post('/dossies', dossieController.criar);

//Listar todos os dossiês
routerDossie.get('/dossies', dossieController.listar);

//Obter dossiê específico
routerDossie.get('/dossies/:id', dossieController.obter);

//Editar dossiê
routerDossie.put('/dossies/:id', dossieController.editar);

//Deletar dossiê
routerDossie.delete('/dossies/:id', dossieController.deletar);

module.exports = routerDossie;
