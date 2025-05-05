const db = require('../models');
const Student = db.Student;

exports.ImportCsv = async(req, res) => {
    const classId = req.params.classid;
    const students = req.body;

    if (!Array.isArray(students)) {
        return res.status(400).json({ error: 'Dados inválidos. Esperado um array de alunos.' });
    }

    try {
        const alunosCriados = [];

        for (const aluno of students) {
            if (!aluno.nome || !aluno.matricula) {
                continue;
            }

            const novoAluno = await Student.create({
                nome: aluno.nome,
                matricula: aluno.matricula,
                turmaId: classId,
            });

            alunosCriados.push(novoAluno);
        }

        res.status(201).json({ message: 'Alunos importados com sucesso.', alunos: alunosCriados });
    } catch (error) {
        console.error('Erro ao importar alunos:', error);
        res.status(500).json({ error: 'Erro interno ao importar alunos.' });
    }
};