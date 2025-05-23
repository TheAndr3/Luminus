// components/Section.tsx
import React, { useRef } from 'react';
import EditableField from './EditableField';
import SectionItem from './SectionItem';
import { ItemData } from '../../types/dossier'; // Ajuste o caminho se necessário

interface SectionProps {
  id: string;
  title: string;
  weight: string; // NOVO
  items: ItemData[];
  isEditing: boolean;
  selectedItemId: string | null;

  onItemSelect: (itemId: string | null) => void;
  onTitleChange: (newTitle: string) => void;
  onWeightChange: (newWeight: string) => void; // NOVO
  onItemChange: (sectionId: string, itemId: string, field: 'description' | 'value', newValue: string) => void;
  onSectionAreaClick?: (sectionId: string) => void;

  className?: string;
  contentWrapperClassName?: string;
  isSectionSelectedForStyling: boolean;
  selectedSectionStylingClassName?: string;

  titleAndWeightContainerClassName?: string; // NOVO
  titleContainerClassName?: string; // Mantido para o EditableField do título em si
  titleEditableFieldClassName?: string;
  titleTextClassName?: string;
  titleInputClassName?: string;
  titlePlaceholder?: string;

  weightFieldContainerClassName?: string; // NOVO
  weightEditableFieldClassName?: string;  // NOVO
  weightTextClassName?: string;           // NOVO
  weightInputClassName?: string;          // NOVO
  weightPlaceholder?: string;             // NOVO

  itemsListClassName?: string;
  sectionItemClassName?: string;
  sectionItemSelectedClassName?: string;
  sectionItemDescriptionFieldContainerClassName?: string;
  sectionItemDescriptionTextDisplayClassName?: string;
  sectionItemDescriptionInputClassName?: string;
  // Props de valor do SectionItem podem ser omitidas aqui se showValueField for sempre false
}

const Section: React.FC<SectionProps> = ({
  id: sectionId,
  title,
  weight, // NOVO
  items,
  isEditing,
  selectedItemId,
  onItemSelect,
  onTitleChange,
  onWeightChange, // NOVO
  onItemChange,
  onSectionAreaClick,
  className = '',
  contentWrapperClassName = '',
  isSectionSelectedForStyling,
  selectedSectionStylingClassName = '',
  titleAndWeightContainerClassName = '', // NOVO
  titleContainerClassName = '', // Mantido
  titleEditableFieldClassName = '',
  titleTextClassName = '',
  titleInputClassName = '',
  titlePlaceholder = 'Título da Seção',
  weightFieldContainerClassName = '', // NOVO
  weightEditableFieldClassName = '',  // NOVO
  weightTextClassName = '',           // NOVO
  weightInputClassName = '',          // NOVO
  weightPlaceholder = 'Peso %',      // NOVO
  itemsListClassName = '',
  sectionItemClassName = '',
  sectionItemSelectedClassName = '',
  sectionItemDescriptionFieldContainerClassName,
  sectionItemDescriptionTextDisplayClassName,
  sectionItemDescriptionInputClassName,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleLocalItemSelect = (itemId: string) => {
    if (isEditing) { // A seleção de item só faz sentido no modo de edição
      if (selectedItemId === itemId) {
        onItemSelect(null); // Desselecionar se já selecionado
      } else {
        onItemSelect(itemId);
      }
    }
  };

  const handleSectionClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const targetElement = event.target as HTMLElement;

    // Verifica se o clique foi dentro de um input, textarea, ou em um SectionItem diretamente
    const isInput = targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA';
    const clickedOnItemContainer = targetElement.closest(`[id^="dossier-item-"]`); // Verifica se clicou em um item

    if (!isInput && !clickedOnItemContainer && onSectionAreaClick && isEditing) {
        onSectionAreaClick(sectionId);
    }
  };


  const combinedSectionClasses = [
    className,
    isSectionSelectedForStyling ? selectedSectionStylingClassName : ''
  ].filter(Boolean).join(' ');

  return (
    <div ref={sectionRef} className={combinedSectionClasses} onClick={handleSectionClick} style={{ position: 'relative' }}>
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
            />
          </div>
          {isEditing ? (
            <div className={weightFieldContainerClassName}>
              <EditableField
                value={weight}
                isEditing={true} // Sempre editável quando o container pai (isEditing) está ativo
                onChange={onWeightChange}
                placeholder={weightPlaceholder}
                ariaLabel={`Peso da seção ${sectionId}`}
                className={weightEditableFieldClassName}
                inputClassName={weightInputClassName}
              />
            </div>
          ) : (
            weight && <div className={weightTextClassName}>{weight}</div>
          )}
        </div>

        <div className={itemsListClassName}>
          {items.map((item) => {
            const isItemSelected = item.id === selectedItemId;
            return (
              // O div wrapper foi removido, key agora está no SectionItem
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
                showValueField={false} // Explicitamente não mostrar o campo de valor por agora
                className={sectionItemClassName}
                selectedClassName={sectionItemSelectedClassName}
                descriptionFieldContainerClassName={sectionItemDescriptionFieldContainerClassName}
                descriptionTextDisplayClassName={sectionItemDescriptionTextDisplayClassName}
                descriptionInputClassName={sectionItemDescriptionInputClassName}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Section;