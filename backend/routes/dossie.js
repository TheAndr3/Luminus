const express = require('express');
const routerDossie = express.Router();

//Criar dossiê
routerDossie.post('/dossies/criar', (req, res) => {
  res.send('Rota para criar dossiê');
});

//Listar dossiês
routerDossie.get('/dossies/list', (req, res) => {
  res.send('Rota para listar dossiês');
});

//ver dossiê específico
routerDossie.get('/dossies/:id', (req, res) => {
  res.send('Rota para obter um dossiê específico');
});

//atualizar dossiê
routerDossie.put('/dossies/:id/editar', (req, res) => {
  res.send('Rota para atualizar dossiê');
});

//deletar dossiê
routerDossie.delete('/dossies/:id/delete', (req, res) => {
  res.send('Rota para deletar dossiê');
});

module.exports = routerDossie;