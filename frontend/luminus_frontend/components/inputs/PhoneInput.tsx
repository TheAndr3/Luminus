'use client';

import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import { BaseInput, BaseInputProps } from './BaseInput'; // Importa BaseInput e suas props

// --- Funções Auxiliares de Formatação (mantidas) ---
const formatPhoneNumber = (digits: string): string => {
  const cleaned = digits.replace(/\D/g, '').slice(0, 11);
  const length = cleaned.length;
  if (length === 0) return '';
  if (length <= 2) return `(${cleaned}`;
  if (length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

export const unformatPhoneNumber = (formattedValue: string): string => {
  return formattedValue.replace(/\D/g, '');
};

// --- Validação Interna Específica para Telefone ---
/**
 * @function validatePhoneNumberLength
 * @description Valida se o número de telefone (dígitos puros) tem 10 ou 11 caracteres.
 * @param {string} digits - String contendo apenas os dígitos.
 * @returns {string | null} - Mensagem de erro ou null se válido.
 */
const validatePhoneNumberLength = (digits: string): string | null => {
  if (digits.length > 0 && (digits.length < 10 || digits.length > 11)) {
    return 'Número de telefone incompleto.';
  }
  return null;
};

// --- Interface de Props Atualizada ---
export interface PhoneInputProps extends Omit<BaseInputProps, 'type' | 'inputMode' | 'maxLength' | 'error'> {
  externalError?: string | null; // Erro prioritário vindo do pai
  requiredMessage?: string; // Mensagem para campo obrigatório
  attemptedSubmit?: boolean; // Sinaliza tentativa de submissão (do pai)
  /** Callback chamado quando o estado de erro interno (calculado) muda. */
  onErrorChange?: (errorMessage: string | null) => void;
  // Nota: 'isInvalid' e 'ariaDescribedby' são herdadas de BaseInputProps
  // e devem ser passadas pelo componente pai.
}

// --- Componente PhoneInput Refatorado ---
/**
 * @component PhoneInput
 * @description
 * Componente para entrada de telefone com máscara (XX) XXXXX-XXXX.
 * Valida internamente se o número está completo e considera erros externos/obrigatoriedade.
 * **Não renderiza a mensagem de erro**, mas a comunica ao pai via `onErrorChange`.
 * Usa `isInvalid` e `ariaDescribedby` (passados pelo pai) para configurar o BaseInput.
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      // Props específicas e de controle de erro
      externalError,
      requiredMessage = "Telefone é obrigatório",
      attemptedSubmit = false,
      onErrorChange,
      // Props de BaseInput (algumas usadas aqui, outras passadas via restProps)
      onChange, // onChange original do pai
      placeholder = '(XX) XXXXX-XXXX',
      value, // Valor formatado vindo do pai
      required,
      disabled,
      isInvalid: isInvalidProp, // Prop vinda do pai
      ariaDescribedby: ariaDescribedbyProp, // Prop vinda do pai
      ...restProps // label, id, name, etc.
    },
    ref
  ) => {
    const [internalValidationError, setInternalValidationError] = useState<string | null>(null);

    // Valida o comprimento do número sempre que o valor (formatado) muda
    useEffect(() => {
      const currentDigits = unformatPhoneNumber(typeof value === 'string' ? value : '');
      const validationError = validatePhoneNumberLength(currentDigits);
      setInternalValidationError(validationError);
    }, [value]);

    // --- LÓGICA INTERNA PARA DETERMINAR A MENSAGEM DE ERRO ATUAL ---
    const currentErrorMessage = useMemo(() => {
      const isValueEmpty = !value || String(value).trim() === '';
      const currentDigits = unformatPhoneNumber(typeof value === 'string' ? value : '');
      let error: string | null = null;

      if (externalError) {
        error = externalError; // 1. Prioridade: Erro externo
      } else if (required && isValueEmpty && attemptedSubmit) {
        error = requiredMessage; // 2. Prioridade: Obrigatório não preenchido após tentativa
      } else if (currentDigits.length > 0 && internalValidationError) {
        // 3. Prioridade: Erro de validação interna (somente se não estiver vazio)
        error = internalValidationError;
      }
      return error;
    }, [externalError, required, value, attemptedSubmit, requiredMessage, internalValidationError]);

    // --- EFEITO PARA COMUNICAR A MUDANÇA DE ERRO AO PAI ---
    useEffect(() => {
      if (onErrorChange) {
        onErrorChange(currentErrorMessage);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentErrorMessage /* , onErrorChange */]); // Ver nota sobre dependência de onErrorChange

    /**
     * Manipulador de mudança que intercepta, formata e chama o onChange do pai.
     */
    const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = unformatPhoneNumber(e.target.value);
      const formattedValue = formatPhoneNumber(digits);

      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: formattedValue },
        };
        onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      }
    };

    // Determina o estado 'isInvalid' final a ser passado para BaseInput.
    const isInvalid = isInvalidProp ?? false;

    return (
      <BaseInput
        ref={ref}
        // Atributos específicos de telefone
        type="tel"
        inputMode="tel"
        maxLength={15} // (XX) XXXXX-XXXX
        // Props passadas/controladas
        placeholder={placeholder}
        value={value ?? ''} // Garante que value seja string
        onChange={handlePhoneInputChange} // Nosso handler com formatação
        required={required}
        disabled={disabled}
        // --- Passando estado de erro para BaseInput ---
        isInvalid={isInvalid}               // Usa a prop passada pelo pai
        ariaDescribedby={ariaDescribedbyProp} // Usa a prop passada pelo pai
        // Passa todas as outras props (label, id, name, etc.)
        {...restProps}
      />
      // NENHUMA RENDERIZAÇÃO DE ERRO AQUI
    );
  }
);

PhoneInput.displayName = 'PhoneInput';