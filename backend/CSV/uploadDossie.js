const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

async function uploadDossie(dossier, req, res) {
    try {
        // Monta os registros para o CSV
        const records = [];

        dossier.sections.forEach(section => {
            section.questions.forEach(question => {
                records.push({
                    dossier_id: dossier.id,
                    dossier_name: dossier.name,
                    section_id: section.id,
                    section_name: section.name,
                    question_id: question.id,
                    question_description: question.description
                });
            });
        });

        const fields = ['dossier_id', 'dossier_name', 'section_id', 'section_name', 'question_id', 'question_description'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(records);

        // Caminho para salvar o CSV
        const folderPath = path.join(__dirname, '..', 'exports');
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        const filePath = path.join(folderPath, `dossier_${dossier.id}.csv`);
        await fs.promises.writeFile(filePath, csv);

        // Construir URL pública para o arquivo
        const fileName = path.basename(filePath);
        const fileUrl = `${req.protocol}://${req.get('host')}/exports/${fileName}`;

        // Envia a resposta HTTP já pronta (JSON com dados + link CSV)
        return res.status(200).json({
            msg: 'sucesso',
            data: dossier,
            csvUrl: fileUrl
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'erro ao gerar CSV' });
    }
}

module.exports = { uploadDossie };