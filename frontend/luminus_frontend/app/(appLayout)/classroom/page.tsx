"use client" // Habilita o uso de recursos do lado do cliente (ex: useState) no Next.js 13+

// Componentes e tipos
import ListClass from "./components/listClass";
import { Classroom } from "@/app/(appLayout)/classroom/components/types";
import { useState, useEffect, useRef } from "react";
import GridClass from "./components/gridClass";
import { LayoutGrid, Menu } from "lucide-react";
import ClassViewMode from "./components/classViewMode";
import { BaseInput } from "@/components/inputs/BaseInput";
import { ConfirmDeleteDialog } from "./components/ConfirmDeleteDialog";
import {ArchiveConfirmation} from "./components/archiveConfirmation"
import { ErroMessageDialog } from "./components/erroMessageDialog";
import { ListClassroom, GetClassroomResponse, DeleteClassroom } from "@/services/classroomServices";
import DialogPage from "./components/createClassModal";
import toast from 'react-hot-toast';

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
  const turmasPorPagina = 6; // Itens por página (fixed at 6)
  const [totalItems, setTotalItems] = useState(0); // Total de itens para paginação
  const [confirmOpen, setConfirmOpen] = useState(false); // Controle do modal de delete
  const [idsToDelete, setIdsToDelete] = useState<number[]>([]); // IDs para deletar
  const [archiveConfirmation, setarchiveConfirmation] = useState(false) // Modal de arquivamento
  const [idsToArchive, setIdsToArchive] = useState<number[]>([]); // IDs para arquivar
  const [titleClass, setTitleClass] = useState<string | undefined>(undefined); // Info da turma
  const [classDescription, setClassDescription] = useState("") // Descrição para modal
  const [codeClass, setCodeClass] = useState<string | undefined>(undefined); // Código da turma
  const [searchTerm, setSearchTerm] = useState(""); // Termo de busca
  const searchTimeout = useRef<NodeJS.Timeout | null>(null); // Para debounce
  const [missingDialog, setMissingDialog] = useState(false); //para abrir dialog de erro
  const [messageErro, setMessageErro] = useState(""); //inserir mensagem de erro do dialog
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento
  
  

  // ============ CÁLCULOS DERIVADOS ============
  const totalPages = Math.ceil(totalItems / turmasPorPagina);
  const isAllSelected = classi.every((t) => t.selected);
  const filteredClasses = classi; // Não é necessário filtro no cliente já que fazemos busca no servidor

  // ============ CHAMADAS À API ============
  const fetchTurmas = async (searchValue = searchTerm) => {
    try {
      setIsLoading(true);
      // Pegar o ID do professor do localStorage (definido durante o login)
      const professorId = localStorage.getItem('professorId');
      if (!professorId) {
        throw new Error('ID do professor não encontrado');
      }
      const start = (currentPage - 1) * turmasPorPagina;
      // Mapear a resposta da API para o formato local
      const response = await ListClassroom(Number(professorId), start, turmasPorPagina, searchValue);
      const turmasFormatadas = response.data.map((turma: GetClassroomResponse) => ({
        id: turma.id,
        disciplina: turma.name,
        codigo: turma.season,
        dossie: turma.description,
        institution: turma.institution,
        selected: false
      }));
      setClassi(turmasFormatadas);
      setTotalItems(response.ammount);
    } catch (error: any) {
      setMessageErro(error.message || "Erro ao carregar turmas");
      setMissingDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTurmas();
    // eslint-disable-next-line
  }, [currentPage]);

  // Busca com debounce
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchTurmas(value);
    }, 400);
  };

  // Manipular mudança de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // ============ FUNÇÕES ============


  // Alterna seleção de todas as turmas visíveis
  const toggleSelectAll = () => {
    const newSelected = !isAllSelected;
    const novaLista = classi.map((turma) => ({
      ...turma,
      selected: newSelected
    }));
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
      
      const professorId = localStorage.getItem('professorId');
      if (!professorId) {
        throw new Error('ID do professor não autenticado.');
      }

      // Deletar cada turma selecionada
      for (const id of idsToDelete) {
        await DeleteClassroom(id, Number(professorId));
      }

      // Exibe uma notificação de sucesso
      toast.success(`${idsToDelete.length} turma(s) deletada(s) com sucesso!`);

      // Recarregar dados para obter a contagem total atualizada
      await fetchTurmas();

      // Ajusta a página atual se necessário
      const remainingClassrooms = totalItems - idsToDelete.length;
      const newTotalPages = Math.ceil(remainingClassrooms / turmasPorPagina);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else if (newTotalPages === 0) {
        setCurrentPage(1);
      }
    } catch (error: any) {
      console.error("Erro ao excluir turmas:", error);
      setMessageErro(error.message || "Erro ao excluir turmas");
      setMissingDialog(true);
      toast.error(error.message || "Falha ao excluir turmas.");
    } finally {
      setIsLoading(false);
      setConfirmOpen(false); // Fecha o diálogo de confirmação
      setIdsToDelete([]); // Limpa a lista de IDs para deletar
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

  // Function to handle class export
  const handleExportClass = () => {
    const selectedClasses = classi.filter(turma => turma.selected);
    if (selectedClasses.length === 0) {
      setMessageErro("Selecione pelo menos uma turma para exportar");
      setMissingDialog(true);
      return;
    }

    // Create CSV content
    const headers = ["ID", "Disciplina", "Código", "Dossiê"];
    const csvContent = [
      headers.join(","),
      ...selectedClasses.map(turma => [
        turma.id,
        turma.disciplina,
        turma.codigo,
        turma.dossie
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "turmas_exportadas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          onChange={(e) => handleSearch(e.target.value)}
          className="border rounded-full w-[40vw] px-[2vh] py-[1vh] text-[1.5vh]"
        ></BaseInput>
      </div>

      {/* Renderização condicional */}
      <div className="-mt-4">
        {/* Barra de ferramentas - sempre visível */}
        <div className="flex justify-between items-center mb-3 px-[6vh]">
          {(!classi || classi.length === 0) && (
            <>
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
              <div className="flex items-center gap-2">
            <ClassViewMode
              visualization={visualization}
              setVisualization={setVisualization}
            />
            <DialogPage/>
          </div>
            </>
          )}
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
              setCurrentPage={handlePageChange}
              visualization={visualization}
              setVisualization={setVisualization}
              onDeleteClass={handleDeleteClass}
              toArchiveClass={archiveHandle}
              toExportClass={handleExportClass}
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
              setCurrentPage={handlePageChange}
              visualization={visualization}
              setVisualization={setVisualization}
              onDeleteClass={handleDeleteClass}
              toArchiveClass={archiveHandle}
              toExportClass={handleExportClass}
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