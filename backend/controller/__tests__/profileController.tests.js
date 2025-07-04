const db = require('../../bd.js');
const { hashPassword, decryptPassword } = require('../../utils/passwordManagement.js');
const profileController = require('../profileController.js');

// Mock dotenv to prevent it from loading actual .env files during tests
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

jest.mock('../../bd.js', () => ({
  pgDelete: jest.fn(),
  pgSelect: jest.fn(),
  pgUpdate: jest.fn(),
}));

jest.mock('../../utils/passwordManagement.js', () => ({
  hashPassword: jest.fn(),
  decryptPassword: jest.fn(),
}));

describe('profileController', () => {
  let mockReq;
  let mockRes;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // Testes para a função Delete
  describe('Delete', () => {
    test('deve retornar status 200 e mensagem de sucesso ao excluir a conta', async () => {
      mockReq.params = { id: 1 };
      db.pgDelete.mockResolvedValueOnce({});

      await profileController.Delete(mockReq, mockRes);

      expect(db.pgDelete).toHaveBeenCalledWith('CustomUser', { id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Sua conta foi excluída com sucesso.' });
    });

    test('deve retornar status 401 se o ID do usuário estiver faltando', async () => {
      mockReq.params = {}; // ID faltando

      await profileController.Delete(mockReq, mockRes);

      expect(db.pgDelete).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Usuário não autenticado.' });
    });

    test('deve retornar status 500 em caso de erro no banco de dados', async () => {
      mockReq.params = { id: 1 };
      db.pgDelete.mockRejectedValueOnce(new Error('Database error'));

      await profileController.Delete(mockReq, mockRes);

      expect(db.pgDelete).toHaveBeenCalledWith('CustomUser', { id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ err: 'Erro interno do servidor ao tentar excluir a conta.' });
    });
  });

  // Testes para a função Update
  describe('Update', () => {
    const existingUser = { id: 1, name: 'Old Name', password: 'oldHashedPassword' };

    test('deve retornar status 200 e mensagem de sucesso ao atualizar apenas o nome', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { name: 'New Name' };
      db.pgSelect.mockResolvedValueOnce([existingUser]);
      db.pgUpdate.mockResolvedValueOnce({});

      await profileController.Update(mockReq, mockRes);

      expect(db.pgSelect).toHaveBeenCalledWith('CustomUser', { id: 1 });
      expect(db.pgUpdate).toHaveBeenCalledWith('CustomUser', { name: 'New Name' }, { id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Perfil atualizado com sucesso!' });
    });

    test('deve retornar status 200 e mensagem de sucesso ao atualizar apenas a senha', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { password: 'newPassword123' };
      decryptPassword.mockResolvedValueOnce('decryptedNewPassword');
      hashPassword.mockResolvedValueOnce('newHashedPassword');
      db.pgSelect.mockResolvedValueOnce([existingUser]);
      db.pgUpdate.mockResolvedValueOnce({});

      await profileController.Update(mockReq, mockRes);

      expect(db.pgSelect).toHaveBeenCalledWith('CustomUser', { id: 1 });
      expect(decryptPassword).toHaveBeenCalledWith('newPassword123');
      expect(hashPassword).toHaveBeenCalledWith('decryptedNewPassword');
      expect(db.pgUpdate).toHaveBeenCalledWith('CustomUser', { password: 'newHashedPassword' }, { id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Perfil atualizado com sucesso!' });
    });

    test('deve retornar status 200 e mensagem de sucesso ao atualizar nome e senha', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { name: 'Updated Name', password: 'updatedPassword123' };
      decryptPassword.mockResolvedValueOnce('decryptedUpdatedPassword');
      hashPassword.mockResolvedValueOnce('updatedHashedPassword');
      db.pgSelect.mockResolvedValueOnce([existingUser]);
      db.pgUpdate.mockResolvedValueOnce({});

      await profileController.Update(mockReq, mockRes);

      expect(db.pgSelect).toHaveBeenCalledWith('CustomUser', { id: 1 });
      expect(decryptPassword).toHaveBeenCalledWith('updatedPassword123');
      expect(hashPassword).toHaveBeenCalledWith('decryptedUpdatedPassword');
      expect(db.pgUpdate).toHaveBeenCalledWith('CustomUser', { name: 'Updated Name', password: 'updatedHashedPassword' }, { id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Perfil atualizado com sucesso!' });
    });

    test('deve retornar status 200 e mensagem de sucesso se nenhum campo for fornecido (nenhuma alteração)', async () => {
        mockReq.params = { id: 1 };
        mockReq.body = {}; // Nenhum campo para atualizar
        db.pgSelect.mockResolvedValueOnce([existingUser]);
        db.pgUpdate.mockResolvedValueOnce({}); // pgUpdate será chamado com payload vazio

        await profileController.Update(mockReq, mockRes);

        expect(db.pgSelect).toHaveBeenCalledWith('CustomUser', { id: 1 });
        expect(decryptPassword).not.toHaveBeenCalled();
        expect(hashPassword).not.toHaveBeenCalled();
        expect(db.pgUpdate).toHaveBeenCalledWith('CustomUser', {}, { id: 1 }); // Payload vazio esperado
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Perfil atualizado com sucesso!' });
    });

    test('deve retornar status 401 se o ID do usuário estiver faltando', async () => {
      mockReq.params = {}; // ID faltando
      mockReq.body = { name: 'New Name' };

      await profileController.Update(mockReq, mockRes);

      expect(db.pgSelect).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });

    test('deve retornar status 404 se o usuário não for encontrado no banco de dados', async () => {
      mockReq.params = { id: 999 };
      mockReq.body = { name: 'New Name' };
      db.pgSelect.mockResolvedValueOnce([]); // Usuário não encontrado

      await profileController.Update(mockReq, mockRes);

      expect(db.pgSelect).toHaveBeenCalledWith('CustomUser', { id: 999 });
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado.' });
    });

    test('deve retornar status 500 em caso de erro no banco de dados durante a atualização', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { name: 'New Name' };
      db.pgSelect.mockResolvedValueOnce([existingUser]);
      db.pgUpdate.mockRejectedValueOnce(new Error('Database error during update'));

      await profileController.Update(mockReq, mockRes);

      expect(db.pgUpdate).toHaveBeenCalledWith('CustomUser', { name: 'New Name' }, { id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Erro interno do servidor ao tentar atualizar o perfil.' });
    });

    test('deve retornar status 500 em caso de erro ao buscar usuário no banco de dados', async () => {
        mockReq.params = { id: 1 };
        mockReq.body = { name: 'New Name' };
        db.pgSelect.mockRejectedValueOnce(new Error('Database error during select'));

        await profileController.Update(mockReq, mockRes);

        expect(db.pgSelect).toHaveBeenCalledWith('CustomUser', { id: 1 });
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Erro interno do servidor ao tentar atualizar o perfil.' });
    });
  });
});