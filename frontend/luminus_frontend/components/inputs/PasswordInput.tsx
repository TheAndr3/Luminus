'use client';

import React, { useState, useEffect, forwardRef } from 'react';
import { BaseInput, BaseInputProps } from './BaseInput'; // Verifique o caminho
import { Eye, EyeOff } from 'react-feather';

// Interface atualizada
export interface PasswordInputProps extends Omit<BaseInputProps, 'type' | 'inputMode' | 'endAdornment'> {
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
  iconClassName?: string;
  error?: string | null; // Erro vindo do pai (ex: validação do form)
  requiredMessage?: string; // Mensagem customizada para campo obrigatório
  /** Sinaliza se uma tentativa de submissão ocorreu (gerenciado pelo pai) */
  attemptedSubmit?: boolean; // <-- NOVA PROP
}

// Função de validação de força (permanece a mesma)
const validatePasswordStrength = (password: string): string | null => {
  if (!password) {
    return null;
  }
  const missingRequirements: string[] = [];
  const minLength = 8;
  const specialChars = /[!@#$%^&*(),.?":{}|<>_-]/;

  if (password.length < minLength) missingRequirements.push(`mínimo ${minLength} caracteres`);
  if (!/[A-Z]/.test(password)) missingRequirements.push("1 letra maiúscula");
  if (!/[a-z]/.test(password)) missingRequirements.push("1 letra minúscula");
  if (!/\d/.test(password)) missingRequirements.push("1 número");
  if (!specialChars.test(password)) missingRequirements.push("1 caractere especial");

  if (missingRequirements.length > 0) {
    return `Senha precisa incluir: ${missingRequirements.join('; ')}.`;
  }
  return null;
};

/**
 * @component PasswordInput
 * @description Componente de senha que mostra erro de força ao digitar,
 *              erro de campo obrigatório (se 'required' e 'attemptedSubmit' forem true),
 *              e prioriza erro externo.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      showPasswordLabel = "Mostrar senha",
      hidePasswordLabel = "Ocultar senha",
      iconClassName = 'h-5 w-5 text-gray-400',
      disabled,
      onChange: parentOnChange,
      error: externalError,
      value,
      required,
      requiredMessage = "Senha é Obrigatório",
      attemptedSubmit = false, // <-- Valor padrão da nova prop
      ...restProps
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [strengthValidationError, setStrengthValidationError] = useState<string | null>(null);

    const togglePasswordVisibility = () => {
      if (!disabled) {
        setShowPassword((prev) => !prev);
      }
    };

    useEffect(() => {
      const currentPassword = typeof value === 'string' ? value : '';
      const validationError = validatePasswordStrength(currentPassword);
      setStrengthValidationError(validationError);
    }, [value]);

    const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (parentOnChange) {
        parentOnChange(e);
      }
    };

    const inputType = showPassword ? 'text' : 'password';
    const toggleButton = (
      <button
        type="button"
        onClick={togglePasswordVisibility}
        disabled={disabled}
        tabIndex={-1}
        aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
        className={`focus:outline-none ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        {showPassword ? <EyeOff className={iconClassName} aria-hidden="true" /> : <Eye className={iconClassName} aria-hidden="true" />}
      </button>
    );

    // --- LÓGICA DE EXIBIÇÃO DO ERRO (ATUALIZADA) ---
    let displayError: string | null = null;
    const isValueEmpty = !value || String(value).trim() === '';

    if (externalError) {
      // 1. PRIORIDADE MÁXIMA: Erro externo vindo do pai.
      displayError = externalError;
    } else if (required && isValueEmpty && attemptedSubmit) { // <-- VERIFICA attemptedSubmit AQUI
      // 2. SEGUNDA PRIORIDADE: Campo obrigatório, vazio E HOUVE TENTATIVA DE SUBMISSÃO.
      displayError = requiredMessage;
    } else if (!isValueEmpty) {
      // 3. TERCEIRA PRIORIDADE: Campo não está vazio, mostra erro de força (se houver).
      //    Não mostramos erro de força se o campo estiver vazio.
      displayError = strengthValidationError;
    }
    // 4. CASO PADRÃO: Nenhuma das condições acima. Sem erro.

    return (
      <BaseInput
        ref={ref}
        type={inputType}
        endAdornment={toggleButton}
        disabled={disabled}
        onChange={handleInternalChange}
        error={displayError}
        value={value ?? ''}
        required={required} // Mantemos o required para semântica HTML e acessibilidade
        {...restProps}
        aria-invalid={!!displayError}
        // aria-describedby={displayError ? `${restProps.id || restProps.name}-error` : undefined}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';