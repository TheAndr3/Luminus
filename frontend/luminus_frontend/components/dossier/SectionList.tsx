// components/SectionList.tsx
import React from 'react';
import Section from './Section'; // Ajuste o caminho se necessário
// Supondo que você tenha tipos definidos
import { SectionData, ItemData } from '../../types/dossier';

// Definições de tipo para clareza (se não importadas de outro lugar)


interface SectionListProps {
  sections: SectionData[];
  isEditing: boolean;

  /** ID da seção atualmente "ativa" para fins de estilização (e.g., barra rosa) ou outras interações no nível da seção. */
  selectedSectionIdForStyling: string | null;
  /** ID do item atualmente selecionado em *toda* a lista. A ActionSidebar aparecerá ao lado deste item. */
  selectedItemId: string | null;

  // Callbacks para interações com a seção
  onSectionAreaClick: (sectionId: string | null) => void; // Para selecionar/desselecionar a seção para estilização/foco
  onSectionTitleChange: (sectionId: string, newTitle: string) => void;
  onAddNewSection: (sectionId: string) => void;
  onSectionSettings: (sectionId: string) => void;
  onSectionDelete: (sectionId: string) => void;

  // Callbacks para interações com itens dentro de uma seção
  onItemAdd: (sectionId: string) => void;
  onItemChange: (sectionId: string, itemId: string, field: 'description' | 'value', newValue: string) => void;
  onItemDelete: (sectionId: string, itemId: string) => void;
  /** Chamado quando um item é selecionado/desselecionado. Passa o ID do item ou null. */
  onItemSelect: (itemId: string | null) => void;


  // Props de estilização
  className?: string; // Para o container da lista de seções

  // Props de estilização a serem passadas para cada Section
  // (Prefixadas com 'sectionComponent' para evitar conflito se SectionList tiver classes similares)
  sectionComponentClassName?: string;
  sectionComponentContentWrapperClassName?: string;
  sectionComponentSelectedStylingClassName?: string; // Para a barra rosa da seção "ativa"
  sectionComponentTitleContainerClassName?: string;
  sectionComponentTitleEditableFieldClassName?: string;
  sectionComponentTitleTextClassName?: string;
  sectionComponentTitleInputClassName?: string;
  sectionComponentItemsListClassName?: string;

  // Props de estilização a serem passadas para cada SectionItem (via Section)
  sectionItemClassName?: string;
  sectionItemSelectedClassName?: string;
  sectionItemDescriptionFieldContainerClassName?: string;
  sectionItemDescriptionTextDisplayClassName?: string;
  sectionItemDescriptionInputClassName?: string;
  sectionItemValueFieldContainerClassName?: string;
  sectionItemValueTextDisplayClassName?: string;
  sectionItemValueInputClassName?: string;

  // Props de estilização a serem passadas para a ActionSidebar (via Section)
  actionSidebarContainerClassName?: string;
  actionSidebarButtonClassName?: string;
  actionSidebarDisabledButtonClassName?: string;
  actionSidebarAddItemButtonClassName?: string;
  actionSidebarDuplicateSectionButtonClassName?: string;
  actionSidebarSectionSettingsButtonClassName?: string;
  actionSidebarDeleteItemButtonClassName?: string;
  actionSidebarDeleteSectionButtonClassName?: string;
}

const SectionList: React.FC<SectionListProps> = ({
  sections,
  isEditing,
  selectedSectionIdForStyling,
  selectedItemId,
  onSectionAreaClick,
  onSectionTitleChange,
  onAddNewSection,
  onSectionSettings,
  onSectionDelete,
  onItemAdd,
  onItemChange,
  onItemDelete,
  onItemSelect,
  className = '',
  sectionComponentClassName,
  sectionComponentContentWrapperClassName,
  sectionComponentSelectedStylingClassName,
  sectionComponentTitleContainerClassName,
  sectionComponentTitleEditableFieldClassName,
  sectionComponentTitleTextClassName,
  sectionComponentTitleInputClassName,
  sectionComponentItemsListClassName,
  sectionItemClassName,
  sectionItemSelectedClassName,
  sectionItemDescriptionFieldContainerClassName,
  sectionItemDescriptionTextDisplayClassName,
  sectionItemDescriptionInputClassName,
  sectionItemValueFieldContainerClassName,
  sectionItemValueTextDisplayClassName,
  sectionItemValueInputClassName,
  actionSidebarContainerClassName,
  actionSidebarButtonClassName,
  actionSidebarDisabledButtonClassName,
  actionSidebarAddItemButtonClassName,
  actionSidebarDuplicateSectionButtonClassName,
  actionSidebarSectionSettingsButtonClassName,
  actionSidebarDeleteItemButtonClassName,
  actionSidebarDeleteSectionButtonClassName,
}) => {
  return (
    <div className={className}>
      {sections.map((section) => (
        <Section
          key={section.id}
          id={section.id}
          title={section.title}
          items={section.items}
          isEditing={isEditing}
          selectedItemId={selectedItemId} // Passa o ID do item selecionado globalmente
          onItemSelect={onItemSelect} // O SectionList gerencia qual item está selecionado globalmente
          onTitleChange={(newTitle) => onSectionTitleChange(section.id, newTitle)}
          onItemAdd={() => onItemAdd(section.id)}
          onItemChange={(itemId, field, newValue) => onItemChange(section.id, itemId, field, newValue)}
          onItemDelete={(itemId) => onItemDelete(section.id, itemId)}
          onAddNewSection={() => onAddNewSection(section.id)}
  
          onSectionSettings={() => onSectionSettings(section.id)}
          onDeleteSection={() => onSectionDelete(section.id)}
          onSectionAreaClick={() => onSectionAreaClick(section.id === selectedSectionIdForStyling ? null : section.id)}
          isSectionSelectedForStyling={section.id === selectedSectionIdForStyling}

          // Passando as props de estilização para o componente Section
          className={sectionComponentClassName}
          contentWrapperClassName={sectionComponentContentWrapperClassName}
          selectedSectionStylingClassName={sectionComponentSelectedStylingClassName}
          titleContainerClassName={sectionComponentTitleContainerClassName}
          titleEditableFieldClassName={sectionComponentTitleEditableFieldClassName}
          titleTextClassName={sectionComponentTitleTextClassName}
          titleInputClassName={sectionComponentTitleInputClassName}
          itemsListClassName={sectionComponentItemsListClassName}
          // Estilização para SectionItem (via Section)
          sectionItemClassName={sectionItemClassName}
          sectionItemSelectedClassName={sectionItemSelectedClassName}
          descriptionFieldContainerClassName={sectionItemDescriptionFieldContainerClassName}
          descriptionTextDisplayClassName={sectionItemDescriptionTextDisplayClassName}
          descriptionInputClassName={sectionItemDescriptionInputClassName}
          valueFieldContainerClassName={sectionItemValueFieldContainerClassName}
          valueTextDisplayClassName={sectionItemValueTextDisplayClassName}
          valueInputClassName={sectionItemValueInputClassName}
          // Estilização para ActionSidebar (via Section)
          actionSidebarContainerClassName={actionSidebarContainerClassName}
          actionSidebarButtonClassName={actionSidebarButtonClassName}
          actionSidebarDisabledButtonClassName={actionSidebarDisabledButtonClassName}
          actionSidebarAddItemButtonClassName={actionSidebarAddItemButtonClassName}
          actionSidebarDuplicateSectionButtonClassName={actionSidebarDuplicateSectionButtonClassName}
          actionSidebarSectionSettingsButtonClassName={actionSidebarSectionSettingsButtonClassName}
          actionSidebarDeleteItemButtonClassName={actionSidebarDeleteItemButtonClassName}
          actionSidebarDeleteSectionButtonClassName={actionSidebarDeleteSectionButtonClassName}
        />
      ))}
    </div>
  );
};

export default SectionList;