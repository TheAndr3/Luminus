//Controller de instituicao
const db = require('../bd.js');
const { decryptPassword, hashPassword } = require("./passwordManagement");
const bcrypt = require('bcrypt');

exports.Create = async (req, res) =>{
  const {email, password, name} = req.body;
  try {
    //desencriptar senha
    const decryptedPassword = await decryptPassword(password);

    //hash de senha
    const hashedPassword = await hashPassword(decryptedPassword);

    //verifica se há email existente cadastrado
    const verification = await db.pgSelect('Institution', {instution_email: email});

    if (verification.lenght === 0) {
      await db.pgInsert('Institution', {
        name: name,
        institution_email: email,
        password: hashedPassword
      });

      res.status(201).json({message:'Instituição cadastrada com sucesso!'});

    } else {
      res.status(409).json({message:'Esse e-mail já possui um cadastro'});
    }
  } catch (err) {
    res.status(409).json({message:'Esse e-mail já possui um cadastro'});
  }
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
      const rows = await db.pgSelect('Institution', { email_institution: email });

      if (rows.length === 0) {
          return res.status(404).send('Usuário não encontrado');
      }

      const institution = rows[0];

      // Comparar a senha desencriptada com o hash salvo
      const passwordMatch = await bcrypt.compare(decryptedPassword, institution.password);

      if (!passwordMatch) {
          return res.status(401).send('Senha incorreta');
      }

      // Retornar o status 200 e o professor logado
      res.status(200).json({
          message: 'Login realizado com sucesso',
          instituicao: {
              id: institution.id,
              nome: institution.nome,
              email: institution.email_institution
          }
      });

      // Caso dê erro, retornar o status 500 e a mensagem de erro
  } catch (err) {
      console.error(err);
      res.status(500).send('Erro ao realizar login');
  }
};

exports.Delete = async (req, res) => {
  const id = req.params.id;
  res.status(204).send();
}

exports.addTeacher = async (req, res) => {
  res.status(201).send('Rota para adicionar professor');
}

exports.ReadDossier = async (req, res) => {
  res.status(200).send('Rota para ver dossies da instituicao');
}

exports.Profile = async (req, res) => {
  const id = req.params.id;
  res.status(200).send(`Perfil da instituição ${id}`);
}
