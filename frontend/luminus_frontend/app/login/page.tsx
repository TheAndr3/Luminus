/**
 * @file LoginPage.tsx (ou page.tsx dentro de /login)
 * @description Página de Login de usuário com Carousel no painel esquerdo.
 */
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './login.module.css'; // Estilos gerais da página/layout

// --- Importações de Componentes ---
import { EmailInput } from '@/components/inputs/EmailInput';
import { PasswordInput } from '@/components/inputs/PasswordInput';
import { Checkbox } from '@/components/checkboxs/Checkbox';
import { ErrorContainer } from '@/components/errors/ErrorContainer';
// --- ADICIONADO: Importar o Carousel ---
import Carousel from '@/components/carousel/Carousel';

// --- Tipos ---
type FormErrors = {
  email?: string | null;
  password?: string | null;
  general?: string | null;
};

/**
 * @component LoginPage
 * @description Componente funcional que renderiza a página de login com carousel.
 */
export default function LoginPage() {
  // --- Estados (sem alterações) ---
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // --- Validação (sem alterações) ---
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // --- ADICIONADO: Definição dos Slides para o Carousel ---
  // Ajuste os `src` e `alt` conforme necessário para a página de login
  const loginSlides = [
    <Image
      key="login-slide-1"
      src="/carroselAlunos.png" // Exemplo: reutilizando slide
      alt="Bem-vindo de volta - Gerencie seus alunos"
      layout="fill"
      objectFit="cover"
      priority // Primeira imagem
    />,
    <Image
      key="login-slide-2"
      src="/carroselGerencie.png" // Exemplo: reutilizando slide
      alt="Organize suas turmas e avaliações"
      layout="fill"
      objectFit="cover"
    />,
    <Image
      key="login-slide-3"
      src="/carroselAvaliação.png" // Exemplo: reutilizando slide
      alt="Acesse dados e insights rapidamente"
      layout="fill"
      objectFit="cover"
    />,
  ];


  // --- Handlers (sem alterações) ---
  const handleChange = (field: 'email' | 'password') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFormData(prevData => ({ ...prevData, [field]: value }));
      setFormErrors(prevErrors => {
          const updatedErrors: FormErrors = { ...prevErrors, general: null };
          if (field === 'email') updatedErrors.email = null;
          else if (field === 'password') updatedErrors.password = null;
          return updatedErrors;
      });
    };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevData => ({ ...prevData, rememberMe: e.target.checked }));
  };

  // --- Submissão (sem alterações) ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({});
    setHasAttemptedSubmit(true);
    setIsLoading(true);

    const errors: FormErrors = {};
    if (!formData.email.trim()) errors.email = 'Email é obrigatório.';
    else if (!validateEmail(formData.email)) errors.email = 'Formato de email inválido.';
    if (!formData.password) errors.password = 'Senha é obrigatória.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    console.log('Validação de frontend OK. Submetendo Login com dados:', formData);
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert(`Login (simulado) realizado com sucesso!\nEmail: ${formData.email}\nManter conectado: ${formData.rememberMe}`);
        setFormData({ email: '', password: '', rememberMe: false });
        setFormErrors({});
        setHasAttemptedSubmit(false);
        // router.push('/dashboard');
    } catch (error) {
      console.error("Erro na simulação de login:", error);
      setFormErrors({ general: 'Falha no login. Verifique suas credenciais.' }); // Exemplo de erro geral
    } finally {
        setIsLoading(false);
    }
  };

  // --- IDs (sem alterações) ---
  const emailInputId = 'login-email';
  const passwordInputId = 'login-password';
  const generalErrorId = 'general-error';

  // --- Renderização ---
  return (
    // Container principal - removido overflow-hidden daqui se ainda estiver
    <div className={styles.pageContainer}>

      {/* Painel Esquerdo: Agora com Logo Nexus e Carousel */}
      <div className={styles.leftPanel}>
         {/* Logo Secundário (Nexus) - Posicionado sobre o carrossel via CSS */}
         <div className={styles.NexusLogoContainer}>
           <Image
             src="/logo-Nexus.svg" // Logo do painel esquerdo
             alt="Nexus Logo"
             width={200} // Ajuste tamanho conforme necessário
             height={40}  // Ajuste tamanho conforme necessário
           />
         </div>
         {/* --- ADICIONADO: Carousel --- */}
         <Carousel autoSlide={true} autoSlideInterval={5000}>
           {loginSlides}
         </Carousel>
      </div> {/* Fim leftPanel */}

      {/* Painel Direito (Formulário de Login - sem alterações estruturais) */}
      <div className={styles.rightPanel}>
        {/* Logo Principal (Luminus) */}
        <div className={styles.logoContainer}>
            <Image
                src="/logo-Luminus.svg" // Logo do painel direito
                alt="Luminus Logo"
                width={200} height={50} priority
            />
        </div>
        <h1 className={styles.title}>LOGIN</h1>
        <ErrorContainer id={generalErrorId} message={formErrors.general} />

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <EmailInput
            id={emailInputId}
            label="Email:"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange('email')}
            required
            disabled={isLoading}
            name="email"
            error={formErrors.email}
            errorDisplayMode="inline"
          />

          <PasswordInput
            id={passwordInputId}
            label="Senha:"
            placeholder="Senha"
            value={formData.password}
            onChange={handleChange('password')}
            required
            disabled={isLoading}
            name="password"
            error={formErrors.password}
            attemptedSubmit={hasAttemptedSubmit}
            requiredMessage="Senha é Obrigatório"
            errorDisplayMode="inline"
          />

          <div className={styles.checkboxGroup}>
            <Checkbox
              id="remember-me"
              label="Manter conectado"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleCheckboxChange}
              disabled={isLoading}
              labelClassName="text-sm text-gray-700"
            />
            <Link href="/forgot-password" className={styles.forgotPasswordLink}>
              Esqueci minha senha
            </Link>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Não tem uma conta?{' '}
          <Link href="/register">
            Cadastre-se
          </Link>
        </p>
      </div> {/* Fim rightPanel */}
    </div> // Fim pageContainer
  );
}