//Controller do professor
const db = require('../bd.js');
const {hashPassword, decryptPassword} = require('./passwordManagement.js');
require('dotenv').config();
const bcrypt = require('bcrypt');
const emailSender = require('../utils/mailSender');

//Chave Publica
const PUBLIC_KEY = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');

//enviar chave publica para criptografia no frontend
exports.GetPublicKey = async (req, res) => {
    res.status(200).send('Solicitar chave pública');
}

exports.SendPublicKey = async (req, res) => {
    res.status(201).send(PUBLIC_KEY);
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
    const {email, password, name} = req.body;

    //desencriptar senha 
    const decryptedPassword = await decryptPassword(password);

    //fazer hash de senha
    const hashedPassword = await hashPassword(decryptedPassword);

    //cadastrar
    try {
        const verification = await db.pgSelect('Professor', {professor_email:email});

        if (verification.length === 0){
            await db.pgInsert('Professor', {
                professor_email: email, 
                password: hashedPassword, 
                name: name
            });
            res.status(201).json({message:'Usuário criado com sucesso!'});
        }else{
            res.status(409).json({message:'Esse e-mail já possui um cadastro'});
        }
    } catch (err) {
        return res.status(400).json({ error: err.message});
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
    const {code, email} = req.body;

    try{
        const data = new Date();
        const professor = await db.pgSelect('professor', {professor_email:email});
        const bd_code = await db.pgSelect('verifyCode', {code:code, professor_id:professor[0].id, data_sol:data.toISOString()});

        if(bd_code[0].status == 0) {
            bd_code[0].status = 1;
            
            const resp = await db.pgUpdate('verifyCode', {status:bd_code.status}, {professor_id:professor[0].id, code:code, data_sol:data.toISOString()});
            res.status(200).json({msg:'sucesso', pb_k: PUBLIC_KEY});
        } else {
            res.status(400).json({msg:'codigo ja utilizado'});
        }
    } catch (err) {
        console.log('erro: ', err);
        res.status(400).json({msg:'nao foi possivel atender sua solicitadao: ', err});
    }
}

exports.Home = async (req, res) => {
    const id = req.params.id;
    res.status(200).send(`Página inicial do professor ${id}`);
}

exports.SendEmail = async (req, res) => {
    
    try {
        const professor = db.pgSelect('professor', {professor_email:req.params.id});
        if(professor) {
            const data = new Date();
            var code = genRandomCode(0, 9999);
            const old_code = await db.pgSelect('verifyCode', {professor_id:professor[0].id, data_sol:data.toISOString()});

            const used_codes = old_code.map((iten) => {
                iten.code
            })
            
            while (used_codes.includes(code)) {
                code = genRandomCode(0, 9999);
            }

            emailSender.sendEmail(professor[0].professor_email, code);

            try {
                const resp = await db.pgInsert('verifyCode', {code:code, professor_id:professor[0].id, data_sol:data.toISOString, status:0});
                res.status(200).json({msg:'email enviado'});
            } catch(err) {
                console.log('erro ao inserir no banco de dados: ', err);
                res.status(400).json({msg:'erro no banco de dados, nao foi possivel atender a sua solicitacao'});
            }
            
        } else {
            res.status(400).json({msg:'professor nao cadastrado no banco de dados'});
        }
    } catch (err) {
        console.log('erro: ', err);
        res.status(400).json({msg:'nao foi possivel atender a sua solicitacao'});
    }
}

exports.NewPassword = async (req, res) => {
    const {newPass, email} = req.body;

    try {
         //desencriptar senha 
        const decryptedPassword = await decryptPassword(newPass);
        //fazer hash de senha
        const hashedPassword = await hashPassword(decryptedPassword);
        const professor = await db.pgSelect('professor', {professor_email:email});
        const resp = await db.pgUpdate('professor', {password:hashedPassword}, {id:professor[0].id});

        res.status(201).json({msg:'password trocado com sucesso'})

    } catch (err) {
        console.log('erro: ', err);
        res.status(400).json({msg:'nao foi possivel atender a sua solicitacao'});
    }
}


function genRandomCode(max, min) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;

}