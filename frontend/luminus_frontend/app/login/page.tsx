/**
 * @file LoginPage.tsx (ou page.tsx dentro de /login)
 * @description Página de Login de usuário.
 */
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './login.module.css'; // Estilos gerais da página/layout

// --- Importações de Componentes ---
import { EmailInput } from '@/components/inputs/EmailInput';
import { PasswordInput } from '@/components/inputs/PasswordInput'; // Ensure path is correct
import { Checkbox } from '@/components/checkboxs/Checkbox';
import { ErrorContainer } from '@/components/errors/ErrorContainer';

// --- Tipos ---
type FormErrors = {
  email?: string | null;
  password?: string | null; // For errors coming from submit (e.g., 'required')
  general?: string | null;  // For non-field-specific errors
};

/**
 * @component LoginPage
 * @description Componente funcional que renderiza a página de login.
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
  // --- NOVO ESTADO: Rastreia se o usuário tentou submeter ---
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // --- Validação ---
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // --- Handlers ---
  const handleChange = (field: 'email' | 'password') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFormData(prevData => ({ ...prevData, [field]: value }));

      // --- LÓGICA DE LIMPEZA DE ERRO ATUALIZADA ---
      // Limpa o erro específico do campo sendo editado E o erro geral.
      // NÃO limpa o erro do *outro* campo.
      setFormErrors(prevErrors => {
          const updatedErrors: FormErrors = { ...prevErrors, general: null };
          if (field === 'email') {
              updatedErrors.email = null;
          } else if (field === 'password') {
              updatedErrors.password = null;
          }
          return updatedErrors;
      });
      // Não resetamos hasAttemptedSubmit aqui. Ele só é resetado em um submit bem-sucedido (ou outra ação de reset).
    };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevData => ({ ...prevData, rememberMe: e.target.checked }));
  };

  // --- Submissão com Flag de Tentativa ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({}); // Limpa erros anteriores antes de validar
    // --- MARCA QUE A SUBMISSÃO FOI TENTADA ---
    setHasAttemptedSubmit(true);
    setIsLoading(true);

    // --- Validação de Frontend Obrigatória ---
    const errors: FormErrors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório.';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Formato de email inválido.';
    }

    // --- Validação de Senha Obrigatória (no submit) ---
    // Esta validação AINDA é útil aqui para definir o erro inicial
    // que será passado para o PasswordInput como 'error' (externalError).
    if (!formData.password) {
      errors.password = 'Senha é obrigatória.'; // Usamos a mensagem padrão aqui
                                                  // ou a 'requiredMessage' do PasswordInput se quisermos consistência
                                                  // Mas como 'PasswordInput' prioriza 'externalError', esta mensagem será mostrada.
    }
    // A validação de força acontece dentro do PasswordInput e é mostrada lá.

    // --- Verifica Erros de Validação do Submit ---
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors); // Define os erros 'required' ou 'formato'
      setIsLoading(false);
      return; // Impede o "login"
    }

    // --- Simulação de Sucesso ---
    console.log('Validação de frontend OK. Submetendo Login com dados:', formData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`Login (simulado) realizado com sucesso!\nEmail: ${formData.email}\nManter conectado: ${formData.rememberMe}`);

    // Resetar form e flags após sucesso
    setFormData({ email: '', password: '', rememberMe: false });
    setFormErrors({});
    setHasAttemptedSubmit(false); // Reseta a flag de tentativa
    setIsLoading(false);
    // router.push('/dashboard');
  };

  // --- IDs ---
  const emailInputId = 'login-email';
  const passwordInputId = 'login-password';
  const generalErrorId = 'general-error';

  // --- Renderização ---
  return (
    <div className={`${styles.pageContainer} overflow-hidden`}>
      {/* Painel Esquerdo */}
      <div className={styles.leftPanel}>{/* ... */}</div>

      {/* Painel Direito */}
      <div className={styles.rightPanel}>
        {/* Logo */}
        <div className={styles.logoContainer}>
            <Image
                src="/logo-Luminus.svg"
                alt="Luminus Nexus Logo"
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
            error={formErrors.email} // Passa erro do submit
            errorDisplayMode="inline"
          />

          <PasswordInput
            id={passwordInputId}
            label="Senha:"
            placeholder="Senha"
            value={formData.password}
            onChange={handleChange('password')}
            required // Importante para a lógica interna do PasswordInput
            disabled={isLoading}
            name="password"
            error={formErrors.password} // Passa o erro de submit ('Senha é obrigatória.')
            attemptedSubmit={hasAttemptedSubmit} // Passa a flag de tentativa
            requiredMessage="Senha é Obrigatório" // Mensagem usada internamente pelo PasswordInput se error=null
            errorDisplayMode="inline"
            // showPasswordLabel, hidePasswordLabel, iconClassName podem ser adicionados se necessário
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
            <Link href="/esqueceu-senha" className={styles.forgotPasswordLink}>
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
      </div>
    </div>
  );
}