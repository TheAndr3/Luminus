
// luminus_frontend/app/(appLayout)/classroom/[selected-class]/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from "./components/Header";
import { ActionBar } from "./components/ActionBar";
import ListStudents from "./components/listStudents";
import { Students } from "./components/types";
import { GetClassroom, GetClassroomResponse as TurmaDetailsResponse } from '@/services/classroomServices';
import { ListStudents as ListStudentsService, StudentListResponse, StudentGetResponse } from '@/services/studentService';
import { toast } from 'react-hot-toast';
import { darkenHexColor } from '@/utils/colorHover';
import styles from './selected-classroom.module.css';
import { FileText, Users } from "lucide-react";
import { api } from '@/services/api'; // Importa o Axios instance (ajuste o caminho se necessário)

type ParsedStudent = {
  matricula: string;
  nome: string;
};

interface ExpectedCreateResponse {
  success: boolean;
  message?: string; // Mensagem opcional, geralmente presente em caso de erro
  // Adicione outras propriedades aqui se a API retornar dados do aluno criado no sucesso,
  // por exemplo: student?: Students;
}

export default function VisualizacaoAlunos() {
  const pathname = usePathname();

  const [turmaId, setTurmaId] = useState<number | null>(null);
  const [turmaDetails, setTurmaDetails] = useState<TurmaDetailsResponse | null>(null);
  const [students, setStudents] = useState<Students[]>([]);
  const [isLoadingTurma, setIsLoadingTurma] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const alunosPorPagina = 6;

  const color = "#ec3360";
  const hoverColor = darkenHexColor(color, 25);

  // 1. Extrai o ID da turma da URL
  useEffect(() => {
    if (pathname) {
      const segments = pathname.split('/');
      const idString = segments[segments.length - 1];
      const id = parseInt(idString, 10);
      if (!isNaN(id) && id > 0) {
        setTurmaId(id);
      } else {
        setErrorState("Turma não encontrada (ID inválido).");
        setIsLoadingTurma(false);
        setIsLoadingStudents(false);
      }
    }
  }, [pathname]);

  // 2. Busca detalhes da turma
  const fetchTurmaDetails = useCallback(async (id: number) => {
    setIsLoadingTurma(true);
    setErrorState(null);
    try {
      const data = await GetClassroom(id);
      setTurmaDetails(data);
    } catch (error: any) {
      setErrorState(error.message || "Falha ao carregar dados da turma.");
      setTurmaDetails(null);
      toast.error(error.message || "Falha ao carregar dados da turma.");
    } finally {
      setIsLoadingTurma(false);
    }
  }, []);

  useEffect(() => {
    if (turmaId !== null) {
      fetchTurmaDetails(turmaId);
    }
  }, [turmaId, fetchTurmaDetails]);

  // 3. Busca alunos da turma
  const fetchStudents = useCallback(async (id: number) => {
    setIsLoadingStudents(true);
    try {
      const response = await ListStudentsService(id);
      if (response && Array.isArray(response)) {
        const formattedStudents: Students[] = response.map((student: StudentGetResponse) => ({
          matricula: student.id,
          nome: student.name,
          selected: false,
        }));
        setStudents(formattedStudents);
      } else {
        setStudents([]);
      }
    } catch (error: any) {
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    if (turmaId !== null) {
      fetchStudents(turmaId);
    }
  }, [turmaId, fetchStudents]);

  // Filtros, paginação e seleção
  const alunosFiltrados = students.filter((aluno) =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.matricula.toString().includes(searchTerm)
  );
  const totalPages = Math.ceil(alunosFiltrados.length / alunosPorPagina);
  const startIndex = (currentPage - 1) * alunosPorPagina;
  const alunosVisiveis = alunosFiltrados.slice(startIndex, startIndex + alunosPorPagina);
  const isAllSelected = alunosVisiveis.length > 0 && alunosVisiveis.every((s) => s.selected);

  const toggleSelectAll = () => {
    const newState = !isAllSelected;
    setStudents(prev => prev.map(s =>
      alunosVisiveis.find(av => av.matricula === s.matricula) ? { ...s, selected: newState } : s
    ));
  };
  const toggleOne = (matricula: number) => {
    setStudents(prev => prev.map(s => s.matricula === matricula ? { ...s, selected: !s.selected } : s));
  };

  // Estados para CSV
  const [parsedStudentsFromCSV, setParsedStudentsFromCSV] = useState<ParsedStudent[]>([]);
  const [showCsvConfirmation, setShowCsvConfirmation] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvFileToUpload, setCsvFileToUpload] = useState<File | null>(null); // << NOVO ESTADO
  const fileInputRef = useRef<HTMLInputElement | null>(null); // << NOVO REF

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingStudents, setIsFetchingStudents] = useState(false); // Loading específico para fetchStudents

  // Estados para o modal de adicionar aluno (mantido para referência, mas não usado para a nova funcionalidade)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentMatricula, setNewStudentMatricula] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [addStudentError, setAddStudentError] = useState<string | null>(null);

  // Novos estados para a linha de adição direta
  const [showInlineAddStudent, setShowInlineAddStudent] = useState(false);
  const [inlineNewStudentMatricula, setInlineNewStudentMatricula] = useState('');
  const [inlineNewStudentName, setInlineNewStudentName] = useState('');
  const [inlineAddStudentError, setInlineAddStudentError] = useState<string | null>(null);


  // Função para buscar alunos da API
  const fetchStudentsApi = async (turmaId: number) => {
    if (!turmaId) return;
    setIsFetchingStudents(true);
    try {
      const response = await api.get(`/student/${turmaId}/list`);
      // ATENÇÃO: O backend `/student/${turmaId}/list` PRECISA retornar student_id e name.
      // Se ele retorna { student_id: 1, name: "Aluno X" }, o map abaixo funciona.
      // Se ele retorna SÓ { student_id: 1 }, você NÃO TERÁ O NOME e precisará ajustar o backend.
      const studentsFromApi = response.data.map((student: any) => ({
        matricula: student.student_id || student.matricula || student.id, // Tente diferentes chaves comuns
        nome: student.name || student.nome || "Nome não disponível", // Fallback se nome não vier
        selected: false,
      }));
      
      // Filtrar alunos que não puderam ser mapeados corretamente (sem matricula ou nome)
      const validStudents = studentsFromApi.filter(
          (s: Students) => typeof s.matricula === 'number' && s.nome !== "Nome não disponível"
      );

      if (validStudents.length !== studentsFromApi.length && studentsFromApi.length > 0) {
          console.warn("Alguns alunos da API não tinham ID ou nome e foram filtrados.", studentsFromApi);
          toast("Alguns dados de alunos da API estavam incompletos.", { icon: "⚠️" });
      }
      
      setStudents(validStudents);
    } catch (error: any) {
      console.error("Erro ao buscar alunos:", error);
      const errorMsg = error.response?.data?.msg || `Falha ao carregar alunos da turma ${turmaId}.`;
      toast.error(errorMsg);
      setStudents([]);
    } finally {
      setIsFetchingStudents(false);
    }
  };

  useEffect(() => {
    if (turmaId !== null) {
      fetchStudentsApi(turmaId);
    }
    if (turmaId !== null) {
      // TODO: Chamar API para carregar detalhes da turma para `classTitle`
      // Ex: fetchClassDetails(turmaId).then(data => setClassTitle(data.name));
      console.log("ID da Turma para carregar alunos:", turmaId);
      fetchStudentsApi(turmaId);
    }
  }, [pathname]); // Removido getTurmaIdFromPath das dependências se ela for estável ou definida fora.
                  // Se getTurmaIdFromPath depender de 'pathname' e for definida dentro, pode ficar como está.

  // Placeholder para ações (adapte conforme necessário)
  const handleProcessCsvFile = (file: File) => {
    if (!turmaId) return;
    toast(`Implementar upload de CSV '${file.name}' para turma ID ${turmaId}`);
    // Lembre-se de chamar fetchStudents(turmaId) após o sucesso do upload para atualizar a lista.
  };
  const handleAddStudentClick = () => {
    if (!turmaId) return;
    toast(`Implementar adição de aluno individual para turma ID ${turmaId}`);
    // Lembre-se de chamar fetchStudents(turmaId) após o sucesso para atualizar a lista.
  };
  const handleDeleteStudents = () => {
    if (!turmaId) return;
    const selectedStudents = students.filter(s => s.selected).map(s => s.matricula);
    if (selectedStudents.length === 0) {
      toast.error("Nenhum aluno selecionado.");
      return;
    }
    toast(`Implementar deleção dos alunos: ${selectedStudents.join(', ')} da turma ID ${turmaId}`);
    // Lembre-se de chamar fetchStudents(turmaId) após o sucesso para atualizar a lista.
  };

  const resetCsvState = () => {
    setShowCsvConfirmation(false);
    setParsedStudentsFromCSV([]);
    setCsvError(null);
    setCsvFileToUpload(null); // << LIMPA O ARQUIVO
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
    }
  };

  // ESTA É A VERSÃO QUE ENVIA O ARQUIVO PARA O BACKEND
  const handleConfirmCsvImport = async () => {
    if (!turmaId) {
      toast.error("ID da turma não encontrado. Não é possível importar alunos.");
      setIsLoading(false);
      return;
    }
    if (!csvFileToUpload) {
      toast.error("Nenhum arquivo CSV selecionado para importar.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('csvfile', csvFileToUpload); 

    try {
      const response = await api.post(`/student/${turmaId}/importcsv`, formData);

      if (response.status === 201 || response.status === 207) {
        toast.success(response.data.msg || "Importação de alunos processada!");
        if (response.data.failures && response.data.failures.length > 0) {
          console.warn("Alguns alunos não puderam ser importados:", response.data.failures);
          toast(`Falhas na importação: ${response.data.failures.length} aluno(s). Verifique o console.`);
        }
        if (response.data.processingErrors && response.data.processingErrors.length > 0) {
          console.warn("Erros de processamento de linha no CSV:", response.data.processingErrors);
          toast(`Algumas linhas do CSV tiveram problemas. Verifique o console.`, { icon: "⚠️" });
        }
        fetchStudents(turmaId); // ATUALIZA A LISTA APÓS SUCESSO
      } else {
        toast.error(response.data.msg || "Ocorreu um problema durante a importação.");
      }
    } catch (error: any) {
      console.error("Erro ao importar alunos via CSV:", error);
      const errorMsg = error.response?.data?.msg || "Erro ao conectar com o servidor para importar alunos.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
      resetCsvState();
    }
  };

  const handleInlineAddStudent = async () => {
    setInlineAddStudentError(null);

    if (!inlineNewStudentName.trim()) {
      setInlineAddStudentError("O nome do aluno não pode ser vazio.");
      return;
    }
    if (!inlineNewStudentMatricula.trim()) {
      setInlineAddStudentError("A matrícula do aluno não pode ser vazia.");
      return;
    }

    const matriculaNum = parseInt(inlineNewStudentMatricula, 10);
    if (isNaN(matriculaNum)) {
      setInlineAddStudentError("A matrícula deve ser um número válido.");
      return;
    }

    if (classi.some(s => s.matricula === matriculaNum)) {
      setInlineAddStudentError("Já existe um aluno com esta matrícula.");
      return;
    }

    setIsLoading(true);

    try {
        if (!currentTurmaId) {
          toast.error("ID da turma não encontrado. Não é possível adicionar o aluno.");
          setIsLoading(false);
          return;
        }

        // --- NOVO: Definir o professor_id ---
        // OPÇÃO 1: Hardcoded (apenas para teste inicial, não recomendado para produção)
        const professorId = 1; // Substitua por um ID de professor real ou logicamente obtido.
                              // Se o professor_id vem do contexto do usuário logado, você precisará buscá-lo.
                              // Por exemplo, de um hook de autenticação, um localStorage, ou um Context API.

        // Constrói o corpo da requisição com os dados do novo aluno
        const studentData = {
          id: matriculaNum, // O backend espera 'id' para a matrícula
          name: inlineNewStudentName.trim(), // O backend espera 'name' para o nome
          professor_id: professorId, // Adiciona o professor_id necessário para a tabela ClassroomStudent
        };

        // --- NOVO: Chamada real à API ---
        // Ajuste o endpoint conforme a sua rota no Node.js (ex: /student/:classid/create)
        const response = await api.post(`/student/${currentTurmaId}/create`, studentData); // OU `api.post('/student/create', studentData)` se classid for no corpo.

        // Verifica a resposta da API
        if (response.status === 201) { // 201 Created é o status de sucesso do seu backend
          const newStudent: Students = {
            matricula: matriculaNum, // Usamos a matrícula que o usuário inseriu, pois o backend usa o 'id' fornecido
            nome: inlineNewStudentName.trim(),
            selected: false,
          };
          
          // Adiciona o aluno à lista localmente APÓS a confirmação do backend
          setClassi(prevClassi => [...prevClassi, newStudent]);
          toast.success(response.data.msg); // Usa a mensagem de sucesso do backend: "estudante inserido com sucesso"
          setInlineNewStudentMatricula('');
          setInlineNewStudentName('');
          setShowInlineAddStudent(false);

          // É fundamental recarregar a lista de alunos para garantir que a UI reflita o estado real do backend
          fetchStudents(currentTurmaId);

        } else {
          // Se a API retornar um status de erro (ex: 400 Bad Request, 500 Internal Server Error)
          // O backend retorna 'msg' em caso de erro
          setInlineAddStudentError(response.data.msg || "Erro desconhecido ao adicionar aluno.");
          toast.error(response.data.msg || "Erro desconhecido ao adicionar aluno.");
        }

      } catch (error: any) {
        console.error("Erro ao adicionar aluno:", error);
        // Captura erros de rede ou respostas de erro da API
        setInlineAddStudentError(error.response?.data?.msg || "Erro ao conectar com o servidor ou adicionar aluno.");
        toast.error(error.response?.data?.msg || "Erro ao conectar com o servidor ou adicionar aluno.");
      } finally {
        setIsLoading(false);
      }
    };

  // Função para cancelar a adição inline e limpar os campos
  const handleCancelInlineAdd = () => {
    setInlineNewStudentMatricula('');
    setInlineNewStudentName('');
    setInlineAddStudentError(null);
    setShowInlineAddStudent(false);
  };


  return (
    <div className={styles.pageContainer}>
      <div className="flex-1 bg-white px-1">
        <Header title={classTitle} mainColor={color} hoverColor={hoverColor} />
        <ActionBar
          mainColor={color}
          hoverColor={hoverColor}
          onCsvFileSelected={handleProcessCsvFile}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onAddStudentClick={() => setShowInlineAddStudent(true)} // Agora abre a linha de adição
        />

        {/* Modal de Confirmação de CSV */}
        <Dialog open={showCsvConfirmation} onOpenChange={(isOpen) => {
            if (!isOpen) resetCsvState();
            // setShowCsvConfirmation(isOpen); // resetCsvState já faz setShowCsvConfirmation(false)
        }}>
          <DialogOverlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" />
          <DialogContent className="max-w-2xl bg-[#012D48] text-white rounded-2xl border-1 border-black p-6">
            <DialogHeader className="mb-4">
              <div className="flex items-center gap-3 justify-center">
                  <FileText className="w-8 h-8 text-white" />
                  <DialogTitle className="text-2xl font-bold text-center">
                    Confirmar Importação de Alunos
                  </DialogTitle>
              </div>
            </DialogHeader>
            
            {csvError && (
              <div className="my-4 p-3 border border-red-700 bg-red-100 text-red-700 rounded-md text-sm">
                <p className="font-semibold">Erro ao processar CSV:</p>
                <p>{csvError}</p>
              </div>
            )}

            {parsedStudentsFromCSV.length > 0 && !csvError && (
              <>
                <DialogDescription className="text-center text-gray-300 mb-1">
                  Os seguintes {parsedStudentsFromCSV.length} alunos serão importados para a turma:
                </DialogDescription>
                <div className="max-h-72 overflow-y-auto mb-4 border border-gray-600 rounded-md p-1 bg-gray-800">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-700"><tr><th className="p-2">Matrícula</th><th className="p-2">Nome</th></tr></thead>
                    <tbody>
                      {parsedStudentsFromCSV.map((student, index) => (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                          <td className="p-2">{student.matricula}</td><td className="p-2">{student.nome}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {parsedStudentsFromCSV.length === 0 && !csvError && (
                <p className="text-center text-gray-400 my-4">Nenhum aluno para importar do arquivo selecionado.</p>
            )}
            <DialogFooter className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={resetCsvState} className="bg-gray-500 hover:bg-gray-600 text-white border-gray-600 rounded-full px-5 py-2 h-auto" disabled={isLoading}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmCsvImport} disabled={isLoading || !!csvError || parsedStudentsFromCSV.length === 0} className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 py-2 h-auto">
                {isLoading ? "Importando..." : "Importar Alunos"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmação de Exclusão de Alunos (exemplo, se você tiver) */}
        <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <DialogOverlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" />
            <DialogContent className="max-w-md bg-[#012D48] text-white rounded-2xl border-1 border-black p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-center">Confirmar Exclusão</DialogTitle>
                </DialogHeader>
                <DialogDescription className="text-center my-4">
                    Tem certeza que deseja excluir {idsToDelete.length} aluno(s) selecionado(s)?
                </DialogDescription>
                <DialogFooter className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)} className="bg-gray-500 hover:bg-gray-600 text-white" disabled={isLoading}>Cancelar</Button>
                    <Button onClick={confirmDeletion} className="bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
                        {isLoading ? "Excluindo..." : "Excluir"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <div className="px-10 flex items-center justify-center mt-10 ml-auto"> {/*px-10 no original*/}
          <ListStudents
            mainColor={color}
            hoverColor={hoverColor}
            students={alunosVisiveis}
            toggleSelectAll={toggleSelectAll}
            toggleOne={toggleOne}
            onDeleteStudents={handleDeleteStudent}
            isAllSelected={isAllSelected}
            currentPage={currentPage}
            totalPages={totalPagesFiltradas}
            setCurrentPage={setCurrentPage}
            showInlineAddStudent={showInlineAddStudent}
            inlineNewStudentMatricula={inlineNewStudentMatricula}
            setInlineNewStudentMatricula={setInlineNewStudentMatricula}
            inlineNewStudentName={inlineNewStudentName}
            setInlineNewStudentName={setInlineNewStudentName}
            handleInlineAddStudent={handleInlineAddStudent}
            handleCancelInlineAdd={handleCancelInlineAdd}
            inlineAddStudentError={inlineAddStudentError}
            isLoading={isLoading}
            onCsvFileSelected={handleProcessCsvFile}
          />
        </div>
      </div>
    </div>
  );
}