// components/SectionList.tsx
import React from 'react';
import Section from './Section';
import { SectionData } from '../../types/dossier'; 

interface SectionListProps {
  sections: SectionData[];
  isEditing: boolean;
  selectedSectionIdForStyling: string | null; 
  selectedItemId: string | null; 

  onSectionAreaClick: (sectionId: string) => void; 
  onItemSelect: (itemId: string) => void; 

  onSectionTitleChange: (sectionId: string, newTitle: string) => void;
  onSectionDescriptionChange: (sectionId: string, newDescription: string) => void;
  onSectionWeightChange: (sectionId: string, newWeight: string) => void;
  onItemChange: (sectionId: string, itemId: string, field: 'description' | 'value', newValue: string) => void;

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

  sectionComponentDescriptionContainerClassName?: string;
  sectionComponentDescriptionEditableFieldClassName?: string;
  sectionComponentDescriptionTextClassName?: string;
  sectionComponentDescriptionTextareaClassName?: string;

  sectionComponentWeightFieldContainerClassName?: string;
  sectionComponentWeightEditableFieldClassName?: string;
  sectionComponentWeightTextClassName?: string;
  sectionComponentWeightInputClassName?: string;

  sectionComponentItemsListClassName?: string;

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
  onItemSelect, 
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
          description={section.description}
          weight={section.weight}
          items={section.items}
          isEditing={isEditing}
          selectedItemId={selectedItemId}
          onItemSelect={onItemSelect} 
          onTitleChange={(newTitle: string) => onSectionTitleChange(section.id, newTitle)}
          onDescriptionChange={(newDescription: string) => onSectionDescriptionChange(section.id, newDescription)}
          onWeightChange={(newWeight: string) => onSectionWeightChange(section.id, newWeight)}
          onItemChange={onItemChange}
          onSectionAreaClick={onSectionAreaClick} 
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
          descriptionFieldContainerClassName={sectionItemDescriptionFieldContainerClassName}
          descriptionTextDisplayClassName={sectionItemDescriptionTextDisplayClassName}
          descriptionInputClassName={sectionItemDescriptionInputClassName}
        />
      ))}
    </div>
  );
};

export default SectionList;