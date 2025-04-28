/**
 * @file CadastroPage.tsx
 * @description Página de cadastro de novo usuário.
 * Contém um formulário com campos para usuário, email, telefone e senha,
 * incluindo validações básicas e uma simulação de envio.
 */
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './cadastro.module.css';

// --- Importações de Componentes ---
// Importa os componentes de input especializados (TextInput, EmailInput, etc.).
// Estes componentes são construídos sobre um BaseInput comum.
// A função unformatPhoneNumber é usada para obter apenas os dígitos do telefone para validação.
import { TextInput } from '@/components/inputs/TextInput';
import { EmailInput } from '@/components/inputs/EmailInput';
import { PhoneInput, unformatPhoneNumber } from '@/components/inputs/PhoneInput';
import { PasswordInput } from '@/components/inputs/PasswordInput';

/**
 * @type FormErrors
 * @description Define a estrutura para armazenar mensagens de erro de validação do formulário.
 * Cada chave corresponde a um campo do formulário.
 */
type FormErrors = {
  username?: string | null;
  email?: string | null;
  contactNumber?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
};

/**
 * @component CadastroPage
 * @description Componente funcional que renderiza a página de cadastro.
 */
export default function CadastroPage() {
  // --- Estados do Componente ---

  /** Estado para armazenar os dados do formulário (controlado). */
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    contactNumber: '', // Armazena o valor formatado pelo PhoneInput
    password: '',
    confirmPassword: ''
  });

  /** Estado para armazenar as mensagens de erro de validação para cada campo. */
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  /** Estado para controlar a exibição de feedback de carregamento durante o envio. */
  const [isLoading, setIsLoading] = useState(false);

  // --- Funções Auxiliares ---

  /**
   * @function validateEmail
   * @description Valida se uma string está em um formato de email básico.
   * @param {string} email - O email a ser validado.
   * @returns {boolean} - True se o email for válido, false caso contrário.
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // --- Manipuladores de Eventos ---

  /**
   * @function handleChange
   * @description Manipulador genérico para atualizações nos campos do formulário.
   * Atualiza o estado `formData` e limpa o erro do campo específico ao ser modificado.
   * @param {keyof typeof formData} field - O nome do campo sendo atualizado.
   * @returns {(e: React.ChangeEvent<HTMLInputElement>) => void} - Função que recebe o evento do input.
   */
  const handleChange = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target; // O valor já vem formatado do PhoneInput
      setFormData(prevData => ({ ...prevData, [field]: value }));

      // Limpa o erro específico do campo ao digitar
      if (formErrors[field]) {
        setFormErrors(prevErrors => ({ ...prevErrors, [field]: null }));
      }
      // Limpa erro de confirmação se senha ou confirmação mudar
      if ((field === 'password' || field === 'confirmPassword') && formErrors.confirmPassword) {
        setFormErrors(prevErrors => ({ ...prevErrors, confirmPassword: null }));
      }
    };

  /**
   * @function handleSubmit
   * @description Manipulador para o evento de submissão do formulário.
   * Previne o comportamento padrão, realiza validações nos campos,
   * atualiza o estado `formErrors` se houver erros, e simula um envio de API.
   * @param {React.FormEvent<HTMLFormElement>} event - O evento de submissão do formulário.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({}); // Limpa erros anteriores
    setIsLoading(true);

    const errors: FormErrors = {};

    // --- Validações ---
    // Realiza validações para cada campo obrigatório e verifica formatos/regras específicas.

    // Usuário
    if (!formData.username.trim()) {
      errors.username = 'Nome de usuário é obrigatório.';
    }

    // Email
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório.';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Formato de email inválido.';
    }

    // Número de Contato
    const phoneDigits = unformatPhoneNumber(formData.contactNumber); // Obtém apenas dígitos para validar
    if (!formData.contactNumber.trim()) {
        errors.contactNumber = 'Número de contato é obrigatório.';
    } else if (phoneDigits.length !== 11) {
        errors.contactNumber = 'O número de contato deve ter 11 dígitos (DDD + número).';
    }

    // Senha
    if (!formData.password) {
      errors.password = 'Senha é obrigatória.';
    } else if (formData.password.length < 8) {
      errors.password = 'A senha deve ter no mínimo 8 caracteres.';
    }

    // Confirmar Senha
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória.';
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem.';
    }
    // --- Fim Validações ---

    // Verifica se há erros de validação
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors); // Atualiza o estado de erros
      setIsLoading(false);
      return; // Impede o envio
    }

    // Se não houver erros, loga os dados e simula o envio
    console.log('Dados do Cadastro Validados:', {
        ...formData,
        contactNumberDigits: phoneDigits // Loga/envia apenas os dígitos do telefone, se necessário
    });

    // Simulação de envio para API (substituir pela chamada real)
    try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay da rede
        alert('Cadastro (simulado) enviado com sucesso!');
        // Opcional: Resetar o formulário ou redirecionar após sucesso
        // setFormData({ username: '', email: '', contactNumber: '', password: '', confirmPassword: ''});
    } catch (error) {
        console.error("Erro na simulação de cadastro:", error);
        // Tratar erros de API aqui, talvez definindo um erro geral no formulário
    } finally {
        setIsLoading(false); // Finaliza o estado de carregamento
    }
  };

  // --- Renderização do Componente ---
  return (
    // Container principal da página com layout dividido
    <div className={`${styles.pageContainer} overflow-hidden`}>

      {/* Painel Esquerdo: Contém o logo, título e formulário de cadastro */}
      <div className={styles.leftPanel}>
        <div className={styles.logoContainer}>
          {/* Logo principal */}
          <Image
            src="/logo-Luminus.svg"
            alt="Luminus Nexus Logo"
            width={200}
            height={50}
            priority // Otimiza carregamento da imagem principal
          />
        </div>

        <h1 className={styles.title}>CADASTRO</h1>

        {/* Formulário de Cadastro */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Campos do formulário utilizando os componentes de input especializados */}

          <TextInput
            label="Usuário:"
            placeholder="Nome"
            value={formData.username}
            onChange={handleChange('username')}
            required
            error={formErrors.username}
            disabled={isLoading}
            containerClassName="mb-2" // Adiciona margem inferior ao container do input
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
            // Placeholder padrão do PhoneInput é usado, mas pode ser sobrescrito
            value={formData.contactNumber} // Passa o valor formatado
            onChange={handleChange('contactNumber')} // Recebe o valor formatado
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
            minLength={8} // Validação HTML básica (complementa a do JS)
            error={formErrors.password}
            disabled={isLoading}
            containerClassName="mb-2"
            name="password"
            // Props opcionais para customizar o PasswordInput podem ser adicionadas aqui
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

          {/* Botão de Submissão do Formulário */}
          <button
            type="submit"
            className={`${styles.submitButton} mt-3`} // Estilos do botão e margem superior
            disabled={isLoading} // Desabilita durante o envio
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'} {/* Texto dinâmico */}
          </button>
        </form>

        {/* Link para a página de Login */}
        <p className={styles.loginLink}>
          Já possui uma conta?{' '}
          <Link href="/login">
            Entrar
          </Link>
        </p>
      </div>

      {/* Painel Direito: Contém logo secundário e espaço para conteúdo visual (ex: carrossel) */}
       <div className={styles.rightPanel}>
         <div className={styles.NexusLogoContainer}>
            {/* Logo secundário */}
           <Image
             src="/logo-Nexus.svg"
             alt="Nexus Logo"
             width={150}
             height={40}
           />
         </div>
         {/* Placeholder para um futuro carrossel ou imagem */}
         <div className={styles.carouselPlaceholder}>
           <h2>Crie, gerencie e obtenha dados de suas turmas.</h2>
           <p>(Aqui entrará o carrossel de imagens)</p>
         </div>
       </div>
    </div>
  );
}