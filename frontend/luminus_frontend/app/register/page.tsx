/**
 * @file RegisterPage.tsx
 * @description Página de cadastro de novo usuário (modificada com scrollbar e carousel).
 * Contém um formulário com campos para usuário, email, telefone e senha,
 * incluindo validações básicas e uma simulação de envio.
 */
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// Certifique-se que este import aponta para o arquivo CSS modificado abaixo
import styles from './register.module.css';
// --- Adicionado: Importar o Carousel ---
import Carousel from '@/components/carousel/Carousel';

// --- Importações de Componentes ---
import { TextInput } from '@/components/inputs/TextInput';
import { EmailInput } from '@/components/inputs/EmailInput';
import { PhoneInput, unformatPhoneNumber } from '@/components/inputs/PhoneInput';
import { PasswordInput } from '@/components/inputs/PasswordInput';

/**
 * @type FormErrors
 * @description Define a estrutura para armazenar mensagens de erro de validação do formulário.
 */
type FormErrors = {
  username?: string | null;
  email?: string | null;
  contactNumber?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
};

/**
 * @component RegisterPage
 * @description Componente funcional que renderiza a página de cadastro (modificada).
 */
export default function RegisterPage() { // <- Nome do componente atualizado para RegisterPage
  // --- Estados do Componente ---
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // --- Funções Auxiliares ---
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // --- Adicionado: Definição dos Slides para o Carousel ---
  // Ajuste os `src` das imagens conforme necessário para sua estrutura de pastas
  const registerSlides = [
    <Image
      key="reg-slide-1"
      src="/carroselAlunos.png" // Exemplo: Mesmo slide de CadastroPage
      alt="Funcionalidade 1 do Registro"
      layout="fill"
      objectFit="cover"
      priority // Mantenha priority na primeira imagem
    />,
    <Image
      key="reg-slide-2"
      src="/carroselGerencie.png" // Exemplo: Mesmo slide de CadastroPage
      alt="Funcionalidade 2 do Registro"
      layout="fill"
      objectFit="cover"
    />,
    <Image
      key="reg-slide-3"
      src="/carroselAvaliação.png" // Exemplo: Mesmo slide de CadastroPage
      alt="Funcionalidade 3 do Registro"
      layout="fill"
      objectFit="cover"
    />,
  ];

  // --- Manipuladores de Eventos ---
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({});
    setIsLoading(true);

    const errors: FormErrors = {};
    // --- Validações (mantidas como estavam) ---
    if (!formData.username.trim()) errors.username = 'Nome de usuário é obrigatório.';
    if (!formData.email.trim()) errors.email = 'Email é obrigatório.';
    else if (!validateEmail(formData.email)) errors.email = 'Formato de email inválido.';
    const phoneDigits = unformatPhoneNumber(formData.contactNumber);
    if (!formData.contactNumber.trim()) errors.contactNumber = 'Número de contato é obrigatório.';
    else if (phoneDigits.length !== 11) errors.contactNumber = 'O número de contato deve ter 11 dígitos (DDD + número).';
    if (!formData.password) errors.password = 'Senha é obrigatória.';
    else if (formData.password.length < 8) errors.password = 'A senha deve ter no mínimo 8 caracteres.';
    if (!formData.confirmPassword) errors.confirmPassword = 'Confirmação de senha é obrigatória.';
    else if (formData.password && formData.password !== formData.confirmPassword) errors.confirmPassword = 'As senhas não coincidem.';
    // --- Fim Validações ---

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    console.log('Dados do Registro Validados:', {
        ...formData,
        contactNumberDigits: phoneDigits
    });

    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert('Registro (simulado) enviado com sucesso!');
    } catch (error) {
        console.error("Erro na simulação de registro:", error);
    } finally {
        setIsLoading(false);
    }
  };

  // --- Renderização do Componente ---
  return (
    // Container principal da página com layout dividido
    // Removido `overflow-hidden` daqui, pois o scroll será controlado nos painéis
    <div className={styles.pageContainer}>

      {/* Painel Esquerdo: Contém o logo, título e formulário de cadastro */}
      {/* Scrollbar será aplicado via CSS */}
      <div className={styles.leftPanel}>
        <div className={styles.logoContainer}>
          <Image
            src="/logo-Luminus.svg"
            alt="Luminus Nexus Logo"
            width={200}
            height={50}
            priority
          />
        </div>

        <h1 className={styles.title}>CADASTRO</h1> {/* Título pode ser ajustado */}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Campos do formulário (mantidos como estavam) */}
          <TextInput
            label="Usuário:"
            placeholder="Nome"
            value={formData.username}
            onChange={handleChange('username')}
            required
            error={formErrors.username}
            disabled={isLoading}
            containerClassName="mb-2"
            name="username"
          />
          <EmailInput
            label="Email:"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange('email')}
            required
            error={formErrors.email}
            disabled={isLoading}
            containerClassName="mb-2"
            name="email"
          />
          <PhoneInput
            label="Número de contato:"
            value={formData.contactNumber}
            onChange={handleChange('contactNumber')}
            required
            error={formErrors.contactNumber}
            disabled={isLoading}
            containerClassName="mb-2"
            name="contactNumber"
          />
          <PasswordInput
            label="Senha:"
            placeholder="Mínimo 8 caracteres"
            value={formData.password}
            onChange={handleChange('password')}
            required
            minLength={8}
            error={formErrors.password}
            disabled={isLoading}
            containerClassName="mb-2"
            name="password"
          />
          <PasswordInput
            label="Confirme a senha:"
            placeholder="Digite novamente sua senha"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            required
            minLength={8}
            error={formErrors.confirmPassword}
            disabled={isLoading}
            containerClassName="mb-2"
            name="confirmPassword"
          />

          <button
            type="submit"
            className={`${styles.submitButton} mt-3`}
            disabled={isLoading}
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'} {/* Texto do botão ajustado */}
          </button>
        </form>

        <p className={styles.loginLink}>
          Já possui uma conta?{' '}
          <Link href="/login">
            Entrar
          </Link>
        </p>
      </div> {/* Fim leftPanel */}

      {/* Painel Direito: Contém logo secundário e o Carousel */}
      <div className={styles.rightPanel}>
         {/* Logo Secundário posicionado sobre o carrossel via CSS */}
         <div className={styles.NexusLogoContainer}>
           <Image
             src="/logo-Nexus.svg"
             alt="Nexus Logo"
             width={200} // Usando a largura do exemplo do CadastroPage
             height={40} // Usando a altura do exemplo do CadastroPage
           />
         </div>
         {/* --- Adicionado: Carousel --- */}
         <Carousel autoSlide={true} autoSlideInterval={5000}>
           {registerSlides}
         </Carousel>
       </div> {/* Fim rightPanel */}
    </div> // Fim pageContainer
  );
}