"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BaseInput } from "@/components/inputs/BaseInput";
import { Folder, Plus, ArrowLeftRight, X, Search } from "lucide-react";
import { Dossier } from "@/services/dossierServices";
import { useRouter } from "next/navigation";
import { listDossiers } from "@/services/dossierServices";
import { AssociateDossier } from "@/services/classroomServices";
import { useParams } from "next/navigation";

import { ColoredButton } from "@/components/colored-button/colored-button";
import PageController from "../../../dossie/components/paginationController";

interface AssociarDossieProps {
  mainColor?: string;
  hoverColor?: string;
  associatedDossier?: { id: number; name: string } | null;
  onDossierAssociated?: (dossierId: number) => void;
}

export default function AssociarDossie({
  mainColor = '',
  hoverColor = '',
  associatedDossier = null,
  onDossierAssociated,
}: AssociarDossieProps) {
    const router = useRouter();
    const params = useParams();
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [dossies, setDossies] = useState<Dossier[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalItems, setTotalItems] = useState(0);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const [isAssociating, setIsAssociating] = useState(false);

    const dossiesPerPage = 6;
    const totalPages = Math.ceil(totalItems / dossiesPerPage);

    const fetchDossies = async (searchValue = searchTerm, page = currentPage) => {
        if (!open) return;
        try {
            setIsLoading(true);
            setError(null);
            const professorId = Number(localStorage.getItem('professorId'));
            if (!professorId) throw new Error('ID do professor não encontrado');
            const start = page * dossiesPerPage;
            const response = await listDossiers(professorId, start, dossiesPerPage, searchValue);
            setDossies((response.data || []).map((d: Dossier) => ({
                id: d.id,
                name: d.name,
                description: d.description,
                evaluationMethod: d.evaluationMethod,
                customUserId: d.customUserId
            })));
            setTotalItems(response.ammount || 0);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar dossiês';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDossies();
        // eslint-disable-next-line
    }, [open, currentPage]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(0);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchDossies(value, 0);
        }, 400);
    };

    const handleClickDossie = async (dossie: Dossier) => {
        try {
            setIsAssociating(true);
            const classId = Number(params['selected-class']);
            
            if (!classId) {
                throw new Error('ID da turma não encontrado');
            }

            await AssociateDossier(classId, dossie.id);
            setOpen(false);
            
            if (onDossierAssociated) {
                onDossierAssociated(dossie.id);
            }
            
            router.refresh();
        } catch (error: unknown) {
            console.error('Erro ao associar dossiê:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro ao associar dossiê';
            setError(errorMessage);
        } finally {
            setIsAssociating(false);
        }
    }

    const createDossie = () => {
        router.push('/dossie/crud');
        setOpen(false);
    }

    const getButtonText = () => {
        if (associatedDossier) {
            return 'Trocar Dossiê';
        }
        return 'Associar dossiê';
    };

    const getButtonIcon = () => {
        if (associatedDossier) {
            return <ArrowLeftRight size={18} color="white" />;
        }
        return <Plus size={18} color="white" />;
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <div>
                        {mainColor === "white" ? (
                            <div className="bg-white text-black hover:bg-gray-100 rounded-full px-3 py-1 h-7 inline-flex items-center justify-center cursor-pointer text-sm whitespace-nowrap font-normal transition-all duration-200">
                                {getButtonText()}
                            </div>
                        ) : (
                            <ColoredButton
                                mainColor={mainColor}
                                hoverColor={hoverColor}
                                text={getButtonText()}
                                icon={getButtonIcon()}
                                haveBorder={false}
                            />
                        )}
                    </div>
                </DialogTrigger>

                <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

                <DialogContent className="max-w-2xl bg-white rounded-3xl text-gray-900 border-0 shadow-2xl p-0 overflow-hidden">
                    <DialogTitle className="sr-only">Associar Dossiê</DialogTitle>
                    
                    {/* Red X Close Button */}
                    <button
                        onClick={() => setOpen(false)}
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
                                    {associatedDossier ? 'Trocar Dossiê' : 'Associar Dossiê'}
                                </h2>
                                <p className="mt-1 text-sm font-normal text-gray-300">
                                    Selecione um dossiê para associar à turma
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
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-3"></div>
                                    <p className="text-gray-600">Carregando dossiês...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                                <p className="text-red-700 font-medium">{error}</p>
                            </div>
                        ) : dossies.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-300">
                                    <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Sem dossiês criados</h3>
                                    <p className="text-gray-500 mb-4 text-sm">Crie seu primeiro dossiê para começar a usar</p>
                                    <Button 
                                        onClick={createDossie}
                                        className="h-10 text-base font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-2 shadow-md border border-gray-700 transition-all duration-200 hover:shadow-lg flex items-center gap-2 cursor-pointer"
                                    >
                                        <Plus size={14} className="mr-2" />
                                        Criar dossiê
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {dossies.map((dossie) => (
                                    <div
                                        key={dossie.id}
                                        onClick={() => !isAssociating && handleClickDossie(dossie)}
                                        className={`bg-white border border-gray-200 rounded cursor-pointer flex items-center h-12 w-full hover:bg-gray-50 transition-colors ${isAssociating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className="flex items-center justify-center w-16 flex-shrink-0 p-2">
                                            <Folder className="w-8 h-8 text-gray-900" />
                                        </div>
                                        <div className="flex-1 p-2 text-base whitespace-nowrap overflow-hidden text-ellipsis pl-4 font-normal text-gray-900">
                                            {dossie.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
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
                </DialogContent>
            </Dialog>
        </>
    );
}


/* 

// EXEMPLO DE PUXADA DOS DOSSIES DO BACKEND (comentado para manter mock):

useEffect(() => {
    if (open) {
        async function fetchDossies() {
            try {
                const response = await fetch('/api/dossies'); // endpoint fictício
                if (!response.ok) throw new Error('Erro ao buscar dossiês');
                const data = await response.json();
                // setDossies(data); // Aqui você definiria o estado com os dados do backend
            } catch (error) {
                console.error('Falha ao carregar dossiês:', error);
            }
        }
        fetchDossies();
    }
}, [open]);

*/
