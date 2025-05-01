const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

//Chave Privada
const PRIVATE_KEY = process.env.PRIVATE_KEY

async function hashPassword(password) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        return hashedPassword;
    } catch (err) {
        console.error('Erro ao criar hash:', err);
    }
}

async function decryptPassword(password) {  
    try {
        const decryptedPassword = crypto.privateDecrypt({
            key: PRIVATE_KEY,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
        },
        Buffer.from(password, 'base64')
        ).toString('utf-8');
        return decryptedPassword;
    } catch (err) {
        console.error('Erro ao criar desencriptar:', err);
    }
}

module.exports = {
    hashPassword,
    decryptPassword
}   