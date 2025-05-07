import { LayoutGrid } from "lucide-react";
import { useState } from "react";

// Define a interface para o componente
interface ClassViewModeProps {
  visualization: string;
  setVisualization: (set: 'grid' | 'list') => void;
}

export default function ClassViewMode({ visualization, setVisualization }: ClassViewModeProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Função para alternar entre os modos 'grid' e 'list'
  const handleClick = () => {
    setVisualization(isOpen ? 'list' : 'grid');
    setIsOpen(!isOpen);
  };

  // Classe CSS para o botão de grid
  const gridButtonClass = `cursor-pointer p-1 rounded-full w-7 h-7 
    ${visualization === 'grid' ? 'bg-blue-200' : 'bg-gray-300 hover:bg-gray-400'} 
    text-black`;

  return (
    <div>
      <LayoutGrid
        onClick={handleClick}
        className={gridButtonClass}
      />
    </div>
  );
}
