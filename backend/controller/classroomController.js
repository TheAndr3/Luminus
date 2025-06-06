const db = require('../bd');
const csvParser = require('csv-parser'); // Importe o csv-parser
const { Readable } = require('stream'); // Para criar um stream a partir do buffer do arquivo

exports.List = async (req, res) => {
  const professor_id = req.params.professorid;
  var start = 0;
  var size = 6; // Tamanho padrão de 6 turmas por página

  console.log('Listando turmas para o professor:', professor_id);

  try {
    start = parseInt(req.query.start) || 0;
    size = parseInt(req.query.size) || 6;
    console.log('Parâmetros de paginação - início:', start, 'tamanho:', size);
  } catch (error) {
    console.log('Erro ao analisar parâmetros de paginação:', error);
  }

  try{
    const classData = await db.pgSelect('Classroom', {professor_id:professor_id});
    console.log('Dados brutos das turmas:', classData);
    
    const endIndex = start + size;
    const slicedData = classData;
    console.log('Dados fatiados:', slicedData);
    
    return res.status(200).json({
      msg:'sucesso', 
      data: slicedData, 
      ammount: classData.length
    });
  }
    catch (err) {
      console.log('Erro ao buscar turmas:', err)
      return res.status(400).json({msg:'falha ao atender solicitacao'});
    }
}

exports.Get = async (req, res) => {
  const id = req.params.id;

  try{
    const classData = await db.pgSelect('classroom',{id:id});
    return res.status(200).json({msg:'sucesso', data:classData});
  } catch(err) {
    return res.status(400).json({msg:'id invalido'});
  }
}

exports.Create = async (req, res) => {

  try {
    const professor = await db.pgSelect('professor', {id: req.body.professor_id})

    if (Object.values(professor).length > 0) {
      const payload = {
        professor_id: req.body.professor_id,
        name: req.body.name,
        description: req.body.description,
        season: req.body.season,
        institution: req.body.institution
      }

      const resp = await db.pgInsert('classroom', payload);

      return res.status(201).json({msg:'classe criada com sucesso', data:resp});

    } else {
      return res.status(400).json({msg:'id de professor invalido'});
    }
  } catch (error) {
    return res.status(400).json({msg:'nao foi possivel atender a solicitacao'})
  }
}

exports.Update = async (req, res) => {
  try {
    const professor = await db.pgSelect('professor', { id: req.body.professor_id });

    if (Object.values(professor).length > 0) {
      const payload = {};
      
      if (req.body.name) payload.name = req.body.name;
      if (req.body.description) payload.description = req.body.description;
      if (req.body.season) payload.season = req.body.season;
      if (req.body.institution) payload.institution = req.body.institution;
      if (req.body.dossier_id) payload.dossier_id = req.body.dossier_id;
      if (req.body.dossier_professor_id) payload.dossier_professor_id = req.body.dossier_professor_id;

      const resp = await db.pgUpdate('classroom', payload, { 
        id: req.params.id,
        professor_id: req.body.professor_id 
      });

      return res.status(200).json({ msg: 'turma atualizada com sucesso', data:resp});
    } else {
      return res.status(400).json({ msg: 'id de professor invalido' });
    }
  } catch (error) {
    return res.status(400).json({ msg: 'nao foi possivel atender a solicitacao' });
  }
};

exports.Delete = async (req, res) => {
  const id = req.params.id;
    try {
    const payload = {
      classroom_id: req.params.id,
      professor_id: req.body.professor_id
    };

    await db.pgDelete('classroom', { id: payload.classroom_id, professor_id: payload.professor_id });

    return res.status(200).json({ msg: 'turma e registros relacionados removidos com sucesso' });
  } catch (error) {
    return res.status(400).json({ msg: 'nao foi possivel atender a solicitacao' });
}
}

exports.AssociateDossier = async (req, res) => {
  const classId = req.params.classid;
  const dossierId = req.params.dossierid;

  try {
    //Verifica se o dossiê existe e obtém o professor_id
    const dossier = await db.pgSelect('Dossier', { id: dossierId });
    if (!dossier || dossier.length === 0) {
      return res.status(404).json({ msg: 'Dossiê não encontrado' });
    }

    // Primeiro, verifica se a turma existe
    const classroom = await db.pgSelect('Classroom', { id: classId });
    if (!classroom || classroom.length === 0) {
      return res.status(404).json({ msg: 'Turma não encontrada' });
    }

    // Atualiza a classe com os dois campos exigidos pela FK composta
    const updateData = {
      dossier_id: dossier[0].id,
      dossier_professor_id: dossier[0].professor_id
    };

    await db.pgUpdate('Classroom', updateData, { id: classId });

    return res.status(200).json({ msg: 'Dossiê associado com sucesso' });
  } catch (error) {
    console.error('Erro ao associar dossiê:', error);
    return res.status(500).json({ msg: 'Erro ao associar dossiê' });
  }
};

// NOVA FUNÇÃO para criar turma e importar alunos de um CSV
exports.CreateWithCsv = async (req, res) => {
    // Os campos de texto do FormData estarão em req.body graças ao multer
    const { name, description, season, institution, professor_id, dossier_id, dossier_professor_id } = req.body;
    const csvFile = req.file; // O arquivo CSV estará em req.file

    // Validação básica dos dados da turma
    if (!name || !description || !season || !professor_id) {
        return res.status(400).json({ msg: 'Campos obrigatórios da turma (nome, descrição, período, ID do professor) não fornecidos.' });
    }

    let newClassroomId;
    let classProfessorId = parseInt(professor_id, 10); // Garante que é um número

    try {
        // 1. Criar a Turma (Classroom)
        const classroomPayload = {
            professor_id: classProfessorId,
            name: name,
            description: description, // No frontend, 'inputDisc' é usado como descrição
            season: season,
            institution: institution || null, // Permite instituição opcional
            // Adicione dossier_id e dossier_professor_id se eles forem enviados e necessários
            // dossier_id: dossier_id ? parseInt(dossier_id, 10) : null,
            // dossier_professor_id: dossier_professor_id ? parseInt(dossier_professor_id, 10) : null,
        };

        const classroomCreationResult = await db.pgInsert('classroom', classroomPayload); // Usa nome da tabela em minúsculas
        if (!classroomCreationResult || classroomCreationResult.rows.length === 0) {
            throw new Error('Falha ao criar a turma no banco de dados.');
        }
        
        const newClassroom = classroomCreationResult.rows[0];
        newClassroomId = newClassroom.id; // ID da turma recém-criada
        // classProfessorId já foi definido acima, e é o mesmo usado para criar a turma

        // 2. Processar Alunos do CSV (se um arquivo foi enviado)
        let importedStudentsCount = 0;
        const studentImportFailures = [];
        const studentsFromCsvToProcess = [];

        if (csvFile) {
            const readableFileStream = Readable.from(csvFile.buffer.toString());

            await new Promise((resolve, reject) => {
                readableFileStream
                    .pipe(csvParser()) // Assumindo colunas 'matricula' e 'nome' no CSV
                    .on('data', (row) => {
                        const matriculaStr = row.matricula?.trim();
                        const nomeAluno = row.nome?.trim();
                        if (matriculaStr && nomeAluno) {
                            const matricula = parseInt(matriculaStr, 10);
                            if (!isNaN(matricula)) {
                                studentsFromCsvToProcess.push({ matricula, nome: nomeAluno });
                            } else {
                                studentImportFailures.push({ matricula: matriculaStr, nome: nomeAluno, error: 'Matrícula inválida (não é um número).' });
                            }
                        } else {
                             // Linha com dados ausentes, pode ser logado ou adicionado a falhas se desejado
                             console.warn('Linha do CSV ignorada por dados ausentes:', row);
                        }
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });

            for (const studentData of studentsFromCsvToProcess) {
                try {
                    // 2a. Verificar/Criar Aluno (Student)
                    let studentExists = await db.pgSelect('student', { id: studentData.matricula }); // Usa nome da tabela em minúsculas
                    
                    if (studentExists.length === 0) {
                        await db.pgInsert('student', { id: studentData.matricula, name: studentData.nome });
                    } else if (studentExists[0].name !== studentData.nome) {
                        // Opcional: Atualizar nome do aluno se estiver diferente no CSV
                        await db.pgUpdate('student', { name: studentData.nome }, { id: studentData.matricula });
                    }

                    // 2b. Associar Aluno à Turma (ClassroomStudent)
                    const classroomStudentPayload = {
                        classroom_id: newClassroomId,
                        student_id: studentData.matricula,
                        professor_id: classProfessorId // O professor_id da turma
                    };
                    
                    // Evitar duplicatas em ClassroomStudent
                    const existingAssociation = await db.pgSelect('classroomstudent', classroomStudentPayload); // Usa nome da tabela em minúsculas
                    if (existingAssociation.length === 0) {
                        await db.pgInsert('classroomstudent', classroomStudentPayload);
                        importedStudentsCount++;
                    } else {
                        studentImportFailures.push({ ...studentData, error: 'Aluno já cadastrado nesta turma.' });
                    }
                } catch (dbErrorForStudent) {
                    console.error(`Erro no BD ao processar aluno ${studentData.matricula}:`, dbErrorForStudent);
                    studentImportFailures.push({ ...studentData, error: 'Erro no banco de dados ao processar aluno.' });
                }
            }
        }

        // 3. Enviar Resposta
        let responseMessage = `Turma "${name}" criada com sucesso.`;
        if (csvFile) {
            responseMessage += ` ${importedStudentsCount} de ${studentsFromCsvToProcess.length} alunos do CSV foram importados.`;
        }

        const responsePayload = {
            msg: responseMessage,
            classroomId: newClassroomId,
            classroomName: name,
            importedCount: importedStudentsCount,
            totalInCsv: studentsFromCsvToProcess.length,
            failures: studentImportFailures,
        };
        
        if (studentImportFailures.length > 0 && importedStudentsCount > 0) {
            return res.status(207).json(responsePayload); // Multi-Status (sucesso parcial)
        } else if (studentImportFailures.length > 0 && importedStudentsCount === 0 && studentsFromCsvToProcess.length > 0) {
            return res.status(400).json(responsePayload); // Falha em todos os alunos do CSV
        }
        return res.status(201).json(responsePayload); // Criado com sucesso

    } catch (error) {
        console.error("Erro geral ao criar turma com CSV:", error);
        // Se a turma foi criada mas o processamento do CSV falhou depois,
        // pode ser necessário um tratamento mais complexo (rollback ou informar o ID da turma criada).
        // Por simplicidade, retornamos um erro genérico.
        return res.status(500).json({ 
            msg: 'Erro interno do servidor ao processar a requisição.', 
            error: error.message 
        });
    }

  }
