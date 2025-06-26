// src/components/Account.tsx
"use client"

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import EditingAccount from "./editingAccount";

import { GetProfessorProfile } from "@/services/professorService"; // Ajuste o caminho conforme seu projeto

interface FormDataType {
    id: number;
    username: string;
    contractNumber: string;
    email: string;
}

export default function Account() {
    const router = useRouter();
    const [editAccount, setEditAccount] = useState(false);
    const [formData, setFormData] = useState<FormDataType>({
        id: 1,
        username: '',
        contractNumber: '',
        email: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleExitAccount = () => {
        router.push('/login');
    };

    const fetchUserData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
        const professorId = localStorage.getItem('professorId');
        console.log('Professor ID from localStorage:', professorId);

        if (!professorId) {
            throw new Error('ID do professor não encontrado');
        }

        console.log("Iniciando busca de dados do usuário da API...");
        const data = await GetProfessorProfile(professorId);

        setFormData({
            id: parseInt(professorId, 10),
            username: data.username,
            contractNumber: data.contractNumber,
            email: data.email
        });

    } catch (err: any) {
        setError("Erro ao carregar os dados do perfil. Tente novamente.");
        console.error("Erro ao buscar dados do usuário:", err);
    } finally {
        setLoading(false);
    }
}, []);


    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const editingProfile = () => {
        setEditAccount(true);
    };

    const handleAccountUpdated = () => {
        console.log("Account: Modal EditingAccount notificou sucesso na atualização. Recarregando dados do perfil...");
        fetchUserData();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 w-full px-4">
                <p>Carregando perfil...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 w-full px-4">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 w-full overflow-hidden">
            <div className="w-full bg-white rounded-xl shadow-md relative min-h-screen">

                <div className="absolute top-4 right-4 z-10">
                    <div className="relative">
                        <span className="text-2xl text-gray-700">🔔</span>
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                            1
                        </span>
                    </div>
                </div>

                <div className="h-28 w-full bg-gradient-to-r from-blue-900 to-indigo-400" />

                <div className="flex items-center gap-4 px-6 py-6">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                        👤
                    </div>
                    <div>
                        <h2 className="text-4xl font-bold">{formData.username}</h2>
                        <p className="text-1xl text-gray-600">{formData.email}</p>
                        <p className="text-1xl text-gray-400">Sem instituição associada</p>
                    </div>
                </div>

                <div className="px-6 py-6 space-y-6">
                    <div>
                        <p className="text-1xl text-gray-500 font-semibold mb-1">Nome Completo</p>
                        <p className="text-2xl">{formData.username}</p>
                    </div>
                    <div>
                        <p className="text-1xl text-gray-500 font-semibold mb-1">Número de Contato</p>
                        <p className="text-2xl">{formData.contractNumber}</p>
                    </div>
                </div>

                <div className="px-6 py-6 flex justify-center gap-5">
                    <button onClick={editingProfile} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded">
                        Editar
                    </button>
                    <button onClick={handleExitAccount} className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded flex items-center gap-1">
                        Sair 
                    </button>
                </div>
            </div>

            <EditingAccount
                open={editAccount}
                onCancel={() => setEditAccount(false)}
                user={{
                    id: formData.id,
                    username: formData.username,
                    contractNumber: formData.contractNumber,
                    password: '',
                    email: formData.email
                }}
                onUpdateSuccess={handleAccountUpdated}
            />
        </div>
    );
}
