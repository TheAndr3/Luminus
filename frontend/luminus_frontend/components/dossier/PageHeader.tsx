// components/PageHeader.tsx
import React from 'react';

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
    className={className} 
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

interface PageHeaderProps {
  isEditing: boolean;
  onBackClick: () => void;
  onToggleEditMode: () => void;
  className?: string;
  backButtonClassName?: string;
  backButtonIconClassName?: string;
  toggleButtonClassName?: string;
  editModeText?: React.ReactNode;
  viewModeText?: React.ReactNode;
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
  onFieldFocus, 
  onFieldBlur,  
}) => {

    const handleLocalFocus = (element: HTMLElement) => {
        if (onFieldFocus) {
            onFieldFocus(element, { type: 'section', id: 'page-header-controls' }); 
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
        onFocus={(e) => handleLocalFocus(e.target)} 
        onBlur={handleLocalBlur} 
      >
        <BackIcon className={backButtonIconClassName} />
      </button>

      <button
        type="button"
        onClick={onToggleEditMode}
        className={toggleButtonClassName}
         onFocus={(e) => handleLocalFocus(e.target)} 
        onBlur={handleLocalBlur} 
      >
        {isEditing ? viewModeText : editModeText}
      </button>
    </header>
  );
};

export default PageHeader;