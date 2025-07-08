// -*- coding: utf-8 -*-
/**
 * @file RecoveryCodePage.tsx
 * @description Define o componente da página para inserir o código de recuperação de senha,
 *              utilizando o componente PinInput. Exibe o email do usuário e o passa adiante.
 * @version 1.3 (build error fixed)
 * @date 29-06-2024 // Data atualizada
 * @author Pedro e Armando (Adaptado)
 */

'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './recoveryCode.module.css';
import { RecoverPassword } from '@/services/professorService';

import { PinInput } from '@/components/inputs/PinInput';
import Carousel from '@/components/carousel/Carousel';

const PIN_LENGTH = 4;

function RecoveryCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const recoverySlides = [
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

  const handlePinChange = (value: string) => {
    setPin(value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!email) {
      alert('Email não encontrado. Por favor, tente novamente.');
      router.push('/forgot-password/enter-email');
      return;
    }

    try {
      const response = await RecoverPassword({
        email: email,
        code: parseInt(pin)
      });

      if (response.token) {
        router.push(`/forgot-password/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(response.token)}`);
      } else {
        throw new Error('Token não recebido do servidor');
      }
    } catch (error: unknown) { // CORREÇÃO: Trocado 'any' por 'unknown' e adicionada verificação
      console.error("Erro na verificação do PIN:", error);
      let errorMessage = 'PIN inválido ou expirado. Tente novamente.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = isLoading || pin.length !== PIN_LENGTH;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftPanel}>
         <div className={styles.NexusLogoContainer}>
           <Image src="/logo-Nexus.svg" alt="Nexus Logo" width={200} height={40}/>
         </div>
         <Carousel autoSlide={true} autoSlideInterval={5000}>
           {recoverySlides}
         </Carousel>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.logoContainer}>
            <Image src="/logo-Luminus.svg" alt="Luminus Logo" width={200} height={50} priority />
        </div>

        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>VERIFICAR CÓDIGO</h1>
          <p className={styles.instructionText}>
            Digite o PIN de {PIN_LENGTH} dígitos enviado para o seu email:{' '}
            {email && <strong className={styles.emailDisplay || ''}>{email}</strong>}
          </p>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <PinInput
                length={PIN_LENGTH}
                value={pin}
                onChange={handlePinChange}
                disabled={isLoading}
                autoFocus
                name="recovery_code"
                inputContainerClassName={styles.pinInputGroup || ''}
                inputClassName={styles.pinDigitInput || ''}
            />

            <div style={{ height: '1.25rem', marginBottom: '0.8rem' }}></div>

            <button
              type="submit"
              className={`${styles.submitButton} ${styles.mt1}`}
              disabled={isSubmitDisabled}
            >
              {isLoading ? 'Verificando...' : 'Verificar Código'}
            </button>
          </form>

          <p className={styles.switchLink}>
            Não recebeu o código?{' '}
            <button type="button" onClick={() => alert('Funcionalidade de Reenviar Código não implementada.')} className={styles.resendButton || ''}>
                Reenviar código
            </button>
             {' ou '}
            <Link href={`/forgot-password/enter-email?email=${encodeURIComponent(email || '')}`}>
              Digite outro email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RecoveryCodeLoading() {
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
          <h1 className={styles.title}>VERIFICAR CÓDIGO</h1>
          <p className={styles.instructionText}>
             Carregando...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RecoveryCodePage() {
  return (
    <Suspense fallback={<RecoveryCodeLoading />}>
      <RecoveryCodeContent />
    </Suspense>
  );
}