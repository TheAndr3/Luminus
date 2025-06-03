const db = require('../bd');
const multer = require('multer');
const csvParser = require('csv-parser');
const { Readable } = require('stream');

// Configuração do multer para armazenar o arquivo em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//Controller de student

exports.List = async (req, res) => {
    const class_id = req.params.classid;
    
    try {
        const payload = {classroom_id:class_id}
        const dataStudent = await db.pgSelect('ClassroomStudent', payload);

        if (Object.values(dataStudent).length > 0) {
            res.status(200).json(dataStudent);
        } else {
            res.status(400).json({msg:'nao ha estudantes nessa turma'});
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({msg:'falha ao atender a solicitacao'});
    }

}

exports.Get = async (req, res) => {
    const id = req.params.id;
    const class_id = req.params.classid;

    try {
        const payload = {classroom_id: class_id, student_id:id};
        const dataStudent = await db.pgSelect('ClassroomStudent', payload);

        if(Object.values(dataStudent).length > 0) {
            res.status(200).json(dataStudent);
        } else {
            res.status(400).json({msg:'estudante nao existe na turma'})
        }
    } catch (error) {
        res.status(400).json({msg:'nao foi possivel atender a solicitacao'});
    }

    
}

exports.Create = async (req, res) => {
    const class_id = req.params.classid;
    
    try {
        var payload = {
            id: req.body.id,
            name: req.body.name
        };

        const studentresp = await db.pgInsert('student', payload);

        payload = {
            professor_id:req.body.professor_id,
            student_id: req.body.id,
            classroom_id:req.params.classid
        };

        const studentclassresp = await db.pgInsert('ClassroomStudent', payload);

        res.status(201).json({msg:'estudante inserido com sucesso'});
    } catch (error) {
        res.status(400).json({msg:'nao foi possivel atender a sua solicitacao'})
    }

}

exports.Update = async (req, res) => {
    try {
      if (req.body.id) {
        const existingStudent = await db.pgSelect('student', { id: req.body.id });
        if (existingStudent.length > 0) {
          return res.status(400).json({ msg: 'Número de matrícula já existe' });
        }

        const classroomStudentPayload = {
          student_id: req.body.id 
        };

        await db.pgUpdate('ClassroomStudent', classroomStudentPayload, { student_id: req.params.id });

        const appraisalPayload = {
          student_id: req.body.id 
        };

        await db.pgUpdate('Appraisal', appraisalPayload, { student_id: req.params.id });
      }

      const studentPayload = {
        id: req.body.id,
        name: req.body.name
      };

      await db.pgUpdate('student', studentPayload, { id: req.params.id });
  
      res.status(200).json({ msg: 'estudante atualizado com sucesso' });
    } catch (error) {
      res.status(400).json({ msg: 'nao foi possivel atender a sua solicitacao' });
    }
  };
  

  exports.Delete = async (req, res) => {
    try {
      const classroomStudentPayload = {
        classroom_id: req.params.classid,
        student_id: req.params.id,
        professor_id: req.body.professor_id
      };

      await db.pgDelete('ClassroomStudent', classroomStudentPayload);
      
      const appraisalPayload = {
        student_id: req.params.id,
        professor_id: req.body.professor_id
      };

      await db.pgDelete('Appraisal', appraisalPayload);

      const studentPayload = {
        id: req.params.id
      };
      
      await db.pgDelete('student', studentPayload);
  
      res.status(200).json({ msg: 'estudante removido com sucesso' });
    } catch (error) {
      res.status(400).json({ msg: 'nao foi possivel atender a solicitacao' });
    }
  };
  


exports.ImportCsv = [
    upload.single('csvfile'), // 'csvfile' deve ser o nome do campo no FormData do frontend
    async (req, res) => {
        const classId = req.params.classid; // Ajustado para classid

        if (!req.file) {
            return res.status(400).json({ msg: 'Nenhum arquivo CSV enviado.' });
        }

        if (!classId) {
            return res.status(400).json({ msg: 'ID da turma não fornecido.' });
        }

        const studentsFromCsv = [];
        const processingErrors = [];
        let professorIdDaTurma;

        try {
            // 1. Obter o professor_id da turma
            const classroomDetailsArray = await db.pgSelect('Classroom', { id: parseInt(classId) }); //
            if (!classroomDetailsArray || classroomDetailsArray.length === 0) {
                return res.status(404).json({ msg: `Turma com ID ${classId} não encontrada.` });
            }
            professorIdDaTurma = classroomDetailsArray[0].professor_id;
            if (!professorIdDaTurma) {
                return res.status(500).json({ msg: `Não foi possível encontrar o professor para a turma ${classId}.`});
            }


            const readableFileStream = Readable.from(req.file.buffer.toString());

            readableFileStream
                .pipe(csvParser()) // Assumindo que o CSV tem cabeçalhos 'matricula' e 'nome'
                .on('data', (row) => {
                    const matricula = row.matricula ? parseInt(row.matricula.trim(), 10) : null;
                    const nome = row.nome ? row.nome.trim() : null;

                    if (matricula && nome) {
                        studentsFromCsv.push({ matricula, nome });
                    } else {
                        processingErrors.push({ row, error: 'Matrícula ou nome ausentes ou inválidos.' });
                    }
                })
                .on('end', async () => {
                    if (studentsFromCsv.length === 0) {
                        return res.status(400).json({ 
                            msg: 'Nenhum aluno válido encontrado no CSV para importar.', 
                            details: processingErrors 
                        });
                    }

                    const importedStudents = [];
                    const failedImports = [];

                    for (const studentData of studentsFromCsv) {
                        try {
                            // 2. Verificar se o aluno já existe na tabela Student ou criar/atualizar
                            let studentExists = await db.pgSelect('Student', { id: studentData.matricula }); //

                            if (studentExists.length === 0) {
                                await db.pgInsert('Student', { id: studentData.matricula, name: studentData.nome }); //
                            } else {
                                // Opcional: Atualizar o nome do aluno se estiver diferente
                                if (studentExists[0].name !== studentData.nome) {
                                    await db.pgUpdate('Student', { name: studentData.nome }, { id: studentData.matricula }); //
                                }
                            }

                            // 3. Verificar se o aluno já está na turma (ClassroomStudent)
                            const classroomStudentExists = await db.pgSelect('ClassroomStudent', { //
                                classroom_id: parseInt(classId),
                                student_id: studentData.matricula,
                                professor_id: professorIdDaTurma
                            });

                            if (classroomStudentExists.length > 0) {
                                failedImports.push({ student: studentData, error: 'Aluno já cadastrado nesta turma.' });
                            } else {
                                // 4. Inserir aluno na ClassroomStudent
                                await db.pgInsert('ClassroomStudent', { //
                                    classroom_id: parseInt(classId),
                                    student_id: studentData.matricula,
                                    professor_id: professorIdDaTurma
                                });
                                importedStudents.push(studentData);
                            }
                        } catch (dbError) {
                            console.error(`Erro ao processar aluno ${studentData.matricula}:`, dbError);
                            failedImports.push({ student: studentData, error: 'Erro no banco de dados ao inserir/verificar aluno.' });
                        }
                    }

                    if (failedImports.length > 0 && importedStudents.length === 0) {
                         return res.status(400).json({
                            msg: 'Falha ao importar todos os alunos.',
                            successCount: importedStudents.length,
                            failureCount: failedImports.length,
                            failures: failedImports,
                            processingErrors: processingErrors
                        });
                    }
                    
                    if (failedImports.length > 0) {
                        return res.status(207).json({ // Multi-Status
                            msg: `Importação parcialmente concluída. ${importedStudents.length} alunos importados. ${failedImports.length} falharam.`,
                            successCount: importedStudents.length,
                            failureCount: failedImports.length,
                            imported: importedStudents,
                            failures: failedImports,
                            processingErrors: processingErrors
                        });
                    }

                    return res.status(201).json({ 
                        msg: `${importedStudents.length} alunos importados com sucesso!`,
                        successCount: importedStudents.length,
                        failureCount: 0,
                        imported: importedStudents,
                        processingErrors: processingErrors
                    });
                })
                .on('error', (parseError) => { // Erro no parsing do CSV
                    console.error('Erro ao parsear CSV:', parseError);
                    return res.status(400).json({ msg: 'Erro ao ler o arquivo CSV. Verifique o formato.' });
                });

        } catch (error) {
            console.error('Erro geral ao importar CSV:', error);
            return res.status(500).json({ msg: 'Erro interno do servidor ao processar o arquivo CSV.' });
        }
    }
];