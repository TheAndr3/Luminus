const {Pool} = require('pg');

async function connect() {
    if (global.connection) {
        return global.connection.connect();
    }

    const pool = Pool({connectionString:process.env.CONNECTION_STRING});

    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log(res.rows[0]);

    client.release();

    global.connection = pool;
    return pool.connect();
}

async function select(params, table, attr, comparation, value) {
    const sqlString = `SELECT ${params} FROM ${table} WHERE ${attr} ${comparation} ${value}`

    const client = await connect();
    const res = await client.query(sqlString);
    return res.rows;

}

async function insertOnProfessor(params) {
    const sqlString = `INSERT INTO Professor()`
}

async function insert(params, table, columns, ) {
    
}
module.exports = {select}