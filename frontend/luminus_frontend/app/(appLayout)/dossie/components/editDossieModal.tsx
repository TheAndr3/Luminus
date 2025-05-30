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

import class_icon from "@/components/icon/icon_dossie.svg"
// Importa uma imagem SVG para usar como ícone da turma

import Image from "next/image"; 
// Componente otimizado do Next.js para exibir imagens

//import { Createdossie, Updatedossie } from "@/services/classroomServices";
import { ErroMessageDialog } from "./erroMessageDialog";






// Define a tipagem das props que o componente EditClassModal vai receber
interface EditDossieModalProps{
    open: boolean // Se o modal está aberto ou não
    onCancel: () => void // Função para fechar o modal
    dossie: { // Dados da turma a ser editada
        id:number,
        name: string,
        description: string,
        evaluation_method: string,
        professor_id: number
    }
}


// Componente funcional principal que representa o modal para editar uma turma
export default function EditDossieModal({open, onCancel, dossie}: EditDossieModalProps) {
    
    const [save, setSave] = useState(false); 
    // Estado para controlar se está salvando (usado para desabilitar botões ou mostrar loading, se quiser)

    let title = "Edite sua turma aqui "    
    // Título fixo do modal

    // Estados locais para armazenar os valores digitados nos inputs
    const [namedossieModal, setnamedossieModal] = useState('') 
    const [descriptiondossieModal, setDescriptiondossieModal] = useState('') 
    const [seasondossieModal, setSeasondossieModal] = useState('') 
    const [institutiondossieModal, setInstitutiondossieModal] = useState('') 

    const [editing, setEditing] = useState(false); 
    // Estado que poderia ser usado para controlar edição do título (não utilizado no momento)

    const [missingDialog, setMissingDialog] = useState(false);
    const [messageErro, setMessageErro] = useState("");

    const [messageButton, setMessageButton] = useState("Concluir");

    // Função para resetar os campos dos inputs ao fechar o modal
    const handleDialogClose = () => {
        setnamedossieModal(''); // Limpa campo Disciplina
        setSeasondossieModal(''); // Limpa campo Turma
        setDescriptiondossieModal(''); // Limpa campo Instituição
        setInstitutiondossieModal(''); // Limpa campo Instituição
    }




    /* --------------------------API---------------------------------------------------------- */
    // Função chamada quando o usuário clica no botão "Concluir"
    const handleClick = async () => {
        setSave(true); // Marca que está salvando para, por exemplo, desabilitar botões
        setTimeout(() => {setSave(false); setMessageButton("Carregando...")}); // Remove o estado de salvando após 3 segundos (simulação)
        
        // Verifica se os campos obrigatórios foram preenchidos
        if (namedossieModal && institutiondossieModal) {
            /* 
            try {
                
                // Monta o objeto com dados para enviar ao backend
                const newClassData = {
                    name: namedossieModal,
                    description: descriptiondossieModal,
                    season: seasondossieModal,
                    institution: institutiondossieModal || undefined
                }

                // Chama a API para salvar os dados da turma
                const response = await Updatedossie(dossie.id, newClassData);

                // Se a resposta for sucesso, fecha o modal e avisa o usuário
                if(response.msg) {
                    onCancel();
                    alert("Dados salvos com sucesso!");
                    handleDialogClose();
                }
            } catch(err) {
                setMessageErro("Impossivel salvar os dados editados. Por favor, tente novamente!")
                setMissingDialog(true) // Alerta caso os campos obrigatórios não estejam preenchidos
                setMessageButton("Concluir")
            }
        } else {
            setMessageErro("Por favor, Preencha todos os campos adequadamente !")
            setMissingDialog(true) // Alerta caso os campos obrigatórios não estejam preenchidos
            */
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
                <DialogContent className="h-[400px] max-w-6xl bg-[#012D48] rounded-2xl text-white border-1 border-black">
                    <DialogTitle className="sr-only">Editar Turma</DialogTitle>

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
                                placeholder={dossie.name} // Placeholder recebe o valor atual da turma
                                value={namedossieModal} // Valor do input Disciplina
                                onChange={(e) => setnamedossieModal(e.target.value)} // Atualiza estado ao digitar
                            />
                        </div>

                        <div className="flex items-center gap-3 ml-8">
                            <label className="text-2xl">Instituição:</label> {/* Label para o campo Instituição */}
                            <BaseInput
                                className="w-90 h-10 text-gray-900 font-medium bg-gray-100 text-gray-700 rounded-2xl "
                                placeholder={dossie.description} // Placeholder da instituição atual
                                value={descriptiondossieModal} // Valor do input Instituição
                                onChange={(e) => setDescriptiondossieModal(e.target.value)} // Atualiza estado ao digitar
                            />
                        </div>

                        <div className="flex items-center gap-12">
                            <label className="text-2xl">Turma:</label> {/* Label para o campo Turma */}
                            <BaseInput 
                                className="w-90 h-10 text-gray-900 font-medium bg-gray-100 text-gray-700 rounded-2xl "
                                placeholder={dossie.evaluation_method} // Placeholder com valor atual do curso
                                value={institutiondossieModal} // Valor do input Turma
                                onChange={(e) => setInstitutiondossieModal(e.target.value)} // Atualiza estado ao digitar
                            />
                        </div>

                    </div>

                    {/* Botão para concluir a edição */}
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
