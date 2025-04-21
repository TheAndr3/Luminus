const express = require('express');
const routerDossie = express.Router();

//Criar dossiê
app.post('/dossies/criar', (req, res) => {
  res.send('Rota para criar dossiê');
});

//Listar dossiês
app.get('/dossies/list', (req, res) => {
  res.send('Rota para listar dossiês');
});

//ver dossiê específico
app.get('/dossies/:id', (req, res) => {
  res.send('Rota para obter um dossiê específico');
});

//atualizar dossiê
app.put('/dossies/:id/editar', (req, res) => {
  res.send('Rota para atualizar dossiê');
});

//deletar dossiê
app.delete('/dossies/:id/delete', (req, res) => {
  res.send('Rota para deletar dossiê');
});

module.exports = routerDossie;