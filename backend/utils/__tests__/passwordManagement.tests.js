let bcrypt;
let crypto;
let passwordManagement;

// Mock das dependências externas
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

jest.mock('crypto', () => {
    const originalCrypto = jest.requireActual('crypto');
    return {
      ...originalCrypto,
      privateDecrypt: jest.fn(),
    };
});

describe('passwordManagement', () => {
    let consoleErrorSpy;
    let consoleLogSpy;

    beforeEach(() => {
        jest.resetModules(); 
        jest.clearAllMocks();

        // Define a variável de ambiente ANTES de importar os módulos
        process.env.PRIVATE_KEY = 'test_private_key';

        // Re-importa os módulos para cada teste, garantindo que usem o mesmo cache
        bcrypt = require('bcrypt');
        crypto = require('crypto');
        passwordManagement = require('../passwordManagement');

        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
        // Limpa a variável de ambiente após os testes
        delete process.env.PRIVATE_KEY; 
    });

    describe('hashPassword', () => {
        test('deve retornar uma senha hasheada com sucesso', async () => {
            const password = 'minhaSenha123';
            const hashedPassword = 'hashedSenha';
            bcrypt.hash.mockResolvedValue(hashedPassword);

            const result = await passwordManagement.hashPassword(password);

            expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
            expect(result).toBe(hashedPassword);
        });

        test('deve lançar um erro se a senha for inválida', async () => {
            await expect(passwordManagement.hashPassword(null)).rejects.toThrow('Senha inválida para hash.');
        });

        test('deve logar um erro se o bcrypt.hash falhar', async () => {
            const password = 'minhaSenha123';
            const dbError = new Error('Bcrypt error');
            bcrypt.hash.mockRejectedValue(dbError);

            await passwordManagement.hashPassword(password);

            expect(console.error).toHaveBeenCalledWith('Erro ao criar hash:', dbError);
        });
    });

    describe('decryptPassword', () => {
        test('deve retornar uma senha descriptografada com sucesso', async () => {
            const encryptedPassword = 'base64EncryptedPassword';
            const decryptedPassword = 'senhaPlana';
            
            crypto.privateDecrypt.mockReturnValue(Buffer.from(decryptedPassword, 'utf-8'));

            const result = await passwordManagement.decryptPassword(encryptedPassword);
            
            expect(crypto.privateDecrypt).toHaveBeenCalledWith(
                expect.objectContaining({
                    key: 'test_private_key',
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                }),
                Buffer.from(encryptedPassword, 'base64')
            );
            expect(result).toBe(decryptedPassword);
        });

        test('deve logar um erro se a descriptografia falhar', async () => {
            const encryptedPassword = 'invalidEncryptedPassword';
            const cryptoError = new Error('Crypto error');
            crypto.privateDecrypt.mockImplementation(() => {
                throw cryptoError;
            });

            await passwordManagement.decryptPassword(encryptedPassword);

            expect(console.error).toHaveBeenCalledWith('Erro ao desencriptar:', cryptoError);
        });
    });
}); 