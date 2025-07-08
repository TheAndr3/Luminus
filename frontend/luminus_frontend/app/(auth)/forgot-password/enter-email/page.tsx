// -*- coding: utf-8 -*-
/**
 * @file EnterEmailPage.tsx
 * @description Define o componente da página para solicitar o email do usuário
 *              (ex: para recuperação de senha). Utiliza layout similar à LoginPage,
 *              mas com seu próprio CSS Module (EnterEmail.module.css).
 * @version 1.3
 * @date 29-06-2025
 * @author Pedro e Armando
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './enterEmail.module.css';
import { SendRecoveryEmail } from '@/services/professorService';

import { EmailInput } from '@/components/inputs/EmailInput';
import Carousel from '@/components/carousel/Carousel';

type FormErrors = {
  email?: string | null;
  general?: string | null;
};

export default function EnterEmailPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({ email: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const enterEmailSlides = [
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFormData({ email: value });
      setFormErrors(prevErrors => ({
          ...prevErrors,
          email: null,
          general: null
      }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({});
    setIsLoading(true);

    const errors: FormErrors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório.';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Formato de email inválido.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      await SendRecoveryEmail(formData.email);
      const encodedEmail = encodeURIComponent(formData.email);
      router.push(`/forgot-password/recovery-code?email=${encodedEmail}`);
    } catch (error: unknown) { // CORREÇÃO: Trocado 'any' por 'unknown' e adicionada verificação
      console.error("Erro ao enviar email de recuperação:", error);
      let errorMessage = 'Erro ao enviar email de recuperação. Tente novamente mais tarde.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setFormErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const emailErrorId = 'enter-email-error';
  const generalErrorId = 'enter-email-general-error';

  const isSubmitDisabled = isLoading || !formData.email.trim();

  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftPanel}>
         <div className={styles.NexusLogoContainer}>
           <Image src="/logo-Nexus.svg" alt="Nexus Logo" width={200} height={40}/>
         </div>
         <Carousel autoSlide={true} autoSlideInterval={5000}>
           {enterEmailSlides}
         </Carousel>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.logoContainer}>
            <Image src="/logo-Luminus.svg" alt="Luminus Logo" width={200} height={50} priority />
        </div>

        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>RECUPERAR SENHA</h1>
          <p className={styles.instructionText}>
            Digite seu email cadastrado para receber o PIN de recuperação.
          </p>

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
                 id="recover-email"
                 placeholder="Digite seu email cadastrado"
                 value={formData.email}
                 onChange={handleChange}
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

            <button
              type="submit"
              className={`${styles.submitButton}`}
              disabled={isSubmitDisabled}
            >
              {isLoading ? 'Enviando...' : 'Enviar PIN de Recuperação'}
            </button>
          </form>

          <p className={styles.switchLink}>
            Lembrou sua senha?{' '}
            <Link href="/login">
              Voltar para Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}