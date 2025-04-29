'use client';

import React from 'react';

/**
 * @interface BaseInputProps
 * @description Define as propriedades aceitas pelo componente BaseInput.
 * Estende as propriedades padrão do input HTML, omitindo 'onChange' para definir um tipo mais específico.
 */
export interface BaseInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Texto do label acima do input. */
  label: string;
  /**
   * (Opcional) Adiciona '*' ao label e atributo `required` no input.
   * @default false
   */
  required?: boolean;
  /**
   * (Opcional) Mensagem de erro a ser exibida. Aplica estilo de erro.
   * @default null
   */
  error?: string | null;
  /**
   * (Opcional) Classes CSS adicionais para o container principal (div externo).
   * Útil para layout (largura, margens externas).
   * @default ''
   */
  containerClassName?: string;
  /**
   * (Opcional) Classes CSS (ex: Tailwind) a serem adicionadas ao elemento `<label>`.
   * @default ''
   */
  labelClassName?: string;
  /**
   * (Opcional) Classes CSS (ex: Tailwind) a serem adicionadas ao elemento `<input>`.
   * @default ''
   */
  inputClassName?: string;
  /**
   * (Opcional) Elemento React a ser renderizado no final do input (ex: ícone, botão).
   * Deve ser um elemento que aceite a prop `className`.
   * @default null
   */
  endAdornment?: React.ReactNode;
  /**
   * Callback chamado na mudança do input.
   * Recebe o evento original do React.
   */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * @component BaseInput
 * @description
 * Componente de input genérico e reutilizável para formulários.
 * Suporta label, required, error, customização de classes CSS,
 * adornments no final do input, e todas as props padrão de um input HTML.
 * É um componente controlado, onde o valor é gerenciado pelo componente pai.
 *
 * @usage
 * Use este componente como base para criar inputs customizados.
 * Passe as props necessárias para controlar o estado e a aparência.
 *
 * @example
 * <BaseInput
 *   label="Nome"
 *   value={nome}
 *   onChange={(e) => setNome(e.target.value)}
 *   required
 * />
 */
export const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
  (
    {
      label,
      required = false,
      error = null,
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      endAdornment = null,
      type = 'text',
      disabled = false,
      value,
      onChange,
      placeholder,
      minLength,
      maxLength,
      inputMode,
      id,
      name,
      ...restInputProps
    },
    ref
  ) => {
    // Gera um ID único para o input, usado para associar o label
    const uniqueId = React.useId();
    const inputId = id || `input-${uniqueId}`;

    // Verifica se há um adornment no final
    const hasEndAdornment = endAdornment !== null;

    // Ajusta o padding direito do input para acomodar o adornment
    const paddingRightClass = hasEndAdornment ? 'pr-10' : 'pr-2.5';

    return (
      <div className={`mb-2 ${containerClassName}`}>
        {/* Label com indicação visual de campo obrigatório */}
        <label
          htmlFor={inputId}
          className={`block text-gray-800 text-sm font-semibold mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        {/* Container relativo para posicionar o adornment */}
        <div className="relative">
          {/* Elemento input com props dinâmicas */}
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
            className={`
              w-full p-2.5 ${paddingRightClass} text-sm
              border ${error ? 'border-red-500' : 'border-gray-300'}
              rounded-md focus:ring-2 focus:ring-green-500
              focus:border-transparent transition
              text-gray-900 font-medium
              ${disabled ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'}
              ${inputClassName}
            `}
            {...restInputProps} // Passa quaisquer outras props HTML para o input
          />

          {/* Adornment no final, se fornecido */}
          {hasEndAdornment && React.isValidElement(endAdornment) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {React.cloneElement(
                endAdornment as React.ReactElement<{ className?: string }>,
                {
                  className: `${
                    (endAdornment.props as { className?: string }).className || ''
                  } pointer-events-auto`.trim(),
                }
              )}
            </div>
          )}
        </div>

        {/* Mensagem de erro, exibida apenas se 'error' for fornecido */}
        {error && (
          <div className="mt-0.5">
            <p className="text-red-500 text-xs">{error}</p>
          </div>
        )}
      </div>
    );
  }
);

BaseInput.displayName = 'BaseInput';