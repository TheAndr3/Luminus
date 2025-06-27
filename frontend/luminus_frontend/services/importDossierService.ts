import axios from 'axios';
import { api } from './api';

// Tipagem das questões
interface Question {
  name: string;
  description: string;
  evaluationMethodId: number;
}

// Tipagem das seções
interface Section {
  name: string;
  description: string;
  weigth: number;
  questions: Question[];
}

// Payload para o dossiê
interface ImportDossierPayload {
  name: string;
  customUserId: number;
  description: string;
  evaluationMethodId: number;
  sections: Section[];
}

// Resposta da API ao importar o dossiê
interface ImportDossierResponse {
  msg: string;
  dossierId?: number;
}

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
