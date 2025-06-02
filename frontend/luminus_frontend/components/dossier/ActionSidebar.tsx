// components/ActionSidebar.tsx
import React from 'react';
import { useSpring, animated, config as springConfig } from 'react-spring'; 

// --- Ícones SVG Placeholder ---
const AddItemIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" /><path d="M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3ZM5 5V19H19V5H5Z" fillRule="evenodd" clipRule="evenodd"/></svg>
);
const AddSectionIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z" /></svg>
);
const DeleteItemIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9 3V4H4V6H5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6ZM9 8V17H11V8H9ZM13 8V17H15V8H13Z"/></svg>
);
const DeleteSectionIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" ><path d="M6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" /></svg>
);

interface ActionSidebarProps {
  targetTopPosition: number | null; 
  onAddItemToSection: () => void;
  onAddNewSection: () => void;
  onDeleteItemFromSection?: () => void;
  onDeleteSection: () => void;
  canDeleteItem: boolean; 
  canDeleteSection: boolean; 
  onClearBlurTimeout: () => void; // Mantém este nome, mas agora é clearBlurTimeoutAndSignalIgnore

  containerClassNameFromPage?: string;
  buttonClassNameFromPage?: string;
  disabledButtonClassNameFromPage?: string;
  iconClassNameFromPage?: string;
}

const ActionSidebar: React.FC<ActionSidebarProps> = ({
  targetTopPosition,
  onAddItemToSection,
  onAddNewSection,
  onDeleteItemFromSection,
  onDeleteSection,
  canDeleteItem,
  canDeleteSection, 
  onClearBlurTimeout, 
  containerClassNameFromPage = '',
  buttonClassNameFromPage = '',
  disabledButtonClassNameFromPage = '',
  iconClassNameFromPage = '',
}) => {
  const springProps = useSpring({
    top: targetTopPosition !== null ? targetTopPosition : -250, 
    opacity: targetTopPosition !== null ? 1 : 0,
    config: springConfig.stiff, 
  });

  if (targetTopPosition === null && springProps.opacity.get() < 0.01) { // Condição mais estrita para não renderizar
      return null;
  }

  const getButtonClasses = (enabled: boolean) => {
    let classes = `${buttonClassNameFromPage}`;
    if (!enabled) {
      classes += ` ${disabledButtonClassNameFromPage}`;
    }
    return classes.trim();
  };

  const handleContainerMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    // Verifica se o clique foi em um botão dentro da sidebar
    const targetIsButton = (e.target as HTMLElement).closest('button');
    if (targetIsButton) {
        console.log('%cDEBUG: ActionSidebar MouseDown on BUTTON - Calling onClearBlurTimeout (which signals ignore)', 'color:purple; font-weight:bold;');
        onClearBlurTimeout(); // Sinaliza para ignorar o próximo blur do campo
    } else {
        console.log('%cDEBUG: ActionSidebar MouseDown on CONTAINER (not button) - NOT calling onClearBlurTimeout', 'color:purple;');
        // Se o clique for no padding da sidebar, não queremos necessariamente impedir o blur.
        // Ou, alternativamente, sempre chamar para manter a sidebar visível se clicada.
        // Para consistência, vamos chamar sempre, e se o foco sair, o blur normal ocorrerá.
        // onClearBlurTimeout(); // Teste com e sem esta linha para cliques no padding
    }
  };

  return (
    <animated.aside
      className={containerClassNameFromPage}
      style={springProps}
      onMouseDown={handleContainerMouseDown} // <--- ATIVADO NO CONTAINER
    >
      <button
        type="button"
        onClick={() => {
            console.log('%cDEBUG: AddItemIcon onClick CALLED', 'color:green; font-weight:bold;');
            onAddItemToSection();
        }}
        className={getButtonClasses(true)} 
        aria-label="Adicionar item à seção" title="Adicionar item à seção"
        disabled={false}
      >
        <AddItemIcon className={iconClassNameFromPage} />
      </button>

      <button
        type="button"
        onClick={() => {
            console.log('%cDEBUG: AddSectionIcon onClick CALLED', 'color:green; font-weight:bold;');
            onAddNewSection();
        }}
        className={getButtonClasses(true)} 
        aria-label="Adicionar nova seção abaixo" title="Adicionar nova seção abaixo"
        disabled={false}
      >
        <AddSectionIcon className={iconClassNameFromPage} />
      </button>

      <button
        type="button"
        onClick={() => {
          if (canDeleteItem && onDeleteItemFromSection) {
            console.log('%cDEBUG: DeleteItemIcon onClick CALLED', 'color:green; font-weight:bold;');
            onDeleteItemFromSection();
          }
        }}
        disabled={!canDeleteItem} 
        className={getButtonClasses(canDeleteItem)}
        aria-label="Excluir item selecionado" title="Excluir item selecionado"
      >
        <DeleteItemIcon className={iconClassNameFromPage} />
      </button>

      <button
        type="button"
        onClick={() => {
            if (canDeleteSection) { 
                console.log('%cDEBUG: DeleteSectionIcon onClick CALLED', 'color:green; font-weight:bold;');
                onDeleteSection();
            }
        }}
        disabled={!canDeleteSection} 
        className={getButtonClasses(canDeleteSection)}
        aria-label="Excluir seção inteira" title="Excluir seção inteira"
      >
        <DeleteSectionIcon className={iconClassNameFromPage} />
      </button>
    </animated.aside>
  );
};

export default ActionSidebar;