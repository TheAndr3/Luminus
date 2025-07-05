const nodemailer = require('nodemailer');
const { sendEmail } = require('../mailSender');

// mock do nodemailer
jest.mock('nodemailer', () => {
  const mockSendMailFn = jest.fn(); // mock da função sendMail
  return {
    createTransport: jest.fn(() => ({
      sendMail: mockSendMailFn,
    })),
    __esModule: true, // necessário para importações ES6
    mockSendMail: mockSendMailFn, // exporta a função mock para usar nos testes
  };
});

describe('mailSender', () => {
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    nodemailer.mockSendMail.mockClear();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  test('deve chamar sendMail com os dados corretos', () => {
    const destination = 'teste@exemplo.com';
    const code = '123456';

    // simula o envio com sucesso
    nodemailer.mockSendMail.mockImplementation((options, callback) => {
      callback(null, { response: '250 OK' });
    });

    sendEmail(destination, code);

    expect(nodemailer.mockSendMail).toHaveBeenCalledTimes(1);

    // verifica se os dados enviados no e-mail estão corretos
    const mailOptions = nodemailer.mockSendMail.mock.calls[0][0];
    expect(mailOptions).toEqual({
      from: 'nexus.service.luminus@gmail.com',
      to: destination,
      subject: 'Codigo de verificação LUMINUS APP',
      text: `Codigo de recuperacao solicitado, insira: ${code}`,
    });
  });

  test('deve logar sucesso no console se o envio funcionar', () => {
    const destination = 'teste@exemplo.com';
    const code = '123456';

    nodemailer.mockSendMail.mockImplementation((options, callback) => {
      callback(null, { response: '250 OK' });
    });

    sendEmail(destination, code);

    expect(console.log).toHaveBeenCalledWith('email enviado com sucesso: ', '250 OK');
  });

  test('deve logar erro no console se o envio falhar', () => {
    const destination = 'teste@exemplo.com';
    const code = '123456';
    const error = new Error('Falha no envio');

    nodemailer.mockSendMail.mockImplementation((options, callback) => {
      callback(error, null);
    });

    sendEmail(destination, code);

    expect(console.log).toHaveBeenCalledWith('erro ao enviar email: ', error);
  });
});
