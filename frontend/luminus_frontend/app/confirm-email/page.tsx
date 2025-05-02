/**
 * @file confirmPage.tsx
 * @description Página de confirmação de PIN que lê o email da URL.
 */
'use client';

import React, { useState, useEffect, useId, Suspense } from 'react'; // <<<--- 1. Importar Suspense
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; // <<<--- 2. Importar useSearchParams
import styles from './confirmEmail.module.css';

// --- Importações de Componentes ---
import { PinInput } from '@/components/inputs/PinInput';
import Carousel from '@/components/carousel/Carousel';

// --- Tipos ---
type FormErrors = { userPin?: string | null; };
type FormDataState = { userPin: string; };

// --- Slides ---
const confirmEmailSlides = [
    <Image key="conf-slide-1" src="/carroselAlunos.png" alt="Confirmação Segura" layout="fill" objectFit="cover" priority />,
    <Image key="conf-slide-2" src="/carroselGerencie.png" alt="Acesso Quase Pronto" layout="fill" objectFit="cover" />,
    <Image key="conf-slide-3" src="/carroselAvaliação.png" alt="Último Passo" layout="fill" objectFit="cover" />,
];

// --- Componente Interno para usar Hooks de Cliente ---
function ConfirmEmailContent() {
  const searchParams = useSearchParams(); // <<<--- 3. Usar useSearchParams
  // --- Estados ---
  const [formData, setFormData] = useState<FormDataState>({ userPin: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null); // Inicia como null
  const PIN_LENGTH = 4;
  const pinErrorId = useId();

  // --- 4. Ler email da URL no useEffect ---
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setUserEmail(emailFromUrl); // Atualiza o estado com o email da URL
    } else {
      console.warn("Email não encontrado nos parâmetros da URL.");
      // Poderia redirecionar ou mostrar uma mensagem padrão aqui
      // setUserEmail("Email não fornecido"); // Exemplo
    }
  }, [searchParams]); // Executa quando searchParams mudar

  // --- Handlers ---
  const handlePinChange = (value: string) => {
      const numericValue = value.replace(/\D/g, '');
      setFormData({ userPin: numericValue });
      if (formErrors.userPin) setFormErrors({});
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({});
    const errors: FormErrors = {};
    if (!formData.userPin) errors.userPin = 'O PIN é obrigatório.';
    else if (formData.userPin.length !== PIN_LENGTH) errors.userPin = `O PIN deve ter ${PIN_LENGTH} dígitos.`;
    else if (!/^\d+$/.test(formData.userPin)) errors.userPin = 'O PIN deve conter apenas números.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    console.log('PIN para verificação:', formData.userPin, 'para:', userEmail); // userEmail agora vem da URL
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert(`PIN verificado com sucesso para ${userEmail}! (simulado)`);
        setFormData({ userPin: '' });
        // Idealmente, redirecionar: router.push('/login'); ou '/dashboard'
    } catch (error) {
        console.error("Erro verificação PIN:", error);
        setFormErrors({ userPin: 'PIN inválido ou expirado. Tente novamente.' });
    } finally {
        setIsLoading(false);
    }
  };

  // --- Lógica Botão Submit ---
  const isSubmitDisabled = isLoading || !userEmail || formData.userPin.length !== PIN_LENGTH || !!formErrors.userPin;

  // --- DEFINIÇÃO DOS ESTILOS PARA O PININPUT (Tailwind) ---
  const pinInputContainerStyle = `flex items-center justify-center space-x-3`;
  const getPinInputStyle = () => {
    let classes = `w-14 h-16 text-center text-xl font-semibold border-2 rounded-lg bg-white text-gray-900 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-600 focus:border-blue-600 caret-color-blue-600`;
    if (formErrors.userPin) classes += ' border-red-500'; else classes += ' border-black';
    if (isLoading || !userEmail) classes += ' bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed';
    return classes;
  };
  const pinInputWrapperStyle = `mb-2`;

  // --- Renderização do Conteúdo ---
  return (
    <div className={styles.pageContainer}>
      {/* Painel Esquerdo: Formulário */}
      <div className={styles.leftPanel}>
        <div className={styles.logoContainer}>
          <Image src="/logo-Luminus.svg" alt="Luminus Logo" width={200} height={50} priority />
        </div>
        <div className={styles.contentWrapper}>
          <p className={styles.pinPromptLabel}>
            {userEmail ? ( // <<<--- Mostra email do estado (vindo da URL)
              <>
                Insira o pin recebido em <br />
                <strong>{userEmail}</strong>.
              </>
            ) : (
              'Carregando email...' // Mensagem enquanto busca o email
            )}
          </p>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div>
              <PinInput
                length={PIN_LENGTH} value={formData.userPin} onChange={handlePinChange}
                isInvalid={!!formErrors.userPin} aria-describedby={formErrors.userPin ? pinErrorId : undefined}
                autoFocus disabled={isLoading || !userEmail} name="userPin"
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
      {/* Painel Direito: Carousel */}
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

/**
 * @component ConfirmEmailPage (Wrapper)
 * @description Wrapper para usar Suspense com useSearchParams.
 */
export default function ConfirmEmailPage() {
  // <<<--- 5. Envolver o conteúdo com Suspense ---<<<
  // Isso é necessário porque useSearchParams pode suspender a renderização
  // enquanto os parâmetros da URL são lidos no lado do cliente.
  return (
    <Suspense fallback={<div>Carregando...</div>}> {/* Pode ser um spinner ou layout skeleton */}
      <ConfirmEmailContent />
    </Suspense>
  );
}