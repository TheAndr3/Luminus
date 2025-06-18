import { api } from './api';

// Criar dossiê completo (com método, tipos, seções e questões)
export const CreateDossier = async (data: {
  name: string;
  costumUser_id: number;
  description: string;
  evaluation_method: { name: string; value: number }[];
  sections: {
    name: string;
    description: string;
    weigth: number;
    questions: { description: string }[];
  }[];
}) => {
  try {
    const response = await api.post('/dossier/create', data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao criar dossiê';
    throw new Error(message);
  }
};

// Listar dossiês de um professor (com paginação e busca)
export const ListDossiersByProfessor = async (
  professorId: number,
  search: string = '',
  start: number = 0,
  size: number = 6
) => {
  try {
    const response = await api.get(`/dossier/list/${professorId}`, {
      params: { search, start, size },
    });

    const data = response.data;
    if (data.msg === 'sucesso') {
      return {
        dossiers: data.data,
        total: data.ammount,
      };
    } else {
      throw new Error('Erro ao listar dossiês');
    }
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao listar dossiês';
    throw new Error(message);
  }
};

// Obter dossiê completo por ID
export const GetDossierById = async (id: number) => {
  try {
    const response = await api.get(`/dossier/${id}`);
    const data = response.data;

    if (data.msg === 'sucesso') {
      return data.data;
    } else {
      throw new Error('Dossiê não encontrado');
    }
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao buscar dossiê';
    throw new Error(message);
  }
};

// Atualizar dossiê (se não estiver associado a turma)
export const UpdateDossier = async (id: number, data: {
  name: string;
  costumUser_id: number;
  description: string;
  evaluation_method: { name: string; value: number }[];
  sections: {
    name: string;
    description: string;
    weigth: number;
    questions: { description: string }[];
  }[];
}) => {
  try {
    const response = await api.put(`/dossier/update/${id}`, data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao atualizar dossiê';
    throw new Error(message);
  }
};

// Deletar dossiê
export const DeleteDossier = async (id: number) => {
  try {
    const response = await api.delete(`/dossier/delete/${id}`);
    return response.status === 204;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao deletar dossiê';
    throw new Error(message);
  }
};
