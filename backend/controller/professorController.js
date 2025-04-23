//Controller do professor
const db = require('../bd.js')
const express = require('express')


exports.login = (req, res) => {
    res.status(200).send('Login do professor');
};

exports.cadastrar = async (req, res) => {
    const {email, login, password, name} = req.body;

    try{
        const verification = await db.query('SELECT * FROM Professor where (login = $1, email_professor = $2)', [login, email]);

        if(verification.rows.lenght === 0){
            const result = await db.query('INSERT INTO Professor(nome, login, senha, email_professor) VALUES($1, $2, $3, $4) RETURNING *', [name, login, password, email]);

            res.status(201).json(result.rows[0]);

        }else{
            res.status(401).send('Usuário já existente');
        
        }

    }catch(err){
        console.error(err);
        res.status(500).send('Erro ao cadastrar usuário');
    }
};

exports.verPerfil = (req, res) => {
    const id = req.params.id;
    res.status(200).send(`Perfil do professor ${id}`);
};

exports.deletar = (req, res) => {
    const id = req.params.id;
    res.status(204).send();
};

exports.recuperarSenha = (req, res) => {
    res.status(200).send('Recuperar senha do professor');
};

exports.home = (req, res) => {
    const id = req.params.id;
    res.status(200).send(`Página inicial do professor ${id}`);
};
