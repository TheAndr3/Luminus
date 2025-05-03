"use client"
import { ImportCSVButton } from "@/components/button-csv/import-csv-button"; // Importa o botão para importar CSV
import { BaseInput } from "@/components/inputs/BaseInput"; // Importa o componente de input customizado
import { Button } from "@/components/ui/button"; // Importa o botão customizado
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Importa componentes do Dialog
import { use, useState } from "react"; // Importa hooks do React

export default function dialogPage() {
    const [save, setSave] = useState(false); // Estado para controlar se os dados estão sendo salvos

    const [open, setOpen] = useState(false); // Estado para controlar se o dialog está aberto ou fechado

    // Estados para armazenar os valores dos inputs
    const [inputDisc, setInputDisc] = useState('') // Estado para armazenar o valor do input Disciplina
    const [inputInst, setinputInst] = useState('') // Estado para armazenar o valor do input Instituição
    const [inputPer, setInputPer] = useState('') // Estado para armazenar o valor do input Período

    // Função que reseta os campos dos inputs quando o dialog é fechado
    const handleDialogClose = () => {
        setInputDisc(''); // Reseta o valor do input Disciplina
        setInputPer(''); // Reseta o valor do input Período
        setinputInst(''); // Reseta o valor do input Instituição
    }

    // Função chamada ao clicar no botão de "Concluir"
    const handleClick = () => {
        // Simula evento de salvamento (apenas para mostrar uma animação de "salvando")
        setSave(true); // Marca que o salvamento está em andamento
        setTimeout(() => setSave(false), 3000); // Desmarca o salvamento após 3 segundos

        // Verifica se os campos Disciplina e Período estão preenchidos
        if (inputDisc && inputPer) {
            setOpen(false); // Fecha o dialog se os campos estiverem preenchidos
            alert("Dados salvos com sucesso!"); // Exibe alerta de sucesso
            handleDialogClose(); // Reseta os campos dos inputs
        } else {
            alert("Por favor, preencha os campos!"); // Exibe alerta se algum campo obrigatório não foi preenchido
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
                <DialogTrigger>
                    <Button> Abrir dialog test </Button> {/* Botão para abrir o dialog */}
                </DialogTrigger>
                <DialogContent>
                    <DialogContent className="max-w-3xl bg-[#012D48] rounded-2xl text-white">
                    
                        <h2 className="text-2xl font-bold text-center mb-6">
                            Digite o nome da turma ✏️
                        </h2>

                        {/* Campos de input */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="text-sm">Disciplina:</label>
                                {/* Campo de input para Disciplina */}
                                <BaseInput 
                                    placeholder="Ex: EXA 702 - TPO1" 
                                    value={inputDisc}
                                    onChange={(e) => setInputDisc(e.target.value)} // Atualiza o estado com o valor do input
                                ></BaseInput>
                            </div>
                            <div>
                                <label className="text-sm">Instituição:</label>
                                {/* Campo de input para Instituição */}
                                <BaseInput
                                    placeholder="Insira o nome da instituição (opcional)"
                                    value={inputInst}
                                    onChange={(e) => setinputInst(e.target.value)} // Atualiza o estado com o valor do input
                                ></BaseInput>
                            </div>
                            <div>
                                <label className="text-sm">Período:</label>
                                {/* Campo de input para Período */}
                                <BaseInput 
                                    placeholder="23.2"
                                    value={inputPer}
                                    onChange={(e) => setInputPer(e.target.value)} // Atualiza o estado com o valor do input
                                ></BaseInput>
                            </div>
                            <div className="flex justify-end">
                                <label className="text-sm">Nenhum arquivo: </label>
                                {/* Botão para importar CSV */}
                                <ImportCSVButton/>
                            </div>
                        </div>

                        {/* Botão "Concluir" */}
                        <div className="flex justify-end">
                            <Button onClick={handleClick} className="bg-gray-200 text-black hover:bg-gray-300 rounded-full px-4 py-2">
                                Concluir
                            </Button>
                        </div>
                    </DialogContent>
                </DialogContent>
            </Dialog>
        </>
    );
}
