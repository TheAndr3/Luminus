//Controller do professor
const db = require('../bd.js');
const {hashPassword, decryptPassword} = require('../utils/passwordManagement.js');
require('dotenv').config();
const bcrypt = require('bcrypt');
const emailSender = require('../utils/mailSender');
const jwt = require('jsonwebtoken');

//Chave Publica
const PUBLIC_KEY = process.env.PUBLIC_KEY;

//Enviar chave pública
exports.GetPublicKey = async (req, res) => {
  
   return res.status(200).json({ publicKey: PUBLIC_KEY });

}

exports.Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Desencriptar a senha recebida
        const decryptedPassword = await decryptPassword(password);

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
       return res.status(500).send('Erro ao realizar login:', err);

    }
};

exports.Create = async (req, res) => {
    const { email_professor, password, name } = req.body;


    if (!email_professor || !password || !name) {
        return res.status(400).json({message: "Os campos precisam estar preenchidos corretamente"});
    }

    //desencriptar senha 
    const decryptedPassword = await decryptPassword(password);


    // Verificar se todos os campos foram preenchidos
    if (!email_professor || !password || !name) {
        return res.status(400).json({ message: "Os campos precisam estar preenchidos corretamente" });
    }

    try {
        // Desencriptar a senha
        const decryptedPassword = await decryptPassword(password);

        // Fazer hash da senha
        const hashedPassword = await hashPassword(decryptedPassword);

        // Verificar se o email já está cadastrado
        const verification = await db.pgSelect('Professor', { email_professor: email_professor });

        if (verification.length === 0) {
            // Cadastrar o professor no Banco de dados
            await db.pgInsert('Professor', {
                email_professor: email_professor,
                password: hashedPassword,
                name: name
            });
            return res.status(201).json({ message: 'Usuário criado com sucesso!' });
        } else {
            return res.status(409).json({ message: 'Esse e-mail já possui um cadastro' });
        }
    } catch (err) {
        console.error('Erro ao cadastrar professor:', err);
        return res.status(500).json({ message: 'Erro ao cadastrar usuário', error: err });
    }
};

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

            const payload = {userId: professor[0].id, email:professor[0].email, code:code, data:data}

            //geracao do token a ser utilizado
            const token = jwt.sign(payload, process.env.TOKEN_KEY, {algorithm:'HS256'});
            
            //atualiza que o codigo ja foi utilizado
            await db.pgUpdate('verifyCode', {status:bd_code.status}, {professor_id:professor[0].id, code:code, data_sol:data.toISOString()});

            res.status(200).json({msg:'sucesso', pb_k: PUBLIC_KEY, token:token});
        } else {
            res.status(400).json({msg:'codigo ja utilizado'});
        }
    } catch (err) {
        console.log('erro: ', err);
        res.status(400).json({msg:'nao foi possivel atender sua solicitacao: ', err});
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
    const token = req.params.token;

    try {
        
         //desencriptar senha 
        const decryptedPassword = await decryptPassword(newPass);
        //fazer hash de senha
        const hashedPassword = await hashPassword(decryptedPassword);
        const professor = await db.pgSelect('professor', {professor_email:email});

        //verifica se o token passado eh valido
        try{
            const result = jwt.verify(token, process.env.TOKEN_KEY, (err, decode) => {
                if(err) {
                    
                    console.log('deu ruim: ', err);
                    throw err;
                } else {
                    console.log(decode);
                    return decode;
                }
            })
            const data = new Date();

            const oldTokens = await db.pgSelect('tokencode', {token:token, professor_id:professor[0].id});

            //caso o token ja tenha sido utilizado
            if(Object.values(oldTokens).length > 0) {
                res.status(403).json({msg:'token invalido'});
            } else {
                //token valido e pertence aquele professor
                if (result.professor_id == professor[0].id && result.email == email) {

                    const dataToDb = {
                        token:token,
                        professor_id:professor[0].id
                    }

                    //insere na tabela o token ja utilizado
                    await db.pgInsert('tokencode', dataToDb);
                    const resp = await db.pgUpdate('professor', {password:hashedPassword}, {id:professor[0].id});
                    res.status(201).json({msg:'password trocado com sucesso'})
                } else {
                    res.status(403).json({msg:'token invalido'});
                }
            }

            
        } catch (err) {
            res.status(403).json({msg:'token invalido'});
        }

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