import { useRef, ReactNode } from "react"; // Adicionado ReactNode
import { Button } from "@/components/ui/button";

interface ImportCSVButtonProps {
  onFileSelected: (file: File) => void;
  icon?: ReactNode; // Prop para o ícone
  // A estilização do botão em si virá da className ou do componente Button base
}

export function ImportCSVButton({ onFileSelected, icon }: ImportCSVButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.value = ""; // Limpa para permitir re-seleção
      inputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".csv"
        ref={inputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        onClick={handleButtonClick}
        className="bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-full px-4 py-1 h-9 flex items-center gap-2 text-sm"
      >
        {icon && <span>{icon}</span>} {/* Renderiza o ícone aqui */}
        <span>Importar CSV</span>
      </Button>
    </>
  );
}
