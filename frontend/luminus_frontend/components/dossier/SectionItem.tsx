// components/SectionItem.tsx
import React from 'react'; // Importa a biblioteca React.
import EditableField from './EditableField'; // Importa o componente `EditableField` que já foi comentado, para reutilização.

// 1. Definição das Propriedades (Props)
//    Esta interface descreve as propriedades que o componente `SectionItem` espera receber.
interface SectionItemProps {
  id: string; // Um identificador único para este item da seção.
  description: string; // O texto da descrição do item.
  value: string | number; // O valor associado ao item (pode ser texto ou número).
  isEditing: boolean; // Booleano que indica se o item está em modo de edição (true) ou exibição (false).
  isSelected: boolean; // Booleano que indica se o item está selecionado (útil para edição em massa ou destaque).
  onSelect: () => void; // Callback chamado quando o item é clicado e não está editando um campo interno.
  onDescriptionChange: (newDescription: string) => void; // Callback para quando a descrição do item é alterada.
  onValueChange: (newValue: string) => void; // Callback para quando o valor do item é alterado.

  // Callbacks para gerenciamento de foco e desfoque, passados para os EditableFields internos.
  // Recebe o elemento focado e um contexto que indica que o foco veio de um 'item' e seu 'id'.
  onFieldFocus?: (element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => void;
  onFieldBlur?: () => void; // Callback opcional para quando um campo perde o foco.

  showValueField?: boolean; // Booleano opcional para controlar a visibilidade do campo de valor.

  // Propriedades para classes CSS, permitindo estilização flexível.
  className?: string; // Classe CSS para o contêiner principal do item.
  selectedClassName?: string; // Classe CSS aplicada quando o item está selecionado (`isSelected`).
  descriptionFieldContainerClassName?: string; // Classe para o contêiner do campo de descrição.
  descriptionTextDisplayClassName?: string; // Classe para a exibição do texto da descrição em modo não-edição.
  descriptionInputClassName?: string; // Classe para o input/textarea da descrição em modo de edição.
  descriptionPlaceholder?: string; // Placeholder para o campo de descrição.

  valueFieldContainerClassName?: string; // Classe para o contêiner do campo de valor.
  valueTextDisplayClassName?: string; // Classe para a exibição do texto do valor em modo não-edição.
  valueInputClassName?: string; // Classe para o input do valor em modo de edição.
  valuePlaceholder?: string; // Placeholder para o campo de valor.
}

// 2. Definição do Componente Funcional SectionItem
//    Este componente representa um único item dentro de uma seção, com campos editáveis e selecionáveis.
const SectionItem: React.FC<SectionItemProps> = ({
  id,
  description,
  value,
  isEditing,
  isSelected,
  onSelect,
  onDescriptionChange,
  onValueChange,
  onFieldFocus,
  onFieldBlur,
  showValueField = false, // Valor padrão para `showValueField`.
  className = '', // Valor padrão para `className`.
  selectedClassName = '', // Valor padrão para `selectedClassName`.
  descriptionFieldContainerClassName = '', // Valor padrão para `descriptionFieldContainerClassName`.
  descriptionTextDisplayClassName = '',
  descriptionInputClassName = '',
  descriptionPlaceholder = 'Descrição do item', // Valor padrão para `descriptionPlaceholder`.
  valueFieldContainerClassName = '',
  valueTextDisplayClassName = '',
  valueInputClassName = '',
  valuePlaceholder = 'Valor',
}) => {
  // 3. Geração das Classes CSS do Item
  //    Combina a classe base com a classe de seleção, se o item estiver selecionado.
  const itemClasses = [
    className, // Classe base fornecida.
    isSelected ? selectedClassName : '', // Adiciona a classe de seleção condicionalmente.
  ]
    .filter(Boolean) // Remove quaisquer strings vazias do array.
    .join(' ') // Une as classes restantes com um espaço.
    .trim(); // Remove espaços em branco extras no início ou fim.

  // Converte o valor para string, pois o `EditableField` espera um `string` para seu `value`.
  const stringValue = String(value);

  // 4. Manipulador de Clique no Item
  //    Esta função lida com cliques no contêiner do item.
  //    Se o item está em modo de edição, ela verifica se o clique ocorreu nos campos editáveis
  //    internos. Se não foi em um campo editável, ela chama `onSelect`, permitindo selecionar o item.
  const handleItemClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing) {
        const targetTagName = (event.target as HTMLElement).tagName.toLowerCase();
        // Verifica se o clique foi em um <input>, <textarea> ou no <span> de exibição de texto do EditableField.
        const isClickOnEditableField = targetTagName === 'input' || targetTagName === 'textarea' || (targetTagName === 'span' && (event.target as HTMLElement).classList.contains('editableField_textDisplay'));

        if (!isClickOnEditableField) {
           onSelect(); // Se o clique não foi em um campo editável, seleciona o item.
        }
    }
  };

  // 5. Manipulador de Foco de Campo do Item
  //    Esta função é passada para os `EditableField`s internos. Quando um deles ganha foco,
  //    ela chama o `onFieldFocus` da prop, passando o elemento focado e o contexto do item.
  const handleItemFieldFocus = (element: HTMLElement) => {
      if (onFieldFocus) {
          // Informa que o foco veio de um 'item' específico usando seu 'id'.
          onFieldFocus(element, { type: 'item', id: id });
      }
  };

  // 6. Estrutura de Renderização do Componente
  return (
    <div
      id={`dossier-item-${id}`} // ID único para o elemento, útil para testes ou automação.
      className={itemClasses} // Classes CSS combinadas.
      onClick={handleItemClick} // Handler para o clique no contêiner do item.
      aria-current={isSelected ? 'true' : undefined} // Atributo ARIA para indicar o item atual/selecionado para leitores de tela.
      style={{ display: 'flex', alignItems: 'center', width: '100%' }} // Estilo inline para layout flexbox.
    >
      {/* Contêiner para o campo de descrição */}
      <div className={descriptionFieldContainerClassName} style={{ flexGrow: 1, width: '100%' }}>
        {/* Componente EditableField para a descrição */}
        <EditableField
          value={description} // Passa a descrição atual.
          isEditing={isEditing} // Controla o modo de edição.
          onChange={onDescriptionChange} // Callback para mudanças na descrição.
          placeholder={descriptionPlaceholder} // Placeholder para o campo.
          ariaLabel={`Descrição para o item ${id}`} // Rótulo de acessibilidade.
          textDisplayClassName={descriptionTextDisplayClassName} // Classe para a exibição de texto.
          inputClassName={descriptionInputClassName} // Classe para o input/textarea.
          onFocus={handleItemFieldFocus} // Passa o handler de foco local.
          onBlur={onFieldBlur} // Passa o handler de desfoque diretamente.
        />
      </div>

      {/* Renderização Condicional do Campo de Valor */}
      {showValueField && (
        <div
          className={valueFieldContainerClassName}
          // Estilos inline para o campo de valor: garante largura mínima, alinhamento à direita e espaçamento.
          style={{ minWidth: '80px', textAlign: 'right', marginLeft: '15px', flexShrink: 0 }}
        >
          {/* Componente EditableField para o valor */}
          <EditableField
            value={stringValue} // Passa o valor (convertido para string).
            isEditing={isEditing} // Controla o modo de edição.
            onChange={onValueChange} // Callback para mudanças no valor.
            placeholder={valuePlaceholder} // Placeholder para o campo.
            ariaLabel={`Valor para o item ${id}`} // Rótulo de acessibilidade.
            textDisplayClassName={valueTextDisplayClassName} // Classe para a exibição de texto.
            inputClassName={valueInputClassName} // Classe para o input.
            onFocus={handleItemFieldFocus} // Passa o handler de foco local.
            onBlur={onFieldBlur} // Passa o handler de desfoque diretamente.
          />
        </div>
      )}
    </div>
  );
};

// 7. Exportação do Componente
//    Permite que o componente `SectionItem` seja importado e usado em outras partes da aplicação.
export default SectionItem;