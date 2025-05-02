/**
 * @file RegisterPage.tsx
 * @description Página de cadastro que navega para confirmação de email após sucesso.
 */
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // <<<--- 1. Importar useRouter
import styles from './register.module.css';
import Carousel from '@/components/carousel/Carousel';

// --- Importações de Componentes ---
import { TextInput } from '@/components/inputs/TextInput';
import { EmailInput } from '@/components/inputs/EmailInput';
import { PhoneInput, unformatPhoneNumber } from '@/components/inputs/PhoneInput';
import { PasswordInput } from '@/components/inputs/PasswordInput';

// --- Tipos ---
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
 * @description Componente funcional que renderiza a página de cadastro e navega para /confirm-email.
 */
export default function RegisterPage() {
  const router = useRouter(); // <<<--- 2. Inicializar o router
  // --- Estados do Componente ---
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

  // --- Funções Auxiliares ---
  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // --- Slides ---
  const registerSlides = [
    <Image key="reg-slide-1" src="/carroselAlunos.png" alt="Alunos" layout="fill" objectFit="cover" priority />,
    <Image key="reg-slide-2" src="/carroselGerencie.png" alt="Gerenciamento" layout="fill" objectFit="cover" />,
    <Image key="reg-slide-3" src="/carroselAvaliação.png" alt="Avaliação" layout="fill" objectFit="cover" />,
  ];

  // --- Manipuladores de Eventos ---
  const handleChange = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFormData(prevData => ({ ...prevData, [field]: value }));
      if (formErrors[field]) setFormErrors(prevErrors => ({ ...prevErrors, [field]: null }));
      if ((field === 'password' || field === 'confirmPassword') && formErrors.confirmPassword) {
        setFormErrors(prevErrors => ({ ...prevErrors, confirmPassword: null }));
      }
    };

  const handleInternalError = (field: keyof InternalErrors, errorMessage: string | null) => {
      setInternalErrors(prev => ({ ...prev, [field]: errorMessage }));
  };

  // --- Submissão do Formulário ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttemptedSubmit(true);
    setFormErrors({});
    setInternalErrors({}); // Limpa erros internos também
    const errors: FormErrors = {};

    // --- Validações ---
    if (!formData.username.trim()) errors.username = 'Nome de usuário é obrigatório.';
    if (!formData.email.trim()) errors.email = 'Email é obrigatório.';
    else if (!validateEmail(formData.email)) errors.email = 'Formato de email inválido.';

    const phoneDigits = unformatPhoneNumber(formData.contactNumber);
    if (!formData.contactNumber.trim()) errors.contactNumber = 'Número de contato é obrigatório.';
    else if (phoneDigits.length < 10 || phoneDigits.length > 11) errors.contactNumber = 'Telefone inválido (10 ou 11 dígitos).';

    if (!formData.password) errors.password = 'Senha é obrigatória.';
    // A validação interna de senha (força, etc.) será tratada pelo PasswordInput via onErrorChange
    if (!formData.confirmPassword) errors.confirmPassword = 'Confirmação de senha é obrigatória.';
    else if (formData.password && formData.password !== formData.confirmPassword) errors.confirmPassword = 'As senhas não coincidem.';
    // --- Fim Validações ---

    // Verifica também erros internos que podem ter sido setados pelos inputs
    if (internalErrors.password) errors.password = internalErrors.password;
    // if (internalErrors.contactNumber) errors.contactNumber = internalErrors.contactNumber; // Se PhoneInput tiver validação interna

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false); // Garante que loading pare se houver erro
      return;
    }

    // Se passou em todas validações...
    setIsLoading(true);
    console.log('Dados do Registro Validados:', { ...formData, contactNumberDigits: phoneDigits });

    try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula API call
        console.log('Registro simulado com sucesso!');

        // --- 3. Navegar para confirm-email passando o email ---
        const confirmUrl = `/confirm-email?email=${encodeURIComponent(formData.email)}`;
        router.push(confirmUrl);

        // Opcional: resetar form aqui ou deixar para quando voltar da confirmação?
        // setFormData({ username: '', email: '', contactNumber: '', password: '', confirmPassword: '' });
        // setAttemptedSubmit(false);

    } catch (error) {
        console.error("Erro na simulação de registro:", error);
        // Aqui poderia setar um erro geral no formulário, se aplicável
        setFormErrors({ email: 'Ocorreu um erro ao tentar registrar. Tente novamente.' }); // Exemplo de erro genérico
    } finally {
        // Loading deve parar aqui apenas se a navegação não ocorrer (erro)
        // Se a navegação ocorrer, a página mudará de qualquer forma.
        // No entanto, parar o loading é seguro.
        setIsLoading(false);
    }
  };

  // --- IDs para acessibilidade (sem alterações) ---
  const usernameErrorId = 'username-error';
  const emailErrorId = 'email-error';
  const contactNumberErrorId = 'contactNumber-error';
  const passwordErrorId = 'password-error';
  const confirmPasswordErrorId = 'confirmPassword-error';
  const displayPasswordError = formErrors.password || internalErrors.password;
  const isPasswordInvalid = !!displayPasswordError;

  // --- Lógica para desabilitar botão (sem alterações) ---
  const isAnyFieldEmpty = !formData.username.trim() || !formData.email.trim() || !formData.contactNumber.trim() || !formData.password.trim() || !formData.confirmPassword.trim();
  const isSubmitDisabled = isLoading || isAnyFieldEmpty || !!internalErrors.password || !!formErrors.password || !!formErrors.confirmPassword || !!formErrors.email || !!formErrors.username || !!formErrors.contactNumber; // Inclui erros para desabilitar


  // --- Renderização ---
  return (
    <div className={styles.pageContainer}>
      {/* Painel Esquerdo */}
      <div className={styles.leftPanel}>
        <div className={styles.logoContainer}>
          <Image src="/logo-Luminus.svg" alt="Luminus Nexus Logo" width={200} height={50} priority />
        </div>
        <h1 className={styles.title}>CADASTRO</h1>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Usuário */}
          <div className={styles.inputWrapper}>
            <TextInput
              label="Usuário:" id="username" placeholder="Nome" value={formData.username} onChange={handleChange('username')}
              required isInvalid={!!formErrors.username} aria-describedby={formErrors.username ? usernameErrorId : undefined} disabled={isLoading} name="username"
            />
            <div className={styles.errorSlot} aria-live="polite">{formErrors.username && (<span id={usernameErrorId} className={styles.errorText}>{formErrors.username}</span>)}</div>
          </div>
          {/* Email */}
          <div className={styles.inputWrapper}>
             <EmailInput
               label="Email:" id="email" placeholder="Email" value={formData.email} onChange={handleChange('email')}
               required isInvalid={!!formErrors.email} aria-describedby={formErrors.email ? emailErrorId : undefined} disabled={isLoading} name="email"
             />
             <div className={styles.errorSlot} aria-live="polite">{formErrors.email && (<span id={emailErrorId} className={styles.errorText}>{formErrors.email}</span>)}</div>
          </div>
          {/* Telefone */}
          <div className={styles.inputWrapper}>
             <PhoneInput
               label="Número de contato:" id="contactNumber" value={formData.contactNumber} onChange={handleChange('contactNumber')}
               required isInvalid={!!formErrors.contactNumber} aria-describedby={formErrors.contactNumber ? contactNumberErrorId : undefined} disabled={isLoading} name="contactNumber"
             />
              <div className={styles.errorSlot} aria-live="polite">{ formErrors.contactNumber && (<span id={contactNumberErrorId} className={styles.errorText}>{formErrors.contactNumber}</span>)}</div>
          </div>
          {/* Senha */}
          <div className={styles.inputWrapper}>
             <PasswordInput
               label="Senha:" id="password" placeholder="Mínimo 8 caracteres" value={formData.password} onChange={handleChange('password')}
               required minLength={8} disabled={isLoading} name="password"
               onErrorChange={(err) => handleInternalError('password', err)} // Captura erro interno
               externalError={formErrors.password} // Passa erro externo se houver
               attemptedSubmit={attemptedSubmit}
               isInvalid={isPasswordInvalid}
               aria-describedby={isPasswordInvalid ? passwordErrorId : undefined}
             />
             <div className={styles.errorSlot} aria-live="polite">{displayPasswordError && (<span id={passwordErrorId} className={styles.errorText}>{displayPasswordError}</span>)}</div>
          </div>
          {/* Confirmar Senha */}
          <div className={styles.inputWrapper}>
             <PasswordInput
               label="Confirme a senha:" id="confirmPassword" placeholder="Digite novamente sua senha" value={formData.confirmPassword} onChange={handleChange('confirmPassword')}
               required minLength={8} isInvalid={!!formErrors.confirmPassword} aria-describedby={formErrors.confirmPassword ? confirmPasswordErrorId : undefined} disabled={isLoading} name="confirmPassword"
             />
             <div className={styles.errorSlot} aria-live="polite">{formErrors.confirmPassword && (<span id={confirmPasswordErrorId} className={styles.errorText}>{formErrors.confirmPassword}</span>)}</div>
          </div>

          {/* Botão Submit */}
          <button type="submit" className={`${styles.submitButton} mt-1`} disabled={isSubmitDisabled}>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className={styles.loginLink}>
          Já possui uma conta?{' '}
          <Link href="/login">Entrar</Link>
        </p>
      </div> {/* Fim leftPanel */}

      {/* Painel Direito */}
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