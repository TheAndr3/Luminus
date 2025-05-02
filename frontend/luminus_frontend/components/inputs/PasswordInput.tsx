'use client';

import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import { BaseInput, BaseInputProps } from './BaseInput'; // Verifique o caminho
import { Eye, EyeOff } from 'react-feather';

// Função de validação de força (permanece a mesma)
const validatePasswordStrength = (password: string): string | null => {
  if (!password) {
    return null; // Não valide força se vazio
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


// --- Interface de Props Atualizada ---
export interface PasswordInputProps extends Omit<BaseInputProps, 'type' | 'inputMode' | 'endAdornment' | 'error'> {
  externalError?: string | null; // Erro prioritário vindo do pai
  requiredMessage?: string; // Mensagem para campo obrigatório
  attemptedSubmit?: boolean; // Sinaliza tentativa de submissão (do pai)
  /** Callback chamado quando o estado de erro interno (calculado) muda. */
  onErrorChange?: (errorMessage: string | null) => void; // <-- NOVA PROP CALLBACK
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
  iconClassName?: string;
  // Nota: 'isInvalid' e 'ariaDescribedby' são herdadas de BaseInputProps
  // e devem ser passadas pelo componente pai.
}


// --- Componente PasswordInput Refatorado ---
/**
 * @component PasswordInput
 * @description
 * Componente para entrada de senha com toggle de visibilidade e validação de força.
 * Valida internamente a força, considera erros externos e obrigatoriedade.
 * **Não renderiza a mensagem de erro**, mas a comunica ao pai via `onErrorChange`.
 * Usa `isInvalid` e `ariaDescribedby` (passados pelo pai) para configurar o BaseInput.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      // Props específicas e de controle de erro
      externalError,
      requiredMessage = "Senha é Obrigatório",
      attemptedSubmit = false,
      onErrorChange, // <-- Nova callback
      // Props de aparência e toggle
      showPasswordLabel = "Mostrar senha",
      hidePasswordLabel = "Ocultar senha",
      iconClassName = 'h-5 w-5 text-gray-400',
      // Props de BaseInput (algumas usadas aqui, outras passadas via restProps)
      onChange: parentOnChange, // onChange original do pai
      value, // Valor vindo do pai
      required,
      disabled,
      isInvalid: isInvalidProp, // Prop vinda do pai
      ariaDescribedby: ariaDescribedbyProp, // Prop vinda do pai
      ...restProps // label, id, name, etc.
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [strengthValidationError, setStrengthValidationError] = useState<string | null>(null);

    // Valida a força sempre que o valor muda
    useEffect(() => {
      const currentPassword = typeof value === 'string' ? value : '';
      // Só valida a força se houver algo digitado
      const validationError = currentPassword ? validatePasswordStrength(currentPassword) : null;
      setStrengthValidationError(validationError);
    }, [value]);

    // --- LÓGICA INTERNA PARA DETERMINAR A MENSAGEM DE ERRO ATUAL ---
    const currentErrorMessage = useMemo(() => {
      const isValueEmpty = !value || String(value).trim() === '';
      let error: string | null = null;

      if (externalError) {
        error = externalError; // 1. Prioridade: Erro externo
      } else if (required && isValueEmpty && attemptedSubmit) {
        error = requiredMessage; // 2. Prioridade: Obrigatório não preenchido após tentativa
      } else if (!isValueEmpty && strengthValidationError) {
        // 3. Prioridade: Erro de validação de força (somente se não estiver vazio)
        error = strengthValidationError;
      }
      return error;
    }, [externalError, required, value, attemptedSubmit, requiredMessage, strengthValidationError]);

    // --- EFEITO PARA COMUNICAR A MUDANÇA DE ERRO AO PAI ---
    useEffect(() => {
      if (onErrorChange) {
        onErrorChange(currentErrorMessage);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentErrorMessage /* , onErrorChange */]); // Cuidado se onErrorChange mudar frequentemente

    // Handler para o toggle de visibilidade (mantido)
    const togglePasswordVisibility = () => {
      if (!disabled) {
        setShowPassword((prev) => !prev);
      }
    };

    // Handler para o onChange (mantido)
    const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (parentOnChange) {
        parentOnChange(e);
      }
    };

    // Define o tipo do input (text/password)
    const inputType = showPassword ? 'text' : 'password';

    // Cria o botão de toggle (mantido)
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

    // Determina o estado 'isInvalid' final a ser passado para BaseInput.
    // O pai é quem decide isso baseado no `currentErrorMessage` que ele recebe.
    const isInvalid = isInvalidProp ?? false;

    return (
      <BaseInput
        ref={ref}
        // Atributos específicos de senha
        type={inputType}
        endAdornment={toggleButton}
        // Props passadas/controladas
        value={value ?? ''} // Garante que value seja string
        onChange={handleInternalChange} // Nosso handler (simples repasse)
        required={required}
        disabled={disabled}
        // --- Passando estado de erro para BaseInput ---
        isInvalid={isInvalid}                // Usa a prop passada pelo pai
        ariaDescribedby={ariaDescribedbyProp} // Usa a prop passada pelo pai
        // Passa todas as outras props (label, id, name, placeholder, etc.)
        {...restProps}
      />
      // NENHUMA RENDERIZAÇÃO DE ERRO AQUI
    );
  }
);

PasswordInput.displayName = 'PasswordInput';