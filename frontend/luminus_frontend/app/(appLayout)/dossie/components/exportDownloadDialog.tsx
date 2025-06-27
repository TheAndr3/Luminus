"use client" 
// Diretiva do Next.js que indica que este componente roda no lado do cliente (client component).

import { Button } from "@/components/ui/button"; 
// Importa o componente de botão customizado do projeto.

import { 
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, 
    DialogHeader, DialogOverlay, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog"; 
// Importa os componentes relacionados ao Dialog (modal) da biblioteca de UI do projeto.

import { use, useEffect, useState } from "react"; 
// Importa hooks do React. 

import { Folder, Download } from "lucide-react"; 
// Importa o ícone de pasta (Folder) da biblioteca de ícones `lucide-react`.

import { ExportDossierToCsv } from "@/services/exportDossierService";
import { Dossie } from "./types";

// Tipagem das props recebidas no componente.
interface ExportDownloadDialogProps {
    open: boolean;        // Controla se o Dialog está aberto ou fechado.
    IdToExport: number[]
    onClose: () => void;  // Função chamada quando o modal deve ser fechado.
    description: string,
    typeOfData: string,
    dossies: Dossie[] // Lista completa de dossiês para mostrar os selecionados
}

// Componente principal que representa o modal de exportação de dossiês.
export default function ExportDownloadDialog({ open, IdToExport, onClose, description, typeOfData, dossies }: ExportDownloadDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");

    // Filtrar apenas os dossiês selecionados
    const selectedDossies = dossies.filter(dossie => IdToExport.includes(dossie.id));

    // Função chamada quando o usuário clica no link pra baixar
    const handleClickDownloadDossie = async () => {
        if (IdToExport.length === 0) {
            setError("Nenhum dossiê selecionado para exportar.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // Para múltiplos dossiês, exportar um por vez
            for (const dossierId of IdToExport) {
                const csvContent = await ExportDossierToCsv(dossierId);
                
                // Encontrar o dossiê para obter o nome
                const dossier = selectedDossies.find(d => d.id === dossierId);
                const fileName = dossier ? 
                    `dossie_${dossier.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv` : 
                    `dossie_${dossierId}.csv`;
                
                // Criar e baixar o arquivo
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', fileName);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (error: any) {
            setError(error.message || "Erro ao exportar o(s) dossiê(s)");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (open) {
            setError("");
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogOverlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" />
            
            <DialogContent className="max-w-4xl bg-gray-300 text-white rounded-2xl border border-black p-6">
                <DialogHeader>
                    <DialogTitle className="text-4xl font-bold text-center mb-2 text-black">
                        Exportar Dossiês
                    </DialogTitle>
                    <DialogDescription className="text-center text-black text-lg">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Lista de dossiês selecionados */}
                    <div className="w-full min-h-[300px] space-y-2">
                        {selectedDossies.length === 0 ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="text-black text-xl">
                                    Nenhum dossiê selecionado para exportar
                                </div>
                            </div>
                        ) : (
                            <>
                                {selectedDossies.map((dossie) => (
                                    <div
                                        key={dossie.id}
                                        className="bg-gray-900 text-white rounded flex items-center h-16 w-full"
                                    >
                                        <div className="flex items-center justify-center w-20 flex-shrink-0 p-2">
                                            <Folder className="w-10 h-10 text-white" />
                                        </div>
                                        <div className="flex-1 p-2 text-xl whitespace-nowrap overflow-hidden text-ellipsis pl-4">
                                            {dossie.name}
                                        </div>
                                        <div className="flex-1 p-2 text-sm text-gray-300 pl-4">
                                            {dossie.description}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Mensagem de erro */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-8 rounded-full shadow-md border border-gray-400 transition-all duration-200 hover:shadow-lg cursor-pointer"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleClickDownloadDossie}
                        disabled={isLoading || selectedDossies.length === 0}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-8 rounded-full shadow-md border border-gray-700 transition-all duration-200 hover:shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                        <Download className="h-5 w-5" />
                        {isLoading ? "Exportando..." : `Baixar ${selectedDossies.length} dossiê(s)`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
