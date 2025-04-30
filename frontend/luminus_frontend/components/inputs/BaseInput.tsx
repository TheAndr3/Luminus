'use client';

import React, { useId } from 'react';
import { ErrorContainer } from '@/components/errors/ErrorContainer';
// Removido import não utilizado de ErrorComponentProps se ErrorContainer não exportar
// import { ErrorComponentProps } from '@/types/error';

// Interface BaseInputProps (como antes)
export interface BaseInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  required?: boolean;
  error?: string | null;
  errorDisplayMode?: 'inline' | 'none';
  errorContainerId?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  endAdornment?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  name?: string;
  value?: string | number | readonly string[];
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  autoFocus?: boolean;
}

/**
 * @component BaseInput
 * @description Input genérico. Se errorDisplayMode='inline', SEMPRE renderiza
 * um container abaixo com altura mínima (min-h-5) para o ErrorContainer,
 * prevenindo layout shift. O ErrorContainer interno só mostra texto se 'error' existir.
 * Se 'none', não renderiza o container de erro.
 */
export const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
  (
    {
      label,
      required = false,
      error = null,
      errorDisplayMode = 'inline',
      errorContainerId: providedErrorContainerId,
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      endAdornment = null,
      type = 'text',
      disabled = false,
      id,
      name,
      value,
      onChange,
      placeholder,
      minLength,
      maxLength,
      inputMode,
      autoComplete,
      autoFocus,
    },
    ref
  ) => {
    const uniqueInputId = useId();
    const inputId = id || `input-${uniqueInputId}`;
    const uniqueErrorId = useId();
    const errorId = providedErrorContainerId || `error-${inputId}`;

    const hasEndAdornment = endAdornment !== null;
    const paddingRightClass = hasEndAdornment ? 'pr-10' : 'pr-2.5';

    const shouldRenderErrorSlot = errorDisplayMode === 'inline';

    return (
      // Container principal
      <div className={`${containerClassName}`}>
        {/* Label */}
        <label
          htmlFor={inputId}
          className={`block text-gray-800 text-sm font-semibold mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        {/* Container relativo para input */}
        <div className="relative">
          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            minLength={minLength}
            maxLength={maxLength}
            inputMode={inputMode}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            className={`
              w-full p-2.5 ${paddingRightClass} text-sm
              border ${error ? 'border-red-500' : 'border-gray-300'}
              rounded-md focus:ring-2 focus:ring-green-500
              focus:border-transparent transition
              text-gray-900 font-medium
              ${disabled ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'}
              ${inputClassName}
            `}
            aria-invalid={!!error}
            // Associa ao ID do erro somente se o slot for renderizado E houver erro
            aria-describedby={shouldRenderErrorSlot && !!error ? errorId : undefined}
          />
          {/* Adornment */}
          {hasEndAdornment && React.isValidElement(endAdornment) && (
             <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
               {React.cloneElement(
                   endAdornment as React.ReactElement<{ className?: string }>,
                   { className: `${(endAdornment.props as { className?: string }).className || ''} pointer-events-auto`.trim() }
               )}
             </div>
          )}
        </div>

        {/* Container para o Error - SEMPRE renderizado se inline, com altura mínima */}
        {/* Isso garante que o espaço esteja sempre reservado */}
        {shouldRenderErrorSlot && (
            <div className="w-full min-h-5 pt-0.5"> {/* Reserva espaço */}
                <ErrorContainer
                    id={errorId}
                    message={error} // Passa a mensagem (pode ser null)
                />
            </div>
        )}
        {/* Se errorDisplayMode for 'none', este bloco não é renderizado */}
      </div>
    );
  }
);

BaseInput.displayName = 'BaseInput';