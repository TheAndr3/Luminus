//Controller de instituicao
const db = require('../bd.js');
const { decryptPassword, hashPassword } = require("./passwordManagement");

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
        instution_email: email,
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

exports.Login = (req, res) => {
  res.status(200).send('Rota para instituicao fazer login');
}

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
