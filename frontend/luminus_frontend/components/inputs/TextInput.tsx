// -*- coding: utf-8 -*-
/**
 * @file TextInput.tsx
 * @description Define o componente TextInput, um campo de formulário genérico para texto simples,
 *              baseado no componente BaseInput.
 * @version 1.0
 * @date 29-06-2025
 * @author Pedro
 */

'use client';

import React from 'react';
import { BaseInput, BaseInputProps } from './BaseInput';

/**
 * @type TextInputProps
 * @description Define as propriedades aceitas pelo componente `TextInput`.
 * Este tipo utiliza Omit para herdar todas as propriedades de `BaseInputProps`, com exceção da
 * propriedade `type`, que é fixada como 'text'.
 */
// CORREÇÃO: A declaração foi alterada de 'interface' para 'type' para resolver o erro do ESLint.
export type TextInputProps = Omit<BaseInputProps, 'type'>;

/**
 * @component TextInput
 * @description
 * Componente especializado para a entrada de texto genérico, construído sobre o `BaseInput`.
 *
 * Simplifica a criação de campos de formulário de texto padrão, herdando automaticamente
 * todas as funcionalidades e estilos do `BaseInput`, como `label`, `required`, estado
 * de erro visual (`isInvalid`), acessibilidade (`ariaDescribedby`), e adornos (se passados).
 *
 * Internamente, este componente simplesmente define `type="text"`. Não adiciona nenhuma
 * lógica de validação ou formatação específica além do que o `BaseInput` já oferece.
 *
 * **Gerenciamento de Erro:**
 * Segue o padrão do `BaseInput`. Não realiza validações internas nem possui a callback `onErrorChange`.
 * O componente pai é responsável por:
 * 1. Realizar qualquer validação necessária para o texto (ex: comprimento mínimo/máximo, formato específico).
 * 2. Determinar se há um erro.
 * 3. Passar a prop `isInvalid={true/false}` para controle visual.
 * 4. Passar a prop `ariaDescribedby` apontando para o ID da mensagem de erro.
 * 5. Renderizar a mensagem de erro externamente.
 *
 * @usage
 * Ideal para campos de formulário que esperam entrada de texto simples, como nomes,
 * assuntos, títulos, ou qualquer outro texto sem formatação específica.
 *
 * @example - Como usar com gerenciamento de erro simples no pai:
 * ```jsx
 * const ParentComponent = () => {
 *   const [name, setName] = useState('');
 *   const [nameError, setNameError] = useState<string | null>(null);
 *   const nameErrorId = 'name-error-msg';
 *
 *   const validateName = (currentName: string) => {
 *     if (currentName.trim().length === 0) {
 *       return "Nome é obrigatório.";
 *     }
 *     if (currentName.length > 50) {
 *       return "Nome não pode exceder 50 caracteres.";
 *     }
 *     return null;
 *   };
 *
 *   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *     const newName = e.target.value;
 *     setName(newName);
 *     setNameError(validateName(newName)); // Valida ao digitar
 *   };
 *
 *   return (
 *     <div>
 *       <TextInput
 *         label="Nome do Projeto"
 *         name="project_name"
 *         value={name}
 *         onChange={handleChange}
 *         placeholder="Digite o nome do projeto"
 *         required // A validação de obrigatoriedade é feita no pai neste exemplo
 *         isInvalid={!!nameError} // Define se há erro visual
 *         ariaDescribedby={nameError ? nameErrorId : undefined} // Associa com a mensagem de erro
 *       />
 *       {nameError && ( // Renderiza a mensagem de erro externamente
 *         <p id={nameErrorId} className="text-red-600 text-xs mt-1">
 *           {nameError}
 *         </p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    props,
    ref
  ) => {
    return (
      <BaseInput
        ref={ref}
        type="text"
        {...props}
      />
    );
  }
);

TextInput.displayName = 'TextInput';