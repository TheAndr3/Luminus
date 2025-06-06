"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Papa from 'papaparse'; // Importa a biblioteca para ler o CSV

// Componentes da UI
import { Header } from "./components/Header"; ///components/Header.tsx]
import { ActionBar } from "./components/ActionBar"; ///components/ActionBar.tsx]
import ListStudents from "./components/listStudents"; ///components/listStudents.tsx]
import { Button } from "@/components/ui/button"; //
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle } from "@/components/ui/dialog"; //

// Tipos e Serviços
import { Students } from "./components/types"; ///components/types.ts]
import { GetClassroom, GetClassroomResponse as TurmaDetailsResponse } from '@/services/classroomServices'; //
import { ListStudents as ListStudentsService, StudentGetResponse, StudentImportCSV } from '@/services/studentService'; //

// Utils e Estilos
import { darkenHexColor } from '@/utils/colorHover'; //
import styles from './selected-classroom.module.css'; ///selected-classroom.module.css]
import { FileText, Users } from "lucide-react";

// Tipo para os dados extraídos do CSV
type ParsedStudent = {
  matricula: string;
  nome: string;
};

export default function VisualizacaoAlunos() {
  const pathname = usePathname();
  
  // Estados da página
  const [turmaId, setTurmaId] = useState<number | null>(null);
  const [turmaDetails, setTurmaDetails] = useState<TurmaDetailsResponse | null>(null);
  const [students, setStudents] = useState<Students[]>([]);
  
  // Estados de controle da UI
  const [isLoadingTurma, setIsLoadingTurma] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const alunosPorPagina = 6;

  // Estados para o modal de exclusão
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<number[]>([]);

  // Estados para o processo de importação de CSV
  const [csvFileToImport, setCsvFileToImport] = useState<File | null>(null);
  const [parsedStudentsFromCSV, setParsedStudentsFromCSV] = useState<ParsedStudent[]>([]);
  const [showCsvConfirmation, setShowCsvConfirmation] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  
  const color = "#ec3360";
  const hoverColor = darkenHexColor(color, 25);

  // 1. Efeito para extrair o ID da turma da URL
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

  // 2. Efeito para buscar detalhes da turma e alunos quando o ID da turma mudar
  const fetchTurmaData = useCallback(async (id: number) => {
    setIsLoadingTurma(true);
    setIsLoadingStudents(true);
    setErrorState(null);
    try {
      // Busca detalhes e alunos em paralelo para mais performance
      const [detailsData, studentsResponse] = await Promise.all([
        GetClassroom(id),
        ListStudentsService(id)
      ]);

      // Processa detalhes da turma
      setTurmaDetails(detailsData);

      // Processa lista de alunos
      if (studentsResponse && Array.isArray(studentsResponse.data)) {
        const formattedStudents: Students[] = studentsResponse.data.map((student: StudentGetResponse) => ({
          matricula: student.id,
          nome: student.name,
          selected: false,
        }));
        setStudents(formattedStudents);
      } else {
        console.warn("Resposta da API de alunos não contém 'data' como array:", studentsResponse);
        setStudents([]);
      }

    } catch (error: any) {
      setErrorState(error.message || "Falha ao carregar dados da turma.");
      setTurmaDetails(null);
      setStudents([]);
      toast.error(error.message || "Falha ao carregar dados da turma.");
    } finally {
      setIsLoadingTurma(false);
      setIsLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    if (turmaId !== null) {
      fetchTurmaData(turmaId);
    }
  }, [turmaId, fetchTurmaData]);

  // Lógica de UI: Filtros, paginação e seleção
  const alunosFiltrados = students.filter((aluno) =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.matricula.toString().includes(searchTerm)
  );
  const totalPages = Math.ceil(alunosFiltrados.length / alunosPorPagina);
  const startIndex = (currentPage - 1) * alunosPorPagina;
  const alunosVisiveis = alunosFiltrados.slice(startIndex, startIndex + alunosPorPagina);
  const isAllSelected = alunosVisiveis.length > 0 && alunosVisiveis.every((s) => s.selected);
  const toggleSelectAll = () => {/* ... */};
  const toggleOne = (matricula: number) => {/* ... */};


  // --- LÓGICA DE AÇÕES ---

  const resetCsvState = () => {
    setShowCsvConfirmation(false);
    setParsedStudentsFromCSV([]);
    setCsvError(null);
    setCsvFileToImport(null);
  };
  
  const handleProcessCsvFile = (file: File) => {
    if (!file) return;
    setCsvFileToImport(file);
    setCsvError(null);
    setParsedStudentsFromCSV([]);

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            console.log("Parse do CSV completo:", results);

            if (results.errors.length) {
                console.error("Erros no parse do CSV:", results.errors);
                setCsvError(`Erro ao ler o arquivo: ${results.errors[0].message}`);
                setShowCsvConfirmation(true);
                return;
            }

            const requiredHeaders = ['matricula', 'nome'];
            const actualHeaders = results.meta.fields;
            if (!actualHeaders || !requiredHeaders.every(h => actualHeaders.includes(h))) {
                setCsvError(`O arquivo CSV deve conter as colunas obrigatórias: 'matricula' e 'nome'.`);
                setShowCsvConfirmation(true);
                return;
            }

            const parsedData: ParsedStudent[] = results.data
                .map((row: any) => ({
                    matricula: row.matricula?.trim(),
                    nome: row.nome?.trim(),
                }))
                .filter(student => student.matricula && student.nome);

            if (parsedData.length === 0) {
                setCsvError("Nenhum aluno válido (com matrícula e nome) foi encontrado no arquivo CSV.");
            }
            
            setParsedStudentsFromCSV(parsedData);
            setShowCsvConfirmation(true);
        },
        error: (error: Error) => {
            console.error("Erro crítico no PapaParse:", error);
            setCsvError(`Falha ao ler o arquivo: ${error.message}`);
            setShowCsvConfirmation(true);
        },
    });
  };
  
  const handleConfirmCsvImport = async () => {
    if (!turmaId || !csvFileToImport) {
      toast.error("Arquivo ou ID da turma não encontrado.");
      return;
    }
    
    setIsLoadingStudents(true);
    try {
      // O serviço StudentImportCSV já deve criar o FormData
      const response = await StudentImportCSV(turmaId, csvFileToImport);
      toast.success(response.msg || "Importação processada!");
      if (response.failures && response.failures.length > 0) {
          toast.warn(`${response.failures.length} alunos não puderam ser importados. Verifique o console.`);
          console.warn("Falhas na importação:", response.failures);
      }
      await fetchTurmaData(turmaId); // Re-busca todos os dados para atualizar a lista
    } catch (error: any) {
      console.error("Erro ao confirmar importação de CSV:", error);
      toast.error(error.response?.data?.msg || "Erro ao importar alunos.");
    } finally {
      resetCsvState();
      setIsLoadingStudents(false);
    }
  };

  const handleDeleteStudents = () => { /* Sua lógica para deletar alunos */ };

  const handleAddStudentClick = () => { /* Sua lógica para adicionar aluno individual */ };

  // --- RENDERIZAÇÃO ---
  
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
              // O ActionPanel agora está dentro de ListStudents. A prop onCsvFileSelected não é mais necessária aqui
              // pois a ação é disparada pela ActionBar acima, que chama handleProcessCsvFile.
              // Se ListStudents ainda renderizar um ActionPanel, você deve passar onCsvFileSelected para ele.
              // Assumindo que a ActionBar agora tem o botão de import.
            />
          </div>
        )}

        {/* Modal de Confirmação de CSV */}
        <Dialog open={showCsvConfirmation} onOpenChange={setShowCsvConfirmation}>
            {/* ... JSX do Dialog ... (como na sua versão TelaAlunos) */}
        </Dialog>

        {/* Modal de Confirmação de Exclusão */}
        <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
            {/* ... JSX do Dialog ... (como na sua versão TelaAlunos) */}
        </Dialog>
      </div>
    </div>
  );
}