const express = require('express');
const routerTurmas = express.Router();

routerTurmas.get('/turmas', (req, res)=>{
    res.status(200).send("Rota de turmas funcionando!");
})

module.exports = routerTurmas;