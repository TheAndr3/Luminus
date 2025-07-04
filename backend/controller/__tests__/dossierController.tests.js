const db = require('../../bd.js');
const dossierController = require('../dossierController.js');

jest.mock('../../bd.js', () => ({
  pgSelect: jest.fn(),
  pgInsert: jest.fn(),
  pgUpdate: jest.fn(),
  pgDelete: jest.fn(),
  pgDossieSelect: jest.fn(),
  pgDossieUpdate: jest.fn(),
}));

describe('dossierController', () => {
  let mockReq;
  let mockRes;
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockReq = {
      params: {},
      query: {},
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('Create', () => {
    test('deve criar um dossiê com sucesso e retornar 201', async () => {
        mockReq.body = {
            name: 'Dossiê Teste',
            customUserId: '1',
            description: 'Descrição Teste',
            evaluationMethod: { name: 'numerical' },
            sections: [{ name: 'Seção 1', description: 'Desc Seção 1', weigth: 1, questions: [{ name: 'Questão 1' }] }]
        };

        db.pgInsert.mockImplementation((tableName, payload) => {
            if (tableName === 'EvaluationMethod') {
                return Promise.resolve({ rows: [{ id: 10 }] });
            }
            if (tableName === 'Dossier') {
                return Promise.resolve({ rows: [{ id: 100 }] });
            }
            if (tableName === 'Section') {
                return Promise.resolve({ rows: [{ id: 1000 }] });
            }
            return Promise.resolve({ rows: [{}] }); // Default para outras inserções
        });

        await dossierController.Create(mockReq, mockRes);

        expect(db.pgInsert).toHaveBeenCalledWith('EvaluationMethod', expect.any(Object));
        expect(db.pgInsert).toHaveBeenCalledWith('Dossier', expect.any(Object));
        expect(db.pgInsert).toHaveBeenCalledWith('Section', expect.any(Object));
        expect(db.pgInsert).toHaveBeenCalledWith('Question', expect.any(Object));
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'dossie criado com sucesso', data: { id: 100 } });
    });

    test('deve retornar 403 se campos obrigatórios estiverem faltando', async () => {
        mockReq.body = { name: 'Dossiê Incompleto' };
        await dossierController.Create(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Campos obrigatórios faltando' });
    });

    test('deve retornar 500 em caso de erro no banco de dados', async () => {
        mockReq.body = {
            name: 'Dossiê com Erro',
            customUserId: '1',
            description: 'Descrição com Erro',
            evaluationMethod: { name: 'numerical' },
            sections: []
        };
        db.pgInsert.mockRejectedValue(new Error('DB Error'));
        await dossierController.Create(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'nao foi possivel atender a sua solicitacao' });
    });
  });

  describe('List', () => {
    test('deve retornar 200 e a lista de dossiês', async () => {
      mockReq.params.professorid = '1';
      const mockDossiers = [{ id: 1, name: 'Dossiê A' }, { id: 2, name: 'Dossiê B' }];
      db.pgSelect.mockResolvedValue(mockDossiers);

      await dossierController.List(mockReq, mockRes);

      expect(db.pgSelect).toHaveBeenCalledWith('Dossier', { customUserId: '1' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: 'sucesso',
        data: mockDossiers,
        ammount: mockDossiers.length,
      });
    });

    test('deve retornar 500 em caso de erro', async () => {
      mockReq.params.professorid = '1';
      db.pgSelect.mockRejectedValue(new Error('DB Error'));
      await dossierController.List(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'falha ao atender sua solicitacao' });
    });
  });

  describe('Get', () => {
    test('deve retornar 200 e os dados do dossiê', async () => {
      mockReq.params.id = '1';
      const mockDossier = { id: 1, name: 'Dossiê A' };
      db.pgDossieSelect.mockResolvedValue(mockDossier);

      await dossierController.Get(mockReq, mockRes);

      expect(db.pgDossieSelect).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'sucesso', data: mockDossier });
    });

    test('deve retornar 404 se o dossiê não for encontrado', async () => {
      mockReq.params.id = '99';
      db.pgDossieSelect.mockResolvedValue(null);
      await dossierController.Get(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Dossiê não encontrado' });
    });
  });

  describe('Update', () => {
    test('deve retornar 200 ao atualizar um dossiê com sucesso', async () => {
        mockReq.params.id = '1';
        mockReq.body = {
            name: 'Dossiê Atualizado',
            customUserId: '1',
            description: 'Descrição Atualizada',
            evaluationMethod: { name: 'numerical' },
            sections: []
        };
        db.pgSelect.mockResolvedValue([]); // Nenhuma associação encontrada
        
        await dossierController.Update(mockReq, mockRes);

        expect(db.pgDossieUpdate).toHaveBeenCalledWith(mockReq.body);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'dossie atualizado com sucesso' });
    });

    test('deve retornar 403 se o dossiê já tiver uma avaliação preenchida', async () => {
        mockReq.params.id = '1';
        mockReq.body = { customUserId: '1' };
        db.pgSelect.mockResolvedValue([{ id: 1 }]); // Associação encontrada

        await dossierController.Update(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'o dossie ja esta associado a uma turma e tem uma avaliação ja preenchida' });
    });
  });

  describe('Delete', () => {
    test('deve retornar 204 ao deletar um dossiê com sucesso', async () => {
      mockReq.params.id = '1';
      db.pgSelect.mockResolvedValue([{ id: 1 }]);
      db.pgDelete.mockResolvedValue({});

      await dossierController.Delete(mockReq, mockRes);

      expect(db.pgSelect).toHaveBeenCalledWith('dossier', { id: '1' });
      expect(db.pgDelete).toHaveBeenCalledWith('dossier', { id: '1' });
      expect(mockRes.status).toHaveBeenCalledWith(204);
    });

    test('deve retornar 404 se o dossiê não for encontrado', async () => {
      mockReq.params.id = '99';
      db.pgSelect.mockResolvedValue([]);
      await dossierController.Delete(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Dossiê não encontrado' });
    });
  });
}); 