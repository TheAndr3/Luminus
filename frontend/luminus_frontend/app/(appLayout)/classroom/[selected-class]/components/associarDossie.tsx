"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BaseInput } from "@/components/inputs/BaseInput";
import { Folder } from "lucide-react";
import { Dossie } from "@/app/(appLayout)/dossie/components/types";
import { useRouter } from "next/navigation";
import { listDossiers } from "@/services/dossierServices";
import { AssociateDossier } from "@/services/classroomServices";
import { useParams } from "next/navigation";

import { ColoredButton } from "@/components/colored-button/colored-button";

interface AssociarDossieProps {
  mainColor?: string;
  hoverColor?: string;
}


export default function AssociarDossie({
  mainColor = '',
  hoverColor = '',
}: AssociarDossieProps) {
    const router = useRouter();
    const params = useParams();
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [dossies, setDossies] = useState<Dossie[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAssociating, setIsAssociating] = useState(false);

    const dossiesPerPage = 6;

    useEffect(() => {
        const fetchDossies = async () => {
            if (!open) return;
            
            try {
                setIsLoading(true);
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
                setIsLoading(false);
            }
        };

        fetchDossies();
    }, [open]);

    // FILTRO DE DOSSIÊS
    const filteredDossies = dossies.filter(dossie =>
        dossie.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleClickDossie = async (dossie: Dossie) => {
        try {
            setIsAssociating(true);
            const classId = Number(params['selected-class']);
            
            if (!classId) {
                throw new Error('ID da turma não encontrado');
            }

            await AssociateDossier(classId, dossie.id);
            setOpen(false);
            router.refresh(); // Refresh the page to show the updated association
        } catch (error: any) {
            console.error('Erro ao associar dossiê:', error);
            setError(error.message || 'Erro ao associar dossiê');
        } finally {
            setIsAssociating(false);
        }
    }

    const createDossie = () => {
        router.push('/dossie/crud');
        setOpen(false);
    }

/*      OLD BUTTON              
<div className="bg-gray-300 text-black hover:bg-gray-400 rounded-full px-3 py-1 h-7 inline-flex items-center justify-center cursor-pointer text-sm whitespace-nowrap font-normal">
        Associar dossiê
</div> 
*/

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>

                    <div>
                        <ColoredButton // NEW BUTTON
                            mainColor={mainColor}
                            hoverColor={hoverColor}
                            text={'Associar dossiê'}
                            haveBorder={false}
                        ></ColoredButton>
                    </div>
                </DialogTrigger>

                <DialogOverlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" />

                <DialogContent className="h-[600px] max-w-6xl bg-[#012D48] rounded-2xl text-white border-1 border-black">
                    <DialogTitle className="sr-only">Associar Dossiê</DialogTitle>
                    <div className="relative mb-6">
                        <div className="flex items-center gap-2 justify-center">
                            <div className="absolute left-0 top-18 -translate-y-1/2 w-12 h-38 rounded-lg">
                                <Folder color="white" size={50} /> 
                            </div>
                            <span className="text-4xl font-bold text-white">
                                Associar Dossiê
                            </span>
                        </div>

                        <div className="flex justify-center items-center my-[2vh] mb-[4vh]">
                            <BaseInput
                                type="text"
                                placeholder="Procure pelo dossiê"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white border rounded-full w-[40vw] px-[2vh] py-[1vh] text-[1.5vh] placeholder-black text-black"
                            />
                        </div>
                    </div>

                    <div className="w-full min-h-[300px] space-y-2 flex flex-col items-center justify-start">
                        {isLoading ? (
                            <div className="text-white text-2xl mb-4">
                                Carregando dossiês...
                            </div>
                        ) : error ? (
                            <div className="text-white text-2xl mb-4">
                                {error}
                            </div>
                        ) : filteredDossies.length === 0 ? (
                            <>
                                <div className="text-white text-2xl mb-4">
                                    Sem dossiês criados
                                </div>
                                <Button className="bg-gray-300 text-black hover:bg-gray-400 rounded-full px-[3vh] h-7 mb-30" onClick={createDossie}>
                                    + Criar dossiê
                                </Button>
                            </>
                        ) : (
                            filteredDossies
                                .slice(currentPage * dossiesPerPage, (currentPage + 1) * dossiesPerPage)
                                .map((dossie) => (
                                    <div
                                        key={dossie.id}
                                        onClick={() => !isAssociating && handleClickDossie(dossie)}
                                        className={`bg-white rounded cursor-pointer flex items-center h-16 w-full hover:bg-[#0E3A4F] transition-colors ${isAssociating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className="flex items-center justify-center w-20 flex-shrink-0 p-2">
                                            <Folder className="w-10 h-10 text-black" />
                                        </div>
                                        <div className="flex-1 p-2 text-xl whitespace-nowrap overflow-hidden text-black pl-4">
                                            {dossie.name}
                                        </div>
                                    </div>
                                ))
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
