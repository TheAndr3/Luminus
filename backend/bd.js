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

    client.release()
    return res.rows;

}

async function pgInsert(table, data) {

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeHolder = keys.map((_,i) => `$${i+1}`).join(', ');
    var whatIsReturned = '';


    if (table == 'classroomStudent' || table == 'classroomstudent' || table == 'ClassroomStudent' || table == 'Classroomstudent') {
        whatIsReturned = "classroomId, studentId, customUserId";
    } else if (table == 'verifyCode' || table == 'Verifycode' || table == 'VerifyCode') {
        whatIsReturned = "code, status";
    } else if (table == 'Tokencode' || table == 'tokencode' || table == 'TOKENCODE' || table == 'TokenCode'){
        whatIsReturned = "token, verifyStatus";
    } else if (table == 'EvaluationMethod' || table == 'evaluationmethod' || table == 'evaluationMethod') {
        whatIsReturned = 'id, customUserId';
    } else if (table == 'EvaluationType' || table == 'evaluationtype' || table == 'evaluationType') {
        whatIsReturned = 'id, evaluationMethodId, customUserId';
    } else if (table == 'Dossier' || table == 'dossier') {
        whatIsReturned = 'id, customUserId';
    } else if (table == 'Section' || table == 'section') {
        whatIsReturned = 'id, dossierId, customUserId';
    } else if (table == 'Question' || table == 'question') {
        whatIsReturned = 'id, sectionId, dossierId, customUserId';
    } else {
        whatIsReturned = 'id';
    }
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES(${placeHolder}) RETURNING ${whatIsReturned};`;


    const client = await connect();
    const result = await client.query(query, values);
    client.release();
    return result

}

async function pgDelete(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeHolder = keys.map((_,i) => `${_} = $${i+1}`).join(' AND ');
    const query = `DELETE FROM ${table} WHERE ${placeHolder}`;

    const client = await connect();
    const result = await client.query(query, values);
    client.release();
    return result
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
    const result = await client.query(query, [...valuesWhere, ...valuesNewObject]);
    client.release();
    return result

}

async function pgSelectStudentsInClassroom(classroom_id) {
    const query = `
        SELECT cs.studentId, s.name, s.id AS matricula
        FROM ClassroomStudent cs
        JOIN student s ON cs.studentId = s.id
        WHERE cs.classroomId = $1
    `;
    const client = await connect();
    const res = await client.query(query, [classroom_id]);
    client.release();
    return res.rows;
}

async function pgDossieSelect(id) {
    // First, get the basic dossier information
    const dossierQuery = `
    SELECT d.id as dossierid, d.customuserid, d.name as dossiername, d.description as dossierdescription, d.evaluationmethodid as dossierevaluationmethod
    FROM dossier as d 
    WHERE d.id = $1;
    `;

    const client = await connect();
    const dossierData = await client.query(dossierQuery, [id]);
    client.release();

    // Retorna null se nenhum dossiê for encontrado
    if (!dossierData.rows || dossierData.rows.length === 0) {
        return null;
    }

    // Get the customUserId and evaluationMethodId from the dossier
    const customUserId = dossierData.rows[0]["customuserid"];
    const evaluationMethodId = dossierData.rows[0]["dossierevaluationmethod"];

    // Get evaluation method and types using correct column names
    let methodType = await pgSelect('evaluationtype', {evaluationmethodid: evaluationMethodId, customuserid: customUserId});
    const method = await pgSelect('evaluationmethod', {id: evaluationMethodId, customuserid: customUserId});
    
    // On-the-fly migration for old numeric dossiers to integer 0-10 scale
    if (method.length > 0 && method[0].name.toLowerCase() === 'numerical' && methodType.length !== 11) {
        console.log(`Migrating EvaluationType for numeric dossier's method ID: ${evaluationMethodId} to 0-10 integer scale.`);
        const client = await connect();
        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM evaluationtype WHERE evaluationmethodid = $1 AND customuserid = $2', [evaluationMethodId, customUserId]);
            
            for (let i = 0; i <= 10; i++) {
                const insertQuery = 'INSERT INTO EvaluationType (name, value, evaluationMethodId, customUserId) VALUES ($1, $2, $3, $4)';
                await client.query(insertQuery, [i.toString(), i, evaluationMethodId, customUserId]);
            }
            await client.query('COMMIT');
            
            methodType = await pgSelect('evaluationtype', {evaluationmethodid: evaluationMethodId, customuserid: customUserId});
        } catch (e) {
            await client.query('ROLLBACK');
            console.error('Failed to migrate evaluation types on the fly:', e);
        } finally {
            client.release();
        }
    }
    
    // Get sections and questions with LEFT JOINs
    const sectionsQuery = `
    SELECT s.id as sectionid, s.name as sectionname, s.description as sectiondescription, s.weigth as sectionweigth, 
           q.id as questionid, q.name as questionname
    FROM section as s 
    LEFT JOIN question as q ON s.id = q.sectionid AND s.dossierid = q.dossierid AND s.customuserid = q.customuserid 
    WHERE s.dossierid = $1 AND s.customuserid = $2
    ORDER BY s.id, q.id;
    `;

    const client2 = await connect();
    const sectionsData = await client2.query(sectionsQuery, [id, customUserId]);
    client2.release();
    
    var result = {
        id: dossierData.rows[0]["dossierid"],
        customUserId: dossierData.rows[0]["customuserid"],
        name: dossierData.rows[0]["dossiername"],
        description: dossierData.rows[0]["dossierdescription"],
        evaluation_method: {
            id: evaluationMethodId,
            name: method[0]?.name || 'Unknown',
            evaluationType: []
        },
        sections: {}
    };

    // Process evaluation types as array
    for (let i = 0; i < methodType.length; i++){
        result.evaluation_method.evaluationType.push({
            id: methodType[i].id,
            name: methodType[i].name,
            value: methodType[i].value
        });
    }
    
    // Process sections and questions
    for (let i = 0; i < sectionsData.rows.length; i++) {
        const row = sectionsData.rows[i];
        const sectionId = row["sectionid"];
        if (!sectionId) continue;
        if (!result.sections[sectionId]) {
            result.sections[sectionId] = {
                id: sectionId,
                name: row["sectionname"],
                description: row["sectiondescription"],
                weigth: row["sectionweigth"],
                questions: {}
            };
        } 
        // Only add question if it exists (not null due to LEFT JOIN)
        if (row["questionid"]) {
            result.sections[sectionId].questions[row["questionid"]] = {
                id: row["questionid"],
                name: row["questionname"]
            };
        }
    }
    
    // Retorna o objeto dossiê diretamente já no formato correto
    return result;
}

async function pgDossieUpdate(data) {

    try {
        const evaluationMethod = data.evaluationMethod;
        // For composite primary key, need to include customUserId
        await pgDelete('evaluationmethod', {id:evaluationMethod.id, customuserid: data.customUserId});
        const payloadEvaluationMethod = {
            customuserid: data.customUserId,
            name: evaluationMethod.name,
        }
        const evmid = await pgInsert('evaluationmethod', payloadEvaluationMethod);

        
        if (evaluationMethod.evaluationType && Array.isArray(evaluationMethod.evaluationType)) {
            for (let i = 0; i < evaluationMethod.evaluationType.length; i++) {
                const evaluationType = evaluationMethod.evaluationType[i];
                const payloadEvaluationType = {
                    evaluationmethodid: evmid.rows[0].id,
                    customuserid: data.customUserId,
                    name: evaluationType.name,
                    value: evaluationType.value
                }
                await pgInsert('evaluationtype', payloadEvaluationType);
            }
        }

        // For composite primary key, need to include customUserId
        await pgDelete('section',{dossierid:data.id, customuserid: data.customUserId});
        var sections = data.sections;

        for(let i = 0; i < sections.length; i++){
            var section = sections[i];
            const payloadSection = {
                customuserid: data.customUserId,
                dossierid: data.id,
                name: section.name,
                description: section.description,
                weigth: section.weigth
            };
            
            const secid = await pgInsert('section', payloadSection);
            const questions = section.questions;
            for(let j = 0; j < questions.length; j++){
                const question = questions[j];
                const payloadQuestion = {
                    customuserid: data.customUserId,
                    dossierid: data.id,
                    sectionid: secid.rows[0].id,
                    name: question.name
                }
                await pgInsert('question', payloadQuestion);
            }
        }
        

        const payloadDossier = {
            name: data.name,
            description: data.description,
            evaluationmethodid: evmid.rows[0].id
        };
        await pgUpdate('dossier',payloadDossier, {id:data.id, customuserid: data.customUserId});
    } catch (error) {
        throw error;
    }
    
}

async function pgAppraisalSelect(studentId, dossierId, classId) {
    const query = `
        SELECT a.id as appraisalid, a.studentid, a.dossierid, e.questionid, e.questionoption
        FROM appraisal as a
        LEFT JOIN evaluation as e ON a.id = e.appraisalid
        WHERE a.studentid = $1 AND a.dossierid = $2 AND a.classroomid = $3;
    `;
    const client = await connect();
    const result = await client.query(query, [studentId, dossierId, classId]);
    client.release();

    if (result.rows.length === 0) {
        return null;
    }

    const appraisalData = {
        id: result.rows[0].appraisalid,
        student_id: result.rows[0].studentid,
        dossier_id: result.rows[0].dossierid,
        answers: []
    };

    result.rows.forEach(row => {
        if (row.questionid) {
            appraisalData.answers.push({
                question_id: row.questionid,
                question_option_id: row.questionoption
            });
        }
    });

    return appraisalData;
}

async function pgAppraisalUpdate(data, appraisalId) {
    const { answers } = data;
    if (!answers || !Array.isArray(answers)) {
        throw new Error("Payload de respostas inválido.");
    }

    const client = await connect();
    try {
        await client.query('BEGIN');

        // Limpa as respostas antigas
        await client.query('DELETE FROM evaluation WHERE appraisalid = $1', [appraisalId]);

        // Pega os IDs necessários da avaliação
        const appraisalRes = await client.query('SELECT studentid, classroomid, dossierid FROM appraisal WHERE id = $1', [appraisalId]);
        if (appraisalRes.rows.length === 0) throw new Error(`Avaliação ${appraisalId} não encontrada.`);
        const { studentid, classroomid, dossierid } = appraisalRes.rows[0];

        // Pega o ID do método de avaliação do dossiê
        const dossierRes = await client.query('SELECT customuserid, evaluationmethodid FROM dossier WHERE id = $1', [dossierid]);
        if (dossierRes.rows.length === 0) throw new Error(`Dossiê ${dossierid} não encontrado.`);
        const { customuserid, evaluationmethodid } = dossierRes.rows[0];

        // Itera e insere cada resposta
        for (const answer of answers) {
            const valueToStore = answer.answer_value ?? answer.evaluation_type_id;
            
            // Pula se não houver valor para armazenar
            if (answer.question_id == null || valueToStore == null) continue;

            const questionRes = await client.query('SELECT sectionid FROM question WHERE id = $1', [answer.question_id]);
            if (questionRes.rows.length === 0) {
                console.warn(`Questão ${answer.question_id} não encontrada. Pulando.`);
                continue;
            }
            const { sectionid } = questionRes.rows[0];

            const insertQuery = `
                INSERT INTO evaluation (
                    studentid, customuserid, classroomid, dossierid, sectionid, 
                    evaluationmethodid, questionid, appraisalid, questionoption
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `;
            const values = [
                studentid, customuserid, classroomid, dossierid, sectionid,
                evaluationmethodid, answer.question_id, appraisalId, 
                valueToStore
            ];
            await client.query(insertQuery, values);
        }

        await client.query('COMMIT');
        return { success: true, message: "Avaliação atualizada com sucesso." };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Erro na transação de atualização da avaliação:", error);
        throw error;
    } finally {
        client.release();
    }
}

async function pgAppraisalGetPoints(classId) {

}

module.exports = {connect, pgSelect, pgInsert, pgDelete, pgUpdate, pgSelectStudentsInClassroom, pgDossieSelect, pgDossieUpdate, pgAppraisalSelect, pgAppraisalUpdate, pgAppraisalGetPoints};