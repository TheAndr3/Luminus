import {api} from './api';

interface createPayLoad {
    id: number;
    name: string;
    classroomId: number;
}

interface CreateResponse {
    message: string
}


interface StudentGetResponse {
    id: number;
    name: string;
    classroom_id: number;
}

export interface StudentListResponse {
    id: number;
    name: string;
    classroom_id: number;
}

export const CreateStudent = async (payLoad: createPayLoad): Promise<CreateResponse> => {
    try {
        const response = await api.post(`/student/${payLoad.classroomId}/create`, payLoad);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao adicionar estudante';
        throw new Error(message);
    }
}

export const GetStudent = async (studentID: number, classroomID: number): Promise<StudentGetResponse> => {
    try {
        const response = await api.get(`/student/${classroomID}/${studentID}`);
        return response.data[0]
    } catch (error:any) {
        const message = error.response?.data?.msg || 'Erro ao buscar estudante';
        throw new Error(message);
    }
}

export const ListStudents = async (classroomID: number): Promise<StudentListResponse[]> => {
    try {
        const response = await api.get(`/student/${classroomID}/list`);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao listar estudantes';
        throw new Error(message);
        
    }
}