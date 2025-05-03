// -*- coding: utf-8 -*-
/**
 * @file RegisterPage.tsx
 * @description Define o componente da página de cadastro de novos usuários.
 *              Inclui formulário com validação (usuário, email, senha), interação com
 *              componentes de input customizados, simulação de chamada de API e
 *              navegação para a página de confirmação de email após um cadastro bem-sucedido.
 * @version 1.1 (Removido campo de telefone)
 * @date 02-05-2025 (ou data atual)
 * @author Pedro e Andre
 */

/*
-------------------------- FALTA INTEGRAÇÃO COM A API --------------------------
*/
// Diretiva de Componente de Cliente.
'use client';

import React, { useState } from 'react'; // Removido useEffect se não for mais necessário
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './register.module.css';
import Carousel from '@/components/carousel/Carousel';

// --- Importações de Componentes de Input Customizados ---
import { TextInput } from '@/components/inputs/TextInput';
import { EmailInput } from '@/components/inputs/EmailInput';
import { PasswordInput } from '@/components/inputs/PasswordInput';

// --- Tipos ---

/**
 * @type FormErrors
 * @description Define a estrutura para armazenar erros de validação do formulário
 *              detectados na página (campos obrigatórios, formato email, senhas não coincidem).
 *              *Campo 'contactNumber' removido.*
 */
type FormErrors = {
  username?: string | null;
  email?: string | null;
  // contactNumber?: string | null; // <<< REMOVIDO
  password?: string | null;
  confirmPassword?: string | null;
};

/**
 * @type InternalErrors
 * @description Define a estrutura para armazenar erros comunicados pelos componentes filhos
 *              via `onErrorChange` (ex: erro de força da senha).
 *              *Campo 'contactNumber' removido.*
 */
type InternalErrors = {
    password?: string | null;
    // contactNumber?: string | null; // <<< REMOVIDO
};

/**
 * @component RegisterPage
 * @description Componente funcional que renderiza a página de cadastro completa.
 *
 * Responsabilidades:
 * - Exibir o formulário de cadastro com campos para usuário, email e senha.
 * - Gerenciar o estado dos dados do formulário (`formData`).
 * - Gerenciar o estado dos erros de validação (`formErrors`, `internalErrors`).
 * - Gerenciar o estado de carregamento (`isLoading`) durante a submissão.
 * - Controlar se uma tentativa de submissão já ocorreu (`attemptedSubmit`).
 * - Utilizar componentes de input customizados, passando props e recebendo erros.
 * - Realizar validações no lado do cliente ao submeter o formulário.
 * - Simular uma chamada de API para registrar o usuário.
 * - Em caso de sucesso, navegar programaticamente para a página `/confirm-email`.
 * - Exibir um carrossel de imagens.
 *
 * *Campo de telefone foi removido desta versão.*
 */
export default function RegisterPage() {
  const router = useRouter();

  // --- Estados do Componente ---
  // Estado para os dados do formulário. *Campo 'contactNumber' removido.*
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    // contactNumber: '', // <<< REMOVIDO
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [internalErrors, setInternalErrors] = useState<InternalErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // --- Funções Auxiliares ---
  /** Valida o formato básico de um endereço de email usando Regex. */
  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // --- Slides para o Carrossel ---
  const registerSlides = [
    <Image key="reg-slide-1" src="/carroselAlunos.png" alt="Alunos utilizando a plataforma" layout="fill" objectFit="cover" priority />,
    <Image key="reg-slide-2" src="/carroselGerencie.png" alt="Interface de gerenciamento da plataforma" layout="fill" objectFit="cover" />,
    <Image key="reg-slide-3" src="/carroselAvaliação.png" alt="Tela de avaliação de desempenho" layout="fill" objectFit="cover" />,
  ];

  // --- Manipuladores de Eventos ---

  /**
   * Handler genérico para atualizar o estado `formData`.
   * @param field A chave do campo no estado `formData` a ser atualizado.
   * @returns Uma função que recebe o evento `ChangeEvent` do input.
   */
  const handleChange = (field: keyof Omit<typeof formData, 'contactNumber'>) => // <<< Tipo Atualizado
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

  /**
   * Callback para receber erros internos (atualmente apenas de PasswordInput).
   * @param field A chave do campo no estado `internalErrors`.
   * @param errorMessage A mensagem de erro recebida do filho, ou null.
   */
  const handleInternalError = (field: keyof InternalErrors, errorMessage: string | null) => {
      setInternalErrors(prev => ({ ...prev, [field]: errorMessage }));
  };

  // --- Submissão do Formulário ---

  /**
   * Handler para o evento de submissão do formulário.
   * Realiza validações (sem telefone), simula API e navega.
   * @param event O evento de submissão do formulário.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttemptedSubmit(true);
    setFormErrors({});
    setInternalErrors({});
    const errors: FormErrors = {};

    // --- Validações Client-Side (sem telefone) ---
    if (!formData.username.trim()) errors.username = 'Nome de usuário é obrigatório.';

    if (!formData.email.trim()) errors.email = 'Email é obrigatório.';
    else if (!validateEmail(formData.email)) errors.email = 'Formato de email inválido.';

    // <<< Seção de validação de telefone REMOVIDA >>>
    // const phoneDigits = unformatPhoneNumber(formData.contactNumber);
    // if (!formData.contactNumber.trim()) errors.contactNumber = 'Número de contato é obrigatório.';
    // else if (phoneDigits.length < 10 || phoneDigits.length > 11) errors.contactNumber = 'Telefone inválido (10 ou 11 dígitos).';

    if (!formData.password) errors.password = 'Senha é obrigatória.';

    if (!formData.confirmPassword) errors.confirmPassword = 'Confirmação de senha é obrigatória.';
    else if (formData.password && formData.password !== formData.confirmPassword) errors.confirmPassword = 'As senhas não coincidem.';
    // --- Fim Validações ---

    // --- Integração com Erros Internos (apenas senha) ---
    if (internalErrors.password) errors.password = internalErrors.password;
    // <<< Verificação de internalErrors.contactNumber REMOVIDA >>>

    // --- Verificação Final e Submissão ---
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // Log dos dados validados. *'contactNumberDigits' removido.*
    console.log('Dados do Registro Validados (prontos para envio):', formData );

    try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula API call
        console.log('Registro simulado com sucesso!');

        // Navegação Pós-Sucesso (inalterada)
        const confirmUrl = `/confirm-email?email=${encodeURIComponent(formData.email)}`;
        router.push(confirmUrl);

        // Opcional: Resetar form
        // setFormData({ username: '', email: '', password: '', confirmPassword: '' }); // <<< Atualizado
        // setAttemptedSubmit(false);

    } catch (error) {
        console.error("Erro na simulação de registro:", error);
        setFormErrors({ email: 'Ocorreu um erro ao tentar registrar. Tente novamente.' });
        setIsLoading(false);
    } finally {
        // setIsLoading(false); // Pode ser redundante
    }
  };

  // --- IDs para Acessibilidade (sem telefone) ---
  const usernameErrorId = 'username-error';
  const emailErrorId = 'email-error';
  // const contactNumberErrorId = 'contactNumber-error'; // <<< REMOVIDO
  const passwordErrorId = 'password-error';
  const confirmPasswordErrorId = 'confirmPassword-error';

  const displayPasswordError = formErrors.password || internalErrors.password;
  const isPasswordInvalid = !!displayPasswordError;

  // --- Lógica para Desabilitar o Botão de Submit (sem telefone) ---
  // Verifica se algum campo essencial está vazio. *'contactNumber' removido.*
  const isAnyFieldEmpty = !formData.username.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim();
  // Botão desabilitado se carregando, algum campo vazio, ou houver erros. *Verificação de 'contactNumber' removida.*
  const isSubmitDisabled = isLoading || isAnyFieldEmpty || !!internalErrors.password || !!formErrors.password || !!formErrors.confirmPassword || !!formErrors.email || !!formErrors.username;


  // --- Renderização do Componente (sem telefone) ---
  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.logoContainer}>
          <Image src="/logo-Luminus.svg" alt="Luminus Nexus Logo" width={200} height={50} priority />
        </div>
        <h1 className={styles.title}>CADASTRO</h1>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Campo Usuário */}
          <div className={styles.inputWrapper}>
            <TextInput
              label="Usuário:" id="username" placeholder="Nome"
              value={formData.username} onChange={handleChange('username')}
              required isInvalid={!!formErrors.username}
              aria-describedby={formErrors.username ? usernameErrorId : undefined}
              disabled={isLoading} name="username"
            />
            <div className={styles.errorSlot} aria-live="polite">
                {formErrors.username && (<span id={usernameErrorId} className={styles.errorText}>{formErrors.username}</span>)}
            </div>
          </div>

          {/* Campo Email */}
          <div className={styles.inputWrapper}>
             <EmailInput
               label="Email:" id="email" placeholder="Email"
               value={formData.email} onChange={handleChange('email')}
               required isInvalid={!!formErrors.email}
               aria-describedby={formErrors.email ? emailErrorId : undefined}
               disabled={isLoading} name="email"
             />
             <div className={styles.errorSlot} aria-live="polite">
                {formErrors.email && (<span id={emailErrorId} className={styles.errorText}>{formErrors.email}</span>)}
             </div>
          </div>

          {/* Campo Senha */}
          <div className={styles.inputWrapper}>
             <PasswordInput
               label="Senha:" id="password" placeholder="Mínimo 8 caracteres"
               value={formData.password} onChange={handleChange('password')}
               required minLength={8} disabled={isLoading} name="password"
               onErrorChange={(err) => handleInternalError('password', err)}
               externalError={formErrors.password}
               attemptedSubmit={attemptedSubmit}
               isInvalid={isPasswordInvalid}
               aria-describedby={isPasswordInvalid ? passwordErrorId : undefined}
             />
             <div className={styles.errorSlot} aria-live="polite">
                {displayPasswordError && (<span id={passwordErrorId} className={styles.errorText}>{displayPasswordError}</span>)}
             </div>
          </div>

          {/* Campo Confirmar Senha */}
          <div className={styles.inputWrapper}>
             <PasswordInput
               label="Confirme a senha:" id="confirmPassword" placeholder="Digite novamente sua senha"
               value={formData.confirmPassword} onChange={handleChange('confirmPassword')}
               required minLength={8} isInvalid={!!formErrors.confirmPassword}
               aria-describedby={formErrors.confirmPassword ? confirmPasswordErrorId : undefined}
               disabled={isLoading} name="confirmPassword"
             />
             <div className={styles.errorSlot} aria-live="polite">
                {formErrors.confirmPassword && (<span id={confirmPasswordErrorId} className={styles.errorText}>{formErrors.confirmPassword}</span>)}
             </div>
          </div>

          {/* Botão de Submissão */}
          <button type="submit" className={`${styles.submitButton} mt-1`} disabled={isSubmitDisabled}>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        <p className={styles.loginLink}>
          Já possui uma conta?{' '}
          <Link href="/login">Entrar</Link>
        </p>
      </div> {/* Fim leftPanel */}
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