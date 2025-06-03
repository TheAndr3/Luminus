// components/SectionList.tsx
import React from 'react';
import Section from './Section'; // Importa o componente Section, que representa uma única seção
import { SectionData } from '../../types/dossier'; // Importa a tipagem para os dados de uma seção

// Interface para definir as propriedades esperadas pelo componente SectionList
interface SectionListProps {
  sections: SectionData[]; // Array de objetos, cada um contendo os dados de uma seção
  isEditing: boolean; // Flag global para indicar se a lista de seções (e seus componentes filhos) está em modo de edição
  selectedSectionIdForStyling: string | null; // ID da seção atualmente selecionada para estilização especial (ex: destaque visual)
  selectedItemId: string | null; // ID do item atualmente selecionado (pode estar em qualquer seção da lista)

  // Callbacks para interações com as seções e itens
  onSectionAreaClick: (sectionId: string) => void; // Função chamada quando a área de uma seção (não um campo editável) é clicada
  onItemSelect: (itemId: string) => void; // Função chamada quando um item dentro de uma seção é selecionado

  // Callbacks para quando os campos de uma seção são alterados
  onSectionTitleChange: (sectionId: string, newTitle: string) => void;
  onSectionDescriptionChange: (sectionId: string, newDescription: string) => void;
  onSectionWeightChange: (sectionId: string, newWeight: string) => void;
  // Callback para quando um campo de um item é alterado
  onItemChange: (sectionId: string, itemId: string, field: 'description' | 'value', newValue: string) => void;

  // Callbacks para eventos de foco nos campos
  onFieldFocus: (element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => void;
  onFieldBlur: () => void;

  // Classes CSS para estilização do próprio SectionList
  className?: string; // Classe CSS para o contêiner principal da lista de seções

  // Classes CSS para serem passadas para cada componente Section renderizado
  sectionComponentClassName?: string; // Classe para o contêiner principal de cada Section
  sectionComponentContentWrapperClassName?: string; // Classe para o wrapper de conteúdo de cada Section
  sectionComponentSelectedStylingClassName?: string; // Classe aplicada a um Section quando está selecionado para estilização

  // Classes CSS para o contêiner de título e peso dentro de cada Section
  sectionComponentTitleAndWeightContainerClassName?: string;
  // Classes CSS para os elementos do título dentro de cada Section
  sectionComponentTitleContainerClassName?: string;
  sectionComponentTitleEditableFieldClassName?: string;
  sectionComponentTitleTextClassName?: string;
  sectionComponentTitleInputClassName?: string;

  // Classes CSS para os elementos da descrição dentro de cada Section
  sectionComponentDescriptionContainerClassName?: string;
  sectionComponentDescriptionEditableFieldClassName?: string;
  sectionComponentDescriptionTextClassName?: string;
  sectionComponentDescriptionTextareaClassName?: string;

  // Classes CSS para os elementos do campo de peso dentro de cada Section
  sectionComponentWeightFieldContainerClassName?: string;
  sectionComponentWeightEditableFieldClassName?: string;
  sectionComponentWeightTextClassName?: string;
  sectionComponentWeightInputClassName?: string;

  // Classe CSS para a lista de itens dentro de cada Section
  sectionComponentItemsListClassName?: string;

  // Classes CSS para serem passadas para cada componente SectionItem (via Section)
  sectionItemClassName?: string; // Classe para cada SectionItem
  sectionItemSelectedClassName?: string; // Classe para um SectionItem selecionado
  // Classes CSS para os campos de descrição dentro de cada SectionItem
  sectionItemDescriptionFieldContainerClassName?: string;
  sectionItemDescriptionTextDisplayClassName?: string;
  sectionItemDescriptionInputClassName?: string;
}

// Definição do componente funcional SectionList
const SectionList: React.FC<SectionListProps> = ({
  sections, // Array de dados das seções
  isEditing, // Modo de edição
  selectedSectionIdForStyling, // ID da seção selecionada para estilo
  selectedItemId, // ID do item selecionado
  onSectionAreaClick, // Callback para clique na área da seção
  onItemSelect, // Callback para seleção de item
  onSectionTitleChange, // Callback para mudança de título da seção
  onSectionDescriptionChange, // Callback para mudança de descrição da seção
  onSectionWeightChange, // Callback para mudança de peso da seção
  onItemChange, // Callback para mudança em um item
  onFieldFocus, // Callback para foco em campo
  onFieldBlur, // Callback para blur de campo
  className = '', // Classe CSS para o contêiner da lista (padrão: string vazia)
  // Props de classes para os componentes Section filhos
  sectionComponentClassName,
  sectionComponentContentWrapperClassName,
  sectionComponentSelectedStylingClassName,
  sectionComponentTitleAndWeightContainerClassName,
  sectionComponentTitleContainerClassName,
  sectionComponentTitleEditableFieldClassName,
  sectionComponentTitleTextClassName,
  sectionComponentTitleInputClassName,
  sectionComponentDescriptionContainerClassName = '', // Padrão: string vazia
  sectionComponentDescriptionEditableFieldClassName = '', // Padrão: string vazia
  sectionComponentDescriptionTextClassName = '', // Padrão: string vazia
  sectionComponentDescriptionTextareaClassName = '', // Padrão: string vazia
  sectionComponentWeightFieldContainerClassName,
  sectionComponentWeightEditableFieldClassName,
  sectionComponentWeightTextClassName,
  sectionComponentWeightInputClassName,
  sectionComponentItemsListClassName,
  // Props de classes para os componentes SectionItem filhos (passados via Section)
  sectionItemClassName,
  sectionItemSelectedClassName,
  sectionItemDescriptionFieldContainerClassName,
  sectionItemDescriptionTextDisplayClassName,
  sectionItemDescriptionInputClassName,
}) => {
  // Renderiza um contêiner div para a lista de seções
  return (
    <div className={className}>
      {/* Mapeia o array 'sections' para renderizar um componente 'Section' para cada objeto de seção */}
      {sections.map((section) => (
        <Section
          key={section.id} // Chave React única para cada seção na lista
          id={section.id} // ID da seção
          title={section.title} // Título da seção
          description={section.description} // Descrição da seção
          weight={section.weight} // Peso da seção
          items={section.items} // Itens pertencentes a esta seção
          isEditing={isEditing} // Propaga o estado de edição global para cada seção
          selectedItemId={selectedItemId} // Passa o ID do item selecionado globalmente
          onItemSelect={onItemSelect} // Passa o callback de seleção de item
          // Callbacks para alteração dos campos da seção, adaptados para incluir o ID da seção atual
          onTitleChange={(newTitle: string) => onSectionTitleChange(section.id, newTitle)}
          onDescriptionChange={(newDescription: string) => onSectionDescriptionChange(section.id, newDescription)}
          onWeightChange={(newWeight: string) => onSectionWeightChange(section.id, newWeight)}
          onItemChange={onItemChange} // Passa o callback de alteração de item (o SectionItem cuidará de adicionar o itemId)
          onSectionAreaClick={onSectionAreaClick} // Passa o callback para clique na área da seção
          // Determina se esta seção específica deve receber a estilização de "selecionada"
          isSectionSelectedForStyling={section.id === selectedSectionIdForStyling}
          onFieldFocus={onFieldFocus} // Passa o callback de foco
          onFieldBlur={onFieldBlur}   // Passa o callback de blur

          // Passa as classes de estilização específicas para o componente Section
          className={sectionComponentClassName}
          contentWrapperClassName={sectionComponentContentWrapperClassName}
          selectedSectionStylingClassName={sectionComponentSelectedStylingClassName}

          titleAndWeightContainerClassName={sectionComponentTitleAndWeightContainerClassName}
          titleContainerClassName={sectionComponentTitleContainerClassName}
          titleEditableFieldClassName={sectionComponentTitleEditableFieldClassName}
          titleTextClassName={sectionComponentTitleTextClassName}
          titleInputClassName={sectionComponentTitleInputClassName}

          descriptionContainerClassName={sectionComponentDescriptionContainerClassName}
          descriptionEditableFieldClassName={sectionComponentDescriptionEditableFieldClassName}
          descriptionTextClassName={sectionComponentDescriptionTextClassName}
          descriptionTextareaClassName={sectionComponentDescriptionTextareaClassName}

          weightFieldContainerClassName={sectionComponentWeightFieldContainerClassName}
          weightEditableFieldClassName={sectionComponentWeightEditableFieldClassName}
          weightTextClassName={sectionComponentWeightTextClassName}
          weightInputClassName={sectionComponentWeightInputClassName}

          itemsListClassName={sectionComponentItemsListClassName}

          // Passa as classes de estilização para os componentes SectionItem (via Section)
          sectionItemClassName={sectionItemClassName}
          sectionItemSelectedClassName={sectionItemSelectedClassName}
          descriptionFieldContainerClassName={sectionItemDescriptionFieldContainerClassName}
          descriptionTextDisplayClassName={sectionItemDescriptionTextDisplayClassName}
          descriptionInputClassName={sectionItemDescriptionInputClassName}
        />
      ))}
    </div>
  );
};

// Exporta o componente SectionList como padrão
export default SectionList;