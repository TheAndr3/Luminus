// -*- coding: utf-8 -*-
/**
 * @file RecoveryCodePage.tsx
 * @description Define o componente da página para inserir o código de recuperação de senha,
 *              utilizando o componente PinInput. Exibe o email do usuário e o passa adiante.
 * @version 1.2 (Exibe e repassa email da URL)
 * @date 06-05-2024 // Data atualizada
 * @author Pedro e Armando (Adaptado)
 */

'use client';

import React, { useState, useEffect } from 'react'; // useEffect pode ser útil se precisar reagir a mudanças no email
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // <<< Adicionado useSearchParams
import styles from './recoveryCode.module.css'; // <<< Assume que este CSS existe

// --- Importações de Componentes Customizados ---
import { PinInput } from '@/components/inputs/PinInput'; // <<< USA PinInput
import Carousel from '@/components/carousel/Carousel';     // Reutiliza o Carousel

const PIN_LENGTH = 4; // Define o tamanho do PIN aqui

/**
 * @component RecoveryCodePage
 * @description Componente funcional que renderiza a página para inserir o código PIN.
 */
export default function RecoveryCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // <<< Hook para ler parâmetros da URL
  const email = searchParams.get('email'); // <<< Pega o valor do parâmetro 'email' da URL

  // --- Estados do Componente ---
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

    // --- Slides para o Carrossel ---
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

  // --- Manipulador de Mudança do PIN ---
  const handlePinChange = (value: string) => {
    setPin(value);
  };

  // --- Submissão do Formulário ---
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    console.log('Tentando verificar PIN (simulação básica):', pin);
    console.log('Email recebido da URL:', email); // Log para verificar se o email foi pego

    // --- Lógica de validação e API será adicionada depois ---
    // Simulação rápida:
    setTimeout(() => {
      if (pin === '1234') { // Exemplo de PIN correto (substitua pela lógica real)
        console.log('PIN correto! (Simulado)');
        // <<< MODIFICADO: Adiciona o email como query parameter na URL de destino
        const targetUrl = `/forgot-password/reset-password?email=${encodeURIComponent(email || '')}`;
        router.push(targetUrl); // Redireciona com o email
      } else {
        console.log('PIN incorreto! (Simulado)');
        alert('Código PIN inválido (Simulação)'); // Feedback simples por enquanto
        setIsLoading(false);
      }
      // setIsLoading(false); // Já tratado nos branches acima
    }, 1000);
  };

  // --- Lógica para Desabilitar Botão ---
  const isSubmitDisabled = isLoading || pin.length !== PIN_LENGTH;

  // --- Renderização do Componente ---
  return (
    <div className={styles.pageContainer}>

      {/* Painel Esquerdo */}
      <div className={styles.leftPanel}>
         <div className={styles.NexusLogoContainer}>
           <Image src="/logo-Nexus.svg" alt="Nexus Logo" width={200} height={40}/>
         </div>
         <Carousel autoSlide={true} autoSlideInterval={5000}>
           {recoverySlides}
         </Carousel>
      </div>

      {/* Painel Direito */}
      <div className={styles.rightPanel}>
        <div className={styles.logoContainer}>
            <Image src="/logo-Luminus.svg" alt="Luminus Logo" width={200} height={50} priority />
        </div>

        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>VERIFICAR CÓDIGO</h1>
          <p className={styles.instructionText}>
            Digite o PIN de {PIN_LENGTH} dígitos enviado para o seu email:{' '}
            {/* <<< MODIFICADO: Exibe o email pego da URL */}
            {email && <strong className={styles.emailDisplay || ''}>{email}</strong>}
          </p>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>

            {/* ---- Componente PinInput INTEGRADO ---- */}
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

            {/* Espaçamento Manual */}
            <div style={{ height: '1.25rem', marginBottom: '0.8rem' }}></div>

            {/* Botão de Submissão */}
            <button
              type="submit"
              className={`${styles.submitButton} ${styles.mt1}`}
              disabled={isSubmitDisabled}
            >
              {isLoading ? 'Verificando...' : 'Verificar Código'}
            </button>
          </form>

          {/* Link Inferior */}
          <p className={styles.switchLink}>
            Não recebeu o código?{' '}
            <button type="button" onClick={() => alert('Funcionalidade de Reenviar Código não implementada.')} className={styles.resendButton || ''}>
                Reenviar código
            </button>
             {' ou '}
            {/* <<< MODIFICADO: Passa o email de volta para a página anterior se necessário */}
            <Link href={`/forgot-password/enter-email?email=${encodeURIComponent(email || '')}`}>
              Digite outro email
            </Link>
          </p>

        </div> {/* Fim contentWrapper */}
      </div> {/* Fim rightPanel */}
    </div> // Fim pageContainer
  );
}