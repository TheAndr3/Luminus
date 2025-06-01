// components/Section.tsx
import React, { useRef, useCallback } from 'react'; // Importar useCallback
import EditableField from './EditableField';
import SectionItem from './SectionItem';
import { ItemData } from '../../types/dossier'; // Ajuste o caminho se necessário

interface SectionProps {
  id: string;
  title: string;
  description: string; 
  weight: string; // Mantido como string para flexibilidade, mas esperamos um número ou string vazia
  items: ItemData[];
  isEditing: boolean;
  selectedItemId: string | null;

  onItemSelect: (itemId: string | null) => void;
  onTitleChange: (newTitle: string) => void;
  onDescriptionChange: (newDescription: string) => void; 
  onWeightChange: (newWeight: string) => void; // Espera string contendo apenas números ou vazia
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

  // Classes para a descrição da seção
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
  // Classes passadas para SectionItem (usando nomes que SectionItemProps espera)
  // CORRIGIDO: Estes nomes estão corretos aqui, pois Section recebe e repassa para SectionItem
  descriptionFieldContainerClassName?: string; 
  descriptionTextDisplayClassName?: string; 
  descriptionInputClassName?: string; 
  // Note: value field props are intentionally omitted as showValueField is false in SectionItem
}

const Section: React.FC<SectionProps> = ({
  id: sectionId,
  title,
  description, 
  weight, 
  items,
  isEditing,
  selectedItemId,
  onItemSelect,
  onTitleChange,
  onDescriptionChange, 
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
  // Classes de descrição da seção com defaults
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
  // Recebendo as classes para SectionItem com os nomes corretos que SectionProps espera
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

   // Atualiza o handler para incluir o clique na descrição da seção como "área da seção"
  const handleSectionClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => { 
    const targetElement = event.target as HTMLElement;

    const isInputOrTextarea = targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA';
    const clickedOnItemContainer = targetElement.closest(`[id^="dossier-item-"]`); 
    const clickedOnEditableDisplay = targetElement.classList.contains('editableField_textDisplay'); 

    const isClickOnSectionArea = (targetElement === sectionRef.current ||
                                  targetElement.classList.contains(contentWrapperClassName) ||
                                  targetElement.classList.contains(titleAndWeightContainerClassName) ||
                                  targetElement.classList.contains(descriptionContainerClassName) || 
                                  targetElement.classList.contains(itemsListClassName)) &&
                                  !isInputOrTextarea &&
                                  !clickedOnItemContainer &&
                                  !clickedOnEditableDisplay &&
                                  !targetElement.closest(`.${(titleEditableFieldClassName || '').split(' ')[0]}`) && 
                                  !targetElement.closest(`.${(weightEditableFieldClassName || '').split(' ')[0]}`) &&
                                  !targetElement.closest(`.${(descriptionEditableFieldClassName || '').split(' ')[0]}`); 


    if (isClickOnSectionArea && onSectionAreaClick && isEditing) {
        onSectionAreaClick(sectionId);
    }
  }, [isEditing, onSectionAreaClick, sectionId, contentWrapperClassName, titleAndWeightContainerClassName, descriptionContainerClassName, itemsListClassName, titleEditableFieldClassName, weightEditableFieldClassName, descriptionEditableFieldClassName]); 


  // Handler para foco em um EditableField dentro da seção (título/peso/descrição)
  const handleSectionFieldFocus = useCallback((element: HTMLElement) => {
    if (onFieldFocus) {
        onFieldFocus(element, { type: 'section', id: sectionId });
    }
  }, [onFieldFocus, sectionId]);

  // Handler local para filtrar a entrada do campo de peso
  const handleWeightInputChange = useCallback((newValue: string) => {
    const numericValue = newValue.replace(/\D/g, '');
    onWeightChange(numericValue);
  }, [onWeightChange]); 

  const combinedSectionClasses = [
    className,
    isSectionSelectedForStyling ? selectedSectionStylingClassName : ''
  ].filter(Boolean).join(' ');

  // Define o valor a ser exibido no modo de visualização para o peso
  // Exibe '0%' se o peso for vazio ou "0". Garante que "0" também mostre "%".
  const displayWeight = weight !== '' ? `${weight}%` : ''; // Mostra vazio se weight for vazio (incluindo '0')
   // Se quiser que '0' mostre '0%', use: const displayWeight = weight === '' ? '' : `${weight}%`;


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
                value={weight} // Passa o valor numérico ou string vazia (sem '%')
                isEditing={true} 
                onChange={handleWeightInputChange} // Usa o handler local que filtra
                placeholder={weightPlaceholder}
                ariaLabel={`Peso da seção ${sectionId}`}
                className={weightEditableFieldClassName}
                inputClassName={weightInputClassName}
                // REMOVIDO: type="number" - EditableField não suporta essa prop diretamente
                onFocus={handleSectionFieldFocus} 
                onBlur={onFieldBlur} 
              />
            </div>
          ) : (
            // Renderiza o peso com '%' no modo visualização apenas se houver um valor
            displayWeight && <div className={weightTextClassName}>{displayWeight}</div> 
          )}
        </div>

        {/* Descrição da Seção - Segunda linha */}
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


        {/* Lista de Itens */}
        <div className={itemsListClassName}>
          {items.map((item) => {
            const isItemSelected = item.id === selectedItemId;
            return (
              <SectionItem
                key={item.id}
                id={item.id}
                description={item.description}
                value={item.value} // Mantém para dados, não visível por padrão
                isEditing={isEditing}
                isSelected={isItemSelected}
                onSelect={() => handleLocalItemSelect(item.id)} 
                onDescriptionChange={(newDesc) => onItemChange(sectionId, item.id, 'description', newDesc)}
                // CORRIGIDO: onValueChange é uma prop OBRIGATÓRIA na SectionItemProps, deve ser passada.
                // Passa o handler mesmo que o campo de valor não esteja visível (showValueField={false}).
                onValueChange={(newVal) => onItemChange(sectionId, item.id, 'value', newVal)} 
                onFieldFocus={onFieldFocus} 
                onFieldBlur={onFieldBlur}   
                showValueField={false} // Explicitamente não mostrar o campo de valor por agora
                className={sectionItemClassName}
                selectedClassName={sectionItemSelectedClassName}
                // Passando as classes para SectionItem usando os nomes corretos da SectionItemProps
                descriptionFieldContainerClassName={descriptionFieldContainerClassName}
                descriptionTextDisplayClassName={descriptionTextDisplayClassName}
                descriptionInputClassName={descriptionInputClassName}
                // Classes de valor (não usadas pois showValueField é false em SectionItem)
                // valueFieldContainerClassName={sectionItemValueFieldContainerClassName} // Exemplo se existissem
                // valueTextDisplayClassName={sectionItemValueTextDisplayClassName} // Exemplo
                // valueInputClassName={sectionItemValueInputClassName} // Exemplo
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Section;