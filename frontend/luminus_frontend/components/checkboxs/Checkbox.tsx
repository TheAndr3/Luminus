import React, { useId, forwardRef } from 'react';
import clsx from 'clsx'; // yarn add clsx ou npm install clsx

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'id' | 'size'> {
  /** O conteúdo a ser exibido ao lado do checkbox (pode ser texto ou JSX). */
  label: React.ReactNode;
  /** O estado atual do checkbox (marcado ou não). */
  checked: boolean;
  /** Função chamada quando o estado do checkbox muda. */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** ID opcional para o input e label (um ID será gerado se não fornecido). */
  id?: string;
  /** Classes Tailwind CSS para o container principal do checkbox e label. */
  className?: string;
  /** Classes Tailwind CSS específicas para o elemento <input>. */
  inputClassName?: string;
  /** Classes Tailwind CSS específicas para o elemento <label>. */
  labelClassName?: string;
  /** Desabilita o checkbox. */
  disabled?: boolean;
  /**
   * Define a posição do label em relação ao input.
   * @default 'right'
   */
  labelPosition?: 'right' | 'left' | 'top' | 'bottom';
  // name, value, etc., são herdados de InputHTMLAttributes
}

/**
 * Componente Checkbox individual estilizado com Tailwind CSS.
 * Permite customização de tamanho, aparência e POSIÇÃO DO LABEL via classes e props. // <-- Descrição Atualizada
 * Usa forwardRef para permitir referência direta ao input.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      checked,
      onChange,
      id: propId,
      disabled = false,
      name,
      value,
      className,
      inputClassName,
      labelClassName,
      labelPosition = 'right', // <-- Valor padrão para a nova prop
      ...rest
    },
    ref // Ref encaminhada
  ) => {
    const generatedId = useId();
    const id = propId || generatedId;

    // --- Calcula Classes Dinamicamente ---

    // 1. Classes do Container Principal (controla a direção)
    const containerClasses = clsx(
      'relative flex', // Base flex
      {
        // Direção e Alinhamento baseado na posição
        'flex-row items-center': labelPosition === 'right',
        'flex-row-reverse items-center': labelPosition === 'left',
        'flex-col items-start': labelPosition === 'top', // Label primeiro por padrão em flex-col
        'flex-col-reverse items-start': labelPosition === 'bottom', // Input primeiro em flex-col-reverse
      },
      disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer group', // Estilos de estado
      className // Classes externas
    );

    // 2. Classes do Input
    const inputClasses = clsx(
      // Estilos base (tamanho, borda, cor, foco)
      'h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0',
      'peer', // Para estilizar o label baseado no estado do input
      // Estilos de estado
      disabled
        ? 'cursor-not-allowed opacity-70'
        : 'cursor-pointer hover:border-gray-400',
      inputClassName // Classes externas (permite mudar tamanho, etc.)
    );

    // 3. Classes do Label (controla o espaçamento)
    const labelClasses = clsx(
      'select-none', // Evita seleção de texto
      {
        // Adiciona margem para separar do input
        'ml-2': labelPosition === 'right',
        'mr-2': labelPosition === 'left',
        'mb-1.5': labelPosition === 'top', // Margem abaixo do label quando ele está no topo
        'mt-1.5': labelPosition === 'bottom', // Margem acima do label quando ele está abaixo
      },
      // Estilos de estado (cursor, hover no container)
      disabled
        ? 'cursor-not-allowed'
        : 'cursor-pointer group-hover:text-gray-700',
      // Estilos de foco (anel visual no label quando o input foca)
      'peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-indigo-200 peer-focus:rounded-sm',
      labelClassName // Classes externas
    );

    // --- Renderização ---
    return (
      // Container com classes de direção calculadas
      <div className={containerClasses}>
        {/* Input com suas classes */}
        <input
          ref={ref}
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          name={name}
          value={value}
          aria-checked={checked}
          aria-disabled={disabled}
          className={inputClasses}
          {...rest} // Outras props HTML válidas
        />
        {/* Label com margens e estilos calculados */}
        <label htmlFor={id} className={labelClasses}>
          {label}
        </label>
      </div>
    );
  }
);

// Adiciona um nome de exibição para facilitar a depuração com React DevTools
Checkbox.displayName = 'Checkbox';