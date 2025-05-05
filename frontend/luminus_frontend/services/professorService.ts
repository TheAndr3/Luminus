import {api} from './api';

//LOGIN
interface LoginPayLoad {
    email_professor: string,
    password:string
}

interface LoginResponse {
    message: string,
    id: number,
    idInstitution: number,
    nome: string,
    email_professor: string
}

//CADASTRO
interface CreatePayLoad {
    email_professor: string,
    password: string,
    name: string
}

interface CreateResponse {
    message: string
}

//RECUPERAR SENHA
interface RecoverPasswordPayLoad {
    email: string, 
    code: number,
}

interface RecoverPasswordResponse {
    msg: string;
    pb_k?: string;
    token?: string;
}

interface NewPasswordPayLoad {
    newPass: string; 
    email: string;    
}

interface NewPasswordResponse {
    msg: string;  // Mensagem de sucesso ou erro
}


//FUNÇÕES
export const LoginProfessor = async (payLoad: LoginPayLoad): Promise<LoginResponse> => {
    try {
      const response = await api.post('professor/login', payLoad);
      return response.data.professor;
    } catch (error: any) {
      const message = error.response?.data || 'Erro ao fazer login';
      throw new Error(message);
    }
}

export const RegisterProfessor = async (payLoad: CreatePayLoad): Promise<CreateResponse> => {
    try {
        const response = await api.post('/professor/register', payLoad);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data || 'Erro ao cadastrar';
        throw new Error(message);
    }
}

export const getPublicKey = async (): Promise<string> => {
    try {
      const response = await api.get('/professor/public-key');
      return response.data.publicKey;
    } catch (error: any) {
      throw new Error('Erro ao buscar a chave pública');
    }
}

export const RecoverPassword = async (payload: RecoverPasswordPayLoad): Promise<RecoverPasswordResponse> => {
    try {
      const response = await api.post('/professor/recover-password', payload);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Erro ao enviar solicitação';
      throw new Error(message);
    }
}

export const SendRecoveryEmail = async (email: string): Promise<string> => {
    try {
      const response = await api.get(`/professor/send-email/${email}`);
      return response.data.msg;
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Erro ao enviar email';
      throw new Error(message);
    }
}

export const UpdatePassword = async (payload: NewPasswordPayLoad, token: string): Promise<NewPasswordResponse> => {
    try {
      const response = await api.post(`/professor/new-password/${token}`, payload);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Erro ao trocar a senha';
      throw new Error(message);
    }
}
  
  
  

