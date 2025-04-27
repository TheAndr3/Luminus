'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Link do Next.js
import styles from './cadastro.module.css';
import { InputForm } from '@/components/InputForm'; // Importando o componente de Input

// Tipo para o estado de erros do formulário
type FormErrors = {
  username?: string | null;
  email?: string | null;
  contactNumber?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
};

export default function CadastroPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    contactNumber: '', // Armazena o valor formatado
    password: '',
    confirmPassword: ''
  });

  // Estado unificado para erros de validação
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Função para validar email (exemplo simples)
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handler para mudanças nos inputs
  const handleChange = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
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

  // Handler para submissão do formulário
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({}); // Limpa erros anteriores antes de validar novamente
    setIsLoading(true);

    const errors: FormErrors = {};

    // --- Validações ---

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

    // Número de Contato (Validação dos 11 dígitos)
    const phoneDigits = formData.contactNumber.replace(/\D/g, '');
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


    // Verifica se há algum erro
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors); // Atualiza o estado com todos os erros encontrados
      setIsLoading(false);
      return; // Interrompe o envio
    }

    // Se passou em todas as validações:
    console.log('Dados do Cadastro Validados:', {
        ...formData,
        contactNumberDigits: phoneDigits // Pode ser útil enviar só os dígitos
    });

    // Simulação de envio (substitua pela sua lógica de API)
    try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula chamada de API
        alert('Cadastro (simulado) enviado com sucesso!');
        // Opcional: Limpar formulário ou redirecionar
        // setFormData({ username: '', email: '', contactNumber: '', password: '', confirmPassword: ''});
    } catch (error) {
        console.error("Erro na simulação de cadastro:", error);
        // Aqui você poderia definir um erro geral para o formulário
        // setFormErrors({ ...formErrors, general: 'Ocorreu um erro ao cadastrar. Tente novamente.' });
    } finally {
        setIsLoading(false);
    }
  };

  // Renderização do componente
  return (
    <div className={`${styles.pageContainer} overflow-hidden`}>
      {/* Painel Esquerdo */}
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

        <h1 className={styles.title}>CADASTRO</h1>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <InputForm
            type="text"
            label="Usuário:"
            placeholder="Nome"
            value={formData.username}
            onChange={handleChange('username')}
            required
            error={formErrors.username}
            disabled={isLoading}
            className="mb-2" // Espaçamento entre campos
          />

          <InputForm
            type="email"
            label="Email:"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange('email')}
            required
            error={formErrors.email}
            disabled={isLoading}
            className="mb-2" // Espaçamento entre campos
          />

          <InputForm
            type="tel"
            label="Número de contato:"
            placeholder="(XX) XXXXX-XXXX"
            value={formData.contactNumber}
            onChange={handleChange('contactNumber')}
            required
            error={formErrors.contactNumber}
            disabled={isLoading}
            className="mb-2" // Espaçamento entre campos
          />

          <InputForm
            type="password"
            label="Senha:"
            placeholder="Mínimo 8 caracteres"
            value={formData.password}
            onChange={handleChange('password')}
            required
            minLength={8}
            error={formErrors.password}
            disabled={isLoading}
            className="mb-2" // Espaçamento entre campos
          />

          <InputForm
            type="password"
            label="Confirme a senha:"
            placeholder="Digite novamente sua senha"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            required
            minLength={8}
            error={formErrors.confirmPassword}
            disabled={isLoading}
            className="mb-2" // Espaçamento entre campos
          />

          {/* Botão de Submissão */}
          <button
            type="submit"
            className={`${styles.submitButton} mt-3`} // Margem acima do botão
            disabled={isLoading}
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        {/* Link para Login */}
        <p className={styles.loginLink}>
          Já possui uma conta?{' '}
          {/* CORREÇÃO APLICADA: Link sem legacyBehavior e sem <a> interno */}
          <Link href="/login">
            Entrar
          </Link>
        </p>
      </div>

      {/* Painel Direito */}
       <div className={styles.rightPanel}>
         <div className={styles.NexusLogoContainer}>
           <Image
             src="/logo-Nexus.svg"
             alt="Nexus Logo"
             width={150}
             height={40}
           />
         </div>
         <div className={styles.carouselPlaceholder}>
           <h2>Crie, gerencie e obtenha dados de suas turmas.</h2>
           <p>(Aqui entrará o carrossel de imagens)</p>
         </div>
       </div>
    </div>
  );
}