// Em: app/(appLayout)/classroom/[selected-class]/components/ActionPanel.tsx

import { Trash2, Archive } from "lucide-react";

// Interface define que o componente espera duas funções: onDelete e onArchive.
interface ActionPanelProps {
    onDelete: () => void;
    onArchive: () => void;
}

export default function ActionPanel({ onDelete, onArchive }: ActionPanelProps) {
    // Todas as funções, props e importações que não estavam sendo usadas foram removidas
    // para limpar o código e resolver os erros do ESLint.

    return (
        <div className="left-4 bg-gray-900 shadow-lg rounded-xl flex flex-row gap-4 z-50 w-fit p-2">
            <button
                title="Excluir selecionados"
                onClick={onDelete}
                className="hover:bg-red-800/50 p-2 rounded-xl cursor-pointer transition-colors"
            >
                <Trash2 className="w-6 h-6 text-white" />
            </button>
            <button
                title="Arquivar selecionados"
                onClick={onArchive}
                className="hover:bg-yellow-800/50 p-2 rounded-xl cursor-pointer transition-colors"
            >
                <Archive className="w-6 h-6 text-white" />
            </button>
        </div>
    );
}