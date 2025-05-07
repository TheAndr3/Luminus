import { LayoutGrid } from "lucide-react";

interface ClassViewModeProps {
  visualization: string;
  setVisualization: (set: 'grid' | 'list') => void;
}

export default function ClassViewMode({ visualization, setVisualization }: ClassViewModeProps) {

  const handleClick = () => {
    setVisualization(visualization === 'grid' ? 'list' : 'grid');
  };

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
