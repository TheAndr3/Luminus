// Importa os ícones LayoutGrid e List da biblioteca lucide-react
import { LayoutGrid, List } from "lucide-react";

// Define as props esperadas pelo componente: o modo de visualização atual
// e a função que permite atualizá-lo
interface ClassViewModeProps {
  visualization: string;
  setVisualization: (set: 'grid' | 'list') => void;
}

// Componente funcional que renderiza um botão para alternar o modo de visualização
export default function ClassViewMode({ visualization, setVisualization }: ClassViewModeProps) {

  // Função chamada ao clicar no ícone; alterna entre 'grid' e 'list'
  const handleClick = () => {
    setVisualization(visualization === 'grid' ? 'list' : 'grid');
  };

  // Renderiza o ícone apropriado com base no modo de visualização atual
  // Se estiver em modo grid, mostra o ícone de lista, e vice-versa
  return (
    <div>
      {visualization === 'grid' ? (
        <button
          onClick={handleClick}
          className="cursor-pointer p-1 rounded-full w-7 h-7 bg-gray-300 hover:bg-gray-400 text-black"
        >
          <List className="w-full h-full" />
        </button>
      ) : (
        <button
          onClick={handleClick}
          className="cursor-pointer p-1 rounded-full w-7 h-7 bg-gray-300 hover:bg-gray-400 text-black"
        >
          <LayoutGrid className="w-full h-full" />
        </button>
      )}
    </div>
  );
}
