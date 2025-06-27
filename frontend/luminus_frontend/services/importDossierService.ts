import { api } from './api';

//Tipagem das questões
interface Question {
  name: string;
  description: string;
  evaluationMethodId: number;
}

//Tipagem das seções
interface Section {
  name: string;
  description: string;
  weigth: number;
  questions: Question[];
}

// Tipagem do método de avaliação
interface EvaluationMethod {
  name: string;
  evaluationType: Array<{
    name: string;
    value: number;
  }>;
}

// Payload para o dossiê
interface ImportDossierPayload {
  name: string;
  customUserId: number;
  description: string;
  evaluationMethod: EvaluationMethod;
  sections: Section[];
}

//Resposta da API ao importar o dossiê
interface ImportDossierResponse {
  msg: string;
  dossierId?: number;
}


// Interface para dados CSV
interface CsvRow {
  dossier_id: string;
  dossier_nome: string;
  dossier_descricao: string;
  dossier_evaluation_method_id: string;
  secao_id: string;
  secao_nome: string;
  secao_descricao: string;
  secao_peso: string;
  questao_id: string;
  questao_nome: string;
  questao_descricao: string;
  questao_evaluation_method_id: string;
}

// Função para fazer parse de CSV com suporte a aspas
const parseCSV = (csvContent: string): CsvRow[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header and one data row');
  }

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Adiciona o último valor

    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index].replace(/"/g, '');
      });
      rows.push(row as CsvRow);
    }
  }

  return rows;
};

// Função para converter CSV para o formato esperado pela API
const csvToDossierPayload = (csvContent: string, customUserId: number): ImportDossierPayload => {
  const rows = parseCSV(csvContent);

  if (rows.length === 0) {
    throw new Error('CSV file is empty or invalid');
  }

  // Obtém informações do dossiê da primeira linha
  const firstRow = rows[0];
  const dossierName = firstRow.dossier_nome || 'Dossiê Importado';
  const dossierDescription = firstRow.dossier_descricao || 'Dossiê importado de arquivo CSV';
  const evaluationMethodId = parseInt(firstRow.dossier_evaluation_method_id) || 1;

  // Agrupa as questões por seção
  const sectionsMap = new Map<string, Section>();

  rows.forEach(row => {
    const sectionId = row.secao_id;
    const sectionName = row.secao_nome;
    const sectionDescription = row.secao_descricao;
    const sectionWeight = parseFloat(row.secao_peso) || 0;

    if (!sectionsMap.has(sectionId)) {
      sectionsMap.set(sectionId, {
        name: sectionName,
        description: sectionDescription,
        weigth: sectionWeight,
        questions: []
      });
    }

    const section = sectionsMap.get(sectionId)!;
    section.questions.push({
      name: row.questao_nome,
      description: row.questao_descricao,
      evaluationMethodId: parseInt(row.questao_evaluation_method_id) || evaluationMethodId
    });
  });

  // Cria a estrutura do método de avaliação
  const evaluationMethod: EvaluationMethod = {
    name: `Método ${evaluationMethodId}`,
    evaluationType: [
      { name: 'A', value: 10 },
      { name: 'B', value: 8 },
      { name: 'C', value: 6 },
      { name: 'D', value: 4 },
      { name: 'E', value: 2 },
      { name: 'F', value: 0 }
    ]
  };

  return {
    name: dossierName,
    customUserId,
    description: dossierDescription,
    evaluationMethod,
    sections: Array.from(sectionsMap.values())
  };
};

// Função para importar o dossiê a partir de CSV
export const ImportDossierFromCsv = async (
  csvContent: string,
  customUserId: number
): Promise<ImportDossierResponse> => {
  try {
    const payload = csvToDossierPayload(csvContent, customUserId);
    return await ImportDossier(payload);
  } catch (error: any) {
    throw new Error(`Erro ao processar arquivo CSV: ${error.message}`);
  }
};

// Função para importar o dossiê para a API
export const ImportDossier = async (
  payload: ImportDossierPayload
): Promise<ImportDossierResponse> => {
  try {
    const response = await api.post('/dossier/create', payload);

    if (!response.data) {
      throw new Error('Resposta da API vazia ao importar dossiê.');
    }

    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.msg || 'Erro ao importar o dossiê';
    throw new Error(message);
  }
}; 