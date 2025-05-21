// -*- coding: utf-8 -*-
/**
 * @file EmailInput.tsx
 * @description Define o componente EmailInput, um campo de formulário especializado para emails,
 *              baseado no componente BaseInput.
 * @version 1.0
 * @date 02-05-2025
 * @author Pedro
 */

// Diretiva específica do Next.js/React Server Components para indicar que este é um Componente de Cliente.
// Necessário porque ele utiliza o BaseInput, que pode usar hooks de cliente ou ser interativo.
'use client';

import React from 'react';
// Importa o componente base e sua interface de propriedades.
import { BaseInput, BaseInputProps } from './BaseInput';

/**
 * @interface EmailInputProps
 * @description Define as propriedades aceitas pelo componente `EmailInput`.
 * Esta interface herda todas as propriedades de `BaseInputProps`, com exceção das
 * propriedades `type` e `inputMode`. Estas são omitidas porque o `EmailInput`
 * define seus valores fixamente como 'email' para garantir a semântica e
 * otimização corretas para campos de email.
 */
export interface EmailInputProps extends Omit<BaseInputProps, 'type' | 'inputMode'> {
  // Atualmente, não há propriedades adicionais específicas para o EmailInput.
  // Todas as outras props de BaseInput (como label, required, isInvalid,
  // ariaDescribedby, value, onChange, etc.) são aceitas.
}

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
    // `props` recebe todas as propriedades definidas em `EmailInputProps`
    // (ou seja, as de BaseInput exceto type e inputMode).
    props,
    // `ref` é encaminhado do componente pai.
    ref
  ) => {
    // Renderiza o componente BaseInput.
    return (
      <BaseInput
        ref={ref} // Passa a ref recebida para o BaseInput, que a encaminhará ao <input> real.
        type="email"      // Define o tipo do input como 'email'. Essencial para semântica e validação básica.
        inputMode="email" // Otimiza o teclado virtual em dispositivos móveis para entrada de email.
        {...props}        // Espalha todas as outras propriedades recebidas (label, value, onChange, required, isInvalid, etc.)
                          // para o BaseInput. Isso garante que todas as funcionalidades do BaseInput sejam herdadas.
      />
    );
  }
);

// Define um nome de exibição para o componente, útil para depuração no React DevTools.
EmailInput.displayName = 'EmailInput';