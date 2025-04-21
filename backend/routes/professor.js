const express = require('express');
const routerProfessor = express.Router();

//fazer login
routerProfessor.post('/professor/login', (req, res)=>{
    res.status(200).send('Rota para fazer login')
})

//cadastrar professor 
routerProfessor.post('/professor/cadastrar', (req, res)=>{
    res.status(200).send("Rota para cadastrar professor!");
})

//ver perfil
routerProfessor.get('/professor/:id/perfil', (req, res)=>{
    res.status(200).send('Rota para ver perfil do professor');
})

//deletar professor
routerProfessor.get('/professor/:id/delete', (req, res) => {
    res.status(200).send('Rota para exlcuir professor');
})

//recuperar senha 
routerProfessor.post('/professor/recuperar-senha', (req, res) =>{
    res.status(200).send('rota de recuperar senha')
})

//home professor
routerProfessor.get('/professor/:id/home', (req, res) => {
    res.status(200).send('Rota para a pagina inicial');
})


module.exports = routerProfessor;