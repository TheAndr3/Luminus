import {api} from './api';
import { encryptWithPublicKey } from '../utils/crypto';

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
    msg: string;
}


//FUNÇÕES
export const LoginProfessor = async (payLoad: LoginPayLoad): Promise<LoginResponse> => {
    try {
      // 1. Buscar chave pública
      const publicKey = await getPublicKey();

      // 2. Criptografar senha
      const encryptedPassword = await encryptWithPublicKey(publicKey, payLoad.password);

      // 3. Enviar para backend
      const response = await api.post('/professor/login', {
        email: payLoad.email_professor,
        password: encryptedPassword
      });

      return response.data.professor;
    } catch (error: any) {
      const message = error.response?.data || 'Erro ao fazer login';
      throw new Error(message);
    }
}

export const RegisterProfessor = async (payLoad: CreatePayLoad): Promise<CreateResponse> => {
    try {
      // 1. Buscar chave pública
      const publicKey = await getPublicKey();

      // 2. Criptografar senha
      const encryptedPassword = await encryptWithPublicKey(publicKey, payLoad.password);

      // 3. Enviar para backend
      const response = await api.post('/professor/login', {
        email: payLoad.email_professor,
        password: encryptedPassword,
        name: payLoad.name
      });
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
      const publicKey = await getPublicKey();
      const encryptedPassword = await encryptWithPublicKey(publicKey, payload.newPass);

      const response = await api.post(`/professor/new-password/${token}`, {
          newPass: encryptedPassword,
          email: payload.email
      });

      return response.data;
  } catch (error: any) {
      const message = error.response?.data?.msg || 'Erro ao trocar a senha';
      throw new Error(message);
  }
}
  
  
  

