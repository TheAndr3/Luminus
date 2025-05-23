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
}) => {
  return (
    <header className={className}>
      <button
        type="button"
        onClick={onBackClick}
        aria-label="Voltar"
        className={backButtonClassName}
      >
        <BackIcon className={backButtonIconClassName} />
      </button>

      <button
        type="button"
        onClick={onToggleEditMode}
        className={toggleButtonClassName}
      >
        {isEditing ? viewModeText : editModeText}
      </button>
    </header>
  );
};

export default PageHeader;