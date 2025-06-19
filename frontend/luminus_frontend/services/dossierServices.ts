import { api } from './api';

// INTERFACES
export interface Question {
  description: string;
}

export interface Section {
  name: string;
  description: string;
  weigth: number;
  questions: Question[];
}

export interface EvaluationType{
  name: string;
  value: number;
}


export interface EvaluationMethod{
  name: string;
  evaluationType:EvaluationType[];
}

export interface CreateDossierPayload {
  name: string;
  customUserId: number;
  description: string;
  evaluationMethod: EvaluationMethod;
  sections: Section[];
}

export interface DossierResponse {
  msg: string;
  data?: any;
}

export interface Dossier {
  id: number;
  name: string;
  description: string;
  evaluationMethod: string;
  customUserId: number;
}

export interface DossierListResponse {
  msg: string;
  data: Dossier[];
  ammount: number;
}

export interface UpdateDossierPayload {
  id:number
  name: string;
  customUserId: number;
  description: string;
  evaluationMethod: EvaluationMethod;
  sections: Section[];
}

// FUNÇÕES

// Criar dossiê
export const createDossier = async (payload: CreateDossierPayload): Promise<DossierResponse> => {
  try {
    const response = await api.post('/dossier/create', payload);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao criar dossiê';
    throw new Error(message);
  }
};

// Listar dossiês
export const listDossiers = async (professorId: number, start = 0, size = 6, search = ''): Promise<DossierListResponse> => {
  try {
    const response = await api.get(`/dossier/list/${professorId}?start=${start}&size=${size}&search=${encodeURIComponent(search)}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao listar dossiês';
    throw new Error(message);
  }
};

// Obter dossiê por ID
export const getDossierById = async (id: number): Promise<DossierResponse> => {
  try {
    const response = await api.get(`/dossier/${id}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao buscar dossiê';
    throw new Error(message);
  }
};

// Atualizar dossiê
export const updateDossier = async (id: number, payload: UpdateDossierPayload): Promise<DossierResponse> => {
  try {
    const response = await api.put(`/dossier/${id}/edit`, payload);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao atualizar dossiê';
    throw new Error(message);
  }
};

// Deletar dossiê
export const deleteDossier = async (id: number): Promise<DossierResponse> => {
  try {
    const response = await api.delete(`/dossier/${id}/delete`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao deletar dossiê';
    throw new Error(message);
  }
};
