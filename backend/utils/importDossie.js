const fs = require('fs');
const csv = require('csv-parser');

const results = []

// passar rotas
const dossieCsv = 'Dossie.csv';

fs.createReadStream(dossieCsv)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        const jsonresult = JSON.stringify(results, null, 2)
    })
    .on('error', (err) => {
        console.log("Error: ", err.message)
    })