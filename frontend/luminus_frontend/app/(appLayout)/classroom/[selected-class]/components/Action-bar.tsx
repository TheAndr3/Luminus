// Em: [selected-class]/components/Action-bar.tsx

import { BaseInput } from "@/components/inputs/BaseInput";
import { ColoredButton } from "@/components/colored-button/colored-button";
import { ImportCSVButton } from "@/components/button-csv/import-csv-button"; 
import { Plus, ClipboardEdit } from 'lucide-react'; // ClipboardEdit para o ícone de CSV

interface ActionBarProps {
  mainColor?: string; // Usado pelo ColoredButton "Adicionar Aluno"
  hoverColor: string;  // Usado pelo ColoredButton "Adicionar Aluno"
  onAddStudentClick?: () => void;
  // onEditClassClick não é mais necessário
  onCsvFileSelected: (file: File) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}

export function ActionBar({
  mainColor,
  hoverColor,
  onAddStudentClick,
  onCsvFileSelected,
  searchTerm,
  onSearchTermChange,
}: ActionBarProps) {
  return (
    <div className="mt-6 flex justify-between items-center">    
      {/* Input de busca (mantido) */}
      <div className="flex justify-center items-center">
        <BaseInput
          type="text"
          placeholder="Procure pela turma"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="border rounded-full w-250 px-4 py-2" // Você pode ajustar o estilo conforme necessário
        />
      </div>

      {/* Container dos botões */}
      <div className="flex items-center gap-3">
        {/* Botão Adicionar Aluno */}
        <ColoredButton
          mainColor={mainColor} // Cor vermelha principal passada de page.tsx
          hoverColor={hoverColor} // Cor vermelha mais escura para hover
          text={'Adicionar Aluno'}  
          icon={<Plus size={20} />} // Ícone de +
          onClick={onAddStudentClick}
          // className para corresponder ao estilo arredondado e tamanho, se necessário
          // Ex: className="px-4 py-1 h-9 text-sm" (ajuste o padding e altura conforme o ImportCSVButton)
        />

        {/* Botão Importar CSV */}
        <ImportCSVButton 
          onFileSelected={onCsvFileSelected}
          icon={<ClipboardEdit size={18} color={mainColor || "#dc3545"} />} // Usando mainColor para o ícone
        />
      </div>
    </div>    
  );
}
