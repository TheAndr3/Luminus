import {api} from './api';

interface CreatePayLoad {
    professor_Id: number,
    name: string,
    description: string,
    season: number,
    institution: number
}

interface CreateResponse {
    msg: string
}

interface GetClassroomResponse {
    id: number;
    professor_id: number;
    name: string;
    description: string;
    season: string;
    institution: string;
}

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

export const ListClassroom = async (professorID: number): Promise<GetClassroomResponse[]> => {
    try {
        const response = await api.get(`/classroom/list/${professorID}`);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao listar turmas';
    throw new Error(message);
    }
}

