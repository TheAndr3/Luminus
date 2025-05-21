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

import class_icon from "@/components/icon/icon_classroom.svg"
// Importa uma imagem SVG para usar como ícone da turma

import Image from "next/image"; 
// Componente otimizado do Next.js para exibir imagens

import { CreateClassroom, UpdateClassroom } from "@/services/classroomServices";
import { InputMissingDialog } from "./inputMissingDialog";
// Função para fazer requisição à API para criar/editar a turma


// Define a tipagem das props que o componente EditClassModal vai receber
interface EditClassModalProps{
    open: boolean // Se o modal está aberto ou não
    onCancel: () => void // Função para fechar o modal
    classroom: { // Dados da turma a ser editada
        id:number,
        name: string,
        course: string,
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

    const [editing, setEditing] = useState(false); 
    // Estado que poderia ser usado para controlar edição do título (não utilizado no momento)

    const [missingDialog, setMissingDialog] = useState(false);

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
        setSave(true); // Marca que está salvando para, por exemplo, desabilitar botões
        setTimeout(() => setSave(false), 3000); // Remove o estado de salvando após 3 segundos (simulação)

        // Verifica se os campos obrigatórios foram preenchidos
        if (nameClassroomModal && institutionClassroomModal) {
            try {
                // Monta o objeto com dados para enviar ao backend
                const newClassData = {
                    name: nameClassroomModal,
                    description: descriptionClassroomModal,
                    season: seasonClassroomModal,
                    institution: institutionClassroomModal || undefined
                }

                // Chama a API para salvar os dados da turma
                const response = await UpdateClassroom(classroom.id, newClassData);

                // Se a resposta for sucesso, fecha o modal e avisa o usuário
                if(response.msg) {
                    onCancel();
                    alert("Dados salvos com sucesso!");
                    handleDialogClose();
                }
            } catch(err) {
                alert("Erro ao salvar dados, tente novamente!")
                // Mensagem de erro caso a requisição falhe
            }
            
        } else {
            setMissingDialog(true) // Alerta caso os campos obrigatórios não estejam preenchidos
        }
        
    }
    /* --------------------------API---------------------------------------------------------- */


    // JSX que será renderizado na tela
    return (
        <>
            {/* Componente Dialog controla o modal aberto/fechado */}
            <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel() && handleDialogClose()}>
                
                {/* Fundo escuro com leve desfoque atrás do modal */}
                <DialogOverlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" /> 

                {/* Conteúdo do modal */}
                <DialogContent>
                    <DialogContent className="h-[400px] max-w-6xl bg-[#012D48] rounded-2xl text-white border-1 border-black">

                        {/* Cabeçalho do modal */}
                        <div className="relative mb-6">
                            {/* Ícone fixo à esquerda */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-white w-12 h-12 rounded-lg">
                                <Image 
                                    src={class_icon}
                                    alt="icone turma"
                                    className="w-12 h-12"
                                />
                            </div>

                            {/* Título centralizado */}
                            <div className="flex items-center gap-2 justify-center">
                                <span className="text-4xl font-bold"> {title} </span>
                            </div>
                        </div>

                        {/* Formulário dividido em duas colunas */}
                        <div className="grid grid-cols-2 gap-4 m-6 ">
                            <div className="flex items-center gap-3 "> 
                                <label className="text-2xl">Disciplina:</label> {/* Label para o campo Disciplina */}
                                <BaseInput 
                                    className="w-90 h-10 text-gray-900 font-medium bg-gray-100 text-gray-700 rounded-2xl "
                                    placeholder={classroom.name} // Placeholder recebe o valor atual da turma
                                    value={nameClassroomModal} // Valor do input Disciplina
                                    onChange={(e) => setnameClassroomModal(e.target.value)} // Atualiza estado ao digitar
                                />
                            </div>

                            <div className="flex items-center gap-3 ml-8">
                                <label className="text-2xl">Instituição:</label> {/* Label para o campo Instituição */}
                                <BaseInput
                                    className="w-90 h-10 text-gray-900 font-medium bg-gray-100 text-gray-700 rounded-2xl "
                                    placeholder={classroom.institution} // Placeholder da instituição atual
                                    value={descriptionClassroomModal} // Valor do input Instituição
                                    onChange={(e) => setDescriptionClassroomModal(e.target.value)} // Atualiza estado ao digitar
                                />
                            </div>

                            <div className="flex items-center gap-12">
                                <label className="text-2xl">Turma:</label> {/* Label para o campo Turma */}
                                <BaseInput 
                                    className="w-90 h-10 text-gray-900 font-medium bg-gray-100 text-gray-700 rounded-2xl "
                                    placeholder={classroom.course} // Placeholder com valor atual do curso
                                    value={institutionClassroomModal} // Valor do input Turma
                                    onChange={(e) => setInstitutionClassroomModal(e.target.value)} // Atualiza estado ao digitar
                                />
                            </div>

                        </div>

                        {/* Botão para concluir a edição */}
                        <div className="flex justify-end mr-7">
                            <Button onClick={handleClick} className="bg-gray-300 text-black hover:bg-gray-400 rounded-full px-[3vh] py-[1vh] h-7">
                                Concluir
                            </Button>
                        </div>

                        <InputMissingDialog
                            open={missingDialog}
                            onConfirm={() => setMissingDialog(false)}
                        />

                    </DialogContent>
                </DialogContent>
            </Dialog>
        </>
    );
}
