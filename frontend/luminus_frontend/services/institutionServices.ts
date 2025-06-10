// services/institution.ts

import { api } from './api'; 
import { encryptWithPublicKey } from '../utils/crypto'; 

interface InstitutionLoginPayload {
  email: string;
  password: string;
}

interface InstitutionLoginResponse {
  message: string;
  instituicao: {
    id: number;
    nome: string;
    email: string;
  };
}

interface InstitutionRegisterPayload {
  email: string;
  password: string;
  name: string;
}

interface InstitutionRegisterResponse {
  message: string;
}

// Função para pegar a chave pública da instituição
export const getInstitutionPublicKey = async (): Promise<string> => {
  try {
    const response = await api.get('/institution/public-key');
    return response.data.publicKey;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Erro ao buscar a chave pública da instituição';
    throw new Error(message);
  }
};

// Função para login da instituição
export const loginInstitution = async (
  payload: InstitutionLoginPayload
): Promise<InstitutionLoginResponse> => {
  try {
    const publicKey = await getInstitutionPublicKey();
    const encryptedPassword = await encryptWithPublicKey(publicKey, payload.password);

    const response = await api.post('/institution/login', {
      ...payload,
      password: encryptedPassword,
    });

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Erro ao realizar login da instituição';
    throw new Error(message);
  }
};

// Função para cadastrar instituição
export const registerInstitution = async (
  payload: InstitutionRegisterPayload
): Promise<InstitutionRegisterResponse> => {
  try {
    const publicKey = await getInstitutionPublicKey();
    const encryptedPassword = await encryptWithPublicKey(publicKey, payload.password);

    const response = await api.post('/institution/register', {
      ...payload,
      password: encryptedPassword,
    });

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Erro ao cadastrar instituição';
    throw new Error(message);
  }
};
