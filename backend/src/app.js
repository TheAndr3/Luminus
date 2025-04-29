const express = require('express');
const cors = require('cors');
const app = express();

//Rotas 
const routerDossie = require('../routes/dossierRouter.js');
const routerClassroom = require('../routes/classroomRouter.js');
const routerProfessor = require('../routes/professorRouter.js');
const routerNotification = require('../routes/notificationRouter.js');

app.use(cors());
app.use(express.json()); 
app.use(routerProfessor);
app.use(routerDossie);
app.use(routerClassroom);
app.use(routerNotification);

module.exports = app;