// components/SectionItem.tsx
import React from 'react';
import EditableField from './EditableField';

interface SectionItemProps {
  id: string;
  description: string;
  value: string | number; // Mantido para dados, mas não visível por padrão
  isEditing: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onDescriptionChange: (newDescription: string) => void;
  onValueChange: (newValue: string) => void; // Mantido para dados

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
  onSelect,
  onDescriptionChange,
  onValueChange,
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

  const handleItemClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Permite clique para seleção apenas no modo de edição
    if (isEditing) {
      // Evita que o clique no input/textarea do EditableField desfaça a seleção do item
      // Isso pode ser mais robusto verificando se event.target é um input/textarea
      const targetTagName = (event.target as HTMLElement).tagName.toLowerCase();
      if (targetTagName !== 'input' && targetTagName !== 'textarea') {
        onSelect();
      }
    }
  };

  const handleDescriptionChange = (newDescription: string) => {
    onDescriptionChange(newDescription);
  };

  const handleValueChangeInternal = (newValue: string) => {
    onValueChange(newValue);
  };


  return (
    <div
      id={`dossier-item-${id}`} // ID para a ActionSidebar encontrar o elemento
      className={itemClasses}
      onClick={handleItemClick}
      aria-current={isSelected ? 'true' : undefined}
      style={{ display: 'flex', alignItems: 'center', width: '100%' }}
    >
      <div className={descriptionFieldContainerClassName} style={{ flexGrow: 1, width: '100%' }}>
        <EditableField
          value={description}
          isEditing={isEditing}
          onChange={handleDescriptionChange}
          placeholder={descriptionPlaceholder}
          ariaLabel={`Descrição para o item ${id}`}
          textDisplayClassName={descriptionTextDisplayClassName}
          inputClassName={descriptionInputClassName}
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
            onChange={handleValueChangeInternal}
            placeholder={valuePlaceholder}
            ariaLabel={`Valor para o item ${id}`}
            textDisplayClassName={valueTextDisplayClassName}
            inputClassName={valueInputClassName}
          />
        </div>
      )}
    </div>
  );
};

export default SectionItem;