// -*- coding: utf-8 -*-
/**
 * @file RecoveryCodePage.tsx
 * @description Define o componente da página para inserir o código de recuperação de senha,
 *              utilizando o componente PinInput.
 * @version 1.1 (Simplificado para foco no PinInput)
 * @date 03-05-2025
 * @author Pedro e Armando (Adaptado)
 */

'use client';

import React, { useState } from 'react'; // Removido useEffect por enquanto
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

  // --- Estados do Componente (Simplificado) ---
  const [pin, setPin] = useState(''); // Estado para o valor do PIN
  const [isLoading, setIsLoading] = useState(false);
  // Estados de erro e `attemptedSubmit` removidos temporariamente para simplificar

  // --- Slides para o Carrossel ---
  const recoverySlides = [
    <Image key="recovery-slide-1" src="/carroselAlunos.png" alt="Verifique sua identidade" layout="fill" objectFit="cover" priority />,
    <Image key="recovery-slide-2" src="/carroselGerencie.png" alt="Processo seguro e rápido" layout="fill" objectFit="cover" />,
    <Image key="recovery-slide-3" src="/carroselAvaliação.png" alt="Insira o código recebido" layout="fill" objectFit="cover" />,
  ];

  // --- Manipulador de Mudança do PIN (Simplificado) ---
  const handlePinChange = (value: string) => {
    setPin(value);
    // Lógica de limpeza de erros removida por enquanto
  };

  // --- Submissão do Formulário (Simplificado) ---
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    console.log('Tentando verificar PIN (simulação básica):', pin);

    // --- Lógica de validação e API será adicionada depois ---
    // Simulação rápida:
    setTimeout(() => {
      if (pin === '1234') { // Exemplo de PIN correto (substitua pela lógica real)
        console.log('PIN correto! (Simulado)');
        router.push('/forgot-password/reset-password'); // Redireciona
      } else {
        console.log('PIN incorreto! (Simulado)');
        alert('Código PIN inválido (Simulação)'); // Feedback simples por enquanto
        setIsLoading(false);
      }
      // setIsLoading(false); // Desativar loading (já feito no else e no redirecionamento)
    }, 1000);
  };

  // --- Lógica para Desabilitar Botão (Simplificado) ---
  // Desabilita apenas se estiver carregando ou se o PIN não estiver completo
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
            Digite o código de {PIN_LENGTH} dígitos enviado para o seu email.
          </p>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>

            {/* ---- Componente PinInput INTEGRADO ---- */}
            <PinInput
                length={PIN_LENGTH}
                value={pin}
                onChange={handlePinChange}
                // Props de erro removidas temporariamente (onErrorChange, isInvalid, aria-describedby, attemptedSubmit)
                disabled={isLoading}
                autoFocus
                name="recovery_code"
                // --- Estilização Essencial via CSS Modules ---
                // É CRUCIAL que essas classes existam no seu RecoveryCode.module.css
                inputContainerClassName={styles.pinInputGroup || ''} // Adicionei fallback para evitar erro se a classe não existir
                inputClassName={styles.pinDigitInput || ''}          // Adicionei fallback
                // ----------------------------------------------
            />
            {/* Container de erro específico do PIN removido temporariamente */}

            {/* Espaçamento Manual (Alternativa enquanto não há container de erro) */}
            <div style={{ height: '1.25rem', marginBottom: '0.8rem' }}></div>

            {/* Botão de Submissão */}
            <button
              type="submit"
              className={`${styles.submitButton} ${styles.mt1}`} // Mantive mt1 para espaçamento
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
            <Link href="/forgot-password/enter-email">
              Digite outro email
            </Link>
          </p>

        </div> {/* Fim contentWrapper */}
      </div> {/* Fim rightPanel */}
    </div> // Fim pageContainer
  );
}