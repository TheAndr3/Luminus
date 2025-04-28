//Controller do professor
const db = require('../bd.js');
const {hashPassword, decryptPassword} = require('./passwordManagement.js');
require('dotenv').config();

//Chave Publica
const PUBLIC_KEY = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');

//enviar chave publica para criptografia no frontend
exports.GetPublicKey = (req, res) => {
    res.status(200).send('Solicitar chave pública');
}

exports.SendPublicKey = async (req, res) => {
    res.status(201).send(PUBLIC_KEY);
}

exports.Login = async (req, res) => {
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
        const verification = await db.pgSelect('Professor', {professor_email:email});

        if (verification.lenght === 0){
            await db.pgInsert('Professor', {
                email, 
                hashedPassword, 
                name
            });

            res.status(201).json({message:'Usuário criado com sucesso!'});
        }else{
            res.status(409).json({message:'Esse e-mail já possui um cadastro'});
        }
        
    } catch (err) {
        return res.status(400).json({ error: `${err}`});
    }
}

exports.GetProfile = async (req, res) => {
    const id = req.params.id;
    res.status(200).send(`Perfil do professor ${id}`);
}

exports.Delete = async (req, res) => {
    const id = req.params.id;
    res.status(204).send();
}

exports.RecoverPassword = async (req, res) => {
    res.status(200).send('Recuperar senha do professor');
}

exports.Home = async (req, res) => {
    const id = req.params.id;
    res.status(200).send(`Página inicial do professor ${id}`);
}

exports.SendEmail = async (req, res) => {
    res.status(200).send(`Rota para enviar e-mail`);
}

exports.NewPassword = async (req, res) => {
    res.status(201).send(`Enviar nova senha`);
}
