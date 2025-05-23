// components/ActionSidebar.tsx
import React from 'react';
import { useSpring, animated } from 'react-spring';

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
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.4301 12.98L21.5401 11.33C21.7301 11.18 21.7801 10.91 21.6601 10.69L19.6601 7.23C19.5401 7.01 19.2701 6.92999 19.0501 7.00999L16.5601 8.00999C16.0401 7.60999 15.4801 7.26999 14.8701 7.01999L14.4901 4.42C14.4601 4.18 14.2501 3.99999 14.0001 3.99999H10.0001C9.75006 3.99999 9.54006 4.18 9.51006 4.42L9.13006 7.01999C8.52006 7.26999 7.96006 7.60999 7.44006 8.00999L4.95006 7.00999C4.73006 6.92999 4.46006 7.01 4.34006 7.23L2.34006 10.69C2.22006 10.91 2.27006 11.18 2.46006 11.33L4.57006 12.98C4.53006 13.3 4.50006 13.63 4.50006 13.96C4.50006 14.29 4.53006 14.62 4.57006 14.94L2.46006 16.59C2.27006 16.74 2.22006 17.01 2.34006 17.23L4.34006 20.69C4.46006 20.91 4.73006 20.99 4.95006 20.91L7.44006 19.91C7.96006 20.31 8.52006 20.65 9.13006 20.9L9.51006 23.5C9.54006 23.74 9.75006 23.92 10.0001 23.92H14.0001C14.2501 23.92 14.4601 23.74 14.4901 23.5L14.8701 20.9C15.4801 20.65 16.0401 20.31 16.5601 19.91L19.0501 20.91C19.2701 20.99 19.5401 20.91 19.6601 20.69L21.6601 17.23C21.7801 17.01 21.7301 16.74 21.5401 16.59L19.4301 14.94C19.4701 14.62 19.5001 14.29 19.5001 13.96C19.5001 13.63 19.4701 13.3 19.4301 12.98ZM12.0001 16.46C10.0801 16.46 8.50006 14.88 8.50006 12.96C8.50006 11.04 10.0801 9.45999 12.0001 9.45999C13.9201 9.45999 15.5001 11.04 15.5001 12.96C15.5001 14.88 13.9201 16.46 12.0001 16.46Z" />
  </svg>
);
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

interface ActionSidebarProps {
  targetTopPosition: number | null;
  onAddItemToSection: () => void;
  onAddNewSection: () => void;
  onSectionSettings: () => void;
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
  onSectionSettings,
  onDeleteSection,
  canDeleteItem,
  onDeleteItemFromSection,
  containerClassNameFromPage = '',
  buttonClassNameFromPage = '',
  disabledButtonClassNameFromPage = '',
  iconClassNameFromPage = '',
}) => {
  const springProps = useSpring({
    top: targetTopPosition !== null ? targetTopPosition : -300, // Mover para fora da tela se null
    opacity: targetTopPosition !== null ? 1 : 0,
    config: { tension: 210, friction: 20 },
  });

  // Opcional: não renderizar se completamente invisível e fora da tela.
  // if (targetTopPosition === null && springProps.opacity.get() < 0.01) {
  //     return null;
  // }

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

      <button
        type="button"
        onClick={onSectionSettings}
        className={getButtonClasses()}
        aria-label="Configurações da seção"
        title="Configurações da seção"
      >
        <SettingsIcon className={iconClassNameFromPage} />
      </button>

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