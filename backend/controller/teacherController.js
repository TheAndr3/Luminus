//Controller do professor
const db = require('../bd.js');
const {hashPassword, decryptPassword} = require('./passwordManagement.js');
require('dotenv').config();

//Chave Publica
const PUBLIC_KEY = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');

//enviar chave publica para criptografia no frontend
exports.GetPublicKey = (req, res) => {
    res.status(200).send(PUBLIC_KEY);
}

exports.Login = (req, res) => {
    res.status(200).send('Login do professor');
}

exports.Create = async (req, res) => {
    const {email, password, name} = req.body;

    //desencriptar senha 
    const decryptedPassword = await decryptPassword(password);

    //fazer hash de senha
    const hashedPassword = await hashPassword(decryptedPassword);

    //cadastrar
    try {
        
        
        if(email)
        await db.pgInsert('Professor', {email, hashedPassword, name});
        console.log(`Cadastro realizado para ${email}`);
        res.status(201).json({message:'Usuário criado com sucesso!'})
    } catch (err) {
        return res.status(400).json({ error: 'Email já cadastrado!' });
        
    }
    
}

exports.GetProfile = (req, res) => {
    const id = req.params.id;
    res.status(200).send(`Perfil do professor ${id}`);
}

exports.Delete = (req, res) => {
    const id = req.params.id;
    res.status(204).send();
}

exports.RecoverPassword = (req, res) => {
    res.status(200).send('Recuperar senha do professor');
}

exports.Home = (req, res) => {
    const id = req.params.id;
    res.status(200).send(`Página inicial do professor ${id}`);
}
