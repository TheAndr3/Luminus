"use client" 
// Indica que este componente é um componente React que roda no lado do cliente (Next.js)

import { BaseInput } from "@/components/inputs/BaseInput"; 
// Importa um componente de input customizado reutilizável

import { Button } from "@/components/ui/button"; 
// Importa um componente de botão customizado reutilizável

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; 
// Importa componentes para construir um modal/dialog estilizado

import { use, useState } from "react"; 
// Importa hooks do React (useState para estado local)

import dark_class_icon from "@/components/icon/dark_icon_classroom.svg"
// Importa uma imagem SVG para usar como ícone da turma

import Image from "next/image"; 
// Componente otimizado do Next.js para exibir imagens

import { CreateClassroom, UpdateClassroom } from "@/services/classroomServices";
import { ErroMessageDialog } from "./erroMessageDialog";
import { Pencil, Save } from "lucide-react";






// Define a tipagem das props que o componente EditClassModal vai receber
interface EditClassModalProps{
    open: boolean // Se o modal está aberto ou não
    onCancel: () => void // Função para fechar o modal
    classroom: { // Dados da turma a ser editada
        id:number,
        name: string,
        course: string,
        season: string,
        institution?: string
    }
}


// Componente funcional principal que representa o modal para editar uma turma
export default function EditClassModal({open, onCancel, classroom}: EditClassModalProps) {
    
    const [save, setSave] = useState(false); 
    // Estado para controlar se está salvando (usado para desabilitar botões ou mostrar loading, se quiser)

    let title = "Edite sua turma aqui "    
    // Título fixo do modal

    // Estados locais para armazenar os valores digitados nos inputs
    const [nameClassroomModal, setnameClassroomModal] = useState('') 
    const [descriptionClassroomModal, setDescriptionClassroomModal] = useState('') 
    const [seasonClassroomModal, setSeasonClassroomModal] = useState('') 
    const [institutionClassroomModal, setInstitutionClassroomModal] = useState('') 
    const [classroomName, setClassroomName] = useState(classroom.name) // Estado para o nome da turma no header

    const [editing, setEditing] = useState(false); 
    // Estado que poderia ser usado para controlar edição do título (não utilizado no momento)

    const [missingDialog, setMissingDialog] = useState(false);
    const [messageErro, setMessageErro] = useState("");

    const [messageButton, setMessageButton] = useState("Salvar Alterações");

    // Função para resetar os campos dos inputs ao fechar o modal
    const handleDialogClose = () => {
        setnameClassroomModal(''); // Limpa campo Disciplina
        setSeasonClassroomModal(''); // Limpa campo Turma
        setDescriptionClassroomModal(''); // Limpa campo Instituição
        setInstitutionClassroomModal(''); // Limpa campo Instituição
    }




    /* --------------------------API---------------------------------------------------------- */
    // Função chamada quando o usuário clica no botão "Concluir"
    const handleClick = async () => {
        setSave(true); // Marca que está salvando
        setMessageButton("Salvando..."); // Atualiza o texto do botão
        
        // Verifica se os campos obrigatórios foram preenchidos
        if (classroomName && seasonClassroomModal) {
            try {
                // Obtém o ID do professor do localStorage
                const customUserId = localStorage.getItem('professorId');
                if (!customUserId) {
                    throw new Error('ID do professor não encontrado');
                }

                // Monta o objeto com dados para enviar ao backend
                const updateData = {
                    name: classroomName,
                    description: descriptionClassroomModal || classroom.name, // Usa o nome da turma como descrição padrão
                    season: seasonClassroomModal,
                    institution: institutionClassroomModal || undefined,
                    customUserId: Number(customUserId)
                }

                // Chama a API para atualizar os dados da turma
                const response = await UpdateClassroom(classroom.id, updateData);

                // Se a resposta for sucesso, fecha o modal e atualiza a página
                if(response.msg) {
                    onCancel();
                    handleDialogClose();
                    // Recarrega a página para atualizar a lista de turmas
                    window.location.reload();
                }
            } catch(err: any) {
                setMessageErro(err.message || "Impossível salvar os dados editados. Por favor, tente novamente!");
                setMissingDialog(true); // Alerta caso os campos obrigatórios não estejam preenchidos
                setMessageButton("Salvar Alterações");
            }
        } else {
            setMessageErro("Por favor, preencha todos os campos obrigatórios!");
            setMissingDialog(true); // Alerta caso os campos obrigatórios não estejam preenchidos
            setMessageButton("Salvar Alterações");
        }
    }
    /* --------------------------API---------------------------------------------------------- */


    // JSX que será renderizado na tela
    return (
        <>
            {/* Componente Dialog controla o modal aberto/fechado */}
            <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel() && handleDialogClose()}>
                
                {/* Fundo escuro com leve desfoque atrás do modal */}
                <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" /> 

                {/* Conteúdo do modal */}
                <DialogContent className="max-w-4xl bg-white rounded-3xl text-gray-900 border-0 shadow-2xl p-0 overflow-hidden">
                    <DialogTitle className="sr-only">Editar Turma</DialogTitle>

                    {/* Header with gradient background */}
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

                    {/* Form content */}
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-gray-700">Disciplina</label>
                                <BaseInput 
                                    className="w-full h-12 text-gray-900 font-medium bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all duration-200"
                                    placeholder={classroom.name}
                                    value={nameClassroomModal}
                                    onChange={(e) => setnameClassroomModal(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-gray-700">Instituição</label>
                                <BaseInput
                                    className="w-full h-12 text-gray-900 font-medium bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all duration-200"
                                    placeholder={classroom.institution || "Instituição"}
                                    value={institutionClassroomModal}
                                    onChange={(e) => setInstitutionClassroomModal(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-gray-700">Período *</label>
                                <BaseInput 
                                    className="w-full h-12 text-gray-900 font-medium bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all duration-200"
                                    placeholder={classroom.season}
                                    value={seasonClassroomModal}
                                    onChange={(e) => setSeasonClassroomModal(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-gray-700">Descrição</label>
                                <BaseInput 
                                    className="w-full h-12 text-gray-900 font-medium bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all duration-200"
                                    placeholder="Descrição da turma"
                                    value={descriptionClassroomModal}
                                    onChange={(e) => setDescriptionClassroomModal(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-8 py-6 flex justify-end gap-4">
                        <Button 
                            onClick={onCancel}
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
