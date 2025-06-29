const db = require('../../bd.js');
const { hashPassword, decryptPassword } = require('../../utils/passwordManagement.js');
const emailSender = require('../../utils/mailSender');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const professorController = require('../professorController.js');

// 👇 Aqui vêm os jest.mocks com caminhos corrigidos
jest.mock('../../bd.js', () => ({
  pgSelect: jest.fn(),
  pgInsert: jest.fn(),
  pgUpdate: jest.fn(),
  pgDelete: jest.fn(),
}));

jest.mock('../../utils/passwordManagement.js', () => ({
  hashPassword: jest.fn(),
  decryptPassword: jest.fn(),
}));

jest.mock('../../utils/mailSender.js', () => ({
  sendEmail: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));


// Mock do process.env para as chaves
process.env.PUBLIC_KEY = 'mocked_public_key';
process.env.TOKEN_KEY = 'mocked_secret_key';

describe('professorController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Resetar todos os mocks antes de cada teste
    jest.clearAllMocks();

    // Objetos mock para request (req) e response (res)
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(), // Permite encadeamento .status().json() ou .status().send()
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  // --- Testes para cada função ---

  // Exemplo de teste para GetPublicKey
  describe('GetPublicKey', () => {
    test('deve retornar a chave pública com status 200', async () => {
      await professorController.GetPublicKey(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ publicKey: 'mocked_public_key' });
    });
  });

  // Exemplo de teste para Login
  describe('Login', () => {
    test('deve retornar status 200 e dados do usuário em login bem-sucedido', async () => {
      mockReq.body = { customUserEmail: 'test@example.com', password: 'encryptedPassword' };
      decryptPassword.mockResolvedValue('plainPassword');
      db.pgSelect.mockResolvedValue([
        { id: 1, email: 'test@example.com', password: 'hashedPassword', role: 'professor', name: 'Professor Teste' },
      ]);
      bcrypt.compare.mockResolvedValue(true);

      await professorController.Login(mockReq, mockRes);

      expect(decryptPassword).toHaveBeenCalledWith('encryptedPassword');
      expect(db.pgSelect).toHaveBeenCalledWith('CustomUser', { email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword', 'hashedPassword');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: 'Login realizado com sucesso',
        data: { id: 1, nome: 'Professor Teste', email: 'test@example.com' },
      });
    });

    test('deve retornar status 404 se o usuário não for encontrado', async () => {
      mockReq.body = { customUserEmail: 'nonexistent@example.com', password: 'anyPassword' };
      decryptPassword.mockResolvedValue('anyPassword');
      db.pgSelect.mockResolvedValue([]); // Usuário não encontrado

      await professorController.Login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Usuário não encontrado' });
    });

    test('deve retornar status 403 se o email não foi confirmado (role unknow)', async () => {
        mockReq.body = { customUserEmail: 'unconfirmed@example.com', password: 'encryptedPassword' };
        decryptPassword.mockResolvedValue('plainPassword');
        db.pgSelect.mockResolvedValue([
          { id: 2, email: 'unconfirmed@example.com', password: 'hashedPassword', role: 'unknow', name: 'Unconfirmed User' },
        ]);
        await professorController.Login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'usuario ainda não confirmou o email, impossivel realizar login' });
    });

    test('deve retornar status 401 para senha incorreta', async () => {
      mockReq.body = { customUserEmail: 'test@example.com', password: 'wrongPassword' };
      decryptPassword.mockResolvedValue('wrongPassword');
      db.pgSelect.mockResolvedValue([
        { id: 1, email: 'test@example.com', password: 'hashedPassword', role: 'professor' },
      ]);
      bcrypt.compare.mockResolvedValue(false); // Senha incorreta

      await professorController.Login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Senha incorreta' });
    });

    test('deve retornar status 500 em caso de erro no servidor', async () => {
      mockReq.body = { customUserEmail: 'test@example.com', password: 'anyPassword' };
      decryptPassword.mockRejectedValue(new Error('Database error')); // Simula um erro

      await professorController.Login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Erro ao realizar login' });
    });
  });

  // Testes para Create (Cadastro)
  describe('Create', () => {
    test('deve criar um novo usuário e enviar e-mail de confirmação', async () => {
      mockReq.body = { customUserEmail: 'newuser@example.com', password: 'pass', name: 'New User' };
      decryptPassword.mockResolvedValue('pass');
      hashPassword.mockResolvedValue('hashedPass');
      db.pgSelect.mockResolvedValueOnce([]).mockResolvedValueOnce([]); // Primeiro para verificar e-mail, segundo para códigos antigos
      db.pgInsert.mockResolvedValueOnce({ rows: [{ id: 100 }] }).mockResolvedValueOnce({}); // Para CustomUser e VerifyCode
      emailSender.sendEmail.mockReturnValue(true);
      jwt.sign.mockReturnValue('mockedToken');

      await professorController.Create(mockReq, mockRes);

      expect(decryptPassword).toHaveBeenCalledWith('pass');
      expect(hashPassword).toHaveBeenCalledWith('pass');
      expect(db.pgSelect).toHaveBeenCalledWith('CustomUser', { email: 'newuser@example.com' });
      expect(db.pgInsert).toHaveBeenCalledWith('CustomUser', {
        email: 'newuser@example.com',
        password: 'hashedPass',
        name: 'New User',
        role: 'unknow',
      });
      expect(emailSender.sendEmail).toHaveBeenCalled(); // Verifica se o e-mail foi enviado
      expect(jwt.sign).toHaveBeenCalled(); // Verifica se o token foi gerado
      expect(db.pgInsert).toHaveBeenCalledWith(
        'verifyCode',
        expect.objectContaining({ customUserId: 100, status: 0 }),
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'email enviado', token: 'mockedToken' });
    });

    test('deve retornar status 403 se campos obrigatórios estiverem faltando', async () => {
      mockReq.body = { customUserEmail: 'test@example.com', password: 'pass' }; // Nome faltando
      await professorController.Create(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Os campos precisam estar preenchidos corretamente' });
    });

    test('deve retornar status 409 se o e-mail já estiver cadastrado', async () => {
      mockReq.body = { customUserEmail: 'existing@example.com', password: 'pass', name: 'Existing User' };
      db.pgSelect.mockResolvedValue([{ id: 1, email: 'existing@example.com' }]); // E-mail já existe

      await professorController.Create(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Esse e-mail já possui um cadastro' });
    });

    test('deve retornar status 500 se houver um erro no banco de dados ao inserir o código de verificação', async () => {
      mockReq.body = { customUserEmail: 'db_error@example.com', password: 'pass', name: 'DB Error User' };
      decryptPassword.mockResolvedValue('pass');
      hashPassword.mockResolvedValue('hashedPass');
      db.pgSelect.mockResolvedValueOnce([]).mockResolvedValueOnce([]); // Email não existe, sem códigos antigos
      db.pgInsert.mockResolvedValueOnce({ rows: [{ id: 101 }] }); // Inserção de CustomUser
      db.pgInsert.mockRejectedValueOnce(new Error('Failed to insert verifyCode')); // Erro ao inserir VerifyCode
      emailSender.sendEmail.mockReturnValue(true);
      jwt.sign.mockReturnValue('mockedToken');

      await professorController.Create(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'falha ao enviar codigo' });
    });
  });

  // Testes para GetProfile
  describe('GetProfile', () => {
    test('deve retornar o perfil do usuário com status 200', async () => {
      mockReq.params = { id: 1 };
      db.pgSelect.mockResolvedValue([{ id: 1, name: 'Professor Teste', email: 'test@example.com' }]);

      await professorController.GetProfile(mockReq, mockRes);

      expect(db.pgSelect).toHaveBeenCalledWith('CustomUser', { id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: 'sucesso',
        data: [{ id: 1, name: 'Professor Teste', email: 'test@example.com' }],
      });
    });

    test('deve retornar status 400 se houver um erro ao buscar o perfil', async () => {
      mockReq.params = { id: 999 };
      db.pgSelect.mockRejectedValue(new Error('Database error'));

      await professorController.GetProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'erro ao buscar perfil' });
    });
  });

  // Testes para Delete
  describe('Delete', () => {
    test('deve retornar status 204', async () => {
      mockReq.params = { id: 1 };
      await professorController.Delete(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });
  });

  // Testes para RecoverPassword
  describe('RecoverPassword', () => {
    test('deve retornar status 200 e token em recuperação de senha bem-sucedida', async () => {
      mockReq.body = { code: '1234', email: 'test@example.com' };
      db.pgSelect.mockResolvedValueOnce([{ id: 1, email: 'test@example.com' }]) // CustomUser
                  .mockResolvedValueOnce([{ status: 0 }]); // VerifyCode
      db.pgUpdate.mockResolvedValue({});
      db.pgInsert.mockResolvedValue({});
      jwt.sign.mockReturnValue('mockedRecoveryToken');

      await professorController.RecoverPassword(mockReq, mockRes);

      expect(db.pgSelect).toHaveBeenCalledWith('CustomUser', { email: 'test@example.com' });
      expect(db.pgSelect).toHaveBeenCalledWith('VerifyCode', {
        code: '1234',
        customUserId: 1,
        requestDate: expect.any(String), // Data atual
      });
      expect(db.pgUpdate).toHaveBeenCalledWith(
        'VerifyCode',
        { status: 1 },
        expect.objectContaining({ customUserId: 1, code: '1234' }),
      );
      expect(db.pgInsert).toHaveBeenCalledWith('TokenCode', {
        token: 'mockedRecoveryToken',
        customUserId: 1,
        verifyStatus: 0,
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'sucesso', pb_k: 'mocked_public_key', token: 'mockedRecoveryToken' });
    });

    test('deve retornar status 403 se o código de recuperação já foi utilizado', async () => {
      mockReq.body = { code: '1234', email: 'test@example.com' };
      db.pgSelect.mockResolvedValueOnce([{ id: 1, email: 'test@example.com' }]) // CustomUser
                  .mockResolvedValueOnce([{ status: 1 }]); // VerifyCode já utilizado

      await professorController.RecoverPassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'codigo ja utilizado' });
    });

    test('deve retornar status 500 em caso de erro na recuperação de senha', async () => {
      mockReq.body = { code: '1234', email: 'test@example.com' };
      db.pgSelect.mockRejectedValue(new Error('Database error')); // Simula erro no DB

      await professorController.RecoverPassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'nao foi possivel atender sua solicitacao' });
    });
  });

  // Testes para Home
  describe('Home', () => {
    test('deve retornar status 200 com a mensagem da página inicial', async () => {
      mockReq.params = { id: 1 };
      await professorController.Home(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith('Página inicial do professor 1');
    });
  });

  // Testes para SendEmail
  describe('SendEmail', () => {
    test('deve enviar e-mail de recuperação e retornar status 200', async () => {
      mockReq.params = { id: 'test@example.com' }; // ID do professor como email
      db.pgSelect.mockResolvedValueOnce([{ id: 1, email: 'test@example.com' }]) // CustomUser
                  .mockResolvedValueOnce([]); // old_code vazio
      emailSender.sendEmail.mockReturnValue(true);
      db.pgInsert.mockResolvedValue({});

      await professorController.SendEmail(mockReq, mockRes);

      expect(db.pgSelect).toHaveBeenCalledWith('CustomUser', { email: 'test@example.com' });
      expect(emailSender.sendEmail).toHaveBeenCalledWith('test@example.com', expect.any(String)); // O código é aleatório
      expect(db.pgInsert).toHaveBeenCalledWith(
        'VerifyCode',
        expect.objectContaining({ customUserId: 1, status: 0 }),
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'email enviado' });
    });

    test('deve retornar status 404 se o professor não for cadastrado', async () => {
      mockReq.params = { id: 'nonexistent@example.com' };
      db.pgSelect.mockResolvedValue([]); // Professor não encontrado

      await professorController.SendEmail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'professor nao cadastrado no banco de dados' });
    });

    test('deve retornar status 500 se houver um erro ao inserir no banco de dados', async () => {
      mockReq.params = { id: 'test@example.com' };
      db.pgSelect.mockResolvedValueOnce([{ id: 1, email: 'test@example.com' }])
                  .mockResolvedValueOnce([]); // old_code vazio
      emailSender.sendEmail.mockReturnValue(true);
      db.pgInsert.mockRejectedValue(new Error('DB insert error')); // Simula erro no DB

      await professorController.SendEmail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: 'erro no banco de dados, nao foi possivel atender a sua solicitacao',
      });
    });
  });

  // Testes para NewPassword
  describe('NewPassword', () => {
    test('deve atualizar a senha com sucesso e retornar status 201', async () => {
      mockReq.body = { newPass: 'newSecurePass', email: 'test@example.com' };
      mockReq.params = { token: 'validToken' };
      decryptPassword.mockResolvedValue('newSecurePass');
      hashPassword.mockResolvedValue('hashedNewSecurePass');
      db.pgSelect.mockResolvedValueOnce([{ id: 1, email: 'test@example.com' }]) // CustomUser
                  .mockResolvedValueOnce([{ verifyStatus: 0 }]); // TokenCode
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, { userId: 1, email: 'test@example.com' });
      });
      db.pgUpdate.mockResolvedValue({});

      await professorController.NewPassword(mockReq, mockRes);

      expect(decryptPassword).toHaveBeenCalledWith('newSecurePass');
      expect(hashPassword).toHaveBeenCalledWith('newSecurePass');
      expect(db.pgSelect).toHaveBeenCalledWith('CustomUser', { email: 'test@example.com' });
      expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.TOKEN_KEY, expect.any(Function));
      expect(db.pgUpdate).toHaveBeenCalledWith('TokenCode', { verifyStatus: 1 }, { token: 'validToken' });
      expect(db.pgUpdate).toHaveBeenCalledWith('CustomUser', { password: 'hashedNewSecurePass' }, { id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'password trocado com sucesso', data: {} });
    });

    test('deve retornar status 403 para token inválido', async () => {
      mockReq.body = { newPass: 'newSecurePass', email: 'test@example.com' };
      mockReq.params = { token: 'invalidToken' };
      decryptPassword.mockResolvedValue('newSecurePass');
      hashPassword.mockResolvedValue('hashedNewSecurePass');
      db.pgSelect.mockResolvedValue([{ id: 1, email: 'test@example.com' }]);
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'));
      }); // Simula token inválido

      await professorController.NewPassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'token invalido, falha ao decodificar' });
    });

    test('deve retornar status 403 se o token já foi utilizado', async () => {
      mockReq.body = { newPass: 'newSecurePass', email: 'test@example.com' };
      mockReq.params = { token: 'usedToken' };
      decryptPassword.mockResolvedValue('newSecurePass');
      hashPassword.mockResolvedValue('hashedNewSecurePass');
      db.pgSelect.mockResolvedValueOnce([{ id: 1, email: 'test@example.com' }]) // CustomUser
                  .mockResolvedValueOnce([{ verifyStatus: 1 }]); // TokenCode já utilizado
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, { userId: 1, email: 'test@example.com' });
      });

      await professorController.NewPassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'token ja utilizado' });
    });

    test('deve retornar status 403 se o token não pertence ao usuário', async () => {
      mockReq.body = { newPass: 'newSecurePass', email: 'test@example.com' };
      mockReq.params = { token: 'mismatchedToken' };
      decryptPassword.mockResolvedValue('newSecurePass');
      hashPassword.mockResolvedValue('hashedNewSecurePass');
      db.pgSelect.mockResolvedValueOnce([{ id: 1, email: 'test@example.com' }])
                  .mockResolvedValueOnce([{ verifyStatus: 0 }]);
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, { userId: 2, email: 'other@example.com' }); // userId ou email diferentes
      });

      await professorController.NewPassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'token não pertence a este usuario' });
    });

    test('deve retornar status 500 em caso de erro no servidor', async () => {
      mockReq.body = { newPass: 'newSecurePass', email: 'test@example.com' };
      mockReq.params = { token: 'validToken' };
      decryptPassword.mockRejectedValue(new Error('Some unexpected error')); // Simula um erro geral

      await professorController.NewPassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'não foi possivel atender a sua solicitacao' });
    });
  });

  // Testes para ConfirmEmail
  describe('ConfirmEmail', () => {
    test('deve confirmar o e-mail e atualizar o role do usuário para professor', async () => {
      mockReq.body = { email: 'test@example.com', code: '1234', token: 'validToken' };
      db.pgSelect.mockResolvedValueOnce([{ id: 1, email: 'test@example.com', role: 'unknow' }]) // CustomUser
                  .mockResolvedValueOnce([{ status: 0 }]); // VerifyCode
      jwt.verify.mockReturnValue({ email: 'test@example.com', userId: 1 });
      db.pgUpdate.mockResolvedValue({});

      await professorController.ConfirmEmail(mockReq, mockRes);

      expect(db.pgSelect).toHaveBeenCalledWith('CustomUser', { email: 'test@example.com' });
      expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.TOKEN_KEY);
      expect(db.pgSelect).toHaveBeenCalledWith(
        'VerifyCode',
        expect.objectContaining({ code: '1234', customUserId: 1 }),
      );
      expect(db.pgUpdate).toHaveBeenCalledWith(
        'VerifyCode',
        { status: 1 },
        expect.objectContaining({ customUserId: 1, code: '1234' }),
      );
      expect(db.pgUpdate).toHaveBeenCalledWith('CustomUser', { role: 'professor' }, { id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'email confirmado com sucesso' });
    });

    test('deve retornar status 404 se a conta não for encontrada', async () => {
      mockReq.body = { email: 'nonexistent@example.com', code: '1234', token: 'token' };
      db.pgSelect.mockResolvedValue([]); // Conta não encontrada

      await professorController.ConfirmEmail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'conta não encontrada' });
    });

    test('deve retornar status 403 para token inválido', async () => {
      mockReq.body = { email: 'test@example.com', code: '1234', token: 'invalidToken' };
      db.pgSelect.mockResolvedValue([{ id: 1, email: 'test@example.com', role: 'unknow' }]);
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      }); // Simula token inválido

      await professorController.ConfirmEmail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'token invalido, falha ao decodificar token' });
    });

    test('deve retornar status 403 se o token não pertence ao usuário', async () => {
      mockReq.body = { email: 'test@example.com', code: '1234', token: 'mismatchedToken' };
      db.pgSelect.mockResolvedValue([{ id: 1, email: 'test@example.com', role: 'unknow' }]);
      jwt.verify.mockReturnValue({ email: 'other@example.com', userId: 2 }); // E-mail no token não corresponde

      await professorController.ConfirmEmail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'token invalido, token não pertence a este usuario' });
    });

    test('deve retornar status 400 se o código de verificação for inválido', async () => {
      mockReq.body = { email: 'test@example.com', code: 'invalid', token: 'validToken' };
      db.pgSelect.mockResolvedValueOnce([{ id: 1, email: 'test@example.com', role: 'unknow' }])
                  .mockResolvedValueOnce([]); // Código não encontrado
      jwt.verify.mockReturnValue({ email: 'test@example.com', userId: 1 });

      await professorController.ConfirmEmail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'codigo invalido' });
    });

    test('deve retornar status 400 se o código já foi utilizado', async () => {
      mockReq.body = { email: 'test@example.com', code: '1234', token: 'validToken' };
      db.pgSelect.mockResolvedValueOnce([{ id: 1, email: 'test@example.com', role: 'unknow' }])
                  .mockResolvedValueOnce([{ status: 1 }]); // Código já utilizado
      jwt.verify.mockReturnValue({ email: 'test@example.com', userId: 1 });

      await professorController.ConfirmEmail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'codigo ja utilizado' });
    });

    test('deve retornar status 500 em caso de erro no servidor', async () => {
      mockReq.body = { email: 'test@example.com', code: '1234', token: 'validToken' };
      db.pgSelect.mockRejectedValue(new Error('Database error')); // Simula erro no DB

      await professorController.ConfirmEmail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'nao foi possivel atender a sua solicitacao' });
    });
  });
});