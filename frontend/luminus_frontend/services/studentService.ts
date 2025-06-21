import {api} from './api';

interface createPayLoad {
    id: number;
    name: string;
    customUserId: number;
}

interface CreateResponse {
    message: string
}


export interface StudentGetResponse {
    studentId: number;
    name: string;
    matricula: number;
}

export interface StudentListResponse {
    studentId: number;
    name: string;
    matricula: number;
}

export const CreateStudent = async (currentTurmaId: number, p0: { matricula: number; nome: string; }, payLoad: createPayLoad): Promise<CreateResponse> => {
    try {
        const response = await api.post(`/student/${currentTurmaId}/create`, payLoad);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao adicionar estudante';
        throw new Error(message);
    }
}

export const GetStudent = async (studentID: number, classroomID: number): Promise<StudentGetResponse> => {
    try {
        const response = await api.get(`/student/${classroomID}/${studentID}`);
        return response.data.data[0] || response.data[0];
    } catch (error:any) {
        const message = error.response?.data?.msg || 'Erro ao buscar estudante';
        throw new Error(message);
    }
}

export const ListStudents = async (classroomID: number): Promise<StudentListResponse[]> => {
    try {
        const response = await api.get(`/student/${classroomID}/list`);
        return response.data.data;
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao listar estudantes';
        throw new Error(message);
        
    }
}

export const DeleteStudent = async (classroomID: number, studentID: number, customUserId: number): Promise<CreateResponse> => {
    try {
        const response = await api.delete(`/student/${classroomID}/delete/${studentID}`, {
            data: { customUserId: customUserId }
        });
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao deletar estudante';
        throw new Error(message);
    }
}

export const UpdateStudent = async (classroomID: number, studentID: number, updateData: { id: number; name: string }): Promise<CreateResponse> => {
    try {
        const response = await api.put(`/student/${classroomID}/update/${studentID}`, updateData);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao atualizar estudante';
        throw new Error(message);
    }
}