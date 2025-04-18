const express = require('express');
const routerLogin = express.Router();

routerLogin.get('/login', (req, res)=>{
    res.status(200).send('Rota de login funcionando!');
})

module.exports = routerLogin;