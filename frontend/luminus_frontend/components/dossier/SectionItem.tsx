// components/SectionItem.tsx
import React from 'react';
import EditableField from './EditableField';

interface SectionItemProps {
  id: string;
  description: string;
  value: string | number; // Mantido para dados, mas não visível por padrão
  isEditing: boolean;
  isSelected: boolean; // Usado para estilização visual
  onSelect: () => void; // Handler para clique na div do item (seleção visual)
  onDescriptionChange: (newDescription: string) => void;
  onValueChange: (newValue: string) => void; // Mantido para dados

  // Handlers de foco/blur passados do pai (Section)
  onFieldFocus?: (element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => void;
  onFieldBlur?: () => void;

  showValueField?: boolean; // NOVO: para controle futuro da visibilidade do campo valor

  className?: string;
  selectedClassName?: string;
  descriptionFieldContainerClassName?: string;
  descriptionTextDisplayClassName?: string;
  descriptionInputClassName?: string;
  descriptionPlaceholder?: string;

  // Props de valor (opcionais agora, para uso futuro)
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
  onSelect, // Recebe handler de clique na área do item (agora só para seleção visual)
  onDescriptionChange,
  onValueChange, // Recebe handler para mudança no valor
  onFieldFocus, // Recebe handler de foco do pai
  onFieldBlur,  // Recebe handler de blur do pai
  showValueField = false, // Default para não mostrar o campo de valor
  className = '',
  selectedClassName = '',
  descriptionFieldContainerClassName = '',
  descriptionTextDisplayClassName = '',
  descriptionInputClassName = '',
  descriptionPlaceholder = 'Descrição do item',
  valueFieldContainerClassName = '', // Mantém para uso futuro
  valueTextDisplayClassName = '',   // Mantém para uso futuro
  valueInputClassName = '',         // Mantém para uso futuro
  valuePlaceholder = 'Valor',      // Mantém para uso futuro
}) => {
  const itemClasses = [
    className,
    isSelected ? selectedClassName : '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  const stringValue = String(value);

  // Handler para clique na div externa do item
  // Esta função agora se concentra APENAS em chamar onSelect para a seleção visual.
  // O foco em um campo EditableField interno é que acionará o onFieldFocus e posicionará a sidebar.
  const handleItemClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Permite clique para seleção visual apenas no modo de edição
    if (isEditing) {
       // Se o clique NÃO foi em um input, textarea ou span.editableField_textDisplay
       // (ou seja, foi na área "vazia" da div do item), aciona a seleção visual.
       // Cliques nos EditableFields internos serão tratados pelos handlers de foco/blur deles.
        const targetTagName = (event.target as HTMLElement).tagName.toLowerCase();
        const isClickOnEditableField = targetTagName === 'input' || targetTagName === 'textarea' || (targetTagName === 'span' && (event.target as HTMLElement).classList.contains('editableField_textDisplay'));

        if (!isClickOnEditableField) {
           onSelect(); // Chama o handler de seleção visual do item
        }
    }
  };

  // Handler para foco em um EditableField dentro do item (descrição/valor)
  // Propaga o evento de foco para o pai (Section), adicionando o contexto do item.
  const handleItemFieldFocus = (element: HTMLElement) => {
      // Apenas chame o handler pai se ele existir
      if (onFieldFocus) {
          onFieldFocus(element, { type: 'item', id: id }); // Passa o contexto do item
      }
  };


  return (
    <div
      id={`dossier-item-${id}`} // ID para a ActionSidebar encontrar o elemento pai
      className={itemClasses}
      onClick={handleItemClick} // Handler de clique na div externa (para seleção visual)
      aria-current={isSelected ? 'true' : undefined}
      // Style inline mantido, mas classes CSS são preferíveis
      style={{ display: 'flex', alignItems: 'center', width: '100%' }}
    >
      <div className={descriptionFieldContainerClassName} style={{ flexGrow: 1, width: '100%' }}>
        <EditableField
          value={description}
          isEditing={isEditing}
          onChange={onDescriptionChange} // Usa a prop onDescriptionChange
          placeholder={descriptionPlaceholder}
          ariaLabel={`Descrição para o item ${id}`}
          textDisplayClassName={descriptionTextDisplayClassName}
          inputClassName={descriptionInputClassName}
          onFocus={handleItemFieldFocus} // Passa handler de foco local
          onBlur={onFieldBlur}   // Repassa handler de blur do pai
        />
      </div>

      {/* Campo de Valor (oculto por padrão com showValueField={false} em Section.tsx) */}
      {showValueField && (
        <div
          className={valueFieldContainerClassName}
          // Style inline mantido
          style={{ minWidth: '80px', textAlign: 'right', marginLeft: '15px', flexShrink: 0 }}
        >
          <EditableField
            value={stringValue}
            isEditing={isEditing}
            onChange={onValueChange} // Usa a prop onValueChange
            placeholder={valuePlaceholder}
            ariaLabel={`Valor para o item ${id}`}
            textDisplayClassName={valueTextDisplayClassName}
            inputClassName={valueInputClassName}
             onFocus={handleItemFieldFocus} // Passa handler de foco local
             onBlur={onFieldBlur}   // Repassa handler de blur do pai
          />
        </div>
      )}
    </div>
  );
};

export default SectionItem;