// luminus_frontend/app/(appLayout)/classroom/[selected-class]/page.tsx
"use client"

// Componentes e tipos
import ListStudents from "./components/listStudents";
import { Students } from "@/app/(appLayout)/classroom/[selected-class]/components/types";
import React from 'react';
import { Button } from "@/components/ui/button";
import { darkenHexColor } from '@/utils/colorHover';
import { BaseInput } from "@/components/inputs/BaseInput";
import { Header } from "./components/Header";
import { ActionBar } from "./components/ActionBar";
import { Folder, User, ClipboardEdit, Plus, FileText } from "lucide-react"; // Adicionado FileText
import styles from './selected-classroom.module.css';
import { toast } from 'react-hot-toast';
import { api } from "@/services/api"; // Importando a instância do Axios configurada
// Importando o hook useState e useEffect do React
import { useState, useEffect } from 'react';
//import { CreateStudent } from "@/services/studentService";
import { usePathname } from 'next/navigation';

// Importações do Dialog do shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Opcional, se precisar de descrição
  DialogFooter,
  DialogClose, // Para um botão de fechar explícito, se desejado
  DialogOverlay
} from "@/components/ui/dialog"; //


// Tipagem para os alunos parseados do CSV
type ParsedStudent = {
  matricula: string;
  nome: string;
};

// Nova interface para a resposta esperada da criação de aluno
// Esta interface é definida aqui para ser globalmente acessível dentro deste arquivo.
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
  const [classTitle, setClassTitle] = useState("Carregando nome da turma..."); // Exemplo para título dinâmico
  const [visualization, setVisualization] = useState<'grid' | 'list'>('list');
  const [classi, setClassi] = useState<Students[]>([]); // Iniciar vazio, carregar da API
  const [currentPage, setCurrentPage] = useState(1);
  const alunosPorPagina = 6;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [parsedStudentsFromCSV, setParsedStudentsFromCSV] = useState<ParsedStudent[]>([]);
  const [showCsvConfirmation, setShowCsvConfirmation] = useState(false); // Controlará o Dialog
  const [csvError, setCsvError] = useState<string | null>(null);
  const [currentTurmaId, setCurrentTurmaId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [csvFileToUpload, setCsvFileToUpload] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

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


   useEffect(() => {
    const turmaId = getTurmaIdFromPath();
    setCurrentTurmaId(turmaId);
    if (turmaId !== null) {
      // TODO: Chamar API para carregar detalhes da turma para `classTitle`
      // Ex: fetchClassDetails(turmaId).then(data => setClassTitle(data.name));
      console.log("ID da Turma para carregar alunos:", turmaId);
      fetchStudents(turmaId); // Chame a função para buscar alunos
    }
  }, [pathname]);

  const totalPages = Math.ceil(classi.length / alunosPorPagina);
  const startIndex = (currentPage - 1) * alunosPorPagina;
  const alunosVisiveis = classi.slice(startIndex, startIndex + alunosPorPagina);
  const isAllSelected = alunosVisiveis.length > 0 && alunosVisiveis.every((t) => t.selected);
  const filteredClasses = alunosVisiveis.filter((aluno) =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    const newSelected = !isAllSelected;
    const novaLista = classi.map((aluno, index) => {
      if (index >= startIndex && index < startIndex + alunosPorPagina) {
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
    setConfirmOpen(true);
  };

  const confirmDeletion = async () => {
    try {
      console.log("Excluir alunos com IDs:", idsToDelete);
      // TODO: CHAMADA À API para deletar
      setClassi(prev => prev.filter(aluno => !idsToDelete.includes(aluno.matricula)));
      if (currentPage > Math.ceil((classi.length - idsToDelete.length) / alunosPorPagina) && classi.length - idsToDelete.length > 0) {
        setCurrentPage(Math.ceil((classi.length - idsToDelete.length) / alunosPorPagina));
      } else if (classi.length - idsToDelete.length === 0) {
        setCurrentPage(1);
      }
      toast.success("Aluno(s) excluído(s) com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir alunos:", error);
      toast.error("Erro ao excluir aluno(s).");
    } finally {
      setConfirmOpen(false);
    }
  };

   const fetchStudents = async (turmaId: number) => {
    if (!turmaId) return;

    setIsLoading(true);
    try {
      const response = await api.get(`/student/${turmaId}/list`);

      const studentsFromApi = response.data.map((student: any) => ({
        matricula: student.matricula || student.student_id,
        nome: student.nome || student.name,
        selected: false,
      }));

      const validStudents = studentsFromApi.filter(
        (s: Students) => typeof s.matricula === 'number' && typeof s.nome === 'string'
      );

      if(validStudents.length !== studentsFromApi.length) {
        console.warn("Alguns dados de alunos recebidos da API não puderam ser mapeados corretamente.");
      }
      setClassi(validStudents);
    } catch (error: any) {
      console.error("Erro ao buscar alunos:", error);
      const errorMsg = error.response?.data?.msg || `Falha ao carregar alunos da turma ${turmaId}.`;
      toast.error(errorMsg);
      setClassi([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessCsvFile = (file: File) => {
    const reader = new FileReader();
    setCsvError(null);
    setParsedStudentsFromCSV([]);
    setCsvFileToUpload(null);

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setCsvError("Não foi possível ler o arquivo.");
        setShowCsvConfirmation(true); // Abre o modal para mostrar o erro
        return;
      }
      try {
        const lines = text.split(/\r\n|\n/);
        if (lines.length === 0) {
          setCsvError("Arquivo CSV vazio ou formato inválido.");
          setShowCsvConfirmation(true);
          return;
        }

        const header = lines[0].toLowerCase().split(',');
        const matriculaIndex = header.indexOf('matricula');
        const nomeIndex = header.indexOf('nome');

        if (matriculaIndex === -1 || nomeIndex === -1) {
          setCsvError("Cabeçalho do CSV deve conter 'matricula' e 'nome'. Verifique se estão separados por vírgula.");
          setShowCsvConfirmation(true);
          return;
        }

        const students: ParsedStudent[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (line.trim() === '') continue;

          const data = line.split(',');
          if (data.length < Math.max(matriculaIndex, nomeIndex) + 1) {
            console.warn(`Linha ${i+1} ignorada: número de colunas insuficiente.`);
            continue;
          }
          const matricula = data[matriculaIndex]?.trim();
          const nome = data[nomeIndex]?.trim();

          if (matricula && nome) {
            students.push({ matricula, nome });
          } else {
            console.warn(`Linha ${i+1} ignorada: matrícula ou nome ausentes.`);
          }
        }
        if (students.length === 0 && !csvError) { // Só mostra este erro se nenhum outro ocorreu antes
          setCsvError("Nenhum aluno válido encontrado no CSV. Verifique o formato e o conteúdo.");
        }
        setParsedStudentsFromCSV(students);
        setCsvFileToUpload(file);
        setShowCsvConfirmation(true);
      } catch (error) {
        console.error("Erro ao parsear CSV:", error);
        setCsvError("Erro ao processar o arquivo CSV. Verifique o formato.");
        setParsedStudentsFromCSV([]);
        setShowCsvConfirmation(true);
      }
    };

    reader.onerror = () => {
      setCsvError("Erro ao ler o arquivo.");
      setParsedStudentsFromCSV([]);
      setShowCsvConfirmation(true);
    };

    reader.readAsText(file);
  };

  const resetCsvState = () => {
    setShowCsvConfirmation(false);
    setParsedStudentsFromCSV([]);
    setCsvFileToUpload(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Limpa o input do arquivo
    }
  };

  const handleConfirmCsvImport = async () => {
    if (!currentTurmaId) {
      toast.error("ID da turma não encontrado (simulação frontend).");
    }

    if (parsedStudentsFromCSV.length === 0) {
      toast.error("Nenhum aluno para importar do CSV.");
      return;
    }

    setIsLoading(true);

    try {
      const newStudentsToAdd: Students[] = parsedStudentsFromCSV.map(ps => ({
        matricula: parseInt(ps.matricula, 10) || Date.now() + Math.random(),
        nome: ps.nome,
        selected: false,
      }));

      setClassi(prevClassi => {
        const existingMatriculas = new Set(prevClassi.map(s => s.matricula));
        const uniqueNewStudents = newStudentsToAdd.filter(ns => !existingMatriculas.has(ns.matricula));
        return [...prevClassi, ...uniqueNewStudents];
      });

      toast.success(`${newStudentsToAdd.length} aluno(s) foram adicionados à lista localmente (simulação).`);

    } catch (error: any) {
      console.error("Erro ao simular importação de CSV:", error);
      toast.error("Erro ao simular a adição de alunos.");
    } finally {
      setIsLoading(false);
      resetCsvState();
    }
  };

  // Função para adicionar um único aluno (anteriormente via modal, agora adaptada para a linha)
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

      // ***** INÍCIO DA MUDANÇA PARA SIMULAÇÃO DO BACKEND *****

      // Simulação da chamada à API com um atraso para demonstrar o loading
      await new Promise(resolve => setTimeout(resolve, 500)); // Espera 0.5 segundos

      // Simula a resposta de sucesso da API
      const simulatedResponse: ExpectedCreateResponse = {
        success: true,
        message: "Aluno adicionado com sucesso (simulação)!"
      };

      // VERIFIQUE SE ESTE BLOCO ESTÁ COMENTADO SE VOCÊ NÃO QUISER SIMULAR UM ERRO
      // Se você quiser simular um erro, descomente e use este bloco:
      // const simulatedResponse: ExpectedCreateResponse = {
      //   success: false,
      //   message: "Erro simulado: matrícula inválida!"
      // };
      // if (matriculaNum === 999) { // Exemplo de erro simulado
      //   throw new Error("Simulação de erro na matrícula 999");
      // }


      if (simulatedResponse.success) {
        const newStudent: Students = {
          matricula: matriculaNum,
          nome: inlineNewStudentName.trim(),
          selected: false,
        };
        // Adiciona o aluno à lista localmente
        setClassi(prevClassi => [...prevClassi, newStudent]);
        toast.success(`Aluno "${inlineNewStudentName.trim()}" adicionado com sucesso (simulação)!`);
        setInlineNewStudentMatricula('');
        setInlineNewStudentName('');
        setShowInlineAddStudent(false);
      } else {
        // Se a simulação for um erro
        setInlineAddStudentError(simulatedResponse.message || "Erro desconhecido na simulação.");
        toast.error(simulatedResponse.message || "Erro desconhecido na simulação.");
      }

      // ***** FIM DA MUDANÇA PARA SIMULAÇÃO DO BACKEND *****

    } catch (error: any) {
      console.error("Erro na simulação de adição de aluno:", error);
      // Garante que qualquer erro jogado na simulação ainda seja capturado
      setInlineAddStudentError(error.message || "Erro crítico na simulação.");
      toast.error(error.message || "Erro crítico na simulação.");
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

        {/* ---- MODAL DE CONFIRMAÇÃO CSV ---- */}
        <Dialog open={showCsvConfirmation} onOpenChange={(isOpen) => {
            if (!isOpen) {
                resetCsvState();
            }
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
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="p-2">Matrícula</th>
                        <th className="p-2">Nome</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedStudentsFromCSV.map((student, index) => (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                          <td className="p-2">{student.matricula}</td>
                          <td className="p-2">{student.nome}</td>
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
              <Button
                variant="outline"
                onClick={resetCsvState}
                className="bg-gray-500 hover:bg-gray-600 text-white border-gray-600 rounded-full px-5 py-2 h-auto"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmCsvImport}
                disabled={isLoading || !!csvError || parsedStudentsFromCSV.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 py-2 h-auto"
              >
                {isLoading ? "Importando..." : "Importar Alunos"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* ---- FIM MODAL CSV ---- */}

        {/* O MODAL DE ADICIONAR ALUNO INDIVIDUALMENTE FOI REMOVIDO E SUBSTITUÍDO PELA LINHA INLINE */}

        <div className="px-10 flex items-center justify-center mt-10 ml-auto">
          <ListStudents
            students={filteredClasses}
            toggleSelectAll={toggleSelectAll}
            toggleOne={toggleOne}
            onDeleteStudents={handleDeleteStudent}
            isAllSelected={isAllSelected}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            // Novas props para a linha de adição inline
            showInlineAddStudent={showInlineAddStudent}
            inlineNewStudentMatricula={inlineNewStudentMatricula}
            setInlineNewStudentMatricula={setInlineNewStudentMatricula}
            inlineNewStudentName={inlineNewStudentName}
            setInlineNewStudentName={setInlineNewStudentName}
            handleInlineAddStudent={handleInlineAddStudent}
            handleCancelInlineAdd={handleCancelInlineAdd}
            inlineAddStudentError={inlineAddStudentError}
            isLoading={isLoading} // Passa o estado de loading para desabilitar botões
          />
        </div>
      </div>
    </div>
  );
}
