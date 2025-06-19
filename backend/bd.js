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
    // Consulta SQL que usa uma CTE (Expressão de Tabela Comum) para primeiro verificar se o dossiê existe
    const query = `
    SELECT d.id as dossierId, d.customUserId, d.name as dossierName, d.description as dossierDescription, d.evaluationMethod as dossierEvaluationMethod, s.id as sectionId, s.name as sectionName, s.description as sectionDescription, s.weigth as sectionWeigth, q.id as questionId, q.name as questionName FROM Dossier as d INNER JOIN Section as s ON d.id = s.dossierId JOIN Question as q ON s.id = q.sectionId WHERE d.id = $1;
    `;

    const client = await connect();
    const data = await client.query(query, [id]);
    client.release();

    const methodType = await pgSelect('EvaluationType', {id:data.rows[0].dossierEvaluationMethod});
    const method = await pgSelect('EvaluationMethod', {id:data.rows[0].dossierEvaluationMethod});
    
    // Retorna null se nenhum dossiê for encontrado
    if (!data.rows || data.rows.length === 0) {
        return null;
    } else {
        var result = {
            id: data.rows[0].dossierId,
            customUserId: data.rows[0].customUserId,
            name: data.rows[0].dossierName,
            description: data.rows[0].dossierDescription,
            evaluationMethod: {
                id: data.rows[0].dossierEvaluationMethod,
                name: method[0].name,
                evaluationType: {}
            },
            sections: {}
        };

        for (let i = 0;i < methodType.length; i++){
            result.evaluationMethod.evaluationType[methodType[i].id] = {
                id: methodType[i].id,
                name: methodType[i].name,
                value: methodType[i].value
            }
        }
        //talvez não funcione 
        for (let i = 0; i < data.rows.length; i++) {
            if (!result.sections[data.rows[i].sectionId]) {
                result.sections[data.rows[i].sectionId] = {
                    id: data.rows[i].sectionId,
                    name: data.rows[i].sectionName,
                    description: data.rows[i].sectionDescription,
                    weigth: data.rows[i].sectionWeigth,
                    questions: {}
                };
            } 
            result.sections[data.rows[i].sectionId].questions[data.rows[i].questionId] = {
                id: data.rows[i].questionId,
                name: data.rows[i].questionName
            };
            
        }
        
        // Retorna o objeto dossiê diretamente já no formato correto
        return result;

    }
}

async function pgDossieUpdate(data) {

    try {
        const evaluationMethod = data.evaluationMethod;
        await pgDelete('EvaluationMethod', {id:evaluationMethod.id});
        const payloadEvaluationMethod = {
            customUserId: data.customUserId,
            name: evaluationMethod.name,
        }
        const evmid = await pgInsert('EvaluationMethod', payloadEvaluationMethod);

        
        for (let i = 0; i < evaluationMethod.length; i++) {
            const evaluationType = evaluationMethod[i];
            const payloadEvaluationType = {
                evaluationMethodId: evmid.rows[0].id,
                customUserId: data.customUserId,
                name: evaluationType.name,
                value: evaluationType.value
            }
            await pgInsert('evaluationMethod', payloadEvaluationType);
        }

        await pgDelete('Section',{dossierId:data.id});
        var sections = data.sections;

        for(let i = 0; i < sections.length; i++){
            var section = sections[i];
            const payloadSection = {
                customUserId: data.customUserId,
                dossierId: data.id,
                name: section.name,
                description: section.description,
                weigth: section.weigth
            };
            
            const secid = await pgInsert('section', payloadSection);
            
            for (let j = 0; j < section.questions.length; j++) {
                var question = section.questions[j];

                const payloadQuestion = {
                    customUserId: data.customUserId,
                    sectionId: secid.rows[0].id,
                    dossierId: data.id,
                    evaluationMethodId: evmid.rows[0].id,
                    name: question.name
                };
                await pgInsert('question', payloadQuestion);
            }
        }
        

        const payloadDossier = {
            name: data.name,
            description: data.description,
            evaluationMethodId: evmid.rows[0].id
        };
        const data = pgUpdate('dossier',payloadDossier, {id:data.id})
    } catch (error) {
        throw error;
    }
    
}

async function pgAppraisalSelect(id, idDossie, idClass) {
    const query = 'SELECT e.id, e.studentId, e.customUserId, e.classroomId, e.dossierId, e.sectionId, e.evaluationMethodId, e.questionId, e.appraisalId, e.questionOption, a.points, a.fillingDate, q.name AS questionName, s.name as sectionName, s.description as sectionDescription, s.weigth, d.name as dossierName, d.description as dossierDescription, et.name as evaluationTypeName, em.name as evaluationMethodName, et.value FROM Evaluation AS e INNER JOIN Appraisal AS a ON e.appraisalId = a.id JOIN Question AS q ON e.questionId = q.id JOIN Section AS s ON q.sectionId = s.id JOIN Dossier AS d ON s.dossierId = d.id JOIN EvaluationMethod as em ON e.evaluationMethodId = em.id JOIN EvaluationType as et ON em.id = et.evaluationMethodId WHERE a.studentId == $1 AND d.id == $2 AND a.classroomId == $3;';

    const client = await connect();

    const response = await client.query(query, [id, idDossie, idClass]);
    client.release();
    const data = await response.rows;
    var result = {
        questions:{},
        appraisalId:data[0].appraisalId,
        points:data[0].points,
        fillingDate:data[0].fillingDate,
        studentId:data[0].studentId,
        costumUserId:data[0].costumUserId,
        classroomId:data[0].classroomId,
        dossierId:data[0].dossierId,
        dossieName:data[0].dossierName,
        dossieDescription:data[0].dossierDescription,
        evaluationMethodId:data[0].evaluationMethodId,
        evaluationMethodName:data[0].evaluationMethodName
    };
    
    for(let i=0; i < data.length; i++){
        var row = data[i];
        if(!Object.keys(result.questions).find(row.questionId)) {
            result.questions[row.questionId] = {
                question:row.questionId,
                questionName:row.questionName,
                sectionId:row.sectionId,
                sectionName:row.sectionName,
                sectionDescription:row.sectionDescription,
                sectionWeigth:row.weigth,
                questionOption:row.questionOption,
                evaluationTypeName:row.evaluationTypeName,

            }
        }
    }

    //retorna os dados da tabela de avaliação ja formatados
    return result;
}

//refatorar isso aqui pra galerar poder fazer o update
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

//refatorar isso aqui
async function pgAppraisalGetPoints(classId) {
    try {
        const response = await pgSelect('Appraisal', {classroom_id: classId});

        const classPoints = response.map(i => { return {student_id:i.student_id, average:i.points}});
        return classPoints;
    } catch (error) {
        throw error
    }
}

module.exports = {pgSelect, pgInsert, pgDelete, pgUpdate, pgDossieSelect, pgDossieUpdate, pgAppraisalSelect, pgAppraisalUpdate, pgAppraisalGetPoints, pgSelectStudentsInClassroom};