"use client"

import { BaseInput } from "@/components/inputs/BaseInput";
import { Button } from "@/components/ui/button";
// CORREÇÃO: Removidos componentes não utilizados do Dialog.
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
// CORREÇÃO: Removido o hook 'use' não utilizado.
import { useState, useEffect } from "react";
import dark_class_icon from "@/components/icon/dark_icon_classroom.svg";
import Image from "next/image";
// CORREÇÃO: Removido 'CreateClassroom' que não era utilizado.
import { UpdateClassroom } from "@/services/classroomServices";
import { ErroMessageDialog } from "./erroMessageDialog";
import { Pencil, Save } from "lucide-react";

interface EditClassModalProps {
    open: boolean;
    onCancel: () => void;
    classroom: {
        id: number;
        name: string;
        course: string;
        season: string;
        institution?: string;
    };
}

export default function EditClassModal({ open, onCancel, classroom }: EditClassModalProps) {
    const [save, setSave] = useState(false);

    // CORREÇÃO: A variável 'title' foi removida pois não era utilizada.

    const [descriptionClassroomModal, setDescriptionClassroomModal] = useState('');
    const [seasonClassroomModal, setSeasonClassroomModal] = useState('');
    const [institutionClassroomModal, setInstitutionClassroomModal] = useState('');
    const [classroomName, setClassroomName] = useState(classroom.name);

    const [editing, setEditing] = useState(false);

    const [missingDialog, setMissingDialog] = useState(false);
    const [messageErro, setMessageErro] = useState("");
    const [messageButton, setMessageButton] = useState("Salvar Alterações");

    // useEffect para preencher os campos com os dados da turma quando o modal abre
    useEffect(() => {
        if (open) {
            setClassroomName(classroom.name || '');
            setDescriptionClassroomModal(classroom.course || '');
            setSeasonClassroomModal(classroom.season || '');
            setInstitutionClassroomModal(classroom.institution || '');
            setEditing(false); // Garante que não comece em modo de edição
        }
    }, [open, classroom]);

    const handleDialogClose = () => {
        onCancel();
    };

    const handleClick = async () => {
        setSave(true);
        setMessageButton("Salvando...");

        if (!classroomName || !seasonClassroomModal) {
            setMessageErro("Por favor, preencha os campos obrigatórios (Nome da Turma e Período).");
            setMissingDialog(true);
            setSave(false); // Para reabilitar o botão
            setMessageButton("Salvar Alterações");
            return;
        }

        try {
            const customUserId = localStorage.getItem('professorId');
            if (!customUserId) {
                throw new Error('ID do professor não encontrado');
            }

            const updateData = {
                name: classroomName,
                description: descriptionClassroomModal,
                season: seasonClassroomModal,
                institution: institutionClassroomModal || undefined,
                customUserId: Number(customUserId)
            };

            const response = await UpdateClassroom(classroom.id, updateData);

            if (response.msg) {
                handleDialogClose();
                window.location.reload();
            }
        } catch (err: unknown) { // CORREÇÃO: Trocado 'any' por 'unknown'
            let errorMessage = "Impossível salvar os dados editados. Por favor, tente novamente!";
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            setMessageErro(errorMessage);
            setMissingDialog(true);
        } finally {
            setSave(false);
            setMessageButton("Salvar Alterações");
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
                <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

                <DialogContent className="max-w-4xl bg-white rounded-3xl text-gray-900 border-0 shadow-2xl p-0 overflow-hidden">
                    <DialogTitle className="sr-only">Editar Turma</DialogTitle>

                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 relative">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-2xl shadow-lg">
                                <Image
                                    src={dark_class_icon}
                                    alt="icone turma"
                                    className="w-8 h-8"
                                />
                            </div>
                            <div className="flex-1">
                                {editing ? (
                                    <BaseInput
                                        className="text-3xl font-bold bg-white/10 text-white rounded-2xl px-6 py-4 border-0 placeholder-white/70 focus:bg-white/20 transition-all duration-300"
                                        placeholder="Digite o nome da turma"
                                        value={classroomName}
                                        onChange={(e) => setClassroomName(e.target.value)}
                                    />
                                ) : (
                                    <span className="text-3xl font-bold text-white"> {classroomName} </span>
                                )}
                            </div>
                            <Pencil
                                className="w-6 h-6 text-white/80 hover:text-white cursor-pointer transition-colors duration-200"
                                onClick={() => setEditing(!editing)}
                            />
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {/* O campo Disciplina parece redundante se o nome da turma já é editável no header */}
                             {/* Se quiser mantê-lo, pode renomear o label para "Código da Disciplina", por exemplo */}
                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-gray-700">Descrição/Código da Disciplina</label>
                                <BaseInput
                                    className="w-full h-12 text-gray-900 font-medium bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all duration-200"
                                    placeholder="Ex: Tópicos Especiais"
                                    value={descriptionClassroomModal}
                                    onChange={(e) => setDescriptionClassroomModal(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-gray-700">Instituição</label>
                                <BaseInput
                                    className="w-full h-12 text-gray-900 font-medium bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all duration-200"
                                    placeholder="Nome da Instituição"
                                    value={institutionClassroomModal}
                                    onChange={(e) => setInstitutionClassroomModal(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-gray-700">Período *</label>
                                <BaseInput
                                    className="w-full h-12 text-gray-900 font-medium bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all duration-200"
                                    placeholder="Ex: 2024.1"
                                    value={seasonClassroomModal}
                                    onChange={(e) => setSeasonClassroomModal(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-8 py-6 flex justify-end gap-4">
                        <Button
                            onClick={handleDialogClose}
                            variant="outline"
                            className="h-12 text-base font-medium border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-6 py-3 shadow-md border transition-all duration-200 hover:shadow-lg flex items-center gap-2 cursor-pointer"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleClick}
                            disabled={save}
                            className="h-12 text-base font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-3 shadow-md border border-gray-700 transition-all duration-200 hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={16} />
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