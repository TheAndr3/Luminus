// components/SectionList.tsx
import React from 'react';
import Section from './Section';
import { SectionData } from '../../types/dossier'; // Ajuste o caminho se necessário

interface SectionListProps {
  sections: SectionData[];
  isEditing: boolean;
  selectedSectionIdForStyling: string | null;
  selectedItemId: string | null;

  onSectionAreaClick: (sectionId: string) => void;
  onSectionTitleChange: (sectionId: string, newTitle: string) => void;
  onSectionWeightChange: (sectionId: string, newWeight: string) => void;
  onItemChange: (sectionId: string, itemId: string, field: 'description' | 'value', newValue: string) => void;
  onItemSelect: (itemId: string | null) => void;

  className?: string;
  sectionComponentClassName?: string;
  sectionComponentContentWrapperClassName?: string;
  sectionComponentSelectedStylingClassName?: string;
  
  sectionComponentTitleAndWeightContainerClassName?: string;
  sectionComponentTitleContainerClassName?: string;
  sectionComponentTitleEditableFieldClassName?: string;
  sectionComponentTitleTextClassName?: string;
  sectionComponentTitleInputClassName?: string;
  
  sectionComponentWeightFieldContainerClassName?: string;
  sectionComponentWeightEditableFieldClassName?: string;
  sectionComponentWeightTextClassName?: string;
  sectionComponentWeightInputClassName?: string;
  
  sectionComponentItemsListClassName?: string;

  // Props para SectionItem (prefixadas com sectionItem)
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
  onSectionAreaClick,
  onSectionTitleChange,
  onSectionWeightChange,
  onItemChange,
  onItemSelect,
  className = '',
  sectionComponentClassName,
  sectionComponentContentWrapperClassName,
  sectionComponentSelectedStylingClassName,
  sectionComponentTitleAndWeightContainerClassName,
  sectionComponentTitleContainerClassName,
  sectionComponentTitleEditableFieldClassName,
  sectionComponentTitleTextClassName,
  sectionComponentTitleInputClassName,
  sectionComponentWeightFieldContainerClassName,
  sectionComponentWeightEditableFieldClassName,
  sectionComponentWeightTextClassName,
  sectionComponentWeightInputClassName,
  sectionComponentItemsListClassName,
  // Props para SectionItem recebidas aqui
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
          weight={section.weight}
          items={section.items}
          isEditing={isEditing}
          selectedItemId={selectedItemId}
          onItemSelect={onItemSelect}
          onTitleChange={(newTitle: string) => onSectionTitleChange(section.id, newTitle)}
          onWeightChange={(newWeight: string) => onSectionWeightChange(section.id, newWeight)}
          onItemChange={onItemChange}
          onSectionAreaClick={() => onSectionAreaClick(section.id)}
          isSectionSelectedForStyling={section.id === selectedSectionIdForStyling}
          
          className={sectionComponentClassName}
          contentWrapperClassName={sectionComponentContentWrapperClassName}
          selectedSectionStylingClassName={sectionComponentSelectedStylingClassName}
          
          titleAndWeightContainerClassName={sectionComponentTitleAndWeightContainerClassName}
          titleContainerClassName={sectionComponentTitleContainerClassName}
          titleEditableFieldClassName={sectionComponentTitleEditableFieldClassName}
          titleTextClassName={sectionComponentTitleTextClassName}
          titleInputClassName={sectionComponentTitleInputClassName}

          weightFieldContainerClassName={sectionComponentWeightFieldContainerClassName}
          weightEditableFieldClassName={sectionComponentWeightEditableFieldClassName}
          weightTextClassName={sectionComponentWeightTextClassName}
          weightInputClassName={sectionComponentWeightInputClassName}
          
          itemsListClassName={sectionComponentItemsListClassName}

          // CORREÇÃO AQUI: Passando as props para Section com os nomes que SectionProps espera
          sectionItemClassName={sectionItemClassName}
          sectionItemSelectedClassName={sectionItemSelectedClassName}
          sectionItemDescriptionFieldContainerClassName={sectionItemDescriptionFieldContainerClassName}
          sectionItemDescriptionTextDisplayClassName={sectionItemDescriptionTextDisplayClassName}
          sectionItemDescriptionInputClassName={sectionItemDescriptionInputClassName}
        />
      ))}
    </div>
  );
};

export default SectionList;