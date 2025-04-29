'use client';

import React from 'react';
import { BaseInput, BaseInputProps } from './BaseInput'; // Importa BaseInput e suas props

// --- Funções Auxiliares de Formatação (extraídas da lógica do InputForm) ---

/**
 * @function formatPhoneNumber
 * @description Formata uma string de dígitos no padrão (XX) XXXXX-XXXX.
 * @param {string} digits - String contendo apenas dígitos.
 * @returns {string} - Número de telefone formatado.
 */
const formatPhoneNumber = (digits: string): string => {
  // Remove tudo que não for dígito e limita a 11 caracteres
  const cleaned = digits.replace(/\D/g, '').slice(0, 11);
  const length = cleaned.length;

  if (length === 0) return '';
  if (length <= 2) return `(${cleaned}`; // (XX
  if (length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`; // (XX) XXXXX
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`; // (XX) XXXXX-XXXX
};

/**
 * @function unformatPhoneNumber
 * @description Remove a formatação de um número de telefone, retornando apenas os dígitos.
 * @param {string} formattedValue - Número de telefone formatado.
 * @returns {string} - String contendo apenas os dígitos.
 */
export const unformatPhoneNumber = (formattedValue: string): string => {
  return formattedValue.replace(/\D/g, '');
};

// --- Interface de Props ---

/**
 * @interface PhoneInputProps
 * @description Define as propriedades aceitas pelo componente PhoneInput.
 * Herda BaseInputProps, omitindo 'type', 'inputMode' e 'maxLength',
 * pois são controlados internamente para a formatação de telefone.
 * O 'onChange' é mantido na interface, mas sua implementação é interceptada.
 */
export interface PhoneInputProps extends Omit<BaseInputProps, 'type' | 'inputMode' | 'maxLength'> {
  // Nenhuma propriedade adicional específica por enquanto.
}

// --- Componente PhoneInput ---

/**
 * @component PhoneInput
 * @description
 * Componente especializado para entrada de números de telefone (formato brasileiro),
 * construído sobre o BaseInput.
 * Aplica automaticamente a máscara (XX) XXXXX-XXXX enquanto o usuário digita.
 * Herda as funcionalidades de BaseInput (label, erro, required, etc.).
 * O componente é controlado: o valor formatado é passado para o `onChange` do pai.
 *
 * @usage
 * Use este componente para campos de telefone. O valor gerenciado pelo estado pai
 * deve ser o valor formatado. Para obter apenas os dígitos, use a função
 * exportada `unformatPhoneNumber`.
 *
 * @example
 * const [phone, setPhone] = useState('');
 * const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *   setPhone(e.target.value); // Recebe o valor já formatado
 * };
 * // Para validação ou envio, use: const digits = unformatPhoneNumber(phone);
 *
 * <PhoneInput
 *   label="Telefone Celular"
 *   value={phone}
 *   onChange={handlePhoneChange}
 *   placeholder="(XX) XXXXX-XXXX"
 *   required
 *   error={phoneError}
 * />
 */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      onChange, // Captura o onChange passado pelo pai
      placeholder = '(XX) XXXXX-XXXX', // Define um placeholder padrão útil
      value, // O valor recebido DEVE ser o formatado (gerenciado pelo pai)
      ...restProps // Pega todas as outras props de BaseInputProps (label, error, etc.)
    },
    ref
  ) => {
    /**
     * Manipulador de mudança que intercepta o evento, formata o valor
     * e chama o onChange original do pai com o valor formatado.
     */
    const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // 1. Obtém os dígitos puros do valor atual do input
      const digits = unformatPhoneNumber(e.target.value);
      // 2. Formata esses dígitos
      const formattedValue = formatPhoneNumber(digits);

      // 3. Chama o onChange do pai, se existir, mas com o valor formatado
      if (onChange) {
        // Cria um evento sintético para garantir que e.target.value contenha o valor formatado
        // Isso mantém a consistência de um componente controlado padrão
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: formattedValue, // Atualiza o valor no evento
          },
        };
        onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      }
    };

    return (
      <BaseInput
        ref={ref}
        // Define atributos específicos para telefone
        type="tel"
        inputMode="tel" // Otimiza teclado móvel
        maxLength={15} // Limita ao tamanho máximo formatado: (XX) XXXXX-XXXX
        // Passa o placeholder (padrão ou customizado)
        placeholder={placeholder}
        // Passa o valor formatado recebido do pai para exibição
        value={value}
        // Passa o nosso manipulador customizado que aplica a máscara
        onChange={handlePhoneInputChange}
        // Passa todas as outras props para o BaseInput
        {...restProps}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';