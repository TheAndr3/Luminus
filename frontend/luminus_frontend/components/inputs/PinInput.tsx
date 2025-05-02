'use client';

import React, { useState, useRef, useEffect, useId, useMemo, ChangeEvent, KeyboardEvent, ClipboardEvent, forwardRef } from 'react';
// ErrorContainer não é mais importado/usado

// Reutilizando/adaptando a ideia de BaseInputProps para definir o que omitir e o que esperar
// Poderíamos criar uma interface base comum se houvesse mais componentes não-BaseInput
interface CommonInputProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  containerClassName?: string;
  labelClassName?: string;
  // Props relacionadas ao erro, passadas pelo PAI
  isInvalid?: boolean;
  ariaDescribedby?: string;
}

// Props específicas para o PinInput
export interface PinInputProps extends Omit<CommonInputProps, 'ariaDescribedby'> { // Omitimos ariaDescribedby aqui porque será passado pelo pai
  length?: number;
  value: string; // Valor completo do PIN (controlado)
  onChange: (value: string) => void; // Callback com valor completo
  inputClassName?: string; // Classe para cada caixa individual
  inputContainerClassName?: string; // Classe para o container das caixas
  autoFocus?: boolean;
  // Props para controle de erro interno/externo
  externalError?: string | null;
  requiredMessage?: string;
  attemptedSubmit?: boolean;
  onErrorChange?: (errorMessage: string | null) => void;
  // Prop de erro vinda do PAI, que referencia o ID da mensagem
  'aria-describedby'?: string; // Nome exato do atributo HTML/React prop
}

// --- Validação Interna Específica para PIN ---
const validatePinCompleteness = (pin: string, requiredLength: number): string | null => {
  if (pin.length > 0 && pin.length < requiredLength) {
    return `PIN deve ter ${requiredLength} dígitos.`;
  }
  return null;
};

/**
 * @component PinInput
 * @description Componente para entrada de PIN/Código numérico.
 *              Valida internamente se está completo e considera erros externos/obrigatoriedade.
 *              **Não renderiza a mensagem de erro**, mas a comunica ao pai via `onErrorChange`.
 *              Usa `isInvalid` e `aria-describedby` (passados pelo pai) para estilização e acessibilidade.
 */
export const PinInput = forwardRef<HTMLInputElement, PinInputProps>( // Usando forwardRef para consistência, embora foquemos no primeiro input
  (
    {
      // Configuração do PIN
      length = 4,
      value = '',
      onChange,
      // Estilização
      containerClassName = '',
      labelClassName = '',
      inputContainerClassName = '',
      inputClassName = '',
      // Props Comuns / HTML
      label,
      required = false,
      disabled = false,
      id,
      name,
      autoFocus = false,
      // Controle de Erro
      externalError,
      requiredMessage = "Código é obrigatório",
      attemptedSubmit = false,
      onErrorChange,
      isInvalid: isInvalidProp, // Prop vinda do pai indicando estado inválido
      'aria-describedby': ariaDescribedbyProp, // Prop vinda do pai com ID da mensagem
      ...rest // Captura outras props HTML válidas (ex: data attributes)
    },
    // O ref aqui poderia referenciar o container ou o primeiro input,
    // vamos focar no primeiro input para consistência com outros inputs
    ref
  ) => {
    const uniqueComponentId = useId();
    const baseId = id || `pin-${uniqueComponentId}`;

    const [pinValues, setPinValues] = useState<string[]>(() => Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Sincroniza estado interno com prop 'value'
    useEffect(() => {
      const newPinValues = Array(length).fill('');
      for (let i = 0; i < Math.min(length, value.length); i++) {
        if (/^\d$/.test(value[i])) {
          newPinValues[i] = value[i];
        }
      }
      // Evita loop infinito se o valor formatado internamente for igual ao externo
      if (newPinValues.join('') !== pinValues.join('')) {
          setPinValues(newPinValues);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, length]); // Depende de value e length

    // Foco automático
    useEffect(() => {
      if (autoFocus && inputRefs.current[0] && value === '') {
        inputRefs.current[0]?.focus();
      }
    }, [autoFocus, value]);

    // --- LÓGICA DE VALIDAÇÃO E ERRO ---
    const internalValidationError = useMemo(() => {
        const currentPin = pinValues.join('');
        return validatePinCompleteness(currentPin, length);
    }, [pinValues, length]);

    const currentErrorMessage = useMemo(() => {
      const isValueEmpty = pinValues.join('') === '';
      let error: string | null = null;

      if (externalError) {
        error = externalError; // 1. Prioridade: Erro externo
      } else if (required && isValueEmpty && attemptedSubmit) {
        error = requiredMessage; // 2. Prioridade: Obrigatório não preenchido após tentativa
      } else if (!isValueEmpty && internalValidationError) {
        // 3. Prioridade: Erro de validação interna (somente se não estiver vazio)
        error = internalValidationError;
      }
      return error;
    }, [externalError, required, pinValues, attemptedSubmit, requiredMessage, internalValidationError]);

    // Comunica erro ao pai
    useEffect(() => {
      if (onErrorChange) {
        onErrorChange(currentErrorMessage);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentErrorMessage /* , onErrorChange */]);


    // --- Handlers (sem mudanças significativas na lógica interna) ---
    const focusInput = (index: number) => {
        if (index >= 0 && index < length && inputRefs.current[index]) {
            inputRefs.current[index]?.focus();
            inputRefs.current[index]?.select();
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const digit = e.target.value.slice(-1); // Pega apenas o último dígito

        // Permite apenas dígitos ou string vazia
        if (!/^\d$/.test(digit) && digit !== '') {
            e.target.value = pinValues[index]; // Restaura valor anterior se inválido
            return;
        }

        const newPinValues = [...pinValues];
        newPinValues[index] = digit; // Atualiza o dígito na posição correta
        setPinValues(newPinValues); // Atualiza o estado interno

        const newValue = newPinValues.join(''); // Junta para obter o valor completo
        onChange(newValue); // Chama o callback do pai com o valor completo

        // Move o foco para o próximo input se um dígito foi inserido e não é o último
        if (digit !== '' && index < length - 1) {
            focusInput(index + 1);
        }
    };


    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        switch (e.key) {
            case 'Backspace':
                e.preventDefault(); // Previne navegação do browser
                const backspacePinValues = [...pinValues];
                if (backspacePinValues[index]) {
                    // Se o campo atual tem valor, apaga ele
                    backspacePinValues[index] = '';
                    setPinValues(backspacePinValues);
                    onChange(backspacePinValues.join(''));
                    // Foco permanece no mesmo input para digitar novamente
                } else if (index > 0) {
                    // Se o campo atual está vazio, move para o anterior e apaga lá (se tiver valor)
                     // backspacePinValues[index - 1] = ''; // Comentado: Melhor apenas focar, o usuário pode apagar se quiser
                    // setPinValues(backspacePinValues);
                    // onChange(backspacePinValues.join(''));
                    focusInput(index - 1);
                }
                break;
            case 'Delete':
                e.preventDefault();
                const deletePinValues = [...pinValues];
                if (deletePinValues[index]) {
                    deletePinValues[index] = '';
                    setPinValues(deletePinValues);
                    onChange(deletePinValues.join(''));
                }
                // Foco permanece no mesmo input
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
             // Não precisamos de 'default' para prevenir não-dígitos aqui,
             // pois o handleInputChange já faz isso.
        }
    };

     const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').trim();
        const digits = pastedData.replace(/\D/g, ''); // Pega apenas dígitos

        if (digits.length === 0) return; // Ignora se colar algo sem dígitos

        const currentFocusIndex = inputRefs.current.findIndex(input => input === e.target);
        const startIndex = currentFocusIndex >= 0 ? currentFocusIndex : 0;

        const newPinValues = [...pinValues];
        let pasteIdx = 0;
        let lastFilledIndex = startIndex -1; // Onde parar o foco

        for(let i = startIndex; i < length && pasteIdx < digits.length; i++) {
            newPinValues[i] = digits[pasteIdx];
            lastFilledIndex = i;
            pasteIdx++;
        }
        setPinValues(newPinValues);
        onChange(newPinValues.join(''));
        focusInput(Math.min(length - 1, lastFilledIndex)); // Foca no último input preenchido ou no último campo
    };


    // Determina o estado final de 'isInvalid' a ser usado nos inputs
    const isInvalid = isInvalidProp ?? false;

    return (
      <div className={containerClassName}>
        {/* Label */}
        <label
          htmlFor={`${baseId}-0`} // Aponta para o primeiro input
          className={`block text-gray-800 text-sm font-semibold mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        {/* Container para os inputs PIN */}
        <div
          className={`flex items-center space-x-2 ${inputContainerClassName}`}
          role="group" // Agrupa os inputs semanticamente
          aria-label={label} // O grupo herda o label principal
        >
          {pinValues.map((digit, index) => (
            <input
              key={`${baseId}-${index}`}
              // Atribui o ref ao elemento correto do array
              // Usa o ref do forwardRef apenas no primeiro elemento como convenção
              ref={index === 0 ? ref : (el) => { inputRefs.current[index] = el; }}
              id={`${baseId}-${index}`}
              type="tel" // Use 'tel' para melhor compatibilidade com teclados numéricos móveis
              inputMode="numeric" // Sugere teclado numérico
              pattern="\d{1}" // Ajuda na validação do browser (embora controlemos via JS)
              maxLength={1} // Garante apenas um dígito
              value={digit}
              onChange={(e) => handleInputChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()} // Seleciona ao focar para fácil substituição
              disabled={disabled}
              // 'required' só faz sentido no primeiro para validação de form HTML
              required={required && index === 0}
              className={`
                w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14
                text-center text-lg md:text-xl font-medium
                border ${isInvalid ? 'border-red-500' : 'border-gray-300'} {/* Usa isInvalid do PAI */}
                rounded-md focus:ring-2 focus:ring-green-500
                focus:border-transparent transition
                text-gray-900
                ${disabled ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'}
                ${inputClassName}
              `}
              aria-label={`Dígito ${index + 1}`} // Label específico para cada dígito
              // Linka CADA input à ÚNICA mensagem de erro (renderizada pelo pai) se inválido
              aria-describedby={isInvalid ? ariaDescribedbyProp : undefined}
              aria-invalid={isInvalid} // Usa isInvalid do PAI
              autoComplete="one-time-code" // Ajuda o browser/SO a sugerir códigos de SMS/App
              {...rest} // Passa outras props como data-*
            />
          ))}
        </div>

        {/* Input oculto para facilitar integração com formulários */}
        {name && <input type="hidden" name={name} value={pinValues.join('')} />}

        {/* NENHUM ErrorContainer RENDERIZADO AQUI */}
      </div>
    );
  }
);

PinInput.displayName = 'PinInput';