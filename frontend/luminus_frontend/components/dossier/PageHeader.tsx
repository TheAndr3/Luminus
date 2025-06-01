// components/PageHeader.tsx
import React from 'react';

// Ícones placeholder como componentes simples.
// Em um projeto real, você usaria SVGs importados ou uma biblioteca como react-icons.
const BackIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className} // Permite estilização do SVG em si
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

interface PageHeaderProps {
  isEditing: boolean;
  onBackClick: () => void;
  onToggleEditMode: () => void;
  /** Classe CSS para o container principal do header */
  className?: string;
  /** Classe CSS para o botão de voltar */
  backButtonClassName?: string;
  /** Classe CSS para o ícone do botão de voltar */
  backButtonIconClassName?: string;
  /** Classe CSS para o botão de alternar modo */
  toggleButtonClassName?: string;
  /** Texto ou elemento para o botão quando NÃO está em modo de edição (default: "Editar") */
  editModeText?: React.ReactNode;
  /** Texto ou elemento para o botão quando ESTÁ em modo de edição (default: "Visualizar") */
  viewModeText?: React.ReactNode;

    // Adicionados handlers de foco/blur, embora botões geralmente não posicionem a sidebar,
    // eles podem ser usados para limpar o estado de foco global se clicados.
    onFieldFocus?: (element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => void;
    onFieldBlur?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  isEditing,
  onBackClick,
  onToggleEditMode,
  className = '',
  backButtonClassName = '',
  backButtonIconClassName = '',
  toggleButtonClassName = '',
  editModeText = 'Editar',
  viewModeText = 'Visualizar',
    onFieldFocus, // Recebe handler de foco do pai
    onFieldBlur,  // Recebe handler de blur do pai
}) => {

    // Handlers locais para chamar os handlers passados pelo pai
    // Estes botões não representam itens ou seções para a sidebar, mas podem limpar o estado de foco global
    // se o foco sair de um campo de item para um desses botões.
    const handleLocalFocus = (element: HTMLElement) => {
        if (onFieldFocus) {
             // Usamos um contexto genérico que a page.tsx reconhece para limpar a seleção de item,
             // mas não para posicionar a sidebar.
            onFieldFocus(element, { type: 'section', id: 'page-header-controls' }); // Usando type 'section' e id fixo
        }
    };

    const handleLocalBlur = () => {
        if (onFieldBlur) {
            onFieldBlur();
        }
    };


  return (
    <header className={className}>
      <button
        type="button"
        onClick={onBackClick}
        aria-label="Voltar"
        className={backButtonClassName}
        onFocus={(e) => handleLocalFocus(e.target)} // Usa handler local
        onBlur={handleLocalBlur} // Usa handler local
      >
        <BackIcon className={backButtonIconClassName} />
      </button>

      <button
        type="button"
        onClick={onToggleEditMode}
        className={toggleButtonClassName}
         onFocus={(e) => handleLocalFocus(e.target)} // Usa handler local
        onBlur={handleLocalBlur} // Usa handler local
      >
        {isEditing ? viewModeText : editModeText}
      </button>
    </header>
  );
};

export default PageHeader;