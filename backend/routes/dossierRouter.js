const express = require('express');
const routerDossier = express.Router();
const dossierController = require('../controller/dossierController.js');
const exportDossie = require('../utils/exportDossie.js');

//Criar dossiê
routerDossier.post('/dossier/create', dossierController.Create);

//Listar todos os dossiês
routerDossier.get('/dossier/list/:professorid', dossierController.List);

//Obter dossiê específico
routerDossier.get('/dossier/:id', dossierController.Get);

//Editar dossiê
routerDossier.put('/dossier/:id/edit', dossierController.Update);

//Deletar dossiê
routerDossier.delete('/dossier/:id/delete', dossierController.Delete);

//Exportar dossiê para CSV
routerDossier.get('/dossier/export/:id', exportDossie.ExportToCsv);

module.exports = routerDossier;