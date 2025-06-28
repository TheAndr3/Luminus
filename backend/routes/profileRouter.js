const express = require('express');
const routerProfile = express.Router();
const profileController = require('../controller/profileController.js');

//Rota para editar o nome ou a senha do usuário
routerProfile.patch('/profile/:id/update', profileController.Update);

//Rota para deletar a conta do usuário
routerProfile.delete('/profile/:id/delete', profileController.Delete);

module.exports = routerProfile