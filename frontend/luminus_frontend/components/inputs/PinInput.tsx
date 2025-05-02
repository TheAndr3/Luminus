/**
 * @file PinInput.tsx (Unstyled)
 * @description Componente funcional "unstyled" (casca vazia) para entrada de PIN.
 *              TODA a estilização e layout dos inputs e seu container devem ser
 *              fornecidos pelo componente pai através das props 'inputClassName'
 *              e 'inputContainerClassName'.
 *              Gerencia a lógica de digitação, foco, estado e acessibilidade.
 */
'use client';

import React, { useState, useRef, useEffect, useId, useMemo, ChangeEvent, KeyboardEvent, ClipboardEvent, forwardRef } from 'react';

// Interface Base
interface CommonInputProps {
  label?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  containerClassName?: string; // Classe para o container MAIS EXTERNO
  labelClassName?: string;     // Classe para o label
  isInvalid?: boolean;         // Necessário para lógica e aria-invalid
  ariaDescribedby?: string;
}

// Props Específicas
export interface PinInputProps extends Omit<CommonInputProps, 'ariaDescribedby'> {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  // <<< Props OBRIGATÓRIAS para Estilização pelo Pai >>>
  inputClassName?: string;          // Classe(s) para CADA input
  inputContainerClassName?: string; // Classe(s) para o DIV que envolve os inputs
  // <<<--------------------------------------------->>>
  autoFocus?: boolean;
  externalError?: string | null;
  requiredMessage?: string;
  attemptedSubmit?: boolean;
  onErrorChange?: (errorMessage: string | null) => void; // Callback para comunicar erro
  'aria-describedby'?: string; // Passado para os inputs
}

// Validação (opcional manter se onErrorChange for útil)
const validatePinCompleteness = (pin: string, requiredLength: number): string | null => {
  if (pin.length > 0 && pin.length < requiredLength) {
    return `PIN deve ter ${requiredLength} dígitos.`;
  }
  return null;
};


export const PinInput = forwardRef<HTMLInputElement, PinInputProps>(
  (
    {
      length = 4,
      value = '',
      onChange,
      // --- Estilização vem 100% do Pai ---
      containerClassName = '',
      labelClassName = '',
      inputContainerClassName = '',
      inputClassName = '',
      // -----------------------------------
      label,
      required = false,
      disabled = false,
      id,
      name,
      autoFocus = false,
      externalError,
      requiredMessage = "Código é obrigatório",
      attemptedSubmit = false,
      onErrorChange,
      isInvalid: isInvalidProp, // Usado para lógica e aria-invalid
      'aria-describedby': ariaDescribedbyProp,
      ...rest
    },
    ref
  ) => {
    // --- Hooks e Lógica Interna ---
    const uniqueComponentId = useId();
    const baseId = id || `pin-${uniqueComponentId}`;
    const [pinValues, setPinValues] = useState<string[]>(() => Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Sincronização com 'value' prop
    useEffect(() => {
        const currentInternalPin = pinValues.join('');
        if (value !== currentInternalPin) {
            const newPinValues = Array(length).fill('');
            for (let i = 0; i < Math.min(length, value.length); i++) {
                if (/^\d$/.test(value[i])) {
                    newPinValues[i] = value[i];
                }
            }
            if (newPinValues.join('') !== currentInternalPin) {
               setPinValues(newPinValues);
            }
        }
    }, [value, length, pinValues]);

    // Foco automático
    useEffect(() => {
      if (autoFocus && inputRefs.current[0] && value === '') {
        inputRefs.current[0]?.focus();
      }
    }, [autoFocus, value]);

    // Lógica de erro (apenas calcula, não aplica estilo)
    const internalValidationError = useMemo(() => validatePinCompleteness(pinValues.join(''), length), [pinValues, length]);
    const currentErrorMessage = useMemo(() => {
         const isValueEmpty = pinValues.join('') === '';
         let error: string | null = null;
         if (externalError) error = externalError;
         else if (required && isValueEmpty && attemptedSubmit) error = requiredMessage;
         else if (!isValueEmpty && internalValidationError) error = internalValidationError; // Usa validação interna
         return error;
     }, [externalError, required, pinValues, attemptedSubmit, requiredMessage, internalValidationError]); // Adicionado internalValidationError

     // Comunica erro ao pai, se callback fornecido
     useEffect(() => { if (onErrorChange) onErrorChange(currentErrorMessage); }, [currentErrorMessage, onErrorChange]);


    // --- Handlers ---
    const focusInput = (index: number) => {
        if (index >= 0 && index < length && inputRefs.current[index]) {
            inputRefs.current[index]?.focus();
            inputRefs.current[index]?.select();
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const digit = e.target.value.slice(-1);
        if (!/^\d$/.test(digit) && digit !== '') {
            e.target.value = pinValues[index]; // Não permite não-dígitos
            return;
        }
        const newPinValues = [...pinValues];
        newPinValues[index] = digit;
        setPinValues(newPinValues);
        const newValue = newPinValues.join('');
        onChange(newValue); // Notifica o pai
        if (digit !== '' && index < length - 1) {
            focusInput(index + 1); // Move foco para frente
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
         switch (e.key) {
            case 'Backspace':
                e.preventDefault();
                const backspacePinValues = [...pinValues];
                if (backspacePinValues[index]) { // Se tem valor, apaga
                    backspacePinValues[index] = '';
                    setPinValues(backspacePinValues);
                    onChange(backspacePinValues.join(''));
                } else if (index > 0) { // Se vazio, move foco para trás
                    focusInput(index - 1);
                }
                break;
            case 'Delete': // Similar ao backspace, mas não move foco
                e.preventDefault();
                const deletePinValues = [...pinValues];
                if (deletePinValues[index]) {
                    deletePinValues[index] = '';
                    setPinValues(deletePinValues);
                    onChange(deletePinValues.join(''));
                }
                break;
            case 'ArrowLeft': if (index > 0) focusInput(index - 1); break;
            case 'ArrowRight': if (index < length - 1) focusInput(index + 1); break;
        }
    };

     const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').trim();
        const digits = pastedData.replace(/\D/g, '');
        if (digits.length === 0) return;
        const currentFocusIndex = inputRefs.current.findIndex(input => input === e.target);
        const startIndex = currentFocusIndex >= 0 ? currentFocusIndex : 0;
        const newPinValues = [...pinValues];
        let pasteIdx = 0;
        let lastFilledIndex = startIndex -1;
        for(let i = startIndex; i < length && pasteIdx < digits.length; i++) {
            newPinValues[i] = digits[pasteIdx];
            lastFilledIndex = i;
            pasteIdx++;
        }
        setPinValues(newPinValues);
        onChange(newPinValues.join(''));
        focusInput(Math.min(length - 1, lastFilledIndex));
    };


    // Determina apenas o atributo aria-invalid
    const isInvalid = isInvalidProp ?? false;

    // --- Renderização (Sem Estilos Internos) ---
    return (
      // Container geral, classe via prop
      <div className={containerClassName}>
        {label && (
            <label
                htmlFor={`${baseId}-0`}
                className={labelClassName} // Classe do pai
                >
                {label}
                {required && <span> *</span>} {/* Estilizar via labelClassName */}
            </label>
        )}

        {/* Container dos inputs - Layout e espaçamento definidos pelo PAI */}
        <div
          className={inputContainerClassName} // Classe do pai (ex: flex, grid, gap)
          role="group"
          aria-label={label || 'Código PIN'}
        >
          {pinValues.map((digit, index) => (
            <input
              key={`${baseId}-${index}`}
              ref={index === 0 ? ref : (el) => { inputRefs.current[index] = el; }}
              id={`${baseId}-${index}`}
              // Atributos funcionais básicos
              type="tel"
              inputMode="numeric"
              pattern="\d{1}"
              maxLength={1}
              value={digit}
              // Event handlers
              onChange={(e) => handleInputChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              // Estados e Acessibilidade
              disabled={disabled}
              required={required && index === 0}
              aria-label={`Dígito ${index + 1}`}
              aria-describedby={isInvalid ? ariaDescribedbyProp : undefined}
              aria-invalid={isInvalid} // Define o estado de acessibilidade
              autoComplete="one-time-code"
              // --- Aplica APENAS a classe do pai ao input ---
              className={inputClassName}
              // ---------------------------------------------
              {...rest} // Passa outras props HTML
            />
          ))}
        </div>

        {/* Input oculto */}
        {name && <input type="hidden" name={name} value={pinValues.join('')} />}
      </div>
    );
  }
);

PinInput.displayName = 'PinInput (Unstyled)';