'use client';

import React from 'react';
import { BaseInput, BaseInputProps } from './BaseInput'; // Importa BaseInput e suas props

/**
 * @interface TextInputProps
 * @description Define as propriedades aceitas pelo componente TextInput.
 * Herda todas as propriedades de BaseInputProps, exceto 'type',
 * pois TextInput é especificamente para entrada de texto.
 */
export interface TextInputProps extends Omit<BaseInputProps, 'type'> {
  // Nenhuma propriedade adicional específica para TextInput no momento.
  // Poderíamos adicionar props específicas de texto aqui no futuro, se necessário.
}

/**
 * @component TextInput
 * @description
 * Componente especializado para entrada de texto simples, construído sobre o BaseInput.
 * Oferece uma interface simplificada para criar campos de texto padrão,
 * herdando todas as funcionalidades de BaseInput (label, erro, required, etc.).
 * O tipo de input é fixado internamente como 'text'.
 *
 * @usage
 * Use este componente para campos de formulário que esperam texto simples.
 *
 * @example
 * <TextInput
 *   label="Nome Completo"
 *   value={userName}
 *   onChange={(e) => setUserName(e.target.value)}
 *   placeholder="Digite seu nome"
 *   required
 *   error={nameError}
 * />
 */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (props, ref) => {
    // Renderiza o BaseInput, passando todas as props recebidas
    // e definindo explicitamente type="text".
    return (
      <BaseInput
        ref={ref}
        type="text" // Garante que este é sempre um input de texto
        {...props}   // Passa todas as outras props (label, value, onChange, error, etc.)
      />
    );
  }
);

TextInput.displayName = 'TextInput'; // Define um nome de exibição para debugging