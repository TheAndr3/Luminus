"use client"

import { Dossie } from "./types";
import { Download, Plus, Pencil, Trash, Folder, Archive } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageController from "./paginationController";
import ActionPanel from "./actionPanel";
import TypeOfCreationModal from "./typeOfCreationModal";
import { ExportConfirmDialog } from "./exportConfirmDialog";
import ExportDownloadDialog from "./exportDownloadDialog";




interface ListDossieProps {
  dossies: Dossie[];
  toggleSelectAll: () => void;
  toggleOne: (id: number) => void;
  isAllSelected: boolean;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  onImportDossie: () => void;
  onCreateDossie: () => void;
  onDeleteClass: () => void;
  toArchiveClass: () => void;

  toExportDossie: () => void;
}

export default function ListDossie({
  dossies,
  toggleSelectAll,
  toggleOne,
  isAllSelected,
  currentPage,
  totalPages,
  setCurrentPage,
  onImportDossie,
  onCreateDossie,
  onDeleteClass,
  toArchiveClass,
  toExportDossie
}: ListDossieProps) {
  const [hasSelected, setHasSelected] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const router = useRouter();

  const [openTypeOfCreation, setOpenTypeOfCreation] = useState(false);



  // Estado que controla se o hover está bloqueado (ex: quando um modal está aberto)
  const [lockHover, setLockHover] = useState(false);

    // Estado para controlar a abertura do modal de edição
  const [openEditingModal, setOpenEditingModal] = useState(false);

  // Estado que guarda o dossie atualmente sendo editada (ou null se nenhuma)
  const [editingDossie, setEditingDossie] = useState<Dossie | null>(null);

  useEffect(() => {
    setHasSelected(dossies.some((dossie) => dossie.selected));
  }, [dossies]);

  const handleToggleOne = (id: number) => {
    toggleOne(id);
  };

  const handleToggleAll = () => {
    toggleSelectAll();
  };

  const handleClickDossie = (id: number) => {
    router.push(`/dossie/${id}?mode=view`);
  };


  
  return (
    <div className="w-full -mt-5">
      {/* Tabela que exibe os dossiês */}
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-sm text-gray-600">
            {/* Coluna com checkbox para selecionar todos */}
            <th className="w-[0px] px-2 gap-10">
              <input
                type="checkbox"
                onChange={handleToggleAll}
                checked={!!isAllSelected}
                className="w-6 h-6 accent-blue-600"
              />
            </th>
            {/* Texto do cabeçalho para selecionar todos */}
            <th className="px-2vh text-lg">Selecionar todos</th>

            {/* Cabeçalhos para as colunas principais da tabela */}
            <th className="px-2vh text-lg pl-4">Nome</th>
            <th className="px-2vh text-lg pl-30">Descrição</th>

            {/* Área com botões */}
            <th className="px-2vh text-lg">
              <div className="flex gap-2 items-center justify-end">
                <button
                  onClick={onImportDossie}
                  className="bg-gray-300 text-black hover:bg-gray-400 rounded-full px-3 py-1 h-7 inline-flex items-center justify-center cursor-pointer text-sm whitespace-nowrap font-normal"
                >
                  <Download size={16} className="mr-1" /> Importar Dossiê
                </button>
                <button
                  onClick={() => {
                    onCreateDossie
                    setOpenTypeOfCreation(true)
                    
                  }}
                  className="bg-gray-300 text-black hover:bg-gray-400 rounded-full px-3 py-1 h-7 inline-flex items-center justify-center cursor-pointer text-sm whitespace-nowrap font-normal"
                >
                  <Plus size={16} className="mr-1" /> Adicionar Dossiê
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Mapeia a lista de dossiês para renderizar cada um como uma linha da tabela */}
          {dossies.map((dossie) => (
            <tr
              key={dossie.id}
              onMouseEnter={() => setHovered(dossie.id)}
              onMouseLeave={() => setHovered(null)}
              className="bg-gray-900 text-white rounded px-[4vh] py-[2vh] cursor-pointer hover:brightness-110"
              onClick={() => handleClickDossie(dossie.id)}
            >
              {/* Checkbox para selecionar esse dossiê individualmente */}
              <td className="p-2 w-[50px]" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={!!dossie.selected}
                  onChange={() => handleToggleOne(dossie.id)}
                  className="w-6 h-6 accent-blue-600"
                />
              </td>

              {/* Colunas com dados do dossiê */}
              <td className="p-2 flex items-center">
                <Folder className="w-10 h-10 text-white" />
              </td>
              <td className="p-2 text-xl whitespace-nowrap overflow-hidden text-ellipsis">{dossie.name}</td>
              <td className="p-2 pl-20 text-xl whitespace-nowrap overflow-hidden text-ellipsis">{dossie.description}</td>
              {/* Coluna com os botões de ação, visíveis somente quando a linha está "hovered" */}
              <td className="p-1 w-[5vw]" onClick={(e) => e.stopPropagation()}>
                {hovered === dossie.id && (
                  <div className="flex gap-2 justify-end mr-2">
                    <button
                      className="hover:text-yellow-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dossie/${dossie.id}?mode=edit`);
                      }}
                    >
                      <Pencil />
                    </button>
                    
                    <button
                      className="hover:text-yellow-400"
                      onClick={() => {
                        dossie.selected = true;
                        onDeleteClass();
                        dossie.selected = false;
                      }}
                    >
                      <Trash />
                    </button>

                    <button
                      className="hover:text-yellow-400"
                      onClick={() => {
                        dossie.selected = true;
                        toArchiveClass();
                        dossie.selected = false;
                      }}
                    >
                      <Archive />
                    </button>

                    <button
                      className="hover:text-yellow-400"
                      onClick={(e) => {
                        
                        dossie.selected = true;
                        e.stopPropagation();
                        toExportDossie();
                        dossie.selected = false;
                      }}
                    >
                      <Download />
                    </button>
  
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Controlador de paginação */}
      <div className="-mt-5">
        <PageController
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* Painel de ações que aparece quando há dossiês selecionados */}
      <div className="-mt-10">
        {hasSelected && (
          <ActionPanel
            onDeleted={onDeleteClass}
            toArchive={toArchiveClass}
            toExport={toExportDossie}
          />
        )}
      </div>

      <TypeOfCreationModal
        open={openTypeOfCreation}
        onClose={() => setOpenTypeOfCreation(false)}
      />
      
      
    </div>
  );
} 