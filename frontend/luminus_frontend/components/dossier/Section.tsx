// components/Section.tsx
import React, { useRef } from 'react';
import EditableField from './EditableField';
import SectionItem from './SectionItem';
import { ItemData } from '../../types/dossier'; // Ajuste o caminho se necessário

interface SectionProps {
  id: string;
  title: string;
  description: string; // NOVO: Descrição da seção
  weight: string; 
  items: ItemData[];
  isEditing: boolean;
  selectedItemId: string | null;

  onItemSelect: (itemId: string | null) => void;
  onTitleChange: (newTitle: string) => void;
  onDescriptionChange: (newDescription: string) => void; // NOVO: Handler para mudança na descrição
  onWeightChange: (newWeight: string) => void; 
  onItemChange: (sectionId: string, itemId: string, field: 'description' | 'value', newValue: string) => void;
  onSectionAreaClick?: (sectionId: string) => void;

  // Handlers de foco/blur passados para SectionItem e EditableFields internos
  onFieldFocus?: (element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => void;
  onFieldBlur?: () => void;

  className?: string;
  contentWrapperClassName?: string;
  isSectionSelectedForStyling: boolean;
  selectedSectionStylingClassName?: string;

  titleAndWeightContainerClassName?: string; 
  titleContainerClassName?: string; 
  titleEditableFieldClassName?: string;
  titleTextClassName?: string;
  titleInputClassName?: string;
  titlePlaceholder?: string;

  // Novas classes para a descrição da seção
  descriptionContainerClassName?: string; // NOVO: Container para o EditableField da descrição
  descriptionEditableFieldClassName?: string; // NOVO: Classe base para o EditableField da descrição
  descriptionTextClassName?: string; // NOVO: Classe para o texto da descrição (modo visualização)
  descriptionTextareaClassName?: string; // NOVO: Classe para o textarea da descrição (modo edição)
  descriptionPlaceholder?: string; // NOVO: Placeholder para a descrição

  weightFieldContainerClassName?: string; 
  weightEditableFieldClassName?: string;  
  weightTextClassName?: string;           
  weightInputClassName?: string;          
  weightPlaceholder?: string;             

  itemsListClassName?: string;
  sectionItemClassName?: string;
  sectionItemSelectedClassName?: string;
  // As classes para os campos internos do SectionItem usam nomes específicos da SectionItemProps
  sectionItemDescriptionFieldContainerClassName?: string;
  sectionItemDescriptionTextDisplayClassName?: string;
  sectionItemDescriptionInputClassName?: string;
  // Props de valor do SectionItem podem ser omitidas aqui se showValueField for sempre false
}

const Section: React.FC<SectionProps> = ({
  id: sectionId,
  title,
  description, // NOVO: Recebe a descrição
  weight, 
  items,
  isEditing,
  selectedItemId,
  onItemSelect,
  onTitleChange,
  onDescriptionChange, // NOVO: Recebe o handler de mudança na descrição
  onWeightChange, 
  onItemChange,
  onSectionAreaClick,
  onFieldFocus, 
  onFieldBlur,  
  className = '',
  contentWrapperClassName = '',
  isSectionSelectedForStyling,
  selectedSectionStylingClassName = '',
  titleAndWeightContainerClassName = '', 
  titleContainerClassName = '', 
  titleEditableFieldClassName = '',
  titleTextClassName = '',
  titleInputClassName = '',
  titlePlaceholder = 'Título da Seção',
  // Novas classes de descrição da seção com defaults
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
  sectionItemDescriptionFieldContainerClassName,
  sectionItemDescriptionTextDisplayClassName,
  sectionItemDescriptionInputClassName,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleLocalItemSelect = (itemId: string) => {
    if (isEditing) { 
      onItemSelect(itemId); 
    }
  };

   // Atualiza o handler para incluir o clique na descrição da seção como "área da seção"
  const handleSectionClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const targetElement = event.target as HTMLElement;

    // Verifica se o clique foi *diretamente* na div externa da seção ou em um de seus containers internos
    // (mas não em um item ou EditableField dentro dele)
    const isInputOrTextarea = targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA';
    const clickedOnItemContainer = targetElement.closest(`[id^="dossier-item-"]`); // Verifica se clicou em um item
    const clickedOnEditableDisplay = targetElement.classList.contains('editableField_textDisplay'); // Verifica clique no texto em modo visualização

    // Verifica se o clique foi na div da seção, no content wrapper, no container de título/peso,
    // no container da descrição, na lista de items, E não foi dentro de um item ou EditableField.
    const isClickOnSectionArea = (targetElement === sectionRef.current ||
                                  targetElement.classList.contains(contentWrapperClassName) ||
                                  targetElement.classList.contains(titleAndWeightContainerClassName) ||
                                  targetElement.classList.contains(descriptionContainerClassName) || // NOVO: inclui o container da descrição
                                  targetElement.classList.contains(itemsListClassName)) &&
                                  !isInputOrTextarea &&
                                  !clickedOnItemContainer &&
                                  !clickedOnEditableDisplay &&
                                  !targetElement.closest(`.${titleEditableFieldClassName.split(' ')[0]}`) && // Evita cliques em EditableFields de título/peso
                                   !targetElement.closest(`.${weightEditableFieldClassName.split(' ')[0]}`) && // Evita cliques em EditableFields de título/peso
                                   !targetElement.closest(`.${descriptionEditableFieldClassName.split(' ')[0]}`); // NOVO: evita cliques em EditableField de descrição


    if (isClickOnSectionArea && onSectionAreaClick && isEditing) {
        onSectionAreaClick(sectionId);
    }
  };


  // Handler para foco em um EditableField dentro da seção (título/peso/descrição)
  // Reusa o mesmo handler e contexto 'section'
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
    <div ref={sectionRef} id={`dossier-section-${sectionId}`} className={combinedSectionClasses} onClick={handleSectionClick} style={{ position: 'relative' }}>
      <div className={contentWrapperClassName}>

        {/* Título e Peso - Primeira linha */}
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
                onChange={onWeightChange}
                placeholder={weightPlaceholder}
                ariaLabel={`Peso da seção ${sectionId}`}
                className={weightEditableFieldClassName}
                inputClassName={weightInputClassName}
                onFocus={handleSectionFieldFocus} 
                onBlur={onFieldBlur} 
              />
            </div>
          ) : (
            weight && <div className={weightTextClassName}>{weight}</div>
          )}
        </div>

        {/* Descrição da Seção - Segunda linha */}
         <div className={descriptionContainerClassName}> {/* NOVO: Container para a descrição */}
             <EditableField
                value={description}
                isEditing={isEditing}
                onChange={onDescriptionChange} // NOVO: Handler para a descrição
                placeholder={descriptionPlaceholder}
                ariaLabel={`Descrição da seção ${sectionId}`}
                multiline={true} // NOVO: Campo de múltiplas linhas
                className={descriptionEditableFieldClassName} // NOVO: Classe base para o EditableField da descrição
                textDisplayClassName={descriptionTextClassName} // NOVO: Classe para o texto visualização
                textareaClassName={descriptionTextareaClassName} // NOVO: Classe para o textarea edição
                onFocus={handleSectionFieldFocus} // Passa handler de foco (identificado como section)
                onBlur={onFieldBlur} // Repassa handler de blur
             />
         </div>


        {/* Lista de Itens */}
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
                descriptionFieldContainerClassName={sectionItemDescriptionFieldContainerClassName}
                // CORRIGIDO: Usar os nomes corretos das props da SectionItemProps
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