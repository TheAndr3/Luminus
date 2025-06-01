// components/SectionList.tsx
import React from 'react';
import Section from './Section';
import { SectionData } from '../../types/dossier'; // Ajuste o caminho se necessário

interface SectionListProps {
  sections: SectionData[];
  isEditing: boolean;
  selectedSectionIdForStyling: string | null; // Passado para Section
  selectedItemId: string | null; // Passado para Section (que passa para SectionItem)

  onSectionAreaClick: (sectionId: string) => void; // Passado para Section
  onItemSelect: (itemId: string) => void; // Passado para Section (que passa para SectionItem)

  onSectionTitleChange: (sectionId: string, newTitle: string) => void;
  onSectionDescriptionChange: (sectionId: string, newDescription: string) => void;
  onSectionWeightChange: (sectionId: string, newWeight: string) => void;
  onItemChange: (sectionId: string, itemId: string, field: 'description' | 'value', newValue: string) => void;

  // Handlers de foco/blur passados do pai (page.tsx) para Section e SectionItem
  onFieldFocus: (element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => void;
  onFieldBlur: () => void;

  className?: string;
  sectionComponentClassName?: string;
  sectionComponentContentWrapperClassName?: string;
  sectionComponentSelectedStylingClassName?: string;

  sectionComponentTitleAndWeightContainerClassName?: string;
  sectionComponentTitleContainerClassName?: string;
  sectionComponentTitleEditableFieldClassName?: string;
  sectionComponentTitleTextClassName?: string;
  sectionComponentTitleInputClassName?: string;

  // Classes para a descrição da seção (passadas para Section)
  sectionComponentDescriptionContainerClassName?: string;
  sectionComponentDescriptionEditableFieldClassName?: string;
  sectionComponentDescriptionTextClassName?: string;
  sectionComponentDescriptionTextareaClassName?: string;

  sectionComponentWeightFieldContainerClassName?: string;
  sectionComponentWeightEditableFieldClassName?: string;
  sectionComponentWeightTextClassName?: string;
  sectionComponentWeightInputClassName?: string;

  sectionComponentItemsListClassName?: string;

  // Props para SectionItem (prefixadas com sectionItem em SectionListProps)
  // CORRIGIDO: Estes nomes estão corretos aqui em SectionListProps
  sectionItemClassName?: string;
  sectionItemSelectedClassName?: string;
  sectionItemDescriptionFieldContainerClassName?: string;
  sectionItemDescriptionTextDisplayClassName?: string;
  sectionItemDescriptionInputClassName?: string;
}

const SectionList: React.FC<SectionListProps> = ({
  sections,
  isEditing,
  selectedSectionIdForStyling,
  selectedItemId,
  onSectionAreaClick, // Passado para Section
  onItemSelect, // Passado para Section
  onSectionTitleChange,
  onSectionDescriptionChange,
  onSectionWeightChange,
  onItemChange,
  onFieldFocus,
  onFieldBlur,
  className = '',
  sectionComponentClassName,
  sectionComponentContentWrapperClassName,
  sectionComponentSelectedStylingClassName,
  sectionComponentTitleAndWeightContainerClassName,
  sectionComponentTitleContainerClassName,
  sectionComponentTitleEditableFieldClassName,
  sectionComponentTitleTextClassName,
  sectionComponentTitleInputClassName,
  // Classes de descrição da seção com defaults
  sectionComponentDescriptionContainerClassName = '',
  sectionComponentDescriptionEditableFieldClassName = '',
  sectionComponentDescriptionTextClassName = '',
  sectionComponentDescriptionTextareaClassName = '',
  sectionComponentWeightFieldContainerClassName,
  sectionComponentWeightEditableFieldClassName,
  sectionComponentWeightTextClassName,
  sectionComponentWeightInputClassName,
  sectionComponentItemsListClassName,
  // Recebendo as classes para SectionItem
  sectionItemClassName,
  sectionItemSelectedClassName,
  sectionItemDescriptionFieldContainerClassName,
  sectionItemDescriptionTextDisplayClassName,
  sectionItemDescriptionInputClassName,
}) => {
  return (
    <div className={className}>
      {sections.map((section) => (
        <Section
          key={section.id}
          id={section.id}
          title={section.title}
          description={section.description}
          weight={section.weight}
          items={section.items}
          isEditing={isEditing}
          selectedItemId={selectedItemId}
          onItemSelect={onItemSelect} // Passa o handler onItemSelect para Section
          onTitleChange={(newTitle: string) => onSectionTitleChange(section.id, newTitle)}
          onDescriptionChange={(newDescription: string) => onSectionDescriptionChange(section.id, newDescription)}
          onWeightChange={(newWeight: string) => onSectionWeightChange(section.id, newWeight)}
          onItemChange={onItemChange}
          onSectionAreaClick={onSectionAreaClick} // Passa o handler onSectionAreaClick para Section
          isSectionSelectedForStyling={section.id === selectedSectionIdForStyling}

          onFieldFocus={onFieldFocus} // Passa handler de foco do pai
          onFieldBlur={onFieldBlur}   // Passa handler de blur do pai

          className={sectionComponentClassName}
          contentWrapperClassName={sectionComponentContentWrapperClassName}
          selectedSectionStylingClassName={sectionComponentSelectedStylingClassName}

          titleAndWeightContainerClassName={sectionComponentTitleAndWeightContainerClassName}
          titleContainerClassName={sectionComponentTitleContainerClassName}
          titleEditableFieldClassName={sectionComponentTitleEditableFieldClassName}
          titleTextClassName={sectionComponentTitleTextClassName}
          titleInputClassName={sectionComponentTitleInputClassName}

          // Passa as classes da descrição da seção para Section
          descriptionContainerClassName={sectionComponentDescriptionContainerClassName}
          descriptionEditableFieldClassName={sectionComponentDescriptionEditableFieldClassName}
          descriptionTextClassName={sectionComponentDescriptionTextClassName}
          descriptionTextareaClassName={sectionComponentDescriptionTextareaClassName}

          weightFieldContainerClassName={sectionComponentWeightFieldContainerClassName}
          weightEditableFieldClassName={sectionComponentWeightEditableFieldClassName}
          weightTextClassName={sectionComponentWeightTextClassName}
          weightInputClassName={sectionComponentWeightInputClassName}

          itemsListClassName={sectionComponentItemsListClassName}

          // CORRIGIDO: Passa as classes para SectionItem com os nomes corretos esperados por SectionProps
          // Section espera descriptionFieldContainerClassName, etc., não sectionItem...
          sectionItemClassName={sectionItemClassName}
          sectionItemSelectedClassName={sectionItemSelectedClassName}
          descriptionFieldContainerClassName={sectionItemDescriptionFieldContainerClassName}
          descriptionTextDisplayClassName={sectionItemDescriptionTextDisplayClassName}
          descriptionInputClassName={sectionItemDescriptionInputClassName}
          // Note: value field classes are not passed as showValueField is false in SectionItem
        />
      ))}
    </div>
  );
};

export default SectionList;