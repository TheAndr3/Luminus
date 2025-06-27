const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');

// --- INÍCIO DA CONFIGURAÇÃO ---
const csvFilePath = 'Dossie.csv'; // Caminho para o seu arquivo CSV
const apiUrl = 'http://localhost:3000/api/dossier/create'; // URL da sua API
const customUserId = 1; // O ID do usuário (que pode ser professor ou instituição)
// --- FIM DA CONFIGURAÇÃO ---

const sections = {};

fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
        // Agrupa as questões por seção
        const sectionName = row.section_name;
        if (!sections[sectionName]) {
            sections[sectionName] = {
                name: sectionName,
                description: row.section_description,
                weigth: parseFloat(row.section_weight),
                questions: []
            };
        }
        sections[sectionName].questions.push({
            name: row.question_name, // Novo campo: nome da questão
            description: row.question_description,
            evaluationMethodId: parseInt(row.question_evaluation_method_id) // Novo campo: ID do método de avaliação
        });
    })
    .on('end', async() => {
        // Quando a leitura do CSV terminar, monta o objeto final do dossiê
        const dossierData = {
            name: 'Dossiê Importado do CSV',
            customUserId: customUserId, // Alterado de professor_id para customUserId
            description: 'Este dossiê foi gerado a partir de um arquivo CSV.',
            evaluationMethodId: 1, // Alterado de evaluation_method para evaluationMethodId
            sections: Object.values(sections) // Converte o objeto de seções em um array
        };

        // Envia os dados para a API
        try {
            const response = await axios.post(apiUrl, dossierData);
            console.log('Dossiê criado com sucesso:', response.data);
        } catch (error) {
            console.error('Erro ao criar o dossiê:', error.response ? error.response.data : error.message);
        }
    })
    .on('error', (err) => {
        console.error('Erro ao ler o arquivo CSV:', err.message);
    });