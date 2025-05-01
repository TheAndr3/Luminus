'use client';

import React from 'react';
import { BaseInput, BaseInputProps } from './BaseInput'; // Importa BaseInput e suas props

/**
 * @interface EmailInputProps
 * @description Define as propriedades aceitas pelo componente EmailInput.
 * Herda todas as propriedades de BaseInputProps, exceto 'type' e 'inputMode',
 * pois EmailInput é especificamente para entrada de email e define esses atributos internamente.
 */
export interface EmailInputProps extends Omit<BaseInputProps, 'type' | 'inputMode'> {
  // Nenhuma propriedade adicional específica para EmailInput no momento.
}

/**
 * @component EmailInput
 * @description
 * Componente especializado para entrada de endereços de email, construído sobre o BaseInput.
 * Oferece uma interface simplificada para criar campos de email, herdando todas as
 * funcionalidades de BaseInput (label, erro, required, etc.).
 * O tipo de input é fixado internamente como 'email' e o inputMode como 'email'
 * para otimizar a experiência em dispositivos móveis.
 *
 * @usage
 * Use este componente para campos de formulário que esperam um endereço de email.
 * A validação de formato de email geralmente é feita pelo navegador ou no backend.
 *
 * @example
 * <EmailInput
 *   label="Endereço de Email"
 *   value={userEmail}
 *   onChange={(e) => setUserEmail(e.target.value)}
 *   placeholder="seuemail@exemplo.com"
 *   required
 *   error={emailError}
 * />
 */
export const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  (props, ref) => {
    // Renderiza o BaseInput, passando todas as props recebidas
    // e definindo explicitamente type="email" e inputMode="email".
    return (
      <BaseInput
        ref={ref}
        type="email"      // Garante que este é sempre um input de email
        inputMode="email" // Otimiza o teclado virtual em dispositivos móveis
        {...props}        // Passa todas as outras props (label, value, onChange, error, etc.)
      />
    );
  }
);

EmailInput.displayName = 'EmailInput'; // Define um nome de exibição para debugging