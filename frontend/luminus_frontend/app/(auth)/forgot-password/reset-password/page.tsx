// -*- coding: utf-8 -*-
/**
 * @file ResetPasswordPage.tsx
 * @description Define o componente da página para definir uma nova senha após
 *              solicitar a recuperação. Utiliza layout e validação de senha
 *              baseados em EnterEmailPage e RegisterPage.
 * @version 1.1 
 * @date 29-06-2025 
 * @author Pedro e Armando 
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './resetPassword.module.css';

import { PasswordInput } from '@/components/inputs/PasswordInput';
import Carousel from '@/components/carousel/Carousel';

import { UpdatePassword } from '@/services/professorService';

type FormErrors = {
  newPassword?: string | null;
  confirmPassword?: string | null;
  general?: string | null;
};

type InternalErrors = {
    newPassword?: string | null;
};

// Component that uses useSearchParams - needs to be wrapped in Suspense
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [internalErrors, setInternalErrors] = useState<InternalErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    const tokenFromUrl = searchParams.get('token');
    setEmail(emailFromUrl);
    setToken(tokenFromUrl);

    if (!emailFromUrl || !tokenFromUrl) {
        console.error("Email ou token ausentes na URL.");
        setFormErrors({ general: "Link de redefinição inválido ou expirado. Por favor, solicite novamente." });
    }
  }, [searchParams]);

  const resetPasswordSlides = [
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
      if (formErrors[field]) {
          setFormErrors(prevErrors => ({ ...prevErrors, [field]: null, general: null }));
      }
      if ((field === 'newPassword' || field === 'confirmPassword') && formErrors.confirmPassword) {
        setFormErrors(prevErrors => ({ ...prevErrors, confirmPassword: null, general: null }));
      }
      if (field === 'newPassword' && internalErrors.newPassword) {
          setInternalErrors(prev => ({ ...prev, newPassword: null}));
      }
    };

  const handleInternalError = (field: keyof InternalErrors, errorMessage: string | null) => {
      if (internalErrors[field] !== errorMessage) {
        setInternalErrors(prev => ({ ...prev, [field]: errorMessage }));
      }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttemptedSubmit(true);
    setFormErrors({});
    
    const currentInternalPasswordError = internalErrors.newPassword;
    const errors: FormErrors = {};

    if (!email || !token) {
      errors.general = "Link inválido ou expirado. Solicite a recuperação novamente.";
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    if (!formData.newPassword) errors.newPassword = 'Nova senha é obrigatória.';
    if (!formData.confirmPassword) errors.confirmPassword = 'Confirmação de senha é obrigatória.';

    if (formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem.';
    }

    if (currentInternalPasswordError) {
       if (formData.newPassword) {
            errors.newPassword = currentInternalPasswordError;
       } else if (!errors.newPassword) {
           errors.newPassword = currentInternalPasswordError;
       }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      await UpdatePassword({
        newPass: formData.newPassword,
        email: email
      }, token);

      alert('Senha atualizada com sucesso!');
      router.push('/login');
    } catch (error: unknown) { // CORREÇÃO: Trocado 'any' por 'unknown' e adicionada verificação
      console.error("Erro ao atualizar senha:", error);
      let errorMessage = 'Erro ao atualizar senha. Tente novamente mais tarde.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setFormErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const newPasswordErrorId = 'new-password-error';
  const confirmPasswordErrorId = 'confirm-password-error';
  const generalErrorId = 'reset-password-general-error';

  const displayNewPasswordError = formErrors.newPassword || internalErrors.newPassword;
  const isNewPasswordInvalid = !!displayNewPasswordError;

  // CORREÇÃO: Variável não utilizada 'isSubmitDisabled' removida.
  const isSubmitDisabledSimple = isLoading || !email || !token || !formData.newPassword || !formData.confirmPassword || !!formErrors.confirmPassword || !!internalErrors.newPassword;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftPanel}>
         <div className={styles.NexusLogoContainer}>
           <Image src="/logo-Nexus.svg" alt="Nexus Logo" width={200} height={40}/>
         </div>
         <Carousel autoSlide={true} autoSlideInterval={5000}>
           {resetPasswordSlides}
         </Carousel>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.logoContainer}>
            <Image src="/logo-Luminus.svg" alt="Luminus Logo" width={200} height={50} priority />
        </div>

        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>DEFINIR NOVA SENHA</h1>
          <p className={styles.instructionText}>
             Crie uma senha forte e confirme-a abaixo.
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
               <PasswordInput
                 label="Nova Senha:"
                 id="newPassword"
                 placeholder="Mínimo 8 caracteres"
                 value={formData.newPassword}
                 onChange={handleChange('newPassword')}
                 required
                 minLength={8}
                 disabled={isLoading}
                 name="newPassword"
                 onErrorChange={(err) => handleInternalError('newPassword', err)}
                 attemptedSubmit={attemptedSubmit}
                 isInvalid={isNewPasswordInvalid}
                 aria-describedby={isNewPasswordInvalid ? newPasswordErrorId : undefined}
              />
               <div className={styles.errorSlot} aria-live="polite">
                 {displayNewPasswordError && (
                   <span id={newPasswordErrorId} className={styles.errorText}>
                     {displayNewPasswordError}
                   </span>
                 )}
               </div>
            </div>

            <div className={styles.inputWrapper}>
               <PasswordInput
                 label="Confirme a Nova Senha:"
                 id="confirmPassword"
                 placeholder="Digite novamente sua nova senha"
                 value={formData.confirmPassword}
                 onChange={handleChange('confirmPassword')}
                 required
                 disabled={isLoading}
                 name="confirmPassword"
                 attemptedSubmit={attemptedSubmit}
                 isInvalid={!!formErrors.confirmPassword}
                 aria-describedby={formErrors.confirmPassword ? confirmPasswordErrorId : undefined}
              />
               <div className={styles.errorSlot} aria-live="polite">
                 {formErrors.confirmPassword && (
                   <span id={confirmPasswordErrorId} className={styles.errorText}>
                     {formErrors.confirmPassword}
                   </span>
                 )}
               </div>
            </div>

            <button
              type="submit"
              className={`${styles.submitButton} ${styles.mt1}`}
              disabled={isSubmitDisabledSimple}
            >
              {isLoading ? 'Salvando...' : 'Confirmar Nova Senha'}
            </button>
          </form>

          <p className={styles.switchLink}>
            Lembrou sua senha ou quer cancelar?{' '}
            <Link href="/login">
              Voltar para Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function ResetPasswordLoading() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftPanel}>
         <div className={styles.NexusLogoContainer}>
           <Image src="/logo-Nexus.svg" alt="Nexus Logo" width={200} height={40}/>
         </div>
         <Carousel autoSlide={true} autoSlideInterval={5000}>
           {[
             <Image
               key="reg-slide-1"
               src="/carroselAlunos.png"
               alt="Alunos utilizando a plataforma"
               fill
               priority
               style={{ objectFit: "cover" }}
             />
           ]}
         </Carousel>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.logoContainer}>
            <Image src="/logo-Luminus.svg" alt="Luminus Logo" width={200} height={50} priority />
        </div>

        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>DEFINIR NOVA SENHA</h1>
          <p className={styles.instructionText}>
             Carregando...
          </p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}