'use client';

import React, { useState } from 'react';
import { BaseInput, BaseInputProps } from './BaseInput'; // Importa BaseInput e suas props
import { Eye, EyeOff } from 'react-feather'; // Ícones para o toggle (instale com: npm install react-feather)

/**
 * @interface PasswordInputProps
 * @description Define as propriedades aceitas pelo componente PasswordInput.
 * Herda todas as propriedades de BaseInputProps, exceto 'type', 'inputMode', e 'endAdornment',
 * pois PasswordInput gerencia esses atributos internamente para sua funcionalidade específica.
 */
export interface PasswordInputProps extends Omit<BaseInputProps, 'type' | 'inputMode' | 'endAdornment'> {
  /**
   * (Opcional) Texto para o aria-label do botão de mostrar senha.
   * @default "Mostrar senha"
   */
  showPasswordLabel?: string;
  /**
   * (Opcional) Texto para o aria-label do botão de ocultar senha.
   * @default "Ocultar senha"
   */
  hidePasswordLabel?: string;
  /**
   * (Opcional) Classes CSS adicionais para o ícone de toggle.
   * @default 'h-5 w-5 text-gray-400'
   */
  iconClassName?: string;
}

/**
 * @component PasswordInput
 * @description
 * Componente especializado para entrada de senhas, construído sobre o BaseInput.
 * Inclui um botão de toggle (ícone de olho) para mostrar/ocultar a senha digitada.
 * Herda as funcionalidades de BaseInput (label, erro, required, etc.).
 * O tipo de input alterna entre 'password' e 'text' com base no estado de visibilidade.
 *
 * @usage
 * Use este componente para campos de senha em formulários.
 *
 * @example
 * <PasswordInput
 *   label="Senha"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 *   placeholder="Digite sua senha"
 *   required
 *   error={passwordError}
 * />
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      showPasswordLabel = "Mostrar senha",
      hidePasswordLabel = "Ocultar senha",
      iconClassName = 'h-5 w-5 text-gray-400', // Estilo padrão do ícone
      disabled, // Pega o disabled das props
      ...restProps // Pega todas as outras props de BaseInputProps (exceto as omitidas)
    },
    ref
  ) => {
    // Estado para controlar a visibilidade da senha
    const [showPassword, setShowPassword] = useState(false);

    /** Alterna a visibilidade da senha */
    const togglePasswordVisibility = () => {
      // Só alterna se o input não estiver desabilitado
      if (!disabled) {
        setShowPassword((prev) => !prev);
      }
    };

    // Determina o tipo de input a ser passado para BaseInput
    const inputType = showPassword ? 'text' : 'password';

    // Cria o elemento do botão de toggle (ícone)
    const toggleButton = (
      <button
        type="button" // Importante para não submeter o formulário
        onClick={togglePasswordVisibility}
        // Desabilita o botão se o input estiver desabilitado
        disabled={disabled}
        // Remove o botão do fluxo de tabulação, focando no input
        tabIndex={-1}
        // Melhora a acessibilidade com um label descritivo
        aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
        // Aplica classes para estilo e cursor (pointer-events são gerenciados no BaseInput)
        className={`focus:outline-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {showPassword ? (
          <EyeOff className={iconClassName} aria-hidden="true" />
        ) : (
          <Eye className={iconClassName} aria-hidden="true" />
        )}
      </button>
    );

    return (
      <BaseInput
        ref={ref}
        // Passa o tipo dinâmico ('password' ou 'text')
        type={inputType}
        // Passa o botão como adornment final
        endAdornment={toggleButton}
        // Passa o estado de desabilitado
        disabled={disabled}
        // Passa todas as outras props recebidas para o BaseInput
        {...restProps}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';