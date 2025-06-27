"use client"; // Marca este componente como um Componente Cliente no Next.js

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation'; // Hook para navegação programática no Next.js
import EditingAccount from "./editingAccount"; // Componente para edição dos detalhes da conta do usuário
import { ConfirmDeletation } from "./confirmDeletation"; // Componente para confirmação de exclusão de conta
import { deleteProfile } from "@/services/profileService"; // Serviço de API para exclusão de perfil
import { GetProfile } from "@/services/professorService"; // ✅ Chamada de API real para obter o perfil do professor
import { ErroMessageDialog } from "../classroom/components/erroMessageDialog";

// Define a forma dos dados para o formulário do usuário
interface FormDataType {
  id: number;
  username: string;
  email: string;
}

export default function Account() {

  const [openMessage, setOpenMessage] = useState(false);
  const [messageDialog, setMessageDialog] = useState('');


  // Estado para controlar a visibilidade do diálogo de confirmação de exclusão
  const [deleteDialog, setDeleteDialog] = useState(false);
  // Instância do roteador Next.js para navegação
  const router = useRouter();
  // Estado para controlar a visibilidade do formulário de edição de conta
  const [editAccount, setEditAccount] = useState(false);
  // Estado para armazenar os dados do perfil do usuário
  const [formData, setFormData] = useState<FormDataType>({
    id: 0,
    username: '',
    email: ''
  });
  // Estado para indicar se os dados estão sendo carregados
  const [loading, setLoading] = useState(true);
  // Estado para armazenar quaisquer mensagens de erro durante a busca de dados
  const [error, setError] = useState<string | null>(null);

  // Manipulador para abrir o diálogo de confirmação de exclusão
  const handleDeleteProfile = () => {
    setDeleteDialog(true);
  };

  // useCallback memoiza a função fetchUserData para evitar recriações desnecessárias,
  // otimizando o desempenho para o array de dependências do useEffect.
  const fetchUserData = useCallback(async () => {
    setLoading(true); // Inicia o estado de carregamento
    setError(null); // Limpa quaisquer erros anteriores

    try {
      // Recupera o ID do professor do localStorage.
      // Este é um padrão comum, mas considere alternativas mais seguras para produção.
      const professorId = localStorage.getItem("professorId");

      // Lança um erro se o professorId não for encontrado, indicando um problema potencial
      if (!professorId) {
        setMessageDialog("ID do professor não encontrado no localStorage.")
        setOpenMessage(true)
        throw new Error("ID do professor não encontrado no localStorage.");
      }

      // Chama a API real para obter os dados do perfil do professor
      const data = await GetProfile(parseInt(professorId, 10));

      // Atualiza o estado formData com os dados do usuário obtidos
      setFormData({
        id: parseInt(professorId, 10), // Garante que o ID seja analisado como um número inteiro
        username: data.name,
        email: data.email
      });

    } catch (err) {
      // Captura e define quaisquer erros que ocorram durante a operação de busca
      setMessageDialog("Erro ao carregar os dados do perfil.")
      setOpenMessage(true)

      console.error(err); // Registra o erro para fins de depuração
    } finally {
      setLoading(false); // Finaliza o estado de carregamento, independentemente do sucesso ou falha
    }
  }, []); // Array de dependência vazio significa que esta função é criada uma única vez

  // Hook useEffect para buscar dados do usuário quando o componente é montado
  // e sempre que fetchUserData mudar (o que não acontecerá devido ao array de dependência vazio do useCallback)
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]); // O array de dependência garante que o efeito seja executado quando fetchUserData muda

  // Manipulador para abrir o formulário de edição de conta
  const editingProfile = () => setEditAccount(true);

  // Função de callback a ser executada após a conta ser atualizada com sucesso.
  // Ela busca novamente os dados do usuário para exibir as informações mais recentes.
  const handleAccountUpdated = () => {
    console.log("Perfil atualizado, recarregando dados...");
    fetchUserData(); // Recarrega os dados para mostrar o perfil atualizado
  };

  // Função assíncrona para lidar com a exclusão de um perfil de usuário
  const DeleteProfile = async (userId: number) => {
    try {
      const response = await deleteProfile(userId); // Chama a API para excluir o perfil
      console.log("Conta excluída com sucesso:", response.message);
      router.push("/login"); 
    } catch (error: any) {
      // Captura e registra quaisquer erros durante o processo de exclusão
      console.error("Erro ao excluir perfil:", error.message);
      // Potencialmente, você poderia definir um estado de erro aqui para exibir uma mensagem ao usuário
    }
  };

  // --- Renderização Condicional para Estados de Carregamento e Erro ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 w-full px-4">
        <p>Carregando perfil...</p> {/* Exibe mensagem de carregamento */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 w-full px-4">
        <p className="text-red-500">{error}</p> {/* Exibe mensagem de erro */}
      </div>
    );
  }

  // --- Renderização Principal do Componente ---
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 w-full overflow-hidden">
      <div className="w-full bg-white rounded-xl shadow-md relative min-h-screen">
        {/* Ícone de Sino de Notificação */}
        <div className="absolute top-4 right-4 z-10">
          <div className="relative">
            <span className="text-2xl text-gray-700">🔔</span>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">1</span>
          </div>
        </div>

        {/* Fundo do Cabeçalho do Perfil */}
        <div className="h-28 w-full bg-gradient-to-r from-blue-900 to-indigo-400" />

        {/* Seção de Informações do Perfil do Usuário */}
        <div className="flex items-center gap-4 px-6 py-6">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">👤</div>
          <div>
            <h2 className="text-4xl font-bold">{formData.username}</h2>
            <p className="text-1xl text-gray-600">{formData.email}</p>
            <p className="text-1xl text-gray-400">Sem instituição associada</p>
          </div>
        </div>

        {/* Detalhes Adicionais do Perfil (ex: Nome Completo) */}
        <div className="px-6 py-6 space-y-6">
          <div>
            <p className="text-1xl text-gray-500 font-semibold mb-1">Nome Completo</p>
            <p className="text-2xl">{formData.username}</p>
          </div>
        </div>

        {/* Botões de Ação: Editar e Deletar */}
        <div className="px-6 py-6 flex justify-center gap-5">
          <button
            onClick={editingProfile}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
          >
            Editar {/* Botão para abrir o formulário de edição */}
          </button>
          <button
            onClick={handleDeleteProfile} // Este abre o diálogo de confirmação de exclusão
            // ALERTA: O texto "Sair" é enganoso, pois aciona a exclusão da conta.
            // Considere alterar para "Deletar Conta" ou "Excluir Conta".
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded flex items-center gap-1"
          >
            Sair {/* Este botão atualmente inicia a exclusão da conta */}
          </button>
        </div>
      </div>

      {/* Modal/Diálogo de Edição de Conta */}
      <EditingAccount
        open={editAccount} // Controla a visibilidade com base no estado
        onCancel={() => setEditAccount(false)} // Callback para fechar o diálogo
        user={{
          id: formData.id,
          username: formData.username,
          password: '', // A senha é intencionalmente deixada em branco por segurança
        }}
        onUpdateSuccess={handleAccountUpdated} // Callback para buscar novamente os dados após a atualização
      />

      {/* Modal/Diálogo de Confirmação de Exclusão */}
      <ConfirmDeletation
        open={deleteDialog} // Controla a visibilidade com base no estado
        onCancel={() => setDeleteDialog(false)} // Callback para cancelar a exclusão
        onConfirm={() => DeleteProfile(formData.id)} // Callback para confirmar e executar a exclusão
      />

      <ErroMessageDialog
        open={openMessage}
        onConfirm={()=> setOpenMessage(false)}
        description={messageDialog}
      />
    </div>

    
  );
}
