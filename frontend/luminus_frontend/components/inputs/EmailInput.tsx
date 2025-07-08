// -*- coding: utf-8 -*-
/**
 * @file EmailInput.tsx
 * @description Define o componente EmailInput, um campo de formulário especializado para emails,
 *              baseado no componente BaseInput.
 * @version 1.0
 * @date 29-06-2025
 * @author Pedro
 */

'use client';

import React from 'react';
import { BaseInput, BaseInputProps } from './BaseInput';

/**
 * @type EmailInputProps
 * @description Define as propriedades aceitas pelo componente `EmailInput`.
 * Este tipo utiliza Omit para herdar todas as propriedades de `BaseInputProps`, com exceção das
 * propriedades `type` e `inputMode`, que são fixadas para otimizar campos de email.
 */
// CORREÇÃO: A declaração foi alterada de 'interface' para 'type' para resolver o erro do ESLint.
export type EmailInputProps = Omit<BaseInputProps, 'type' | 'inputMode'>;

/**
 * @component EmailInput
 * @description
 * Componente especializado para a entrada de endereços de email, construído sobre o `BaseInput`.
 *
 * Simplifica a criação de campos de formulário destinados a emails, herdando automaticamente
 * todas as funcionalidades e estilos do `BaseInput`, como `label`, `required`, estado
 * de erro visual (`isInvalid`), acessibilidade (`ariaDescribedby`), e adornos.
 *
 * Internamente, este componente define `type="email"` e `inputMode="email"`.
 * - `type="email"`: Habilita validações básicas do navegador e pode influenciar
 *   teclados virtuais em alguns dispositivos.
 * - `inputMode="email"`: Sugere explicitamente aos dispositivos móveis que exibam um
 *   teclado otimizado para digitação de emails (geralmente incluindo '@' e '.').
 *
 * @usage
 * Ideal para qualquer campo de formulário onde o usuário deva inserir um endereço de email.
 * A validação mais robusta do formato do email deve ser feita preferencialmente no backend
 * ou com bibliotecas de validação no frontend, embora `type="email"` ofereça uma
 * validação básica no navegador.
 *
 * @example - Como usar dentro de um componente pai que gerencia estado e erro:
 * ```jsx
 * const [email, setEmail] = useState('');
 * const [emailError, setEmailError] = useState<string | null>(null);
 * const emailErrorId = 'email-error-msg';
 *
 * // ... lógica que valida o email e define `emailError` ...
 *
 * return (
 *   <div>
 *     <EmailInput
 *       label="Seu Melhor Email"
 *       name="user_email" // Boa prática ter um 'name' para submissão de formulário
 *       value={email}
 *       onChange={(e) => {
 *         setEmail(e.target.value);
 *         if (emailError) setEmailError(null); // Limpa erro ao digitar
 *       }}
 *       placeholder="nome@dominio.com"
 *       required
 *       isInvalid={!!emailError} // Define se há erro visualmente
 *       ariaDescribedby={emailError ? emailErrorId : undefined} // Associa com a mensagem de erro
 *     />
 *     {emailError && (
 *       <p id={emailErrorId} className="text-red-600 text-xs mt-1">
 *         {emailError}
 *       </p>
 *     )}
 *   </div>
 * );
 * ```
 */
export const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  (
    props,
    ref
  ) => {
    return (
      <BaseInput
        ref={ref}
        type="email"
        inputMode="email"
        {...props}
      />
    );
  }
);

EmailInput.displayName = 'EmailInput';