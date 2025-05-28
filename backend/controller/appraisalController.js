const db = require('../bd');

//Controller de student

exports.List = async (req, res) => {
    const class_id = req.params.classid;
    
    try {
        const dataStudent = await db.pgAppraisalGetPoints(class_id)

        if (Object.values(dataStudent).length > 0) {
            return res.status(200).json(dataStudent);
        } else {
            res.status(400).json({msg:'nao ha estudantes nessa turma'});
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({msg:'falha ao atender a solicitacao'});
    }

}

exports.Get = async (req, res) => {
    const id = req.params.studentid;
    const class_id = req.params.classid;

    try {
        const payload = {classroom_id: class_id, student_id:id};
        const dataStudent = await db.pgSelect('appraisal', payload);

        if(Object.values(dataStudent).length > 0) {
            return res.status(200).json(dataStudent);
        } else {
            return res.status(400).json({msg:'estudante nao existe na turma'})
        }
    } catch (error) {
        return res.status(400).json({msg:'nao foi possivel atender a solicitacao'});
    }

    
}

exports.GetAppraisal = async (req, res) => {
  const id = req.params.id;
  
  try {
    const studentAppraisal = db.pgAppraisalSelect(id);

    return res.status(200).json({msg:"sucesso", data:studentAppraisal});
  } catch (error) {
    return res.status(400).json({msg:"não foi possivel atender a solicitação"})
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
  


exports.ImportCsv = async (req, res) => {
    const class_id = req.params.class_id;
    res.status(201).send("Rota de criar turma");
}