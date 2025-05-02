// -*- coding: utf-8 -*-
/**
 * @file PhoneInput.tsx
 * @description Define o componente PhoneInput, um campo de formulário para números de telefone
 *              brasileiros com máscara (XX) XXXXX-XXXX e validação básica de comprimento,
 *              baseado no componente BaseInput.
 * @version 1.0
 * @date 02-05-2025
 * @author Pedro
 */

// Diretiva de Componente de Cliente, necessária para hooks (useState, useEffect) e interatividade.
'use client';

import React, { useState, useEffect, useMemo, forwardRef } from 'react';
// Importa o componente base e sua interface de propriedades.
import { BaseInput, BaseInputProps } from './BaseInput';

// --- Funções Auxiliares ---

/**
 * @function formatPhoneNumber
 * @description Aplica a máscara de telefone brasileiro (XX) XXXXX-XXXX a uma string de dígitos.
 * @param {string} digits String contendo apenas dígitos numéricos.
 * @returns {string} A string formatada com a máscara, ou a formatação parcial se incompleta.
 *                   Retorna string vazia se a entrada for vazia. Limita a 11 dígitos.
 */
const formatPhoneNumber = (digits: string): string => {
  // 1. Limpa qualquer caractere não numérico e limita a 11 dígitos (máximo para celular com 9).
  const cleaned = digits.replace(/\D/g, '').slice(0, 11);
  const length = cleaned.length;

  // 2. Aplica a máscara progressivamente.
  if (length === 0) return '';
  if (length <= 2) return `(${cleaned}`; // Ex: (1
  if (length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`; // Ex: (11) 9876
  // Formato final para 10 ou 11 dígitos.
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, length === 11 ? 7 : 6)}-${cleaned.slice(length === 11 ? 7 : 6, 11)}`;
  // Ex: (11) 98765-4321 ou (11) 8765-4321
};

/**
 * @function unformatPhoneNumber
 * @description Remove todos os caracteres não numéricos de uma string de telefone formatada.
 * @param {string} formattedValue A string de telefone com máscara (ou qualquer outra string).
 * @returns {string} Uma string contendo apenas os dígitos extraídos.
 */
export const unformatPhoneNumber = (formattedValue: string): string => {
  // Simplesmente remove tudo que não for dígito (0-9).
  return formattedValue.replace(/\D/g, '');
};

/**
 * @function validatePhoneNumberLength
 * @description Valida se o número de telefone (apenas dígitos) tem o comprimento esperado
 *              para um número brasileiro (10 para fixo, 11 para celular com 9º dígito).
 * @param {string} digits String contendo apenas os dígitos do telefone.
 * @returns {string | null} Retorna uma mensagem de erro se o comprimento for inválido
 *                          (menor que 10 ou maior que 11, mas não vazio), caso contrário, retorna `null`.
 */
const validatePhoneNumberLength = (digits: string): string | null => {
  // Só valida se houver algum dígito, mas o comprimento não for 10 ou 11.
  if (digits.length > 0 && (digits.length < 10 || digits.length > 11)) {
    return 'Número de telefone incompleto.';
  }
  // Comprimento 0, 10 ou 11 são considerados válidos quanto ao comprimento.
  return null;
};

// --- Interface de Props ---

/**
 * @interface PhoneInputProps
 * @description Define as propriedades aceitas pelo componente `PhoneInput`.
 * Herda de `BaseInputProps`, mas omite propriedades gerenciadas internamente
 * (`type`, `inputMode`, `maxLength`) ou substituídas pelo novo sistema de erro (`error`).
 */
export interface PhoneInputProps extends Omit<BaseInputProps, 'type' | 'inputMode' | 'maxLength' | 'error'> {
  /** Erro vindo de uma fonte externa (ex: validação de formato específico no backend). Tem prioridade. */
  externalError?: string | null;

  /** Mensagem de erro customizada para campo obrigatório vazio após tentativa de submissão. Padrão: "Telefone é obrigatório". */
  requiredMessage?: string;

  /** Sinaliza se houve uma tentativa de submissão do formulário. Padrão: false. */
  attemptedSubmit?: boolean;

  /**
   * @callback onErrorChange
   * @description Callback chamado quando o estado de erro *calculado internamente* (obrigatoriedade, comprimento) muda.
   * O componente pai usa esta informação para atualizar seu estado de erro, renderizar a mensagem
   * e passar de volta as props `isInvalid` e `ariaDescribedby`.
   * @param {string | null} errorMessage - A mensagem de erro atual, ou `null` se não houver erro.
   */
  onErrorChange?: (errorMessage: string | null) => void;

  // Nota: 'value' aqui espera/retorna o valor **formatado** com a máscara.
  // As props `isInvalid` e `ariaDescribedby` são herdadas e controladas pelo pai.
}

// --- Componente PhoneInput ---

/**
 * @component PhoneInput
 * @description
 * Componente especializado para entrada de números de telefone brasileiros, construído sobre `BaseInput`.
 * Aplica automaticamente a máscara `(XX) XXXXX-XXXX` enquanto o usuário digita e realiza
 * uma validação interna básica de comprimento (10 ou 11 dígitos).
 *
 * **Gerenciamento de Erro:**
 * 1.  **Cálculo Interno:** Avalia erros potenciais:
 *     a) Erro externo (`externalError`).
 *     b) Campo obrigatório (`required`) vazio após tentativa (`attemptedSubmit`).
 *     c) Validação de comprimento (10 ou 11 dígitos).
 * 2.  **Comunicação Externa:** Informa o erro resultante (ou `null`) ao pai via `onErrorChange`.
 * 3.  **Renderização Externa:** **NÃO** renderiza a mensagem de erro. O pai é responsável por:
 *     a) Receber a mensagem via `onErrorChange`.
 *     b) Renderizar a mensagem de erro.
 *     c) Passar `isInvalid` (baseado na existência de erro) de volta.
 *     d) Passar `ariaDescribedby` (apontando para a mensagem de erro) de volta.
 *
 * **Valor (`value` e `onChange`):**
 * - A prop `value` deve receber o valor **formatado** com a máscara.
 * - O `onChange` callback do pai receberá um evento sintético onde `event.target.value`
 *   também conterá o valor **formatado**. Para obter apenas os dígitos, use `unformatPhoneNumber`.
 *
 * @usage
 * Use em formulários para coletar números de telefone brasileiros.
 *
 * @example - Como usar com gerenciamento de erro no pai:
 * ```jsx
 * const ParentComponent = () => {
 *   const [phone, setPhone] = useState(''); // Armazena o valor FORMATADO
 *   const [phoneError, setPhoneError] = useState<string | null>(null);
 *   const [attemptedSubmit, setAttemptedSubmit] = useState(false);
 *   const phoneErrorId = 'phone-error-msg';
 *
 *   const handlePhoneErrorChange = (errorMsg: string | null) => {
 *     setPhoneError(errorMsg);
 *   };
 *
 *   const handleSubmit = (e) => {
 *     e.preventDefault();
 *     setAttemptedSubmit(true);
 *     // Força reavaliação chamando o setter do erro (mesmo que seja o mesmo valor)
 *     setPhoneError(phoneError => phoneError);
 *
 *     const digits = unformatPhoneNumber(phone); // Obter dígitos para validação/envio
 *     if (!phoneError) {
 *       console.log("Formulário válido, enviando dígitos:", digits);
 *       // ... lógica de envio com 'digits'
 *     } else {
 *       console.log("Formulário inválido:", phoneError);
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <PhoneInput
 *         label="Telefone Celular"
 *         name="phone_number"
 *         value={phone} // Passa o valor formatado
 *         onChange={(e) => {
 *             setPhone(e.target.value); // Armazena o valor formatado vindo do evento
 *         }}
 *         required
 *         attemptedSubmit={attemptedSubmit}
 *         onErrorChange={handlePhoneErrorChange} // Recebe o erro calculado
 *         isInvalid={!!phoneError} // Define se tem erro visual
 *         ariaDescribedby={phoneError ? phoneErrorId : undefined} // Liga à mensagem de erro
 *       />
 *       {phoneError && ( // Renderiza a mensagem de erro externamente
 *         <p id={phoneErrorId} className="text-red-600 text-xs mt-1">
 *           {phoneError}
 *         </p>
 *       )}
 *       <button type="submit">Enviar</button>
 *     </form>
 *   );
 * }
 * ```
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      // Props específicas e de controle de erro
      externalError,
      requiredMessage = "Telefone é obrigatório",
      attemptedSubmit = false,
      onErrorChange,
      // Props de BaseInput (desestruturadas ou capturadas)
      onChange, // Handler onChange original fornecido pelo pai
      placeholder = '(XX) XXXXX-XXXX', // Placeholder padrão com a máscara
      value, // Valor formatado vindo do pai
      required,
      disabled,
      isInvalid: isInvalidProp, // Estado 'isInvalid' controlado pelo pai
      ariaDescribedby: ariaDescribedbyProp, // ID da descrição (erro) controlado pelo pai
      ...restProps // Coleta outras props de BaseInput (label, name, id, etc.)
    },
    ref // Ref encaminhada
  ) => {
    // Estado para armazenar o erro da validação interna de comprimento.
    const [internalValidationError, setInternalValidationError] = useState<string | null>(null);

    // Efeito para validar o comprimento sempre que o valor (formatado) mudar.
    useEffect(() => {
      // Extrai apenas os dígitos do valor atual (formatado).
      const currentDigits = unformatPhoneNumber(typeof value === 'string' ? value : '');
      // Executa a validação de comprimento.
      const validationError = validatePhoneNumberLength(currentDigits);
      // Atualiza o estado do erro de validação interna.
      setInternalValidationError(validationError);
    }, [value]); // Dependência: 'value' (o valor formatado da prop).

    // Calcula a mensagem de erro atual a ser comunicada, com prioridades.
    const currentErrorMessage = useMemo(() => {
      const isValueEmpty = !value || String(value).trim() === '';
      const currentDigits = unformatPhoneNumber(typeof value === 'string' ? value : '');
      let error: string | null = null;

      if (externalError) {
        // 1ª Prioridade: Erro externo.
        error = externalError;
      } else if (required && isValueEmpty && attemptedSubmit) {
        // 2ª Prioridade: Campo obrigatório vazio após tentativa.
        error = requiredMessage;
      } else if (currentDigits.length > 0 && internalValidationError) {
        // 3ª Prioridade: Erro de validação de comprimento (apenas se não vazio).
        error = internalValidationError;
      }
      // Retorna o erro de maior prioridade ou null.
      return error;
    }, [externalError, required, value, attemptedSubmit, requiredMessage, internalValidationError]);
    // Dependências: Recalcula se qualquer um destes mudar.

    // Efeito para notificar o pai sobre mudanças na mensagem de erro calculada.
    useEffect(() => {
      if (onErrorChange) {
        onErrorChange(currentErrorMessage);
      }
      // Considerar useCallback no pai para onErrorChange se performance for crítica.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentErrorMessage /* , onErrorChange */]);

    /**
     * Manipulador do evento onChange do input interno.
     * Intercepta o valor digitado, aplica a formatação e chama o `onChange` do pai
     * com o valor formatado dentro de um evento sintético.
     */
    const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // 1. Obtém apenas os dígitos do valor atual do input.
      const digits = unformatPhoneNumber(e.target.value);
      // 2. Formata esses dígitos com a máscara.
      const formattedValue = formatPhoneNumber(digits);

      // 3. Se o pai forneceu um handler `onChange`...
      if (onChange) {
        // Cria um evento sintético para passar ao pai.
        // É importante clonar o evento e o target, e então sobrescrever 'value'.
        const syntheticEvent = {
          ...e, // Copia propriedades do evento original (type, timestamp, etc.)
          target: {
            ...e.target, // Copia propriedades do target original (name, id, etc.)
            value: formattedValue, // Define o valor como o FORMATADO
          },
        };
        // Chama o handler do pai com o evento sintético modificado.
        onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      }
      // Nota: O estado 'value' no pai será atualizado com 'formattedValue'.
      // A validação de comprimento será acionada pelo useEffect que depende de 'value'.
    };

    // Determina o estado final de 'isInvalid' a ser passado para BaseInput.
    // Usa diretamente a prop `isInvalidProp` fornecida pelo componente pai.
    const isInvalid = isInvalidProp ?? false;

    // Renderiza o BaseInput configurado para telefone.
    return (
      <BaseInput
        ref={ref} // Encaminha a ref.
        // --- Configurações Específicas de PhoneInput ---
        type="tel"          // Tipo semântico para telefone.
        inputMode="tel"     // Otimiza teclado em dispositivos móveis.
        maxLength={15}      // Comprimento máximo da string formatada: (XX) XXXXX-XXXX
        placeholder={placeholder} // Placeholder com a máscara.
        // --- Props Controladas ou Repassadas ---
        value={value ?? ''} // Usa o valor formatado vindo do pai.
        onChange={handlePhoneInputChange} // Usa nosso handler que formata e chama o pai.
        required={required}
        disabled={disabled}
        // --- Props de Estado de Erro e Acessibilidade (CONTROLADAS PELO PAI) ---
        isInvalid={isInvalid}               // Passa o estado de inválido recebido do pai.
        ariaDescribedby={ariaDescribedbyProp} // Passa o ID da descrição recebido do pai.
        // --- Restante das Props ---
        {...restProps} // Passa outras props (label, id, name, etc.) para BaseInput.
      />
      // Nenhuma mensagem de erro é renderizada aqui dentro.
    );
  }
);

// Define um nome de exibição para depuração.
PhoneInput.displayName = 'PhoneInput';