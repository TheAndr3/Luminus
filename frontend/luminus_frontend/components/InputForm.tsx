'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'react-feather'; // Ícones

// --- Interface de Props com JSDoc ---

/**
 * @interface InputFormProps
 * @description Define as props aceitas pelo componente InputForm.
 */
interface InputFormProps {
  /**
   * Tipo do input: 'text', 'email', 'password', 'tel'.
   * Ativa features como formatação para 'tel' ou toggle para 'password'.
   */
  type: 'text' | 'email' | 'password' | 'tel';

  /** Texto do label acima do input. */
  label: string;

  /** Texto de placeholder dentro do input. */
  placeholder: string;

  /**
   * Valor atual do input (controlado pelo componente pai).
   * Para 'tel', deve ser o valor FORMATADO.
   */
  value: string;

  /**
   * Callback chamado na mudança do input.
   * Para 'tel', o evento terá `e.target.value` FORMATADO.
   */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * (Opcional) Adiciona '*' ao label e atributo `required`.
   * @default false
   */
  required?: boolean;

  /**
   * (Opcional) Mensagem de erro a ser exibida. Aplica estilo de erro.
   * @default null
   */
  error?: string | null;

  /**
   * (Opcional) Classes CSS adicionais para o container principal (div externo).
   * Útil para layout (largura, margens externas).
   * @default ''
   */
  className?: string;

  /**
   * (Opcional) Desabilita o input.
   * @default false
   */
  disabled?: boolean;

  /** (Opcional) Atributo `minLength` do HTML input. */
  minLength?: number;

  /**
   * (Opcional) Classes CSS (ex: Tailwind) a serem adicionadas ao elemento `<label>`.
   * Permite customizar aparência do label (cor, tamanho, alinhamento, etc.).
   * Estas classes são adicionadas às classes base do label.
   * @default ''
   * @example "text-center text-lg text-purple-700"
   */
  labelClassName?: string;

  /**
   * (Opcional) Classes CSS (ex: Tailwind) a serem adicionadas ao elemento `<input>`.
   * Permite customizar aparência do input (padding, borda, fonte, placeholder, etc.).
   * Estas classes são adicionadas às classes base do input e podem sobrescrever estilos padrão.
   * @default ''
   * @example "p-1 text-base border-2 placeholder:text-red-400"
   */
  inputClassName?: string;
}

/**
 * @function formatPhoneNumber
 * @description Formata uma string de dígitos no padrão de telefone (XX) XXXXX-XXXX.
 * @param {string} digits - String contendo apenas dígitos.
 * @returns {string} - Número de telefone formatado.
 */
const formatPhoneNumber = (digits: string): string => {
  const cleaned = digits.replace(/\D/g, '').slice(0, 11);
  const length = cleaned.length;
  if (length === 0) return '';
  if (length <= 2) return `(${cleaned}`;
  if (length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
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

/**
 * @component InputForm
 * @description
 * Componente de input reutilizável para formulários React/Next.js.
 * Oferece tipos ('text', 'email', 'password', 'tel'), label, placeholder,
 * controle de estado via props (value/onChange), exibição de erro,
 * estado desabilitado, formatação automática para telefone (XX) XXXXX-XXXX,
 * e toggle de visibilidade para senha.
 * Permite customização externa via `className` (container) e interna via
 * `labelClassName` (label) e `inputClassName` (input).
 *
 * @usage
 * O componente pai gerencia o estado do 'value' e fornece 'onChange'.
 * Validações são feitas no pai, que passa mensagens via prop 'error'.
 * Use `className`, `labelClassName`, `inputClassName` para customizações de estilo.
 * Para validação de telefone, use a função exportada `unformatPhoneNumber`.
 *
 * @example
 * // Exemplo de customização de estilo
 * <InputForm
 *   type="text"
 *   label="Campo Customizado"
 *   value={customValue}
 *   onChange={(e) => setCustomValue(e.target.value)}
 *   className="w-1/2" // Controla largura externa
 *   labelClassName="text-center text-blue-600 font-bold" // Centraliza e colore o label
 *   inputClassName="p-1 text-xs border-blue-300" // Altera padding, fonte e borda do input
 * />
 */
export const InputForm = ({
  type,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  error = null,
  className = '',
  disabled = false,
  minLength,
  labelClassName = '',
  inputClassName = '',
}: InputFormProps) => {
  // --- Estados Internos ---

  /** Estado para controlar a visibilidade da senha. */
  const [showPassword, setShowPassword] = useState(false);

  /** Estado para verificar se o componente foi montado no cliente, evitando problemas com SSR. */
  const [isMounted, setIsMounted] = useState(false);

  // --- Efeito de Montagem ---

  /**
   * @description Define o componente como montado após a renderização inicial no cliente.
   * Evita renderização inconsistente em SSR para tipos dinâmicos como 'password' e 'tel'.
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- Lógica do Tipo de Input ---

  /** Determina o tipo real do input, alterando para 'text' se a senha estiver visível. */
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // --- Handler de Mudança do Input ---

  /**
   * @function handleInputChange
   * @description Manipula a mudança do input, aplicando formatação para 'tel'.
   * Cria um evento sintético para garantir que o valor formatado seja passado ao callback.
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de mudança do input.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'tel') {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 11); // Limpa e limita a 11 dígitos
      const formattedValue = formatPhoneNumber(digits);
      const syntheticEvent = { ...e, target: { ...e.target, value: formattedValue } };
      onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    } else {
      onChange(e); // Passa o evento diretamente para outros tipos
    }
  };

  // --- Renderização Condicional para SSR ---

  // Renderiza uma versão estática para SSR se ainda não montado e o tipo for 'password' ou 'tel'
  if (!isMounted && (type === 'password' || type === 'tel')) {
    return (
      <div className={`mb-2 ${className}`}>
        <label className={`block text-gray-800 text-sm font-semibold mb-1 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <input
          type={type === 'password' ? 'password' : 'tel'}
          placeholder={type === 'tel' ? '(XX) XXXXX-XXXX' : placeholder}
          className={`w-full p-2.5 text-sm border border-gray-300 rounded-md ${inputClassName}`}
          disabled={disabled}
          readOnly // Impede interação antes da montagem
        />
      </div>
    );
  }

  // --- Cálculo de Atributos Dinâmicos ---

  /** Define o maxLength para 'tel' como 15 caracteres (formato completo: (XX) XXXXX-XXXX). */
  const actualMaxLength = type === 'tel' ? 15 : undefined;

  // --- JSX de Retorno (Renderização no Cliente) ---

  return (
    <div className={`mb-2 ${className}`}>
      {/* Label com indicação visual de campo obrigatório */}
      <label className={`block text-gray-800 text-sm font-semibold mb-1 ${labelClassName}`}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="relative"> {/* Container relativo para posicionar o ícone de toggle */}
        <input
          type={inputType}
          placeholder={type === 'tel' ? '(XX) XXXXX-XXXX' : placeholder}
          value={type === 'tel' ? formatPhoneNumber(unformatPhoneNumber(value)) : value}
          onChange={handleInputChange}
          required={required}
          disabled={disabled}
          minLength={minLength}
          maxLength={actualMaxLength}
          className={`
            w-full p-2.5 text-sm pr-10
            border ${error ? 'border-red-500' : 'border-gray-300'}
            rounded-md focus:ring-2 focus:ring-green-500
            focus:border-transparent transition
            text-gray-900 font-medium
            ${disabled ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'}
            ${inputClassName}
          `}
          inputMode={type === 'tel' ? 'tel' : type === 'email' ? 'email' : undefined} // Otimiza o teclado virtual
        />
        {/* Botão de toggle para senha, visível apenas no tipo 'password' */}
        {type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            tabIndex={-1} // Remove do fluxo de navegação por teclado
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
          </button>
        )}
      </div>
      {/* Mensagem de erro, exibida apenas se 'error' for fornecido */}
      {error && (
        <div className="mt-0.5">
          <p className="text-red-500 text-xs">{error}</p>
        </div>
      )}
    </div>
  );
};