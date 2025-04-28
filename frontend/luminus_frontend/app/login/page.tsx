<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> c5bed95 (CSS e Logica de componentes de Login provavelmente Finalizados)
/**
 * @file LoginPage.tsx (ou page.tsx dentro de /login)
 * @description Página de Login de usuário.
 * Contém um formulário com campos para email e senha, opção de manter conectado
 * e link para esquecer senha.
 */
<<<<<<< HEAD
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './login.module.css';

// --- Importações de Componentes ---

import { EmailInput } from '@/components/inputs/EmailInput';
import { PasswordInput } from '@/components/inputs/PasswordInput';

// --- Tipos ---
/**
 * @type FormErrors
 * @description Define a estrutura para armazenar mensagens de erro de validação do formulário de Login.
 */
type FormErrors = {
  email?: string | null;
  password?: string | null;
};

/**
 * @component LoginPage
 * @description Componente funcional que renderiza a página de login.
 */
export default function LoginPage() {
  // --- Estados do Componente ---
  /** Estado para armazenar os dados do formulário (email, senha, lembrar). */
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false, // Estado para o checkbox "Manter conectado"
  });

  /** Estado para armazenar as mensagens de erro de validação. */
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  /** Estado para controlar o feedback de carregamento. */
  const [isLoading, setIsLoading] = useState(false);

  // --- Funções Auxiliares ---
  /** Valida formato de email (pode ser movida para um utilitário). */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // --- Manipuladores de Eventos ---

  /**
   * @function handleChange
   * @description Manipulador para atualizações nos campos de email e senha.
   * @param {'email' | 'password'} field - O nome do campo sendo atualizado.
   */
  const handleChange = (field: 'email' | 'password') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFormData(prevData => ({ ...prevData, [field]: value }));
      // Limpa o erro do campo específico ao digitar
      if (formErrors[field]) {
        setFormErrors(prevErrors => ({ ...prevErrors, [field]: null }));
      }
    };

  /**
   * @function handleCheckboxChange
   * @description Manipulador específico para o checkbox "Manter conectado".
   */
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData(prevData => ({ ...prevData, rememberMe: checked }));
  };

  /**
   * @function handleSubmit
   * @description Manipulador para a submissão do formulário de login.
   * Realiza validações para email e senha e simula um envio.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({}); // Limpa erros anteriores
    setIsLoading(true);

    const errors: FormErrors = {};

    // --- Validações de Login ---
    // Email
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório.';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Formato de email inválido.';
    }

    // Senha
    if (!formData.password) {
      errors.password = 'Senha é obrigatória.';
    }
		//Não precisamos validar se a senha tem pelo menos 8 digitos acredito eu

    // --- Fim Validações ---

    // Verifica se há erros
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return; // Impede o envio
    }

    // Se não houver erros, loga os dados e simula o envio
    console.log('Dados do Login:', formData);

    // Simulação de envio para API (substituir pela chamada real)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay
      alert('Login (simulado) realizado com sucesso!');
      // Opcional: Redirecionar após sucesso
      // router.push('/dashboard');
    } catch (error) {
      console.error("Erro na simulação de login:", error);
      // Exemplo de erro de login
      setFormErrors({ email: 'Usuário ou senha inválidos.' }); // Mostra erro genérico
    } finally {
      setIsLoading(false); // Finaliza o carregamento
    }
  };

  // --- Renderização do Componente ---
  return (
    // Container principal
    <div className={`${styles.pageContainer} overflow-hidden`}>

      {/* Painel Esquerdo (Azul/Placeholder - SEM ALTERAÇÕES) */}
      <div className={styles.leftPanel}>
        <div className={styles.NexusLogoContainer}>
          <Image src="/logo-Nexus.svg" alt="Nexus Logo" width={150} height={40} />
        </div>
        <div className={styles.contentPlaceholder}>
          <h2>Crie, gerencie e obtenha dados de suas turmas.</h2>
          <div className={styles.carouselIndicators}>
            <span className={styles.active}></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      {/* Painel Direito (Branco/Formulário de LOGIN) */}
      <div className={styles.rightPanel}>
        <div className={styles.logoContainer}>
          {/* Logo principal */}
          <Image
            src="/logo-Luminus.svg" // Logo correto para este painel
            alt="Luminus Nexus Logo"
            width={200}
            height={50}
            priority
          />
        </div>

        {/* Título LOGIN */}
        <h1 className={styles.title}>LOGIN</h1>

        {/* Exibe erro geral de login (ex: credenciais inválidas) */}
        {formErrors.email && !formErrors.password && (
            <div className={styles.errorMessage}>{formErrors.email}</div>
        )}
        {/* Adicione aqui outras mensagens de erro gerais se necessário */}


        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Campo Email (rotulado como Usuário) */}
          <EmailInput
            label="Usuário:" // Rótulo como na imagem
            placeholder="Email" // Placeholder indicando que é o email
            value={formData.email}
            onChange={handleChange('email')}
            required
            error={formErrors.email && formErrors.password ? formErrors.email : null}
						// Mostra erro de email apenas se não for erro genérico
            disabled={isLoading}
            containerClassName="mb-2" // Ajuste margens se necessário
            name="email"
          />

          {/* Campo Senha */}
          <PasswordInput
            label="Senha:"
            placeholder="Senha" // Placeholder simples
            value={formData.password}
            onChange={handleChange('password')}
            required
            // minLength={8} // Removido minLength se não aplicável ao login
            error={formErrors.password}
            disabled={isLoading}
            containerClassName="mb-2" // Ajuste margens se necessário
            name="password"
          />

          {/* Linha com Checkbox e Link "Esqueci minha senha" */}
          {/* Use as classes do CSS fornecido na primeira resposta ou crie novas */}
          <div className={styles.checkboxGroup}> {/* Container para alinhar */}
            <label className={styles.rememberLabel}> {/* Estilo para o label do checkbox */}
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleCheckboxChange}
                disabled={isLoading}
              />
              Manter conectado
            </label>
            <Link href="/esqueceu-senha" className={styles.forgotPasswordLink}>
              Esqueci minha senha
            </Link>
          </div>

          {/* Botão de Submissão */}
          <button
            type="submit"
            className={`${styles.submitButton} mt-4`} // Use a classe correta e ajuste margem superior
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'} {/* Texto do botão */}
          </button>
        </form>

        {/* Link para a página de Cadastro */}
        {/* Use a classe do CSS fornecido na primeira resposta ou crie nova */}
        <p className={styles.switchLink}>
          Não tem uma conta?{' '}
          <Link href="/cadastro"> {/* Link para a página de cadastro */}
            Cadastre-se
          </Link>
        </p>
      </div>

    </div>
  );
=======
=======
>>>>>>> c5bed95 (CSS e Logica de componentes de Login provavelmente Finalizados)
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './login.module.css';

// --- Importações de Componentes ---

import { EmailInput } from '@/components/inputs/EmailInput';
import { PasswordInput } from '@/components/inputs/PasswordInput';

// --- Tipos ---
/**
 * @type FormErrors
 * @description Define a estrutura para armazenar mensagens de erro de validação do formulário de Login.
 */
type FormErrors = {
  email?: string | null;
  password?: string | null;
};

/**
 * @component LoginPage
 * @description Componente funcional que renderiza a página de login.
 */
export default function LoginPage() {
<<<<<<< HEAD
	
>>>>>>> 5892938 (InputForm.tsx criado e documentado)
=======
  // --- Estados do Componente ---
  /** Estado para armazenar os dados do formulário (email, senha, lembrar). */
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false, // Estado para o checkbox "Manter conectado"
  });

  /** Estado para armazenar as mensagens de erro de validação. */
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  /** Estado para controlar o feedback de carregamento. */
  const [isLoading, setIsLoading] = useState(false);

  // --- Funções Auxiliares ---
  /** Valida formato de email (pode ser movida para um utilitário). */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // --- Manipuladores de Eventos ---

  /**
   * @function handleChange
   * @description Manipulador para atualizações nos campos de email e senha.
   * @param {'email' | 'password'} field - O nome do campo sendo atualizado.
   */
  const handleChange = (field: 'email' | 'password') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFormData(prevData => ({ ...prevData, [field]: value }));
      // Limpa o erro do campo específico ao digitar
      if (formErrors[field]) {
        setFormErrors(prevErrors => ({ ...prevErrors, [field]: null }));
      }
    };

  /**
   * @function handleCheckboxChange
   * @description Manipulador específico para o checkbox "Manter conectado".
   */
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData(prevData => ({ ...prevData, rememberMe: checked }));
  };

  /**
   * @function handleSubmit
   * @description Manipulador para a submissão do formulário de login.
   * Realiza validações para email e senha e simula um envio.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({}); // Limpa erros anteriores
    setIsLoading(true);

    const errors: FormErrors = {};

    // --- Validações de Login ---
    // Email
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório.';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Formato de email inválido.';
    }

    // Senha
    if (!formData.password) {
      errors.password = 'Senha é obrigatória.';
    }
		//Não precisamos validar se a senha tem pelo menos 8 digitos acredito eu

    // --- Fim Validações ---

    // Verifica se há erros
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return; // Impede o envio
    }

    // Se não houver erros, loga os dados e simula o envio
    console.log('Dados do Login:', formData);

    // Simulação de envio para API (substituir pela chamada real)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simula delay
      alert('Login (simulado) realizado com sucesso!');
      // Opcional: Redirecionar após sucesso
      // router.push('/dashboard');
    } catch (error) {
      console.error("Erro na simulação de login:", error);
      // Exemplo de erro de login
      setFormErrors({ email: 'Usuário ou senha inválidos.' }); // Mostra erro genérico
    } finally {
      setIsLoading(false); // Finaliza o carregamento
    }
  };

  // --- Renderização do Componente ---
  return (
    // Container principal
    <div className={`${styles.pageContainer} overflow-hidden`}>

      {/* Painel Esquerdo (Azul/Placeholder - SEM ALTERAÇÕES) */}
      <div className={styles.leftPanel}>
        <div className={styles.NexusLogoContainer}>
          <Image src="/logo-Nexus.svg" alt="Nexus Logo" width={150} height={40} />
        </div>
        <div className={styles.contentPlaceholder}>
          <h2>Crie, gerencie e obtenha dados de suas turmas.</h2>
          <div className={styles.carouselIndicators}>
            <span className={styles.active}></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      {/* Painel Direito (Branco/Formulário de LOGIN) */}
      <div className={styles.rightPanel}>
        <div className={styles.logoContainer}>
          {/* Logo principal */}
          <Image
            src="/logo-Luminus.svg" // Logo correto para este painel
            alt="Luminus Nexus Logo"
            width={200}
            height={50}
            priority
          />
        </div>

        {/* Título LOGIN */}
        <h1 className={styles.title}>LOGIN</h1>

        {/* Exibe erro geral de login (ex: credenciais inválidas) */}
        {formErrors.email && !formErrors.password && (
            <div className={styles.errorMessage}>{formErrors.email}</div>
        )}
        {/* Adicione aqui outras mensagens de erro gerais se necessário */}


        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Campo Email (rotulado como Usuário) */}
          <EmailInput
            label="Usuário:" // Rótulo como na imagem
            placeholder="Email" // Placeholder indicando que é o email
            value={formData.email}
            onChange={handleChange('email')}
            required
            error={formErrors.email && formErrors.password ? formErrors.email : null}
						// Mostra erro de email apenas se não for erro genérico
            disabled={isLoading}
            containerClassName="mb-2" // Ajuste margens se necessário
            name="email"
          />

          {/* Campo Senha */}
          <PasswordInput
            label="Senha:"
            placeholder="Senha" // Placeholder simples
            value={formData.password}
            onChange={handleChange('password')}
            required
            // minLength={8} // Removido minLength se não aplicável ao login
            error={formErrors.password}
            disabled={isLoading}
            containerClassName="mb-2" // Ajuste margens se necessário
            name="password"
          />

          {/* Linha com Checkbox e Link "Esqueci minha senha" */}
          {/* Use as classes do CSS fornecido na primeira resposta ou crie novas */}
          <div className={styles.checkboxGroup}> {/* Container para alinhar */}
            <label className={styles.rememberLabel}> {/* Estilo para o label do checkbox */}
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleCheckboxChange}
                disabled={isLoading}
              />
              Manter conectado
            </label>
            <Link href="/esqueceu-senha" className={styles.forgotPasswordLink}>
              Esqueci minha senha
            </Link>
          </div>

          {/* Botão de Submissão */}
          <button
            type="submit"
            className={`${styles.submitButton} mt-4`} // Use a classe correta e ajuste margem superior
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'} {/* Texto do botão */}
          </button>
        </form>

        {/* Link para a página de Cadastro */}
        {/* Use a classe do CSS fornecido na primeira resposta ou crie nova */}
        <p className={styles.switchLink}>
          Não tem uma conta?{' '}
          <Link href="/cadastro"> {/* Link para a página de cadastro */}
            Cadastre-se
          </Link>
        </p>
      </div>

    </div>
  );
>>>>>>> c5bed95 (CSS e Logica de componentes de Login provavelmente Finalizados)
}