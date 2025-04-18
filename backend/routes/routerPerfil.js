const express = require('express');
const routerPerfil = express.Router();

routerPerfil.get('/perfil', (req, res)=>{
    res.status(200).send("Rota de perfil funcionando!");
})


module.exports = routerPerfil;

