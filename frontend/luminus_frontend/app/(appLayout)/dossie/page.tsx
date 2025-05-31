"use client";

// pages/gerenciar-dossies.tsx
import { useState } from 'react';
import { BaseInput } from "@/components/inputs/BaseInput";
import ListDossie from "./components/listDossie";
import { Dossie } from "./components/types";
import { ConfirmDeleteDialog } from "./components/ConfirmDeleteDialog";
import { ArchiveConfirmation } from "./components/archiveConfirmation";
import { ErroMessageDialog } from "./components/erroMessageDialog";
import { ExportConfirmDialog } from './components/exportConfirmDialog';
import ExportDownloadDialog from './components/exportDownloadDialog';

export default function GerenciarDossies() {
  // ============ ESTADOS ============
  const mockDossies: Dossie[] = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    name: `Dossiê ${i + 1}`,
    description: `Descrição do dossiê ${i + 1}`,
    evaluation_method: "Método de avaliação padrão",
    professor_id: 1,
    selected: false,
  }));
  
  const [dossies, setDossies] = useState(mockDossies);
  const [currentPage, setCurrentPage] = useState(1);
  const dossiesPorPagina = 6;
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<number[]>([]);
  const [archiveConfirmation, setArchiveConfirmation] = useState(false);
  const [idsToArchive, setIdsToArchive] = useState<number[]>([]);
  const [titleDossie, setTitleDossie] = useState<string | undefined>(undefined);
  const [dossieDescription, setDossieDescription] = useState("");
  const [missingDialog, setMissingDialog] = useState(false);
  const [messageErro, setMessageErro] = useState("");

  const [idsToExport, setIdsToExport] = useState<number[]>([]);

  const [openExportConfirmDialog, setOpenExportConfirmDialog] = useState(false);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [exportIdDossie, setExportIdDossie] = useState(Number)

  // ============ CÁLCULOS DERIVADOS ============
  const totalPages = Math.ceil(dossies.length / dossiesPorPagina);
  const startIndex = (currentPage - 1) * dossiesPorPagina;
  const dossiesVisiveis = dossies.slice(startIndex, startIndex + dossiesPorPagina);
  const isAllSelected = dossiesVisiveis.every((d) => d.selected);
  const filteredDossies = dossiesVisiveis.filter((dossie) =>
    dossie.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    dossie.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dossie.evaluation_method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============ FUNÇÕES ============
  const toggleSelectAll = () => {
    const newSelected = !isAllSelected;
    const novaLista = dossies.map((dossie, index) => {
      if (index >= startIndex && index < startIndex + dossiesPorPagina) {
        return { ...dossie, selected: newSelected };
      }
      return dossie;
    });
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
    console.log("Importar dossiê");
  };

  const handleCreateDossie = () => {
    // TODO: Implementar criação de dossiê
    console.log("Criar dossiê");
  };

  const handleDeleteClass = async () => {
    const selecionados = dossies.filter(dossie => dossie.selected).map(dossie => dossie.id);
    if (selecionados.length === 0) return;
    setIdsToDelete(selecionados);
    setConfirmOpen(true);
  };

  const confirmDeletion = async () => {
    try {
      console.log("Excluir:", idsToDelete);
      
      // Atualização otimista do estado
      setDossies(prev => prev.filter(dossie => !idsToDelete.includes(dossie.id)));

      if (currentPage > Math.ceil((dossies.length - idsToDelete.length) / dossiesPorPagina)) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Erro ao excluir dossiês:", error);
      setMessageErro("Erro ao excluir os dados desejados!");
      setMissingDialog(true);
    } finally {
      setConfirmOpen(false);
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

    setOpenExportConfirmDialog(true)

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
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-full w-[40vw] px-[2vh] py-[1vh] text-[1.5vh]"
        />
      </div>

      {/* Lista de dossiês */}
      <div className="-mt-4">
        <div className="px-[6vh] flex items-center justify-center mt-10 ml-auto">
          <ListDossie
            dossies={filteredDossies}
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
        description={"Tem certeza que quer exportar todos os dossiê (s) selecionado (s)"}
      />

      <ExportDownloadDialog
        open={openDownloadDialog}
        IdDossieToExport={idsToExport}
        onClose={()=>setOpenDownloadDialog(false)}
        description={"Dossiê exportado"}
      />


    </div>
  );
}
