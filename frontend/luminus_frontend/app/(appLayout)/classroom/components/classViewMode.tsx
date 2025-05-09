// Importa o ícone LayoutGrid da biblioteca lucide-react
import { LayoutGrid } from "lucide-react";

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

  // Define a classe CSS com base no modo de visualização atual
  // Aplica um fundo azul claro quando o modo é 'grid', e cinza caso contrário
  const gridButtonClass = `cursor-pointer p-1 rounded-full w-7 h-7 
    ${visualization === 'grid' ? 'bg-blue-200' : 'bg-gray-300 hover:bg-gray-400'} 
    text-black`;

  // Renderiza o ícone LayoutGrid com estilos e comportamento de clique
  return (
    <div>
      <LayoutGrid
        onClick={handleClick} // Alterna o modo ao clicar
        className={gridButtonClass} // Aplica estilos condicionais
      />
    </div>
  );
}
