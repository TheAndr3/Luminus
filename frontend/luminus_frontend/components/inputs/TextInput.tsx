// -*- coding: utf-8 -*-
/**
 * @file TextInput.tsx
 * @description Define o componente TextInput, um campo de formulário genérico para texto simples,
 *              baseado no componente BaseInput.
 * @version 1.0
 * @date 02-05-2025
 * @author Pedro
 */

// Diretiva específica do Next.js/React Server Components para indicar que este é um Componente de Cliente.
// Necessário porque ele utiliza o BaseInput, que pode ser interativo.
'use client';

import React from 'react';
// Importa o componente base e sua interface de propriedades.
import { BaseInput, BaseInputProps } from './BaseInput';

/**
 * @interface TextInputProps
 * @description Define as propriedades aceitas pelo componente `TextInput`.
 * Esta interface herda todas as propriedades de `BaseInputProps`, com exceção da
 * propriedade `type`. Esta é omitida porque o `TextInput` define seu valor
 * fixamente como 'text' para garantir que ele funcione como um campo de texto padrão.
 */
export interface TextInputProps extends Omit<BaseInputProps, 'type'> {
  // Nenhuma propriedade adicional específica para TextInput neste momento.
  // Todas as outras props de BaseInput (como label, required, isInvalid, value,
  // onChange, placeholder, ariaDescribedby, etc.) são aceitas e repassadas.
}

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
    // `props` recebe todas as propriedades definidas em `TextInputProps`
    // (ou seja, as de BaseInput exceto 'type').
    props,
    // `ref` é encaminhado do componente pai.
    ref
  ) => {
    // Renderiza o componente BaseInput.
    return (
      <BaseInput
        ref={ref} // Passa a ref recebida para o BaseInput.
        type="text" // Define explicitamente o tipo do input como 'text'.
        {...props}   // Espalha todas as outras propriedades recebidas (label, value, onChange, required,
                     // isInvalid, ariaDescribedby, placeholder, etc.) para o BaseInput.
                     // Isso garante que todas as funcionalidades e configurações do BaseInput sejam aplicadas.
      />
    );
  }
);

// Define um nome de exibição para o componente, útil para depuração no React DevTools.
TextInput.displayName = 'TextInput';