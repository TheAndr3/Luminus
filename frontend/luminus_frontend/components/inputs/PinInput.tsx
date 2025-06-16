// -*- coding: utf-8 -*-
/**
 * @file PinInput.tsx
 * @description Componente funcional **unstyled** (sem estilos próprios) para entrada de PIN/OTP (One-Time Password).
 *              Este componente gerencia toda a lógica de digitação, foco entre campos,
 *              backspace, colar (paste) e acessibilidade.
 *              **TODA a estilização e layout** dos inputs individuais e do container
 *              que os envolve devem ser fornecidos pelo componente pai através das props
 *              `inputClassName` e `inputContainerClassName`.
 * @version 1.0
 * @date 02-05-2025
 * @author Pedro
 */

// Diretiva de Componente de Cliente, necessária para hooks (useState, useEffect, etc.) e interatividade.
'use client';

import React, { useState, useRef, useEffect, useId, useMemo, ChangeEvent, KeyboardEvent, ClipboardEvent, forwardRef } from 'react';

// --- Interface Base (para referência, não exportada diretamente) ---
// interface CommonInputProps { ... } // Definida no código original


// Interface Base criada apara suportar um grupo de inputs como do PinInput
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

// --- Interface de Props Específica ---

/**
 * @interface PinInputProps
 * @description Define as propriedades aceitas pelo componente `PinInput`.
 * Inclui propriedades básicas de formulário, controle de valor, callbacks,
 * e **props essenciais para estilização externa**.
 */
export interface PinInputProps extends Omit<CommonInputProps, 'ariaDescribedby'> { // Omitido da interface base, mas incluído explicitamente abaixo
  /** Número de dígitos que o PIN deve ter. Padrão: 4. */
  length?: number;
  /** O valor atual do PIN (string de dígitos). Controlado pelo componente pai. */
  value: string;
  /** Função callback chamada sempre que o valor do PIN muda. Recebe a nova string de dígitos. */
  onChange: (value: string) => void;

  // --- Props OBRIGATÓRIAS para Estilização pelo Pai ---
  /**
   * Classe(s) CSS a serem aplicadas a **cada um** dos elementos `<input>` individuais.
   * Essencial para definir aparência, tamanho, bordas, etc., de cada dígito.
   * Ex: "w-10 h-10 text-center border rounded focus:ring-2".
   */
  inputClassName?: string;
  /**
   * Classe(s) CSS a serem aplicadas ao `div` que **envolve todos** os inputs.
   * Essencial para definir o layout (ex: flex, grid) e espaçamento entre os dígitos.
   * Ex: "flex gap-2 justify-center".
   */
  inputContainerClassName?: string;
  // --- Fim das Props de Estilização Obrigatória ---

  /** Texto a ser exibido como label acima do grupo de inputs. */
  label?: string;
  /** Indica se o campo é obrigatório (afeta validação interna e acessibilidade). Padrão: false. */
  required?: boolean;
  /** Desabilita todos os inputs do PIN. Padrão: false. */
  disabled?: boolean;
  /** ID base para os elementos. Se não fornecido, um ID único será gerado. */
  id?: string;
  /** Nome para o input oculto, usado para submissão em formulários HTML tradicionais. */
  name?: string;
  /** Classe(s) CSS para o `div` container mais externo do componente (incluindo label e inputs). */
  containerClassName?: string;
  /** Classe(s) CSS para o elemento `label`. */
  labelClassName?: string;
  /** Se `true`, foca automaticamente no primeiro dígito ao montar (se o valor inicial estiver vazio). Padrão: false. */
  autoFocus?: boolean;

  // --- Props de Gerenciamento de Erro (Padrão Estabelecido) ---
  /** Erro vindo de fonte externa (ex: validação no backend). Tem prioridade sobre erros internos. */
  externalError?: string | null;
  /** Mensagem de erro customizada para campo obrigatório vazio após tentativa de submissão. Padrão: "Código é obrigatório". */
  requiredMessage?: string;
  /** Sinaliza se houve tentativa de submissão do formulário. Padrão: false. */
  attemptedSubmit?: boolean;
  /**
   * @callback onErrorChange
   * @description Callback chamado quando o estado de erro *calculado internamente* (obrigatoriedade, comprimento) muda.
   * O pai usa esta informação para atualizar seu estado, renderizar a mensagem e passar `isInvalid`/`aria-describedby` de volta.
   * @param {string | null} errorMessage - A mensagem de erro atual, ou `null` se não houver erro.
   */
  onErrorChange?: (errorMessage: string | null) => void;
  /** Controla o atributo `aria-invalid` nos inputs. Deve ser definido pelo pai baseado no erro. */
  isInvalid?: boolean; // Renomeado de isInvalidProp para clareza na documentação
  /**
   * ID(s) de elementos externos que descrevem os inputs (geralmente a mensagem de erro).
   * Passado diretamente para `aria-describedby` dos inputs quando `isInvalid` é true.
   * Controlado pelo pai. Note o nome da prop entre aspas para compatibilidade JSX.
   */
  'aria-describedby'?: string; // Renomeado de ariaDescribedbyProp
}

// --- Função de Validação Interna ---
/**
 * @function validatePinCompleteness
 * @description Valida se o PIN (dígitos puros) tem o comprimento requerido.
 * @param {string} pin - String contendo os dígitos atuais do PIN.
 * @param {number} requiredLength - O número de dígitos esperado.
 * @returns {string | null} Mensagem de erro se incompleto (e não vazio), ou `null` se completo ou vazio.
 */
const validatePinCompleteness = (pin: string, requiredLength: number): string | null => {
  // Só retorna erro se estiver preenchido mas com comprimento incorreto.
  if (pin.length > 0 && pin.length < requiredLength) {
    return `Código deve ter ${requiredLength} dígitos.`;
  }
  return null; // Válido (completo ou vazio)
};


// --- Componente PinInput ---
/**
 * @component PinInput (Unstyled)
 * @description
 * Componente **sem estilos próprios** ("unstyled") para entrada de PIN/OTP.
 * Ele fornece a estrutura HTML, a lógica de interação (digitação, foco, backspace, colar)
 * e atributos de acessibilidade, mas delega **toda a responsabilidade de estilização**
 * para o componente pai através das props `inputClassName` (para cada dígito) e
 * `inputContainerClassName` (para o layout do grupo de dígitos).
 *
 * **Funcionamento:**
 * - Renderiza um input para cada dígito do PIN.
 * - Gerencia o foco automaticamente ao digitar ou usar Backspace/Setas.
 * - Permite colar (paste) um código e o distribui pelos campos.
 * - Filtra entradas não numéricas.
 * - Sincroniza o estado interno com a prop `value`.
 * - Inclui um input oculto (`type="hidden"`) para facilitar submissão em formulários padrão HTML se `name` for fornecido.
 *
 * **Estilização Obrigatória pelo Pai:**
 * - **`inputClassName`**: Aplique classes CSS aqui para definir a aparência de cada caixa de dígito (tamanho, borda, fundo, texto, foco, etc.).
 * - **`inputContainerClassName`**: Aplique classes CSS aqui para definir como as caixas de dígito são dispostas (ex: `flex gap-2`, `grid grid-cols-4 gap-1`).
 *
 * **Gerenciamento de Erro:**
 * Segue o padrão dos outros inputs:
 * 1.  Calcula erros internos (obrigatoriedade, comprimento).
 * 2.  Comunica o erro resultante ao pai via `onErrorChange`.
 * 3.  O pai renderiza a mensagem de erro e passa `isInvalid` e `'aria-describedby'` de volta para controle visual (implícito, pois não há estilo base) e acessibilidade.
 *
 * **Acessibilidade:**
 * - Usa `type="tel"` e `inputMode="numeric"` para otimizar teclados móveis.
 * - `role="group"` no container dos inputs.
 * - `aria-label` individual para cada dígito.
 * - Gerencia `aria-invalid` e `aria-describedby` com base nas props recebidas do pai.
 * - Suporta `autoComplete="one-time-code"`.
 *
 * @usage
 * Ideal para campos de verificação de código (PIN, OTP) onde se deseja controle total sobre a aparência e layout.
 *
 * @example - Como usar com Tailwind CSS para estilização e gerenciamento de erro no pai:
 * ```jsx
 * const ParentComponent = () => {
 *   const [pin, setPin] = useState('');
 *   const [pinError, setPinError] = useState<string | null>(null);
 *   const [attemptedSubmit, setAttemptedSubmit] = useState(false);
 *   const pinErrorId = 'pin-error-msg';
 *
 *   const handlePinErrorChange = (errorMsg: string | null) => {
 *     setPinError(errorMsg);
 *   };
 *
 *   const handleSubmit = (e) => {
 *     e.preventDefault();
 *     setAttemptedSubmit(true);
 *     setPinError(pinError => pinError); // Força reavaliação
 *     if (!pinError) {
 *       console.log("PIN Válido:", pin);
 *       // ... submit
 *     } else {
 *       console.log("Erro no PIN:", pinError);
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit} className="space-y-4">
 *       <PinInput
 *         label="Código de Verificação"
 *         length={6} // Exemplo com 6 dígitos
 *         value={pin}
 *         onChange={setPin}
 *         required
 *         attemptedSubmit={attemptedSubmit}
 *         onErrorChange={handlePinErrorChange}
 *         isInvalid={!!pinError}
 *         aria-describedby={pinError ? pinErrorId : undefined} // Note as aspas na prop
 *         // --- Estilização Fornecida Pelo Pai (Exemplo Tailwind) ---
 *         containerClassName="max-w-xs mx-auto" // Centraliza o container geral
 *         labelClassName="block text-sm font-medium text-gray-700 mb-1 text-center" // Estilo do label
 *         inputContainerClassName="flex justify-center gap-2" // Layout Flex com espaçamento para os inputs
 *         inputClassName={`
 *           w-10 h-10 text-center text-lg font-semibold border rounded-md shadow-sm
 *           ${!!pinError ? 'border-red-500 ring-red-500' : 'border-gray-300'}
 *           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
 *           disabled:bg-gray-100 disabled:cursor-not-allowed
 *         `} // Aparência de cada input (tamanho, borda, texto, foco, erro)
 *         // ---------------------------------------------------------
 *         name="verification_code" // Para submissão via formulário
 *       />
 *       {pinError && ( // Renderiza a mensagem de erro externamente
 *         <p id={pinErrorId} className="text-red-600 text-xs mt-1 text-center">
 *           {pinError}
 *         </p>
 *       )}
 *       <button type="submit" className="block mx-auto px-4 py-2 bg-blue-600 text-white rounded">Verificar</button>
 *     </form>
 *   );
 * }
 * ```
 */
export const PinInput = forwardRef<HTMLInputElement, PinInputProps>(
  (
    {
      length = 4,
      value = '',
      onChange,
      // --- Props de Estilização (essenciais!) ---
      containerClassName = '', // Para o div mais externo
      labelClassName = '',     // Para o label
      inputContainerClassName = '', // Para o div que agrupa os inputs (layout)
      inputClassName = '',      // Para CADA input individual (aparência)
      // ------------------------------------------
      label,
      required = false,
      disabled = false,
      id,
      name,
      autoFocus = false,
      // --- Props de Erro ---
      externalError,
      requiredMessage = "Código é obrigatório",
      attemptedSubmit = false,
      onErrorChange,
      isInvalid: isInvalidProp, // Recebe do pai
      'aria-describedby': ariaDescribedbyProp, // Recebe do pai
      ...rest // Coleta outras props HTML para passar aos inputs
    },
    ref // Ref encaminhada para o PRIMEIRO input
  ) => {
    // --- Hooks e Lógica Interna ---
    const uniqueComponentId = useId();
    const baseId = id || `pin-${uniqueComponentId}`; // ID base para elementos internos
    // Estado para os valores de cada dígito individualmente
    const [pinValues, setPinValues] = useState<string[]>(() => Array(length).fill(''));
    // Refs para cada input, para gerenciamento de foco programático
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Efeito para sincronizar o estado interno (`pinValues`) com a prop `value` externa.
    useEffect(() => {
        const currentInternalPin = pinValues.join('');
        // Só atualiza se o valor externo for diferente do interno concatenado
        if (value !== currentInternalPin) {
            const newPinValues = Array(length).fill(''); // Cria array vazio
            // Preenche com os dígitos válidos da prop 'value'
            for (let i = 0; i < Math.min(length, value.length); i++) {
                if (/^\d$/.test(value[i])) { // Garante que só dígitos entrem
                    newPinValues[i] = value[i];
                }
            }
            // Atualiza o estado interno somente se o resultado for diferente do que já está lá
            // (Evita loop de renderização se o pai normalizar o valor de forma diferente)
            if (newPinValues.join('') !== currentInternalPin) {
               setPinValues(newPinValues);
            }
        }
    }, [value, length, pinValues]); // Dependências: valor externo, comprimento, estado interno

    // Efeito para focar no primeiro input ao montar, se `autoFocus` for true e o valor inicial for vazio.
    useEffect(() => {
      if (autoFocus && inputRefs.current[0] && value === '') {
        inputRefs.current[0]?.focus();
      }
    }, [autoFocus, value]); // Dependências: prop autoFocus, valor inicial

    // Calcula o erro de validação interna (comprimento) usando memorização.
    const internalValidationError = useMemo(() => validatePinCompleteness(pinValues.join(''), length), [pinValues, length]);

    // Calcula a mensagem de erro final a ser comunicada, com prioridades, usando memorização.
    const currentErrorMessage = useMemo(() => {
         const isValueEmpty = pinValues.join('') === '';
         let error: string | null = null;
         if (externalError) {
            error = externalError; // 1. Prioridade: Erro externo
         } else if (required && isValueEmpty && attemptedSubmit) {
            error = requiredMessage; // 2. Prioridade: Obrigatório vazio após tentativa
         } else if (!isValueEmpty && internalValidationError) {
            error = internalValidationError; // 3. Prioridade: Erro de comprimento (se não vazio)
         }
         return error;
     }, [externalError, required, pinValues, attemptedSubmit, requiredMessage, internalValidationError]); // Dependências

     // Efeito para chamar a callback `onErrorChange` do pai sempre que o erro calculado mudar.
     useEffect(() => {
        if (onErrorChange) {
             onErrorChange(currentErrorMessage);
        }
     }, [currentErrorMessage, onErrorChange]); // Dependências: erro calculado, callback do pai


    // --- Handlers de Eventos ---

    /** Foca e seleciona o conteúdo de um input específico pelo índice. */
    const focusInput = (index: number) => {
        if (index >= 0 && index < length && inputRefs.current[index]) {
            inputRefs.current[index]?.focus();
            inputRefs.current[index]?.select(); // Seleciona para facilitar substituição
        }
    };

    /** Manipula a mudança de valor em um input individual. */
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const digit = e.target.value.slice(-1); // Pega apenas o último caractere digitado

        // Ignora se não for um dígito (e não for string vazia, que acontece no backspace/delete)
        if (!/^\d$/.test(digit) && digit !== '') {
            // Reverte para o valor anterior se a entrada for inválida
            e.target.value = pinValues[index];
            return;
        }

        // Atualiza o estado interno (`pinValues`)
        const newPinValues = [...pinValues];
        newPinValues[index] = digit;
        setPinValues(newPinValues);

        // Notifica o componente pai com a string completa
        const newValue = newPinValues.join('');
        onChange(newValue);

        // Move o foco para o próximo input se um dígito foi inserido e não é o último campo
        if (digit !== '' && index < length - 1) {
            focusInput(index + 1);
        }
    };

    /** Manipula teclas como Backspace, Delete, Setas. */
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
         switch (e.key) {
            case 'Backspace':
                e.preventDefault(); // Previne navegação do navegador
                const backspacePinValues = [...pinValues];
                if (backspacePinValues[index]) {
                    // Se o campo atual tem valor, apaga o valor
                    backspacePinValues[index] = '';
                    setPinValues(backspacePinValues);
                    onChange(backspacePinValues.join('')); // Notifica o pai
                } else if (index > 0) {
                    // Se o campo atual está vazio, move o foco para o campo anterior
                    focusInput(index - 1);
                }
                break;
            case 'Delete':
                e.preventDefault();
                const deletePinValues = [...pinValues];
                if (deletePinValues[index]) {
                    // Se tem valor, apaga, mas não move o foco
                    deletePinValues[index] = '';
                    setPinValues(deletePinValues);
                    onChange(deletePinValues.join(''));
                }
                break;
            case 'ArrowLeft':
                // Move foco para a esquerda se não for o primeiro campo
                if (index > 0) focusInput(index - 1);
                break;
            case 'ArrowRight':
                // Move foco para a direita se não for o último campo
                if (index < length - 1) focusInput(index + 1);
                break;
            // Outras teclas (dígitos, Tab) são tratadas pelo navegador e handleInputChange
        }
    };

    /** Manipula o evento de colar (paste). */
     const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault(); // Previne o comportamento padrão de colar
        const pastedData = e.clipboardData.getData('text/plain').trim();
        const digits = pastedData.replace(/\D/g, ''); // Extrai apenas dígitos
        if (digits.length === 0) return; // Ignora se não houver dígitos

        // Descobre em qual input o paste ocorreu
        const currentFocusIndex = inputRefs.current.findIndex(input => input === e.target);
        const startIndex = currentFocusIndex >= 0 ? currentFocusIndex : 0; // Começa do input focado ou do primeiro

        const newPinValues = [...pinValues];
        let pasteIdx = 0; // Índice para percorrer os dígitos colados
        let lastFilledIndex = startIndex -1; // Índice do último input preenchido pelo paste

        // Preenche os inputs a partir do startIndex com os dígitos colados
        for(let i = startIndex; i < length && pasteIdx < digits.length; i++) {
            newPinValues[i] = digits[pasteIdx];
            lastFilledIndex = i; // Atualiza o último índice preenchido
            pasteIdx++;
        }

        // Atualiza o estado interno e notifica o pai
        setPinValues(newPinValues);
        onChange(newPinValues.join(''));

        // Foca no último input preenchido pelo paste (ou no último input se tudo foi preenchido)
        focusInput(Math.min(length - 1, lastFilledIndex));
    };


    // Determina o valor final do atributo `aria-invalid`. Usa a prop passada pelo pai.
    const isInvalid = isInvalidProp ?? false;

    // --- Renderização ---
    return (
      // Container mais externo: Classe CSS controlada pelo pai.
      <div className={containerClassName}>
        {/* Label (opcional): Classe CSS controlada pelo pai. */}
        {label && (
            <label
                htmlFor={`${baseId}-0`} // Aponta para o primeiro input
                className={labelClassName}
                >
                {label}
                {/* Indicador de obrigatório (estilização via labelClassName) */}
                {required && <span> *</span>}
            </label>
        )}

        {/* Container dos Inputs: Layout (flex/grid) e espaçamento controlados pelo pai. */}
        <div
          className={inputContainerClassName}
          role="group" // Semântica para grupo de controles relacionados
          aria-label={label || 'Código PIN'} // Label acessível para o grupo
        >
          {/* Mapeia o array de valores para renderizar cada input */}
          {pinValues.map((digit, index) => (
            <input
              key={`${baseId}-${index}`}
              // Associa a ref: primeira recebe a 'ref' encaminhada, as outras usam 'inputRefs' interno.
              ref={index === 0 ? ref : (el) => { inputRefs.current[index] = el; }}
              id={`${baseId}-${index}`}
              // --- Atributos Funcionais e de Acessibilidade ---
              type="tel" // Tipo semântico para números, melhora teclado móvel
              inputMode="numeric" // Sugestão mais forte para teclado numérico
              pattern="\d{1}" // Validação HTML para um dígito (suporte variável)
              maxLength={1}   // Garante apenas um caractere por input
              value={digit}   // Valor controlado do dígito atual
              // --- Event Handlers ---
              onChange={(e) => handleInputChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()} // Seleciona ao focar para fácil substituição
              // --- Estados e Atributos de Acessibilidade ---
              disabled={disabled}
              // 'required' semanticamente faz mais sentido no primeiro input do grupo
              required={required && index === 0}
              aria-label={`Dígito ${index + 1}`} // Label individual para leitores de tela
              // Só adiciona aria-describedby se estiver inválido e o pai tiver passado o ID
              aria-describedby={isInvalid ? ariaDescribedbyProp : undefined}
              aria-invalid={isInvalid} // Indica estado inválido para acessibilidade
              autoComplete="one-time-code" // Ajuda navegadores/gerenciadores a preencher OTPs
              // --- Estilização VEM DO PAI ---
              className={inputClassName} // Aplica a classe passada pelo pai a este input
              // ------------------------------
              {...rest} // Permite passar outras props HTML padrão (ex: data-testid)
            />
          ))}
        </div>

        {/* Input Oculto para submissão de formulário padrão */}
        {name && <input type="hidden" name={name} value={pinValues.join('')} />}
      </div>
    );
  }
);

// Define nome de exibição, útil para React DevTools, destacando ser 'Unstyled'.
PinInput.displayName = 'PinInput (Unstyled)';


