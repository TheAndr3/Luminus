// components/SectionItem.tsx
import React from 'react';
import EditableField from './EditableField';

interface SectionItemProps {
  id: string;
  description: string;
  value: string | number; 
  isEditing: boolean;
  isSelected: boolean; 
  onSelect: () => void; 
  onDescriptionChange: (newDescription: string) => void;
  onValueChange: (newValue: string) => void; 

  onFieldFocus?: (element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => void;
  onFieldBlur?: () => void;

  showValueField?: boolean; 

  className?: string;
  selectedClassName?: string;
  descriptionFieldContainerClassName?: string;
  descriptionTextDisplayClassName?: string;
  descriptionInputClassName?: string;
  descriptionPlaceholder?: string;

  valueFieldContainerClassName?: string;
  valueTextDisplayClassName?: string;
  valueInputClassName?: string;
  valuePlaceholder?: string;
}

const SectionItem: React.FC<SectionItemProps> = ({
  id,
  description,
  value,
  isEditing,
  isSelected,
  onSelect, 
  onDescriptionChange,
  onValueChange, 
  onFieldFocus, 
  onFieldBlur,  
  showValueField = false, 
  className = '',
  selectedClassName = '',
  descriptionFieldContainerClassName = '',
  descriptionTextDisplayClassName = '',
  descriptionInputClassName = '',
  descriptionPlaceholder = 'Descrição do item',
  valueFieldContainerClassName = '', 
  valueTextDisplayClassName = '',   
  valueInputClassName = '',         
  valuePlaceholder = 'Valor',      
}) => {
  const itemClasses = [
    className,
    isSelected ? selectedClassName : '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  const stringValue = String(value);

  const handleItemClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing) {
        const targetTagName = (event.target as HTMLElement).tagName.toLowerCase();
        const isClickOnEditableField = targetTagName === 'input' || targetTagName === 'textarea' || (targetTagName === 'span' && (event.target as HTMLElement).classList.contains('editableField_textDisplay'));

        if (!isClickOnEditableField) {
           onSelect(); 
        }
    }
  };

  const handleItemFieldFocus = (element: HTMLElement) => {
      if (onFieldFocus) {
          onFieldFocus(element, { type: 'item', id: id }); 
      }
  };


  return (
    <div
      id={`dossier-item-${id}`} 
      className={itemClasses}
      onClick={handleItemClick} 
      aria-current={isSelected ? 'true' : undefined}
      style={{ display: 'flex', alignItems: 'center', width: '100%' }}
    >
      <div className={descriptionFieldContainerClassName} style={{ flexGrow: 1, width: '100%' }}>
        <EditableField
          value={description}
          isEditing={isEditing}
          onChange={onDescriptionChange} 
          placeholder={descriptionPlaceholder}
          ariaLabel={`Descrição para o item ${id}`}
          textDisplayClassName={descriptionTextDisplayClassName}
          inputClassName={descriptionInputClassName}
          onFocus={handleItemFieldFocus} 
          onBlur={onFieldBlur}   
        />
      </div>

      {showValueField && (
        <div
          className={valueFieldContainerClassName}
          style={{ minWidth: '80px', textAlign: 'right', marginLeft: '15px', flexShrink: 0 }}
        >
          <EditableField
            value={stringValue}
            isEditing={isEditing}
            onChange={onValueChange} 
            placeholder={valuePlaceholder}
            ariaLabel={`Valor para o item ${id}`}
            textDisplayClassName={valueTextDisplayClassName}
            inputClassName={valueInputClassName}
             onFocus={handleItemFieldFocus} 
             onBlur={onFieldBlur}   
          />
        </div>
      )}
    </div>
  );
};

export default SectionItem;