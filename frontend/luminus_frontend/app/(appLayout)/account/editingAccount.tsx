"use client"; // Marca este componente como um Componente Cliente no Next.js, permitindo o uso de hooks e interatividade.

import { BaseInput } from "@/components/inputs/BaseInput"; // Componente de input base
import { Button } from "@/components/ui/button"; // Componente de botão da sua UI library (provavelmente Shadcn UI)
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"; // Componentes de diálogo da sua UI library
import { useEffect, useState } from "react"; // Hooks do React para estado e efeitos colaterais
import Image from "next/image"; // Componente otimizado de imagem do Next.js
import class_icon from "@/components/icon/icon_classroom.svg"; // Ícone SVG
import { ErroMessageDialog } from "../classroom/components/erroMessageDialog"; // Componente de diálogo para exibir mensagens de erro
import { updateProfile } from "@/services/profileService"; // Serviço de API para atualizar o perfil do usuário

// Define as propriedades (props) que o componente EditingAccount aceitará
interface EditingAccountProps {
  open: boolean; // Controla se o diálogo está aberto ou fechado
  onCancel: () => void; // Função de callback para ser chamada quando o diálogo é cancelado/fechado
  user: {
    id: number; // ID do usuário a ser editado
    username: string; // Nome de usuário atual
    password: string; // Senha atual (provavelmente uma string vazia por segurança, não a senha real)
  };
  onUpdateSuccess?: () => void; // Função de callback opcional para ser chamada após uma atualização bem-sucedida
}

// Definição do componente EditingAccount
export default function EditingAccount({
  open,          // Propriedade para controlar a abertura do modal
  onCancel,      // Função para fechar o modal
  user,          // Dados do usuário passados do componente pai
  onUpdateSuccess, // Função de callback para notificar o sucesso da atualização
}: EditingAccountProps) {
  // Estado para controlar o estado de salvamento (desabilitar botão, mostrar "Carregando...")
  const [save, setSave] = useState(false);
  // Estado para armazenar o valor do campo de nome de usuário
  const [usernameAccount, setUsernameAccount] = useState("");
  // Estado para armazenar o valor do campo de senha (inicialmente vazio)
  const [passwordAccount, setPasswordAccount] = useState("");
  // Estado para controlar a visibilidade do diálogo de erro de campos ausentes
  const [missingDialog, setMissingDialog] = useState(false);
  // Estado para armazenar a mensagem de erro a ser exibida
  const [messageErro, setMessageErro] = useState("");
  // Estado para controlar o texto do botão de salvar
  const [messageButton, setMessageButton] = useState("Concluir");

  // Título exibido no cabeçalho do diálogo
  const title = "Edite seu perfil aqui";

  // Efeito colateral para preencher os campos do formulário quando o modal é aberto
  // ou quando os dados do usuário mudam.
  useEffect(() => {
    if (open) { // Apenas preenche se o modal estiver aberto
      setUsernameAccount(user.username || ""); // Define o nome de usuário inicial
      setPasswordAccount(""); // Sempre limpa o campo de senha por segurança
    }
  }, [open, user]); // Dependências: 'open' (para reagir à abertura) e 'user' (para reagir a mudanças nos dados do usuário)

  // Função assíncrona para lidar com o clique do botão "Concluir" (salvar)
  const handleClick = async () => {
    setSave(true); // Desabilita o botão e ativa o estado de salvamento
    setMessageButton("Carregando..."); // Altera o texto do botão para indicar carregamento

    // Validação básica: verifica se o campo de nome de usuário está vazio
    if (!usernameAccount) {
      setMessageErro("Por favor, preencha o campo de nome de usuário."); // Mensagem de erro mais específica
      setMissingDialog(true); // Abre o diálogo de erro
      setSave(false); // Reabilita o botão
      setMessageButton("Concluir"); // Restaura o texto do botão
      return; // Interrompe a execução da função
    }

    try {
      // Cria o objeto de dados para atualização.
      // A senha só é incluída se passwordAccount não for uma string vazia,
      // permitindo que o usuário atualize apenas o nome de usuário se desejar.
      const updateData: { name: string; password?: string } = {
        name: usernameAccount,
        ...(passwordAccount && { password: passwordAccount }), // Condicionalmente adiciona a senha
      };

      console.log("Chamando API para atualizar perfil real:", user.id, updateData);
      await updateProfile(user.id, updateData); // Chama o serviço de API para atualizar o perfil

      onCancel(); // Fecha o modal após o sucesso da atualização

      if (onUpdateSuccess) {
        onUpdateSuccess(); // Chama o callback para notificar o componente pai (ex: para recarregar os dados)
      }
    } catch (err: any) {
      // Captura e trata erros da chamada da API
      setMessageErro(
        err.message || "Impossível salvar os dados editados. Por favor, tente novamente!" // Mensagem de erro padrão ou da API
      );
      setMissingDialog(true); // Abre o diálogo de erro
    } finally {
      // Bloco finally sempre é executado, independentemente de sucesso ou erro
      setSave(false); // Reabilita o botão
      setMessageButton("Concluir"); // Restaura o texto do botão
    }
  };

  return (
    // Componente Dialog para criar um modal.
    // onOpenChange é usado para fechar o modal quando o overlay é clicado ou Esc é pressionado.
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      {/* Overlay escuro que cobre o restante da tela quando o modal está aberto */}
      <DialogOverlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" />
      {/* Conteúdo principal do diálogo/modal */}
      <DialogContent className="h-[400px] max-w-6xl bg-[#012D48] rounded-2xl text-white border-1 border-black">
        <DialogTitle className="sr-only">Editar Perfil</DialogTitle> {/* Título para leitores de tela */}

        {/* Cabeçalho do modal com ícone e título */}
        <div className="relative mb-6">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-white w-12 h-12 rounded-lg">
            <Image src={class_icon} alt="icone perfil" className="w-12 h-12" />
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span className="text-4xl font-bold">{title}</span> {/* Exibe o título "Edite seu perfil aqui" */}
          </div>
        </div>

        {/* Grade de inputs para nome e senha */}
        <div className="grid grid-cols-2 gap-4 m-6">
          {/* Input para Nome de Usuário */}
          <div className="flex items-center gap-3">
            <label className="text-2xl">Nome:</label>
            <BaseInput
              className="w-90 h-10 text-gray-900 font-medium bg-gray-100 text-gray-700 rounded-2xl"
              placeholder="Digite seu nome"
              value={usernameAccount}
              onChange={(e) => setUsernameAccount(e.target.value)} // Atualiza o estado ao digitar
            />
          </div>

          {/* Input para Senha */}
          <div className="flex items-center gap-3">
            <label className="text-2xl">Senha:</label>
            <BaseInput
              type="password" // Define o tipo do input como senha
              className="w-90 h-10 text-gray-900 font-medium bg-gray-100 text-gray-700 rounded-2xl"
              placeholder="******" // Placeholder genérico para senha
              value={passwordAccount}
              onChange={(e) => setPasswordAccount(e.target.value)} // Atualiza o estado ao digitar
            />
          </div>
        </div>

        {/* Seção do botão de salvar */}
        <div className="flex justify-end mr-7">
          <Button
            onClick={handleClick} // Chama a função handleClick ao clicar
            disabled={save} // Desabilita o botão enquanto estiver salvando
            className="bg-gray-300 text-black hover:bg-gray-400 rounded-full px-[3vh] py-[1vh] h-7"
          >
            {messageButton} {/* Exibe "Concluir" ou "Carregando..." */}
          </Button>
        </div>

        {/* Diálogo de mensagem de erro */}
        <ErroMessageDialog
          open={missingDialog} // Controla a visibilidade do diálogo de erro
          onConfirm={() => setMissingDialog(false)} // Callback para fechar o diálogo de erro
          description={messageErro} // Mensagem de erro a ser exibida
        />
      </DialogContent>
    </Dialog>
  );
