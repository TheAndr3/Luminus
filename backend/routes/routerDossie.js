const express = require('express');
const routerDossie = express.Router();

routerDossie.get('/dossies', (req, res)=>{
    res.status(200).send("Rota de dossiês funcionando!");
})

module.exports = routerDossie;