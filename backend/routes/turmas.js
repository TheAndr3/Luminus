const express = require('express');
const routerTurmas = express.Router();

//ver turmas
routerTurmas.get('/turmas', (req, res)=>{
    res.status(200).send("Rota de visualizar turmas");
})

//ver turma específica
routerTurmas.get('/turmas:id', (req, res)=>{
    res.status(200).send("Rota de visualizar turma específica");
})

//criar turmas
routerTurmas.post('/turmas/:id', (req, res)=>{
    res.status(200).send("Rota de criar turma");
})

//editar turma
routerTurmas.put('/turmas/:id', (req, res)=>{
    res.status(200).send("Rota de turmas funcionando!");
})

//deletar turma
routerTurmas.delete('/turmas/:id', (req, res)=>{
    res.status(200).send("Rota de turmas funcionando!");
})


module.exports = routerTurmas;