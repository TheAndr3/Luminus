import { api } from './api';

// LISTAR estudantes e suas avaliações de uma turma
export const ListStudentsByClass = async (classId: number) => {
  try {
    const response = await api.get(`/appraisal/list/${classId}`);
    const data = response.data;

    if (data.msg === 'sucess') {
      return {
        students: data.data,
        count: data.ammount,
      };
    } else {
      throw new Error('Não há estudantes nessa turma');
    }
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao listar estudantes';
    throw new Error(message);
  }
};

// PEGAR avaliação de um estudante numa turma
export const GetStudentAppraisal = async (classId: number, studentId: number) => {
  try {
    const response = await api.get(`/appraisal/get/${classId}/${studentId}`);
    const data = response.data;

    if (data.msg === 'sucess') {
      return data.data;
    } else {
      throw new Error('Estudante não existe na turma');
    }
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao buscar avaliação';
    throw new Error(message);
  }
};

// PEGAR avaliação COMPLETA por ID, incluindo questões e dados do dossiê
export const GetAppraisalById = async (
  appraisalId: number,
  dossierId: number,
  classId: number
) => {
  try {
    const response = await api.get(`/appraisal/appraisal/${appraisalId}/${dossierId}/${classId}`);
    const data = response.data;

    if (data.msg === 'sucesso') {
      return data.data;
    } else {
      throw new Error('Avaliação não encontrada');
    }
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao buscar avaliação';
    throw new Error(message);
  }
};

// CRIAR avaliação para estudante e turma
export const CreateAppraisal = async (
  classId: number,
  studentId: number,
  professorId: number
) => {
  try {
    const response = await api.post(`/appraisal/create/${classId}/${studentId}`, {
      professor_id: professorId,
    });

    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.msg || 'Erro ao criar avaliação (possivelmente já existe)';
    throw new Error(message);
  }
};

// ATUALIZAR avaliação (inclui reescrita de avaliações e atualização de pontos/data)
export const UpdateAppraisal = async (id: number, data: any) => {
  try {
    const response = await api.put(`/appraisal/update/${id}`, data);
    const respData = response.data;

    if (respData.msg === 'atualizado com sucesso') {
      return respData.data;
    } else {
      throw new Error('Avaliação não existe');
    }
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao atualizar avaliação';
    throw new Error(message);
  }
};

// DELETAR avaliação
export const DeleteAppraisal = async (id: number) => {
  try {
    const response = await api.delete(`/appraisal/delete/${id}`);
    return response.status === 204;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao deletar avaliação';
    throw new Error(message);
  }
};
