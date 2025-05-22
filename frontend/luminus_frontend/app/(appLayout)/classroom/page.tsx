"use client" // Habilita o uso de recursos do lado do cliente (ex: useState) no Next.js 13+

// Componentes e tipos
import ListClass from "./components/listClass";
import { Classroom } from "@/app/(appLayout)/classroom/components/types";
import { useState } from "react";
import GridClass from "./components/gridClass";
import { LayoutGrid, Menu } from "lucide-react";
import ClassViewMode from "./components/classViewMode";
import { BaseInput } from "@/components/inputs/BaseInput";
import { ConfirmDeleteDialog } from "./components/ConfirmDeleteDialog";
import {ArchiveConfirmation} from "./components/archiveConfirmation"

export default function VizualizationClass() {
  // ============ ESTADOS ============
  // Mock de dados - DEVERIA SER SUBSTITUÍDO POR CHAMADA API
  const mockClass: Classroom[] = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    disciplina: 'Matematica',
    codigo: `EXA502 - TP${i + 1}`,
    dossie: `Dossiê Turma ${i + 1}`,
    selected: false,
  }));
  
  const [visualization, setVisualization] = useState<'grid' | 'list'>('list'); // Modo de visualização
  const [classi, setClassi] = useState(mockClass); // Lista de turmas
  const [currentPage, setCurrentPage] = useState(1); // Paginação
  const turmasPorPagina = visualization === 'grid' ? 6 : 6; // Itens por página
  const [confirmOpen, setConfirmOpen] = useState(false); // Controle do modal de delete
  const [idsToDelete, setIdsToDelete] = useState<number[]>([]); // IDs para deletar
  const [archiveConfirmation, setarchiveConfirmation] = useState(false) // Modal de arquivamento
  const [idsToArchive, setIdsToArchive] = useState<number[]>([]); // IDs para arquivar
  const [titleClass, setTitleClass] = useState<string | undefined>(undefined); // Info da turma
  const [classDescription, setClassDescription] = useState("") // Descrição para modal
  const [codeClass, setCodeClass] = useState<string | undefined>(undefined); // Código da turma
  const [searchTerm, setSearchTerm] = useState(""); // Termo de busca

  // ============ CÁLCULOS DERIVADOS ============
  const totalPages = Math.ceil(classi.length / turmasPorPagina);
  const startIndex = (currentPage - 1) * turmasPorPagina;
  const turmasVisiveis = classi.slice(startIndex, startIndex + turmasPorPagina);
  const isAllSelected = turmasVisiveis.every((t) => t.selected);
  const filteredClasses = turmasVisiveis.filter((turma) =>
    turma.dossie.toLowerCase().includes(searchTerm.toLowerCase()) || 
    turma.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.disciplina.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============ FUNÇÕES ============


  // Alterna seleção de todas as turmas visíveis
  const toggleSelectAll = () => {
    const newSelected = !isAllSelected;
    const novaLista = classi.map((turma, index) => {
      if (index >= startIndex && index < startIndex + turmasPorPagina) {
        return { ...turma, selected: newSelected };
      }
      return turma;
    });
    setClassi(novaLista);
  };

  // Alterna seleção individual
  const toggleOne = (id: number) => {
    setClassi((prev) =>
      prev.map((turma) =>
        turma.id === id ? { ...turma, selected: !turma.selected } : turma
      )
    );
  };

  // ============ CHAMADAS À API (FALTANTES) ============
  // 1. Aqui deveria ter uma chamada para carregar as turmas inicialmente
  // useEffect(() => {
  //   const fetchTurmas = async () => {
  //     const response = await fetch('/api/turmas');
  //     const data = await response.json();
  //     setClassi(data);
  //   };
  //   fetchTurmas();
  // }, []);

  // Prepara turmas para exclusão
  const handleDeleteClass = async () => {
    const selecionadas = classi.filter(turma => turma.selected).map(turma => turma.id);
    if (selecionadas.length === 0) return;
    setIdsToDelete(selecionadas);
    setConfirmOpen(true);
  };
  
  // 2. Aqui deveria ter a chamada real para a API de exclusão
  const confirmDeletion = async () => {
    try {
      console.log("Excluir:", idsToDelete);
      
      // CHAMADA À API FALTANTE:
      // await fetch('/api/turmas/delete', {
      //   method: 'POST',
      //   body: JSON.stringify({ ids: idsToDelete }),
      //   headers: { 'Content-Type': 'application/json' }
      // });

      // Atualização otimista do estado
      setClassi(prev => prev.filter(turma => !idsToDelete.includes(turma.id)));

      if (currentPage > Math.ceil((classi.length - idsToDelete.length) / turmasPorPagina)) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Erro ao excluir turmas:", error);
      alert("Erro ao excluir.");
    } finally {
      setConfirmOpen(false);
    }
  };

  // Prepara turmas para arquivamento
  const archiveHandle = async () => {
    const selecionadas = classi.filter(turma => turma.selected).map(turma => turma.id);
    if (selecionadas.length === 0) return;

    if (selecionadas.length === 1) {
      const turmaSelecionada = classi.find(turma => turma.id === selecionadas[0]);
      setTitleClass(turmaSelecionada?.disciplina);
      setCodeClass(turmaSelecionada?.codigo);
      setClassDescription("Tem certeza que deseja arquivar a turma: ");
    } else {
      setTitleClass(undefined);
      setCodeClass(undefined);
      setClassDescription("Tem certeza que deseja arquivar as turmas selecionadas?"); 
    }

    setIdsToArchive(selecionadas);
    setarchiveConfirmation(true);
  }

  // 3. Aqui deveria ter a chamada real para a API de arquivamento
  // const confirmArchive = async () => {
  //   try {
  //     await fetch('/api/turmas/archive', {
  //       method: 'POST',
  //       body: JSON.stringify({ ids: idsToArchive }),
  //       headers: { 'Content-Type': 'application/json' }
  //     });
  //     // Atualizar estado conforme necessário
  //   } catch (error) {
  //     console.error("Erro ao arquivar turmas:", error);
  //   }
  // };

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-center mt-5 w-full ml-auto ">
        <h1 className="text-4xl font-bold"> Turmas </h1>
      </div>

      {/* Barra de busca */}
      <div className="flex justify-center items-center mb-4 ">
        <BaseInput
          type="text"
          placeholder="Procure pela turma"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-full w-250 px-[4vh] py-[vh]"
        ></BaseInput>
      </div>

      {/* Renderização condicional */}
      {visualization === 'list' && (
        <div className="px-[6vh] flex items-center justify-center mt-10 ml-auto">
          <ListClass
            classrooms={filteredClasses}
            toggleSelectAll={toggleSelectAll}
            toggleOne={toggleOne}
            isAllSelected={isAllSelected}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            visualization={visualization}
            setVisualization={setVisualization}
            onDeleteClass={handleDeleteClass}
            toArchiveClass={archiveHandle}
          />
        </div>
      )}

      {visualization === 'grid' && (
        <div className="px-[7vh] flex items-center justify-center mt-10 ml-auto">
          <GridClass
            classrooms={filteredClasses}
            toggleSelectAll={toggleSelectAll}
            toggleOne={toggleOne}
            isAllSelected={isAllSelected}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            visualization={visualization}
            setVisualization={setVisualization}
            onDeleteClass={handleDeleteClass}
            toArchiveClass={archiveHandle}
          />
        </div>
      )}

      {/* Modais */}
      <ConfirmDeleteDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDeletion}
        total={idsToDelete.length}
      />

      <ArchiveConfirmation
        open={archiveConfirmation}
        onCancel={() => setarchiveConfirmation(false)}
        onConfirm={archiveHandle} // Deveria chamar confirmArchive
        total={idsToArchive.length}
        title={titleClass}
        code={codeClass}
        description={classDescription}
      />
    </div>
  );
}