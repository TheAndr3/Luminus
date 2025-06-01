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
  onSectionDescriptionChange: (sectionId: string, newDescription: string) => void; // NOVO: Handler para descrição da seção
  onSectionWeightChange: (sectionId: string, newWeight: string) => void;
  onItemChange: (sectionId: string, itemId: string, field: 'description' | 'value', newValue: string) => void;
  onItemSelect: (itemId: string | null) => void; 

  // Handlers de foco/blur passados do pai (page.tsx)
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

  // Novas classes para a descrição da seção (passadas para Section)
  sectionComponentDescriptionContainerClassName?: string;
  sectionComponentDescriptionEditableFieldClassName?: string;
  sectionComponentDescriptionTextClassName?: string;
  sectionComponentDescriptionTextareaClassName?: string;
  
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
  onSectionDescriptionChange, // NOVO: Recebe handler
  onSectionWeightChange,
  onItemChange,
  onItemSelect,
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
  // Novas classes de descrição da seção com defaults
  sectionComponentDescriptionContainerClassName = '',
  sectionComponentDescriptionEditableFieldClassName = '',
  sectionComponentDescriptionTextClassName = '',
  sectionComponentDescriptionTextareaClassName = '',
  sectionComponentWeightFieldContainerClassName,
  sectionComponentWeightEditableFieldClassName,
  sectionComponentWeightTextClassName,
  sectionComponentWeightInputClassName,
  sectionComponentItemsListClassName,
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
          description={section.description} // NOVO: Passa a descrição
          weight={section.weight}
          items={section.items}
          isEditing={isEditing}
          selectedItemId={selectedItemId}
          onItemSelect={onItemSelect} 
          onTitleChange={(newTitle: string) => onSectionTitleChange(section.id, newTitle)}
          onDescriptionChange={(newDescription: string) => onSectionDescriptionChange(section.id, newDescription)} // NOVO: Passa handler (envelopado)
          onWeightChange={(newWeight: string) => onSectionWeightChange(section.id, newWeight)}
          onItemChange={onItemChange}
          onSectionAreaClick={() => onSectionAreaClick(section.id)}
          isSectionSelectedForStyling={section.id === selectedSectionIdForStyling}

          onFieldFocus={onFieldFocus} 
          onFieldBlur={onFieldBlur}   
          
          className={sectionComponentClassName}
          contentWrapperClassName={sectionComponentContentWrapperClassName}
          selectedSectionStylingClassName={sectionComponentSelectedStylingClassName}
          
          titleAndWeightContainerClassName={sectionComponentTitleAndWeightContainerClassName}
          titleContainerClassName={sectionComponentTitleContainerClassName}
          titleEditableFieldClassName={sectionComponentTitleEditableFieldClassName}
          titleTextClassName={sectionComponentTitleTextClassName}
          titleInputClassName={sectionComponentTitleInputClassName}

          // NOVO: Passa as classes da descrição
          descriptionContainerClassName={sectionComponentDescriptionContainerClassName}
          descriptionEditableFieldClassName={sectionComponentDescriptionEditableFieldClassName}
          descriptionTextClassName={sectionComponentDescriptionTextClassName}
          descriptionTextareaClassName={sectionComponentDescriptionTextareaClassName}

          weightFieldContainerClassName={sectionComponentWeightFieldContainerClassName}
          weightEditableFieldClassName={sectionComponentWeightEditableFieldClassName}
          weightTextClassName={sectionComponentWeightTextClassName}
          weightInputClassName={sectionComponentWeightInputClassName}
          
          itemsListClassName={sectionComponentItemsListClassName}

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