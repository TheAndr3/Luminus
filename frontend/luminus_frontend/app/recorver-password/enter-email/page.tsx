// -*- coding: utf-8 -*-
/**
 * @file EnterEmailPage.tsx
 * @description Define o componente da página para solicitar o email do usuário
 *              (ex: para recuperação de senha). Utiliza layout similar à LoginPage,
 *              mas com seu próprio CSS Module (EnterEmail.module.css).
 * @version 1.1
 * @date 02-05-2025
 * @author Pedro e Armando
 */

/*
-------------------------- FALTA INTEGRAÇÃO COM A API --------------------------
*/

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// --- IMPORTANTE: Importa o NOVO CSS Module específico ---
import styles from './EnterEmail.module.css'; // <<< Atualizado

// --- Importações de Componentes Customizados ---
import { EmailInput } from '@/components/inputs/EmailInput'; // <<< Usa EmailInput conforme pedido
import Carousel from '@/components/carousel/Carousel';     // Reutiliza o Carousel

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
  // --- Estados do Componente (Mesma lógica da LoginPage) ---
  const [formData, setFormData] = useState({ email: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // --- Função Auxiliar de Validação (Mesma lógica da LoginPage) ---
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // --- Slides para o Carrossel (Pode reutilizar ou adaptar) ---
  const enterEmailSlides = [
    <Image
      key="enter-email-slide-1"
      src="/carroselAlunos.png" // Adapte se necessário
      alt="Recupere seu acesso"
      layout="fill" objectFit="cover" priority
    />,
    <Image
      key="enter-email-slide-2"
      src="/carroselGerencie.png" // Adapte se necessário
      alt="Processo simples e rápido"
      layout="fill" objectFit="cover"
    />,
    <Image
      key="enter-email-slide-3"
      src="/carroselAvaliação.png" // Adapte se necessário
      alt="Insira seu email para continuar"
      layout="fill" objectFit="cover"
    />,
  ];

  // --- Manipuladores de Eventos (Mesma lógica da LoginPage) ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFormData({ email: value });
      // Limpa erros ao digitar
      setFormErrors(prevErrors => ({
          ...prevErrors,
          email: null, // Limpa erro específico do email
          general: null  // Limpa erro geral
      }));
    };

  // --- Submissão do Formulário (Mesma lógica da LoginPage, com simulação) ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({}); // Limpa erros anteriores
    setIsLoading(true); // Ativa carregamento

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
      return; // Interrompe se houver erros
    }

    // --- Tentativa de Envio (Simulação) ---
    console.log('Validação OK. Enviando solicitação para:', formData.email);
    try {
        // Simula chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Simula sucesso/falha (substitua pela lógica real)
        const sucessoEnvio = Math.random() > 0.2; // 80% chance de sucesso

        if (sucessoEnvio) {
            alert(`Sucesso (simulado)! Se o email ${formData.email} estiver cadastrado, você receberá um link.`);
            // Aqui você pode redirecionar ou mostrar uma mensagem de sucesso permanente
            setFormErrors({}); // Limpa erros em caso de sucesso
            // setFormData({ email: '' }); // Opcional: Limpar campo
        } else {
            // Simula erro da API
            throw new Error("Email não encontrado ou falha ao enviar.");
        }
    } catch (error: any) {
      console.error("Erro durante a solicitação (simulado):", error);
      // Define erro geral para exibição
      setFormErrors({ general: `Falha na solicitação: ${error.message || 'Tente novamente mais tarde.'}` });
    } finally {
      setIsLoading(false); // Garante desativar carregamento
    }
  };

  // --- IDs para Acessibilidade ---
  const emailErrorId = 'enter-email-error';
  const generalErrorId = 'enter-email-general-error';

  // --- Lógica para Desabilitar Botão ---
  const isSubmitDisabled = isLoading || !formData.email.trim();

  // --- Renderização do Componente ---
  return (
    // USA O NOVO CSS MODULE importado como 'styles'
    <div className={styles.pageContainer}>

      {/* Painel Esquerdo: Carrossel e Logo Nexus */}
      <div className={styles.leftPanel}>
         <div className={styles.NexusLogoContainer}> {/* Usa classe do EnterEmail.module.css */}
           <Image src="/logo-Nexus.svg" alt="Nexus Logo" width={200} height={40}/>
         </div>
         <Carousel autoSlide={true} autoSlideInterval={5000}>
           {enterEmailSlides}
         </Carousel>
      </div>

      {/* Painel Direito: Logo Luminus Fixo e Formulário Centralizado */}
      <div className={styles.rightPanel}> {/* Usa classe do EnterEmail.module.css */}
        {/* Logo Luminus */}
        <div className={styles.logoContainer}> {/* Usa classe do EnterEmail.module.css */}
            <Image src="/logo-Luminus.svg" alt="Luminus Logo" width={200} height={50} priority />
        </div>

        {/* Wrapper de Conteúdo */}
        <div className={styles.contentWrapper}> {/* Usa classe do EnterEmail.module.css */}

          {/* Título Adaptado */}
          <h1 className={styles.title}>RECUPERAR SENHA</h1>

          {/* Instrução adicional */}
          <p className={styles.instructionText}> {/* Usa classe do EnterEmail.module.css */}
            Digite seu email cadastrado para receber o link de recuperação.
          </p>

          {/* Container para Erro Geral */}
          {formErrors.general && (
            <div role="alert" className={styles.generalErrorContainer}> {/* Usa classe do EnterEmail.module.css */}
               <span id={generalErrorId} className={styles.errorText}> {/* Usa classe do EnterEmail.module.css */}
                 {formErrors.general}
               </span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate> {/* Usa classe do EnterEmail.module.css */}
            {/* Campo de Email usando EmailInput */}
            <div className={styles.inputWrapper}> {/* Usa classe do EnterEmail.module.css */}
               <EmailInput // <<< COMPONENTE EMAILINPUT SENDO USADO
                 label="Email:"
                 id="recover-email" // ID único
                 placeholder="Digite seu email cadastrado"
                 value={formData.email}
                 onChange={handleChange} // Handler para atualizar estado
                 required // Obrigatório
                 isInvalid={!!formErrors.email} // Estilo de erro
                 aria-describedby={formErrors.email ? emailErrorId : undefined} // Acessibilidade
                 disabled={isLoading} // Desabilitado durante loading
                 name="email" // Nome do campo
               />
               {/* Slot de Erro */}
               <div className={styles.errorSlot} aria-live="polite"> {/* Usa classe do EnterEmail.module.css */}
                 {formErrors.email && (
                   <span id={emailErrorId} className={styles.errorText}> {/* Usa classe do EnterEmail.module.css */}
                     {formErrors.email}
                   </span>
                 )}
               </div>
            </div>

            {/* Botão de Submissão Adaptado */}
            <button
              type="submit"
              // Adiciona margem superior pois não há 'extraOptions' aqui
              className={`${styles.submitButton}`} // Usa classes do EnterEmail.module.css (Aqui tinha um erro, mas apagar nao mudou nada)
              disabled={isSubmitDisabled} // Desabilita se carregando ou campo vazio
            >
              {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>
          </form>

          {/* Link para voltar ao Login */}
          <p className={styles.switchLink}> {/* Usa classe do EnterEmail.module.css */}
            Lembrou sua senha?{' '}
            <Link href="/login"> {/* Ajuste a rota se necessário */}
              Voltar para Login
            </Link>
          </p>

        </div> {/* Fim contentWrapper */}
      </div> {/* Fim rightPanel */}
    </div> // Fim pageContainer
  );
}