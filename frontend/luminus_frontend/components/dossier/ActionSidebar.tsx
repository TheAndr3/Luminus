// components/ActionSidebar.tsx
import React from 'react';
import { useSpring, animated, config as springConfig } from 'react-spring'; // Importar config

// --- Ícones SVG Placeholder ---
const AddItemIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
    <path d="M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3ZM5 5V19H19V5H5Z" fillRule="evenodd" clipRule="evenodd"/>
  </svg>
);
const AddSectionIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z" />
  </svg>
);
// SettingsIcon foi movido para DossierHeader
const DeleteItemIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 3V4H4V6H5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6ZM9 8V17H11V8H9ZM13 8V17H15V8H13Z"/>
  </svg>
);
const DeleteSectionIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" >
    <path d="M6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" />
  </svg>
);
// --- Fim dos Ícones SVG Placeholder ---

interface ActionSidebarProps {
  targetTopPosition: number | null; // Pode ser null para ocultar
  onAddItemToSection: () => void;
  onAddNewSection: () => void;
  // onSectionSettings: () => void; // Removido
  onDeleteSection: () => void;
  canDeleteItem: boolean;
  onDeleteItemFromSection?: () => void;
  containerClassNameFromPage?: string;
  buttonClassNameFromPage?: string;
  disabledButtonClassNameFromPage?: string;
  iconClassNameFromPage?: string;
}

const ActionSidebar: React.FC<ActionSidebarProps> = ({
  targetTopPosition,
  onAddItemToSection,
  onAddNewSection,
  // onSectionSettings, // Removido
  onDeleteSection,
  canDeleteItem,
  onDeleteItemFromSection,
  containerClassNameFromPage = '',
  buttonClassNameFromPage = '',
  disabledButtonClassNameFromPage = '',
  iconClassNameFromPage = '',
}) => {
  // Use useSpring para animar a propriedade 'top'.
  // targetTopPosition = null significa que a sidebar deve estar "escondida" (opacidade 0, top fora da tela).
  const springProps = useSpring({
    top: targetTopPosition !== null ? targetTopPosition : -100, // Posição inicial "fora da tela" (ajustado para garantir que não apareça no topo)
    opacity: targetTopPosition !== null ? 1 : 0,
    // Configuração da mola para uma resposta um pouco suave, mas rápida
    config: springConfig.stiff, // Ex: tension: 210, friction: 20
    immediate: targetTopPosition === null, // Se está escondendo, use transição imediata para evitar "voltar" antes de sumir
  });

   // Otimização para não renderizar o DOM quando completamente invisível.
   // Espera a opacidade chegar a 0 e a posição sair da tela antes de renderizar null.
  if (targetTopPosition === null && springProps.opacity.get() < 0.01 && springProps.top.get() < -50) {
      return null;
  }


  const getButtonClasses = () => {
    return `${buttonClassNameFromPage}`.trim();
  };

  const getDeleteItemButtonClasses = () => {
    let classes = `${buttonClassNameFromPage}`;
    if (!canDeleteItem) {
      classes += ` ${disabledButtonClassNameFromPage}`;
    }
    return classes.trim();
  };

  // A ActionSidebar é renderizada condicionalmente em page.tsx, então não precisa de lógica aqui para mostrar/esconder baseada em targetTopPosition === null
  // O `springProps.opacity` e `top` cuidam da animação de entrada/saída.
  // A renderização condicional em page.tsx gerencia o montagem/desmontagem.

  return (
    <animated.aside
      className={containerClassNameFromPage}
      style={springProps}
    >
      <button
        type="button"
        onClick={onAddItemToSection}
        className={getButtonClasses()}
        aria-label="Adicionar item à seção"
        title="Adicionar item à seção"
      >
        <AddItemIcon className={iconClassNameFromPage} />
      </button>

      <button
        type="button"
        onClick={onAddNewSection}
        className={getButtonClasses()}
        aria-label="Adicionar nova seção abaixo"
        title="Adicionar nova seção abaixo"
      >
        <AddSectionIcon className={iconClassNameFromPage} />
      </button>

      {/* Botão de Settings removido daqui */}
      {/* <button ...> <SettingsIcon /> </button> */}

      <button
        type="button"
        onClick={() => {
          if (canDeleteItem && onDeleteItemFromSection) {
            onDeleteItemFromSection();
          }
        }}
        disabled={!canDeleteItem}
        className={getDeleteItemButtonClasses()}
        aria-label="Excluir item selecionado"
        title="Excluir item selecionado"
      >
        <DeleteItemIcon className={iconClassNameFromPage} />
      </button>

      <button
        type="button"
        onClick={onDeleteSection}
        className={getButtonClasses()}
        aria-label="Excluir seção inteira"
        title="Excluir seção inteira"
      >
        <DeleteSectionIcon className={iconClassNameFromPage} />
      </button>
    </animated.aside>
  );
};

export default ActionSidebar;