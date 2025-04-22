const express = require('express');
const routerInstituicao = express.Router();

//fazer login
routerInstituicao.post('/instituicao/login', (req, res)=>{
    res.status(200).send('Rota para instituicao fazer login');
})

//deletar instituicao
routerInstituicao.post('/instituicao/:id/delete', (req, res)=>{
    res.status(200).send('Rota para fazer login');
})

//adicionar professor
routerInstituicao.post('/instituicao/adicionar-professor', (req, res)=>{
    res.status(200).send('Rota para adicionar professor');
})

//ver dossiês
routerInstituicao.get('/instituicao/dossies', (req, res)=>{
    res.status(200).send('Rota para ver dossies da instituicao');
})

//ver perfil
routerInstituicao.get('/instituicao/:id/perfil', (req, res)=>{
    res.status(200).send('Rota para ver perfil do professor');
})

module.exports = routerInstituicao;



