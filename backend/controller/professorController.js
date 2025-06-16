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
    const { email_professor, password } = req.body;

    try {
        // Desencriptar a senha recebida
        const decryptedPassword = await decryptPassword(password);
        // Buscar o professor pelo email usando pgSelect
        const rows = await db.pgSelect('costumUser', { email: email_professor });


        if (rows.length == 0) {
            return res.status(404).json({msg:'Usuário não encontrado'});
        }

        const professor = rows[0];

        if(professor.role == 'unknow') {
            return res.status(403).json({msg:"usuario ainda não confirmou o email, impossivel realizar login"})
        }
        // Comparar a senha desencriptada com o hash salvo
        const passwordMatch = await bcrypt.compare(decryptedPassword, professor.password); //


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
    const { email_professor, password, name } = req.body;
    // Verificar se todos os campos foram preenchidos
    if (!email_professor || !password || !name) {
        return res.status(400).json({ msg: "Os campos precisam estar preenchidos corretamente" });
    }
    try {
        // Desencriptar a senha
        const decryptedPassword = await decryptPassword(password);

        // Fazer hash da senha
        const hashedPassword = await hashPassword(decryptedPassword);

        // Verificar se o email já está cadastrado
        const verification = await db.pgSelect('costumUser', { email: email_professor });

        //Cadastrar professor no banco de dados
        if (verification.length === 0) {
            await db.pgInsert('costumUser', {
                email: email_professor, 
                password: hashedPassword, 
                name: name,
                role:"unknow"
            });
            const professor = await db.pgSelect('costumUser', { email: email_professor });
            const data = new Date();
            var code = genRandomCode(0, 9999);
            const old_code = await db.pgSelect('verifyCode', {costumUser_id:professor[0].id, data_sol:data.toISOString()});

            const used_codes = old_code.map((iten) => {
                iten.code
            })
            
            while (used_codes.includes(code)) {
                code = genRandomCode(0, 9999);
            }

            emailSender.sendEmail(professor[0].email, code);
            const payload = {userId: professor[0].id, email:professor[0].email, code:code, data:data}

            //geracao do token a ser utilizado
            const token = jwt.sign(payload, process.env.TOKEN_KEY, {algorithm:'HS256'});

            try {

                const resp = await db.pgInsert('verifyCode', {code:code, costumUser_id:professor[0].id, data_sol:data.toISOString(), status:0});
                return res.status(200).json({msg:'email enviado', token:token});
            } catch(err) {
                console.log('erro ao inserir no banco de dados: ', err);
                return res.status(400).json({msg:"falha ao enviar codigo"})
            }

        } else {
            console.log('o email é igual')
            return res.status(409).json({ msg: 'Esse e-mail já possui um cadastro' });
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
        const data = await db.pgSelect('costumUser', {id:id})

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
        const data = new Date();
        const professor = await db.pgSelect('costumUser', {email:email});
        const bd_code = await db.pgSelect('verifyCode', {code:code, costumUser_id:professor[0].id, data_sol:data});

        if(bd_code[0].status == 0) {
            bd_code[0].status = 1;

            const payload = {userId: professor[0].id, email:professor[0].email, code:code, data_sol:data}

            //geracao do token a ser utilizado
            const token = jwt.sign(payload, process.env.TOKEN_KEY, {algorithm:'HS256'});
            
            //atualiza que o codigo ja foi utilizado
            await db.pgUpdate('verifyCode', {status:bd_code.status}, {costumUser_id:professor[0].id, code:code, data_sol:data});
            await db.pgInsert('tokencode', {token:token, costumUser_id:professor[0].id});

            return res.status(200).json({msg:'sucesso', pb_k: PUBLIC_KEY, token:token});
        } else {
            return res.status(400).json({msg:'codigo ja utilizado'});
        }
    } catch (err) {
        console.log('erro: ', err);
        return res.status(400).json({msg:'nao foi possivel atender sua solicitacao'});
    }
}

//não tinha nada implementado até a data da refatoração
exports.Home = async (req, res) => {
    const id = req.params.id;
    res.status(200).send(`Página inicial do professor ${id}`);
}

exports.SendEmail = async (req, res) => {

    try {
        const professor = await db.pgSelect('costumUser', {email:req.params.id});
        if(professor) {
            console.log(professor[0])
            const data = new Date();
            var code = genRandomCode(0, 9999);
            const old_code = await db.pgSelect('verifyCode', {costumUser_id:professor[0].id, data_sol:data.toISOString()});

            const used_codes = old_code.map((iten) => {
                iten.code
            })
            
            while (used_codes.includes(code)) {
                code = genRandomCode(0, 9999);
            }

            emailSender.sendEmail(professor[0].email, code);

            try {

                const resp = await db.pgInsert('verifyCode', {code:code, costumUser_id:professor[0].id, data_sol:data.toISOString(), status:0});
                return res.status(200).json({msg:'email enviado'});
            } catch(err) {
                console.log('erro ao inserir no banco de dados: ', err);
                return res.status(400).json({msg:'erro no banco de dados, nao foi possivel atender a sua solicitacao'});
            }
            
        } else {
            return res.status(400).json({msg:'professor nao cadastrado no banco de dados'});
        }
    } catch (err) {
        console.log('erro: ', err);
        return res.status(400).json({msg:'nao foi possivel atender a sua solicitacao'});
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
        const professor = await db.pgSelect('costumUser', {email:email});

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

            const oldTokens = await db.pgSelect('tokencode', {token:token, costumUser_id:professor[0].id});

            //caso o token ja tenha sido utilizado
            if(oldTokens.length > 0) {
                return res.status(403).json({msg:'token invalido'});
            } else {
                //token valido e pertence aquele professor
                if (result.id == professor[0].id && result.email == email) {

                    const dataToDb = {
                        token:token,
                        id:professor[0].id
                    }

                    //insere na tabela o token ja utilizado
                    await db.pgInsert('tokencode', dataToDb);
                    const resp = await db.pgUpdate('costumUser', {password:hashedPassword}, {id:professor[0].id});
                    return res.status(201).json({msg:'password trocado com sucesso', data:resp})
                } else {
                    return res.status(403).json({msg:'token invalido'});
                }
            }

            
        } catch (err) {
            return res.status(403).json({msg:'token invalido'});
        }

    } catch (err) {
        console.log('erro: ', err);
        return res.status(400).json({msg:'nao foi possivel atender a sua solicitacao'});
    }
}

exports.ConfirmEmail = async (req, res) => {
    const {email, code, token} = req.body;
    try {
        const professor = await db.pgSelect('costumUser', {email:email});
        if (professor.length == 0) {
            return res.status(404).json({msg:'email nao encontrado'});
        }

        // Verifica o token primeiro
        try {
            const decoded = jwt.verify(token, process.env.TOKEN_KEY);
            if (decoded.email !== email) {
                return res.status(403).json({msg:'token invalido'});
            }
        } catch (err) {
            console.log('Token verification error:', err);
            return res.status(403).json({msg:'token invalido'});
        }

        // Busca o código de verificação
        const data = new Date();
        const bd_code = await db.pgSelect('verifyCode', {
            code: code, 
            costumUser_id: professor[0].id, 
            data_sol: data.toISOString()
        });

        if (!bd_code || bd_code.length === 0) {
            return res.status(400).json({msg:'codigo invalido'});
        }

        if(bd_code[0].status == 0) {
            // Marca o código como utilizado
            await db.pgUpdate('verifyCode', 
                {status: 1}, 
                {
                    costumUser_id: professor[0].id, 
                    code: code, 
                    data_sol: data.toISOString()
                }
            );

            // Atualiza o role do usuário para professor
            await db.pgUpdate('costumUser', 
                {role: "professor"}, 
                {id: professor[0].id}
            );

            return res.status(200).json({msg:'email confirmado com sucesso'});
        } else {
            return res.status(400).json({msg:'codigo ja utilizado'});
        }
    } catch (err) {
        console.log('erro: ', err);
        return res.status(400).json({msg:'nao foi possivel atender a sua solicitacao'});
    }
}



function genRandomCode(min = 0, max = 9999) {
    const number = Math.floor(Math.random() * (max - min + 1)) + min;
    return number.toString().padStart(4, '0');
}
