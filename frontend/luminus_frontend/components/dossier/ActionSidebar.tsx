// components/ActionSidebar.tsx
import React from 'react';

interface ActionSidebarProps {
  /** Controla a visibilidade da sidebar. */
  isVisible: boolean;

  /** Chamado ao clicar no botão "Adicionar Item". */
  onAddItemToSection: () => void;
  /** Chamado ao clicar no botão "Duplicar Seção". */
  onAddNewSection: () => void;
  /** Chamado ao clicar no botão "Configurações da Seção". */
  onSectionSettings: () => void;
  /** Chamado ao clicar no botão "Excluir Seção". */
  onDeleteSection: () => void;

  /** Indica se um item está selecionado e pode ser excluído. Habilita/desabilita o botão "Excluir Item". */
  canDeleteItem: boolean;
  /** Chamado ao clicar no botão "Excluir Item Selecionado". Deve ser definido se canDeleteItem pode ser true. */
  onDeleteItemFromSection?: () => void; // Opcional, mas necessário se canDeleteItem for true

  /** Classe CSS para o container principal da sidebar. */
  className?: string;
  /** Classe CSS base para todos os botões na sidebar. */
  buttonClassName?: string;
  /** Classe CSS específica para o botão "Adicionar Item". */
  addItemButtonClassName?: string;
  /** Classe CSS específica para o botão "Duplicar Seção". */
  duplicateSectionButtonClassName?: string;
  /** Classe CSS específica para o botão "Configurações da Seção". */
  sectionSettingsButtonClassName?: string;
  /** Classe CSS específica para o botão "Excluir Item". */
  deleteItemButtonClassName?: string;
  /** Classe CSS específica para o botão "Excluir Seção". */
  deleteSectionButtonClassName?: string;
  /** Classe CSS para botões desabilitados. */
  disabledButtonClassName?: string;
}

const ActionSidebar: React.FC<ActionSidebarProps> = ({
  isVisible,
  onAddItemToSection,
  onAddNewSection,
  onSectionSettings,
  onDeleteSection,
  canDeleteItem,
  onDeleteItemFromSection,
  className = '',
  buttonClassName = '',
  addItemButtonClassName = '',
  duplicateSectionButtonClassName = '',
  sectionSettingsButtonClassName = '',
  deleteItemButtonClassName = '',
  deleteSectionButtonClassName = '',
  disabledButtonClassName = '',
}) => {
  if (!isVisible) {
    return null;
  }

  const getButtonClasses = (specificClass: string) => {
    return `${buttonClassName} ${specificClass}`.trim();
  };

  const getDeleteItemButtonClasses = () => {
    let classes = `${buttonClassName} ${deleteItemButtonClassName}`;
    if (!canDeleteItem) {
      classes += ` ${disabledButtonClassName}`;
    }
    return classes.trim();
  };

  return (
    <aside className={className}>
      {/* 1. Adicionar novo SectionItem */}
      <button
        type="button"
        onClick={onAddItemToSection}
        className={getButtonClasses(addItemButtonClassName)}
        aria-label="Adicionar item à seção"
      >
        {/* Substitua por ícone se desejar, ex: <PlusIcon /> ou seu IconButton */}
        + Item
      </button>

      {/* 2. Duplicar (ou "Adicionar nova") Section */}
      {/* A prop é onAddNewSection, então o botão fará isso. */}
      <button
        type="button"
        onClick={onAddNewSection}
        className={getButtonClasses(duplicateSectionButtonClassName)}
        aria-label="Duplicar seção"
      >
        {/* Substitua por ícone, ex: <CopyIcon /> */}
        Copiar Seção
      </button>

      {/* 3. Configurar os conceitos da Section */}
      <button
        type="button"
        onClick={onSectionSettings}
        className={getButtonClasses(sectionSettingsButtonClassName)}
        aria-label="Configurações da seção"
      >
        {/* Substitua por ícone, ex: <SettingsIcon /> */}
        ⚙️ Config.
      </button>

      {/* 4. Excluir SectionItem que está focado */}
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
      >
        {/* Substitua por ícone, ex: <TrashIcon /> ou <MinusIcon /> */}
        - Item
      </button>

      {/* 5. Excluir toda a Section */}
      <button
        type="button"
        onClick={onDeleteSection}
        className={getButtonClasses(deleteSectionButtonClassName)}
        aria-label="Excluir seção inteira"
      >
        {/* Substitua por ícone, ex: <TrashIcon /> */}
        🗑️ Seção
      </button>
    </aside>
  );
};

export default ActionSidebar;