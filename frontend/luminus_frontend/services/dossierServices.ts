import { api } from './api';

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
  data?: any;
}

export interface Dossier {
  id: number;
  professor_id: number;
  name: string;
  description: string;
  evaluation_method: string;
  sections: {
    id: number;
    name: string;
    description: string;
    weigth: number;
    questions: {
      id: number;
      description: string;
    }[];
  }[];
}

export interface ListDossierResponse {
  msg: string;
  data: Dossier[];
  ammount?: number;
}

export const createDossier = async (payload: CreateDossierPayload): Promise<CreateDossierResponse> => {
  try {
    const response = await api.post('/dossier/create', payload);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const listDossiers = async (
  professorId: number,
  start?: number,
  size?: number
): Promise<ListDossierResponse> => {
  try {
    const params: any = {};
    if (start !== undefined) params.start = start;
    if (size !== undefined) params.size = size;

    const response = await api.get(`/dossier/list/${professorId}`, { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return {
        msg: "Nenhum dossiê encontrado",
        data: []
      };
    }
    const message = error.response?.data?.msg || 'Erro ao listar dossiês';
    throw new Error(message);
  }
};

export const getDossier = async (id: number): Promise<{ msg: string; data: Dossier }> => {
  try {
    const response = await api.get(`/dossier/${id}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao obter dossiê';
    throw new Error(message);
  }
};

export const updateDossier = async (id: number, payload: Partial<CreateDossierPayload>) => {
  try {
    const response = await api.put(`/dossier/${id}/edit`, payload);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao atualizar dossiê';
    throw new Error(message);
  }
};

export const deleteDossier = async (id: number) => {
  try {
    const response = await api.delete(`/dossier/${id}/delete`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao excluir dossiê';
    throw new Error(message);
  }
};
