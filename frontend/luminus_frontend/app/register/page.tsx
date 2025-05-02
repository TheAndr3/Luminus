/**
 * @file RegisterPage.tsx
 * @description Página de cadastro de novo usuário (modificada com scrollbar e carousel).
 * Contém um formulário com campos para usuário, email, telefone e senha,
 * incluindo validações básicas e uma simulação de envio.
 */
'use client';

import React, { useState, useEffect } from 'react'; // Import useEffect if needed later, useState is definitely used
import Image from 'next/image';
import Link from 'next/link';
import styles from './register.module.css';
import Carousel from '@/components/carousel/Carousel';

// --- Importações de Componentes ---
import { TextInput } from '@/components/inputs/TextInput';
import { EmailInput } from '@/components/inputs/EmailInput';
import { PhoneInput, unformatPhoneNumber } from '@/components/inputs/PhoneInput';
import { PasswordInput } from '@/components/inputs/PasswordInput';

// --- Tipos (mantidos) ---
type FormErrors = {
  username?: string | null;
  email?: string | null;
  contactNumber?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
};

type InternalErrors = {
    password?: string | null;
    contactNumber?: string | null;
};


/**
 * @component RegisterPage
 * @description Componente funcional que renderiza a página de cadastro (modificada).
 */
export default function RegisterPage() {
  // --- Estados do Componente (mantidos) ---
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [internalErrors, setInternalErrors] = useState<InternalErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // --- Funções Auxiliares (mantidas) ---
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // --- Slides para o Carousel (mantido) ---
  const registerSlides = [
    <Image key="reg-slide-1" src="/carroselAlunos.png" alt="Funcionalidade 1 do Registro" layout="fill" objectFit="cover" priority />,
    <Image key="reg-slide-2" src="/carroselGerencie.png" alt="Funcionalidade 2 do Registro" layout="fill" objectFit="cover" />,
    <Image key="reg-slide-3" src="/carroselAvaliação.png" alt="Funcionalidade 3 do Registro" layout="fill" objectFit="cover" />,
  ];

  // --- Manipuladores de Eventos (mantidos) ---
  const handleChange = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFormData(prevData => ({ ...prevData, [field]: value }));

      if (formErrors[field]) {
        setFormErrors(prevErrors => ({ ...prevErrors, [field]: null }));
      }
      if ((field === 'password' || field === 'confirmPassword') && formErrors.confirmPassword) {
        setFormErrors(prevErrors => ({ ...prevErrors, confirmPassword: null }));
      }
    };

  const handleInternalError = (field: keyof InternalErrors, errorMessage: string | null) => {
      setInternalErrors(prev => ({ ...prev, [field]: errorMessage }));
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttemptedSubmit(true);
    setFormErrors({});
    setIsLoading(true);

    // --- Validações (mantidas) ---
    const errors: FormErrors = {};
    if (!formData.username.trim()) errors.username = 'Nome de usuário é obrigatório.';
    if (!formData.email.trim()) errors.email = 'Email é obrigatório.';
    else if (!validateEmail(formData.email)) errors.email = 'Formato de email inválido.';

    const phoneDigits = unformatPhoneNumber(formData.contactNumber);
    if (!formData.contactNumber.trim()) errors.contactNumber = 'Número de contato é obrigatório.';
    else if (phoneDigits.length < 10 || phoneDigits.length > 11) errors.contactNumber = 'Telefone inválido (10 ou 11 dígitos).';

    if (!formData.password) {
        errors.password = 'Senha é obrigatória.';
    } else if (internalErrors.password) {
        errors.password = internalErrors.password;
    }

    if (!formData.confirmPassword) {
        errors.confirmPassword = 'Confirmação de senha é obrigatória.';
    } else if (formData.password && formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'As senhas não coincidem.';
    }
    // --- Fim Validações ---

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    setInternalErrors({});
    console.log('Dados do Registro Validados:', {
        ...formData,
        contactNumberDigits: phoneDigits
    });

    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert('Registro (simulado) enviado com sucesso!');
        setFormData({ username: '', email: '', contactNumber: '', password: '', confirmPassword: '' });
        setAttemptedSubmit(false);
    } catch (error) {
        console.error("Erro na simulação de registro:", error);
    } finally {
        setIsLoading(false);
    }
  };

  // --- IDs para as mensagens de erro (mantidos) ---
  const usernameErrorId = 'username-error';
  const emailErrorId = 'email-error';
  const contactNumberErrorId = 'contactNumber-error';
  const passwordErrorId = 'password-error';
  const confirmPasswordErrorId = 'confirmPassword-error';

  // --- Variáveis para a lógica de exibição de erro (Senha - mantidas) ---
  const displayPasswordError = formErrors.password || internalErrors.password;
  const isPasswordInvalid = !!displayPasswordError;

  // --- NOVA LÓGICA: Habilita/Desabilita o botão de submit ---
  const isAnyFieldEmpty = !formData.username.trim() ||
                          !formData.email.trim() ||
                          !formData.contactNumber.trim() || // A formatação não impede a verificação do valor original
                          !formData.password.trim() ||
                          !formData.confirmPassword.trim();

  const isSubmitDisabled = isLoading || isAnyFieldEmpty;

  // --- Renderização do Componente ---
  return (
    <div className={styles.pageContainer}>
      {/* Painel Esquerdo */}
      <div className={styles.leftPanel}>
        {/* ... Logo, Título ... */}
        <div className={styles.logoContainer}>
          <Image src="/logo-Luminus.svg" alt="Luminus Nexus Logo" width={200} height={50} priority />
        </div>
        <h1 className={styles.title}>CADASTRO</h1>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* --- Inputs (mantidos como antes) --- */}
          {/* Usuário */}
          <div className={styles.inputWrapper}>
            <TextInput
              label="Usuário:"
              id="username"
              placeholder="Nome"
              value={formData.username}
              onChange={handleChange('username')}
              required
              isInvalid={!!formErrors.username}
              aria-describedby={formErrors.username ? usernameErrorId : undefined}
              disabled={isLoading}
              name="username"
            />
            <div className={styles.errorSlot} aria-live="polite">
              {formErrors.username && (
                <span id={usernameErrorId} className={styles.errorText}>
                  {formErrors.username}
                </span>
              )}
            </div>
          </div>
          {/* Email */}
          <div className={styles.inputWrapper}>
             <EmailInput
               label="Email:"
               id="email"
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
          {/* Telefone */}
          <div className={styles.inputWrapper}>
             <PhoneInput
               label="Número de contato:"
               id="contactNumber"
               value={formData.contactNumber}
               onChange={handleChange('contactNumber')}
               required
               isInvalid={!!formErrors.contactNumber}
               aria-describedby={formErrors.contactNumber ? contactNumberErrorId : undefined}
               disabled={isLoading}
               name="contactNumber"
               // onErrorChange={(err) => handleInternalError('contactNumber', err)} // Manter se PhoneInput implementar
               // externalError={formErrors.contactNumber}
               // attemptedSubmit={attemptedSubmit}
             />
              <div className={styles.errorSlot} aria-live="polite">
                { formErrors.contactNumber && (
                 <span id={contactNumberErrorId} className={styles.errorText}>
                   {formErrors.contactNumber}
                 </span>
               )}
             </div>
          </div>
          {/* Senha */}
          <div className={styles.inputWrapper}>
             <PasswordInput
               label="Senha:"
               id="password"
               placeholder="Mínimo 8 caracteres"
               value={formData.password}
               onChange={handleChange('password')}
               required
               minLength={8}
               disabled={isLoading}
               name="password"
               onErrorChange={(err) => handleInternalError('password', err)}
               externalError={formErrors.password}
               attemptedSubmit={attemptedSubmit}
               isInvalid={isPasswordInvalid}
               aria-describedby={isPasswordInvalid ? passwordErrorId : undefined}
             />
             <div className={styles.errorSlot} aria-live="polite">
               {displayPasswordError && (
                 <span id={passwordErrorId} className={styles.errorText}>
                   {displayPasswordError}
                 </span>
               )}
             </div>
          </div>
          {/* Confirmar Senha */}
          <div className={styles.inputWrapper}>
             <PasswordInput
               label="Confirme a senha:"
               id="confirmPassword"
               placeholder="Digite novamente sua senha"
               value={formData.confirmPassword}
               onChange={handleChange('confirmPassword')}
               required
               minLength={8}
               isInvalid={!!formErrors.confirmPassword}
               aria-describedby={formErrors.confirmPassword ? confirmPasswordErrorId : undefined}
               disabled={isLoading}
               name="confirmPassword"
               // externalError={formErrors.confirmPassword}
               // attemptedSubmit={attemptedSubmit}
             />
             <div className={styles.errorSlot} aria-live="polite">
               {formErrors.confirmPassword && (
                 <span id={confirmPasswordErrorId} className={styles.errorText}>
                   {formErrors.confirmPassword}
                 </span>
               )}
             </div>
          </div>

          {/* --- Botão Submit (ATUALIZADO) --- */}
          <button
            type="submit"
            className={`${styles.submitButton} mt-1`}
            disabled={isSubmitDisabled} // Usa a variável calculada
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className={styles.loginLink}>
          Já possui uma conta?{' '}
          <Link href="/login">Entrar</Link>
        </p>
      </div> {/* Fim leftPanel */}

      {/* Painel Direito (mantido) */}
      <div className={styles.rightPanel}>
         <div className={styles.NexusLogoContainer}>
          <Image src="/logo-Nexus.svg" alt="Nexus Logo" width={200} height={40} />
        </div>
        <Carousel autoSlide={true} autoSlideInterval={5000}>
          {registerSlides}
        </Carousel>
      </div> {/* Fim rightPanel */}
    </div> // Fim pageContainer
  );
}