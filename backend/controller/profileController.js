const db = require('../bd.js');
require('dotenv').config();
const {hashPassword, decryptPassword} = require('../utils/passwordManagement.js');

//Deletar
exports.Delete = async(req, res) => {
    const id = req.params.id;

    if (!id){
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }
    
    try {
        await db.pgDelete('CustomUser', { id: id });
        return res.status(200).json({ message: 'Sua conta foi excluída com sucesso.' });
    } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        return res.status(500).json({ err: 'Erro interno do servidor ao tentar excluir a conta.' });
  }
}

//Editar
exports.Update = async(req,res) => {
    const {password, name} = req.body;
    const id = req.params.id;

    if (!id){
        return res.status(401).json({error: 'Usuário não encontrado'});
    }
    try{
        const user = await db.pgSelect('CustomUser', { id: id });
        if (!user || user.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const payload = {};

        if (name){
            payload.name = name;
        }

        if (password){
        //Desencriptar a senha recebida
        const decryptedPassword = await decryptPassword(password);

        //Fazer hash da senha
        const hashedPassword = await hashPassword(decryptedPassword);

        payload.password = hashedPassword;
        }
        
        //Executar a atualização no banco de dados
        await db.pgUpdate('CustomUser', payload, { id: id });

        return res.status(200).json({ message: 'Perfil atualizado com sucesso!' });
    } catch(err) {
        console.error('Erro ao atualizar perfil:', err);
        return res.status(500).json({ error: 'Erro interno do servidor ao tentar atualizar o perfil.' });
    }
}