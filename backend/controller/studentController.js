const db = require('../bd');


//Controller de studen
exports.List = async (req, res) => {
    const class_id = req.params.classid;
    try {
        const dataStudent = await db.pgSelectStudentsInClassroom(class_id);

        // Sempre retorna 200, mesmo se não houver alunos
        res.status(200).json(dataStudent);
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
        console.log('Backend: Tentando inserir em student com payload:', payload); // Novo log
        const studentresp = await db.pgInsert('student', payload);
        console.log('Backend: student inserido com sucesso:', studentresp);

        payload = {
            customUser_id:req.body.professor_id,
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
        customUser_id: req.body.professor_id
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
  


exports.ImportCsv = async (req, res) => {
  const classId = req.params.classid;
  const alunos = req.body.alunos;

  if (!classId) {
    return res.status(400).json({ msg: 'ID da turma não fornecido.' });
  }
  if (!Array.isArray(alunos) || alunos.length === 0) {
    return res.status(400).json({ msg: 'Nenhum aluno enviado.' });
  }

  const imported = [];
  const failures = [];

  // Buscar o professor_id da turma
  let professorId;
  try {
    const turma = await db.pgSelect('Classroom', { id: parseInt(classId) });
    if (!turma || turma.length === 0) {
      return res.status(404).json({ msg: 'Turma não encontrada.' });
    }
    professorId = turma[0].professor_id;
    if (!professorId) {
      return res.status(500).json({ msg: 'professor_id não encontrado para a turma.' });
    }
  } catch (err) {
    return res.status(500).json({ msg: 'Erro ao buscar turma.', error: err.message });
  }

  for (const aluno of alunos) {
    if (!aluno.matricula || !aluno.nome) {
      failures.push({ aluno, error: 'Dados incompletos.' });
      continue;
    }
    try {
      // 1. Inserir ou atualizar o aluno na tabela student
      const existingStudent = await db.pgSelect('student', { id: aluno.matricula });
      if (existingStudent.length === 0) {
        await db.pgInsert('student', { id: aluno.matricula, name: aluno.nome });
      } else if (existingStudent[0].name !== aluno.nome) {
        await db.pgUpdate('student', { name: aluno.nome }, { id: aluno.matricula });
      }

      // 2. Associar o aluno à turma na tabela ClassroomStudent
      const existsInClass = await db.pgSelect('ClassroomStudent', {
        classroom_id: classId,
        student_id: aluno.matricula,
        customUser_id: professorId
      });
      if (existsInClass.length === 0) {
        await db.pgInsert('ClassroomStudent', {
          classroom_id: classId,
          student_id: aluno.matricula,
          customUser_id: professorId
        });
        imported.push(aluno);
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