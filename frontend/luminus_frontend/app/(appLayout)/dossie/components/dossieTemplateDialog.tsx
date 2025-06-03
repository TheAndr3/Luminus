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

// Tipagem das props recebidas no componente.
interface DossieTemplateDialogProps {
    open: boolean;        // Controla se o Dialog está aberto ou fechado.
    onClose: () => void;  // Função chamada quando o modal deve ser fechado.
}

// Componente principal que representa o modal de seleção de dossiês.
export default function DossieTemplateDialog({ open, onClose }: DossieTemplateDialogProps) {

    const router = useRouter(); 
    // Inicializa o router do Next.js (não está sendo usado no momento)
    
    const [searchTerm, setSearchTerm] = useState("");
    // Estado para armazenar o termo de busca digitado pelo usuário
    
    const [currentPage, setCurrentPage] = useState(0);
    // Estado para controlar qual página da paginação está being exibida
    
    // Estados para integração com backend (comentados para usar mock)
    // const [dossies, setDossies] = useState<Dossie[]>([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);

    // =============================================================================
    // BUSCA DADOS DO BACKEND (COMENTADO PARA USAR MOCK)
    // =============================================================================
    /*
    useEffect(() => {
        const fetchDossies = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Requisição para o endpoint do backend
                const response = await fetch('/api/dossies', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // Adicione headers de autenticação se necessário
                        // 'Authorization': `Bearer ${token}`,
                    },
                });

                // Verifica se a requisição foi bem-sucedida
                if (!response.ok) {
                    throw new Error(`Erro ao buscar dossiês: ${response.status} ${response.statusText}`);
                }

                // Converte a resposta para JSON
                const data = await response.json();
                
                // Atualiza o estado com os dados recebidos
                setDossies(data);
                
            } catch (err) {
                // Captura e trata erros
                const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar dossiês';
                setError(errorMessage);
                console.error('Erro ao buscar dossiês:', err);
                
            } finally {
                // Remove o loading independente do resultado
                setLoading(false);
            }
        };

        // Executa a função apenas quando o modal está aberto
        if (open) {
            fetchDossies();
        }
    }, [open]); // Dependência: reexecuta quando 'open' muda
    */
    
    // =============================================================================
    // DADOS MOCK - Exemplo populado para demonstração (ATIVO)
    // =============================================================================
    const dossies: Dossie[] = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,                              // ID único do dossiê
        name: `Dossiê ${i + 1}`,               // Nome do dossiê
        description: `Descrição do dossiê ${i + 1}`, // Descrição do dossiê
        evaluation_method: 'Prova escrita',     // Método de avaliação
        professor_id: 100 + i,                  // ID do professor responsável
    }));
    // Cria 30 dossiês fictícios para demonstração usando Array.from()
    // Para usar dados do backend, comente esta seção e descomente o useEffect acima

    // =============================================================================
    // LÓGICA DE PAGINAÇÃO E FILTRO
    // =============================================================================
    const dossiesPerPage = 5;
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
                        {/* Usando dados mock - para backend descomente as seções de loading/error */}
                        {filteredDossies.length === 0 ? (
                            // Estado sem resultados
                            <div className="flex justify-center items-center h-64">
                                <div className="text-black text-xl">
                                    {searchTerm ? 
                                        `Nenhum dossiê encontrado para "${searchTerm}"` : 
                                        'Nenhum dossiê disponível'
                                    }
                                </div>
                            </div>
                        ) : (
                            // Lista de dossiês (estado normal)
                            filteredDossies
                                .slice(currentPage * dossiesPerPage, (currentPage + 1) * dossiesPerPage)
                                // Aplica paginação: pega apenas os itens da página atual
                                .map((dossie) => (
                                    // Cada item da lista é renderizado como uma linha clicável
                                    <div
                                        key={dossie.id}
                                        onClick={() => handleClickDossie(dossie)}
                                        className="bg-[#0A2B3D] text-white rounded cursor-pointer flex items-center h-16 w-full hover:bg-[#0E3A4F] transition-colors"
                                    >
                                        {/* Container do ícone com largura fixa */}
                                        <div className="flex items-center justify-center w-20 flex-shrink-0 p-2">
                                            <Folder className="w-10 h-10 text-white" />
                                        </div>
                                        
                                        {/* Container do texto que ocupa o espaço restante */}
                                        <div className="flex-1 p-2 text-xl whitespace-nowrap overflow-hidden text-ellipsis pl-4">
                                            {dossie.name}
                                            {/* 
                                            Classes aplicadas:
                                            - flex-1: ocupa todo espaço disponível
                                            - whitespace-nowrap: impede quebra de linha
                                            - overflow-hidden: esconde texto que excede o container
                                            - text-ellipsis: adiciona "..." quando texto é cortado
                                            */}
                                        </div>
                                        
                                        
                                        
                                    </div>
                                ))
                        )}
                        
                        {/* Versão com loading/error para backend (comentada): */}
                        {/*
                        {loading ? (
                            // Estado de carregamento
                            <div className="flex justify-center items-center h-64">
                                <div className="text-black text-xl">Carregando dossiês...</div>
                            </div>
                        ) : error ? (
                            // Estado de erro
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
                            // Estado sem resultados...
                        ) : (
                            // Lista de dossiês...
                        )}
                        */}
                    </div>
                    
                    {/* ======================================================= */}
                    {/* CONTROLES DE PAGINAÇÃO                                  */}
                    {/* ======================================================= */}
                    {filteredDossies.length > 0 && (
                        <div className="mt-6">
                            <PageController
                                currentPage={currentPage}
                                totalPages={totalPages}
                                setCurrentPage={setCurrentPage}
                            />
                            {/* 
                            Componente que renderiza:
                            - Botões "Anterior" e "Próximo"
                            - Números das páginas
                            - Controla navegação entre páginas
                            - Só é exibido quando há dados para paginar
                            
                            Para backend, use: !loading && !error && filteredDossies.length > 0
                            */}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}