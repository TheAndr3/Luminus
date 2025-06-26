// src/components/Account.jsx ou .tsx
"use client"

import { useState, useEffect, useCallback } from "react";
import EditingAccount from "./editingAccount";

import { useRouter } from 'next/navigation';

export default function Account() {
    const router = useRouter();
    const [editAccount, setEditAccount] = useState(false);
    const [formData, setFormData] = useState({
        id: 1,
        username: '',
        contractNumber: '',
        // newPassword: '', // Não guardamos a senha no estado do pai que será exibida
        email: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleExitAccount = () => {
        router.push('/login')
    }

    // Função para simular a chamada da API para buscar os dados do usuário
    // Usamos useCallback para memorizar a função e evitar recriações desnecessárias,
    // que poderiam causar loops no useEffect.
    const fetchUserData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // **IMPORTANTE: SUBSTITUA ESTA SIMULAÇÃO PELA SUA CHAMADA DE API REAL!**
            // Exemplo: const response = await fetch('/api/user/1');
            // const data = await response.json();
            console.log("Iniciando busca de dados do usuário da API...");
            const data = await new Promise((resolve) => setTimeout(() => {
                // Simula uma resposta da API com dados de usuário
                resolve({
                    id: 1,
                    username: 'Armando Amador (via API)', // Dados que viriam da sua API
                    contractNumber: '(75) 98765-4321 (via API)', // Dados que viriam da sua API
                    email: 'armando.amador@example.com (via API)' // Dados que viriam da sua API
                });
            }, 1000)); // Atraso de 1 segundo para simular a rede

            setFormData(data as typeof formData);
        } catch (err: any) {
            setError("Erro ao carregar os dados do perfil. Tente novamente.");
            console.error("Erro ao buscar dados do usuário:", err);
        } finally {
            setLoading(false);
        }
    }, []); // Array de dependências vazio, pois a função não depende de estados/props que mudam

    // useEffect para carregar os dados do usuário quando o componente é montado (e sempre que fetchUserData muda)
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]); // Dispara fetchUserData na montagem e se fetchUserData mudar (o que não deve acontecer com useCallback)


    // Função para abrir o modal de edição
    const editingProfile = () => {
        setEditAccount(true);
    };

    // **NOVO:** Função para ser passada ao EditingAccount
    // Esta função será chamada pelo EditingAccount após uma atualização bem-sucedida da API.
    // Ela forçará o componente Account a recarregar os dados mais recentes.
    const handleAccountUpdated = () => {
        console.log("Account: Modal EditingAccount notificou sucesso na atualização. Recarregando dados do perfil...");
        fetchUserData(); // Dispara o recarregamento dos dados da API
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
        // Contêiner principal da tela
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 w-full overflow-hidden">

            {/* Card principal */}
            <div className="w-full bg-white rounded-xl shadow-md  relative  min-h-screen">

                {/* Notificação */}
                <div className="absolute top-4 right-4 z-10">
                    <div className="relative">
                        <span className="text-2xl text-gray-700">🔔</span>
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                            1
                        </span>
                    </div>
                </div>

                {/* Banner */}
                <div className="h-28 w-full bg-gradient-to-r from-blue-900 to-indigo-400" />

                {/* Seção de perfil (foto, nome, email) */}
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

                {/* Informações (Nome Completo, Número de Contato) */}
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

                {/* Botões */}
                <div className="px-6 py-6 flex justify-center gap-5">
                    <button onClick={editingProfile} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded">
                        Editar
                    </button>
                    <button onClick={handleExitAccount} className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded flex items-center gap-1">
                        Sair 
                    </button>
                </div>
            </div>

            {/* O modal de edição */}
            <EditingAccount
                open={editAccount}
                onCancel={() => setEditAccount(false)}
                user={{
                    id: formData.id,
                    username: formData.username,
                    contractNumber: formData.contractNumber,
                    password: '', // Não envie a senha real para o modal, apenas um placeholder vazio
                    email: formData.email
                }}
                // **NOVO:** onUpdateSuccess para que o modal notifique o pai
                onUpdateSuccess={handleAccountUpdated}
            />
        </div>
    );
}