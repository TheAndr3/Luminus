const express = require('express');
const cors = require('cors');
const app = express();

//Rotas 
const routerPerfil = require('../routes/routerPerfil.js');
const routerDossie = require('../routes/routerDossie.js');
const routerHome = require('../routes/routerHome.js');
const routerLogin = require('../routes/routerLogin.js');
const routerTurmas = require('../routes/routerTurmas.js');

app.use(cors());
app.use(routerLogin);
app.use(routerHome);
app.use(routerPerfil);
app.use(routerDossie);
app.use(routerTurmas);


module.exports = app;

