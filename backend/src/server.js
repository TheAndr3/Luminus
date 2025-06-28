require('dotenv').config();
const app = require('./app.js');
const bd = require('../bd.js');

const API = process.env.API_IP;

app.listen(API, ()=>{
    console.log(`Server running on API ${API}`);
})