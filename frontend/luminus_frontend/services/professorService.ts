
import { api } from './api';
import { encryptWithPublicKey } from '../utils/crypto';

// LOGIN
interface LoginPayLoad {
  email_professor: string,
  password: string
}

// Interface que reflete EXATAMENTE o objeto 'data' do backend
interface LoginResponseData { // Renomeei para ser mais claro
  id: number;
  nome: string;
  email: string; // O backend envia 'email', não 'email_professor'
}

// CADASTRO
export interface CreatePayLoad {
  email_professor: string,
  password: string,
  name: string
}

interface CreateResponse {
  message: string
}

// RECUPERAR SENHA
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

// FUNÇÕES

//Login
export const LoginProfessor = async (payLoad: LoginPayLoad): Promise<LoginResponseData> => { // Altere o tipo de retorno aqui
  try {
    //pegar chave pública
    const publicKey = await getPublicKey();

    //encriptar senha
    const encryptedPassword = await encryptWithPublicKey(publicKey, payLoad.password);

    //enviar dados na rota
    const response = await api.post('professor/login', {
      ...payLoad,
      password: encryptedPassword
    });

    if (!response.data || !response.data.data) {
        throw new Error("Resposta de login inesperada do servidor.");
    }

    // Retorna o objeto 'data' do backend
    return response.data.data;

  } catch (error: any) {

    const message = error.response?.data?.msg || 'Erro ao fazer login'; 
    throw new Error(message);
  }
}

//Cadastrar
export const RegisterProfessor = async (payLoad: CreatePayLoad): Promise<CreateResponse> => {
  try {
    //pegar chave pública
    const publicKey = await getPublicKey();

    //encriptar senha
    const encryptedPassword = await encryptWithPublicKey(publicKey, payLoad.password);

    //enviar dados na rota
    const response = await api.post('/professor/register', {
      ...payLoad,
      password: encryptedPassword,
    });
    return response.data;

  } catch (error: any) {
    const message = error.response?.data?.message || 'Erro ao cadastrar';
    throw new Error(message);
  }
}

//Pegar chave pública
export const getPublicKey = async (): Promise<string> => {
  try {
    const response = await api.get('/professor/public-key');
    return response.data.publicKey;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Erro ao buscar a chave pública';
    throw new Error(message);
  }
}

//Recuperar senha
export const RecoverPassword = async (payload: RecoverPasswordPayLoad): Promise<RecoverPasswordResponse> => {
  try {
    const response = await api.post('/professor/recover-password', payload);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao enviar solicitação';
    throw new Error(message);
  }
}

//Enviar recuperação de email
export const SendRecoveryEmail = async (email: string): Promise<string> => {
  try {
    const response = await api.get(`/professor/send-email/${email}`);
    return response.data.msg;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao enviar email';
    throw new Error(message);
  }
}

//atualizar senha
export const UpdatePassword = async (payload: NewPasswordPayLoad, token: string): Promise<NewPasswordResponse> => {
  try {
    const response = await api.post(`/professor/new-password/${token}`, payload);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao trocar a senha';
    throw new Error(message);
  }
}
