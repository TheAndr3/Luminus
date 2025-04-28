//Controller do professor
const db = require('../bd.js');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const {hashPassword, decryptPassword} = require('./passwordManagement.js');
const { decrypt } = require('dotenv');

//Chave Publica
const PUBLIC_KEY = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');

//enviar chave publica para criptografia no frontend
exports.GetPublicKey = (req, res) => {
    res.status(200).send(PUBLIC_KEY);
}


exports.Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Desencriptar a senha recebida
        const decryptedPassword = await decryptPassword(password);

        if (!decryptedPassword) {
            return res.status(400).send('Erro ao desencriptar a senha');
        }

        // Buscar o professor pelo email usando pgSelect
        const rows = await db.pgSelect('Professor', { email_professor: email });

        if (rows.length === 0) {
            return res.status(404).send('Usuário não encontrado');
        }

        const professor = rows[0];

        // Comparar a senha desencriptada com o hash salvo
        const passwordMatch = await bcrypt.compare(decryptedPassword, professor.password);

        if (!passwordMatch) {
            return res.status(401).send('Senha incorreta');
        }
        
        // Retornar o status 200 e o professor logado
        res.status(200).json({
            message: 'Login realizado com sucesso',
            professor: {
                id: professor.id,
                nome: professor.nome,
                email: professor.email_professor
            }
        });

        //Caso dê erro, retornar o status 500 e a mensagem de erro
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao realizar login');
    }
};


exports.Create = async (req, res) => {
    const {email, login, password, name} = req.body;
    //desencriptar senha 
    const decryptedPassword = await decryptPassword(password);

    //fazer hash de senha
    const hashedPassword = await hashPassword(decryptedPassword);
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
