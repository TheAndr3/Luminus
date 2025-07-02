// -*- coding: utf-8 -*-
/**
 * @file confirm-email.tsx
 * @description Define o componente da página de confirmação de email via PIN/OTP.
 * @version 1.0
 * @date 02-05-2025
 * @author Pedro
 */

'use client';

import React, { useState, useEffect, useId, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './confirmEmail.module.css';
import { ConfirmEmail } from '@/services/professorService';

import { PinInput } from '@/components/inputs/PinInput';
import Carousel from '@/components/carousel/Carousel';

type FormErrors = {
  userPin?: string | null;
};

type FormDataState = {
  userPin: string;
};

const confirmEmailSlides = [
    <Image key="conf-slide-1" src="/carroselAlunos.png" alt="Confirmação Segura de Email" layout="fill" objectFit="cover" priority />,
    <Image key="conf-slide-2" src="/carroselGerencie.png" alt="Seu acesso está quase pronto" layout="fill" objectFit="cover" />,
    <Image key="conf-slide-3" src="/carroselAvaliação.png" alt="Apenas mais um passo para acessar a plataforma" layout="fill" objectFit="cover" />,
];

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [formData, setFormData] = useState<FormDataState>({ userPin: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const PIN_LENGTH = 4;
  const pinErrorId = useId();

  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    const tokenFromUrl = searchParams.get('token');
    
    if (emailFromUrl && tokenFromUrl) {
      setUserEmail(decodeURIComponent(emailFromUrl));
      setToken(tokenFromUrl); // Não precisa decodificar o token se ele for numérico
    } else {
      console.warn("Parâmetros 'email' ou 'token' não encontrados na URL.");
      router.push('/register');
    }
  }, [searchParams, router]);

  const handlePinChange = (value: string) => {
      const numericValue = value.replace(/\D/g, '');
      setFormData({ userPin: numericValue });
      if (formErrors.userPin) setFormErrors({});
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({});
    const errors: FormErrors = {};

    if (!formData.userPin) {
      errors.userPin = 'O PIN é obrigatório.';
    } else if (formData.userPin.length !== PIN_LENGTH) {
      errors.userPin = `O PIN deve ter ${PIN_LENGTH} dígitos.`;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!userEmail || !token) {
      setFormErrors({ userPin: 'Dados de verificação inválidos. Por favor, tente novamente.' });
      return;
    }

    setIsLoading(true);

    try {
      // CORREÇÃO FINAL: 'token' também convertido para número.
      await ConfirmEmail({
        email: userEmail,
        code: parseInt(formData.userPin, 10),
        token: parseInt(token, 10) 
      });

      alert('Email confirmado com sucesso!');
      router.push('/login');

    } catch (error: unknown) {
      console.error("Erro na verificação do PIN:", error);
      let errorMessage = 'PIN inválido ou expirado. Tente novamente.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setFormErrors({ userPin: errorMessage });
    } finally {
        setIsLoading(false);
    }
  };

  const isSubmitDisabled = isLoading || !userEmail || formData.userPin.length !== PIN_LENGTH || !!formErrors.userPin;

  const pinInputContainerStyle = `flex items-center justify-center space-x-3`;
  const getPinInputStyle = (): string => {
    let classes = `w-14 h-16 text-center text-xl font-semibold border-2 rounded-lg bg-white text-gray-900 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-600 focus:border-blue-600 caret-color-blue-600`;
    if (formErrors.userPin) {
        classes += ' border-red-500';
    } else {
        classes += ' border-black';
    }
    if (isLoading || !userEmail) {
        classes += ' bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed';
    }
    return classes;
  };
  const pinInputWrapperStyle = `mb-2`;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.logoContainer}>
          <Image src="/logo-Luminus.svg" alt="Luminus Logo" width={200} height={50} priority />
        </div>
        <div className={styles.contentWrapper}>
          <p className={styles.pinPromptLabel}>
            {userEmail ? (
              <>
                Insira o pin recebido em <br />
                <strong>{userEmail}</strong>.
              </>
            ) : (
              'Carregando email...'
            )}
          </p>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div>
              <PinInput
                length={PIN_LENGTH}
                value={formData.userPin}
                onChange={handlePinChange}
                isInvalid={!!formErrors.userPin}
                aria-describedby={formErrors.userPin ? pinErrorId : undefined}
                autoFocus
                disabled={isLoading || !userEmail}
                name="userPin"
                aria-label={`PIN de ${PIN_LENGTH} dígitos enviado para ${userEmail || 'seu email'}`}
                containerClassName={pinInputWrapperStyle}
                inputContainerClassName={pinInputContainerStyle}
                inputClassName={getPinInputStyle()}
              />
              <div className={styles.errorSlot} aria-live="polite">
                {formErrors.userPin && (<span id={pinErrorId} className={styles.errorText}>{formErrors.userPin}</span>)}
              </div>
            </div>
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.submitButton} disabled={isSubmitDisabled}>
                {isLoading ? 'Confirmando...' : 'Confirmar PIN'}
              </button>
              <Link href="/register" className={styles.backButton}>
                Voltar
              </Link>
            </div>
          </form>
        </div>
      </div>
      <div className={styles.rightPanel}>
         <div className={styles.NexusLogoContainer}>
           <Image src="/logo-Nexus.svg" alt="Nexus Logo" width={150} height={40} />
         </div>
         <Carousel autoSlide={true} autoSlideInterval={6000}>
           {confirmEmailSlides}
         </Carousel>
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div>Carregando informações...</div>}>
      <ConfirmEmailContent />
    </Suspense>
  );
}