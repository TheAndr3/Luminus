//Controller de instituicao
const db = require('../bd.js');
const { decryptPassword, hashPassword } = require("./passwordManagement");
const bcrypt = require('bcrypt');

exports.Create = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const decryptedPassword = await decryptPassword(password);
    const hashedPassword = await hashPassword(decryptedPassword);

    const verification = await db.pgSelect('Institution', { institution_email: email });

    if (verification.length === 0) {
      const resp = await db.pgInsert('Institution', {
        name: name,
        institution_email: email,
        password: hashedPassword
      });


      return res.status(201).json({ msg: 'Instituição cadastrada com sucesso!', data:resp});
    } else {
      return res.status(400).json({ msg: 'Esse e-mail já possui um cadastro' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Erro ao cadastrar instituição' });

  }
}

exports.Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const decryptedPassword = await decryptPassword(password);
    if (!decryptedPassword) return res.status(400).json({msg:'falha ao desencripitar password'});

    const rows = await db.pgSelect('Institution', { institution_email: email });

    if (rows.length === 0) {
      return res.status(404).json({msg:'usuario não encontrado'});
    }

    const institution = rows[0];
    const passwordMatch = await bcrypt.compare(decryptedPassword, institution.password);

    if (!passwordMatch) {
      return res.status(401).json({msg:"senha incorreta"});
    }

    return res.status(200).json({
      msg: 'Login realizado com sucesso',
      data: {
        id: institution.id,
        nome: institution.name,
        email: institution.institution_email
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).send('Erro ao realizar login');
  }
};

//daqui para baixo não foi feito até o dia da refatoração

exports.Delete = async (req, res) => {
  const id = req.params.id;
  res.status(204).send();
}

exports.AddProfessor = async (req, res) => {
  res.status(201).send('Rota para adicionar professor');
}

exports.GetDossier = async (req, res) => {
  res.status(200).send('Rota para ver dossies da instituicao');
}

exports.Profile = async (req, res) => {
  const id = req.params.id;
  res.status(200).send(`Perfil da instituição ${id}`);
}