"use client" 
// Diretiva do Next.js que indica que este componente roda no lado do cliente (client component).

import { Button } from "@/components/ui/button"; 
// Importa o componente de botão customizado do projeto.

import { 
    Dialog, DialogContent, DialogOverlay, DialogTitle 
} from "@/components/ui/dialog"; 
// Importa os componentes relacionados ao Dialog (modal) da biblioteca de UI do projeto.

import { useState } from "react"; 
// Importa hooks do React. 
import { useRouter } from "next/navigation"; // Importa o hook de navegação do Next.js

import { Folder, Plus, Copy } from "lucide-react"; 
import DossieTemplateDialog from "./dossieTemplateDialog";
// Importa o ícone de pasta (Folder) da biblioteca de ícones `lucide-react`.

// Tipagem das props recebidas no componente.
interface TypeOfCreationModalProps {
    open: boolean;        // Controla se o Dialog está aberto ou fechado.
    onClose: () => void;  // Função chamada quando o modal deve ser fechado.
}

// Componente principal que representa o modal de criação de dossiês.
export default function TypeOfCreationModal({ open, onClose }: TypeOfCreationModalProps) {
    const [openTemplateDossie, setOpenTemplateDossie] = useState(false); 
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
        setOpenTemplateDossie(true)

    }

    return (
        <>
            {/* Componente Dialog que controla a abertura e fechamento do modal */}
            <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
                {/* Overlay do modal (fundo escuro com blur) */}
                <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Conteúdo do modal */}
                <DialogContent className="max-w-4xl bg-white rounded-3xl text-gray-900 border-0 shadow-2xl p-0 overflow-hidden">
                    {/* Título acessível apenas para leitores de tela */}
                    <DialogTitle className="sr-only">Criar Novo Dossiê</DialogTitle>

                    {/* Header with gradient background */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 relative">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-2xl shadow-lg">
                                <Folder className="w-8 h-8 text-gray-900" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-white">Criação de Dossiês</h2>
                                <p className="text-white/80 mt-2">Escolha como você gostaria de criar seu dossiê</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* New Dossier Card */}
                            <div className="group cursor-pointer" onClick={handleClickNewDossie}>
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6 h-full transition-all duration-300 hover:border-gray-900 hover:shadow-xl hover:scale-105">
                                    <div className="flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-4 group-hover:bg-gray-800 transition-colors duration-200">
                                        <Plus className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Criar Novo Dossiê</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Comece do zero e crie um dossiê personalizado com suas próprias seções e critérios de avaliação.
                                    </p>
                                </div>
                            </div>

                            {/* Template Dossier Card */}
                            <div className="group cursor-pointer" onClick={handleClickUsedDossie}>
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6 h-full transition-all duration-300 hover:border-gray-900 hover:shadow-xl hover:scale-105">
                                    <div className="flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-4 group-hover:bg-gray-800 transition-colors duration-200">
                                        <Copy className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Usar Modelo</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Baseie-se em um dossiê existente como modelo para criar um novo com estrutura similar.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Additional info */}
                        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <p className="text-blue-800 text-sm">
                                <strong>Dica:</strong> Você pode sempre editar e personalizar seu dossiê depois de criá-lo.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-8 py-6 flex justify-end">
                        <Button 
                            onClick={onClose}
                            variant="outline"
                            className="h-12 text-base font-medium border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-6 py-3 shadow-md border transition-all duration-200 hover:shadow-lg flex items-center gap-2 cursor-pointer"
                        >
                            Cancelar
                        </Button>
                    </div>

                    <DossieTemplateDialog
                        open={openTemplateDossie}
                        onClose={()=> setOpenTemplateDossie(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
