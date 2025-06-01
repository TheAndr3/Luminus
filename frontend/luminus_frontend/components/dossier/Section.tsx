// components/Section.tsx
import React, { useRef, useCallback } from 'react';
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
  selectedItemId: string | null; // Usado para estilizar o item selecionado
  isSectionSelectedForStyling: boolean; // Usado para estilizar a seção selecionada

  onItemSelect: (itemId: string) => void; // Handler para clique na div do item (seleção visual)
  onSectionAreaClick?: (sectionId: string) => void; // Handler para clique na área da seção (seleção visual)

  onTitleChange: (newTitle: string) => void;
  onDescriptionChange: (newDescription: string) => void;
  onWeightChange: (newWeight: string) => void; // Espera string contendo apenas números ou vazia
  onItemChange: (sectionId: string, itemId: string, field: 'description' | 'value', newValue: string) => void;

  // Handlers de foco/blur passados do pai (page.tsx)
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
  isSectionSelectedForStyling,
  onItemSelect,
  onSectionAreaClick, // Recebe handler de clique na área da seção
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

  // Handler para clique na div de um SectionItem
  // APENAS propaga a seleção visual do item
  const handleLocalItemSelect = useCallback((itemId: string) => {
    if (isEditing) {
      // onSelect no SectionItem agora só cuida da seleção visual.
      // O foco no EditableField dentro do item cuida do posicionamento da sidebar via onFieldFocus.
      onItemSelect(itemId);
    }
  }, [isEditing, onItemSelect]);

   // Handler para clique na área da seção (sem ser nos campos editáveis ou itens)
  const handleSectionClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing || !onSectionAreaClick) return; // Só funciona em modo edição e se o handler for passado

    const targetElement = event.target as HTMLElement;

    // Verifica se o clique foi diretamente na div da seção ou em seus wrappers,
    // E NÃO foi em um EditableField (input, textarea, ou span de display),
    // E NÃO foi dentro de um SectionItem.
    const isClickOnSectionArea = (targetElement === sectionRef.current ||
                                  targetElement.classList.contains(contentWrapperClassName) ||
                                  targetElement.classList.contains(titleAndWeightContainerClassName) ||
                                  targetElement.classList.contains(descriptionContainerClassName) ||
                                  targetElement.classList.contains(itemsListClassName)) &&
                                  !targetElement.closest('input, textarea, span[class*="editableField_textDisplay"]') &&
                                  !targetElement.closest(`[id^="dossier-item-"]`);


    if (isClickOnSectionArea) {
        onSectionAreaClick(sectionId); // Chama o handler da page para selecionar a seção e limpar foco/seleção de item
    }
  }, [isEditing, onSectionAreaClick, sectionId, contentWrapperClassName, titleAndWeightContainerClassName, descriptionContainerClassName, itemsListClassName]);


  // Handler para foco em um EditableField dentro da seção (título/peso/descrição)
  // Propaga o evento de foco para o pai com o contexto da seção.
  const handleSectionFieldFocus = useCallback((element: HTMLElement) => {
    if (onFieldFocus) {
        onFieldFocus(element, { type: 'section', id: sectionId });
    }
  }, [onFieldFocus, sectionId]);

  // Handler local para filtrar a entrada do campo de peso
  const handleWeightInputChange = useCallback((newValue: string) => {
    const numericValue = newValue.replace(/\D/g, ''); // Remove tudo que não for dígito
    onWeightChange(numericValue);
  }, [onWeightChange]);

  const combinedSectionClasses = [
    className,
    isSectionSelectedForStyling ? selectedSectionStylingClassName : ''
  ].filter(Boolean).join(' ');

  // Define o valor a ser exibido no modo de visualização para o peso
  // Exibe '%' apenas se o peso for um número válido (não vazio).
  const displayWeight = weight === '' ? '' : `${weight}%`;


  return (
    <div
        ref={sectionRef} // Associa o ref para o handler de clique
        id={`dossier-section-${sectionId}`}
        className={combinedSectionClasses}
        onClick={handleSectionClick} // Adiciona o handler de clique na div externa da seção
        style={{ position: 'relative' }} // Necessário para a estilização de borda no ::before
    >
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
              onFocus={handleSectionFieldFocus} // Passa handler de foco local
              onBlur={onFieldBlur} // Repassa handler de blur do pai
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
                onFocus={handleSectionFieldFocus} // Passa handler de foco local
                onBlur={onFieldBlur} // Repassa handler de blur do pai
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
                onFocus={handleSectionFieldFocus} // Passa handler de foco local
                onBlur={onFieldBlur} // Repassa handler de blur do pai
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
                onSelect={() => handleLocalItemSelect(item.id)} // Passa handler local para clique na div do item
                onDescriptionChange={(newDesc) => onItemChange(sectionId, item.id, 'description', newDesc)}
                onValueChange={(newVal) => onItemChange(sectionId, item.id, 'value', newVal)} // Passa handler para mudança no valor
                onFieldFocus={onFieldFocus} // Passa handler de foco do pai para SectionItem
                onFieldBlur={onFieldBlur}   // Passa handler de blur do pai para SectionItem
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