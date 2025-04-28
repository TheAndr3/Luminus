const {Pool} = require('pg');

async function connect() {
    if (global.connection) {
        return global.connection.connect();
    }

    const pool = new Pool({
        host: process.env.CONNECTION_STRING,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT
    });

    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log(res.rows[0]);

    client.release();

    global.connection = pool;
    return pool.connect();
}

async function pgSelect(table, data) {

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeHolder = keys.map((_,i) => `${_} = $${i+1}`).join(' AND ');

    var sqlString = ''

    if (Object.keys(data).length == 0) {
        sqlString = `SELECT * FROM ${table};`
    } else {
        sqlString = `SELECT * FROM ${table} WHERE ${placeHolder};`
    }

    const client = await connect();
    const res = await client.query(sqlString, values);
    return res.rows;

}


async function pgInsert(table, data) {

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeHolder = keys.map((_,i) => `$${i+1}`).join(', ');
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES(${placeHolder})`;


    const client = await connect();
    return await client.query(query, values);
}

async function pgDelete(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeHolder = keys.map((_,i) => `${_} = $${i+1}`).join(' AND ');
    const query = `DELETE FROM ${table} WHERE ${placeHolder}`;

    const client = await connect();
    return await client.query(query, values);
}

async function pgUpdate(table, data, keys) {
    const keysNewObject = Object.keys(data);
    const values = Object.values(data);
    const placeHolderToWhere = keys.map((_,i) => `${_} = $${i+1}`).join(' AND ');
    const placeHolderToUpdate = keysNewObject.map((_,i) => `${_} = $${i+1}`).join(', ');
    const query = `UPDATE ${table} SET ${placeHolderToUpdate} WHERE ${placeHolderToWhere}`;

    const client = await connect();
    return await client.query(query, values);
}
module.exports = {pgSelect, pgInsert, pgDelete, pgUpdate}