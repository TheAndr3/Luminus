const db = require('../bd');
const pdf = require('html-pdf');

/**
 * Converte os dados de um dossiê (com respostas) em uma tabela HTML.
 * @param {Object} dossierData - O objeto do dossiê com seções, perguntas e respostas.
 * @param {string} studentName - O nome do estudante.
 * @returns {string} String HTML formatada.
 */
function dossierToHtml(dossierData, studentName) {
    let html = `
    <html>
      <head>
        <title>Dossiê de ${studentName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2 { color: #333; }
          h1 { text-align: center; }
          .section { margin-top: 25px; border-top: 2px solid #ccc; padding-top: 15px; }
          .question-block { margin-top: 15px; }
          .question { font-weight: bold; }
          .answer { padding-left: 20px; font-style: italic; color: #555; }
        </style>
      </head>
      <body>
        <h1>Dossiê Avaliativo de ${studentName}</h1>
        <h2>${dossierData.name}</h2>
        <p>${dossierData.description}</p>
  `;

    dossierData.sections.forEach(section => {
        html += `<div class="section">`;
        html += `<h3>${section.name} (Peso: ${section.weigth}%)</h3>`;
        html += `<p>${section.description}</p>`;

        section.questions.forEach(question => {
            html += `<div class="question-block">`;
            html += `<p class="question">${question.description}</p>`;
            // Assumimos que cada objeto 'question' agora tem um campo 'answer'
            html += `<p class="answer">Resposta: ${question.answer || 'Não respondida'}</p>`;
            html += `</div>`;
        });

        html += `</div>`;
    });

    html += `</body></html>`;
    return html;
}

// Nova função para gerar o PDF
exports.GeneratePdf = async(req, res) => {
    const dossierId = req.params.id;
    const studentId = req.params.studentId; // Precisamos saber de qual aluno é o dossiê

    try {
        // 1. Buscar os dados do dossiê (perguntas)
        const dossierResult = await db.pgDossieSelect(dossierId);
        if (!dossierResult || dossierResult.length === 0) {
            return res.status(404).json({ msg: 'Dossiê não encontrado.' });
        }
        const dossierData = dossierResult[0].dossier;


        const studentName = "Nome do Aluno Exemplo"; // Buscar nome do aluno do DB
        const answers = { /* ... objeto com respostas ... */ };

        // Exemplo de como combinar as respostas com as perguntas:
        dossierData.sections.forEach(section => {
            section.questions.forEach(question => {
                // Lógica para encontrar a resposta correspondente à pergunta
                // Exemplo: question.answer = answers[question.id];
                question.answer = `Resposta de exemplo para a pergunta ${question.id}`;
            });
        });

        // 3. Gerar o HTML
        const htmlContent = dossierToHtml(dossierData, studentName);

        // 4. Configurar e criar o PDF
        const options = {
            format: 'A4',
            orientation: "portrait",
            border: {
                top: "1in",
                right: "0.75in",
                bottom: "1in",
                left: "0.75in"
            },
            header: {
                height: "45mm",
                contents: `<div style="text-align: center; font-size: 10px;">Documento Gerado em: ${new Date().toLocaleDateString()}</div>`
            },
            footer: {
                height: "28mm",
                contents: {
                    default: '<div style="text-align: center; font-size: 10px;">Página {{page}} de {{pages}}</div>',
                }
            }
        };

        pdf.create(htmlContent, options).toStream((err, stream) => {
            if (err) {
                console.error("Erro ao criar PDF:", err);
                return res.status(500).send('Erro ao gerar o PDF.');
            }
            res.setHeader('Content-type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=dossie_${studentName.replace(/ /g, '_')}.pdf`);
            stream.pipe(res);
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Falha ao gerar o relatório do dossiê.' });
    }
};