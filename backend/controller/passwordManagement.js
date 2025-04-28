const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

//Chave Privada
const PRIVATE_KEY = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');

async function hashPassword(password) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        return hashedPassword;
    } catch (err) {
        console.error('Erro ao criar hash');
    }
<<<<<<< HEAD
<<<<<<< HEAD
=======
    
>>>>>>> 0d8bfd4 (Modificações de ptbr para ingles, desencriptacao e hash feitos)
=======
>>>>>>> 8b17507 (ajustes)
}

async function decryptPassword(password) {
    try {
        const decryptedPassword = crypto.privateDecrypt({
            key: PRIVATE_KEY,
            padding: crypto.constants.RSA_PKCS1_PADDING
        },
        Buffer.from(password, 'base64')
        ).toString('utf-8');

        return decryptedPassword;
    } catch (err) {
        console.error('Erro ao criar hash');
    }
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> 0d8bfd4 (Modificações de ptbr para ingles, desencriptacao e hash feitos)
=======
>>>>>>> 8b17507 (ajustes)
}

module.exports = {
    hashPassword,
    decryptPassword
}