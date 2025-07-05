// utils/__tests__/exportDossie.tests.js

const db = require('../../bd.js');
const { ExportToCsv } = require('../exportDossie.js');
const { Parser } = require('json2csv');

// Mock do banco
jest.mock('../../bd.js', () => ({
  pgDossieSelect: jest.fn(),
}));

// Mock do Parser do json2csv
jest.mock('json2csv', () => {
  const mockParse = jest.fn();
  const MockParser = jest.fn().mockImplementation(() => ({
    parse: mockParse,
  }));
  MockParser.mockParse = mockParse;
  return { Parser: MockParser };
});

describe('exportDossie', () => {
  let mockReq;
  let mockRes;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockReq = {
      params: { id: '1' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      header: jest.fn(),
      attachment: jest.fn(),
      send: jest.fn(),
    };

    Parser.mockParse.mockClear();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('deve exportar um dossiê para CSV com sucesso', async () => {
    const mockDossier = {
      id: '1',
      name: 'Dossiê Teste',
      description: 'Descrição Teste',
      evaluation_method: { id: '10' },
      sections: {
        '100': {
          id: '100',
          name: 'Seção 1',
          description: 'Desc Seção 1',
          weigth: 1,
          questions: {
            '1000': {
              id: '1000',
              name: 'Questão 1',
              description: 'Desc Questão 1',
            },
          },
        },
      },
    };

    db.pgDossieSelect.mockResolvedValue(mockDossier);

    Parser.mockParse.mockReturnValue(
      'id,name,description,sectionId,sectionName,sectionDescription,sectionWeight,questionId,questionName,questionDescription\n1,Dossiê Teste,Descrição Teste,100,Seção 1,Desc Seção 1,1,1000,Questão 1,Desc Questão 1'
    );

    await ExportToCsv(mockReq, mockRes);

    expect(db.pgDossieSelect).toHaveBeenCalledWith('1');
    expect(Parser.mockParse).toHaveBeenCalled();
    expect(mockRes.header).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(mockRes.attachment).toHaveBeenCalledWith('dossie-Dossiê Teste-1.csv');
    expect(mockRes.send).toHaveBeenCalledWith(
      'id,name,description,sectionId,sectionName,sectionDescription,sectionWeight,questionId,questionName,questionDescription\n1,Dossiê Teste,Descrição Teste,100,Seção 1,Desc Seção 1,1,1000,Questão 1,Desc Questão 1'
    );
  });

  test('deve retornar 404 se o dossiê não for encontrado', async () => {
    db.pgDossieSelect.mockResolvedValue(null);

    await ExportToCsv(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Dossiê não encontrado' });
  });

  test('deve retornar uma mensagem se o dossiê não tiver seções', async () => {
    const mockDossier = {
      id: '1',
      name: 'Dossiê Vazio',
      sections: null,
    };

    db.pgDossieSelect.mockResolvedValue(mockDossier);

    await ExportToCsv(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith('O dossiê não possui seções ou questões para exportar.');
  });

  test('deve retornar 500 em caso de erro no servidor', async () => {
    db.pgDossieSelect.mockRejectedValue(new Error('Erro no DB'));

    await ExportToCsv(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      msg: 'Erro interno no servidor ao tentar exportar o dossiê.',
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
