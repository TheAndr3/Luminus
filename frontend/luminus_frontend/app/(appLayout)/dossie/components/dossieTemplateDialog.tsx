"use client" 
// Diretiva do Next.js que indica que este componente roda no lado do cliente (client component).
// Necessário para usar hooks como useState, useRouter, etc.

import { Button } from "@/components/ui/button"; 
// Importa o componente de botão customizado do projeto.

import { 
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, 
    DialogHeader, DialogOverlay, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog"; 
// Importa os componentes relacionados ao Dialog (modal) da biblioteca de UI do projeto.
// Estes componentes formam a estrutura base do modal.

import { useRouter } from "next/navigation"; 
// Importa o hook de navegação do Next.js para redirecionamento entre páginas

import { Folder, X, Search } from "lucide-react"; 
// Importa o ícone de pasta da biblioteca de ícones `lucide-react`.

import { BaseInput } from "@/components/inputs/BaseInput";
// Importa componente customizado de input para a barra de busca

import { useState, useEffect, useRef } from "react";
// Hooks do React para gerenciar estados locais e efeitos colaterais do componente

import { Dossie } from "./types";
// Importa a tipagem TypeScript para definir a estrutura de um dossiê

import PageController from "./paginationController";
// Importa componente responsável pela paginação dos dossiês

import { listDossiers } from "@/services/dossierServices";

// Tipagem das props recebidas no componente.
interface DossieTemplateDialogProps {
    open: boolean;        // Controla se o Dialog está aberto ou fechado.
    onClose: () => void;  // Função chamada quando o modal deve ser fechado.
}

// Componente principal que representa o modal de seleção de dossiês.
export default function DossieTemplateDialog({ open, onClose }: DossieTemplateDialogProps) {

    const router = useRouter(); 
    // Inicializa o router do Next.js
    
    const [searchTerm, setSearchTerm] = useState("");
    // Estado para armazenar o termo de busca digitado pelo usuário
    
    const [currentPage, setCurrentPage] = useState(0);
    // Estado para controlar qual página da paginação está sendo exibida
    
    const [dossies, setDossies] = useState<Dossie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalItems, setTotalItems] = useState(0); // total de dossiês para paginação
    const searchTimeout = useRef<NodeJS.Timeout | null>(null); // debounce

    const dossiesPerPage = 6;
    const totalPages = Math.ceil(totalItems / dossiesPerPage);

    // Busca server-side
    const fetchDossies = async (searchValue = searchTerm, page = currentPage) => {
        if (!open) return;
        try {
            setLoading(true);
            setError(null);
            const professorId = Number(localStorage.getItem('professorId'));
            if (!professorId) throw new Error('ID do professor não encontrado');
            const start = page * dossiesPerPage;
            const response = await listDossiers(professorId, start, dossiesPerPage, searchValue);
            // Map to Dossie type
            setDossies((response.data || []).map((d: any) => ({
                id: d.id,
                name: d.name,
                description: d.description,
                evaluation_method: d.evaluation_method,
                professor_id: d.costumUser_id,
                selected: false
            })));
            setTotalItems(response.ammount || 0);
        } catch (error: any) {
            setError(error.message || 'Erro ao carregar dossiês');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDossies();
        // eslint-disable-next-line
    }, [open, currentPage]);

    // Debounce para busca
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(0);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchDossies(value, 0);
        }, 400);
    };

    // =============================================================================
    // HANDLERS (MANIPULADORES DE EVENTOS)
    // =============================================================================
    const handleClickDossie = (selectedDossie: Dossie) => {
        // Redireciona para a página de criação de dossiê com o templateId
        router.push(`/dossie/crud?templateId=${selectedDossie.id}`);
    }

    return (
        <>
            {/* =================================================================== */}
            {/* ESTRUTURA DO MODAL                                                  */}
            {/* =================================================================== */}
            
            {/* Componente Dialog que controla a abertura e fechamento do modal */}
            <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
                
                {/* Overlay do modal (fundo escuro com blur) */}
                <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Conteúdo principal do modal */}
                <DialogContent className="max-w-2xl bg-white rounded-3xl text-gray-900 border-0 shadow-2xl p-0 overflow-hidden">
                    
                    {/* Título acessível apenas para leitores de tela (acessibilidade) */}
                    <DialogTitle className="sr-only">Escolha o dossiê a ser usado</DialogTitle>

                    {/* Red X Close Button */}
                    <button
                        onClick={onClose}
                        className="flex absolute top-4 right-4 gap-1 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition z-10"
                    >
                        <X className="h-6 w-6" />
                        <span className="sr-only">Close</span>
                    </button>

                    {/* Header with gradient background */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 relative">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-2xl shadow-lg">
                                <Folder className="w-8 h-8 text-gray-900" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white">
                                    Escolha o dossiê a ser usado
                                </h2>
                                <p className="text-white/80 mt-1 text-sm">
                                    Selecione um dossiê existente como modelo para criar um novo
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search Section */}
                    <div className="p-6 pb-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <BaseInput
                                type="text"
                                placeholder="Procure pelo dossiê..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="border bg-[#F5F5F5] border-[#B3B3B3] rounded-full w-full px-4 py-3 text-base font-normal text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all duration-200 pl-12"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-3"></div>
                                    <p className="text-gray-600">Carregando dossiês...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                                <p className="text-red-700 font-medium mb-3">{error}</p>
                                <Button 
                                    onClick={() => window.location.reload()} 
                                    className="h-10 text-base font-medium bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-2 shadow-md border border-red-600 transition-all duration-200 hover:shadow-lg flex items-center gap-2 cursor-pointer"
                                >
                                    Tentar novamente
                                </Button>
                            </div>
                        ) : dossies.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-300">
                                    <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        {searchTerm ? `Nenhum dossiê encontrado` : 'Nenhum dossiê disponível'}
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        {searchTerm ? `Nenhum resultado para "${searchTerm}"` : 'Crie seu primeiro dossiê para começar'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {dossies.map((dossie) => (
                                    <div
                                        key={dossie.id}
                                        onClick={() => handleClickDossie(dossie)}
                                        className="bg-white border border-gray-200 rounded cursor-pointer flex items-center h-12 w-full hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-center w-16 flex-shrink-0 p-2">
                                            <Folder className="w-8 h-8 text-gray-900" />
                                        </div>
                                        <div className="flex-1 p-2 text-base whitespace-nowrap overflow-hidden text-ellipsis pl-4 font-normal">
                                            {dossie.name}
                                        </div>
                                    </div>
                                ))}
                                
                                {totalItems > dossiesPerPage && (
                                    <div className="mt-4 flex justify-center">
                                        <PageController
                                            currentPage={currentPage + 1}
                                            totalPages={totalPages}
                                            setCurrentPage={page => setCurrentPage(page - 1)}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}