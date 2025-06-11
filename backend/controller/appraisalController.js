const db = require('../bd');

//Controller de student

exports.List = async (req, res) => {
    const class_id = req.params.classid;
    var start =0;
    var size = 0;

    try {
      start = req.query.start;
      size = req.query.size;
    } catch (error) {
      console.log(error)
    }
    
    try {
        const dataStudent = await db.pgAppraisalGetPoints(class_id)

        if (Object.values(dataStudent).length > 0) {

            return res.status(200).json({msg:"sucess", data:dataStudent.slice(start, start+size-1), ammount:dataStudent.length});
        } else {
            return res.status(403).json({msg:'nao ha estudantes nessa turma'});
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
            return res.status(200).json({msg:'sucess', data:dataStudent});
        } else {
            return res.status(403).json({msg:'estudante nao existe na turma'})
        }
    } catch (error) {
        return res.status(400).json({msg:'nao foi possivel atender a solicitacao'});
    }

    
}

exports.GetAppraisal = async (req, res) => {
  const id = req.params.id;
  
  try {
    const studentAppraisal = await db.pgAppraisalSelect(id);

    return res.status(200).json({msg:"sucesso", data:studentAppraisal});
  } catch (error) {
    return res.status(400).json({msg:"não foi possivel atender a solicitação"})
  }
}

exports.Create = async (req, res) => {
    const class_id = req.params.classid;
    const student_id = req.params.studentid;
    
    try {
        var payload = {
            classroom_id: class_id,
            student_id: student_id
        };

        try {
          var data = await db.pgSelect('appraisal', payload);
          if(Object.values(data).length > 0) {
            throw new Error('avaliação ja existe');
          }
        } catch (error) {
          throw new Error("avaliação ja cadastrada");
        }
        

        payload = {
            professor_id:req.body.professor_id,
            student_id: student_id,
            classroom_id:class_id,
            points:0.0,
            filling_date: new Date()
        };

        const respAppraisal = await db.pgInsert('Appraisal', payload);

        return res.status(201).json({msg:'avaliação criada com sucesso', data:respAppraisal});
    } catch (error) {
        console.log(error)
        return res.status(400).json({msg:'nao foi possivel atender a sua solicitacao'})
    }

}

exports.Update = async (req, res) => {
  const id = req.params.id  
  const data = req.body;
  try {
      try {
        const hasAppraisal = await db.pgSelect('appraisal', {id:id});
        if (Object.values(hasAppraisal).length > 0) {
          const resp = await db.pgAppraisalUpdate(data);

          return res.status(201).json({msg:'atualizado com sucesso', data:resp});
        } else {
          throw new Error('avaliação não existe');
        }
      } catch (error) {
        throw new Error("avaliação não existe");
      }
    } catch (error) {
      return res.status(400).json({ msg: 'nao foi possivel atender a sua solicitacao' });
    }
  };
  

  exports.Delete = async (req, res) => {
    const id = req.params.id  
  try {
      try {
        const hasAppraisal = await db.pgSelect('appraisal', {id:id});
        if (Object.values(hasAppraisal).length > 0) {
          const resp = await db.pgDelete('appraisal', {id:id});
          return res.status(204).json({msg:'atualizado com sucesso', data:resp});
        } else {
          throw new Error('avaliação não existe');
        }
      } catch (error) {
        throw new Error("avaliação não existe");
      }
    } catch (error) {
      return res.status(400).json({ msg: 'nao foi possivel atender a sua solicitacao' });
    }
  };