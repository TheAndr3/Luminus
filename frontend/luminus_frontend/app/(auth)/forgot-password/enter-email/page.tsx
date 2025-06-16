// -*- coding: utf-8 -*-
/**
 * @file EnterEmailPage.tsx
 * @description Define o componente da página para solicitar o email do usuário
 *              (ex: para recuperação de senha). Utiliza layout similar à LoginPage,
 *              mas com seu próprio CSS Module (EnterEmail.module.css).
 * @version 1.2 // <<< Versão atualizada
 * @date 02-05-2025 // <<< Data atualizada (ou mantenha a original)
 * @author Pedro e Armando
 */

/*
-------------------------- FALTA INTEGRAÇÃO COM A API --------------------------
*/

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // <<< --- 1. IMPORTAR useRouter ---
// --- IMPORTANTE: Importa o NOVO CSS Module específico ---
import styles from './enterEmail.module.css';
import { SendRecoveryEmail } from '@/services/professorService';

// --- Importações de Componentes Customizados ---
import { EmailInput } from '@/components/inputs/EmailInput';
import Carousel from '@/components/carousel/Carousel';

// --- Tipos ---
type FormErrors = {
  email?: string | null;
  general?: string | null;
};

/**
 * @component EnterEmailPage
 * @description Componente funcional que renderiza a página para inserir email.
 *              Usa layout de dois painéis definido em EnterEmail.module.css.
 */
export default function EnterEmailPage() {
  const router = useRouter(); // <<< --- 2. INSTANCIAR O ROUTER ---

  // --- Estados do Componente ---
  const [formData, setFormData] = useState({ email: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // --- Função Auxiliar de Validação ---
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

   // --- Slides para o Carrossel ---
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

  // --- Manipuladores de Eventos ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFormData({ email: value });
      setFormErrors(prevErrors => ({
          ...prevErrors,
          email: null,
          general: null
      }));
    };

  // --- Submissão do Formulário ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({});
    setIsLoading(true);

    // --- Validação Client-Side ---
    const errors: FormErrors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório.';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Formato de email inválido.';
    }

    // --- Verifica erros de validação ---
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      // Chama a API para enviar o email de recuperação
      await SendRecoveryEmail(formData.email);
      
      // Se chegou aqui, o email foi enviado com sucesso
      const encodedEmail = encodeURIComponent(formData.email);
      router.push(`/forgot-password/recovery-code?email=${encodedEmail}`);
    } catch (error: any) {
      console.error("Erro ao enviar email de recuperação:", error);
      setFormErrors({ general: error.message || 'Erro ao enviar email de recuperação. Tente novamente mais tarde.' });
    } finally {
      // Importante: Não desativar o loading aqui se o redirecionamento ocorrer,
      // pois o componente será desmontado. Mas se o envio falhar, precisa desativar.
      // A lógica atual já faz isso corretamente no bloco catch e se a validação falhar.
      // Adicionamos a desativação no 'finally' apenas para garantir em caso de erro inesperado
      // antes do redirecionamento ou se o 'sucessoEnvio' for falso.
       if (!router) setIsLoading(false); // Só desativa se não for redirecionar (ou se erro) - router check pode não ser necessário aqui, mas seguro.
       // Simplificação: A lógica original no catch/validação já cobre a falha.
       // O finally só será útil se o envio FALHAR. Se tiver sucesso, o componente desmonta.
       setIsLoading(false); // Desativar sempre no finally é mais seguro se a navegação falhar por algum motivo raro.
    }
  };

  // --- IDs para Acessibilidade ---
  const emailErrorId = 'enter-email-error';
  const generalErrorId = 'enter-email-general-error';

  // --- Lógica para Desabilitar Botão ---
  const isSubmitDisabled = isLoading || !formData.email.trim();

  // --- Renderização do Componente ---
  return (
    <div className={styles.pageContainer}>

      {/* Painel Esquerdo: Carrossel e Logo Nexus */}
      <div className={styles.leftPanel}>
         <div className={styles.NexusLogoContainer}>
           <Image src="/logo-Nexus.svg" alt="Nexus Logo" width={200} height={40}/>
         </div>
         <Carousel autoSlide={true} autoSlideInterval={5000}>
           {enterEmailSlides}
         </Carousel>
      </div>

      {/* Painel Direito: Logo Luminus Fixo e Formulário Centralizado */}
      <div className={styles.rightPanel}>
        {/* Logo Luminus */}
        <div className={styles.logoContainer}>
            <Image src="/logo-Luminus.svg" alt="Luminus Logo" width={200} height={50} priority />
        </div>

        {/* Wrapper de Conteúdo */}
        <div className={styles.contentWrapper}>

          {/* Título Adaptado */}
          <h1 className={styles.title}>RECUPERAR SENHA</h1>

          {/* Instrução adicional */}
          <p className={styles.instructionText}>
            Digite seu email cadastrado para receber o PIN de recuperação.
          </p>

          {/* Container para Erro Geral */}
          {formErrors.general && (
            <div role="alert" className={styles.generalErrorContainer}>
               <span id={generalErrorId} className={styles.errorText}>
                 {formErrors.general}
               </span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* Campo de Email usando EmailInput */}
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
               {/* Slot de Erro */}
               <div className={styles.errorSlot} aria-live="polite">
                 {formErrors.email && (
                   <span id={emailErrorId} className={styles.errorText}>
                     {formErrors.email}
                   </span>
                 )}
               </div>
            </div>

            {/* Botão de Submissão Adaptado */}
            <button
              type="submit"
              className={`${styles.submitButton}`}
              disabled={isSubmitDisabled}
            >
              {isLoading ? 'Enviando...' : 'Enviar PIN de Recuperação'}
            </button>
          </form>

          {/* Link para voltar ao Login */}
          <p className={styles.switchLink}>
            Lembrou sua senha?{' '}
            <Link href="/login">
              Voltar para Login
            </Link>
          </p>

        </div> {/* Fim contentWrapper */}
      </div> {/* Fim rightPanel */}
    </div> // Fim pageContainer
  );
}