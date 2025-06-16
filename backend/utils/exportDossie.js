const db = require('../bd');
// Importe o Parser da biblioteca json2csv no início do arquivo
const { Parser } = require('json2csv');

exports.ExportToCsv = async(req, res) => {
    const dossierId = req.params.id;

    try {
        //  Busca os dados completos do dossiê no banco de dados.
        //    Estou usando a sua função `pgDossieSelect` que já busca o dossiê com suas seções e questões.
        const dossier = await db.pgDossieSelect(dossierId);

        if (!dossier) {
            return res.status(404).json({ msg: 'Dossiê não encontrado' });
        }

        //  Transforma a estrutura de dados aninhada para uma lista "plana".
        //    O CSV funciona melhor com uma lista simples de objetos.
        const flattenedData = [];
        dossier.sections.forEach(section => {
            section.questions.forEach(question => {
                flattenedData.push({
                    dossier_nome: dossier.name,
                    dossier_descricao: dossier.description,
                    secao_nome: section.name,
                    secao_peso: section.weigth,
                    questao_descricao: question.description
                });
            });
        });

        // Se não houver dados para exportar, retorna uma mensagem.
        if (flattenedData.length === 0) {
            return res.status(200).send('O dossiê não possui seções ou questões para exportar.');
        }

        // Define as colunas do arquivo CSV e converte os dados.
        const fields = ['dossier_nome', 'dossier_descricao', 'secao_nome', 'secao_peso', 'questao_descricao'];
        const parser = new Parser({ fields });
        const csv = parser.parse(flattenedData);

        // Envia o arquivo CSV como resposta para o navegador.
        res.header('Content-Type', 'text/csv');
        res.attachment(`dossie-${dossierId}.csv`); // Define o nome do arquivo para download.
        return res.send(csv);

    } catch (error) {
        console.error('Erro ao exportar dossiê para CSV:', error);
        return res.status(500).json({ msg: 'Erro interno no servidor ao tentar exportar o dossiê.' });
    }
};