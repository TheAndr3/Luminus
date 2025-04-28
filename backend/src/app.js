const express = require('express');
const cors = require('cors');
const app = express();

//Rotas 
const routerDossie = require('../routes/dossier.js');
const routerTurmas = require('../routes/class.js');
const routerTeacher = require('../routes/teacher.js');
const routerNotification = require('../routes/notification.js');

app.use(cors());
app.use(express.json()); 
app.use(routerTeacher);
app.use(routerDossie);
app.use(routerTurmas);
app.use(routerNotification);

module.exports = app;