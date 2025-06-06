"use client"
import { ImportCSVButton } from "@/components/button-csv/import-csv-button"; // Importa o botão para importar CSV
import { BaseInput } from "@/components/inputs/BaseInput"; // Importa o componente de input customizado
import { Button } from "@/components/ui/button"; // Importa o botão customizado
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Importa componentes do Dialog
import { use, useState, useRef } from "react"; // Importa hooks do React
import { toast } from 'react-hot-toast';

import { Pencil, Plus } from "lucide-react";
import class_icon from "@/components/icon/icon_classroom.svg" // Importa o ícone da turma em formato SVG
import Image from "next/image"; // Importa o componente Image do Next.js para usar imagens de forma otimizada
import { CreateClassroom} from "@/services/classroomServices";
import { ErroMessageDialog } from "./erroMessageDialog";
import { CreateClassroomWithCSV } from "@/services/classroomServices";




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
    const [messageErro, setMessageErro] = useState("");

    const [messageButton, setMessageButton] = useState("Concluir");

    const [csvFileToUpload, setCsvFileToUpload] = useState<File | null>(null);
    const [csvFileName, setCsvFileName] = useState<string>("Nenhum arquivo selecionado");
    const fileInputRefModal = useRef<HTMLInputElement | null>(null); // Corrigido para useRef


    // Função que reseta os campos dos inputs quando o dialog é fechado
    const handleDialogClose = () => {
        setInputDisc(''); // Reseta o valor do input Disciplina
        setInputPer(''); // Reseta o valor do input Período
        setinputInst(''); // Reseta o valor do input Instituição
        setTitulo(title); // Reseta o título para o valor padrão
        resetModalCsvState();
        setEditing(false); // Adicionado para resetar o modo de edição do título
        setMessageButton("Concluir");
    }

     const handleFileSelectedInModal = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type === "text/csv") {
                setCsvFileToUpload(file);
                setCsvFileName(file.name);
                toast.success(`Arquivo "${file.name}" selecionado.`);
            } else {
                toast.error("Por favor, selecione um arquivo .csv");
                setCsvFileToUpload(null);
                setCsvFileName("Nenhum arquivo selecionado");
                if (fileInputRefModal.current) {
                    fileInputRefModal.current.value = "";
                }
            }
        }
    };

     // Função para limpar os estados do CSV no modal
    const resetModalCsvState = () => {
        setCsvFileToUpload(null);
        setCsvFileName("Nenhum arquivo selecionado");
        if (fileInputRefModal.current) {
            fileInputRefModal.current.value = "";
        }
    };

    // Função chamada ao clicar no botão de "Concluir"
    const handleClick = async () => {
        setSave(true); // Marca que o salvamento está em andamento
        setMessageButton("Carregando..."); // Atualiza o texto do botão

        try {
            // Obtém o ID do professor do localStorage
            const professorId = localStorage.getItem('professorId');
            if (!professorId) {
                throw new Error('ID do professor não encontrado');
            }

            // Verifica se há um arquivo CSV para upload
            if (csvFileToUpload) {
                // Cria a turma com o arquivo CSV
                const formData = new FormData();
                formData.append('csvfile', csvFileToUpload);
                formData.append('professor_id', professorId);
                formData.append('name', titulo);
                formData.append('description', inputDisc);
                formData.append('season', inputPer);
                formData.append('institution', inputInst || '');

                const response = await CreateClassroomWithCSV(formData);
                if (response.msg) {
                    setOpen(false);
                    handleDialogClose();
                    window.location.reload();
                }
            } else {
                // Verifica se os campos obrigatórios estão preenchidos para criação sem CSV
                if (!inputDisc || !inputPer || titulo === title) {
                    throw new Error("Por favor, preencha todos os campos obrigatórios!");
                }

                // Cria a turma sem o arquivo CSV
                const newClassData = {
                    professor_Id: Number(professorId),
                    name: titulo,
                    description: inputDisc,
                    season: inputPer,
                    institution: inputInst || ''
                }

                const response = await CreateClassroom(newClassData);
                if (response.msg) {
                    setOpen(false);
                    handleDialogClose();
                    window.location.reload();
                }
            }
        } catch (err: any) {
            setMessageErro(err.message || "Impossível salvar os dados. Por favor, tente novamente!");
            setMissingDialog(true);
            setMessageButton("Concluir");
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
                <DialogTrigger asChild>
                    <div className="bg-gray-300 text-black hover:bg-gray-400 rounded-full px-3 py-1 h-7 inline-flex items-center justify-center cursor-pointer text-sm whitespace-nowrap font-normal">
                        <Plus size={16} className="mr-1" />
                        Adicionar turma
                    </div>
                </DialogTrigger>
                <DialogOverlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" /> {/* Overlay com fundo e desfoque */}

                <DialogContent className="h-[400px] max-w-6xl bg-[#012D48] rounded-2xl text-white border-1 border-black">
                    <DialogTitle className="sr-only">Criar Nova Turma</DialogTitle>

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
                            <label
                                className="text-2xl truncate max-w-[200px] md:max-w-[300px]"
                                title={csvFileName}
                            >
                                {csvFileName}
                            </label>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileSelectedInModal}
                                style={{ display: 'none' }}
                                ref={fileInputRefModal}
                                id="csvFileInputModal"
                            />
                            <Button
                                type="button"
                                onClick={() => fileInputRefModal.current?.click()}
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-3 py-1 h-auto text-sm"
                            >
                                Selecionar CSV
                            </Button>
                            {csvFileToUpload && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetModalCsvState}
                                    className="text-red-500 hover:text-red-700 px-1"
                                >
                                    Limpar
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Botão "Concluir" */}
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
