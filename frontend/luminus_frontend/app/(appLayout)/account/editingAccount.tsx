// src/components/EditingAccount.jsx ou .tsx
"use client"

import { BaseInput } from "@/components/inputs/BaseInput";
import { Button } from "@/components/ui/button";
import { Dialog, DialogOverlay, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import class_icon from "@/components/icon/icon_classroom.svg";
import Image from "next/image";
// import { UpdateAccount } from "@/services/accountServices"; // EX: Importe seu serviço de atualização de conta
import { ErroMessageDialog } from "../classroom/components/erroMessageDialog";

// Define a tipagem das props que o componente EditingAccount vai receber
interface EditingAccountProps {
    open: boolean;
    onCancel: () => void; // Função para fechar o modal
    user: { // Dados do usuário a ser editado
        id: number;
        username: string;
        contractNumber: string;
        password: string;
        email: string;
    };
    // NOVO: Função para notificar o pai que a atualização foi bem-sucedida
    onUpdateSuccess?: () => void;
}

// Componente funcional principal que representa o modal para editar uma conta de usuário
export default function EditingAccount({ open, onCancel, user, onUpdateSuccess }: EditingAccountProps) {

    const [save, setSave] = useState(false);
    const title = "Edite seu perfil aqui";

    // **Estados locais para armazenar os valores dos inputs**
    const [usernameAccount, setUsernameAccount] = useState('');
    const [contractNumberAccount, setContractNumberAccount] = useState('');
    const [passwordAccount, setPasswordAccount] = useState(''); // Para a NOVA senha
    const [emailAccount, setEmailAccount] = useState(''); // Para o email

    const [missingDialog, setMissingDialog] = useState(false);
    const [messageErro, setMessageErro] = useState("");
    const [messageButton, setMessageButton] = useState("Concluir");


    /* --------------------------API---------------------------------------------------------- */
    const handleClick = async () => {
        setSave(true);
        setMessageButton("Carregando...");

        if (!usernameAccount || !contractNumberAccount || !emailAccount) {
            setMessageErro("Por favor, preencha todos os campos obrigatórios (Nome, Número de Contrato e Email)!");
            setMissingDialog(true);
            setSave(false);
            setMessageButton("Concluir");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailAccount)) {
            setMessageErro("Por favor, insira um endereço de e-mail válido.");
            setMissingDialog(true);
            setSave(false);
            setMessageButton("Concluir");
            return;
        }

        try {
            const updateData: { username: string; contractNumber: string; email: string; password?: string } = {
                username: usernameAccount,
                contractNumber: contractNumberAccount,
                email: emailAccount,
            };

            if (passwordAccount) {
                updateData.password = passwordAccount;
            }

            // **IMPORTANTE: AQUI VOCÊ FARÁ A CHAMADA REAL À SUA API DE ATUALIZAÇÃO DE CONTA**
            // Exemplo: const response = await UpdateAccount(user.id, updateData);
            console.log("Chamando API para atualizar usuário:", user.id, updateData);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay da API

            // Se a API for bem-sucedida:
            // 1. Fecha o modal
            onCancel();

            // 2. Notifica o componente pai (se a função foi fornecida)
            if (onUpdateSuccess) {
                onUpdateSuccess();
            }

        } catch (err: any) {
            setMessageErro(err.message || "Impossível salvar os dados editados. Por favor, tente novamente!");
            setMissingDialog(true);
        } finally {
            setSave(false);
            setMessageButton("Concluir");
        }
    };
    /* --------------------------API---------------------------------------------------------- */

    return (
        <>
            <Dialog open={open} onOpenChange={(isOpen) => {
                if (!isOpen) {
                    onCancel();
                }
            }}>
                <DialogOverlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" />

                <DialogContent className="h-[400px] max-w-6xl bg-[#012D48] rounded-2xl text-white border-1 border-black">
                    <DialogTitle className="sr-only">Editar Perfil</DialogTitle>

                    <div className="relative mb-6">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-white w-12 h-12 rounded-lg">
                            <Image
                                src={class_icon}
                                alt="icone perfil"
                                className="w-12 h-12"
                            />
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                            <span className="text-4xl font-bold"> {title} </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 m-6 ">
                        <div className="flex items-center gap-3 ">
                            <label className="text-2xl">Nome:</label>
                            <BaseInput
                                className="w-90 h-10 text-gray-900 font-medium bg-gray-100 text-gray-700 rounded-2xl"
                                placeholder={user.username}
                                value={usernameAccount}
                                onChange={(e) => setUsernameAccount(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center ml-2">
                            <label className="text-2xl">Numero contrato:</label>
                            <BaseInput
                                className="w-90 h-10 text-gray-900 font-medium bg-gray-100 text-gray-700 rounded-2xl"
                                placeholder={user.contractNumber}
                                value={contractNumberAccount}
                                onChange={(e) => setContractNumberAccount(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-2xl">Senha:</label>
                            <BaseInput
                                type="password"
                                className="w-90 h-10 text-gray-900 font-medium bg-gray-100 text-gray-700 rounded-2xl"
                                placeholder="******"
                                value={passwordAccount}
                                onChange={(e) => setPasswordAccount(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-12">
                            <label className="text-2xl">Email:</label>
                            <BaseInput
                                type="email"
                                className="w-90 h-10 text-gray-900 font-medium bg-gray-100 text-gray-700 rounded-2xl"
                                placeholder={user.email}
                                value={emailAccount}
                                onChange={(e) => setEmailAccount(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mr-7">
                        <Button
                            onClick={handleClick}
                            disabled={save}
                            className="bg-gray-300 text-black hover:bg-gray-400 rounded-full px-[3vh] py-[1vh] h-7"
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