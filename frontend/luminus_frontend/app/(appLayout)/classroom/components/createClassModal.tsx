"use client"
// CORREÇÃO: Import 'ImportCSVButton' removido pois não era utilizado.
import { BaseInput } from "@/components/inputs/BaseInput";
import { Button } from "@/components/ui/button";
// CORREÇÃO: Componentes não utilizados do Dialog ('DialogClose', 'DialogDescription', etc.) foram removidos.
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; 
// CORREÇÃO: Hook 'use' removido pois não era utilizado.
import { useState, useRef } from "react"; 
import { toast } from 'react-hot-toast';

import { Pencil, Plus, Upload, X } from "lucide-react";
import dark_class_icon from "@/components/icon/dark_icon_classroom.svg";
import Image from "next/image";
// CORREÇÃO: Importações combinadas para melhor organização.
import { CreateClassroom, CreateClassroomWithCSV } from "@/services/classroomServices";
import { ErroMessageDialog } from "./erroMessageDialog";

export default function DialogPage() {
    const [save, setSave] = useState(false);
    const [open, setOpen] = useState(false);

    const [inputDisc, setInputDisc] = useState('');
    const [inputInst, setinputInst] = useState('');
    const [inputPer, setInputPer] = useState('');

    // CORREÇÃO: Trocado 'let' por 'const' pois 'title' nunca é reatribuído.
    const title = "";
    const [titulo, setTitulo] = useState(title);
    const [editing, setEditing] = useState(false);

    const [missingDialog, setMissingDialog] = useState(false);
    const [messageErro, setMessageErro] = useState("");

    const [messageButton, setMessageButton] = useState("Criar Turma");

    const [csvFileToUpload, setCsvFileToUpload] = useState<File | null>(null);
    const [csvFileName, setCsvFileName] = useState<string>("Nenhum arquivo selecionado");
    const fileInputRefModal = useRef<HTMLInputElement | null>(null);

    const handleDialogClose = () => {
        setInputDisc('');
        setInputPer('');
        setinputInst('');
        setTitulo(title);
        resetModalCsvState();
        setEditing(false);
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

    const resetModalCsvState = () => {
        setCsvFileToUpload(null);
        setCsvFileName("Nenhum arquivo selecionado");
        if (fileInputRefModal.current) {
            fileInputRefModal.current.value = "";
        }
    };

    const handleClick = async () => {
        setSave(true);
        setMessageButton("Criando...");

        try {
            const customUserId = localStorage.getItem('professorId');
            if (!customUserId) {
                throw new Error('ID do professor não encontrado');
            }

            if (csvFileToUpload) {
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
                if (!inputDisc || !inputPer || !titulo) { // Verificação melhorada
                    throw new Error("Por favor, preencha todos os campos obrigatórios!");
                }

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
        } catch (err: unknown) { // CORREÇÃO: Trocado 'any' por 'unknown' com verificação de tipo.
            let errorMessage = "Impossível salvar os dados. Por favor, tente novamente!";
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            setMessageErro(errorMessage);
            setMissingDialog(true);
            setMessageButton("Criar Turma");
        }
    }
    
    return (
        <>
            <Dialog open={open} onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) {
                    handleDialogClose();
                }
            }}>
                <DialogTrigger asChild>
                    <div className="bg-gray-300 text-black hover:bg-gray-400 rounded-full px-3 py-1 h-7 inline-flex items-center justify-center cursor-pointer text-sm whitespace-nowrap font-normal">
                        <Plus size={16} className="mr-1" />
                        Adicionar turma
                    </div>
                </DialogTrigger>
                <DialogOverlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

                <DialogContent className="max-w-4xl bg-white rounded-3xl text-gray-900 border-0 shadow-2xl p-0 overflow-hidden">
                    <DialogTitle className="sr-only">Criar Nova Turma</DialogTitle>

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

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-gray-700">Disciplina *</label>
                                <BaseInput 
                                    className="w-full h-12 text-gray-900 font-medium bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all duration-200"
                                    placeholder="Ex: EXA 702 - TPO1" 
                                    value={inputDisc}
                                    onChange={(e) => setInputDisc(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-gray-700">Instituição</label>
                                <BaseInput
                                    className="w-full h-12 text-gray-900 font-medium bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all duration-200"
                                    placeholder="Insira o nome da instituição"
                                    value={inputInst}
                                    onChange={(e) => setinputInst(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-lg font-semibold text-gray-700">Período *</label>
                                <BaseInput 
                                    className="w-full h-12 text-gray-900 font-medium bg-gray-50 border border-gray-200 rounded-xl px-4 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all duration-200"
                                    placeholder="23.2"
                                    type="number"
                                    value={inputPer}
                                    onChange={(e) => setInputPer(e.target.value)}
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
                                        className="h-12 text-base font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-3 shadow-md border border-gray-700 transition-all duration-200 hover:shadow-lg flex items-center gap-2 cursor-pointer"
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
                                            className="h-10 text-base font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full px-3 py-2 shadow-md border border-red-200 transition-all duration-200 hover:shadow-lg flex items-center gap-2 cursor-pointer"
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

                    <div className="bg-gray-50 px-8 py-6 flex justify-end gap-4">
                        <Button 
                            onClick={() => setOpen(false)}
                            variant="outline"
                            className="h-12 text-base font-medium border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-6 py-3 shadow-md border transition-all duration-200 hover:shadow-lg flex items-center gap-2 cursor-pointer"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleClick} 
                            disabled={save}
                            className="h-12 text-base font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8 py-3 shadow-md border border-gray-700 transition-all duration-200 hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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