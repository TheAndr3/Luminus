'use client';

import React, { useId } from 'react';
// ErrorContainer não é mais necessário aqui

export interface BaseInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'aria-describedby'> { // Removido error, errorDisplayMode, errorContainerId de Omit se estavam lá
  label: string;
  required?: boolean;
  // error?: string | null; // Alternativa: manter error para passar a info, mas não usar para renderizar container
  isInvalid?: boolean; // Nova prop para indicar estado inválido (influencia estilo e aria-invalid)
  ariaDescribedby?: string; // Nova prop para linkar com a mensagem de erro externa
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  endAdornment?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string; // É crucial que um ID seja fornecido ou gerado para label[for] e aria-describedby
  // ... outras props como name, value, placeholder, type, disabled etc. permanecem
}

/**
 * @component BaseInput
 * @description Input genérico SIMPLIFICADO. Não lida mais com a exibição
 * de mensagens de erro. Recebe 'isInvalid' para aplicar estilos de erro
 * e 'ariaDescribedby' para acessibilidade, que deve ser gerenciado pelo componente pai.
 */
export const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
  (
    {
      label,
      required = false,
      isInvalid = false, // Usar isInvalid
      ariaDescribedby,   // Usar ariaDescribedby
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      endAdornment = null,
      type = 'text',
      disabled = false,
      id,
      // ... resto das props
      ...rest // Pegar o resto das props nativas do input
    },
    ref
  ) => {
    const uniqueInputId = useId();
    // Garante que sempre haja um ID para o label e para o pai usar no aria-describedby
    const inputId = id || `input-${uniqueInputId}`;

    const hasEndAdornment = endAdornment !== null;
    const paddingRightClass = hasEndAdornment ? 'pr-10' : 'pr-2.5';

    return (
      <div className={`${containerClassName}`}>
        <label
          htmlFor={inputId} // Usa o ID garantido
          className={`block text-gray-800 text-sm font-semibold mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={inputId} // Usa o ID garantido
            type={type}
            required={required}
            disabled={disabled}
            className={`
              w-full p-2.5 ${paddingRightClass} text-sm
              border ${isInvalid ? 'border-red-500' : 'border-gray-300'} // Usa isInvalid para a borda
              rounded-md focus:ring-2 focus:ring-green-500
              focus:border-transparent transition
              text-gray-900 font-medium
              ${disabled ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'}
              ${inputClassName}
            `}
            aria-invalid={isInvalid} // Usa isInvalid
            aria-describedby={ariaDescribedby} // Usa a prop passada
            {...rest} // Passa o resto das props (value, onChange, placeholder etc.)
          />
          {/* Adornment (lógica mantida) */}
          {hasEndAdornment && React.isValidElement(endAdornment) && (
             <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
               {React.cloneElement(
                   endAdornment as React.ReactElement<{ className?: string }>,
                   { className: `${(endAdornment.props as { className?: string }).className || ''} pointer-events-auto`.trim() }
               )}
             </div>
          )}
        </div>
      </div>
    );
  }
);

BaseInput.displayName = 'BaseInput';