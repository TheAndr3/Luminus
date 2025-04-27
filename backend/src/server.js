const app = require('./app.js');
require('dotenv').config();
const bd = require('../bd.js')

const PORT = process.env.PORT;

app.listen(PORT, ()=>{
    console.log('Server running on port ${PORT}');
})