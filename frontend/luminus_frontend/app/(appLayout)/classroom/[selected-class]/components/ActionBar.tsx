// Em: [selected-class]/components/ActionBar.tsx

import { BaseInput } from "@/components/inputs/BaseInput";
import { ColoredButton } from "@/components/colored-button/colored-button"; //
import { ImportCSVButton } from "@/components/button-csv/import-csv-button"; //
import { Plus, ClipboardEdit, Folder } from 'lucide-react';
import React from 'react';
import AssociarDossie from "./associarDossie";

interface ActionBarProps {
  mainColor?: string;
  hoverColor: string;
  onAddStudentClick?: () => void;
  onCsvFileSelected: (file: File) => void; // Modificado para aceitar File
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  associatedDossier?: { id: number; name: string } | null;
  onDossierAssociated?: (dossierId: number) => void;
}

export function ActionBar({
  mainColor,
  hoverColor,
  onAddStudentClick,
  onCsvFileSelected, // Nome da prop continua o mesmo
  searchTerm,
  onSearchTermChange,
  associatedDossier,
  onDossierAssociated,
}: ActionBarProps) {

  // Esta função agora apenas repassa o arquivo selecionado
  const handleActualCsvFileSelected = (file: File) => {
    onCsvFileSelected(file); // Chama a função passada por props (que será handleProcessCsvFile)
  };

  return (
    <div className="mt-2">
      {/* Barra de ferramentas - sempre visível */}
      <div className="flex justify-between items-center mb-3 px-[6vh] pl-[8.5vh]">
        <div className="flex items-center gap-2 -ml-5">
          <BaseInput
            type="text"
            placeholder="Procure pelo aluno"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="border bg-[#F5F5F5] border-[#B3B3B3] rounded-full w-[40vw] px-[2vh] py-[1vh] text-[1.5vh]"
          />
        </div>
        <div className="flex items-center gap-3">
          {/* Show "Trocar Dossiê" button if dossier is associated, otherwise show "Associar Dossiê" */}
          <AssociarDossie
            mainColor={mainColor}
            hoverColor={hoverColor}
            associatedDossier={associatedDossier}
            onDossierAssociated={onDossierAssociated}
          />
          <ColoredButton
            mainColor={mainColor}
            hoverColor={hoverColor}
            text={'Adicionar Aluno'}
            icon={<Plus size={20} color="white" />}
            onClick={onAddStudentClick}
          />

          <ImportCSVButton
            onFileSelected={handleActualCsvFileSelected}
            icon={<ClipboardEdit size={18} color="white" />}
            mainColor={mainColor}
            hoverColor={hoverColor}
          />
        </div>
      </div>
    </div>
  );
}