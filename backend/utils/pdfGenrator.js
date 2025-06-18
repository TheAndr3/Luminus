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
          h1, h2 { color: #333; }
          h1 { text-align: center; justify-itens: center; align-itens:center;}
          .section { margin-top: 40px; border-top: 2px solid #ccc; padding-top: 15px; padding-bottom: 5px;
           /* Sintaxe antiga e mais suportada por renderizadores de PDF */
            page-break-after: avoid; 

            /* Sintaxe moderna (boa prática incluir ambas) */
            break-after: avoid; 
            
            }
          .question-block { margin-top: 15px; }
          .question { font-weight: bold; }
          .answer { padding-left: 20px; font-style: italic; color: #555; }


        </style>
      </head>
      <body>
        <h1>Dossiê Avaliativo de ${studentName}</h1>
        <h2 style="text-align: center; justify-itens: center; align-itens:center;">${dossierData.name} </h2><h2 style="text-align: center; justify-itens: center; align-itens:center;"> Pontuação total: ${appraisal.points}</h2>
        <p>${dossierData.description}</p>
  `;
    const sections = Object.values(dossierData.sections);
    const methods = Object.values(dossierData.ev_method);
    //const question = Object.keys(dossierData.sections);


    methods.sort((a,b) => b.value - a.value);

    sections.forEach(section => {

        html += `<div class="section">`;
        html += `<h3>${section.name} (Peso: ${section.weigth}%) </h3>`;
        html += `<p>${section.description}</p>`;
        html += `<table class="tabela-vertical">`;
        html += `<thead>`
        html += `<tr>`;
        html += `<th>Pergunta</th>`;
        
        methods.forEach(method =>{
            html += `<th>${method.name}</th>`;
        });
        html += `</tr>`;
        html += `</thead>`;
        html += `<tbody>`;

        const questions = Object.values(section.questions);
        

        questions.forEach(question => {
            const questionAppraisal = appraisal.questions[question.id];
            //console.log(questionKey);
            const indexAnswer = methods.findIndex(method => method.id == questionAppraisal.question_option);
            html += `<tr>`;
            html += `<div class="question-block">`;
            html += `<td><p class="question">${question.description}</p></td>`;
            for(let i = 0; i < methods.length; i++){
                html += `<td style="text-align: center;justify-itens:center;align-itens:center;font-size:28px;font-weight: bold;">${(indexAnswer == i ? 'x':'')}</td>`
            }
            html += `</div>`;
            html += `</tr>`;
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
    const dossierId = req.params.id;
    const studentId = req.params.studentId; // Precisamos saber de qual aluno é o dossiê

    try {
        // 1. Buscar os dados do dossiê (perguntas)
        // const dossierResult = await db.pgDossieSelect(dossierId);
        // if (!dossierResult || dossierResult.length === 0) {
        //     return res.status(404).json({ msg: 'Dossiê não encontrado.' });
        // }
        // const dossierData = dossierResult[0].dossier;

        let browser = null;

        browser = await puppeteer.launch({
            headless:true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })

        const page = await browser.newPage();

        //mockup para testes
        const dossierData = {
            name: "Nome do Dossiê",
            description: "Descrição do Dossiê",
            sections: {
                1:{
                    id:1,
                    name:'sessão 1',
                    description:'descrição da sessão 1',
                    weigth:50,
                    questions:{
                        1:{
                            id:1,
                            description:'pergunta 1',
                        },
                        2:{
                            id:2,
                            description:'pergunta 2',
                        },
                        3:{
                            id:3,
                            description:'pergunta 3',
                        },
                        4:{
                            id:4,
                            description:'pergunta 4',
                        }
                    }
                },
                2:{
                    id:2,
                    name:'sessão 2',
                    description:'descrição da sessão 2',
                    weigth:20,
                    questions:{
                        5:{
                            id:5,
                            description:'pergunta 5',
                        },
                        6:{
                            id:6,
                            description:'pergunta 6',
                        },
                        7:{
                            id:7,
                            description:'pergunta 7',
                        }
                    }
                },
                3:{
                    id:3,
                    name:'sessão 3',
                    description:'descrição da sessão 3',
                    weigth:30,
                    questions:{
                        8:{
                            id:8,
                            description:'pergunta 8',
                        },
                        9:{
                            id:9,
                            description:'pergunta 9',
                        },
                    }
                }
            },
            ev_method:{
                4:{
                    id:4,
                    name: 'F',
                    value: 0
                },
                5:{
                    id:5,
                    name: 'C',
                    value: 6
                },
                0:{
                    id:0,
                    name: 'B',
                    value: 8
                },
                3:{
                    id:3,
                    name: 'A',
                    value: 10
                },
                2:{
                    id:2,
                    name: 'D',
                    value: 4
                },
                1:{
                    id:1,
                    name: 'E',
                    value: 2
                }
            },
        }
        const appraisal = {
            points: 9.75,
            questions: {
                1: {
                    question_option: 0
                },
                2: {
                    question_option: 1
                },
                3: {
                    question_option: 2
                },
                4: {
                    question_option: 3
                },

                5: {
                    question_option: 4
                },
                6: {
                    question_option: 5
                },
                7: {
                    question_option: 2
                },
                8: {
                    question_option: 3
                },
                9: {
                    question_option: 1
                }
            }
        }


        const studentName = "Nome do Aluno Exemplo"; // Buscar nome do aluno do DB
        const answers = { /* ... objeto com respostas ... */ };


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