const db = require('../bd');
const { Parser } = require('json2csv');

exports.ExportToCsv = async(req, res) => {
    const dossierId = req.params.id;

    try {
        // Busca os dados completos do dossiê no banco de dados.
        // A função `pgDossieSelect` retorna um array de objetos, onde o dossiê está em 'dossier[0].dossier'.
        const result = await db.pgDossieSelect(dossierId);

        // Verifica se o dossiê foi encontrado e extrai o objeto de dossiê real.
        if (!result || result.length === 0 || !result[0].dossier) {
            return res.status(404).json({ msg: 'Dossiê não encontrado' });
        }

        const dossier = result[0].dossier; // Acessa o objeto do dossiê

        // Transforma a estrutura de dados aninhada para uma lista "plana".
        const flattenedData = [];

        // Verifica se 'sections' existe antes de iterar, pois pode ser nulo se não houver seções
        if (dossier.sections) {
            dossier.sections.forEach(section => {
                // Verifica se 'questions' existe antes de iterar
                if (section.questions) {
                    section.questions.forEach(question => {
                        flattenedData.push({
                            dossier_id: dossier.id, // Adicionado ID do dossiê para referência
                            dossier_nome: dossier.name,
                            dossier_descricao: dossier.description,
                            dossier_evaluation_method_id: dossier.evaluationMethodId, // Novo campo
                            secao_id: section.id, // Adicionado ID da seção
                            secao_nome: section.name,
                            secao_descricao: section.description, // Novo campo
                            secao_peso: section.weigth,
                            questao_id: question.id, // Adicionado ID da questão
                            questao_nome: question.name, // Novo campo: nome da questão
                            questao_descricao: question.description,
                            questao_evaluation_method_id: question.evaluationMethodId // Novo campo: ID do método de avaliação da questão
                        });
                    });
                }
            });
        }


        // Se não houver dados para exportar, retorna uma mensagem.
        if (flattenedData.length === 0) {
            return res.status(200).send('O dossiê não possui seções ou questões para exportar.');
        }

        // Define as colunas do arquivo CSV, incluindo os novos campos.
        const fields = [
            'dossier_id',
            'dossier_nome',
            'dossier_descricao',
            'dossier_evaluation_method_id',
            'secao_id',
            'secao_nome',
            'secao_descricao',
            'secao_peso',
            'questao_id',
            'questao_nome',
            'questao_descricao',
            'questao_evaluation_method_id'
        ];
        const parser = new Parser({ fields });
        const csv = parser.parse(flattenedData);

        // Envia o arquivo CSV como resposta para o navegador.
        res.header('Content-Type', 'text/csv');
        res.attachment(`dossie-${dossier.name}-${dossierId}.csv`); // Nome do arquivo mais descritivo
        return res.send(csv);

    } catch (error) {
        console.error('Erro ao exportar dossiê para CSV:', error);
        return res.status(500).json({ msg: 'Erro interno no servidor ao tentar exportar o dossiê.' });
    }
};