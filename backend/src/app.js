const express = require('express');
const cors = require('cors');
const app = express();

//Rotas 
<<<<<<< HEAD
const routerDossie = require('../routes/dossierRouter.js');
const routerClassroom = require('../routes/classroomRouter.js');
const routerProfessor = require('../routes/professorRouter.js');
const routerNotification = require('../routes/notificationRouter.js');

app.use(cors());
app.use(express.json()); 
app.use(routerProfessor);
app.use(routerDossie);
app.use(routerClassroom);
=======
const routerDossie = require('../routes/dossier.js');
const routerTurmas = require('../routes/class.js');
const routerTeacher = require('../routes/teacher.js');
const routerNotification = require('../routes/notification.js');

app.use(cors());
app.use(routerTeacher);
app.use(routerDossie);
app.use(routerTurmas);
>>>>>>> 0d8bfd4 (Modificações de ptbr para ingles, desencriptacao e hash feitos)
app.use(routerNotification);

module.exports = app;