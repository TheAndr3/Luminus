// luminus_frontend/app/(appLayout)/classroom/[selected-class]/page.tsx
"use client"

// Componentes e tipos
import ListStudents from "./components/listStudents";
import { Students } from "./components/types"; // Corrigido o caminho se 'types.ts' estiver na mesma pasta de componentes
import React, { useState, useEffect, useRef, useCallback } from 'react'; // Adicionado useRef
import { Button } from "@/components/ui/button";
import { darkenHexColor } from '@/utils/colorHover';
// import { BaseInput } from "@/components/inputs/BaseInput"; // Não parece estar sendo usado diretamente aqui
import { Header } from "./components/Header";
import { ActionBar} from "./components/ActionBar"; // Corrigido nome do componente para ActionBar
import { FileText } from "lucide-react"; // Manteve FileText
import styles from './selected-classroom.module.css';
import { toast } from 'react-hot-toast'; 
import { api } from "@/services/api";
import { GetClassroom } from '@/services/classroomServices';
import { ListStudents as ListStudentsService, DeleteStudent } from '@/services/studentService';

// Removido CreateStudent pois a importação em massa usará um endpoint diferente
// import { CreateStudent } from "@/services/studentService"; 
import { usePathname } from 'next/navigation';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogOverlay
} from "@/components/ui/dialog";

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
  const getTurmaIdFromPath = () => {
    const parts = pathname.split('/');
    const idStr = parts[parts.length - 1];
    const id = parseInt(idStr, 10);
    return isNaN(id) ? null : id;
  };

  const color = "#ec3360";
  const hoverColor = darkenHexColor(color, 25);
  const [classTitle, setClassTitle] = useState("Carregando Turma..."); // Tornar dinâmico

  // const [visualization, setVisualization] = useState<'grid' | 'list'>('list'); // Se não usar grid, pode remover
  const [classi, setClassi] = useState<Students[]>([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const alunosPorPagina = 6; // Ajuste conforme necessário
  const [totalItems, setTotalItems] = useState(0); // Total de itens para paginação
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false); // Renomeado para clareza
  const [idsToDelete, setIdsToDelete] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null); // Para debounce
  
  // Estados para CSV
  const [parsedStudentsFromCSV, setParsedStudentsFromCSV] = useState<ParsedStudent[]>([]);
  const [showCsvConfirmation, setShowCsvConfirmation] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null); // << NOVO REF

  const [currentTurmaId, setCurrentTurmaId] = useState<number | null>(null);
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
  const fetchStudents = async (turmaId: number) => {
    if (!turmaId) return;
    setIsFetchingStudents(true);
    try {
      const response = await api.get(`/student/${turmaId}/list`);
      // Mapeamento aqui:
      const studentsFromApi = response.data.data.map((student: any) => ({
        matricula: student.studentId || student.matricula,
        nome: student.name || student.nome || "Nome não disponível",
        selected: false,
      }));

      // Filtro para garantir que só alunos válidos sejam exibidos
      const validStudents = studentsFromApi.filter(
        (s: Students) => typeof s.matricula === 'number' && s.nome !== "Nome não disponível"
      );

      if (validStudents.length !== studentsFromApi.length && studentsFromApi.length > 0) {
        toast("Alguns dados de alunos da API estavam incompletos.", { icon: "⚠️" });
      }

      setClassi(validStudents);
    } catch (error: any) {
      console.error("Erro ao buscar alunos:", error);
      const errorMsg = error.response?.data?.msg || `Falha ao carregar alunos da turma ${turmaId}.`;
      toast.error(errorMsg);
      setClassi([]);
    } finally {
      setIsFetchingStudents(false);
    }
  };

  // Função para buscar alunos com paginação e busca no servidor
  const fetchStudentsWithParams = async (searchValue = searchTerm) => {
    if (!currentTurmaId) return;
    setIsFetchingStudents(true);
    try {
      const start = (currentPage - 1) * alunosPorPagina;
      const response = await ListStudentsService(currentTurmaId, start, alunosPorPagina, searchValue);
      
      // Mapeamento dos dados
      const studentsFromApi = response.data.map((student: any) => ({
        matricula: student.studentId || student.matricula,
        nome: student.name || student.nome || "Nome não disponível",
        selected: false,
      }));

      // Filtro para garantir que só alunos válidos sejam exibidos
      const validStudents = studentsFromApi.filter(
        (s: Students) => typeof s.matricula === 'number' && s.nome !== "Nome não disponível"
      );

      setClassi(validStudents);
      setTotalItems(response.ammount);
      
    } catch (error: any) {
      console.error("Erro ao buscar alunos:", error);
      const errorMsg = error.response?.data?.msg || `Falha ao carregar alunos da turma ${currentTurmaId}.`;
      toast.error(errorMsg);
      setClassi([]);
      setTotalItems(0);
    } finally {
      setIsFetchingStudents(false);
    }
  };

  // Busca o nome da turma pelo ID e define no título da página
  const fetchClassDetails = async (turmaId: number) => {
    try {
      const response = await api.get(`/classroom/${turmaId}`);
      // O nome da turma deve vir do backend no campo 'name' (ou 'titulo' se for esse o nome)
      setClassTitle(response.data.name || response.data.titulo || "Turma sem nome");
    } catch (error) {
      setClassTitle("Turma não encontrada");
    }
  };

  // Função única para buscar detalhes da turma e alunos em paralelo
  const fetchPageData = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      // Busca detalhes da turma e lista de alunos em paralelo
      const [classDetails, studentsFromService] = await Promise.all([
        GetClassroom(id), // Serviço que já trata o retorno corretamente
        ListStudentsService(id)
      ]);

      // Ajuste conforme o retorno real do seu backend:
      // Se vier { data: [{ name: ... }] }, use:
      // setClassTitle(classDetails.data?.[0]?.name || `Turma ${id}`);
      // Se vier { name: ... }, use:
      setClassTitle(classDetails.name || `Turma ${id}`);

      // Mapeia e define o estado dos alunos
      const formattedStudents = studentsFromService.data.map((student: any) => ({
        matricula: student.studentId || student.matricula,
        nome: student.name,
        selected: false,
      }));
      setClassi(formattedStudents);

    } catch (error: any) {
      console.error("Erro ao carregar dados da turma:", error);
      setClassTitle("Turma não encontrada");
      toast.error(error.message || "Falha ao carregar a página da turma.");
      setClassi([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const turmaId = getTurmaIdFromPath();
    setCurrentTurmaId(turmaId);
    if (turmaId !== null) {
      fetchPageData(turmaId);
    }
  }, [pathname, fetchPageData]);

  // Busca com debounce
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchStudentsWithParams(value);
    }, 400);
  };

  // Manipular mudança de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (currentTurmaId) {
      fetchStudentsWithParams();
    }
  }, [currentPage, currentTurmaId]);

  const totalPages = Math.ceil(totalItems / alunosPorPagina);
  const isAllSelected = classi.length > 0 && classi.every((t) => t.selected);


  const toggleSelectAll = () => {
    const newSelected = !isAllSelected;
    const idsVisiveis = classi.map(a => a.matricula);
    const novaLista = classi.map((aluno) => {
      if (idsVisiveis.includes(aluno.matricula)) {
        return { ...aluno, selected: newSelected };
      }
      return aluno;
    });
    setClassi(novaLista);
  };

  const toggleOne = (id: number) => {
    setClassi((prev) =>
      prev.map((aluno) =>
        aluno.matricula === id ? { ...aluno, selected: !aluno.selected } : aluno
      )
    );
  };

  const handleDeleteStudent = async () => {
    const selecionadas = classi.filter(aluno => aluno.selected).map(aluno => aluno.matricula);
    if (selecionadas.length === 0) return;
    setIdsToDelete(selecionadas);
    setConfirmDeleteOpen(true);
  };
  
  const confirmDeletion = async () => {
    if (!currentTurmaId || idsToDelete.length === 0) return;
    setIsLoading(true);
    try {
      const customUserId = parseInt(localStorage.getItem('professorId') || '1', 10);
      
      if (!customUserId || isNaN(customUserId)) {
        toast.error("ID do professor não encontrado. Não é possível deletar alunos.");
        setIsLoading(false);
        return;
      }

      // Deletar cada aluno selecionado
      await Promise.all(
        idsToDelete.map(id => DeleteStudent(currentTurmaId, id, customUserId))
      );

      toast.success(`${idsToDelete.length} aluno(s) removido(s) com sucesso.`);
      fetchStudents(currentTurmaId); // Recarrega a lista

    } catch (error: any) {
      console.error("Erro ao excluir alunos:", error);
      toast.error(error.message || "Erro ao excluir alunos.");
    } finally {
      setConfirmDeleteOpen(false);
      setIdsToDelete([]);
      setIsLoading(false);
    }
  };

  const handleDeleteSingleStudent = async (studentId: number) => {
    setIdsToDelete([studentId]);
    setConfirmDeleteOpen(true);
  };

  const handleProcessCsvFile = (file: File) => {
    const reader = new FileReader();
    setCsvError(null);
    setParsedStudentsFromCSV([]);

    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Divide o texto do CSV em linhas
      const lines = text.split(/\r?\n/);
      // No final do try bem-sucedido do parse:
      const header = lines[0].toLowerCase().split(','); // Supondo que 'lines' existe
      const matriculaIndex = header.indexOf('matricula');
      const nomeIndex = header.indexOf('nome');

      if (matriculaIndex === -1 || nomeIndex === -1) {
        setCsvError("Cabeçalho do CSV deve conter 'matricula' e 'nome'.");
        setShowCsvConfirmation(true);
        return;
      }
      const students: ParsedStudent[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') continue;
        const data = line.split(',');
        if (data.length < Math.max(matriculaIndex, nomeIndex) + 1) continue;
        const matricula = data[matriculaIndex]?.trim();
        const nome = data[nomeIndex]?.trim();
        if (matricula && nome) {
          students.push({ matricula, nome });
        }
      }

      if (students.length === 0 && !csvError) {
        setCsvError("Nenhum aluno válido encontrado no CSV.");
      }
      setParsedStudentsFromCSV(students);
      setShowCsvConfirmation(true);
      // ... (catch para erros de parse) ...
    };
    reader.onerror = () => { /* ... */ };
    reader.readAsText(file);
  };
  
  const resetCsvState = () => {
    setShowCsvConfirmation(false);
    setParsedStudentsFromCSV([]);
    setCsvError(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
    }
  };

  // ESTA É A VERSÃO QUE ENVIA O ARQUIVO PARA O BACKEND
  const handleConfirmCsvImport = async () => {
    if (!currentTurmaId) {
      toast.error("ID da turma não encontrado. Não é possível importar alunos.");
      setIsLoading(false);
      return;
    }
    if (!parsedStudentsFromCSV || parsedStudentsFromCSV.length === 0) {
      toast.error("Nenhum aluno válido para importar.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Agora enviando como JSON!
      const response = await api.post(
        `/student/${currentTurmaId}/importcsv`,
        { alunos: parsedStudentsFromCSV }
      );

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
        fetchStudents(currentTurmaId); // ATUALIZA A LISTA APÓS SUCESSO
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

        const customUserId = parseInt(localStorage.getItem('professorId') || '1', 10);
        
        if (!customUserId || isNaN(customUserId)) {
          toast.error("ID do professor não encontrado. Não é possível adicionar o aluno.");
          setIsLoading(false);
          return;
        }

        // Constrói o corpo da requisição com os dados do novo aluno
        const studentData = {
          id: matriculaNum, // O backend espera 'id' para a matrícula
          name: inlineNewStudentName.trim(), // O backend espera 'name' para o nome
          customUserId: customUserId, // O backend espera 'customUserId'
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
      <div className="flex-1 bg-white px-1"> {/* Ajustado para px-1 como no código original */}
        <Header title={classTitle} mainColor={color} hoverColor={hoverColor} />
        <ActionBar
          mainColor={color}
          hoverColor={hoverColor}
          onCsvFileSelected={handleProcessCsvFile} // Passa a função correta
          searchTerm={searchTerm}
          onSearchTermChange={handleSearch}
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
            classroomId={currentTurmaId || 0}
            students={classi}
            toggleSelectAll={toggleSelectAll}
            toggleOne={toggleOne}
            onDeleteStudents={handleDeleteStudent}
            onDeleteStudent={handleDeleteSingleStudent}
            isAllSelected={isAllSelected}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={handlePageChange}
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