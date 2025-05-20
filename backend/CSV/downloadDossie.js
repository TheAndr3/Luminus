const db = require('../bd');

async function importDossierFromJson(dossierJson) {
    try {
        const { name, professor_id, description, evaluation_method, sections } = dossierJson;

        // Cria o dossiê
        const dossieResult = await db.pgInsert('dossier', {
            name,
            professor_id,
            description,
            evaluation_method
        });

        const dossierId = dossieResult.rows[0].id;

        // Cria as seções e questões
        for (const section of sections) {
            const sectionResult = await db.pgInsert('section', {
                dossier_id: dossierId,
                professor_id,
                name: section.name,
                description: section.description,
                weigth: section.weigth
            });

            const sectionId = sectionResult.rows[0].id;

            for (const question of section.questions) {
                await db.pgInsert('question', {
                    professor_id,
                    dossier_id: dossierId,
                    section_id: sectionId,
                    description: question.description
                });
            }
        }

        console.log('Dossiê importado com sucesso');
        return { success: true, message: 'Dossiê importado com sucesso' };

    } catch (err) {
        console.error('Erro ao importar dossiê:', err);
        throw new Error('Erro ao importar dossiê');
    }
}

module.exports = { importDossierFromJson };