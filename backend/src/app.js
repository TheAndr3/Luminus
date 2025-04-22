const express = require('express');
const cors = require('cors');
const app = express();

//Rotas 
const routerDossie = require('../routes/dossie.js');
const routerTurmas = require('../routes/turmas.js');
const routerProfessor = require('../routes/professor.js');


app.use(cors());
app.use(routerProfessor);
app.use(routerDossie);
app.use(routerTurmas);

module.exports = app;

