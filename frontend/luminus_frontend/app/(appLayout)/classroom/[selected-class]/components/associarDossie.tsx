"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BaseInput } from "@/components/inputs/BaseInput";
import { Folder } from "lucide-react";
import { Dossie } from "@/app/(appLayout)/dossie/components/types";
import { useRouter } from "next/navigation";


export default function AssociarDossie() {
    const router = useRouter(); // Inicializa o router
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [currentPage, setCurrentPage] = useState(0);
    // Estado para controlar qual página da paginação está sendo exibida

    const dossiesPerPage = 5;
    // Define quantos dossiês serão exibidos por página

    const dossies: Dossie[] = Array.from({ length: 0 }, (_, i) => ({
            id: i + 1,                              // ID único do dossiê
            name: `Dossiê ${i + 1}`,               // Nome do dossiê
            description: `Descrição do dossiê ${i + 1}`, // Descrição do dossiê
            evaluation_method: 'Prova escrita',     // Método de avaliação
            professor_id: 100 + i,                  // ID do professor responsável
        }));

    // FILTRO DE DOSSIÊS
    const filteredDossies = dossies.filter(dossie =>
        dossie.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleClickDossie = (dossie: Dossie) => {
        // Implementar ação ao clicar no dossiê
    }

    const createDossie = () => {
        router.push('/dossie/crud'); // Redireciona para a página de criação de dossiê
        setOpen(false);
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <div className="bg-gray-300 text-black hover:bg-gray-400 rounded-full px-3 py-1 h-7 inline-flex items-center justify-center cursor-pointer text-sm whitespace-nowrap font-normal">
                        Associar dossiê
                    </div>
                </DialogTrigger>

                <DialogOverlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" />

                <DialogContent className="h-[600px] max-w-6xl bg-[#012D48] rounded-2xl text-white border-1 border-black">

                    
                        <div className="relative mb-6">
                        
                        {/* Container principal do cabeçalho com ícone e título */}
                        <div className="flex items-center gap-2 justify-center">
                            
                            {/* Ícone de pasta posicionado à esquerda */}
                            <div className="absolute left-0 top-18 -translate-y-1/2 w-12 h-38 rounded-lg">
                                <Folder color="white" size={50} /> 
                            </div>
                            
                            {/* Título principal do modal */}
                            <span className="text-4xl font-bold text-white">
                                Titulo
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
                        </div>
                    </div>

                    {/* ======================================================= */}
                    {/* LISTA DE DOSSIÊS OU ESTADO VAZIO                       */}
                    {/* ======================================================= */}
                    <div className="w-full min-h-[300px] space-y-2 flex flex-col items-center justify-start">
                        {filteredDossies.length === 0 ? (
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
                                        onClick={() => handleClickDossie(dossie)}
                                        className="bg-white rounded cursor-pointer flex items-center h-16 w-full hover:bg-[#0E3A4F] transition-colors"
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
