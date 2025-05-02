// -*- coding: utf-8 -*-
/**
 * @file PasswordInput.tsx
 * @description Define o componente PasswordInput, um campo de formulário para senhas
 *              com funcionalidade de mostrar/ocultar e validação de força interna,
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
// Importa ícones para o botão de mostrar/ocultar senha.
import { Eye, EyeOff } from 'react-feather'; // Certifique-se de que react-feather está instalado.

/**
 * @function validatePasswordStrength
 * @description Valida a força de uma senha com base em critérios pré-definidos.
 * @param {string} password A senha a ser validada.
 * @returns {string | null} Uma string descrevendo os requisitos faltantes, ou `null` se a senha for forte o suficiente.
 *                          Retorna `null` também se a senha estiver vazia.
 */
const validatePasswordStrength = (password: string): string | null => {
  // Não valida força se o campo estiver vazio, isso será tratado como erro de "obrigatório" se aplicável.
  if (!password) {
    return null;
  }

  const missingRequirements: string[] = [];
  const minLength = 8; // Requisito: Comprimento mínimo
  const specialChars = /[!@#$%^&*(),.?":{}|<>_-]/; // Requisito: Caracteres especiais

  // Verifica cada requisito e adiciona à lista de faltantes se não for cumprido.
  if (password.length < minLength) missingRequirements.push(`mínimo ${minLength} caracteres`);
  if (!/[A-Z]/.test(password)) missingRequirements.push("1 letra maiúscula");
  if (!/[a-z]/.test(password)) missingRequirements.push("1 letra minúscula");
  if (!/\d/.test(password)) missingRequirements.push("1 número");
  if (!specialChars.test(password)) missingRequirements.push("1 caractere especial");

  // Se houver requisitos faltantes, monta a mensagem de erro.
  if (missingRequirements.length > 0) {
    return `Senha precisa incluir: ${missingRequirements.join('; ')}.`;
  }

  // Se todos os requisitos foram cumpridos, retorna null (sem erro de força).
  return null;
};


/**
 * @interface PasswordInputProps
 * @description Define as propriedades aceitas pelo componente `PasswordInput`.
 * Herda de `BaseInputProps`, mas omite propriedades gerenciadas internamente
 * (`type`, `inputMode`, `endAdornment`) ou substituídas pelo novo sistema de erro (`error`).
 */
export interface PasswordInputProps extends Omit<BaseInputProps, 'type' | 'inputMode' | 'endAdornment' | 'error'> {
  /** Erro vindo de uma fonte externa (ex: validação de backend após submissão). Tem prioridade sobre erros internos. */
  externalError?: string | null;

  /** Mensagem de erro customizada a ser exibida quando o campo é obrigatório (`required={true}`) e está vazio após uma tentativa de submissão. Padrão: "Senha é Obrigatório". */
  requiredMessage?: string;

  /** Sinaliza se houve uma tentativa de submissão do formulário. Usado para decidir se o erro de campo obrigatório deve ser considerado. Padrão: false. */
  attemptedSubmit?: boolean;

  /**
   * @callback onErrorChange
   * @description Callback chamado sempre que o estado de erro *calculado internamente* pelo PasswordInput muda.
   * O componente pai deve usar esta informação para atualizar seu próprio estado de erro e decidir
   * como renderizar a mensagem de erro e se deve passar `isInvalid={true}`.
   * @param {string | null} errorMessage - A mensagem de erro atual (considerando erro externo, obrigatoriedade e força), ou `null` se não houver erro.
   */
  onErrorChange?: (errorMessage: string | null) => void;

  /** Texto do `aria-label` para o botão quando a senha está oculta (ação: mostrar). Padrão: "Mostrar senha". */
  showPasswordLabel?: string;
  /** Texto do `aria-label` para o botão quando a senha está visível (ação: ocultar). Padrão: "Ocultar senha". */
  hidePasswordLabel?: string;
  /** Classes CSS para aplicar aos ícones de olho (mostrar/ocultar). */
  iconClassName?: string;

  // Nota: As propriedades `isInvalid` e `ariaDescribedby` são herdadas de BaseInputProps.
  // Elas NÃO são calculadas aqui. O componente pai deve recebê-las (via `onErrorChange` implícito)
  // e passá-las de volta para controlar a aparência de erro do BaseInput e a acessibilidade.
}


/**
 * @component PasswordInput
 * @description
 * Componente especializado para entrada de senhas, construído sobre o `BaseInput`.
 * Inclui funcionalidade para mostrar/ocultar a senha e realiza validação interna
 * da força da senha.
 *
 * **Gerenciamento de Erro Refatorado:**
 * 1.  **Cálculo Interno:** Avalia erros potenciais na seguinte ordem de prioridade:
 *     a) Erro externo (`externalError`).
 *     b) Campo obrigatório não preenchido após tentativa de submissão (`required`, `value`, `attemptedSubmit`).
 *     c) Validação de força da senha (se preenchido).
 * 2.  **Comunicação Externa:** Informa o erro resultante (ou `null`) ao componente pai através da prop `onErrorChange`.
 * 3.  **Renderização Externa:** **NÃO** renderiza a mensagem de erro diretamente. O componente pai é responsável por:
 *     a) Receber a mensagem de erro via `onErrorChange`.
 *     b) Renderizar a mensagem de erro onde desejar.
 *     c) Passar a prop `isInvalid` (geralmente `!!errorMessage`) de volta para o `PasswordInput` para controle visual da borda de erro no `BaseInput`.
 *     d) Passar a prop `ariaDescribedby` (apontando para o ID da mensagem de erro renderizada) de volta para o `PasswordInput` para acessibilidade.
 *
 * @usage
 * Ideal para campos de senha em formulários de login, registro ou atualização de senha.
 *
 * @example - Como usar com gerenciamento de erro no pai:
 * ```jsx
 * const ParentComponent = () => {
 *   const [password, setPassword] = useState('');
 *   const [passwordError, setPasswordError] = useState<string | null>(null);
 *   const [attemptedSubmit, setAttemptedSubmit] = useState(false);
 *   const passwordErrorId = 'password-error-msg';
 *
 *   const handlePasswordErrorChange = (errorMsg: string | null) => {
 *     setPasswordError(errorMsg);
 *   };
 *
 *   const handleSubmit = (e) => {
 *     e.preventDefault();
 *     setAttemptedSubmit(true);
 *     // Trigger validation check by ensuring state update even if error is already set
 *     setPasswordError(passwordError => passwordError);
 *
 *     if (!passwordError) {
 *       console.log("Formulário válido, enviando senha:", password);
 *       // ... lógica de envio
 *     } else {
 *       console.log("Formulário inválido:", passwordError);
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <PasswordInput
 *         label="Senha"
 *         name="password"
 *         value={password}
 *         onChange={(e) => {
 *             setPassword(e.target.value);
 *             // O erro será recalculado e comunicado via onErrorChange automaticamente
 *         }}
 *         required
 *         attemptedSubmit={attemptedSubmit}
 *         onErrorChange={handlePasswordErrorChange} // <-- Recebe o erro calculado
 *         isInvalid={!!passwordError} // <-- Define se tem erro visual
 *         ariaDescribedby={passwordError ? passwordErrorId : undefined} // <-- Liga à mensagem de erro
 *       />
 *       {passwordError && ( // <-- Renderiza a mensagem de erro externamente
 *         <p id={passwordErrorId} className="text-red-600 text-xs mt-1">
 *           {passwordError}
 *         </p>
 *       )}
 *       <button type="submit">Enviar</button>
 *     </form>
 *   );
 * }
 * ```
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      // Props específicas e de controle de erro
      externalError,
      requiredMessage = "Senha é Obrigatório",
      attemptedSubmit = false,
      onErrorChange, // Callback para comunicar o erro ao pai
      // Props de aparência e toggle
      showPasswordLabel = "Mostrar senha",
      hidePasswordLabel = "Ocultar senha",
      iconClassName = 'h-5 w-5 text-gray-400',
      // Props de BaseInput (desestruturadas ou capturadas por restProps)
      onChange: parentOnChange, // Renomeado para evitar conflito com nosso handler interno
      value,
      required,
      disabled,
      isInvalid: isInvalidProp, // Recebe o estado `isInvalid` do pai
      ariaDescribedby: ariaDescribedbyProp, // Recebe o `ariaDescribedby` do pai
      ...restProps // Coleta outras props de BaseInput (label, name, id, placeholder, etc.)
    },
    ref // Ref encaminhada do componente pai
  ) => {
    // Estado para controlar a visibilidade da senha (texto vs. password).
    const [showPassword, setShowPassword] = useState(false);
    // Estado para armazenar o resultado da validação de força da senha.
    const [strengthValidationError, setStrengthValidationError] = useState<string | null>(null);

    // Efeito para revalidar a força da senha sempre que o valor (prop 'value') mudar.
    useEffect(() => {
      // Garante que 'value' seja tratado como string para a validação.
      const currentPassword = typeof value === 'string' ? value : '';
      // Chama a função de validação. Retorna a mensagem de erro de força ou null.
      const validationError = validatePasswordStrength(currentPassword);
      // Atualiza o estado interno com o resultado da validação de força.
      setStrengthValidationError(validationError);
    }, [value]); // Dependência: Executa sempre que 'value' mudar.

    // Calcula a mensagem de erro *atual* a ser comunicada, usando memoização para performance.
    // Define a prioridade dos erros.
    const currentErrorMessage = useMemo(() => {
      // Verifica se o campo está efetivamente vazio.
      const isValueEmpty = !value || String(value).trim() === '';
      let error: string | null = null;

      if (externalError) {
        // 1ª Prioridade: Erro vindo de fora (ex: backend).
        error = externalError;
      } else if (required && isValueEmpty && attemptedSubmit) {
        // 2ª Prioridade: Erro de campo obrigatório não preenchido após tentativa de submissão.
        error = requiredMessage;
      } else if (!isValueEmpty && strengthValidationError) {
        // 3ª Prioridade: Erro de validação de força (só se o campo não estiver vazio).
        error = strengthValidationError;
      }
      // Retorna a mensagem de erro de maior prioridade encontrada, ou null se não houver erro.
      return error;
    }, [externalError, required, value, attemptedSubmit, requiredMessage, strengthValidationError]);
    // Dependências: Recalcula se qualquer um desses valores mudar.

    // Efeito para comunicar a mudança no estado de erro para o componente pai.
    useEffect(() => {
      // Se o pai forneceu a callback `onErrorChange`...
      if (onErrorChange) {
        // ...chama a callback com a mensagem de erro atual (calculada no useMemo).
        onErrorChange(currentErrorMessage);
      }
      // Desabilitar a checagem de dependência para 'onErrorChange' pode ser necessário
      // se a função for definida inline no pai, para evitar re-execuções desnecessárias.
      // No entanto, idealmente, o pai memoizaria essa função (useCallback).
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentErrorMessage /* , onErrorChange */]); // Dependência: Executa quando o erro calculado muda.

    // Handler para o clique no botão de mostrar/ocultar senha.
    const togglePasswordVisibility = () => {
      // Só permite alternar se o campo não estiver desabilitado.
      if (!disabled) {
        setShowPassword((prev) => !prev); // Inverte o estado de visibilidade.
      }
    };

    // Handler interno para o evento onChange do input.
    // Atualmente, apenas repassa o evento para o handler original fornecido pelo pai.
    const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (parentOnChange) {
        parentOnChange(e);
      }
      // Nota: A validação de força já é acionada pelo useEffect que depende de 'value'.
    };

    // Determina o valor do atributo 'type' do input com base no estado de visibilidade.
    const inputType = showPassword ? 'text' : 'password';

    // Cria o elemento do botão de toggle (ícone de olho).
    const toggleButton = (
      <button
        type="button" // Importante para não submeter formulários.
        onClick={togglePasswordVisibility}
        disabled={disabled} // Desabilita o botão se o input estiver desabilitado.
        tabIndex={-1} // Remove o botão da navegação por Tab, pois o input já é focável.
        aria-label={showPassword ? hidePasswordLabel : showPasswordLabel} // Acessibilidade: descreve a ação do botão.
        // Estilos: remove outline padrão, aplica cursor e opacidade condicionalmente.
        className={`focus:outline-none ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        {/* Renderiza o ícone apropriado (olho aberto ou fechado) com classes customizáveis. */}
        {showPassword
            ? <EyeOff className={iconClassName} aria-hidden="true" />
            : <Eye className={iconClassName} aria-hidden="true" />
        }
      </button>
    );

    // Determina o estado final de 'isInvalid' a ser passado para o BaseInput.
    // Usa diretamente a prop `isInvalidProp` fornecida pelo componente pai.
    // Este componente NÃO decide mais o `isInvalid` baseado no erro interno.
    const isInvalid = isInvalidProp ?? false;

    // Renderiza o componente BaseInput, configurando-o para senhas.
    return (
      <BaseInput
        ref={ref} // Encaminha a ref para o BaseInput.
        // --- Configurações Específicas de PasswordInput ---
        type={inputType}       // Define o tipo (text/password) dinamicamente.
        endAdornment={toggleButton} // Adiciona o botão de mostrar/ocultar como adorno final.
        // --- Props Controladas ou Repassadas ---
        value={value ?? ''} // Garante que o valor seja sempre uma string.
        onChange={handleInternalChange} // Usa nosso handler que chama o do pai.
        required={required}    // Repassa a obrigatoriedade.
        disabled={disabled}    // Repassa o estado desabilitado.
        // --- Props de Estado de Erro e Acessibilidade (CONTROLADAS PELO PAI) ---
        isInvalid={isInvalid}                // Passa o estado de inválido recebido do pai.
        ariaDescribedby={ariaDescribedbyProp} // Passa o ID da descrição recebido do pai.
        // --- Restante das Props ---
        {...restProps} // Passa todas as outras props (label, id, name, placeholder, etc.) para o BaseInput.
      />
      // Nenhuma mensagem de erro é renderizada aqui dentro.
    );
  }
);

// Define um nome de exibição para facilitar a depuração com React DevTools.
PasswordInput.displayName = 'PasswordInput';