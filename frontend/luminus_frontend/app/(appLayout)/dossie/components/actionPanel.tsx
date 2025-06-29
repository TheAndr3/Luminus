// O caminho pode ser em /dossie/ ou /classroom/, pois agora é reutilizável.
// Ex: app/(appLayout)/dossie/components/actionPanel.tsx

import { Trash2, Archive, Download } from "lucide-react";

// A interface foi atualizada para ser mais flexível.
// onArchive e toExport são opcionais, permitindo que o painel
// seja usado em diferentes contextos (dossiês e turmas).
interface ActionPanelProps {
    onDelete: () => void;
    onArchive?: () => void;
    toExport?: () => void;
}

export default function ActionPanel({ onDelete, onArchive, toExport }: ActionPanelProps) {
    // O código foi limpo para remover todas as variáveis e importações não utilizadas.
    // A lógica agora renderiza os botões condicionalmente, com base nas props recebidas.

    return (
        <div className="left-4 bg-gray-900 shadow-lg rounded-xl flex flex-row gap-4 z-50 w-fit p-2">
            {/* O botão de excluir é sempre exibido */}
            <button
                title="Excluir selecionados"
                onClick={onDelete}
                className="hover:bg-red-800/50 p-2 rounded-xl cursor-pointer transition-colors"
            >
                <Trash2 className="w-6 h-6 text-white" />
            </button>

            {/* O botão de arquivar só é exibido se a função onArchive for fornecida */}
            {onArchive && (
                <button
                    title="Arquivar selecionados"
                    onClick={onArchive}
                    className="hover:bg-yellow-800/50 p-2 rounded-xl cursor-pointer transition-colors"
                >
                    <Archive className="w-6 h-6 text-white" />
                </button>
            )}

            {/* O botão de exportar só é exibido se a função toExport for fornecida */}
            {toExport && (
                 <button
                    title="Exportar selecionados"
                    onClick={toExport}
                    className="hover:bg-blue-800/50 p-2 rounded-xl cursor-pointer transition-colors"
                >
                    <Download className="w-6 h-6 text-white" />
                </button>
            )}
        </div>
    );
}