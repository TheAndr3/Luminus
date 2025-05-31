// components/EditableField.tsx
import React from 'react';

interface EditableFieldProps {
  value: string;
  isEditing: boolean;
  onChange: (newValue: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  textDisplayClassName?: string;
  inputClassName?: string;
  textareaClassName?: string;
  ariaLabel?: string;
  // Novos handlers de foco/blur
  onFocus?: (element: HTMLElement) => void;
  onBlur?: () => void;
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
  onFocus, // Recebe handler
  onBlur,  // Recebe handler
}) => {
  const effectiveAriaLabel = ariaLabel || placeholder || 'Campo editável';

  const combinedClassName = (...specificClasses: string[]) => {
    return [className, ...specificClasses].filter(Boolean).join(' ').trim();
  };

  // Handler local para foco que chama o handler externo, passando o elemento
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (onFocus) {
          onFocus(e.target);
      }
  };

  // Handler local para blur que chama o handler externo
  const handleBlur = () => {
      if (onBlur) {
          onBlur();
      }
  };


  if (isEditing) {
    const commonInputProps = {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
      placeholder,
      'aria-label': effectiveAriaLabel,
      onFocus: handleFocus, // Passa o handler local
      onBlur: handleBlur,   // Passa o handler local
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
    return (
      // Span não recebe foco por padrão, então handlers de foco/blur não se aplicam aqui no modo de visualização
      <span
        className={combinedClassName(textDisplayClassName)}
        aria-label={ariaLabel || (value ? undefined : 'Campo vazio')}
      >
        {value}
      </span>
    );
  }
};

export default EditableField;