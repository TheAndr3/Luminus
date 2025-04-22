const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());



// Conexão com PostgreSQL usando variáveis do .env
const sequelize = new Sequelize(
    test_db.env.DB_NAME,
    test_db.env.DB_USER,
    test_db.env.DB_PASS, {
        host: test_db.env.DB_HOST,
        dialect: 'postgres',
    }
);

// Testar conexão
sequelize.authenticate()
    .then(() => console.log('Conectado ao PostgreSQL!'))
    .catch(err => console.error('Erro de conexão:', err));


// Modelo User
const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false }
});

// Sincronizar com o banco
sequelize.sync();

// Rotas CRUD
app.get('/users', async(req, res) => {
    const users = await User.findAll();
    res.json(users);
});

app.post('/users', async(req, res) => {
    const { name, email } = req.body;
    const newUser = await User.create({ name, email });
    res.json(newUser);
});

app.put('/users/:id', async(req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    const { name, email } = req.body;
    user.name = name;
    user.email = email;
    await user.save();
    res.json(user);
});

app.delete('/users/:id', async(req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    await user.destroy();
    res.json({ message: 'Usuário removido com sucesso' });
});

// Start server
app.listen(port, () => {
    console.log(`Servidor está em http://localhost:${port}`);
});