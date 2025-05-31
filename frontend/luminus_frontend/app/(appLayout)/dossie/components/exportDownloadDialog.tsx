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



import { Folder } from "lucide-react"; 
// Importa o ícone de pasta (Folder) da biblioteca de ícones `lucide-react`.

// Tipagem das props recebidas no componente.
interface ExportDownloadDialogProps {
    open: boolean;        // Controla se o Dialog está aberto ou fechado.
    IdDossieToExport: number[]
    onClose: () => void;  // Função chamada quando o modal deve ser fechado.
    description: string

}

// Componente principal que representa o modal de criação de dossiês.
export default function ExportDownloadDialog({ open, IdDossieToExport,onClose,description }: ExportDownloadDialogProps) {
    const [descriptionButton, setDescriptionButton] = useState<number[]>([]);

    // Função chamada quando o usuário clica no link pra baixar
    const handleClickDownloadDossie = () => {
        // TODO: Implementar a lógica para buscar os ids no banco e possibilitar o downloads
        alert("Acontece algo: baixando dossies...")
        
    }

    // Função chamada quando o usuário clica em concluir
    const handleClickConfirm = () => {
        onClose()
    }

    
    useEffect(() => {
    if (open) {
        setDescriptionButton(IdDossieToExport);
    }
    }, [open]);

    return (
        <>
            {/* Componente Dialog que controla a abertura e fechamento do modal */}
            <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
                {/* Overlay do modal (fundo escuro com blur) */}
                <DialogOverlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" />

                {/* Conteúdo do modal */}
                <DialogContent className="h-[400px] max-w-6xl bg-gray-300 rounded-2xl text-white border-3 border-black">
                    {/* Título acessível apenas para leitores de tela */}
                    <DialogTitle className="sr-only">DOSSIÊ EXPORTADO</DialogTitle>

                    {/* Cabeçalho do modal */}
                    <div className="relative mb-6">
                        {/* Ícone à esquerda, posicionado absolutamente */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-28 rounded-lg">
                            <Folder color="black" size={50} /> 
                            {/* Ícone de pasta */}
                        </div>

                        {/* Texto centralizado no cabeçalho */}
                        <div className="flex items-center gap-2 justify-center">
                            <span className="text-4xl font-bold text-black"> {description}</span>
                        </div>
                    </div>

                    {/* Área dos botões */}
                    <div className="flex justify-center h-20 gap-26">
                        {/* Botão para criar um novo dossiê */}
                        <Button 
                            onClick={handleClickDownloadDossie} 
                            className="bg-gray-400 hover:bg-gray-300 text-gray-800 font-medium py-10 px-50 rounded-2xl shadow-md border border-gray-300 transition-all duration-200 hover:shadow-lg"
                        >
                            {descriptionButton}
                        </Button>

                    </div>

                    <div className={"flex justify-end"}>
                        <Button onClick={handleClickConfirm} className="bg-gray-400 hover:bg-gray-300 text-gray-800 font-medium py-3 px-8 rounded-full shadow-md border border-gray-300 transition-all duration-200 hover:shadow-lg">
                            Concluir
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
