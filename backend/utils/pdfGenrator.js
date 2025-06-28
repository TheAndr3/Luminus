const { default: puppeteer } = require('puppeteer');
const db = require('../bd');
const pdf = require('puppeteer');

/**
 * Converte os dados de um dossiê (com respostas) em uma tabela HTML.
 * @param {Object} dossierData - O objeto do dossiê com seções, perguntas e respostas.
 * @param {string} studentName - O nome do estudante.
 * @returns {string} String HTML formatada.
 */
function dossierToHtml(dossierData, studentName, appraisal) {
    let html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Dossiê de ${studentName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
           .tabela-vertical {
      width: 100%;
      /* A propriedade MAIS IMPORTANTE: une as bordas das células em uma só */
      border-collapse: collapse; 
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      background-color: #ffffff;
      justify-itens:center;
      align-itens:center;
    }

    /* Estilo para TODAS as células (cabeçalho <th> e dados <td>) */
    .tabela-vertical th,
    .tabela-vertical td {
      padding: 12px 15px; /* Espaçamento interno para o conteúdo não colar na borda */
      text-align: left;
      
      
      /* AQUI ESTÁ A MÁGICA: Adiciona uma borda à esquerda de CADA célula */
      border-left: 1px solid #cccccc;
    }

    /* Remove a borda esquerda da PRIMEIRA célula de cada linha (cabeçalho e dados) */
    .tabela-vertical th:first-child,
    .tabela-vertical td:first-child {
      border-left: none;
    }

    /* Estilos específicos para o cabeçalho da tabela */
    .tabela-vertical thead th {
      background-color: #007bff;
      color: #ffffff;
      font-weight: bold;
      text-align:center;
      
    }

    /* Estilo para as linhas do corpo da tabela */
    .tabela-vertical tbody tr {
      border-top: 1px solid #dddddd; /* Linha horizontal para separar as linhas */
    }
    
    /* Efeito de "zebra" para melhor legibilidade nas linhas do corpo */
    .tabela-vertical tbody tr:nth-of-type(even) {
      background-color: #f9f9f9;
    }
    .section-header-row td {
        background-color: #f2f2f2; /* Um cinza claro para diferenciar */
        font-weight: bold;
        padding-top: 20px;
        border-top: 2px solid #ccc; /* Linha separadora forte acima da seção */
    }
    .section-header-row h3, .section-header-row p {
        margin: 5px 0;
    }
          h1, h2 { color: #333; }
          h1 { text-align: center; justify-itens: center; align-itens:center;}
          .section { 
            margin-top: 40px; 
            border-top: 2px solid #ccc; 
            padding-top: 15px; 
            padding-bottom: 5px;
          }
          .question-block { margin-top: 15px; }
          .question { font-weight: bold; }
          .answer { padding-left: 20px; font-style: italic; color: #555; }


        </style>
      </head>
      <body>
        <h1>Dossiê Avaliativo de ${studentName}</h1>
        <h2 style="text-align: center; justify-itens: center; align-itens:center;">${dossierData.name} </h2><h2 style="text-align: center; justify-itens: center; align-itens:center;"> Pontuação total: ${appraisal.total_points}</h2>
        <p>${dossierData.description}</p>
  `;

    const answerMap = new Map();
    if (appraisal && appraisal.answers) {
        appraisal.answers.forEach(answer => {
            answerMap.set(answer.question_id, answer.question_option_id);
        });
    }

    // Identifica apenas os tipos de avaliação que foram realmente usados
    const allMethods = dossierData.evaluation_method.evaluationType;
    const usedOptionIds = new Set(answerMap.values());
    const usedMethods = allMethods.filter(method => usedOptionIds.has(method.id));

    // Ordena os métodos usados pelo valor, do maior para o menor
    usedMethods.sort((a, b) => b.value - a.value);

    const sections = Object.values(dossierData.sections);
    sections.forEach(section => {
        html += `<div class="section">`;
        html += `<h3>${section.name} (Peso: ${section.weigth}%)</h3>`;
        html += `<p>${section.description}</p>`;
        
        html += `<table class="tabela-vertical">`;
        html += `<thead>`;
        html += `<tr>`;
        html += `<th>Pergunta</th>`;
        // O cabeçalho agora só contém as opções usadas
        usedMethods.forEach(method => {
            html += `<th>${method.name} (${method.value})</th>`;
        });
        html += `</tr>`;
        html += `</thead>`;
        html += `<tbody>`;

        const questions = Object.values(section.questions);
        questions.forEach(question => {
            const selectedOptionId = answerMap.get(question.id);
            
            // Só exibe a linha da pergunta se ela foi respondida
            if (selectedOptionId !== undefined) {
                html += `<tr>`;
                html += `<td><p class="question">${question.name}</p></td>`;
                
                // Marca 'X' na coluna correspondente
                usedMethods.forEach(method => {
                    const isSelected = method.id === selectedOptionId;
                    html += `<td style="text-align: center; font-size: 28px; font-weight: bold;">${isSelected ? 'X' : ''}</td>`;
                });
                html += `</tr>`;
            }
        });

        html += `</tbody>`;
        html += `</table>`;
        html += `</div>`;
    });

    html += `</body></html>`;
    return html;
}


// Nova função para gerar o PDF
exports.GeneratePdf = async(req, res) => {
    const classId = req.params.classId;
    const dossierId = req.params.dossierId;
    const studentId = req.params.studentId; 

    try {
        let browser = null;

        browser = await puppeteer.launch({
            headless:true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })

        const page = await browser.newPage();

        // 1. Buscar todos os dados necessários em paralelo
        const [dossierData, appraisal, studentResult] = await Promise.all([
            db.pgDossieSelect(dossierId),
            db.pgAppraisalSelect(studentId, dossierId, classId),
            db.pgSelect('student', { id: studentId })
        ]);

        if (!dossierData) {
            return res.status(404).json({ msg: 'Dossiê não encontrado.' });
        }
        if (!appraisal) {
            return res.status(404).json({ msg: 'Avaliação não encontrada para este aluno.' });
        }
        if (!studentResult || studentResult.length === 0) {
            return res.status(404).json({ msg: 'Aluno não encontrado.' });
        }
        
        // --- Início da Lógica de Cálculo de Pontos ---
        const methodMap = new Map();
        dossierData.evaluation_method.evaluationType.forEach(method => {
            methodMap.set(method.id, method.value);
        });

        const answerMap = new Map();
        if (appraisal && appraisal.answers) {
            appraisal.answers.forEach(answer => {
                answerMap.set(answer.question_id, answer.question_option_id);
            });
        }

        let totalPoints = 0;
        const sections = Object.values(dossierData.sections);

        sections.forEach(section => {
            const questions = Object.values(section.questions);
            let sectionScore = 0;
            const questionCount = questions.length;

            if (questionCount > 0) {
                questions.forEach(question => {
                    const optionId = answerMap.get(question.id);
                    if (optionId !== undefined) {
                        const value = methodMap.get(optionId);
                        if (value !== undefined) {
                            sectionScore += value;
                        }
                    }
                });
                
                const sectionAverage = sectionScore / questionCount;
                const weightedSectionScore = sectionAverage * (section.weigth / 100);
                totalPoints += weightedSectionScore;
            }
        });

        appraisal.total_points = totalPoints.toFixed(2);
        // --- Fim da Lógica de Cálculo de Pontos ---

        const studentName = studentResult[0].name;

        // 3. Gerar o HTML
        const htmlContent = dossierToHtml(dossierData, studentName, appraisal);
        page.setContent(htmlContent);


        // 4. Configurar e criar o PDF
        const pdfBuffer =  await page.pdf({
            format: 'A4',
            printBackground: true,
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
        });

        const nomeArquivo = `relatorio-${Date.now()}.pdf`;

    // 1. Definir o Content-Type para indicar que é um PDF
    res.setHeader('Content-Type', 'application/pdf');

    // 2. Definir o Content-Disposition como "attachment" para forçar o download
    //    Isso é o que faz a caixa de "Salvar como..." aparecer.
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
        res.send(pdfBuffer);
        await browser.close();
        return res;

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Falha ao gerar o relatório do dossiê.' });
    }
};
