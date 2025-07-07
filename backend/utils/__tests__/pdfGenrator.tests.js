const puppeteer = require('puppeteer');

// Os imports de db e GeneratePdf foram deixados para dentro do beforeEach
// para que eles possam ser carregados com os mocks resetados.
jest.mock('puppeteer', () => {
  const mockPage = {
    setContent: jest.fn().mockResolvedValue(null),
    pdf: jest.fn().mockResolvedValue(Buffer.from('pdf_content')),
    close: jest.fn().mockResolvedValue(null),
  };
  const mockBrowser = {
    newPage: jest.fn().mockResolvedValue(mockPage),
    close: jest.fn().mockResolvedValue(null),
  };

  return {
    launch: jest.fn().mockResolvedValue(mockBrowser),
    __esModule: true,
    mockBrowser: mockBrowser,
    mockPage: mockPage,
  };
});

// Mocks das funções do módulo do banco de dados
jest.mock('../../bd', () => ({
  pgDossieSelect: jest.fn(),
  pgAppraisalSelect: jest.fn(),
  pgSelect: jest.fn(),
}));

describe('pdfGenrator', () => {
  let mockReq, mockRes, consoleErrorSpy;
  let db;
  let GeneratePdf;

  beforeEach(() => {
    // Limpa os módulos e mocks para garantir que cada teste rode isolado
    jest.resetModules();

    // Reimporta os módulos com os mocks já aplicados
    db = require('../../bd');
    ({ GeneratePdf } = require('../pdfGenrator.js'));

    jest.clearAllMocks();

    // Garante que mocks internos do puppeteer também sejam limpos
    puppeteer.launch.mockClear();
    puppeteer.mockBrowser.newPage.mockClear();
    puppeteer.mockPage.setContent.mockClear();
    puppeteer.mockPage.pdf.mockClear();
    puppeteer.mockPage.close.mockClear();
    puppeteer.mockBrowser.close.mockClear();

    // Limpa manualmente os mocks das funções de banco (só pra garantir)
    db.pgDossieSelect.mockClear();
    db.pgAppraisalSelect.mockClear();
    db.pgSelect.mockClear();

    // Configura requisição e resposta simuladas
    mockReq = {
      params: { classId: '1', dossierId: '2', studentId: '3' },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      header: jest.fn(),
      send: jest.fn(),
    };

    // Espiona erros para que não apareçam no terminal nos testes
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restaura o console original
    consoleErrorSpy.mockRestore();
  });

  test('deve gerar um PDF com sucesso', async () => {
    // Dados de exemplo que simulam o que o banco retornaria
    const mockDossier = {
      id: '2',
      name: 'Dossiê Teste',
      description: 'Descrição Teste',
      evaluation_method: { evaluationType: [] },
      sections: {},
    };
    const mockAppraisal = { answers: [] };
    const mockStudent = [{ name: 'Aluno Teste' }];

    // Mocks configurados para retornarem os dados acima
    db.pgDossieSelect.mockResolvedValue(mockDossier);
    db.pgAppraisalSelect.mockResolvedValue(mockAppraisal);
    db.pgSelect.mockResolvedValue(mockStudent);

    // Executa a função
    await GeneratePdf(mockReq, mockRes);

    // Verifica se os métodos do banco foram chamados corretamente
    expect(db.pgDossieSelect).toHaveBeenCalledWith('2');
    expect(db.pgAppraisalSelect).toHaveBeenCalledWith('3', '2', '1');
    expect(db.pgSelect).toHaveBeenCalledWith('student', { id: '3' });

    // Verifica se o puppeteer foi usado como esperado
    expect(puppeteer.launch).toHaveBeenCalledTimes(1);
    expect(puppeteer.mockBrowser.newPage).toHaveBeenCalledTimes(1);
    expect(puppeteer.mockPage.setContent).toHaveBeenCalledTimes(1);
    expect(puppeteer.mockPage.pdf).toHaveBeenCalledTimes(1);
    expect(puppeteer.mockPage.close).toHaveBeenCalledTimes(1);
    expect(puppeteer.mockBrowser.close).toHaveBeenCalledTimes(1);

    // Verifica se o PDF foi enviado com sucesso
    expect(mockRes.header).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(mockRes.send).toHaveBeenCalledWith(Buffer.from('pdf_content'));
  });

  test('deve retornar 404 se o dossiê não for encontrado', async () => {
    // Simula ausência de dossiê
    db.pgDossieSelect.mockResolvedValue(null);

    await GeneratePdf(mockReq, mockRes);

    // Verificações do erro retornado
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Falha ao gerar o relatório do dossiê.' });
  });

  test('deve retornar 500 em caso de erro no servidor', async () => {
    // Força uma exceção simulando falha de banco
    db.pgDossieSelect.mockRejectedValue(new Error('DB Error'));

    await GeneratePdf(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Falha ao gerar o relatório do dossiê.' });
  });
});