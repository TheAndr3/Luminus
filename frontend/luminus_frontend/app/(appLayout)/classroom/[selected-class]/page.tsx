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
import { FileText, AlertTriangle } from "lucide-react"; // Manteve FileText
import styles from './selected-classroom.module.css';
import { toast } from 'react-hot-toast'; 
import { api } from "@/services/api";
import { GetClassroom } from '@/services/classroomServices';
import { ListStudents as ListStudentsService, DeleteStudent } from '@/services/studentService';
import { getDossierById } from '@/services/dossierServices';
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";

// Removido CreateStudent pois a importação em massa usará um endpoint diferente
// import { CreateStudent } from "@/services/studentService"; 
import { useParams } from 'next/navigation';

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
  const params = useParams();
  const classroomId = params['selected-class'] as string;

  const color = "#311e45";
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
  const classiRef = useRef(classi);
  useEffect(() => {
      classiRef.current = classi;
  }, [classi]);
  
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

  // Estado para o dossiê associado
  const [associatedDossier, setAssociatedDossier] = useState<{ id: number; name: string } | null>(null);

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
  const fetchStudentsWithParams = useCallback(async (searchValue = searchTerm) => {
    if (!currentTurmaId) return;
    setIsFetchingStudents(true);
    try {
      const start = (currentPage - 1) * alunosPorPagina;
      const response = await ListStudentsService(currentTurmaId, start, alunosPorPagina, searchValue);
      
      // Mapeamento dos dados, preservando a seleção
      const studentsFromApi = response.data.map((student: any) => {
        const studentId = student.studentId || student.matricula;
        const existingStudent = classiRef.current.find(s => s.matricula === studentId);
        return {
          matricula: studentId,
          nome: student.name || student.nome || "Nome não disponível",
          selected: existingStudent ? existingStudent.selected : false,
        };
      });

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
  }, [currentTurmaId, currentPage, searchTerm, alunosPorPagina]);

  // Função única para buscar detalhes da turma e alunos em paralelo
  const fetchPageData = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      // Busca detalhes da turma e lista de alunos em paralelo
      const [classDetails, studentsFromService] = await Promise.all([
        GetClassroom(id), // Serviço que já trata o retorno corretamente
        ListStudentsService(id)
      ]);

      console.log('Classroom details:', classDetails); // Debug log

      // Ajuste conforme o retorno real do seu backend:
      // Se vier { data: [{ name: ... }] }, use:
      // setClassTitle(classDetails.data?.[0]?.name || `Turma ${id}`);
      // Se vier { name: ... }, use:
      setClassTitle(classDetails.name || `Turma ${id}`);

      // Se a turma tem um dossiê associado, buscar os detalhes do dossiê
      // Check for all possible field names that PostgreSQL might return
      const dossierId = classDetails.dossierId || classDetails.dossier_id || classDetails.dossierid;
      console.log('Looking for dossierId:', dossierId); // Debug log
      console.log('All classDetails keys:', Object.keys(classDetails)); // Debug log
      
      if (dossierId) {
        console.log('Found dossierId:', dossierId); // Debug log
        await fetchAssociatedDossier(dossierId);
      } else {
        console.log('No dossierId found in classDetails:', classDetails); // Debug log
        setAssociatedDossier(null);
      }

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
    const turmaId = classroomId ? parseInt(classroomId as string, 10) : null;
    setCurrentTurmaId(turmaId);
    if (turmaId !== null) {
      fetchPageData(turmaId);
    }
  }, [classroomId, fetchPageData]);
  
  useEffect(() => {
    if (currentTurmaId) {
      // Debounce search
      const timeoutId = setTimeout(() => {
        fetchStudentsWithParams(searchTerm);
      }, 300); // 300ms delay
      return () => clearTimeout(timeoutId);
    }
  }, [currentTurmaId, currentPage, searchTerm, fetchStudentsWithParams]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); 
  };

  // Manipular mudança de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalItems / alunosPorPagina);
  const isAllSelected = classi.length > 0 && classi.every((t) => t.selected);


  const toggleSelectAll = () => {
    const newSelectedState = !isAllSelected;
    setClassi(classi.map((student) => ({ ...student, selected: newSelectedState })));
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
      fetchStudentsWithParams(searchTerm); // Recarrega a lista com parâmetros atuais

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
        // Reset to first page and refresh with current search parameters
        setCurrentPage(1);
        fetchStudentsWithParams(searchTerm);
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
          toast.success(response.data.msg); // Usa a mensagem de sucesso do backend: "estudante inserido com sucesso"
          setInlineNewStudentMatricula('');
          setInlineNewStudentName('');
          setShowInlineAddStudent(false);

          // Refresh the student list with current search and pagination parameters
          fetchStudentsWithParams(searchTerm);
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

  // Função para atualizar o dossiê associado quando um novo dossiê é associado
  const handleDossierAssociated = (dossierId: number) => {
    fetchAssociatedDossier(dossierId);
  };

  // Função para buscar detalhes do dossiê associado
  const fetchAssociatedDossier = async (dossierId: number) => {
    try {
      console.log('Fetching dossier with ID:', dossierId); // Debug log
      const response = await getDossierById(dossierId);
      console.log('Dossier response:', response); // Debug log
      if (response.data) {
        const dossierInfo = {
          id: response.data.id,
          name: response.data.name
        };
        console.log('Setting associated dossier:', dossierInfo); // Debug log
        setAssociatedDossier(dossierInfo);
      } else {
        console.log('No dossier data in response:', response); // Debug log
        setAssociatedDossier(null);
      }
    } catch (error) {
      console.error('Error fetching associated dossier:', error);
      setAssociatedDossier(null);
    }
  };

  return (
    <div className={`${styles.pageContainer} -mt-6`}>
      <div className="flex-1 bg-white px-1"> {/* Ajustado para px-1 como no código original */}
        <Header 
          title={classTitle} 
          mainColor={color} 
          hoverColor={hoverColor}
          classroomId={currentTurmaId}
          associatedDossier={associatedDossier}
          onDossierAssociated={handleDossierAssociated}
        />
        <ActionBar
          mainColor={color}
          hoverColor={hoverColor}
          onCsvFileSelected={handleProcessCsvFile}
          searchTerm={searchTerm}
          onSearchTermChange={handleSearch}
          onAddStudentClick={() => setShowInlineAddStudent(true)}
          associatedDossier={associatedDossier}
          onDossierAssociated={handleDossierAssociated}
        />

        {/* Modal de Confirmação de CSV */}
        <Dialog open={showCsvConfirmation} onOpenChange={(isOpen) => {
            if (!isOpen) resetCsvState();
        }}>
          <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <DialogContent className="max-w-2xl bg-white rounded-3xl text-gray-900 border-0 shadow-2xl p-0 overflow-hidden">
            <DialogTitle className="sr-only">Confirmar Importação de Alunos</DialogTitle>
            
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 relative">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-2xl shadow-lg">
                        <FileText className="w-8 h-8 text-gray-900" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white">
                            Confirmar Importação de Alunos
                        </h2>
                        <p className="mt-1 text-sm font-normal text-white/80">
                            Revise os dados antes de importar os alunos para a turma
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {csvError && (
                    <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-red-800 text-sm">Erro ao processar CSV:</p>
                                <p className="text-red-700 text-xs mt-1">{csvError}</p>
                            </div>
                        </div>
                    </div>
                )}

                {parsedStudentsFromCSV.length > 0 && !csvError && (
                    <>
                        <div className="mb-4 text-center">
                            <p className="text-gray-700 text-sm font-normal">
                                Os seguintes <span className="font-semibold text-gray-900">{parsedStudentsFromCSV.length}</span> alunos serão importados para a turma:
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900 text-sm">Lista de Alunos</h3>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-normal text-gray-900 uppercase tracking-wider border-b border-gray-200">MATRÍCULA</th>
                                            <th className="px-4 py-3 text-left text-xs font-normal text-gray-900 uppercase tracking-wider border-b border-gray-200">NOME</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {parsedStudentsFromCSV.map((student, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-normal text-gray-900">
                                                    {student.matricula}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-normal text-gray-900">
                                                    {student.nome}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
                
                {parsedStudentsFromCSV.length === 0 && !csvError && (
                    <div className="text-center py-8">
                        <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-300">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum aluno encontrado</h3>
                            <p className="text-gray-500 text-sm">O arquivo CSV não contém dados válidos para importação.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={resetCsvState} 
                disabled={isLoading}
                className="h-10 text-base font-medium border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-6 py-2 shadow-md border transition-all duration-200 hover:shadow-lg flex items-center gap-2 cursor-pointer"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmCsvImport} 
                disabled={isLoading || !!csvError || parsedStudentsFromCSV.length === 0}
                className="h-10 text-base font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-2 shadow-md border border-gray-700 transition-all duration-200 hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Importando..." : "Importar Alunos"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmação de Exclusão de Alunos */}
        <ConfirmDeleteDialog
          open={confirmDeleteOpen}
          onCancel={() => setConfirmDeleteOpen(false)}
          onConfirm={confirmDeletion}
          total={idsToDelete.length}
          type="student"
        />

        <div className="px-10 flex items-center justify-center -mt-2 ml-auto"> {/*px-10 no original*/}
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
            refreshStudents={() => fetchStudentsWithParams(searchTerm)}
            associatedDossier={associatedDossier}
          />
        </div>
      </div>
    </div>
  );
}