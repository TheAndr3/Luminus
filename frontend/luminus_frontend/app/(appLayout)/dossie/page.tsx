"use client";

// pages/gerenciar-dossies.tsx
import { useState, useEffect } from 'react';
import { BaseInput } from "@/components/inputs/BaseInput";
import ListDossie from "./components/listDossie";
import { Dossie } from "./components/types";
import { ConfirmDeleteDialog } from "./components/ConfirmDeleteDialog";
import { ArchiveConfirmation } from "./components/archiveConfirmation";
import { ErroMessageDialog } from "./components/erroMessageDialog";
import { ExportConfirmDialog } from './components/exportConfirmDialog';
import ExportDownloadDialog from './components/exportDownloadDialog';
import TypeOfCreationModal from './components/typeOfCreationModal';
import { listDossiers, deleteDossier } from '@/services/dossierServices';


export default function GerenciarDossies() {
  // ============ ESTADOS ============
  const [dossies, setDossies] = useState<Dossie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const dossiersPerPage = 6;
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<number[]>([]);
  const [archiveConfirmation, setArchiveConfirmation] = useState(false);
  const [idsToArchive, setIdsToArchive] = useState<number[]>([]);
  const [titleDossie, setTitleDossie] = useState<string | undefined>(undefined);
  const [dossieDescription, setDossieDescription] = useState("");
  const [missingDialog, setMissingDialog] = useState(false);
  const [messageErro, setMessageErro] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0); // Total de itens para paginação

  const [idsToExport, setIdsToExport] = useState<number[]>([]);
  const [openExportConfirmDialog, setOpenExportConfirmDialog] = useState(false);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);

  const [openTypeOfCreation, setOpenTypeOfCreation] = useState(false);

  let typeOfData = "Dossie";

  // ============ CÁLCULOS DERIVADOS ============
  const totalPages = Math.ceil(totalItems / dossiersPerPage);
  const isAllSelected = dossies?.every((d) => d.selected) || false;

  // ============ CHAMADAS À API ============
  const fetchDossies = async () => {
    try {
      setIsLoading(true);
      const professorId = localStorage.getItem('professorId');
      if (!professorId) {
        throw new Error('ID do professor não encontrado');
      }
      const start = (currentPage - 1) * dossiersPerPage;
      const response = await listDossiers(Number(professorId), start, dossiersPerPage, searchTerm);
      if (!response.data) {
        setDossies([]);
        return;
      }
      setTotalItems(response.ammount);
      const dossiesFormatados = response.data.map((dossie) => ({
        id: dossie.id,
        name: dossie.name,
        description: dossie.description,
        evaluation_method: dossie.evaluationMethod,
        professor_id: dossie.customUserId,
        selected: false
      }));
      setDossies(dossiesFormatados);
    } catch (error: any) {
      if (error.message !== "Nenhum dossiê encontrado") {
        setMessageErro(error.message || "Erro ao carregar dossiês");
        setMissingDialog(true);
      }
      setDossies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDossies();
  }, [currentPage, dossiersPerPage, searchTerm]); // Adiciona currentPage, dossiersPerPage e searchTerm como dependências
  // Adiciona o debounce para evitar múltiplas chamadas à API
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reseta a página para 1 quando o usuário digita algo
  };

  // ============ FUNÇÕES ============
  const toggleSelectAll = () => {
    const newSelected = !isAllSelected;
    const novaLista = dossies.map((dossie) => ({
      ...dossie,
      selected: newSelected
    }));
    setDossies(novaLista);
  };

  const toggleOne = (id: number) => {
    setDossies((prev) =>
      prev.map((dossie) =>
        dossie.id === id ? { ...dossie, selected: !dossie.selected } : dossie
      )
    );
  };

  const handleImportDossie = () => {
    // TODO: Implementar importação de dossiê
    console.log("Importando dossiê");
  };

  const handleCreateDossie = () => {
    setOpenTypeOfCreation(true);
    console.log("Criando dossiê");
  };

  const handleDeleteClass = async () => {
    const selecionados = dossies.filter(dossie => dossie.selected).map(dossie => dossie.id);
    if (selecionados.length === 0) return;
    setIdsToDelete(selecionados);
    setConfirmOpen(true);
  };

  const confirmDeletion = async () => {
    try {
      setIsLoading(true);
      const failedDeletions: number[] = [];
      
      // Deletar cada dossiê selecionado
      for (const id of idsToDelete) {
        try {
          await deleteDossier(id);
        } catch (error) {
          console.error(`Erro ao deletar dossiê ${id}:`, error);
          failedDeletions.push(id);
        }
      }

      // Se houver falhas, mostra mensagem de erro
      if (failedDeletions.length > 0) {
        setMessageErro(`Não foi possível excluir ${failedDeletions.length} dossiê(s). Por favor, tente novamente.`);
        setMissingDialog(true);
        return;
      }
      await fetchDossies(); // Atualiza a lista de dossiês
      // Ajusta a página atual se necessário
      const remainingDossiers = dossies.length - idsToDelete.length;
      const newTotalPages = Math.ceil(remainingDossiers / dossiersPerPage);
      if (currentPage > newTotalPages) {
        setCurrentPage(Math.max(1, newTotalPages));
      }
    } catch (error: any) {
      console.error("Erro ao excluir dossiês:", error);
      setMessageErro(error.message || "Erro ao excluir os dados desejados!");
      setMissingDialog(true);
    } finally {
      setIsLoading(false);
      setConfirmOpen(false);
      setIdsToDelete([]); // Limpa os IDs após a operação
    }
  };

  const archiveHandle = async () => {
    const selecionados = dossies.filter(dossie => dossie.selected).map(dossie => dossie.id);
    if (selecionados.length === 0) return;

    if (selecionados.length === 1) {
      const dossieSelecionado = dossies.find(dossie => dossie.id === selecionados[0]);
      setTitleDossie(dossieSelecionado?.name);
      setDossieDescription("Tem certeza que deseja arquivar o dossiê: ");
    } else {
      setTitleDossie(undefined);
      setDossieDescription("Tem certeza que deseja arquivar os dossiês selecionados?"); 
    }

    setIdsToArchive(selecionados);
    setArchiveConfirmation(true);
  };

  const exportHandle = async () => {
    const selecionados = dossies
      .filter(dossie => dossie.selected)
      .map(dossie => dossie.id);

    if (selecionados.length === 0) return;

    setIdsToExport(selecionados); 
    setOpenExportConfirmDialog(true);
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-center mt-5 w-full ml-auto">
        <h1 className="text-4xl font-bold">Dossiês</h1>
      </div>

      {/* Barra de busca */}
      <div className="flex justify-center items-center my-[2vh] mb-[4vh]">
        <BaseInput
          type="text"
          placeholder="Procure pelo dossiê"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="border bg-[#F5F5F5] border-[#B3B3B3] rounded-full w-[40vw] px-[2vh] py-[1vh] text-[1.5vh]"
        />
      </div>

      {/* Lista de dossiês */}
      <div className="-mt-4">
        {/* Barra de ferramentas - sempre visível */}
        <div className="flex justify-between items-center mb-3 px-[6vh]">
          {(!dossies || dossies.length === 0) && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="w-6 h-6 accent-blue-600 cursor-pointer"
                  disabled={!dossies || dossies.length === 0}
                />
                <span className="px-2vh text-lg text-gray-600 font-bold">Selecionar todos</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleImportDossie}
                  className="bg-gray-300 text-black hover:bg-gray-400 rounded-full px-3 py-1 h-7 inline-flex items-center justify-center cursor-pointer text-sm whitespace-nowrap font-normal"
                >
                  Importar dossiê
                </button>
                <button
                  onClick={handleCreateDossie}
                  className="bg-gray-300 text-black hover:bg-gray-400 rounded-full px-3 py-1 h-7 inline-flex items-center justify-center cursor-pointer text-sm whitespace-nowrap font-normal"
                >
                  Adicionar dossiê
                </button>
              </div>
            </>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando dossiês...</p>
          </div>
        ) : dossies.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p>Nenhum dossiê encontrado. Crie um novo dossiê para começar!</p>
          </div>
        ) : (
          <div className="px-[6vh] flex items-center justify-center mt-10 ml-auto">
            <ListDossie
              dossies={dossies}
              toggleSelectAll={toggleSelectAll}
              toggleOne={toggleOne}
              isAllSelected={isAllSelected}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              onImportDossie={handleImportDossie}
              onCreateDossie={handleCreateDossie}
              onDeleteClass={handleDeleteClass}
              toArchiveClass={archiveHandle}
              toExportDossie={exportHandle}
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
        onCancel={() => setArchiveConfirmation(false)}
        onConfirm={archiveHandle}
        total={idsToArchive.length}
        title={titleDossie}
        code={undefined}
        description={dossieDescription}
      />

      <ErroMessageDialog
        open={missingDialog}
        onConfirm={() => setMissingDialog(false)}
        description={messageErro}
      />

      <ExportConfirmDialog 
        open={openExportConfirmDialog}
        onCancel={() => setOpenExportConfirmDialog(false)}
        onConfirm={() => setOpenDownloadDialog(true)}
        description={"Tem certeza que quer exportar o(s) dossiê (s) selecionado (s)"}
      />

      <ExportDownloadDialog
        open={openDownloadDialog}
        IdToExport={idsToExport}
        onClose={()=>setOpenDownloadDialog(false)}
        description={"Dossiê exportado"}
        typeOfData={typeOfData}
      />

      {/* Modal de criação de dossiê */}
      <TypeOfCreationModal
        open={openTypeOfCreation}
        onClose={() => setOpenTypeOfCreation(false)}
      />
    </div>
  );
}
