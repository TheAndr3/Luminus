// components/Section.tsx
import React, { useRef, useEffect, useState } from 'react';
import EditableField from './EditableField';
import SectionItem from './SectionItem';
import ActionSidebar from './ActionSidebar';
// Supondo que você tenha tipos definidos para os itens
import { ItemData } from '../../types/dossier';



interface SectionProps {
  id: string; // ID da seção
  title: string;
  items: ItemData[];
  isEditing: boolean;
  /** ID do item atualmente selecionado *globalmente*. A sidebar aparecerá se este ID pertencer a um item desta seção. */
  selectedItemId: string | null;
  /** Chamado quando um item desta seção é clicado/selecionado. */
  onItemSelect: (itemId: string | null) => void; // Passa null para desselecionar

  // Callbacks para o título da seção
  onTitleChange: (newTitle: string) => void;

  // Callbacks para serem passados à ActionSidebar (operam nesta seção ou no item selecionado)
  onItemAdd: () => void; // Adiciona um novo item a esta seção
  onItemChange: (itemId: string, field: 'description' | 'value', newValue: string) => void;
  onItemDelete: (itemId: string) => void; // Deleta o item com o ID fornecido (o selecionado)
  onAddNewSection: () => void; // Duplica esta seção
  onSectionSettings: () => void; // Configurações desta seção
  onDeleteSection: () => void; // Deleta esta seção

  // Callbacks para quando o Section clica na sua área (não na sidebar nem item)
  // Pode ser usado para destacar a seção, mas não para a sidebar de item
  onSectionAreaClick?: () => void;


  // Props de estilização
  className?: string;
  /** Classe para o contêiner que envolve o título e a lista de itens, útil para a barra rosa lateral */
  contentWrapperClassName?: string;
  isSectionSelectedForStyling?: boolean; // Para aplicar a barra rosa, por exemplo
  selectedSectionStylingClassName?: string; // Classe da barra rosa

  // Estilização do título da seção
  titleContainerClassName?: string;
  titleEditableFieldClassName?: string; // Classe geral para o EditableField do título
  titleTextClassName?: string;
  titleInputClassName?: string;
  titlePlaceholder?: string;

  // Estilização da lista de itens
  itemsListClassName?: string;

  // Props de estilização para SectionItem (serão passadas para cada SectionItem)
  sectionItemClassName?: string;
  sectionItemSelectedClassName?: string;
  descriptionFieldContainerClassName?: string;
  descriptionTextDisplayClassName?: string;
  descriptionInputClassName?: string;
  valueFieldContainerClassName?: string;
  valueTextDisplayClassName?: string;
  valueInputClassName?: string;

  // Props de estilização para ActionSidebar
  actionSidebarContainerClassName?: string;
  actionSidebarButtonClassName?: string;
  // ...outras classes específicas para botões da ActionSidebar
  actionSidebarDisabledButtonClassName?: string;
  actionSidebarAddItemButtonClassName?: string;
  actionSidebarDuplicateSectionButtonClassName?: string;
  actionSidebarSectionSettingsButtonClassName?: string;
  actionSidebarDeleteItemButtonClassName?: string;
  actionSidebarDeleteSectionButtonClassName?: string;
}

const Section: React.FC<SectionProps> = ({
  id: sectionId, // Renomeando para evitar conflito com id de item
  title,
  items,
  isEditing,
  selectedItemId,
  onItemSelect,
  onTitleChange,
  onItemAdd,
  onItemChange,
  onItemDelete,
  onAddNewSection,
  onSectionSettings,
  onDeleteSection,
  onSectionAreaClick,
  className = '',
  contentWrapperClassName = '',
  isSectionSelectedForStyling = false,
  selectedSectionStylingClassName = '',
  titleContainerClassName = '',
  titleEditableFieldClassName = '',
  titleTextClassName = '',
  titleInputClassName = '',
  titlePlaceholder = 'Título da Seção',
  itemsListClassName = '',
  sectionItemClassName = '',
  sectionItemSelectedClassName = '',
  descriptionFieldContainerClassName,
  descriptionTextDisplayClassName,
  descriptionInputClassName,
  valueFieldContainerClassName,
  valueTextDisplayClassName,
  valueInputClassName,
  actionSidebarContainerClassName,
  actionSidebarButtonClassName,
  actionSidebarDisabledButtonClassName,
  actionSidebarAddItemButtonClassName,
  actionSidebarDuplicateSectionButtonClassName,
  actionSidebarSectionSettingsButtonClassName,
  actionSidebarDeleteItemButtonClassName,
  actionSidebarDeleteSectionButtonClassName,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  // Usaremos um map de refs para os itens, se necessário, ou um seletor de ID.
  // Mais simples: o SectionItem selecionado terá uma ref especial.
  const selectedItemRef = useRef<HTMLDivElement | null>(null);
  const [sidebarPosition, setSidebarPosition] = useState<{ top: number; right: number } | null>(null);

  const currentSelectedItemExistsInSection = items.some(item => item.id === selectedItemId);

  useEffect(() => {
    if (isEditing && currentSelectedItemExistsInSection && selectedItemRef.current && sectionRef.current) {
      const sectionRect = sectionRef.current.getBoundingClientRect();
      const itemRect = selectedItemRef.current.getBoundingClientRect();

      const top = itemRect.top - sectionRect.top;
      // Ajuste este valor para posicionar a sidebar corretamente ao lado do item
      // Um valor negativo a empurra para fora da borda direita da seção.
      // Considere a largura da sidebar.
      const desiredRightOffset = -80; // Ex: -(largura_sidebar + gap)

      setSidebarPosition({
        top: top,
        right: desiredRightOffset,
      });
    } else {
      setSidebarPosition(null);
    }
    // A dependência `items` é importante se o item selecionado for removido.
  }, [selectedItemId, isEditing, items, currentSelectedItemExistsInSection]);

  const handleLocalItemSelect = (itemId: string) => {
    // Se o item clicado já é o selecionado, desselecione-o. Senão, selecione-o.
    if (itemId === selectedItemId) {
      onItemSelect(null);
    } else {
      onItemSelect(itemId);
    }
  };

  const handleSectionClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Evita chamar onSectionAreaClick se o clique foi em um item ou na sidebar
    // Isso é uma simplificação. Uma verificação mais robusta usaria event.target e .closest()
    if (event.target === event.currentTarget && onSectionAreaClick) {
        onSectionAreaClick();
    }
  };

  const combinedSectionClasses = [
    className,
    isSectionSelectedForStyling ? selectedSectionStylingClassName : ''
  ].filter(Boolean).join(' ');


  return (
    <div ref={sectionRef} className={combinedSectionClasses} onClick={handleSectionClick} style={{ position: 'relative' }}>
      <div className={contentWrapperClassName}> {/* Wrapper para a barra lateral rosa e conteúdo */}
        <div className={titleContainerClassName}>
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

        <div className={itemsListClassName}>
          {items.map((item) => {
            const isItemSelected = item.id === selectedItemId;
            return (
              // Wrapper para a ref do item selecionado
              <div key={item.id} ref={isItemSelected ? selectedItemRef : null}>
                <SectionItem
                  id={item.id}
                  description={item.description}
                  value={item.value}
                  isEditing={isEditing}
                  isSelected={isItemSelected}
                  onSelect={() => handleLocalItemSelect(item.id)}
                  onDescriptionChange={(newDesc) => onItemChange(item.id, 'description', newDesc)}
                  onValueChange={(newVal) => onItemChange(item.id, 'value', newVal)}
                  // Passando classes para SectionItem
                  className={sectionItemClassName}
                  selectedClassName={sectionItemSelectedClassName}
                  descriptionFieldContainerClassName={descriptionFieldContainerClassName}
                  descriptionTextDisplayClassName={descriptionTextDisplayClassName}
                  descriptionInputClassName={descriptionInputClassName}
                  valueFieldContainerClassName={valueFieldContainerClassName}
                  valueTextDisplayClassName={valueTextDisplayClassName}
                  valueInputClassName={valueInputClassName}
                />
              </div>
            );
          })}
        </div>
      </div>

      {isEditing && currentSelectedItemExistsInSection && sidebarPosition && (
        <div style={{ position: 'absolute', top: sidebarPosition.top, right: sidebarPosition.right, zIndex: 10 }}>
          <ActionSidebar
            isVisible={true} // Já verificado acima
            onAddItemToSection={onItemAdd}
            onAddNewSection={onAddNewSection}
            onSectionSettings={onSectionSettings}
            onDeleteSection={onDeleteSection}
            canDeleteItem={!!selectedItemId} // Se selectedItemId é truthy, então um item está selecionado
            onDeleteItemFromSection={() => {
              if (selectedItemId) {
                onItemDelete(selectedItemId);
              }
            }}
            // Passando classes para ActionSidebar
            className={actionSidebarContainerClassName}
            buttonClassName={actionSidebarButtonClassName}
            disabledButtonClassName={actionSidebarDisabledButtonClassName}
            addItemButtonClassName={actionSidebarAddItemButtonClassName}
            duplicateSectionButtonClassName={actionSidebarDuplicateSectionButtonClassName}
            sectionSettingsButtonClassName={actionSidebarSectionSettingsButtonClassName}
            deleteItemButtonClassName={actionSidebarDeleteItemButtonClassName}
            deleteSectionButtonClassName={actionSidebarDeleteSectionButtonClassName}
          />
        </div>
      )}
    </div>
  );
};

export default Section;