import { api } from './api';

// LISTAR estudantes de uma turma
export const ListStudentsByClass = async (classId: string) => {
  try {
    const response = await api.get(`/appraisal/list/${classId}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao listar estudantes';
    throw new Error(message);
  }
}

// PEGAR avaliação de um estudante numa turma
export const GetStudentAppraisal = async (classId: string, studentId: string) => {
  try {
    const response = await api.get(`/appraisal/get/${classId}/${studentId}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao buscar avaliação';
    throw new Error(message);
  }
}

// PEGAR avaliação por ID
export const GetAppraisalById = async (id: string) => {
  try {
    const response = await api.get(`/appraisal/appraisal/${id}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao buscar avaliação';
    throw new Error(message);
  }
}

// CRIAR avaliação para estudante e turma
export const CreateAppraisal = async (
  classId: string,
  studentId: string,
  professorId: number
) => {
  try {
    const response = await api.post(`/appraisal/create/${classId}/${studentId}`, {
      professor_id: professorId,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao criar avaliação';
    throw new Error(message);
  }
}

// ATUALIZAR avaliação
export const UpdateAppraisal = async (id: string, data: any) => {
  try {
    const response = await api.put(`/appraisal/update/${id}`, data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao atualizar avaliação';
    throw new Error(message);
  }
}

// DELETAR avaliação
export const DeleteAppraisal = async (id: string) => {
  try {
    const response = await api.delete(`/appraisal/delete/${id}`);
    return response.status === 204;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao deletar avaliação';
    throw new Error(message);
  }
}
