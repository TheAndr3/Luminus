// components/EditableField.tsx
import React from 'react'; // Importa a biblioteca React, essencial para criar componentes.

// 1. Definição das Propriedades (Props)
//    Esta interface define os tipos de dados que o componente `EditableField` espera receber
//    como propriedades para funcionar corretamente.
interface EditableFieldProps {
  value: string; // O valor atual do campo (seja em modo de exibição ou edição).
  isEditing: boolean; // Um booleano que indica se o campo está em modo de edição (true) ou apenas exibição (false).
  onChange: (newValue: string) => void; // Uma função de callback que é chamada quando o valor do campo muda (apenas em modo de edição).
  placeholder?: string; // Texto de sugestão exibido quando o campo de entrada está vazio (opcional).
  multiline?: boolean; // Booleano que, se verdadeiro, renderiza um <textarea> para múltiplas linhas; caso contrário, um <input>. (opcional)
  className?: string; // Classe CSS geral aplicada ao contêiner ou elemento principal do campo. (opcional)
  textDisplayClassName?: string; // Classe CSS específica para o elemento <span> que exibe o texto quando NÃO está editando. (opcional)
  inputClassName?: string; // Classe CSS específica para o elemento <input> quando está editando e não é multiline. (opcional)
  textareaClassName?: string; // Classe CSS específica para o elemento <textarea> quando está editando e é multiline. (opcional)
  ariaLabel?: string; // Rótulo de acessibilidade (ARIA) para leitores de tela. Ajuda na compreensão do campo. (opcional)
  onFocus?: (element: HTMLElement) => void; // Função de callback chamada quando o campo ganha foco. Recebe o elemento HTML focado. (opcional)
  onBlur?: () => void; // Função de callback chamada quando o campo perde o foco. (opcional)
}

// 2. Definição do Componente Funcional EditableField
//    Este é o componente React funcional principal.
const EditableField: React.FC<EditableFieldProps> = ({
  value,
  isEditing,
  onChange,
  placeholder = '', // Valor padrão para placeholder se não for fornecido.
  multiline = false, // Valor padrão para multiline se não for fornecido.
  className = '', // Valor padrão para className.
  textDisplayClassName = '', // Valor padrão para textDisplayClassName.
  inputClassName = '', // Valor padrão para inputClassName.
  textareaClassName = '', // Valor padrão para textareaClassName.
  ariaLabel, // Sem valor padrão, pois pode ser derivado ou deixado vazio.
  onFocus,
  onBlur,
}) => {
  // 3. Lógica para o Rótulo de Acessibilidade (ARIA)
  //    Garante que sempre haverá um rótulo de acessibilidade, priorizando o `ariaLabel` fornecido,
  //    caindo para o `placeholder`, ou usando um rótulo genérico se ambos estiverem ausentes.
  const effectiveAriaLabel = ariaLabel || placeholder || 'Campo editável';

  // 4. Função Utilitária para Combinar Classes CSS
  //    Esta função ajuda a concatenar e limpar as classes CSS,
  //    garantindo que classes vazias não resultem em espaços extras.
  const combinedClassName = (...specificClasses: string[]) => {
    // Filtra para remover classes vazias e une as restantes com um espaço.
    return [className, ...specificClasses].filter(Boolean).join(' ').trim();
  };

  // 5. Funções de Manipulação de Foco e Desfoque
  //    Estas funções encapsulam as callbacks `onFocus` e `onBlur` passadas via props,
  //    garantindo que só sejam chamadas se forem realmente fornecidas.
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (onFocus) {
          onFocus(e.target); // Chama a função onFocus da prop, passando o elemento DOM focado.
      }
  };

  const handleBlur = () => {
      if (onBlur) {
          onBlur(); // Chama a função onBlur da prop.
      }
  };

  // 6. Renderização Condicional
  //    A lógica principal do componente: decide o que renderizar com base na prop `isEditing`.
  if (isEditing) {
    // Se `isEditing` for verdadeiro, renderiza um campo de entrada (input ou textarea).

    // Propriedades comuns a ambos <input> e <textarea>
    const commonInputProps = {
      value, // O valor atual do campo.
      // Handler para o evento `onChange`: atualiza o valor via prop `onChange`.
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
      placeholder, // Texto de sugestão.
      'aria-label': effectiveAriaLabel, // Rótulo de acessibilidade.
      onFocus: handleFocus, // Handler de foco.
      onBlur: handleBlur,   // Handler de desfoque.
    };

    if (multiline) {
      // Se `multiline` for verdadeiro, renderiza um <textarea> para entrada de texto de várias linhas.
      return (
        <textarea
          {...commonInputProps} // Aplica todas as props comuns.
          className={combinedClassName(textareaClassName)} // Combina a classe geral com a classe específica para textarea.
        />
      );
    } else {
      // Se `multiline` for falso, renderiza um <input type="text"> para entrada de texto de linha única.
      return (
        <input
          type="text" // Define o tipo do input como texto.
          {...commonInputProps} // Aplica todas as props comuns.
          className={combinedClassName(inputClassName)} // Combina a classe geral com a classe específica para input.
        />
      );
    }
  } else {
    // Se `isEditing` for falso, renderiza um <span> para exibir o valor como texto simples.
    return (
      <span
        className={combinedClassName(textDisplayClassName)} // Combina a classe geral com a classe específica para exibição de texto.
        // Define o rótulo de acessibilidade. Se o campo estiver vazio, informa que está "Campo vazio".
        aria-label={ariaLabel || (value ? undefined : 'Campo vazio')}
      >
        {value} {/* Exibe o valor do campo. */}
      </span>
    );
  }
};

// 7. Exportação do Componente
//    Permite que o componente `EditableField` seja importado e usado em outras partes da aplicação.
export default EditableField;