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
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES(${placeHolder}) RETURNING ${keys.join(', ')};`;


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
    const valuesNewObject = Object.values(data);
    const keysWhere = Object.keys(keys);
    const valuesWhere = Object.values(keys);
    
    const placeHolderToWhere = keysWhere.map((_,i) => `${_} = $${i+1}`).join(' AND ');
    const placeHolderToUpdate = keysNewObject.map((_,i) => `${_} = $${i+1+valuesWhere.length}`).join(', ');
    const query = `UPDATE ${table} SET ${placeHolderToUpdate} WHERE ${placeHolderToWhere}`;

    const client = await connect();
    return await client.query(query, [...valuesWhere, ...valuesNewObject]);
}

async function pgDossieSelect(id) {
    // Consulta SQL que usa uma CTE (Expressão de Tabela Comum) para primeiro verificar se o dossiê existe
    const query = `
    WITH dossier_data AS (
        SELECT d.id, d.name, d.description, d.evaluation_method
        FROM dossier d
        WHERE d.id = $1
    )
    SELECT 
        json_build_object(
            'id', d.id,
            'name', d.name,
            'description', d.description,
            'evaluation_method', d.evaluation_method,
            'sections', COALESCE(
                json_agg(
                    jsonb_build_object(
                        'id', s.id,
                        'name', s.name,
                        'description', s.description,
                        'weigth', s.weigth,
                        'questions', (
                            SELECT COALESCE(
                                json_agg(
                                    jsonb_build_object(
                                        'id', q.id,
                                        'description', q.description
                                    )
                                ),
                                '[]'::json
                            )
                            FROM question q
                            WHERE q.section_id = s.id AND q.dossier_id = d.id
                        )
                    )
                ) FILTER (WHERE s.id IS NOT NULL),
                '[]'::json
            )
        ) AS dossier
    FROM dossier_data d
    LEFT JOIN section s ON s.dossier_id = d.id
    GROUP BY d.id, d.name, d.description, d.evaluation_method;
`;

    const client = await connect();
    const data = await client.query(query, [id]);
    
    // Retorna null se nenhum dossiê for encontrado
    if (!data.rows || data.rows.length === 0) {
        return null;
    }
    
    // Retorna o objeto dossiê diretamente
    return data.rows[0].dossier;
}

async function pgDossieUpdate(data) {

    try {
        await pgDelete('Section',{dossie_id:data.id});

        var sections = data.sections;

        for(let i = 0; i < sections.length; i++){
            var section = sections[i];
            await pgInsert('section', section);
            
            for (let j = 0; j < section.questions.length; j++) {
                var question = section.questions[j];
                await pgInsert('question', question)
            }
        }
        const payload = {
            name: data.name,
            description: data.description,
            evaluation_method: data.evaluation_method
        };
        const data = pgUpdate('dossier',payload, {id:data.id})
    } catch (error) {
        throw error;
    }
    
}

async function pgAppraisalSelect(id) {
    const query = 'SELECT * FROM Evaluation WHERE appraisal_id == $1';

    const client = await connect();

    const response = await client.query(query, [id]);
    const data = response.rows;
    var result = {id:data[0].appraisal_id, sections:[], dossier_id:data[0].dossier_id, student_id:data[0].student_id, professor_id:data[0].professor_id,};
    for(let i=0; i < data.length; i++){
        var row = data[i];

        if(!Object.keys(result.sections).find(row.section_id)) {
            result.sections[row.section_id] = []
        }
        result.sections[row.section_id].push({question:row.question_id, option: row.question_option, evaluation:row.id})
        
    }
    return result;
}

async function pgAppraisalUpdate(data) {
    try {
        await pgDelete('Evaluation', {appraisal_id:data.id});

        var evaluations = data.evaluation;

        for (let i = 0; i < evaluations.length; i++) {
            const ev = evaluations[i];
            await pgInsert('Evaluation', ev);
        }

        const payload = {
            points: data.points,
            filling_date: data.filling_date
        };
        return await pgUpdate('Appraisal', payload, {id:data.id});
    } catch (error) {
        throw error
    }
}

async function pgAppraisalGetPoints(classId) {
    try {
        const response = await pgSelect('Appraisal', {classroom_id: classId});

        const classPoints = response.map(i => { return {student_id:i.student_id, average:i.points}});
        return classPoints;
    } catch (error) {
        throw error
    }
}

module.exports = {pgSelect, pgInsert, pgDelete, pgUpdate, pgDossieSelect, pgDossieUpdate, pgAppraisalSelect, pgAppraisalUpdate, pgAppraisalGetPoints};