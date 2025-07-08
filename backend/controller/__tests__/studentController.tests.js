const db = require('../../bd.js');
const studentController = require('../studentController.js');

jest.mock('../../bd.js', () => ({
  pgSelect: jest.fn(),
  pgInsert: jest.fn(),
  pgUpdate: jest.fn(),
  pgDelete: jest.fn(),
  pgSelectStudentsInClassroom: jest.fn(),
}));

describe('studentController', () => {
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

  describe('List', () => {
    test('deve retornar 200 e a lista de estudantes da turma', async () => {
      mockReq.params.classid = '1';
      const mockStudents = [{ id: 1, name: 'Aluno A' }, { id: 2, name: 'Aluno B' }];
      db.pgSelectStudentsInClassroom.mockResolvedValue(mockStudents);

      await studentController.List(mockReq, mockRes);

      expect(db.pgSelectStudentsInClassroom).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'sucesso', data: mockStudents, ammount: mockStudents.length });
    });

    test('deve retornar 200 e uma lista vazia se não houver estudantes', async () => {
      mockReq.params.classid = '1';
      db.pgSelectStudentsInClassroom.mockResolvedValue([]);

      await studentController.List(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'sucesso', data: [], ammount: 0 });
    });

    test('deve retornar 500 em caso de erro no banco de dados', async () => {
      mockReq.params.classid = '1';
      db.pgSelectStudentsInClassroom.mockRejectedValue(new Error('DB Error'));

      await studentController.List(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'falha ao atender a solicitacao' });
    });
  });

  describe('Get', () => {
    test('deve retornar 200 e os dados do estudante', async () => {
        mockReq.params = { id: '10', classid: '1' };
        db.pgSelect
            .mockResolvedValueOnce([{ studentid: '10', classroomid: '1' }]) // classroomstudent
            .mockResolvedValueOnce([{ id: '10', name: 'Estudante Teste' }]);  // student

        await studentController.Get(mockReq, mockRes);

        expect(db.pgSelect).toHaveBeenCalledWith('classroomstudent', { studentid: '10', classroomid: '1' });
        expect(db.pgSelect).toHaveBeenCalledWith('student', { id: '10' });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ id: '10', name: 'Estudante Teste' });
    });


    test('deve retornar 403 se o estudante não existe na turma', async () => {
        mockReq.params = { id: '10', classid: '1' };
        db.pgSelect.mockResolvedValue([]); 

        await studentController.Get(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'estudante nao existe na turma' });
    });

    test('deve retornar 400 em caso de erro', async () => {
        mockReq.params = { id: '10', classid: '1' };
        db.pgSelect.mockRejectedValue(new Error('DB Error'));

        await studentController.Get(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'nao foi possivel atender a solicitacao' });
    });
  });

  describe('Create', () => {
    test('deve retornar 201 ao criar um estudante com sucesso', async () => {
        mockReq.params.classid = '1';
        mockReq.body = { id: '10', name: 'Novo Aluno', customUserId: '100' };
        
        db.pgSelect.mockResolvedValueOnce([]) // student não existe
                           .mockResolvedValueOnce([{ id: 1, dossierId: null }]); // classroom existe

        await studentController.Create(mockReq, mockRes);

        expect(db.pgInsert).toHaveBeenCalledWith('Student', { id: '10', name: 'Novo Aluno' });
        expect(db.pgInsert).toHaveBeenCalledWith('ClassroomStudent', {
            customUserId: '100',
            studentId: '10',
            classroomId: '1'
        });
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'estudante inserido com sucesso' });
    });

    test('deve retornar 500 em caso de erro', async () => {
        mockReq.params.classid = '1';
        mockReq.body = { id: '10', name: 'Novo Aluno', customUserId: '100' };
        db.pgSelect.mockRejectedValue(new Error('DB Error'));

        await studentController.Create(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'nao foi possivel atender a sua solicitacao' });
    });
  });

  describe('Update', () => {
    test('deve retornar 200 ao atualizar um estudante com sucesso', async () => {
        mockReq.params.id = '10';
        mockReq.body = { id: '11', name: 'Aluno Atualizado' };

        db.pgSelect.mockResolvedValue([]); // Nova matrícula não existe

        await studentController.Update(mockReq, mockRes);

        expect(db.pgUpdate).toHaveBeenCalledWith('Student', { id: '11', name: 'Aluno Atualizado' }, { id: '10' });
        expect(db.pgUpdate).toHaveBeenCalledWith('ClassroomStudent', { studentId: '11' }, { studentId: '10' });
        expect(db.pgUpdate).toHaveBeenCalledWith('Appraisal', { studentId: '11' }, { studentId: '10' });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'estudante atualizado com sucesso' });
    });

    test('deve retornar 403 se a nova matrícula já existir', async () => {
        mockReq.params.id = '10';
        mockReq.body = { id: '11', name: 'Aluno Atualizado' };
        db.pgSelect.mockResolvedValue([{ id: '11' }]); // Nova matrícula já existe

        await studentController.Update(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Número de matrícula já existe' });
    });

    test('deve retornar 500 em caso de erro', async () => {
        mockReq.params.id = '10';
        mockReq.body = { id: '11', name: 'Aluno Atualizado' };
        db.pgSelect.mockRejectedValue(new Error('DB Error'));

        await studentController.Update(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'nao foi possivel atender a sua solicitacao' });
    });
  });

  describe('Delete', () => {
    test('deve retornar 200 ao deletar um estudante com sucesso', async () => {
        mockReq.params = { id: '10', classid: '1' };
        mockReq.body = { customUserId: '100' };

        db.pgSelect.mockResolvedValue([]); // Não está em outras turmas

        await studentController.Delete(mockReq, mockRes);

        expect(db.pgDelete).toHaveBeenCalledWith('ClassroomStudent', { classroomId: '1', studentId: '10', customUserId: '100' });
        expect(db.pgDelete).toHaveBeenCalledWith('Appraisal', { studentId: '10', classroomId: '1', customUserId: '100' });
        expect(db.pgDelete).toHaveBeenCalledWith('Student', { id: '10' });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'estudante removido com sucesso' });
    });

    test('deve retornar 500 em caso de erro', async () => {
        mockReq.params = { id: '10', classid: '1' };
        mockReq.body = { customUserId: '100' };
        db.pgDelete.mockRejectedValue(new Error('DB Error'));

        await studentController.Delete(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ msg: 'nao foi possivel atender a solicitacao' });
    });
  });
});