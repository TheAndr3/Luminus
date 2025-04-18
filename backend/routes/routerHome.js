const express = require('express');
const routerHome = express.Router();

routerHome.get('/home', (req, res)=>{
    res.status(200).send("Rota de Tela inicial funcionando!");
})

module.exports = routerHome;