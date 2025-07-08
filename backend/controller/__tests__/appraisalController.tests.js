const db = require('../../bd.js');
const appraisalController = require('../appraisalController.js');

jest.mock('../../bd.js', () => ({
  pgSelect: jest.fn(),
  pgInsert: jest.fn(),
  pgUpdate: jest.fn(),
  pgDelete: jest.fn(),
  pgAppraisalGetPoints: jest.fn(),
  pgAppraisalSelect: jest.fn(),
  pgAppraisalUpdate: jest.fn(),
}));

describe('appraisalController', () => {
  let mockReq;
  let mockRes;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
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
  });

  describe('List', () => {
    test('deve retornar 200 e a lista de avaliações da turma', async () => {
      mockReq.params.classid = '1';
      const mockData = [{ student: 'Aluno 1', points: 10 }];
      db.pgAppraisalGetPoints.mockResolvedValue(mockData);

      await appraisalController.List(mockReq, mockRes);

      expect(db.pgAppraisalGetPoints).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'sucess', data: mockData, ammount: mockData.length });
    });

    test('deve retornar 403 se não houver estudantes na turma', async () => {
      mockReq.params.classid = '1';
      db.pgAppraisalGetPoints.mockResolvedValue([]);

      await appraisalController.List(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'nao ha estudantes nessa turma' });
    });

    test('deve retornar 400 em caso de erro', async () => {
      mockReq.params.classid = '1';
      db.pgAppraisalGetPoints.mockRejectedValue(new Error('DB Error'));

      await appraisalController.List(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'falha ao atender a solicitacao' });
    });
  });

  describe('Get', () => {
    test('deve retornar 200 e os dados do estudante', async () => {
        mockReq.params.classid = '1';
        mockReq.params.studentid = '10';
        const mockStudent = { id: 10, name: 'Estudante Teste' };
        db.pgSelect.mockResolvedValue([mockStudent]);

        await appraisalController.Get(mockReq, mockRes);

        expect(db.pgSelect).toHaveBeenCalledWith('appraisal', { classroom_id: '1', student_id: '10' });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'sucess', data: [mockStudent] });
    });

    test('deve retornar 403 se o estudante não for encontrado na turma', async () => {
        mockReq.params.classid = '1';
        mockReq.params.studentid = '99';
        db.pgSelect.mockResolvedValue([]);

        await appraisalController.Get(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'estudante nao existe na turma' });
    });

    test('deve retornar 400 em caso de erro', async () => {
        mockReq.params.classid = '1';
        mockReq.params.studentid = '10';
        db.pgSelect.mockRejectedValue(new Error('DB Error'));

        await appraisalController.Get(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'nao foi possivel atender a solicitacao' });
    });
});


  describe('GetAppraisal', () => {
    test('deve retornar 200 e os dados da avaliação do estudante', async () => {
      mockReq.params = { id: '1', classid: '2', dossierid: '3' };
      const mockAppraisal = { id: 1, points: 95 };
      db.pgAppraisalSelect.mockResolvedValue(mockAppraisal);

      await appraisalController.GetAppraisal(mockReq, mockRes);

      expect(db.pgAppraisalSelect).toHaveBeenCalledWith('1', '3', '2');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'sucesso', data: mockAppraisal });
    });

    test('deve retornar 400 em caso de erro', async () => {
      mockReq.params = { id: '1', classid: '2', dossierid: '3' };
      db.pgAppraisalSelect.mockRejectedValue(new Error('DB Error'));

      await appraisalController.GetAppraisal(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'não foi possivel atender a solicitação' });
    });
  });

  describe('Create', () => {
    test('deve retornar 201 e os dados da avaliação criada', async () => {
        mockReq.params = { classid: '1', studentid: '10' };
        mockReq.body = { professor_id: '100', dossier_id: '200' };
        const createdAppraisal = { id: 5, points: 0.0 };
        db.pgInsert.mockResolvedValue({ rows: [createdAppraisal] });

        await appraisalController.Create(mockReq, mockRes);

        expect(db.pgInsert).toHaveBeenCalledWith('Appraisal', expect.objectContaining({
            customUserId: '100',
            studentId: '10',
            classroomId: '1',
            dossierId: '200',
            points: 0.0,
        }));
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'avaliação criada com sucesso', data: createdAppraisal });
    });

    test('deve retornar 400 se a criação falhar', async () => {
        mockReq.params = { classid: '1', studentid: '10' };
        mockReq.body = { professor_id: '100', dossier_id: '200' };
        db.pgInsert.mockRejectedValue(new Error('DB Error'));

        await appraisalController.Create(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'nao foi possivel atender a sua solicitacao' });
    });
});


  describe('Update', () => {
    test('deve retornar 200 e os dados atualizados', async () => {
      mockReq.params.id = '1';
      mockReq.body = { points: 99 };
      const updatedData = { id: 1, points: 99 };
      db.pgAppraisalUpdate.mockResolvedValue(updatedData);

      await appraisalController.Update(mockReq, mockRes);

      expect(db.pgAppraisalUpdate).toHaveBeenCalledWith({ points: 99 }, '1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'atualizado com sucesso', data: updatedData });
    });

    test('deve retornar 400 em caso de erro', async () => {
      mockReq.params.id = '1';
      mockReq.body = { points: 99 };
      const dbError = new Error('DB Error');
      db.pgAppraisalUpdate.mockRejectedValue(dbError);

      await appraisalController.Update(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Nao foi possivel atender a sua solicitacao', error: dbError.message });
    });
  });

  describe('Delete', () => {
    test('deve retornar 204 se a avaliação for deletada com sucesso', async () => {
      mockReq.params.id = '1';
      db.pgSelect.mockResolvedValue([{ id: 1 }]); // Simula que a avaliação existe
      db.pgDelete.mockResolvedValue({});

      await appraisalController.Delete(mockReq, mockRes);

      expect(db.pgSelect).toHaveBeenCalledWith('appraisal', { id: '1' });
      expect(db.pgDelete).toHaveBeenCalledWith('appraisal', { id: '1' });
      expect(mockRes.status).toHaveBeenCalledWith(204);
    });

    test('deve retornar 400 se a avaliação não existir', async () => {
      mockReq.params.id = '99';
      db.pgSelect.mockResolvedValue([]); // Simula que a avaliação não existe

      await appraisalController.Delete(mockReq, mockRes);

      expect(db.pgSelect).toHaveBeenCalledWith('appraisal', { id: '99' });
      expect(db.pgDelete).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'nao foi possivel atender a sua solicitacao' });
    });

    test('deve retornar 400 em caso de erro na deleção', async () => {
      mockReq.params.id = '1';
      db.pgSelect.mockResolvedValue([{ id: 1 }]);
      db.pgDelete.mockRejectedValue(new Error('DB Error'));

      await appraisalController.Delete(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'nao foi possivel atender a sua solicitacao' });
    });
  });
});
