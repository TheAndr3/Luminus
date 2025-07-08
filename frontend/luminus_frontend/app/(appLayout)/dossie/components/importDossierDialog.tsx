"use client"

import { Button } from "@/components/ui/button";
import { 
    Dialog, DialogContent, DialogDescription, DialogFooter, 
    DialogHeader, DialogOverlay, DialogTitle
} from "@/components/ui/dialog";
import { useState } from "react";
import { Upload, FileText } from "lucide-react";
import { ImportDossierFromCsv } from "@/services/importDossierService";
import { useRouter } from "next/navigation";

interface ImportDossierDialogProps {
    open: boolean;
    onClose: () => void;
    onImportSuccess: () => void;
}

export default function ImportDossierDialog({ open, onClose, onImportSuccess }: ImportDossierDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const router = useRouter();

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Verificar se é um arquivo CSV
            if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
                setError("Por favor, selecione um arquivo CSV válido.");
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
            setError("");
        }
    };

    const handleImport = async () => {
        if (!selectedFile) {
            setError("Por favor, selecione um arquivo para importar.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const fileContent = await selectedFile.text();
            
            // Obter o ID do professor do localStorage
            const professorId = localStorage.getItem('professorId');
            if (!professorId) {
                throw new Error('ID do professor não encontrado');
            }

            const result = await ImportDossierFromCsv(fileContent, Number(professorId));
            
            // Limpar o formulário e fechar o modal
            setSelectedFile(null);
            onClose();
            
            // Redirecionar para a página de edição do dossiê criado ANTES de chamar onImportSuccess
            if (result.dossierId) {
                router.push(`/dossie/crud?mode=update&id=${result.dossierId}`);
            }
            
            // Chamar o callback de sucesso após a redireção
            onImportSuccess();
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Erro ao importar o dossiê. Verifique se o arquivo está no formato correto.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setError("");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogOverlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" />
            
            <DialogContent className="max-w-md bg-white rounded-2xl text-gray-800 border border-gray-300">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-center mb-2">
                        Importar Dossiê
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                        Selecione um arquivo CSV para importar um dossiê
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Área de upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                            disabled={isLoading}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-sm text-gray-600">
                                {selectedFile ? selectedFile.name : "Clique para selecionar um arquivo CSV"}
                            </p>
                        </label>
                    </div>

                    {/* Arquivo selecionado */}
                    {selectedFile && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-medium">{selectedFile.name}</span>
                        </div>
                    )}

                    {/* Mensagem de erro */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-8 rounded-full shadow-md border border-gray-300 transition-all duration-200 hover:shadow-lg cursor-pointer"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!selectedFile || isLoading}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-8 rounded-full shadow-md border border-gray-700 transition-all duration-200 hover:shadow-lg cursor-pointer"
                    >
                        {isLoading ? "Importando..." : "Importar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}