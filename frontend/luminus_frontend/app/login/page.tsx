/**
 * @file LoginPage.tsx (ou page.tsx dentro de /login)
 * @description Página de Login de usuário com Logo fixo e conteúdo centralizado.
 */
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './login.module.css'; // CSS que inclui .contentWrapper

// --- Importações de Componentes ---
import { EmailInput } from '@/components/inputs/EmailInput';
import { PasswordInput } from '@/components/inputs/PasswordInput';
import Carousel from '@/components/carousel/Carousel';

// --- Tipos ---
type FormErrors = {
  email?: string | null;
  password?: string | null;
  general?: string | null;
};

/**
 * @component LoginPage
 * @description Componente funcional que renderiza a página de login com logo fixo.
 */
export default function LoginPage() {
  // --- Estados ---
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // --- Validação ---
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // --- Slides para o Carousel ---
  const loginSlides = [
    <Image
      key="login-slide-1"
      src="/carroselAlunos.png"
      alt="Bem-vindo de volta - Gerencie seus alunos"
      layout="fill"
      objectFit="cover"
      priority
    />,
    <Image
      key="login-slide-2"
      src="/carroselGerencie.png"
      alt="Organize suas turmas e avaliações"
      layout="fill"
      objectFit="cover"
    />,
    <Image
      key="login-slide-3"
      src="/carroselAvaliação.png"
      alt="Acesse dados e insights rapidamente"
      layout="fill"
      objectFit="cover"
    />,
  ];

  // --- Handlers ---
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

  // --- Submissão ---
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

    console.log('Validação OK. Submetendo Login:', formData);
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const loginSucesso = Math.random() > 0.2;

        if (loginSucesso) {
            alert(`Login (simulado) sucesso!\nEmail: ${formData.email}\nManter: ${formData.rememberMe}`);
            setFormData({ email: '', password: '', rememberMe: false });
            setFormErrors({});
            setHasAttemptedSubmit(false);
            // router.push('/dashboard');
        } else {
            throw new Error("Credenciais inválidas");
        }
    } catch (error: any) {
      console.error("Erro login:", error);
      setFormErrors({ general: `Falha no login: ${error.message || 'Verifique suas credenciais.'}` });
      setHasAttemptedSubmit(false);
    } finally {
        setIsLoading(false);
    }
  };

  // --- IDs ---
  const emailErrorId = 'login-email-error';
  const passwordErrorId = 'login-password-error';
  const generalErrorId = 'login-general-error';

  // --- Submit Button Logic ---
  const isAnyFieldEmpty = !formData.email.trim() || !formData.password;
  const isSubmitDisabled = isLoading || isAnyFieldEmpty;

  // --- Renderização ---
  return (
    <div className={styles.pageContainer}>

      {/* Painel Esquerdo: Carousel */}
      <div className={styles.leftPanel}>
         <div className={styles.NexusLogoContainer}>
           <Image
             src="/logo-Nexus.svg"
             alt="Nexus Logo"
             width={200} height={40} // Ajuste conforme CSS (se usou scale)
           />
         </div>
         <Carousel autoSlide={true} autoSlideInterval={5000}>
           {loginSlides}
         </Carousel>
      </div> {/* Fim leftPanel */}

      {/* Painel Direito: Formulário de Login */}
      <div className={styles.rightPanel}>
        {/* Logo Principal (Luminus) - Fica FORA do wrapper */}
        <div className={styles.logoContainer}>
            <Image
                src="/logo-Luminus.svg"
                alt="Luminus Logo"
                width={200} height={50} // Ajuste conforme CSS (se usou scale)
                priority
            />
        </div>

        {/* <<< INÍCIO DO CONTENT WRAPPER >>> */}
        <div className={styles.contentWrapper}>

          <h1 className={styles.title}>LOGIN</h1>

          {/* Container para Erro Geral */}
          {formErrors.general && (
            <div role="alert" className={styles.generalErrorContainer}>
               <span id={generalErrorId} className={styles.errorText}>
                 {formErrors.general}
               </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* Email Input com Wrapper e Error Slot */}
            <div className={styles.inputWrapper}>
               <EmailInput
                 label="Email:"
                 id="login-email"
                 placeholder="Email"
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

            {/* Password Input com Wrapper e Error Slot */}
            <div className={styles.inputWrapper}>
               <PasswordInput
                 label="Senha:"
                 id="login-password"
                 placeholder="Senha"
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

            {/* Checkbox HTML padrão e link "Esqueci minha senha" */}
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
              <Link href="/forgot-password" className={styles.forgotPasswordLink}>
                Esqueci minha senha
              </Link>
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              // className={`${styles.submitButton} mt-1`} // mt-1 pode não ser mais necessário
              className={styles.submitButton}
              disabled={isSubmitDisabled}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Link para Cadastro */}
          <p className={styles.switchLink}>
            Não tem uma conta?{' '}
            <Link href="/register"> {/* Mantido /register como no seu último TSX */}
              Cadastre-se
            </Link>
          </p>

        </div> {/* <<< FIM DO CONTENT WRAPPER >>> */}

      </div> {/* Fim rightPanel */}
    </div> // Fim pageContainer
  );
}