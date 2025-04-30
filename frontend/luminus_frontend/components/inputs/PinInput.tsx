'use client';

import React, { useState, useRef, useEffect, useId, ChangeEvent, KeyboardEvent, ClipboardEvent } from 'react';
import { ErrorContainer } from '@/components/errors/ErrorContainer'; // Mantenha o caminho correto
import { BaseInputProps } from './BaseInput'; // Assumindo que BaseInputProps está em BaseInput.tsx

// Props específicas para o PinInput, herdando e modificando BaseInputProps
export interface PinInputProps extends Omit<BaseInputProps, 'value' | 'onChange' | 'maxLength' | 'minLength' | 'type' | 'children' | 'endAdornment' | 'inputClassName'> {
  length?: number; // Permitir configurar o número de dígitos (padrão 4)
  value: string; // O valor completo do PIN como string
  onChange: (value: string) => void; // Callback com o valor completo
  inputClassName?: string; // Classe para cada caixa individual
  inputContainerClassName?: string; // Classe para o container das caixas
}

export const PinInput: React.FC<PinInputProps> = ({
  label,
  required = false,
  error = null,
  errorDisplayMode = 'inline', // Reutiliza a lógica de exibição de erro
  errorContainerId: providedErrorContainerId,
  containerClassName = '',
  labelClassName = '',
  inputContainerClassName = '',
  inputClassName = '',
  disabled = false,
  id,
  name, // Pode ser útil para forms tradicionais ou libs
  value = '',
  onChange,
  length = 4, // Padrão para 4 dígitos
  autoFocus = false,
  ...rest // Captura quaisquer outras props HTML válidas (ex: data attributes)
}) => {
  const uniqueComponentId = useId();
  const baseId = id || `pin-${uniqueComponentId}`;
  const errorId = providedErrorContainerId || `error-${baseId}`;

  const [pinValues, setPinValues] = useState<string[]>(() => Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sincroniza o estado interno com a prop 'value' vinda de fora
  useEffect(() => {
    const newPinValues = Array(length).fill('');
    for (let i = 0; i < Math.min(length, value.length); i++) {
      if (/^\d$/.test(value[i])) {
        newPinValues[i] = value[i];
      }
    }
    if (newPinValues.join('') !== pinValues.join('')) {
        setPinValues(newPinValues);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, length]);

  // Foca no primeiro input se autoFocus for true e o value estiver vazio
  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && value === '') {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus, value]);

  const focusInput = (index: number) => {
    if (index >= 0 && index < length) {
      inputRefs.current[index]?.focus();
      inputRefs.current[index]?.select();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const digit = e.target.value.slice(-1);

    if (!/^\d$/.test(digit) && digit !== '') {
      e.target.value = pinValues[index];
      return;
    }

    const newPinValues = [...pinValues];
    newPinValues[index] = digit;
    setPinValues(newPinValues);

    const newValue = newPinValues.join('');
    onChange(newValue);

    if (digit !== '' && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    switch (e.key) {
      case 'Backspace':
        e.preventDefault();
        const newPinValues = [...pinValues];
        if (pinValues[index]) {
          newPinValues[index] = '';
          setPinValues(newPinValues);
          onChange(newPinValues.join(''));
        } else if (index > 0) {
          newPinValues[index - 1] = '';
          setPinValues(newPinValues);
          onChange(newPinValues.join(''));
          focusInput(index - 1);
        }
        break;
      case 'Delete':
         e.preventDefault();
         const delPinValues = [...pinValues];
         if (delPinValues[index]) {
            delPinValues[index] = '';
            setPinValues(delPinValues);
            onChange(delPinValues.join(''));
         }
         break;
      case 'ArrowLeft':
        if (index > 0) {
          focusInput(index - 1);
        }
        break;
      case 'ArrowRight':
        if (index < length - 1) {
          focusInput(index + 1);
        }
        break;
      default:
        if (e.key.length === 1 && !/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
            // Opcional: e.preventDefault();
        }
        break;
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    const digits = pastedData.replace(/\D/g, '');

    if (digits.length === length) {
      const newPinValues = digits.split('');
      setPinValues(newPinValues);
      onChange(digits);
      focusInput(length - 1);
    } else if (digits.length > 0 && digits.length < length) {
        const currentFocusIndex = inputRefs.current.findIndex(input => input === document.activeElement);
        const startIndex = currentFocusIndex >= 0 ? currentFocusIndex : 0;

        const newPinValues = [...pinValues];
        let pasteIdx = 0;
        for(let i = startIndex; i < length && pasteIdx < digits.length; i++) {
            newPinValues[i] = digits[pasteIdx];
            pasteIdx++;
        }
        setPinValues(newPinValues);
        onChange(newPinValues.join(''));
        focusInput(Math.min(length - 1, startIndex + digits.length -1));
    }
  };

  const shouldRenderErrorSlot = errorDisplayMode === 'inline';

  return (
    <div className={containerClassName}>
      {/* Label */}
      <label
        htmlFor={`${baseId}-0`}
        className={`block text-gray-800 text-sm font-semibold mb-1 ${labelClassName}`}
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      {/* Container para os inputs PIN */}
      <div
        className={`flex items-center space-x-2 ${inputContainerClassName}`}
      >
        {pinValues.map((digit, index) => (
          <input
            key={`${baseId}-${index}`}
            // --- CORREÇÃO AQUI ---
            ref={(el) => { inputRefs.current[index] = el; }} // Adicionado chaves {}
            // --- FIM DA CORREÇÃO ---
            id={`${baseId}-${index}`}
            type="tel"
            inputMode="numeric"
            pattern="\d{1}"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            disabled={disabled}
            required={required && index === 0}
            className={`
              w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14
              text-center text-lg md:text-xl font-medium
              border ${error ? 'border-red-500' : 'border-gray-300'}
              rounded-md focus:ring-2 focus:ring-green-500
              focus:border-transparent transition
              text-gray-900
              ${disabled ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'}
              ${inputClassName}
            `}
            aria-label={`Dígito ${index + 1} do PIN`}
            aria-describedby={shouldRenderErrorSlot && !!error ? errorId : undefined}
            aria-invalid={!!error}
            autoComplete="one-time-code"
            {...rest}
          />
        ))}
      </div>

      {/* Hidden input */}
       {name && <input type="hidden" name={name} value={pinValues.join('')} />}

      {/* Container de Erro */}
      {shouldRenderErrorSlot && (
        <div className="w-full min-h-5 pt-0.5">
          <ErrorContainer
            id={errorId}
            message={error}
          />
        </div>
      )}
    </div>
  );
};

PinInput.displayName = 'PinInput';