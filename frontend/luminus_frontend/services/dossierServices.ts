// dossier.ts (arquivo único com tudo)

export interface Question {
  description: string;
}

export interface Section {
  name: string;
  description: string;
  weigth: number;
  questions: Question[];
}

export interface CreateDossierPayload {
  name: string;
  professor_id: number;
  description: string;
  evaluation_method: string;
  sections: Section[];
}

export interface CreateDossierResponse {
  msg: string;
}

export interface Dossier {
  id: number;
  professor_id: number;
  name: string;
  description: string;
  evaluation_method: string;
}

export interface ListDossierResponse {
  msg: string;
  data: Dossier[];
}

// Funções axios
import { api } from './api';

export const createDossier = async (payload: CreateDossierPayload): Promise<CreateDossierResponse> => {
  try {
    const response = await api.post('/dossiers', payload);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao criar dossiê';
    throw new Error(message);
  }
};

export const listDossiers = async (professorId: number): Promise<ListDossierResponse> => {
  try {
    const response = await api.get(`/dossiers/professor/${professorId}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao listar dossiês';
    throw new Error(message);
  }
};
