import {api} from './api';

//CRIAR CLASSE
interface CreatePayLoad {
    professor_Id: number,
    name: string,
    description: string,
    season: string,
    institution: string
}

interface CreateResponse {
    msg: string
}

//OBTER CLASSE
interface GetClassroomResponse {
    id: number;
    professor_id: number;
    name: string;
    description: string;
    season: string;
    institution: string;
}

//FUNÇÕES
export const CreateClassroom = async (payLoad: CreatePayLoad): Promise<CreateResponse> => {
    try {
        const response = await api.post('/classroom/create', payLoad);
        return response.data;
    } catch (error:any) {
        const message = error.response?.data || 'Erro ao criar classe';
        throw new Error(message);
    }
}

//buscar uma turma específica
export const GetClassroom = async (id: number): Promise<GetClassroomResponse> => {
    try {
        const response = await api.get(`/classroom/${id}`);
        return response.data[0];
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao buscar turma';
        throw new Error(message);
    }
}

//listar as turmas
export const ListClassroom = async (professorID: number): Promise<GetClassroomResponse[]> => {
    try {
        const response = await api.get(`/classroom/list/${professorID}`);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao listar turmas';
        throw new Error(message);
    }
}

//atualizar uma turma
export const UpdateClassroom = async (id: number, data: {
    name?: string;
    description?: string;
    season?: string;
    institution?: string;
}): Promise<CreateResponse> => {
    try {
        const response = await api.put(`/classroom/${id}/update`, data);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao atualizar turma';
        throw new Error(message);
    }
}

//deletar uma turma
export const DeleteClassroom = async (id: number): Promise<CreateResponse> => {
    try {
        const response = await api.delete(`/classroom/${id}/delete`);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao deletar turma';
        throw new Error(message);
    }
}

//associar um dossiê a uma turma
export const AssociateDossier = async (classId: number, dossierId: number): Promise<CreateResponse> => {
    try {
        const response = await api.put(`/classroom/${classId}/associate-dossier/${dossierId}`);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao associar dossiê';
        throw new Error(message);
    }
}