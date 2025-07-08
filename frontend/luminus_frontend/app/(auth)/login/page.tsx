// -*- coding: utf-8 -*-
/**
 * @file LoginPage.tsx
 * @description Define o componente da página de login de usuários existentes.
 *              Apresenta um layout de dois painéis, com um carrossel à esquerda e
 *              o formulário de login centralizado à direita, abaixo de um logo fixo.
 * @version 1.0
 * @date 02-05-2025
 * @author Pedro e Andre
 */

"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './login.module.css';
import { useRouter } from 'next/navigation';
import { LoginProfessor } from '@/services/professorService';

import { EmailInput } from '@/components/inputs/EmailInput';
import { PasswordInput } from '@/components/inputs/PasswordInput';
import Carousel from '@/components/carousel/Carousel';

type FormErrors = {
  email?: string | null;
  password?: string | null;
  general?: string | null;
};

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const loginSlides = [
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

  const handleChange = (field: 'email' | 'password') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFormData(prevData => ({ ...prevData, [field]: value }));
      setFormErrors(prevErrors => ({
          ...prevErrors,
          [field]: null,
          general: null
      }));
    };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevData => ({ ...prevData, rememberMe: e.target.checked }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({});
    setHasAttemptedSubmit(true);
    setIsLoading(true);

    const errors: FormErrors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório.';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Formato de email inválido.';
    }
    if (!formData.password) {
      errors.password = 'Senha é obrigatória.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      setHasAttemptedSubmit(false);
      return;
    }

    try {
      const response = await LoginProfessor({
        customUserEmail: formData.email,
        password: formData.password
      });

      if (response.id) {
        localStorage.setItem('professorId', response.id.toString());
      }

      router.push('/home');
    } catch (error: unknown) { // CORREÇÃO: Trocado 'any' por 'unknown' e adicionada verificação
      console.error("Erro durante o login:", error);
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setFormErrors({ general: errorMessage });
      setHasAttemptedSubmit(false);
    } finally {
      setIsLoading(false);
    }
  };

  const emailErrorId = 'login-email-error';
  const passwordErrorId = 'login-password-error';
  const generalErrorId = 'login-general-error';

  const isAnyFieldEmpty = !formData.email.trim() || !formData.password;
  const isSubmitDisabled = isLoading || isAnyFieldEmpty;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftPanel}>
         <div className={styles.NexusLogoContainer}>
           <Image
             src="/logo-Nexus.svg"
             alt="Nexus Logo"
             width={200} height={40}
           />
         </div>
         <Carousel autoSlide={true} autoSlideInterval={5000}>
           {loginSlides}
         </Carousel>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.logoContainer}>
            <Image
                src="/logo-Luminus.svg"
                alt="Luminus Logo"
                width={200} height={50}
                priority
            />
        </div>

        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>LOGIN</h1>

          {formErrors.general && (
            <div role="alert" className={styles.generalErrorContainer}>
               <span id={generalErrorId} className={styles.errorText}>
                 {formErrors.general}
               </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.inputWrapper}>
               <EmailInput
                 label="Email:"
                 id="login-email"
                 placeholder="Digite seu email"
                 value={formData.email}
                 onChange={handleChange('email')}
                 required
                 isInvalid={!!formErrors.email}
                 aria-describedby={formErrors.email ? emailErrorId : undefined}
                 disabled={isLoading}
                 name="email"
               />
               <div className={styles.errorSlot} aria-live="polite">
                 {formErrors.email && (
                   <span id={emailErrorId} className={styles.errorText}>
                     {formErrors.email}
                   </span>
                 )}
               </div>
            </div>

            <div className={styles.inputWrapper}>
               <PasswordInput
                 label="Senha:"
                 id="login-password"
                 placeholder="Digite sua senha"
                 value={formData.password}
                 onChange={handleChange('password')}
                 required
                 disabled={isLoading}
                 name="password"
                 attemptedSubmit={hasAttemptedSubmit}
                 isInvalid={!!formErrors.password}
                 aria-describedby={formErrors.password ? passwordErrorId : undefined}
               />
               <div className={styles.errorSlot} aria-live="polite">
                 {formErrors.password && (
                   <span id={passwordErrorId} className={styles.errorText}>
                     {formErrors.password}
                   </span>
                 )}
               </div>
            </div>

            <div className={styles.extraOptions}>
              <div className={styles.rememberMeControl}>
                <input
                  type="checkbox"
                  id="remember-me"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                  className={styles.checkboxInput}
                />
                <label htmlFor="remember-me" className={styles.checkboxLabel}>
                  Manter conectado
                </label>
              </div>
              <Link href="/forgot-password/enter-email" className={styles.forgotPasswordLink}>
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitDisabled}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className={styles.switchLink}>
            Não tem uma conta?{' '}
            <Link href="/register">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}