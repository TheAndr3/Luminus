// components/PageHeader.tsx
import React from 'react';

// Componente funcional para o ícone de "Voltar" (seta para a esquerda)
const BackIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24" // Largura do SVG
    height="24" // Altura do SVG
    viewBox="0 0 24 24" // Define a área de visualização do SVG
    fill="none" // Sem preenchimento de cor
    stroke="currentColor" // Cor do traço herdada do CSS (cor do texto atual)
    strokeWidth="2" // Largura do traço
    strokeLinecap="round" // Extremidades das linhas arredondadas
    strokeLinejoin="round" // Junções das linhas arredondadas
    className={className} // Classe CSS opcional para estilização
  >
    <polyline points="15 18 9 12 15 6"></polyline> {/* Desenha a forma da seta */}
  </svg>
);

// Interface para definir as propriedades esperadas pelo componente PageHeader
interface PageHeaderProps {
  isEditing: boolean; // Flag que indica se a página está em modo de edição
  onBackClick: () => void; // Função callback chamada quando o botão "Voltar" é clicado
  onToggleEditMode: () => void; // Função callback chamada para alternar o modo de edição
  className?: string; // Classe CSS opcional para o contêiner do cabeçalho
  backButtonClassName?: string; // Classe CSS opcional para o botão "Voltar"
  backButtonIconClassName?: string; // Classe CSS opcional para o ícone do botão "Voltar"
  toggleButtonClassName?: string; // Classe CSS opcional para o botão de alternar modo (Editar/Visualizar)
  editModeText?: React.ReactNode; // Texto ou elemento React a ser exibido no botão de alternância quando NÃO está em modo de edição (ou seja, para entrar no modo de edição)
  viewModeText?: React.ReactNode; // Texto ou elemento React a ser exibido no botão de alternância quando ESTÁ em modo de edição (ou seja, para sair do modo de edição e visualizar)
  // Funções de callback para eventos de foco, com um contexto específico para este cabeçalho
  onFieldFocus?: (element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => void;
  onFieldBlur?: () => void;
}

// Definição do componente funcional PageHeader
const PageHeader: React.FC<PageHeaderProps> = ({
  isEditing, // Estado atual de edição
  onBackClick, // Callback para o botão de voltar
  onToggleEditMode, // Callback para alternar o modo de edição
  className = '', // Classe CSS para o elemento header (padrão: string vazia)
  backButtonClassName = '', // Classe CSS para o botão de voltar (padrão: string vazia)
  backButtonIconClassName = '', // Classe CSS para o ícone de voltar (padrão: string vazia)
  toggleButtonClassName = '', // Classe CSS para o botão de alternar modo (padrão: string vazia)
  editModeText = 'Editar', // Texto padrão para entrar no modo de edição
  viewModeText = 'Visualizar', // Texto padrão para sair do modo de edição
  onFieldFocus, // Callback opcional para quando um campo/botão no cabeçalho ganha foco
  onFieldBlur,  // Callback opcional para quando um campo/botão no cabeçalho perde foco
}) => {

    // Manipulador local para o evento de foco nos botões do cabeçalho.
    // Chama o onFieldFocus global (se existir) com um contexto específico
    // indicando que o foco ocorreu nos controles do cabeçalho da página.
    const handleLocalFocus = (element: HTMLElement) => {
        if (onFieldFocus) {
            // O ID 'page-header-controls' é um identificador para o contexto do foco.
            onFieldFocus(element, { type: 'section', id: 'page-header-controls' });
        }
    };

    // Manipulador local para o evento de blur nos botões do cabeçalho.
    // Chama o onFieldBlur global (se existir).
    const handleLocalBlur = () => {
        if (onFieldBlur) {
            onFieldBlur();
        }
    };


  // Renderiza o cabeçalho da página
  return (
    <header className={className}> {/* Contêiner principal do cabeçalho com classe CSS customizável */}
      {/* Botão "Voltar" */}
      <button
        type="button" // Define o tipo do botão para evitar submissão de formulário
        onClick={onBackClick} // Define a ação ao clicar
        aria-label="Voltar" // Acessibilidade: rótulo para leitores de tela
        className={backButtonClassName} // Aplica classe CSS customizável ao botão
        onFocus={(e) => handleLocalFocus(e.target as HTMLButtonElement)} // Chama handleLocalFocus quando o botão ganha foco
        onBlur={handleLocalBlur} // Chama handleLocalBlur quando o botão perde foco
      >
        <BackIcon className={backButtonIconClassName} /> {/* Renderiza o ícone de voltar com classe CSS customizável */}
      </button>

      {/* Botão para alternar entre modo de Edição e Visualização */}
      <button
        type="button" // Define o tipo do botão
        onClick={onToggleEditMode} // Define a ação ao clicar
        className={toggleButtonClassName} // Aplica classe CSS customizável ao botão
        onFocus={(e) => handleLocalFocus(e.target as HTMLButtonElement)} // Chama handleLocalFocus quando o botão ganha foco
        onBlur={handleLocalBlur} // Chama handleLocalBlur quando o botão perde foco
      >
        {/* O texto do botão muda dependendo do estado 'isEditing' */}
        {isEditing ? viewModeText : editModeText}
      </button>
    </header>
  );
};

// Exporta o componente PageHeader como padrão
export default PageHeader;