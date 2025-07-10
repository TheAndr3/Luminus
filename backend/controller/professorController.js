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
    res.header('Access-Control-Allow-Origin', '*'); // Permite todos os domínios (para desenvolvimento)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
   return res.status(200).json({ publicKey: PUBLIC_KEY });

}

exports.Login = async (req, res) => {
    const { customUserEmail, password } = req.body;

    try {
        // Desencriptar a senha recebida
        const decryptedPassword = await decryptPassword(password);
        // Buscar o professor pelo email usando pgSelect
        const rows = await db.pgSelect('CustomUser', { email: customUserEmail });


        if (rows.length == 0) {
            return res.status(404).json({msg:'Usuário não encontrado'});
        }

        const professor = rows[0];

        if(professor.role == 'unknow') {
            return res.status(403).json({msg:"usuario ainda não confirmou o email, impossivel realizar login"})
        }
        // Comparar a senha desencriptada com o hash salvo
        const passwordMatch = await bcrypt.compare(decryptedPassword, professor.password); 


        if (!passwordMatch) {
            return res.status(401).json({msg:'Senha incorreta'});
        }

        // Retornar o status 200 e o professor logado
        return res.status(200).json({
            msg: 'Login realizado com sucesso',
            data: {
                id: professor.id,
                nome: professor.nome,
                email: professor.email
            }
        });
        //Caso dê erro, retornar o status 500 e a mensagem de erro
    } catch (err) {
        console.error(err);
       return res.status(500).json({msg: 'Erro ao realizar login'});

    }
};

exports.Create = async (req, res) => {
    const { customUserEmail, password, name } = req.body;
    // Verificar se todos os campos foram preenchidos
    if (!customUserEmail || !password || !name) {
        return res.status(403).json({ msg: "Os campos precisam estar preenchidos corretamente" });
    }
    try {
        // Desencriptar a senha
        const decryptedPassword = await decryptPassword(password);

        // Fazer hash da senha
        const hashedPassword = await hashPassword(decryptedPassword);

        // Verificar se o email já está cadastrado
        const verification = await db.pgSelect('CustomUser', { email: customUserEmail });

        // Se o usuário não existe, criar novo cadastro
        if (verification.length === 0 || !verification[0]) {
            const customUserResult = await db.pgInsert('CustomUser', {
                email: customUserEmail, 
                password: hashedPassword, 
                name: name,
                role:"unknow"
            });
            const customUserId = customUserResult.rows[0].id;
            const data = new Date();
            var code = genRandomCode(0, 9999);
            const old_code = await db.pgSelect('verifyCode', {customUserId:customUserId, requestDate:data.toISOString()});

            const used_codes = old_code.map((iten) => {
                return iten.code;
            })
            
            while (used_codes.includes(code)) {
                code = genRandomCode(0, 9999);
            }

            emailSender.sendEmail(customUserEmail, code);
            const payload = {userId: customUserId, email:customUserEmail, code:code, data:data.toISOString()}

            //geracao do token a ser utilizado
            const token = jwt.sign(payload, process.env.TOKEN_KEY, {algorithm:'HS256'});

            try {

                const resp = await db.pgInsert('verifyCode', {code:code, customUserId:customUserId, requestDate:data.toISOString(), status:0});
                return res.status(200).json({msg:'email enviado', token:token});
            } catch(err) {
                console.log('erro ao inserir no banco de dados: ', err);
                return res.status(500).json({msg:"falha ao enviar codigo"})
            }

        } else {
            // Usuário já existe, verificar se tem role "unknown" (não confirmou email)
            const existingUser = verification[0];
            
            if (existingUser.role === 'unknow') {
                // Usuário existe mas não confirmou email, permitir reenvio do código
                const customUserId = existingUser.id;
                const data = new Date();
                var code = genRandomCode(0, 9999);
                
                const old_code = await db.pgSelect('verifyCode', {customUserId:customUserId, requestDate:data.toISOString()});

                const used_codes = old_code.map((iten) => {
                    return iten.code;
                })
                
                while (used_codes.includes(code)) {
                    code = genRandomCode(0, 9999);
                }

                emailSender.sendEmail(customUserEmail, code);
                const payload = {userId: customUserId, email:customUserEmail, code:code, data:data.toISOString()}

                //geracao do token a ser utilizado
                const token = jwt.sign(payload, process.env.TOKEN_KEY, {algorithm:'HS256'});

                try {
                    const resp = await db.pgInsert('verifyCode', {code:code, customUserId:customUserId, requestDate:data.toISOString(), status:0});
                    return res.status(200).json({msg:'email enviado', token:token});
                } catch(err) {
                    console.log('erro ao inserir no banco de dados: ', err);
                    return res.status(500).json({msg:"falha ao enviar codigo"})
                }
            } else {
                // Usuário já existe e já confirmou email (tem role diferente de "unknown")
                console.log('o email é igual e já confirmado')
                return res.status(409).json({ msg: 'Esse e-mail já possui um cadastro confirmado' });
            }
        }
    } catch (err) {
        console.error('Erro ao cadastrar professor:', err);
        return res.status(500).json({ msg: 'Erro ao cadastrar usuário', error: err });
    }
};


//não tinha nada implementado até a data da refatoração
exports.GetProfile = async (req, res) => {
    const id = req.params.id;
    try{
        const data = await db.pgSelect('CustomUser', {id:id})

    res.status(200).json({msg:'sucesso', data:data});
    } catch (err) {
        console.log('erro: ', err);
        return res.status(400).json({msg:'erro ao buscar perfil'})
    }
    
}

//não tinha nada implementado até a data da refatoração
exports.Delete = async (req, res) => {
    const id = req.params.id;
    res.status(204).send();
}

exports.RecoverPassword = async (req, res) => {
    const {code, email} = req.body;

    try{
        const data = new Date().toISOString();
        const professor = await db.pgSelect('CustomUser', {email:email});
        const bd_code = await db.pgSelect('VerifyCode', {code:code, customUserId:professor[0].id, requestDate:data});

        if(bd_code[0].status == 0) {
            bd_code[0].status = 1;

            const payload = {userId: professor[0].id, email:professor[0].email, code:code, requestDate:data}

            //geracao do token a ser utilizado
            const token = jwt.sign(payload, process.env.TOKEN_KEY, {algorithm:'HS256'});
            
            //atualiza que o codigo ja foi utilizado
            await db.pgUpdate('VerifyCode', {status:bd_code.status}, {customUserId:professor[0].id, code:code, requestDate:data});
            await db.pgInsert('TokenCode', {token:token, customUserId:professor[0].id, verifyStatus:0});

            return res.status(200).json({msg:'sucesso', pb_k: PUBLIC_KEY, token:token});
        } else {
            return res.status(403).json({msg:'codigo ja utilizado'});
        }
    } catch (err) {
        console.log('erro: ', err);
        return res.status(500).json({msg:'nao foi possivel atender sua solicitacao'});
    }
}

//não tinha nada implementado até a data da refatoração
exports.Home = async (req, res) => {
    const id = req.params.id;
    res.status(200).send(`Página inicial do professor ${id}`);
}

exports.SendEmail = async (req, res) => {
    
    try {
        // CORREÇÃO: Adicionado 'await' e corrigido o parâmetro do email
        const professor = await db.pgSelect('CustomUser', {email: req.params.id});
        
        if(professor && professor.length > 0) { // Adicionada verificação se o professor foi encontrado
            const data = new Date();
            var code = genRandomCode(0, 9999);
            
            // CORREÇÃO: Usando 'costumUser_id' como no restante do código
            const old_code = await db.pgSelect('verifyCode', {customUserId: professor[0].id, requestDate: data.toISOString()});

            const used_codes = old_code.map((item) => {
                return item.code;
            });
            
            while (used_codes.includes(code)) {
                code = genRandomCode(0, 9999);
            }

            emailSender.sendEmail(professor[0].email, code);

            try {
                const resp = await db.pgInsert('VerifyCode', {code: code, customUserId: professor[0].id, requestDate: data.toISOString(), status: 0});
                return res.status(200).json({msg:'email enviado'});

            } catch(err) {
                console.log('erro ao inserir no banco de dados: ', err);
                return res.status(500).json({msg:'erro no banco de dados, nao foi possivel atender a sua solicitacao'});
            }
            
        } else {
            return res.status(404).json({msg:'professor nao cadastrado no banco de dados'});
        }
    } catch (err) {
        console.log('erro: ', err);
        return res.status(500).json({msg:'nao foi possivel atender a sua solicitacao'}); // Status 500 para erro interno
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
        const professor = await db.pgSelect('CustomUser', {email:email});

        //verifica se o token passado eh valido
        try{
            const result = jwt.verify(token, process.env.TOKEN_KEY, (err, decode) => {
                if(err) {
                    console.log('falha ao decodificar token: ', err);
                    throw err;
                } else {
                    console.log(decode);
                    return decode;
                }
            });

            const oldTokens = await db.pgSelect('TokenCode', {token:token, customUserId:professor[0].id});

            //caso o token ja tenha sido utilizado
            if(oldTokens[0].verifyStatus == 1) {
                return res.status(403).json({msg:'token ja utilizado'});
            } else {
                //token valido e pertence aquele professor
                if (result.userId == professor[0].id && result.email == email) {
                    const dataToDb = {
                        verifyStatus:1
                    }

                    //insere na tabela o token ja utilizado
                    await db.pgUpdate('TokenCode', dataToDb, {token:token});
                    const resp = await db.pgUpdate('CustomUser', {password:hashedPassword}, {id:professor[0].id});
                    return res.status(201).json({msg:'password trocado com sucesso', data:resp})
                } else {
                    return res.status(403).json({msg:'token não pertence a este usuario'});
                }
            }
            
        } catch (err) {
            return res.status(403).json({msg:'token invalido, falha ao decodificar'});
        }

    } catch (err) {
        console.log('erro: ', err);
        return res.status(500).json({msg:'não foi possivel atender a sua solicitacao'});
    }
}

exports.ConfirmEmail = async (req, res) => {
    const {email, code, token} = req.body;
    console.log(email)
    console.log(code)
    try {
        const professor = await db.pgSelect('CustomUser', {email:email});
        if (professor.length == 0 || !professor[0]) {
            return res.status(404).json({msg:'conta não encontrada'});
        }

        // Verifica o token primeiro
        try {
            const decoded = jwt.verify(token, process.env.TOKEN_KEY);
            if (decoded.email !== email) {
                return res.status(403).json({msg:'token invalido, token não pertence a este usuario'});
            }
        } catch (err) {
            console.log('Token verification error:', err);
            return res.status(403).json({msg:'token invalido, falha ao decodificar token'});
        }

        // Busca o código de verificação
        const data = new Date();
        const bd_code = await db.pgSelect('VerifyCode', {
            code: code, 
            customUserId: professor[0].id, 
            requestDate: data.toISOString()
        });

        if (!bd_code || bd_code.length === 0) {
            return res.status(400).json({msg:'codigo invalido'});
        }

        if(bd_code[0].status == 0) {
            // Marca o código como utilizado
            await db.pgUpdate('VerifyCode', 
                {status: 1}, 
                {
                    customUserId: professor[0].id, 
                    code: code, 
                    requestDate: data.toISOString()
                }
            );

            // Atualiza o role do usuário para professor
            await db.pgUpdate('CustomUser', 
                {role: "professor"}, 
                {id: professor[0].id}
            );

            return res.status(200).json({msg:'email confirmado com sucesso'});
        } else {
            return res.status(400).json({msg:'codigo ja utilizado'});
        }
    } catch (err) {
        console.log('erro: ', err);
        return res.status(500).json({msg:'nao foi possivel atender a sua solicitacao'});
    }
}

function genRandomCode(min = 0, max = 9999) {
    const number = Math.floor(Math.random() * (max - min + 1)) + min;
    return number.toString().padStart(4, '0');
}
