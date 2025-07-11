const express = require('express');
const cors = require('cors');
const app = express();

//Rotas 
const routerDossie = require('../routes/dossierRouter.js');
const routerClassroom = require('../routes/classroomRouter.js');
const routerProfessor = require('../routes/professorRouter.js');
const routerStudent = require('../routes/studentsRouter.js');
const routerAppraisal = require('../routes/appraisalRouter.js');
const routerProfile = require('../routes/profileRouter.js')

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
	return res.status(200).json({msg: 'a api esta no ar'});
}) 
app.use(routerProfessor);
app.use(routerDossie);
app.use(routerClassroom);
app.use(routerStudent);
app.use(routerAppraisal);
app.use(routerProfile);

module.exports = app;
