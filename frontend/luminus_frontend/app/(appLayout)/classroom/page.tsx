"use client" // Habilita o uso de recursos do lado do cliente (ex: useState) no Next.js 13+

// Componentes e tipos
import ListClass from "./components/listClass";
import { Classroom } from "@/app/(appLayout)/classroom/components/types";
import { useState, useEffect } from "react";
import GridClass from "./components/gridClass";
import { LayoutGrid, Menu } from "lucide-react";
import ClassViewMode from "./components/classViewMode";
import { BaseInput } from "@/components/inputs/BaseInput";
import { ConfirmDeleteDialog } from "./components/ConfirmDeleteDialog";
import {ArchiveConfirmation} from "./components/archiveConfirmation"
import { ErroMessageDialog } from "./components/erroMessageDialog";
import { ListClassroom, DeleteClassroom } from "@/services/classroomServices";
import DialogPage from "./components/createClassModal";

export default function VizualizationClass() {
  // ============ ESTADOS ============
  // Mock de dados - DEVERIA SER SUBSTITUÍDO POR CHAMADA API
  // const mockClass: Classroom[] = Array.from({ length: 30 }, (_, i) => ({
  //   id: i,
  //   disciplina: 'Matematica',
  //   codigo: `EXA502 - TP${i + 1}`,
  //   dossie: `Dossiê Turma ${i + 1}`,
  //   selected: false,
  // }));
  
  const [visualization, setVisualization] = useState<'grid' | 'list'>('list'); // Modo de visualização
  const [classi, setClassi] = useState<Classroom[]>([]); // Lista de turmas
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
  const [missingDialog, setMissingDialog] = useState(false); //para abrir dialog de erro
  const [messageErro, setMessageErro] = useState(""); //inserir mensagem de erro do dialog
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento

  // ============ CÁLCULOS DERIVADOS ============
  const totalPages = Math.ceil((classi?.length || 0) / turmasPorPagina);
  const startIndex = (currentPage - 1) * turmasPorPagina;
  const turmasVisiveis = classi?.slice(startIndex, startIndex + turmasPorPagina) || [];
  const isAllSelected = turmasVisiveis.every((t) => t.selected);
  const filteredClasses = turmasVisiveis.filter((turma) =>
    turma.dossie.toLowerCase().includes(searchTerm.toLowerCase()) || 
    turma.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.disciplina.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============ CHAMADAS À API ============
  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        setIsLoading(true);
        // Pegar o ID do professor do localStorage (definido durante o login)
        const professorId = localStorage.getItem('professorId');
        if (!professorId) {
          throw new Error('ID do professor não encontrado');
        }
        
        const data = await ListClassroom(Number(professorId));
        // Mapear a resposta da API para o formato local
        const turmasFormatadas = Array.isArray(data) ? data.map(turma => ({
          id: turma.id,
          disciplina: turma.name,
          codigo: turma.season,
          dossie: turma.description,
          selected: false
        })) : [];
        setClassi(turmasFormatadas);
      } catch (error: any) {
        console.error("Erro ao carregar turmas:", error);
        setMessageErro(error.message || "Erro ao carregar turmas");
        setMissingDialog(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTurmas();
  }, []);

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

  // Prepara turmas para exclusão
  const handleDeleteClass = async () => {
    const selecionadas = classi.filter(turma => turma.selected).map(turma => turma.id);
    if (selecionadas.length === 0) return;
    setIdsToDelete(selecionadas);
    setConfirmOpen(true);
  };
  
  // Confirma exclusão das turmas
  const confirmDeletion = async () => {
    try {
      setIsLoading(true);
      // Deletar cada turma selecionada
      for (const id of idsToDelete) {
        await DeleteClassroom(id);
      }

      // Atualização otimista do estado
      setClassi(prev => prev.filter(turma => !idsToDelete.includes(turma.id)));

      if (currentPage > Math.ceil((classi.length - idsToDelete.length) / turmasPorPagina)) {
        setCurrentPage(1);
      }
    } catch (error: any) {
      console.error("Erro ao excluir turmas:", error);
      setMessageErro(error.message || "Erro ao excluir turmas");
      setMissingDialog(true);
    } finally {
      setIsLoading(false);
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
  //    setMessageErro("Erro ao arquivar os dados desejados!")
  //    setMissingDialog(true) 

  //   }
  // };

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-center mt-5 w-full ml-auto ">
        <h1 className="text-4xl font-bold"> Turmas </h1>
      </div>

      {/* Barra de busca */}
      <div className="flex justify-center items-center my-[2vh] mb-[4vh]">
        <BaseInput
          type="text"
          placeholder="Procure pela turma"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-full w-[40vw] px-[2vh] py-[1vh] text-[1.5vh]"
        ></BaseInput>
      </div>

      {/* Renderização condicional */}
      <div className="-mt-4">
        {/* Barra de ferramentas - sempre visível */}
        <div className="flex justify-between items-center mb-3 px-[6vh]">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleSelectAll}
              className="w-6 h-6 accent-blue-600"
              disabled={!classi || classi.length === 0}
            />
            <span className="px-2vh text-lg text-gray-600 font-bold">Selecionar todos</span>
          </div>
          <div className="flex gap-2 items-center">
            <ClassViewMode
              visualization={visualization}
              setVisualization={setVisualization}
            />
            <DialogPage/>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando turmas...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p>Nenhuma turma encontrada. Crie uma nova turma para começar!</p>
          </div>
        ) : visualization === 'list' ? (
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
        ) : (
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
      </div>

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

      <ErroMessageDialog
        open={missingDialog}
        onConfirm={() => setMissingDialog(false)}
        description={messageErro}
      />

    </div>
  );
}