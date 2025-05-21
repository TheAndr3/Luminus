"use client"
import { ImportCSVButton } from "@/components/button-csv/import-csv-button"; // Importa o botão para importar CSV
import { BaseInput } from "@/components/inputs/BaseInput"; // Importa o componente de input customizado
import { Button } from "@/components/ui/button"; // Importa o botão customizado
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Importa componentes do Dialog
import { use, useState } from "react"; // Importa hooks do React

import { Pencil } from "lucide-react";
import class_icon from "@/components/icon/icon_classroom.svg" // Importa o ícone da turma em formato SVG
import Image from "next/image"; // Importa o componente Image do Next.js para usar imagens de forma otimizada
//import { createClass } from "@/services/api";
import { InputMissingDialog } from "./inputMissingDialog";


export default function DialogPage() {
    const [save, setSave] = useState(false); // Estado para controlar se os dados estão sendo salvos

    const [open, setOpen] = useState(false); // Estado para controlar se o dialog está aberto ou fechado

    // Estados para armazenar os valores dos inputs
    const [inputDisc, setInputDisc] = useState('') // Estado para armazenar o valor do input Disciplina
    const [inputInst, setinputInst] = useState('') // Estado para armazenar o valor do input Instituição
    const [inputPer, setInputPer] = useState('') // Estado para armazenar o valor do input Período

    let title = "Digite o nome da turma"
    const [titulo, setTitulo] = useState(title) // Estado para armazenar o título (nome da turma)
    const [editing, setEditing] = useState(false); // Estado para controlar se o título está sendo editado

    const [missingDialog, setMissingDialog] = useState(false);


    // Função que reseta os campos dos inputs quando o dialog é fechado
    const handleDialogClose = () => {
        setInputDisc(''); // Reseta o valor do input Disciplina
        setInputPer(''); // Reseta o valor do input Período
        setinputInst(''); // Reseta o valor do input Instituição
        setTitulo(title); // Reseta o título para o valor padrão
    }


    

    // Função chamada ao clicar no botão de "Concluir"
    const handleClick = async () => {
        setSave(true); // Marca que o salvamento está em andamento
        setTimeout(() => setSave(false), 3000); // Desmarca o salvamento após 3 segundos

        // Verifica se os campos Disciplina e Período estão preenchidos
        if (inputDisc && inputPer && titulo != title) {
            /* 
            //tenta enviar os dados colhidos para o back
            try{
                const newClassData = {
                    name: titulo,
                    course: inputDisc,
                    semester: inputPer,
                    institution: inputInst || undefined
                }

                const response = await createClass(newClassData);
                //status 200 = OK no post
                if(response.status >= 200 && response.status < 300){
                    setOpen(false); // Fecha o dialog se os campos estiverem preenchidos
                    alert("Dados salvos com sucesso!"); // Exibe alerta de sucesso
                    handleDialogClose(); // Reseta os campos dos inputs
                }
            }
            catch(err){
                alert("Erro ao salvar dados, tente novamente!")
                // Mensagem de erro caso a requisição falhe
            }   
            */ 
        } else {
            setMissingDialog(true) // Alerta caso os campos obrigatórios não estejam preenchidos
        }
    }
    

    return (
        <>
            {/* Componente Dialog */}
            <Dialog open={open} onOpenChange={(isOpen) => {
                setOpen(isOpen); // Atualiza o estado de "open" ao mudar a visibilidade do dialog
                if (!isOpen) {
                    handleDialogClose(); // Chama a função para resetar os campos quando o dialog é fechado
                }
            }}>
                <DialogTrigger >
                    <Button className="bg-gray-300 text-black hover:bg-gray-400 rounded-full px-[2vh] py-[1vh] h-7"> Adicionar turma   +</Button> {/* Botão para abrir o dialog */}
                </DialogTrigger>
                <DialogOverlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" /> {/* Overlay com fundo e desfoque */}

                <DialogContent>
                    <DialogContent className="h-[400px] max-w-6xl bg-[#012D48] rounded-2xl text-white border-1 border-black">

                        {/* Header do dialog */}
                        <div className="relative mb-6">
                        {/* Imagem fixa à esquerda */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-white w-12 h-12 rounded-lg">
                            <Image 
                            src={class_icon}
                            alt="icone turma"
                            className="w-12 h-12"
                            />
                        </div>

                        {/* Conteúdo centralizado */}
                        <div className="flex items-center gap-2 justify-center">
                            {editing ? (
                            <input 
                                className="text-4xl font-bold"
                                placeholder={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                            />
                            ) : (
                            <span className="text-4xl font-bold"> {titulo} </span>
                            )}
                            <Pencil 
                            className="w-5 h-5 text-white cursor-pointer" 
                            onClick={() => setEditing(!editing)} 
                            />
                        </div>
                        </div>


                        {/* Campos de input */}
                        <div className="grid grid-cols-2 gap-4 m-6 ">
                            <div className="flex items-center gap-3 "> 
                                <label className="text-2xl">Disciplina:</label> {/* Label para o campo Disciplina */}
                                <BaseInput 
                                    className="w-90 h-10 text-gray-900 font-medium bg-gray-100 text-gray-700 rounded-2xl "
                                    placeholder="Ex: EXA 702 - TPO1" 
                                    value={inputDisc} // Valor do input Disciplina
                                    onChange={(e) => setInputDisc(e.target.value)} // Atualiza o valor do input
                                />
                            </div>

                            <div className="flex items-center gap-3 ml-8">
                                <label className="text-2xl">Instituição:</label> {/* Label para o campo Instituição */}
                                <BaseInput
                                    className="w-90 h-10 text-gray-900 font-medium bg-gray-100 text-gray-700 rounded-2xl "
                                    placeholder="Insira o nome da instituição (opcional)"
                                    value={inputInst} // Valor do input Instituição
                                    onChange={(e) => setinputInst(e.target.value)} // Atualiza o valor do input
                                />
                            </div>

                            <div className="flex items-center gap-8">
                                <label className="text-2xl">Período:</label> {/* Label para o campo Período */}
                                <BaseInput 
                                    className="w-90 h-10 text-gray-900 font-medium bg-gray-100 text-gray-700 rounded-2xl "
                                    placeholder="23.2"
                                    type="number"
                                    value={inputPer} // Valor do input Período
                                    onChange={(e) => setInputPer(e.target.value)} // Atualiza o valor do input
                                />
                            </div>

                            {/* Botão para importar CSV */}
                            <div className="flex items-center justify-end gap-2">
                                <label className="text-2xl">Nenhum arquivo: </label> 
                                <ImportCSVButton/>
                            </div>
                        </div>

                        {/* Botão "Concluir" */}
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
