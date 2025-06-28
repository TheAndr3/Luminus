"use client"
import { ImportCSVButton } from "@/components/button-csv/import-csv-button"; // Importa o botão para importar CSV
import { BaseInput } from "@/components/inputs/BaseInput"; // Importa o componente de input customizado
import { Button } from "@/components/ui/button"; // Importa o botão customizado
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Importa componentes do Dialog
import { use, useState, useRef } from "react"; // Importa hooks do React
import { toast } from 'react-hot-toast';

import { Pencil, Plus, Upload, X } from "lucide-react";
import dark_class_icon from "@/components/icon/dark_icon_classroom.svg" // Importa o ícone da turma em formato SVG
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

    let title = ""
    const [titulo, setTitulo] = useState(title) // Estado para armazenar o título (nome da turma)
    const [editing, setEditing] = useState(false); // Estado para controlar se o título está sendo editado

    const [missingDialog, setMissingDialog] = useState(false);
    const [messageErro, setMessageErro] = useState("");

    const [messageButton, setMessageButton] = useState("Criar Turma");

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
        setMessageButton("Criar Turma");
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
        setMessageButton("Criando..."); // Atualiza o texto do botão

        try {
            // Obtém o ID do professor do localStorage
            const customUserId = localStorage.getItem('professorId');
            if (!customUserId) {
                throw new Error('ID do professor não encontrado');
            }

            // Verifica se há um arquivo CSV para upload
            if (csvFileToUpload) {
                // Cria a turma com o arquivo CSV
                const formData = new FormData();
                formData.append('csvfile', csvFileToUpload);
                formData.append('customUserId', customUserId);
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
                    customUserId: Number(customUserId),
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
            setMessageButton("Criar Turma");
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
                <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" /> {/* Overlay com fundo e desfoque */}

                <DialogContent className="max-w-4xl bg-white rounded-3xl text-gray-900 border-0 shadow-2xl p-0 overflow-hidden">
                    <DialogTitle className="sr-only">Criar Nova Turma</DialogTitle>

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
                                <BaseInput 
                                    className="text-3xl font-bold bg-white/10 text-white rounded-2xl px-6 py-4 border-0 placeholder-white/70 focus:bg-white/20 transition-all duration-300"
                                    placeholder="Digite o nome da turma"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                />
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
                                <label className="text-lg font-semibold text-gray-700">Disciplina *</label>
                                <BaseInput 
                                    className="w-full h-12 text-gray-900 font-medium bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all duration-200"
                                    placeholder="Ex: EXA 702 - TPO1" 
                                    value={inputDisc} // Valor do input Disciplina
                                    onChange={(e) => setInputDisc(e.target.value)} // Atualiza o valor do input
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-gray-700">Instituição</label>
                                <BaseInput
                                    className="w-full h-12 text-gray-900 font-medium bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all duration-200"
                                    placeholder="Insira o nome da instituição"
                                    value={inputInst} // Valor do input Instituição
                                    onChange={(e) => setinputInst(e.target.value)} // Atualiza o valor do input
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-gray-700">Período *</label>
                                <BaseInput 
                                    className="w-full h-12 text-gray-900 font-medium bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all duration-200"
                                    placeholder="23.2"
                                    type="number"
                                    value={inputPer} // Valor do input Período
                                    onChange={(e) => setInputPer(e.target.value)} // Atualiza o valor do input
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-gray-700">Importar CSV</label>
                                <div className="flex items-center gap-3">
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
                                        className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-4 py-2 h-12 flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
                                    >
                                        <Upload size={16} />
                                        Selecionar CSV
                                    </Button>
                                    {csvFileToUpload && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={resetModalCsvState}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                                        >
                                            <X size={16} />
                                        </Button>
                                    )}
                                </div>
                                {csvFileToUpload && (
                                    <div className="text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg p-3">
                                        <span className="font-medium">Arquivo selecionado:</span> {csvFileName}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-8 py-6 flex justify-end gap-4">
                        <Button 
                            onClick={() => setOpen(false)}
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl px-6 py-3 h-12 font-medium transition-all duration-200 cursor-pointer"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleClick} 
                            disabled={save}
                            className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-8 py-3 h-12 font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
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
