import { Trash2 } from "lucide-react"; // CORREÇÃO: Ícones não utilizados foram removidos.

interface ActionPanelProps {
    onDeleted: () => void;
    // CORREÇÃO: A prop 'toExport' foi removida pois não estava sendo usada.
}

// CORREÇÃO: A prop 'toExport' foi removida dos argumentos da função.
export default function ActionPanel({ onDeleted }: ActionPanelProps) {
    return (
        <div className="left-4 bg-gray-900 shadow-lg rounded-xl flex flex-row gap-4 z-50 w-fit">
            <button className="hover:bg-gray-800 cursor-pointer p-2 rounded-xl">
                <Trash2
                    className="w-6 h-6 text-white"
                    onClick={onDeleted}
                />
            </button>
            {/* O botão abaixo estava comentado, o que causava os erros.
                Se precisar reativá-lo, lembre-se de adicionar 'Download' ao import
                e a prop 'toExport' de volta à interface e à função. */}
            {/* 
            <button className="hover:bg-[#0A2B3D] cursor-pointer p-2 rounded-xl">
                <Download className="w-6 h-6 text-white"
                    onClick={toExport}
                />
            </button> 
            */}
        </div>
    );
}