// -*- coding: utf-8 -*-
/**
 * @file RegisterPage.tsx
 * @description Define o componente da página de cadastro de novos usuários.
 *              Inclui formulário com validação (usuário, email, senha), interação com
 *              componentes de input customizados, chamada de API para registro e
 *              navegação para a página de confirmação de email após um cadastro bem-sucedido.
 * @version 1.3 (Build error fixed)
 * @date 29-06-2025
 * @author Pedro e Andre (com modificações para integração)
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './register.module.css';
import Carousel from '@/components/carousel/Carousel';

import { TextInput } from '@/components/inputs/TextInput';
import { EmailInput } from '@/components/inputs/EmailInput';
import { PasswordInput } from '@/components/inputs/PasswordInput';

import { RegisterProfessor, CreatePayLoad } from '../../../services/professorService';

type FormErrors = {
  username?: string | null;
  email?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
  api?: string | null;
};

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
      if (formErrors[field as keyof FormErrors]) {
          setFormErrors(prevErrors => ({ ...prevErrors, [field as keyof FormErrors]: null }));
      }
      if ((field === 'password' || field === 'confirmPassword') && formErrors.confirmPassword) {
        setFormErrors(prevErrors => ({ ...prevErrors, confirmPassword: null }));
      }
      if (formErrors.api) {
        setFormErrors(prevErrors => ({ ...prevErrors, api: null }));
      }
    };

  const handleInternalError = (field: keyof InternalErrors, errorMessage: string | null) => {
      setInternalErrors(prev => ({ ...prev, [field]: errorMessage }));
      if (errorMessage && formErrors.api) {
        setFormErrors(prevErrors => ({ ...prevErrors, api: null }));
      }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttemptedSubmit(true);
    setFormErrors({});
    
    const errors: FormErrors = {};

    if (!formData.username.trim()) errors.username = 'Nome de usuário é obrigatório.';
    if (!formData.email.trim()) errors.email = 'Email é obrigatório.';
    else if (!validateEmail(formData.email)) errors.email = 'Formato de email inválido.';
    if (!formData.password) errors.password = 'Senha é obrigatória.';
    if (!formData.confirmPassword) errors.confirmPassword = 'Confirmação de senha é obrigatória.';
    else if (formData.password && formData.password !== formData.confirmPassword) errors.confirmPassword = 'As senhas não coincidem.';

    if (internalErrors.password) {
      errors.password = internalErrors.password;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const payload: CreatePayLoad = {
      name: formData.username,
      customUserEmail: formData.email,
      password: formData.password,
    };

    console.log('Enviando dados para registro via API:', payload);

    try {
      const response = await RegisterProfessor(payload);
      console.log('Registro via API bem-sucedido:', response.msg);
      router.push(`/confirm-email?email=${encodeURIComponent(formData.email)}&token=${encodeURIComponent(response.token)}`);

    } catch (error: unknown) { // CORREÇÃO: Trocado 'any' por 'unknown' e adicionada verificação
      console.error("Erro no registro via API:", error);
      let errorMessage = 'Ocorreu um erro ao tentar registrar. Por favor, tente novamente mais tarde.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setFormErrors(prevErrors => ({
        ...prevErrors,
        api: errorMessage
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const usernameErrorId = 'username-error';
  const emailErrorId = 'email-error';
  const passwordErrorId = 'password-error';
  const confirmPasswordErrorId = 'confirmPassword-error';
  const apiErrorId = 'api-general-error';

  const displayPasswordError = formErrors.password || internalErrors.password;
  const isPasswordInvalid = !!displayPasswordError;

  const isAnyFieldEmpty = !formData.username.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim();

  // CORREÇÃO: A constante 'isSubmitDisabled' não era utilizada e foi removida.
  // A lógica de desabilitação está diretamente no botão.

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
               externalError={formErrors.password}
               attemptedSubmit={attemptedSubmit}
               isInvalid={isPasswordInvalid}
               aria-describedby={displayPasswordError ? passwordErrorId : undefined}
             />
             <div className={styles.errorSlot} aria-live="polite">
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
             />
             <div className={styles.errorSlot} aria-live="polite">
                {formErrors.confirmPassword && (<span id={confirmPasswordErrorId} className={styles.errorText}>{formErrors.confirmPassword}</span>)}
             </div>
          </div>

          {formErrors.api && (
            <div className={`${styles.errorSlot} ${styles.apiErrorSlot}`} aria-live="assertive">
              <span id={apiErrorId} className={styles.errorText}>{formErrors.api}</span>
            </div>
          )}

          <button type="submit" className={`${styles.submitButton} mt-1`} disabled={
            isLoading ||
            isAnyFieldEmpty ||
            !!internalErrors.password ||
            !!formErrors.username ||
            !!formErrors.email ||
            !!formErrors.password ||
            !!formErrors.confirmPassword ||
            !!formErrors.api
          }>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        <p className={styles.loginLink}>
          Já possui uma conta?{' '}
          <Link href="/login">Entrar</Link>
        </p>
      </div>
      <div className={styles.rightPanel}>
         <div className={styles.NexusLogoContainer}>
          <Image src="/logo-Nexus.svg" alt="Nexus Logo" width={200} height={40} />
        </div>
        <Carousel autoSlide={true} autoSlideInterval={5000}>
          {registerSlides}
        </Carousel>
      </div>
    </div>
  );
}