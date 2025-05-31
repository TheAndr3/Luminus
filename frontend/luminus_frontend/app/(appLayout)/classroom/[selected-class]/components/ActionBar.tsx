// Em: [selected-class]/components/ActionBar.tsx

import { BaseInput } from "@/components/inputs/BaseInput"; //
import { ColoredButton } from "@/components/colored-button/colored-button"; //
import { ImportCSVButton } from "@/components/button-csv/import-csv-button"; //
import { Plus, ClipboardEdit } from 'lucide-react';
import React from 'react';

interface ActionBarProps {
  mainColor?: string;
  hoverColor: string;
  onAddStudentClick?: () => void;
  onCsvFileSelected: (file: File) => void; // Modificado para aceitar File
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}

export function ActionBar({
  mainColor,
  hoverColor,
  onAddStudentClick,
  onCsvFileSelected, // Nome da prop continua o mesmo
  searchTerm,
  onSearchTermChange,
}: ActionBarProps) {

  // Esta função agora apenas repassa o arquivo selecionado
  const handleActualCsvFileSelected = (file: File) => {
    onCsvFileSelected(file); // Chama a função passada por props (que será handleProcessCsvFile)
  };

  return (
    <div className="mt-6 flex justify-between items-center">
      <div className="flex justify-center items-center">
        <BaseInput
          type="text"
          placeholder="Procure pelo aluno" // Modificado placeholder
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="border rounded-full w-250 px-4 py-2" // Pode ajustar w-250 se necessário
        />
      </div>

      <div className="flex items-center gap-3">
        <ColoredButton
          mainColor={mainColor}
          hoverColor={hoverColor}
          text={'Adicionar Aluno'}
          icon={<Plus size={20} color="white" />}
          onClick={onAddStudentClick}
        />

        <ImportCSVButton
          onFileSelected={handleActualCsvFileSelected} // Modificado para chamar o handler interno
          icon={<ClipboardEdit size={18} color="white" />}
          mainColor={mainColor}
          hoverColor={hoverColor}
        />
      </div>
    </div>
  );
}