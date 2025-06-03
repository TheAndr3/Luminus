"use client" 
// Diretiva do Next.js que indica que este componente roda no lado do cliente (client component).

import { Button } from "@/components/ui/button"; 
// Importa o componente de botão customizado do projeto.

import { 
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, 
    DialogHeader, DialogOverlay, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog"; 
// Importa os componentes relacionados ao Dialog (modal) da biblioteca de UI do projeto.

import { useState } from "react"; 
// Importa hooks do React. 
import { useRouter } from "next/navigation"; // Importa o hook de navegação do Next.js

import { Folder } from "lucide-react"; 
// Importa o ícone de pasta (Folder) da biblioteca de ícones `lucide-react`.

// Tipagem das props recebidas no componente.
interface TypeOfCreationModalProps {
    open: boolean;        // Controla se o Dialog está aberto ou fechado.
    onClose: () => void;  // Função chamada quando o modal deve ser fechado.
}

// Componente principal que representa o modal de criação de dossiês.
export default function TypeOfCreationModal({ open, onClose }: TypeOfCreationModalProps) {
    const [save, setSave] = useState(false); 
    const router = useRouter(); // Inicializa o router

    // Função chamada quando o usuário clica em "Criar novo dossiê".
    const handleClickNewDossie = () => {
        console.log('Botão clicado - tentando redirecionar');
        onClose(); // Fecha o modal
        router.push('/dossie/crud'); // Redireciona para a página de criação de dossiê
    }

    // Função chamada quando o usuário clica em "Criar a partir de um modelo".
    const handleClickUsedDossie = () => {
        // TODO: Implementar a lógica para criar a partir de um dossiê existente.
    }

    return (
        <>
            {/* Componente Dialog que controla a abertura e fechamento do modal */}
            <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
                {/* Overlay do modal (fundo escuro com blur) */}
                <DialogOverlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" />

                {/* Conteúdo do modal */}
                <DialogContent className="h-[400px] max-w-6xl bg-gray-300 rounded-2xl text-white border-3 border-black">
                    {/* Título acessível apenas para leitores de tela */}
                    <DialogTitle className="sr-only">Criar Nova Turma</DialogTitle>

                    {/* Cabeçalho do modal */}
                    <div className="relative mb-6">
                        {/* Ícone à esquerda, posicionado absolutamente */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-38 rounded-lg">
                            <Folder color="black" size={50} /> 
                            {/* Ícone de pasta */}
                        </div>

                        {/* Texto centralizado no cabeçalho */}
                        <div className="flex items-center gap-2 justify-center">
                            <span className="text-4xl font-bold text-black">Criação de dossiês</span>
                        </div>
                    </div>

                    {/* Área dos botões */}
                    <div className="flex justify-center h-20 gap-26">
                        {/* Botão para criar um novo dossiê */}
                        <Button 
                            onClick={handleClickNewDossie} 
                            className="bg-gray-400 hover:bg-gray-300 text-gray-800 font-medium py-3 px-14 rounded-full shadow-md border border-gray-300 transition-all duration-200 hover:shadow-lg"
                        >
                            Criar novo dossiê
                        </Button>

                        {/* Botão para criar a partir de um modelo existente */}
                        <Button 
                            onClick={handleClickUsedDossie} 
                            className="bg-gray-400 hover:bg-gray-300 text-gray-800 font-medium py-3 px-8 rounded-full shadow-md border border-gray-300 transition-all duration-200 hover:shadow-lg"
                        >
                            Criar a partir de um modelo
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
