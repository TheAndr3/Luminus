require('dotenv').config();
const app = require('./app.js');
const bd = require('../bd.js');

const PORT = process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`Server running on PORT ${PORT}`);
})