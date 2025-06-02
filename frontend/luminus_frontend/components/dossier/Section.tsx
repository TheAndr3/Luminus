// components/Section.tsx
import React, { useRef, useCallback } from 'react';
import EditableField from './EditableField';
import SectionItem from './SectionItem';
import { ItemData } from '../../types/dossier'; 

interface SectionProps {
  id: string;
  title: string;
  description: string;
  weight: string; 
  items: ItemData[];
  isEditing: boolean;
  selectedItemId: string | null; 
  isSectionSelectedForStyling: boolean; 

  onItemSelect: (itemId: string) => void; 
  onSectionAreaClick?: (sectionId: string) => void; 

  onTitleChange: (newTitle: string) => void;
  onDescriptionChange: (newDescription: string) => void;
  onWeightChange: (newWeight: string) => void; 
  onItemChange: (sectionId: string, itemId: string, field: 'description' | 'value', newValue: string) => void;

  onFieldFocus?: (element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => void;
  onFieldBlur?: () => void;

  className?: string;
  contentWrapperClassName?: string;
  selectedSectionStylingClassName?: string;

  titleAndWeightContainerClassName?: string;
  titleContainerClassName?: string;
  titleEditableFieldClassName?: string;
  titleTextClassName?: string;
  titleInputClassName?: string;
  titlePlaceholder?: string;

  descriptionContainerClassName?: string;
  descriptionEditableFieldClassName?: string;
  descriptionTextClassName?: string;
  descriptionTextareaClassName?: string;
  descriptionPlaceholder?: string;

  weightFieldContainerClassName?: string;
  weightEditableFieldClassName?: string;
  weightTextClassName?: string;
  weightInputClassName?: string;
  weightPlaceholder?: string;

  itemsListClassName?: string;
  sectionItemClassName?: string;
  sectionItemSelectedClassName?: string;
  descriptionFieldContainerClassName?: string;
  descriptionTextDisplayClassName?: string;
  descriptionInputClassName?: string;
}

const Section: React.FC<SectionProps> = ({
  id: sectionId,
  title,
  description,
  weight,
  items,
  isEditing,
  selectedItemId,
  isSectionSelectedForStyling,
  onItemSelect,
  onSectionAreaClick, 
  onTitleChange,
  onDescriptionChange,
  onWeightChange,
  onItemChange,
  onFieldFocus,
  onFieldBlur,
  className = '',
  contentWrapperClassName = '',
  selectedSectionStylingClassName = '',
  titleAndWeightContainerClassName = '',
  titleContainerClassName = '',
  titleEditableFieldClassName = '',
  titleTextClassName = '',
  titleInputClassName = '',
  titlePlaceholder = 'Título da Seção',
  descriptionContainerClassName = '',
  descriptionEditableFieldClassName = '',
  descriptionTextClassName = '',
  descriptionTextareaClassName = '',
  descriptionPlaceholder = 'Descrição da seção',
  weightFieldContainerClassName = '',
  weightEditableFieldClassName = '',
  weightTextClassName = '',
  weightInputClassName = '',
  weightPlaceholder = 'Peso %',
  itemsListClassName = '',
  sectionItemClassName = '',
  sectionItemSelectedClassName = '',
  descriptionFieldContainerClassName,
  descriptionTextDisplayClassName,
  descriptionInputClassName,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleLocalItemSelect = useCallback((itemId: string) => {
    if (isEditing) {
      onItemSelect(itemId);
    }
  }, [isEditing, onItemSelect]);

  const handleSectionClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing || !onSectionAreaClick) return; 

    const targetElement = event.target as HTMLElement;

    const isClickOnSectionArea = (targetElement === sectionRef.current ||
                                  targetElement.classList.contains(contentWrapperClassName) ||
                                  targetElement.classList.contains(titleAndWeightContainerClassName) ||
                                  targetElement.classList.contains(descriptionContainerClassName) ||
                                  targetElement.classList.contains(itemsListClassName)) &&
                                  !targetElement.closest('input, textarea, span[class*="editableField_textDisplay"]') &&
                                  !targetElement.closest(`[id^="dossier-item-"]`);


    if (isClickOnSectionArea) {
        onSectionAreaClick(sectionId); 
    }
  }, [isEditing, onSectionAreaClick, sectionId, contentWrapperClassName, titleAndWeightContainerClassName, descriptionContainerClassName, itemsListClassName]);


  const handleSectionFieldFocus = useCallback((element: HTMLElement) => {
    if (onFieldFocus) {
        onFieldFocus(element, { type: 'section', id: sectionId });
    }
  }, [onFieldFocus, sectionId]);

  const handleWeightInputChange = useCallback((newValue: string) => {
    const numericValue = newValue.replace(/\D/g, ''); 
    onWeightChange(numericValue);
  }, [onWeightChange]);

  const combinedSectionClasses = [
    className,
    isSectionSelectedForStyling ? selectedSectionStylingClassName : ''
  ].filter(Boolean).join(' ');

  const displayWeight = weight === '' ? '' : `${weight}%`;


  return (
    <div
        ref={sectionRef} 
        id={`dossier-section-${sectionId}`}
        className={combinedSectionClasses}
        onClick={handleSectionClick} 
        style={{ position: 'relative' }} 
    >
      <div className={contentWrapperClassName}>

        <div className={`${titleAndWeightContainerClassName}`}>
          <div className={titleContainerClassName} style={{ flexGrow: 1 }}>
            <EditableField
              value={title}
              isEditing={isEditing}
              onChange={onTitleChange}
              placeholder={titlePlaceholder}
              ariaLabel={`Título da seção ${sectionId}`}
              className={titleEditableFieldClassName}
              textDisplayClassName={titleTextClassName}
              inputClassName={titleInputClassName}
              onFocus={handleSectionFieldFocus} 
              onBlur={onFieldBlur} 
            />
          </div>
          {isEditing ? (
            <div className={weightFieldContainerClassName}>
              <EditableField
                value={weight} 
                isEditing={true}
                onChange={handleWeightInputChange} 
                placeholder={weightPlaceholder}
                ariaLabel={`Peso da seção ${sectionId}`}
                className={weightEditableFieldClassName}
                inputClassName={weightInputClassName}
                onFocus={handleSectionFieldFocus} 
                onBlur={onFieldBlur} 
              />
            </div>
          ) : (
            displayWeight && <div className={weightTextClassName}>{displayWeight}</div>
          )}
        </div>

         <div className={descriptionContainerClassName}>
             <EditableField
                value={description}
                isEditing={isEditing}
                onChange={onDescriptionChange}
                placeholder={descriptionPlaceholder}
                ariaLabel={`Descrição da seção ${sectionId}`}
                multiline={true}
                className={descriptionEditableFieldClassName}
                textDisplayClassName={descriptionTextClassName}
                textareaClassName={descriptionTextareaClassName}
                onFocus={handleSectionFieldFocus} 
                onBlur={onFieldBlur} 
             />
         </div>


        <div className={itemsListClassName}>
          {items.map((item) => {
            const isItemSelected = item.id === selectedItemId;
            return (
              <SectionItem
                key={item.id}
                id={item.id}
                description={item.description}
                value={item.value} 
                isEditing={isEditing}
                isSelected={isItemSelected}
                onSelect={() => handleLocalItemSelect(item.id)} 
                onDescriptionChange={(newDesc) => onItemChange(sectionId, item.id, 'description', newDesc)}
                onValueChange={(newVal) => onItemChange(sectionId, item.id, 'value', newVal)} 
                onFieldFocus={onFieldFocus} 
                onFieldBlur={onFieldBlur}   
                showValueField={false} 
                className={sectionItemClassName}
                selectedClassName={sectionItemSelectedClassName}
                descriptionFieldContainerClassName={descriptionFieldContainerClassName}
                descriptionTextDisplayClassName={descriptionTextDisplayClassName}
                descriptionInputClassName={descriptionInputClassName}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Section;