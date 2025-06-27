import { api } from './api';

export const ExportDossierToCsv = async (dossierId: number): Promise<string> => {
  try {
    const response = await api.get(`/dossier/export/${dossierId}`, {
      responseType: 'blob'
    });

    // Retorna o conteúdo do CSV como texto
    return response.data;

  } catch (error: any) {
    const message = error.response?.data?.msg || 'Erro ao exportar o dossiê para CSV';
    throw new Error(message);
  }
};
