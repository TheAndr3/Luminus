const express = require('express');
const routerDossie = express.Router();

app.post('/dossies', (req, res) => {
  res.send('Rota para criar dossiê');
});

app.get('/dossies', (req, res) => {
  res.send('Rota para listar dossiês');
});

app.get('/dossies/:id', (req, res) => {
  res.send('Rota para obter um dossiê específico');
});

app.put('/dossies/:id', (req, res) => {
  res.send('Rota para atualizar dossiê');
});

app.delete('/dossies/:id', (req, res) => {
  res.send('Rota para deletar dossiê');
});

module.exports = routerDossie;