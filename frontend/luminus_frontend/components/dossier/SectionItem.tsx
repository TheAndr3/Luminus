// components/SectionItem.tsx
import React from 'react';
import EditableField from './EditableField'; // Supondo que está na mesma pasta ou ajuste o caminho

interface SectionItemProps {
  /** ID único do item. */
  id: string;
  /** Texto à esquerda (descrição do item). */
  description: string;
  /** Valor à direita (e.g., "30%", "Sim"). Convertido para string internamente para EditableField. */
  value: string | number;
  /** Se true, os campos são editáveis. */
  isEditing: boolean;
  /** Se true, o item é visualmente destacado como selecionado. */
  isSelected: boolean;
  /** Chamado quando o item é clicado (para seleção). */
  onSelect: () => void;
  /** Chamado quando a descrição do item é alterada. */
  onDescriptionChange: (newDescription: string) => void;
  /** Chamado quando o valor do item é alterado. */
  onValueChange: (newValue: string) => void; // EditableField sempre retorna string

  /** Classe CSS para o container principal do SectionItem. */
  className?: string;
  /** Classe CSS aplicada ao container principal quando o item está selecionado. */
  selectedClassName?: string;

  // Props para passar para os EditableFields internos
  /** Classe CSS para o container do EditableField da descrição. */
  descriptionFieldContainerClassName?: string;
  /** Classe CSS para o texto de exibição do EditableField da descrição. */
  descriptionTextDisplayClassName?: string;
  /** Classe CSS para o input do EditableField da descrição. */
  descriptionInputClassName?: string;

  /** Classe CSS para o container do EditableField do valor. */
  valueFieldContainerClassName?: string;
  /** Classe CSS para o texto de exibição do EditableField do valor. */
  valueTextDisplayClassName?: string;
  /** Classe CSS para o input do EditableField do valor. */
  valueInputClassName?: string;

  /** Placeholders para os campos editáveis */
  descriptionPlaceholder?: string;
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
  className = '',
  selectedClassName = '',
  descriptionFieldContainerClassName = '',
  descriptionTextDisplayClassName = '',
  descriptionInputClassName = '',
  valueFieldContainerClassName = '',
  valueTextDisplayClassName = '',
  valueInputClassName = '',
  descriptionPlaceholder = 'Descrição do item',
  valuePlaceholder = 'Valor',
}) => {
  const itemClasses = [
    className,
    isSelected ? selectedClassName : '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  // EditableField espera string, então convertemos o valor.
  // A lógica de conversão de volta para número, se necessário, ficaria no componente pai.
  const stringValue = String(value);

  const handleItemClick = () => {
    if (isEditing) { // A seleção só faz sentido no modo de edição para interagir com a ActionSidebar
      onSelect();
    }
    // Poderia ter uma lógica diferente para cliques fora do modo de edição, se necessário
  };

  return (
    <div
      className={itemClasses}
      onClick={handleItemClick}
      // Adicionar tabIndex se for torná-lo focável via teclado para seleção, especialmente se não houver inputs focáveis dentro
      // tabIndex={isEditing ? 0 : -1}
      // onKeyDown={(e) => { if (isEditing && (e.key === 'Enter' || e.key === ' ')) onSelect(); }}
      // role={isEditing ? "button" : undefined} // Se clicável para seleção
      aria-current={isSelected ? 'true' : undefined} // Para indicar seleção a tecnologias assistivas
    >
      <div className={descriptionFieldContainerClassName}>
        <EditableField
          value={description}
          isEditing={isEditing}
          onChange={onDescriptionChange}
          placeholder={descriptionPlaceholder}
          ariaLabel={`Descrição para o item ${id}`}
          // Passando as classes específicas para o EditableField da descrição
          textDisplayClassName={descriptionTextDisplayClassName}
          inputClassName={descriptionInputClassName}
        />
      </div>
      <div className={valueFieldContainerClassName}>
        <EditableField
          value={stringValue}
          isEditing={isEditing}
          onChange={onValueChange} // EditableField sempre retorna string
          placeholder={valuePlaceholder}
          ariaLabel={`Valor para o item ${id}`}
          // Passando as classes específicas para o EditableField do valor
          textDisplayClassName={valueTextDisplayClassName}
          inputClassName={valueInputClassName}
        />
      </div>
    </div>
  );
};

export default SectionItem;