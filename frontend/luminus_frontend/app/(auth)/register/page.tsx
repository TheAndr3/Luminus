// -*- coding: utf-8 -*-
/**
 * @file RegisterPage.tsx
 * @description Define o componente da página de cadastro de novos usuários.
 *              Inclui formulário com validação (usuário, email, senha), interação com
 *              componentes de input customizados, chamada de API para registro e
 *              navegação para a página de confirmação de email após um cadastro bem-sucedido.
 * @version 1.2 (Integração com API de Cadastro)
 * @date 03-05-2024
 * @author Pedro e Andre (com modificações para integração)
 */

// Diretiva de Componente de Cliente.
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './register.module.css';
import Carousel from '@/components/carousel/Carousel';

// --- Importações de Componentes de Input Customizados ---
import { TextInput } from '@/components/inputs/TextInput';
import { EmailInput } from '@/components/inputs/EmailInput';
import { PasswordInput } from '@/components/inputs/PasswordInput';

// --- Importação do Serviço de API ---
// AJUSTE O CAMINHO CONFORME A ESTRUTURA DO SEU PROJETO
// Exemplo: se services está na raiz do projeto: import { RegisterProfessor, CreatePayLoad } from '../../../services/authService';
// Exemplo: se services está em src/services: import { RegisterProfessor, CreatePayLoad } from '@/services/authService'; (se tiver alias configurado)
import { RegisterProfessor, CreatePayLoad } from '../../../services/professorService'; // <<< ADICIONADO: Importação do serviço e tipo

// --- Tipos ---

/**
 * @type FormErrors
 * @description Define a estrutura para armazenar erros de validação do formulário
 *              detectados na página ou retornados pela API.
 */
type FormErrors = {
  username?: string | null;
  email?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
  api?: string | null; // <<< ADICIONADO: Para erros gerais da API
};

/**
 * @type InternalErrors
 * @description Define a estrutura para armazenar erros comunicados pelos componentes filhos
 *              via `onErrorChange`.
 */
type InternalErrors = {
    password?: string | null;
};

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [internalErrors, setInternalErrors] = useState<InternalErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const registerSlides = [
    <Image
      key="reg-slide-1"
      src="/carroselAlunos.png"
      alt="Alunos utilizando a plataforma"
      fill
      priority
      style={{ objectFit: "cover" }}
    />,
    <Image
      key="reg-slide-2"
      src="/carroselGerencie.png"
      alt="Interface de gerenciamento da plataforma"
      fill
      style={{ objectFit: "cover" }}
    />,
    <Image
      key="reg-slide-3"
      src="/carroselAvaliação.png"
      alt="Tela de avaliação de desempenho"
      fill
      style={{ objectFit: "cover" }}
    />,
  ];

  const handleChange = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFormData(prevData => ({ ...prevData, [field]: value }));
      // Limpa o erro do campo específico ao digitar
      if (formErrors[field as keyof FormErrors]) { // Usamos 'as' aqui pois 'field' é de formData, mas queremos acessar FormErrors
          setFormErrors(prevErrors => ({ ...prevErrors, [field as keyof FormErrors]: null }));
      }
      // Limpa o erro de confirmação de senha se a senha ou a confirmação for alterada
      if ((field === 'password' || field === 'confirmPassword') && formErrors.confirmPassword) {
        setFormErrors(prevErrors => ({ ...prevErrors, confirmPassword: null }));
      }
      // <<< ADICIONADO: Limpa o erro geral da API ao interagir com o formulário >>>
      if (formErrors.api) {
        setFormErrors(prevErrors => ({ ...prevErrors, api: null }));
      }
    };

  const handleInternalError = (field: keyof InternalErrors, errorMessage: string | null) => {
      setInternalErrors(prev => ({ ...prev, [field]: errorMessage }));
      // Se um erro interno for reportado (e não for nulo), limpa um possível erro de API para evitar confusão.
      if (errorMessage && formErrors.api) {
        setFormErrors(prevErrors => ({ ...prevErrors, api: null }));
      }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttemptedSubmit(true);
    // Limpa apenas os erros de formulário da tentativa anterior.
    // Erros internos são gerenciados pelo `handleInternalError` e persistem até que o componente filho os limpe.
    setFormErrors({});
    // <<< MODIFICADO: Não resetar internalErrors aqui. Eles são estados dos componentes filhos. >>>
    // setInternalErrors({}); // Removido para persistir erros internos como força da senha

    const errors: FormErrors = {};

    if (!formData.username.trim()) errors.username = 'Nome de usuário é obrigatório.';
    if (!formData.email.trim()) errors.email = 'Email é obrigatório.';
    else if (!validateEmail(formData.email)) errors.email = 'Formato de email inválido.';
    if (!formData.password) errors.password = 'Senha é obrigatória.';
    if (!formData.confirmPassword) errors.confirmPassword = 'Confirmação de senha é obrigatória.';
    else if (formData.password && formData.password !== formData.confirmPassword) errors.confirmPassword = 'As senhas não coincidem.';

    // Integração com Erros Internos (ex: força da senha do PasswordInput)
    // Esta verificação agora usa o estado `internalErrors` que não foi resetado.
    if (internalErrors.password) {
      errors.password = internalErrors.password;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false); // Garante que o loading pare se houver erro de validação client-side
      return;
    }

    setIsLoading(true);

    // <<< MODIFICADO: Lógica de chamada à API >>>
    // Construir o payload para a API
    const payload: CreatePayLoad = {
      name: formData.username,
      customUserEmail: formData.email,
      password: formData.password,
    };

    console.log('Enviando dados para registro via API:', payload);

    try {
      // Chamada real à API de registro
      const response = await RegisterProfessor(payload);
      console.log('Registro via API bem-sucedido:', response.msg);
      router.push(`/confirm-email?email=${encodeURIComponent(formData.email)}&token=${encodeURIComponent(response.token)}`);

    } catch (error: any) { // Captura o erro lançado pelo serviço RegisterProfessor
      console.error("Erro no registro via API:", error);
      // Exibe a mensagem de erro da API. `error.message` deve vir do `throw new Error(message)` no seu serviço.
      setFormErrors(prevErrors => ({
        ...prevErrors, // Mantém outros erros de campo se houver (embora geralmente não devam coexistir com erro de API)
        api: error.message || 'Ocorreu um erro ao tentar registrar. Por favor, tente novamente mais tarde.'
      }));
    } finally {
      setIsLoading(false); // Garante que o loading seja desativado em qualquer cenário
    }
  };

  const usernameErrorId = 'username-error';
  const emailErrorId = 'email-error';
  const passwordErrorId = 'password-error';
  const confirmPasswordErrorId = 'confirmPassword-error';
  const apiErrorId = 'api-general-error'; // <<< ADICIONADO: ID para erro da API

  const displayPasswordError = formErrors.password || internalErrors.password;
  const isPasswordInvalid = !!displayPasswordError;

  const isAnyFieldEmpty = !formData.username.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim();

  // <<< MODIFICADO: Lógica para desabilitar o botão de submit >>>
  // Botão desabilitado se:
  // - Carregando (isLoading).
  // - Qualquer campo essencial estiver vazio (isAnyFieldEmpty) - checagem básica antes mesmo de validar.
  // - Houver erros internos de componentes (ex: senha fraca detectada pelo PasswordInput).
  // - Houver erros de validação de formulário (formErrors para campos específicos).
  // - Houver um erro geral retornado pela API (formErrors.api).
  const hasClientSideFieldErrors = !!formErrors.username || !!formErrors.email || !!formErrors.password || !!formErrors.confirmPassword;
  const hasInternalComponentErrors = !!internalErrors.password; // Adicionar outros se PasswordInput ou outros componentes emitirem mais erros internos

  const isSubmitDisabled =
    isLoading ||
    isAnyFieldEmpty || // Desabilita se campos obrigatórios estiverem vazios
    hasInternalComponentErrors || // Desabilita se houver erros internos dos inputs (ex: força da senha)
    (attemptedSubmit && (hasClientSideFieldErrors || !!formErrors.api)); // Após tentativa de submit, desabilita se houver erros de formulário ou da API.
                                                                      // Se não quiser desabilitar por campos vazios após a primeira tentativa, remova isAnyFieldEmpty e confie nas mensagens de erro.
                                                                      // A lógica pode ser simplificada para:
                                                                      // isLoading || isAnyFieldEmpty || hasInternalComponentErrors || hasClientSideFieldErrors || !!formErrors.api;
                                                                      // Vou usar esta mais simples e direta:
  // const isSubmitDisabled = isLoading || isAnyFieldEmpty || hasInternalComponentErrors || hasClientSideFieldErrors || !!formErrors.api;


  // --- Renderização do Componente ---
  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.logoContainer}>
          <Image src="/logo-Luminus.svg" alt="Luminus Nexus Logo" width={200} height={50} priority />
        </div>
        <h1 className={styles.title}>CADASTRO</h1>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.inputWrapper}>
            <TextInput
              label="Usuário:" id="username" placeholder="Nome"
              value={formData.username} onChange={handleChange('username')}
              required isInvalid={!!formErrors.username}
              aria-describedby={formErrors.username ? usernameErrorId : undefined}
              disabled={isLoading} name="username"
            />
            <div className={styles.errorSlot} aria-live="polite">
                {formErrors.username && (<span id={usernameErrorId} className={styles.errorText}>{formErrors.username}</span>)}
            </div>
          </div>

          <div className={styles.inputWrapper}>
             <EmailInput
               label="Email:" id="email" placeholder="Email"
               value={formData.email} onChange={handleChange('email')}
               required isInvalid={!!formErrors.email}
               aria-describedby={formErrors.email ? emailErrorId : undefined}
               disabled={isLoading} name="email"
             />
             <div className={styles.errorSlot} aria-live="polite">
                {formErrors.email && (<span id={emailErrorId} className={styles.errorText}>{formErrors.email}</span>)}
             </div>
          </div>

          <div className={styles.inputWrapper}>
             <PasswordInput
               label="Senha:" id="password" placeholder="Mínimo 8 caracteres"
               value={formData.password} onChange={handleChange('password')}
               required minLength={8} disabled={isLoading} name="password"
               onErrorChange={(err) => handleInternalError('password', err)}
               externalError={formErrors.password} // Passa o erro do form (ex: 'senha obrigatória')
               attemptedSubmit={attemptedSubmit}
               isInvalid={isPasswordInvalid} // Controla o estilo de erro baseado em formError ou internalError
               aria-describedby={displayPasswordError ? passwordErrorId : undefined}
             />
             <div className={styles.errorSlot} aria-live="polite">
                {/* displayPasswordError já combina formErrors.password e internalErrors.password */}
                {displayPasswordError && (<span id={passwordErrorId} className={styles.errorText}>{displayPasswordError}</span>)}
             </div>
          </div>

          <div className={styles.inputWrapper}>
             <PasswordInput
               label="Confirme a senha:" id="confirmPassword" placeholder="Digite novamente sua senha"
               value={formData.confirmPassword} onChange={handleChange('confirmPassword')}
               required minLength={8} isInvalid={!!formErrors.confirmPassword}
               aria-describedby={formErrors.confirmPassword ? confirmPasswordErrorId : undefined}
               disabled={isLoading} name="confirmPassword"
               // Este PasswordInput não precisa de onErrorChange se for só para confirmação de match
             />
             <div className={styles.errorSlot} aria-live="polite">
                {formErrors.confirmPassword && (<span id={confirmPasswordErrorId} className={styles.errorText}>{formErrors.confirmPassword}</span>)}
             </div>
          </div>

          {/* <<< ADICIONADO: Local para exibir erro geral da API >>> */}
          {formErrors.api && (
            <div className={`${styles.errorSlot} ${styles.apiErrorSlot}`} aria-live="assertive"> {/* `assertive` para anunciar imediatamente */}
              <span id={apiErrorId} className={styles.errorText}>{formErrors.api}</span>
            </div>
          )}

          <button type="submit" className={`${styles.submitButton} mt-1`} disabled={
            isLoading || // Desabilitado se carregando
            isAnyFieldEmpty || // Desabilitado se qualquer campo estiver vazio (validação básica)
            !!internalErrors.password || // Desabilitado se houver erro interno da senha (ex: fraca)
            !!formErrors.username || // Desabilitado se houver erro no campo username
            !!formErrors.email || // Desabilitado se houver erro no campo email
            !!formErrors.password || // Desabilitado se houver erro no campo senha (vindo do submit)
            !!formErrors.confirmPassword || // Desabilitado se houver erro na confirmação de senha
            !!formErrors.api // Desabilitado se houver erro da API
          }>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        <p className={styles.loginLink}>
          Já possui uma conta?{' '}
          <Link href="/login">Entrar</Link>
        </p>
      </div> {/* Fim leftPanel */}
      <div className={styles.rightPanel}>
         <div className={styles.NexusLogoContainer}>
          <Image src="/logo-Nexus.svg" alt="Nexus Logo" width={200} height={40} />
        </div>
        <Carousel autoSlide={true} autoSlideInterval={5000}>
          {registerSlides}
        </Carousel>
      </div> {/* Fim rightPanel */}
    </div> // Fim pageContainer
  );
}