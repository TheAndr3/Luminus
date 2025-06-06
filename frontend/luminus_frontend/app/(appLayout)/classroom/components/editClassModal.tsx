"use client"

import { BaseInput } from "@/components/inputs/BaseInput";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react"; // Adicionado useEffect
import class_icon from "@/components/icon/icon_classroom.svg"
import Image from "next/image";
import { UpdateClassroom } from "@/services/classroomServices";
import { ErroMessageDialog } from "./erroMessageDialog"; // Corrigido para import nomeado

interface EditClassModalProps {
    open: boolean
    onCancel: () => void
    classroom: {
        id: number,
        name: string,
        course: string, // Mapeado para 'season' no backend
        institution?: string
    } | null // Permitir que classroom seja nulo para evitar erros
}

export default function EditClassModal({ open, onCancel, classroom }: EditClassModalProps) {

    // Seus estados originais, sem alteração
    const [save, setSave] = useState(false);
    const [nameClassroomModal, setnameClassroomModal] = useState('');
    const [descriptionClassroomModal, setDescriptionClassroomModal] = useState('');
    const [seasonClassroomModal, setSeasonClassroomModal] = useState('');
    const [institutionClassroomModal, setInstitutionClassroomModal] = useState('');
    const [editing, setEditing] = useState(false);
    const [missingDialog, setMissingDialog] = useState(false);
    const [messageErro, setMessageErro] = useState("");
    const [messageButton, setMessageButton] = useState("Concluir");
    let title = "Edite sua turma aqui ";

    // ADIÇÃO NECESSÁRIA: Popula os campos quando o modal abre com uma turma
    useEffect(() => {
        if (classroom) {
            setnameClassroomModal(classroom.name || '');
            // Mapeando os dados recebidos para os estados existentes
            setDescriptionClassroomModal(classroom.institution || ''); // 'descriptionClassroomModal' controla o campo Instituição
            setInstitutionClassroomModal(classroom.course || ''); // 'institutionClassroomModal' controla o campo Turma
        }
    }, [classroom]); // Roda sempre que a 'classroom' mudar

    const handleDialogClose = () => {
        // Sua função original, sem alteração
        setnameClassroomModal('');
        setSeasonClassroomModal('');
        setDescriptionClassroomModal('');
        setInstitutionClassroomModal('');
    }

    /* -------------------------- API CONECTION -------------------------------------- */
    const handleClick = async () => {
        if (!classroom) return; // Garante que a turma exista

        setSave(true);
        setMessageButton("Carregando...");

        // Usando os estados que possuem dados: nameClassroomModal e institutionClassroomModal (para season)
        if (nameClassroomModal && institutionClassroomModal) {
            try {
                // 1. Obter o ID do professor
                const professorId = localStorage.getItem('professorId');
                if (!professorId) {
                    throw new Error("ID do professor não encontrado. Faça o login novamente.");
                }

                // 2. Montar o payload com os nomes de campo que o backend espera
                const updateData = {
                    professor_id: Number(professorId),
                    name: nameClassroomModal,
                    // 'descriptionClassroomModal' é o seu state para o campo 'Instituição'
                    institution: descriptionClassroomModal,
                    // 'institutionClassroomModal' é o seu state para o campo 'Turma/Período'
                    season: institutionClassroomModal,
                };

                // 3. Chamar a API
                const response = await UpdateClassroom(classroom.id, updateData);

                if (response.msg) {
                    onCancel();
                    handleDialogClose();
                    window.location.reload(); // Mantendo seu método original de atualização
                }
            } catch (err: any) {
                setMessageErro(err.message || "Impossível salvar os dados editados. Por favor, tente novamente!");
                setMissingDialog(true);
            } finally {
                // Resetar o botão e estado de salvamento em qualquer caso
                setSave(false);
                setMessageButton("Concluir");
            }
        } else {
            setMessageErro("Por favor, preencha os campos obrigatórios!");
            setMissingDialog(true);
            // Resetar o botão
            setSave(false);
            setMessageButton("Concluir");
        }
    }
    /* --------------------------------------------------------------------------- */

    // Seu JSX original, sem nenhuma alteração no design
    return (
        <>
            <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { onCancel(); handleDialogClose(); } }}>
                <DialogOverlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" />
                <DialogContent className="h-[400px] max-w-6xl bg-[#012D48] rounded-2xl text-white border-1 border-black">
                    <DialogTitle className="sr-only">Editar Turma</DialogTitle>
                    <div className="relative mb-6">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-white w-12 h-12 rounded-lg">
                            <Image
                                src={class_icon}
                                alt="icone turma"
                                className="w-12 h-12"
                            />
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                            <span className="text-4xl font-bold"> {title} </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 m-6 ">
                        <div className="flex items-center gap-3 ">
                            <label className="text-2xl">Disciplina:</label>
                            <BaseInput
                                className="w-90 h-10 text-gray-900 font-medium bg-gray-100 text-gray-700 rounded-2xl "
                                placeholder={classroom?.name || ''}
                                value={nameClassroomModal}
                                onChange={(e) => setnameClassroomModal(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3 ml-8">
                            <label className="text-2xl">Instituição:</label>
                            <BaseInput
                                className="w-90 h-10 text-gray-900 font-medium bg-gray-100 text-gray-700 rounded-2xl "
                                placeholder={classroom?.institution || ''}
                                value={descriptionClassroomModal} // Usando o state correspondente no seu código
                                onChange={(e) => setDescriptionClassroomModal(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-12">
                            <label className="text-2xl">Turma:</label>
                            <BaseInput
                                className="w-90 h-10 text-gray-900 font-medium bg-gray-100 text-gray-700 rounded-2xl "
                                placeholder={classroom?.course || ''}
                                value={institutionClassroomModal} // Usando o state correspondente no seu código
                                onChange={(e) => setInstitutionClassroomModal(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mr-7">
                        <Button onClick={handleClick} className="bg-gray-300 text-black hover:bg-gray-400 rounded-full px-[3vh] py-[1vh] h-7">
                            {messageButton}
                        </Button>
                    </div>
                    <ErroMessageDialog
                        open={missingDialog}
                        onConfirm={() => setMissingDialog(false)}
                        description={messageErro}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}