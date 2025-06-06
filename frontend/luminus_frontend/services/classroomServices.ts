import {api} from './api';

// Interface para os dados da turma (sem o CSV, já que ele vai no FormData)
interface ClassroomData {
    professor_id: number | string;
    name: string;
    description: string;
    season: string;
    institution: string;
}

interface CreateResponse {
    msg: string
}

type UpdateData = {
    professor_id: number;
    name?: string;
    description?: string;
    season?: string;
    institution?: string;
};

// Interface para a resposta da API ao buscar UMA turma
export interface GetClassroomResponse {
    id: number;
    name: string;
    season: string;
    description: string;
    professor_id?: number;
    institution?: string;
    dossier_id?: number;
    dossier_professor_id?: number;
}

//OBTER CLASSE
export interface ListClassroomResponse {
    msg: string;
    data: GetClassroomResponse[];
    ammount: number;
}

export interface DeleteClassroomResponse {
    msg: string;
}

//FUNÇÕES
export const CreateClassroom = async (payload: ClassroomData): Promise<CreateResponse> => {
    console.log('Entrou na função CreateClassroom');
    try {
        const response = await api.post('/classroom/create', payload);
        console.log('Saiu com sucesso');
        return response.data;
    } catch (error: any) {
        const message = error.response?.data || 'Erro ao criar classe';
        console.log('Saiu  com erro:', message);
        throw new Error(message);
    }
};


export const CreateClassroomWithCSV = async (formData: FormData): Promise<CreateResponse> => {
    try {
        const response = await api.post('/classroom/create-with-csv', formData, {
        });
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao criar turma com CSV';
        throw new Error(message);
    }
};

// buscar uma turma específica
export const GetClassroom = async (id: number): Promise<GetClassroomResponse> => {
    try {
        const response = await api.get(`/classroom/${id}`);
        if (
            response.data &&
            response.data.data &&
            Array.isArray(response.data.data) &&
            response.data.data.length > 0
        ) {
            return response.data.data[0];
        } else if (
            response.data &&
            response.data.data &&
            Array.isArray(response.data.data) &&
            response.data.data.length === 0
        ) {
            throw new Error(`Turma com ID ${id} não encontrada.`);
        } else {
            console.error("GetClassroom: Resposta inesperada da API:", response.data);
            throw new Error(`Resposta inesperada da API ao buscar turma com ID ${id}.`);
        }
    } catch (error: any) {
        const apiErrorMessage = error.response?.data?.msg || error.response?.data?.message;
        const message = apiErrorMessage || error.message || `Erro ao buscar turma com ID ${id}.`;
        console.error(`GetClassroom Service Error (ID: ${id}):`, error);
        throw new Error(message);
    }
}

// listar as turmas
export const ListClassroom = async (professorID: number): Promise<ListClassroomResponse> => {
    try {
        const response = await api.get(`/classroom/list/${professorID}`);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao listar turmas';
        throw new Error(message);
    }
}

// atualizar uma turma
export const UpdateClassroom = async (id: number, data: UpdateData): Promise<CreateResponse> => {
    try {
        const response = await api.put(`/classroom/${id}/update`, data);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao atualizar turma';
        throw new Error(message);
    }
}

// deletar uma turma
export const DeleteClassroom = async (id: number, professorId: number): Promise<DeleteClassroomResponse> => {
    try {
        const response = await api.delete(`/classroom/${id}/delete`, {
            data: { professor_id: professorId } 
        });
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao deletar turma';
        throw new Error(message);
    }
};

// associar um dossiê a uma turma
export const AssociateDossier = async (classId: number, dossierId: number): Promise<CreateResponse> => {
    try {
        const response = await api.put(`/classroom/${classId}/associate-dossier/${dossierId}`);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.msg || 'Erro ao associar dossiê';
        throw new Error(message);
    }
}