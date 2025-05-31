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

  // Novos handlers de foco/blur passados para SectionItem e EditableFields internos
  onFieldFocus?: (element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => void;
  onFieldBlur?: () => void;

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
  onFieldFocus, // Recebe handler
  onFieldBlur,  // Recebe handler
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
      onItemSelect(itemId); // Chama o handler pai para selecionar/desselecionar
    }
  };

  const handleSectionClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const targetElement = event.target as HTMLElement;

    // Verifica se o clique foi *diretamente* na div externa da seção ou em um de seus containers internos
    // (mas não em um item ou EditableField dentro dele)
    const isInputOrTextarea = targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA';
    const clickedOnItemContainer = targetElement.closest(`[id^="dossier-item-"]`); // Verifica se clicou em um item
    const clickedOnEditableDisplay = targetElement.classList.contains('editableField_textDisplay'); // Verifica clique no texto em modo visualização

    // Verifica se o clique foi na div da seção, no content wrapper, no container de título/peso,
    // na lista de items, E não foi dentro de um item ou EditableField.
    const isClickOnSectionArea = (targetElement === sectionRef.current ||
                                  targetElement.classList.contains(contentWrapperClassName) ||
                                  targetElement.classList.contains(titleAndWeightContainerClassName) ||
                                  targetElement.classList.contains(itemsListClassName)) &&
                                  !isInputOrTextarea &&
                                  !clickedOnItemContainer &&
                                  !clickedOnEditableDisplay &&
                                  !targetElement.closest(`.${titleEditableFieldClassName.split(' ')[0]}`) && // Evita cliques em EditableFields de título/peso
                                   !targetElement.closest(`.${weightEditableFieldClassName.split(' ')[0]}`);


    if (isClickOnSectionArea && onSectionAreaClick && isEditing) {
        onSectionAreaClick(sectionId);
    }
  };

  // Handler para foco em um EditableField dentro da seção (título/peso)
  const handleSectionFieldFocus = (element: HTMLElement) => {
    if (onFieldFocus) {
        onFieldFocus(element, { type: 'section', id: sectionId });
    }
  };

  const combinedSectionClasses = [
    className,
    isSectionSelectedForStyling ? selectedSectionStylingClassName : ''
  ].filter(Boolean).join(' ');

  return (
    // Adiciona ID na div externa da seção para permitir o posicionamento da sidebar ao clicar na área
    <div ref={sectionRef} id={`dossier-section-${sectionId}`} className={combinedSectionClasses} onClick={handleSectionClick} style={{ position: 'relative' }}>
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
              onFocus={handleSectionFieldFocus} // Passa handler de foco para o EditableField do título
              onBlur={onFieldBlur} // Repassa handler de blur
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
                onFocus={handleSectionFieldFocus} // Passa handler de foco para o EditableField do peso
                onBlur={onFieldBlur} // Repassa handler de blur
              />
            </div>
          ) : (
            // Renderiza o peso apenas se não estiver vazio no modo visualização
            weight && <div className={weightTextClassName}>{weight}</div>
          )}
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
                onSelect={() => handleLocalItemSelect(item.id)} // Handler para clique na área do item
                onDescriptionChange={(newDesc) => onItemChange(sectionId, item.id, 'description', newDesc)}
                onValueChange={(newVal) => onItemChange(sectionId, item.id, 'value', newVal)}
                onFieldFocus={onFieldFocus} // Repassa handler de foco para SectionItem
                onFieldBlur={onFieldBlur}   // Repassa handler de blur para SectionItem
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