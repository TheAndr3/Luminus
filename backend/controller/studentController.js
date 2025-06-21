const db = require('../bd');


//Controller de studen
exports.List = async (req, res) => {
    const class_id = req.params.classid;
    let start = 0;
    let size = 6;

    //para debug
  if ('start' in req.query || 'size' in req.query) {
    console.log('Parâmetros de paginação fornecidos')
  }
  else {
    console.log('Nenhum parâmetro de paginação fornecido')
  }

  if ('start' in req.query) {
    start = parseInt(req.query.start);
  }
  if ('size' in req.query) {
    size = parseInt(req.query.size);
  }
    try {
        const dataStudent = await db.pgSelectStudentsInClassroom(class_id);

        // Sempre retorna 200, mesmo se não houver alunos
        res.status(200).json({msg:"sucesso",data:dataStudent.slice(start, start + size),ammount:dataStudent.length});
    } catch (error) {
        console.log(error);
        res.status(500).json({msg:'falha ao atender a solicitacao'});
    }
}

exports.Get = async (req, res) => {
    const id = req.params.id;
    const class_id = req.params.classid;

    try {
        const payload = {classroomId: class_id, studentId:id};
        const dataStudent = await db.pgSelect('ClassroomStudent', payload);

        if(Object.values(dataStudent).length > 0) {
            res.status(200).json(dataStudent);
        } else {
            res.status(400).json({msg:'estudante nao existe na turma'})
        }
    } catch (error) {
        res.status(500).json({msg:'nao foi possivel atender a solicitacao'});
    }

    
}

exports.Create = async (req, res) => {
    const class_id = req.params.classid;
    
    try {
        var payload = {
            id: req.body.id,
            name: req.body.name
        };
        console.log('Backend: Tentando inserir em student com payload:', payload); // Novo log
        const student = await db.pgSelect('Student', {id:req.body.id});
        if(student.length === 0) {
          await db.pgInsert('Student', payload);
        }
        
        console.log('Backend: student inserido com sucesso');

        payload = {
            customUserId:req.body.customUserId,
            studentId: req.body.id,
            classroomId:req.params.classid
        };

        const classStudent = await db.pgSelect('Classroom', {id:class_id});

        if(classStudent.length > 0) {
          await db.pgInsert('ClassroomStudent', payload);
        } else {
          return res.status(403).json({msg:'turma nao existe'})
        }

        if (classStudent[0] && classStudent[0].dossierId) {
          payload = {
            classroomId: classStudent[0].id,
            studentId: req.body.id,
            customUserId: req.body.customUserId,
            points: 0,
            fillingDate: new Date().toISOString(),
            dossierId: classStudent[0].dossierId,
          }
          await db.pgInsert('Appraisal', payload);
        }

        return res.status(201).json({msg:'estudante inserido com sucesso'});
    } catch (error) {
        console.error('Erro ao criar estudante:', error);
        return res.status(500).json({msg:'nao foi possivel atender a sua solicitacao'})
    }

}

exports.Update = async (req, res) => {
    try {
      const currentStudentId = req.params.id;
      const newStudentId = req.body.id;
      const newName = req.body.name;

      // Se a matrícula for alterada, verificar se a nova matrícula já existe
      if (newStudentId && newStudentId != currentStudentId) {
        const existingStudent = await db.pgSelect('Student', { id: newStudentId });
        if (existingStudent.length > 0) {
          return res.status(403).json({ msg: 'Número de matrícula já existe' });
        }
      }

      // Atualiza o estudante
      const studentPayload = {
        id: newStudentId,
        name: newName
      };

      await db.pgUpdate('Student', studentPayload, { id: currentStudentId });

      // Se a matrícula foi alterada, atualiza as tabelas relacionadas
      if (newStudentId && newStudentId != currentStudentId) {
        const classroomStudentPayload = {
          studentId: newStudentId,
        };

        await db.pgUpdate('ClassroomStudent', classroomStudentPayload, { studentId: currentStudentId});

        const appraisalPayload = {
          studentId: newStudentId 
        };

        await db.pgUpdate('Appraisal', appraisalPayload, { studentId: currentStudentId });
      }

      return res.status(200).json({ msg: 'estudante atualizado com sucesso' });
    } catch (error) {
      return res.status(500).json({ msg: 'nao foi possivel atender a sua solicitacao' });
    }
  };
  

  exports.Delete = async (req, res) => {
    try {
      const classroomStudentPayload = {
        classroomId: req.params.classid,
        studentId: req.params.id,
        customUserId: req.body.customUserId
      };

      await db.pgDelete('ClassroomStudent', classroomStudentPayload);
      
      const appraisalPayload = {
        studentId: req.params.id,
        customUserId: req.body.customUserId
      };

      await db.pgDelete('Appraisal', appraisalPayload);

      const studentPayload = {
        id: req.params.id
      };
      
      await db.pgDelete('Student', studentPayload);
  
      return res.status(200).json({ msg: 'estudante removido com sucesso' });
    } catch (error) {
      return res.status(500).json({ msg: 'nao foi possivel atender a solicitacao' });
    }
  };
  


exports.ImportCsv = async (req, res) => {
  const classId = req.params.classid;
  const alunos = req.body.alunos;

  if (!classId) {
    return res.status(403).json({ msg: 'ID da turma não fornecido.' });
  }
  if (!Array.isArray(alunos) || alunos.length === 0) {
    return res.status(403).json({ msg: 'Nenhum aluno enviado.' });
  }

  const imported = [];
  const failures = [];

  // Buscar o professor_id da turma
  let customUserId;
  try {
    const turma = await db.pgSelect('Classroom', { id: parseInt(classId) });
    if (!turma || turma.length === 0) {
      return res.status(404).json({ msg: 'Turma não encontrada.' });
    }
    customUserId = turma[0].customUserId;
    if (!customUserId) {
      return res.status(404).json({ msg: 'customUserId não encontrado para a turma.' });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: 'Erro ao buscar turma.', error: err.message });
  }

  for (const aluno of alunos) {
    if (!aluno.matricula || !aluno.nome) {
      failures.push({ aluno, error: 'Dados incompletos.' });
      continue;
    }
    try {
      // 1. Inserir ou atualizar o aluno na tabela student
      const existingStudent = await db.pgSelect('Student', { id: aluno.matricula });
      if (existingStudent.length === 0) {
        await db.pgInsert('Student', { id: aluno.matricula, name: aluno.nome });
      } else if (existingStudent[0].name !== aluno.nome) {
        await db.pgUpdate('Student', { name: aluno.nome }, { id: aluno.matricula });
      }

      // 2. Associar o aluno à turma na tabela ClassroomStudent
      const existsInClass = await db.pgSelect('ClassroomStudent', {
        classroomId: classId,
        studentId: aluno.matricula,
        customUserId: customUserId
      });
      if (existsInClass.length === 0) {
        await db.pgInsert('ClassroomStudent', {
          classroomId: classId,
          studentId: aluno.matricula,
          customUserId: customUserId
        });
        imported.push(aluno);
        if (turma.dossierId) {
          await db.pgInsert('Appraisal', {
            classroomId: classId,
            studentId: aluno.matricula,
            customUserId: customUserId,
            points: 0,
            dossierId: turma.dossierId,
            fillingDate: new Date().toISOString()
          });
        }
      } else {
        failures.push({ aluno, error: 'Aluno já está associado à turma.' });
      }
    } catch (err) {
      failures.push({ aluno, error: err.message });
    }
  }

  if (failures.length && imported.length) {
    return res.status(207).json({
      msg: 'Importação parcial.',
      imported,
      failures
    });
  }
  if (failures.length && !imported.length) {
    return res.status(400).json({
      msg: 'Falha ao importar todos os alunos.',
      failures
    });
  }
  return res.status(201).json({
    msg: 'Todos os alunos importados com sucesso!',
    imported
  });
};