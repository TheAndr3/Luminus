const db = require('../bd');

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
    const id = req.params.id;
    const class_id = req.params.classid;
    res.status(200).send(`Rota de editar turma ${id}`);
}

exports.Delete = async (req, res) => {
    const id = req.params.id;
    const class_id = req.params.classid;
    res.status(204).send(); 
}

exports.ImportCsv = async (req, res) => {
    const class_id = req.params.class_id;
    res.status(201).send("Rota de criar turma");
}