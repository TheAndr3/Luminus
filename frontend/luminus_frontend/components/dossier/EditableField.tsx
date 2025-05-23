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
    return (
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