"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import EditingAccount from "./editingAccount";
import { ConfirmDeletation } from "./confirmDeletation";
import { deleteProfile } from "@/services/profileService";
import { GetProfile } from "@/services/professorService";
import { ErroMessageDialog } from "../classroom/components/erroMessageDialog";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield, Calendar, Edit, Trash2, LogOut, Settings } from "lucide-react";

interface FormDataType {
  id: number;
  username: string;
  email: string;
  role?: string;
}

export default function Account() {
  const [openMessage, setOpenMessage] = useState(false);
  const [messageDialog, setMessageDialog] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const router = useRouter();
  const [editAccount, setEditAccount] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    id: 0,
    username: '',
    email: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteProfile = () => {
    setDeleteDialog(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("professorId");
    localStorage.removeItem("token");
    router.push("/login");
  };

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const professorId = localStorage.getItem("professorId");

      if (!professorId) {
        setMessageDialog("ID do professor não encontrado no localStorage.")
        setOpenMessage(true)
        throw new Error("ID do professor não encontrado no localStorage.");
      }

      const data = await GetProfile(parseInt(professorId, 10));

      setFormData({
        id: parseInt(professorId, 10),
        username: data.name,
        email: data.email,
        role: data.role || 'Professor'
      });

    } catch (err) {
      setMessageDialog("Erro ao carregar os dados do perfil.")
      setOpenMessage(true)
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const editingProfile = () => setEditAccount(true);

  const handleAccountUpdated = () => {
    console.log("Perfil atualizado, recarregando dados...");
    fetchUserData();
  };

  const DeleteProfile = async (userId: number) => {
    try {
      const response = await deleteProfile(userId);
      console.log("Conta excluída com sucesso:", response.message);
      router.push("/login"); 
    } catch (error: any) {
      console.error("Erro ao excluir perfil:", error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 w-full px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Carregando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 w-full px-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 h-32 relative">
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          
          <div className="relative px-8 pb-8">
            <div className="flex items-end gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg -mt-12 border-4 border-white">
                {formData.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{formData.username}</h1>
                <p className="text-lg text-gray-600 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  {formData.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-gray-900" />
              <h2 className="text-xl font-semibold text-gray-900">Informações Pessoais</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nome Completo</label>
                <p className="text-lg text-gray-900">{formData.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg text-gray-900">{formData.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Função</label>
                <p className="text-lg text-gray-900">{formData.role}</p>
              </div>
            </div>
          </div>

          {/* Account Statistics Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Estatísticas da Conta</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ID do Usuário</span>
                <span className="font-mono text-gray-900">#{formData.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status da Conta</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Ativa
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tipo de Acesso</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  Professor
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Ações da Conta</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={editingProfile}
              className="h-12 text-base font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-full py-3 px-8 shadow-md border border-gray-700 transition-all duration-200 hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              Editar Perfil
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="h-12 text-base font-medium border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full py-3 px-8 shadow-md border transition-all duration-200 hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sair da Conta
            </Button>
            
            <Button
              onClick={handleDeleteProfile}
              variant="destructive"
              className="h-12 text-base font-medium rounded-full py-3 px-8 shadow-md border border-red-600 transition-all duration-200 hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Excluir Conta
            </Button>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Informações Adicionais</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Sobre o Sistema</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                O Luminus é uma plataforma educacional desenvolvida para facilitar o gerenciamento 
                de turmas e avaliações. Como professor, você tem acesso completo às funcionalidades 
                de criação e gestão de dossiês de avaliação.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Suporte</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Em caso de dúvidas ou problemas, entre em contato com a equipe de suporte 
                através do email de contato ou consulte a documentação disponível.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditingAccount
        open={editAccount}
        onCancel={() => setEditAccount(false)}
        user={{
          id: formData.id,
          username: formData.username,
          password: '',
        }}
        onUpdateSuccess={handleAccountUpdated}
      />

      <ConfirmDeletation
        open={deleteDialog}
        onCancel={() => setDeleteDialog(false)}
        onConfirm={() => DeleteProfile(formData.id)}
      />

      <ErroMessageDialog
        open={openMessage}
        onConfirm={() => setOpenMessage(false)}
        description={messageDialog}
      />
    </div>
  );
} 