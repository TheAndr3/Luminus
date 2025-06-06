
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

  // ---- RENDERIZAÇÃO ----
  if (isLoadingTurma && turmaId === null && !errorState) {
    return <div className={styles.centeredMessage}>Identificando turma...</div>;
  }

  if (errorState) {
    return <div className={styles.centeredMessage}>Erro: {errorState}</div>;
  }

  if (isLoadingTurma || !turmaDetails) {
    return <div className={styles.centeredMessage}>Carregando dados da turma...</div>;
  }

  const classTitle = turmaDetails.name || `Turma ${turmaDetails.id}`;

  return (
    <div className={styles.pageContainer}>
      <div className="flex-1 bg-white px-1">
        <Header title={classTitle} mainColor={color} hoverColor={hoverColor} />
        <ActionBar
          mainColor={color}
          hoverColor={hoverColor}
          onCsvFileSelected={handleProcessCsvFile}
          searchTerm={searchTerm}
          onSearchTermChange={(value) => { setSearchTerm(value); setCurrentPage(1); }}
          onAddStudentClick={handleAddStudentClick}
        />

        {isLoadingStudents ? (
          <div className={styles.centeredMessage}>Carregando alunos...</div>
        ) : students.length === 0 ? (
          <div className={`${styles.centeredMessage} text-center`}>
            <Users size={48} className="mb-2 text-gray-400" />
            <p className="text-xl text-gray-600">Nenhum aluno cadastrado nesta turma.</p>
            <p className="text-sm text-gray-500">Adicione alunos individualmente ou importe via CSV.</p>
          </div>
        ) : (
          <div className="px-4 md:px-10 mt-10">
            <ListStudents
              students={alunosVisiveis}
              toggleSelectAll={toggleSelectAll}
              toggleOne={toggleOne}
              onDeleteStudents={handleDeleteStudents}
              isAllSelected={isAllSelected}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              showInlineAddStudent={false}
              inlineNewStudentMatricula={""}
              setInlineNewStudentMatricula={() => {}}
              inlineNewStudentName={""}
              setInlineNewStudentName={() => {}}
              handleInlineAddStudent={async () => {}}
              handleCancelInlineAdd={() => {}}
              inlineAddStudentError={null}
              isLoading={isLoadingStudents}
            />
          </div>
        )}
        {/* Seus modais (ConfirmCsvModal, etc.) podem ser adicionados aqui */}
      </div>
    </div>
  );
}