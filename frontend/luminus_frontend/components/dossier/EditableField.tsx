// components/EditableField.tsx
import React from 'react';

interface EditableFieldProps {
  /** O valor atual do campo. */
  value: string;
  /** Se true, renderiza um campo de input/textarea. Se false, renderiza texto estático. */
  isEditing: boolean;
  /** Função chamada quando o valor do input/textarea muda. */
  onChange: (newValue: string) => void;
  /** Texto de placeholder para o input/textarea. */
  placeholder?: string;
  /** Se true e isEditing é true, renderiza um <textarea>. Caso contrário, um <input type="text">. */
  multiline?: boolean;

  /** Classe CSS genérica aplicada ao elemento raiz (span, input ou textarea). */
  className?: string;
  /** Classe CSS específica aplicada ao elemento de texto (span) quando isEditing é false. */
  textDisplayClassName?: string;
  /** Classe CSS específica aplicada ao elemento input (type="text") quando isEditing é true e multiline é false. */
  inputClassName?: string;
  /** Classe CSS específica aplicada ao elemento textarea quando isEditing é true e multiline é true. */
  textareaClassName?: string;
  /**
   * Rótulo ARIA para acessibilidade. Se não fornecido, o placeholder será usado como fallback
   * para campos de edição, ou um rótulo genérico.
   */
  ariaLabel?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  isEditing,
  onChange,
  placeholder = '',
  multiline = false,
  className = '',
  textDisplayClassName = '',
  inputClassName = '',
  textareaClassName = '',
  ariaLabel,
}) => {
  const effectiveAriaLabel = ariaLabel || placeholder || 'Campo editável';

  const combinedClassName = (...specificClasses: string[]) => {
    return [className, ...specificClasses].filter(Boolean).join(' ').trim();
  };

  if (isEditing) {
    const commonInputProps = {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
      placeholder,
      'aria-label': effectiveAriaLabel,
    };

    if (multiline) {
      return (
        <textarea
          {...commonInputProps}
          className={combinedClassName(textareaClassName)}
        />
      );
    } else {
      return (
        <input
          type="text"
          {...commonInputProps}
          className={combinedClassName(inputClassName)}
        />
      );
    }
  } else {
    // No modo de visualização, não mostramos o placeholder.
    // Se o valor for uma string vazia, o span estará vazio,
    // permitindo estilização via CSS (e.g., :empty selector).
    return (
      <span
        className={combinedClassName(textDisplayClassName)}
        aria-label={ariaLabel || (value ? undefined : 'Campo vazio')} // Opcional: dar um label se vazio
      >
        {value}
      </span>
    );
  }
};

export default EditableField;