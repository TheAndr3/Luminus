import {api} from './api';

interface createPayLoad {
    id: number;
    name: string;
    classroomId: number;
}

interface CreateResponse {
    message: string
}


export interface StudentGetResponse {
    id: number;
    name: string;
    classroom_id: number;
}

export interface StudentListResponse {
    id: number;
    name: string;
    classroom_id: number;
}

export const CreateStudent = async (currentTurmaId: number, p0: { matricula: number; nome: string; }, payLoad: createPayLoad): Promise<CreateResponse> => {
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
        // CORRECTED LINE: Access the 'data' property within response.data
        return response.data.data; // O PROBLEMA ESTAVA AQUI, PORQUE A RESPOSTA VINDA DO BACKEND ERA DIFERENTE... ERA SÓ COLOCAR O response.data.data 
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao listar estudantes';
        throw new Error(message);
    }
}

/*
export const ListStudents = async (classroomID: number): Promise<StudentListResponse[]> => {
    try {
        const response = await api.get(`/student/${classroomID}/list`);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao listar estudantes';
        throw new Error(message);
        
    }
}
*/
// Add this to your Luminus/frontend/luminus_frontend/services/studentService.ts file

export const DeleteStudent = async (classroomId: number, studentId: number, professorId: number): Promise<void> => {
    try {
        // The backend expects professor_id in the request body for deletion.
        await api.delete(`/student/${classroomId}/delete/${studentId}`, { data: { professor_id: professorId } });
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao remover estudante';
        throw new Error(message);
    }
}