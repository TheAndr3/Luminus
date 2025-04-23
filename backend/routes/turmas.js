const express = require('express');
const routerTurmas = express.Router();
const turmaController = require('../controller/turmaController.js');

//Listar turmas
routerTurmas.get('/turmas', turmaController.listar);

//Obter turma específica
routerTurmas.get('/turmas/:id', turmaController.obter);

//Criar nova turma
routerTurmas.post('/turmas', turmaController.criar);

//Editar turma
routerTurmas.put('/turmas/:id', turmaController.editar);

//Deletar turma
routerTurmas.delete('/turmas/:id', turmaController.deletar);

module.exports = routerTurmas;
