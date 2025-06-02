// components/Section.tsx
import React, { useRef, useCallback } from 'react';
import EditableField from './EditableField'; // Componente para campos editáveis (título, descrição, etc.)
import SectionItem from './SectionItem'; // Componente para cada item dentro da seção
import { ItemData } from '../../types/dossier'; // Tipagem para os dados de um item

// Interface para definir as propriedades esperadas pelo componente Section
interface SectionProps {
  id: string; // Identificador único da seção
  title: string; // Título da seção
  description: string; // Descrição da seção
  weight: string; // Peso/percentual da seção
  items: ItemData[]; // Array de itens pertencentes a esta seção
  isEditing: boolean; // Flag para indicar se a seção está em modo de edição
  selectedItemId: string | null; // ID do item atualmente selecionado dentro desta seção (se houver)
  isSectionSelectedForStyling: boolean; // Flag para indicar se a seção está selecionada para estilização especial

  onItemSelect: (itemId: string) => void; // Função chamada quando um item é selecionado
  onSectionAreaClick?: (sectionId: string) => void; // Função chamada quando a área da seção (não um campo editável ou item) é clicada

  // Funções de callback para quando os campos da seção são alterados
  onTitleChange: (newTitle: string) => void;
  onDescriptionChange: (newDescription: string) => void;
  onWeightChange: (newWeight: string) => void;
  // Função de callback para quando um campo de um item é alterado
  onItemChange: (sectionId: string, itemId: string, field: 'description' | 'value', newValue: string) => void;

  // Funções de callback para eventos de foco nos campos
  onFieldFocus?: (element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => void;
  onFieldBlur?: () => void;

  // Classes CSS para estilização customizada
  className?: string; // Classe CSS para o contêiner principal da seção
  contentWrapperClassName?: string; // Classe CSS para o wrapper do conteúdo interno da seção
  selectedSectionStylingClassName?: string; // Classe CSS aplicada quando a seção está selecionada para estilização

  // Classes CSS para o contêiner do título e peso
  titleAndWeightContainerClassName?: string;
  // Classes CSS para o título
  titleContainerClassName?: string;
  titleEditableFieldClassName?: string;
  titleTextClassName?: string;
  titleInputClassName?: string;
  titlePlaceholder?: string; // Placeholder para o campo de título

  // Classes CSS para a descrição
  descriptionContainerClassName?: string;
  descriptionEditableFieldClassName?: string;
  descriptionTextClassName?: string;
  descriptionTextareaClassName?: string;
  descriptionPlaceholder?: string; // Placeholder para o campo de descrição

  // Classes CSS para o campo de peso
  weightFieldContainerClassName?: string;
  weightEditableFieldClassName?: string;
  weightTextClassName?: string;
  weightInputClassName?: string;
  weightPlaceholder?: string; // Placeholder para o campo de peso

  // Classes CSS para a lista de itens
  itemsListClassName?: string;
  // Classes CSS para cada item da seção
  sectionItemClassName?: string;
  sectionItemSelectedClassName?: string; // Classe CSS para um item selecionado
  // Classes CSS específicas para campos de descrição de item (passadas para SectionItem)
  descriptionFieldContainerClassName?: string;
  descriptionTextDisplayClassName?: string;
  descriptionInputClassName?: string;
}

// Definição do componente funcional Section
const Section: React.FC<SectionProps> = ({
  id: sectionId, // Renomeia 'id' para 'sectionId' para clareza no escopo do componente
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
  className = '', // Valor padrão para className
  contentWrapperClassName = '', // Valor padrão para contentWrapperClassName
  selectedSectionStylingClassName = '', // Valor padrão para selectedSectionStylingClassName
  titleAndWeightContainerClassName = '', // Valor padrão
  titleContainerClassName = '', // Valor padrão
  titleEditableFieldClassName = '', // Valor padrão
  titleTextClassName = '', // Valor padrão
  titleInputClassName = '', // Valor padrão
  titlePlaceholder = 'Título da Seção', // Placeholder padrão para o título
  descriptionContainerClassName = '', // Valor padrão
  descriptionEditableFieldClassName = '', // Valor padrão
  descriptionTextClassName = '', // Valor padrão
  descriptionTextareaClassName = '', // Valor padrão
  descriptionPlaceholder = 'Descrição da seção', // Placeholder padrão para a descrição
  weightFieldContainerClassName = '', // Valor padrão
  weightEditableFieldClassName = '', // Valor padrão
  weightTextClassName = '', // Valor padrão
  weightInputClassName = '', // Valor padrão
  weightPlaceholder = 'Peso %', // Placeholder padrão para o peso
  itemsListClassName = '', // Valor padrão
  sectionItemClassName = '', // Valor padrão
  sectionItemSelectedClassName = '', // Valor padrão
  descriptionFieldContainerClassName, // Não possui valor padrão, será undefined se não passado
  descriptionTextDisplayClassName, // Não possui valor padrão
  descriptionInputClassName, // Não possui valor padrão
}) => {
  // Cria uma referência para o elemento div principal da seção
  // Isso é usado para identificar cliques diretos na área da seção
  const sectionRef = useRef<HTMLDivElement>(null);

  // Manipulador para seleção de item, memoizado com useCallback
  // Só chama onItemSelect se estiver em modo de edição
  const handleLocalItemSelect = useCallback((itemId: string) => {
    if (isEditing) {
      onItemSelect(itemId);
    }
  }, [isEditing, onItemSelect]); // Dependências do useCallback

  // Manipulador para cliques na área da seção, memoizado com useCallback
  const handleSectionClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    // Retorna cedo se não estiver em modo de edição ou se não houver callback definido
    if (!isEditing || !onSectionAreaClick) return;

    // Obtém o elemento alvo do clique
    const targetElement = event.target as HTMLElement;

    // Determina se o clique foi na "área da seção" e não em um elemento interativo dentro dela
    // (como inputs, textareas, spans de campos editáveis ou os próprios itens)
    const isClickOnSectionArea = (
      targetElement === sectionRef.current || // Clique direto no div principal da seção
      targetElement.classList.contains(contentWrapperClassName) || // Clique no wrapper de conteúdo
      targetElement.classList.contains(titleAndWeightContainerClassName) || // Clique no contêiner de título e peso
      targetElement.classList.contains(descriptionContainerClassName) || // Clique no contêiner da descrição
      targetElement.classList.contains(itemsListClassName) // Clique na lista de itens (mas não em um item)
    ) &&
    !targetElement.closest('input, textarea, span[class*="editableField_textDisplay"]') && // Não foi em input, textarea ou display de texto editável
    !targetElement.closest(`[id^="dossier-item-"]`); // Não foi em um elemento de item (SectionItem)


    // Se o clique foi na área da seção, chama o callback onSectionAreaClick
    if (isClickOnSectionArea) {
        onSectionAreaClick(sectionId);
    }
  }, [isEditing, onSectionAreaClick, sectionId, contentWrapperClassName, titleAndWeightContainerClassName, descriptionContainerClassName, itemsListClassName]); // Dependências do useCallback

  // Manipulador para o evento de foco em campos da seção, memoizado com useCallback
  const handleSectionFieldFocus = useCallback((element: HTMLElement) => {
    if (onFieldFocus) {
        // Chama o callback onFieldFocus com o elemento focado e o contexto (tipo: seção, id da seção)
        onFieldFocus(element, { type: 'section', id: sectionId });
    }
  }, [onFieldFocus, sectionId]); // Dependências do useCallback

  // Manipulador para alteração do valor do campo de peso, memoizado com useCallback
  const handleWeightInputChange = useCallback((newValue: string) => {
    // Remove todos os caracteres não numéricos do novo valor
    const numericValue = newValue.replace(/\D/g, '');
    // Chama o callback onWeightChange com o valor numérico
    onWeightChange(numericValue);
  }, [onWeightChange]); // Dependências do useCallback

  // Combina as classes CSS da seção, incluindo a classe de estilização de seção selecionada se aplicável
  const combinedSectionClasses = [
    className, // Classe base
    isSectionSelectedForStyling ? selectedSectionStylingClassName : '' // Classe condicional
  ].filter(Boolean).join(' '); // Remove valores vazios e junta com espaço

  // Formata o peso para exibição (ex: "10%") ou retorna string vazia se o peso não estiver definido
  const displayWeight = weight === '' ? '' : `${weight}%`;


  // Renderização do componente
  return (
    <div
        ref={sectionRef} // Atribui a referência ao div principal
        id={`dossier-section-${sectionId}`} // ID dinâmico para a seção
        className={combinedSectionClasses} // Classes CSS combinadas
        onClick={handleSectionClick} // Manipulador de clique na área da seção
        style={{ position: 'relative' }} // Estilo para permitir posicionamento de filhos (ex: toolbars)
    >
      {/* Wrapper para o conteúdo interno da seção */}
      <div className={contentWrapperClassName}>

        {/* Contêiner para o título e o campo de peso */}
        <div className={`${titleAndWeightContainerClassName}`}>
          {/* Contêiner do título, com flexGrow para ocupar espaço disponível */}
          <div className={titleContainerClassName} style={{ flexGrow: 1 }}>
            <EditableField
              value={title}
              isEditing={isEditing}
              onChange={onTitleChange}
              placeholder={titlePlaceholder}
              ariaLabel={`Título da seção ${sectionId}`} // Acessibilidade
              className={titleEditableFieldClassName}
              textDisplayClassName={titleTextClassName}
              inputClassName={titleInputClassName}
              onFocus={handleSectionFieldFocus} // Callback de foco para campos da seção
              onBlur={onFieldBlur} // Callback de blur geral
            />
          </div>
          {/* Campo de peso (visível apenas em modo de edição) ou texto do peso */}
          {isEditing ? (
            <div className={weightFieldContainerClassName}>
              <EditableField
                value={weight} // O valor bruto, sem o '%'
                isEditing={true} // O campo de peso está sempre editável quando a seção está em modo de edição
                onChange={handleWeightInputChange} // Manipulador customizado para entrada de peso
                placeholder={weightPlaceholder}
                ariaLabel={`Peso da seção ${sectionId}`} // Acessibilidade
                className={weightEditableFieldClassName}
                inputClassName={weightInputClassName}
                onFocus={handleSectionFieldFocus} // Callback de foco para campos da seção
                onBlur={onFieldBlur} // Callback de blur geral
              />
            </div>
          ) : (
            // Exibe o peso formatado quando não está em modo de edição, se houver peso
            displayWeight && <div className={weightTextClassName}>{displayWeight}</div>
          )}
        </div>

         {/* Contêiner da descrição */}
         <div className={descriptionContainerClassName}>
             <EditableField
                value={description}
                isEditing={isEditing}
                onChange={onDescriptionChange}
                placeholder={descriptionPlaceholder}
                ariaLabel={`Descrição da seção ${sectionId}`} // Acessibilidade
                multiline={true} // Indica que este campo pode ter múltiplas linhas (usa textarea)
                className={descriptionEditableFieldClassName}
                textDisplayClassName={descriptionTextClassName}
                textareaClassName={descriptionTextareaClassName}
                onFocus={handleSectionFieldFocus} // Callback de foco para campos da seção
                onBlur={onFieldBlur} // Callback de blur geral
             />
         </div>


        {/* Lista de itens da seção */}
        <div className={itemsListClassName}>
          {/* Mapeia o array de itens para renderizar cada SectionItem */}
          {items.map((item) => {
            // Verifica se o item atual é o item selecionado
            const isItemSelected = item.id === selectedItemId;
            return (
              <SectionItem
                key={item.id} // Chave única para o React
                id={item.id}
                description={item.description}
                value={item.value} // Valor do item (pode não ser usado se showValueField for false)
                isEditing={isEditing} // Propaga o estado de edição
                isSelected={isItemSelected} // Indica se este item está selecionado
                onSelect={() => handleLocalItemSelect(item.id)} // Callback para quando este item é selecionado
                // Callbacks para alteração dos campos do item, propagando para onItemChange da seção
                onDescriptionChange={(newDesc) => onItemChange(sectionId, item.id, 'description', newDesc)}
                onValueChange={(newVal) => onItemChange(sectionId, item.id, 'value', newVal)}
                onFieldFocus={onFieldFocus} // Propaga o callback de foco (será chamado com contexto de 'item')
                onFieldBlur={onFieldBlur}   // Propaga o callback de blur
                showValueField={false} // Exemplo: este componente Section pode decidir não mostrar o campo de valor para seus itens
                className={sectionItemClassName} // Classe CSS para o item
                selectedClassName={sectionItemSelectedClassName} // Classe CSS para item selecionado
                // Classes CSS específicas para campos de descrição do item
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

// Exporta o componente Section como padrão
export default Section;