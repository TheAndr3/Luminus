const express = require('express');
const routerAppraisal = express.Router();
const appraisalController = require('../controller/appraisalController.js');

//Obter as notas de uma turma
routerAppraisal.get('/appraisal/:classid/list', appraisalController.List);

//obter a avaliação de um estudante
routerAppraisal.get('/appraisal/:classid/:studentid', appraisalController.Get);

//obter toda avaliação de um aluno
routerAppraisal.get('/appraisal/:id', appraisalController.GetAppraisal);

//Criar novo avaliação
routerAppraisal.post('/appraisal/:classid/create', appraisalController.Create);

//Editar avaliação
routerAppraisal.put('/appraisal/:classid/update/:studentid', appraisalController.Update);

//Deletar avaliação
routerAppraisal.delete('/appraisal/:classid/delete/:studentid', appraisalController.Delete);

module.exports = routerAppraisal;