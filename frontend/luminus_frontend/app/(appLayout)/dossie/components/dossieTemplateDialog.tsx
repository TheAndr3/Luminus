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

import { Folder } from "lucide-react"; 
// Importa o ícone de pasta da biblioteca de ícones `lucide-react`.

import { BaseInput } from "@/components/inputs/BaseInput";
// Importa componente customizado de input para a barra de busca

import { useState, useEffect } from "react";
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

    useEffect(() => {
        const fetchDossies = async () => {
            if (!open) return;
            
            try {
                setLoading(true);
                setError(null);
                const professorId = Number(localStorage.getItem('professorId'));
                
                if (!professorId) {
                    throw new Error('ID do professor não encontrado');
                }

                const response = await listDossiers(professorId);
                if (response.data) {
                    setDossies(response.data);
                }
            } catch (error: any) {
                console.error('Falha ao carregar dossiês:', error);
                setError(error.message || 'Erro ao carregar dossiês');
            } finally {
                // Remove o loading independente do resultado
                setLoading(false);
            }
        };

        fetchDossies();
    }, [open]);

    // =============================================================================
    // LÓGICA DE PAGINAÇÃO E FILTRO
    // =============================================================================
    const dossiesPerPage = 6;
    // Define quantos dossiês serão exibidos por página
    
    const filteredDossies = dossies.filter(dossie =>
        dossie.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Filtra os dossiês baseado no termo de busca, ignorando maiúsculas/minúsculas
    
    const totalPages = Math.ceil(filteredDossies.length / dossiesPerPage);
    // Calcula o número total de páginas baseado nos dossiês filtrados

    // =============================================================================
    // HANDLERS (MANIPULADORES DE EVENTOS)
    // =============================================================================
    const handleClickDossie = (selectedDossie: Dossie) => {
        // Função executada quando um dossiê é selecionado
        console.log('Dossiê selecionado:', selectedDossie);
        
        // Aqui você pode implementar diferentes ações:
        
        // 1. Navegar para página específica do dossiê
        // router.push(`/dossie/${selectedDossie.id}`);
        
        // 2. Callback para componente pai
        // onDossieSelected?.(selectedDossie);
        
        // 3. Armazenar no estado global/contexto
        // dispatch({ type: 'SET_SELECTED_DOSSIE', payload: selectedDossie });
        
        // 4. Fechar modal e continuar fluxo
        // onClose();
        
        // Por enquanto, apenas mostra um alert com as informações
        alert(`Dossiê selecionado: ${selectedDossie.name}\nID: ${selectedDossie.id}\nProfessor ID: ${selectedDossie.professor_id}`);
    }

    return (
        <>
            {/* =================================================================== */}
            {/* ESTRUTURA DO MODAL                                                  */}
            {/* =================================================================== */}
            
            {/* Componente Dialog que controla a abertura e fechamento do modal */}
            <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
                
                {/* Overlay do modal (fundo escuro com blur) */}
                <DialogOverlay className="fixed inset-0 backdrop-blur-xs" />

                {/* Conteúdo principal do modal */}
                <DialogContent className="h-[600px] max-w-6xl bg-gray-300 rounded-2xl text-white border-3 border-black">
                    
                    {/* Título acessível apenas para leitores de tela (acessibilidade) */}
                    <DialogTitle className="sr-only">Escolha o dossiê a ser usado</DialogTitle>

                    {/* ======================================================= */}
                    {/* CABEÇALHO DO MODAL                                      */}
                    {/* ======================================================= */}
                    <div className="relative mb-6">
                        
                        {/* Container principal do cabeçalho com ícone e título */}
                        <div className="flex items-center gap-2 justify-center">
                            
                            {/* Ícone de pasta posicionado à esquerda */}
                            <div className="absolute left-0 top-18 -translate-y-1/2 w-12 h-38 rounded-lg">
                                <Folder color="black" size={50} /> 
                            </div>
                            
                            {/* Título principal do modal */}
                            <span className="text-4xl font-bold text-black">
                                Escolha o dossiê a ser usado 
                            </span>
                        </div>

                        {/* ======================================================= */}
                        {/* BARRA DE BUSCA                                          */}
                        {/* ======================================================= */}
                        <div className="flex justify-center items-center my-[2vh] mb-[4vh]">
                            <BaseInput
                                type="text"
                                placeholder="Procure pelo dossiê"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white border rounded-full w-[40vw] px-[2vh] py-[1vh] text-[1.5vh] placeholder-black text-black"
                            />
                            {/* 
                            Input controlado que:
                            - Armazena o valor no estado searchTerm
                            - Atualiza o estado a cada digitação
                            - Aplica filtro em tempo real na lista de dossiês
                            */}
                        </div>
                    </div>

                    {/* ======================================================= */}
                    {/* LISTA DE DOSSIÊS                                        */}
                    {/* ======================================================= */}
                    <div className="w-full min-h-[300px] space-y-2">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="text-black text-xl">Carregando dossiês...</div>
                            </div>
                        ) : error ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="text-red-600 text-xl text-center">
                                    <p>Erro ao carregar dossiês:</p>
                                    <p className="text-sm mt-2">{error}</p>
                                    <button 
                                        onClick={() => window.location.reload()} 
                                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Tentar novamente
                                    </button>
                                </div>
                            </div>
                        ) : filteredDossies.length === 0 ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="text-black text-xl">
                                    {searchTerm ? 
                                        `Nenhum dossiê encontrado para "${searchTerm}"` : 
                                        'Nenhum dossiê disponível'
                                    }
                                </div>
                            </div>
                        ) : (
                            <>
                                {filteredDossies
                                    .slice(currentPage * dossiesPerPage, (currentPage + 1) * dossiesPerPage)
                                    .map((dossie) => (
                                        <div
                                            key={dossie.id}
                                            onClick={() => handleClickDossie(dossie)}
                                            className="bg-[#0A2B3D] text-white rounded cursor-pointer flex items-center h-16 w-full hover:bg-[#0E3A4F] transition-colors"
                                        >
                                            <div className="flex items-center justify-center w-20 flex-shrink-0 p-2">
                                                <Folder className="w-10 h-10 text-white" />
                                            </div>
                                            <div className="flex-1 p-2 text-xl whitespace-nowrap overflow-hidden text-ellipsis pl-4">
                                                {dossie.name}
                                            </div>
                                        </div>
                                    ))}
                                {filteredDossies.length > 0 && (
                                    <div className="mt-2">
                                        <PageController
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            setCurrentPage={setCurrentPage}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}