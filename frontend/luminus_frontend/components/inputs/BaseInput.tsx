// -*- coding: utf-8 -*-
/**
 * @file BaseInput.tsx
 * @description Este arquivo define o componente BaseInput, um input de formulário genérico e reutilizável.
 * @version 1.0
 * @date 02-05-2025
 * @author Pedro
 */

// Diretiva específica do Next.js/React Server Components para indicar que este é um Componente de Cliente.
// Necessário para usar hooks como useId e para interatividade no navegador.
'use client';

import React, { useId } from 'react';

/**
 * @interface BaseInputProps
 * @description Define as propriedades aceitas pelo componente BaseInput.
 * Herda a maioria dos atributos de um <input> HTML padrão, mas omite alguns
 * para controle interno ou gerenciamento pelo componente pai.
 */
export interface BaseInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>,
  // Omitimos 'onChange' para fornecer uma tipagem mais específica abaixo.
  'onChange' |
  // Omitimos 'aria-describedby' pois ele é gerenciado explicitamente pela prop `ariaDescribedby`.
  'aria-describedby'
> {
  /** Texto a ser exibido como label acima do campo de input. Opcional. */
  label?: string;

  /** Indica se o campo é obrigatório. Adiciona um asterisco visual ao label e o atributo `required` ao input. Padrão: false. */
  required?: boolean;

  /** Indica se o input deve ser estilizado como inválido (ex: borda vermelha) e define `aria-invalid="true"`. Padrão: false. */
  isInvalid?: boolean;

  /** ID do elemento externo (geralmente uma mensagem de erro) que descreve este input. Essencial para acessibilidade (liga via `aria-describedby`). */
  ariaDescribedby?: string;

  /** Classes CSS adicionais para aplicar ao container `div` principal do componente. */
  containerClassName?: string;

  /** Classes CSS adicionais para aplicar ao elemento `label`. */
  labelClassName?: string;

  /** Classes CSS adicionais para aplicar ao elemento `input`. */
  inputClassName?: string;

  /** Um elemento React (como um ícone) a ser exibido no final (à direita) dentro do campo de input. */
  endAdornment?: React.ReactNode;

  /** Função callback chamada quando o valor do input é alterado. Recebe o evento `ChangeEvent` do React. */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /** ID explícito para o elemento `input`. Se não fornecido, um ID único será gerado automaticamente usando `useId`. Importante para o `label[for]` e `aria-describedby`. */
  id?: string;

  // Nota: Todas as outras props padrão de <input> como `name`, `value`, `placeholder`, `type`, `disabled`, etc.,
  // são aceitas através do operador `...rest`.
}

/**
 * @component BaseInput
 * @description Um componente de input genérico e estilizado.
 *
 * Este componente fornece a estrutura básica de um campo de input com label,
 * indicação de obrigatoriedade, estado de erro visual (`isInvalid`), e suporte
 * para um adorno no final (ex: ícone).
 *
 * **Importante:** Este componente *não* renderiza mensagens de erro. Ele apenas
 * aplica estilos de erro (via `isInvalid`) e permite a ligação com uma mensagem
 * de erro externa através da prop `ariaDescribedby` para acessibilidade.
 * A lógica de validação e exibição da mensagem de erro deve ser gerenciada
 * pelo componente pai ou por um componente wrapper (ex: `FormField`).
 *
 * Utiliza `React.forwardRef` para permitir que componentes pais obtenham uma
 * referência direta ao elemento `<input>` interno.
 */
export const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
  (
    {
      // Desestruturação das props com valores padrão
      label,
      required = false,
      isInvalid = false,
      ariaDescribedby,
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      endAdornment = null,
      type = 'text', // Valor padrão para o tipo de input
      disabled = false,
      id, // ID explícito vindo das props
      // `...rest` captura todas as outras props não desestruturadas (ex: value, placeholder, name, onBlur, etc.)
      ...rest
    },
    // `ref` é o segundo argumento fornecido pelo `React.forwardRef`
    ref
  ) => {
    // Gera um ID único usando o hook `useId`. Usado como fallback se nenhum `id` for passado via props.
    // Garante que sempre haverá um ID para associar o label ao input (`htmlFor`).
    const uniqueInputId = useId();
    // Prioriza o ID fornecido via props, caso contrário, usa o ID gerado.
    const inputId = id || `input-${uniqueInputId}`;

    // Verifica se o adorno final foi fornecido e é um elemento React válido.
    const hasEndAdornment = endAdornment !== null && React.isValidElement(endAdornment);
    // Define a classe de padding direito do input com base na presença do adorno.
    // 'pr-10' (padding right 40px) se houver adorno, 'pr-2.5' (padding right 10px) se não houver.
    const paddingRightClass = hasEndAdornment ? 'pr-10' : 'pr-2.5';

    return (
      // Container principal do componente. Aplica classes CSS customizadas se fornecidas.
      <div className={`${containerClassName}`}>
        {/* Renderiza o label apenas se a prop `label` for fornecida. */}
        {label && (
          <label
            htmlFor={inputId} // Associa o label ao input usando o ID. Essencial para acessibilidade.
            className={`block text-gray-800 text-sm font-semibold mb-1 ${labelClassName}`}
          >
            {label}
            {/* Adiciona um asterisco vermelho se o campo for obrigatório. */}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}

        {/* Container relativo para posicionar o adorno final, se existir. */}
        <div className="relative">
          {/* O elemento input real. */}
          <input
            ref={ref} // Encaminha a ref para o elemento input DOM.
            id={inputId} // Define o ID do input.
            type={type} // Define o tipo do input (text, password, email, etc.).
            required={required} // Adiciona o atributo HTML `required`.
            disabled={disabled} // Adiciona o atributo HTML `disabled`.
            className={`
              w-full p-2.5 ${paddingRightClass} text-sm outline-none  /* Estilos base e padding direito ajustado */
              border ${isInvalid ? 'border-red-500' : 'border-gray-300'} /* Borda vermelha se inválido, cinza caso contrário */
              rounded-full focus:ring-2 focus:ring-green-500 /* Arredondamento e anel de foco verde */
              focus:border-transparent transition                  /* Transição suave e borda transparente no foco */
              text-gray-900 font-medium                          /* Cor e peso da fonte do texto digitado */
              py-2
              px-4
              ${disabled ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'} /* Estilos para estado desabilitado */
              ${inputClassName}                                  /* Aplica classes CSS customizadas ao input */
            `}
            // Atributos de acessibilidade:
            aria-invalid={isInvalid} // Indica a leitores de tela se o campo é inválido.
            aria-describedby={ariaDescribedby} // Associa o input à sua descrição (mensagem de erro externa).
            // Espalha todas as outras props restantes (value, onChange, placeholder, name, onBlur, etc.) no input.
            {...rest}
          />

          {/* Renderiza o adorno final se ele existir. */}
          {hasEndAdornment && (
             // Container para posicionar o adorno dentro do input, à direita.
             <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
               {/* Clona o elemento React do adorno. Isso é feito para potencialmente adicionar/modificar props.
                   Aqui, garantimos que o adorno permita eventos de clique/mouse ('pointer-events-auto')
                   enquanto o container (`div` acima) os bloqueia ('pointer-events-none') para não interferir
                   com o clique no input. Preserva classes existentes no adorno. */}
               {React.cloneElement(
                   // Tipagem para garantir que é um ReactElement com props que podem incluir className.
                   endAdornment as React.ReactElement<{ className?: string }>,
                   // Novas props para o elemento clonado:
                   {
                     // Concatena a classe 'pointer-events-auto' com quaisquer classes que o adorno já possua.
                     className: `${(endAdornment.props as { className?: string }).className || ''} pointer-events-auto`.trim()
                   }
               )}
             </div>
          )}
        </div>
        {/* Nota: A mensagem de erro NÃO é renderizada aqui. Deve ser gerenciada pelo componente pai. */}
      </div>
    );
  }
);

// Define um nome de exibição para o componente. Útil para depuração com as React DevTools.
BaseInput.displayName = 'BaseInput';