import { api } from './api';
import {encryptWithPublicKey } from '../utils/crypto';
import { getPublicKey } from '../services/professorService';


interface UpdateProfilePayload {
  name?: string;
  password?: string;
}

interface UpdateProfileResponse {
  message: string;
}

interface DeleteProfileResponse {
  message: string;
}

// Atualizar nome e/ou senha do perfil
export const updateProfile = async (
  userId: number,
  payload: UpdateProfilePayload
): Promise<UpdateProfileResponse> => {
  try {
    const dataToSend: UpdateProfilePayload = { ...payload };

    if (payload.password) {
      const publicKey = await getPublicKey();
      const encryptedPassword = await encryptWithPublicKey(publicKey, payload.password);
      dataToSend.password = encryptedPassword;
    }

    const response = await api.patch(`/profile/${userId}/update`, dataToSend);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || 'Erro ao atualizar perfil.';
    throw new Error(message);
  }
};

// Deletar conta do usuário
export const deleteProfile = async (userId: number): Promise<DeleteProfileResponse> => {
  try {
    const response = await api.delete(`/profile/${userId}/delete`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || 'Erro ao excluir conta.';
    throw new Error(message);
  }
};
