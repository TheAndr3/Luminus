// -*- coding: utf-8 -*-
/**
 * @file LoginPage.tsx
 * @description Define o componente da página de login de usuários existentes.
 *              Apresenta um layout de dois painéis, com um carrossel à esquerda e
 *              o formulário de login centralizado à direita, abaixo de um logo fixo.
 * @version 1.0
 * @date 02-05-2025
 * @author Pedro e Andre
 */


/*
-------------------------- FALTA INTEGRAÇÃO COM A API --------------------------
*/

// Diretiva de Componente de Cliente, necessária para hooks (useState), manipulação de eventos,
// e interatividade do formulário.
"use client";

import React, { useState } from 'react';
import Image from 'next/image'; // Componente otimizado para imagens do Next.js
import Link from 'next/link'; // Componente para navegação client-side
import styles from './login.module.css'; // Importa estilos CSS Modules específicos para esta página
import { useRouter } from 'next/navigation';
import { LoginProfessor } from '@/services/professorService';

// --- Importações de Componentes de Input Customizados ---
import { EmailInput } from '@/components/inputs/EmailInput';
import { PasswordInput } from '@/components/inputs/PasswordInput';
// --- Importação do Componente Carrossel ---
import Carousel from '@/components/carousel/Carousel'; // Reutiliza o componente de carrossel

// --- Tipos ---

/**
 * @type FormErrors
 * @description Define a estrutura para armazenar erros de validação do formulário de login.
 *              Inclui erros específicos para email/senha e um erro geral (ex: falha na API).
 */
type FormErrors = {
  email?: string | null;
  password?: string | null;
  general?: string | null; // Para erros não específicos de um campo (ex: falha de autenticação)
};

/**
 * @component LoginPage
 * @description Componente funcional que renderiza a página de login completa.
 *
 * Responsabilidades:
 * - Exibir o formulário de login com campos para email e senha.
 * - Incluir opções como "Manter conectado" (checkbox) e link para "Esqueci minha senha".
 * - Gerenciar o estado dos dados do formulário (`formData`).
 * - Gerenciar o estado dos erros de validação (`formErrors`), incluindo um erro geral.
 * - Gerenciar o estado de carregamento (`isLoading`) durante a tentativa de login.
 * - Utilizar componentes de input customizados (`EmailInput`, `PasswordInput`).
 * - Realizar validações básicas no lado do cliente (campos obrigatórios, formato de email).
 * - Simular uma chamada de API para autenticar o usuário.
 * - Exibir mensagens de erro específicas por campo ou uma mensagem de erro geral.
 * - (Potencialmente) Navegar para o painel do usuário após login bem-sucedido (lógica de navegação comentada).
 * - Exibir um carrossel de imagens no painel esquerdo e logos nos locais designados.
 *
 * Estrutura e Estilo:
 * - Utiliza um layout de dois painéis (`leftPanel` para carrossel, `rightPanel` para formulário).
 * - No painel direito, o logo principal fica fixo no topo, e o conteúdo do formulário
 *   é centralizado vertical e horizontalmente usando um `div` com a classe `contentWrapper`
 *   (definida em `login.module.css`).
 * - A estilização detalhada é controlada por `login.module.css`.
 */
export default function LoginPage() {
  // --- Estados do Componente ---
  // Armazena os dados atuais dos campos do formulário de login.
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false, // Estado para o checkbox "Manter conectado"
  });
  // Armazena erros de validação (específicos de campo ou gerais).
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  // Controla a exibição do estado de carregamento.
  const [isLoading, setIsLoading] = useState(false);
  // Sinaliza se o usuário já tentou submeter (usado pelo PasswordInput).
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const router = useRouter();

  // --- Função Auxiliar de Validação ---
  /** Valida o formato básico de um endereço de email usando Regex. */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

   // --- Slides para o Carrossel ---
 const loginSlides = [
   <Image
     key="reg-slide-1"
     src="/carroselAlunos.png"
     alt="Alunos utilizando a plataforma"
     fill
     priority
     style={{ objectFit: "cover" }}
   />,
   <Image
     key="reg-slide-2"
     src="/carroselGerencie.png"
     alt="Interface de gerenciamento da plataforma"
     fill
     style={{ objectFit: "cover" }}
   />,
   <Image
     key="reg-slide-3"
     src="/carroselAvaliação.png"
     alt="Tela de avaliação de desempenho"
     fill
     style={{ objectFit: "cover" }}
   />,
 ];

  // --- Manipuladores de Eventos ---

  /**
   * Handler genérico para atualizar o estado `formData` (email ou senha).
   * Limpa o erro específico do campo e o erro geral ao digitar.
   * @param field A chave ('email' ou 'password') a ser atualizada.
   * @returns Uma função que recebe o evento `ChangeEvent` do input.
   */
  const handleChange = (field: 'email' | 'password') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFormData(prevData => ({ ...prevData, [field]: value }));
      // Limpa o erro do campo sendo modificado e também o erro geral.
      setFormErrors(prevErrors => ({
          ...prevErrors,
          [field]: null, // Limpa erro do campo específico
          general: null  // Limpa erro geral
      }));
    };

  /**
   * Handler para atualizar o estado do checkbox "Manter conectado".
   * @param e O evento `ChangeEvent` do input checkbox.
   */
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevData => ({ ...prevData, rememberMe: e.target.checked }));
  };

  // --- Submissão do Formulário ---

  /**
   * Handler para o evento de submissão do formulário de login.
   * Realiza validações, simula chamada de API e trata sucesso/erro.
   * @param event O evento de submissão do formulário.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Previne recarregamento da página.
    setFormErrors({}); // Limpa erros anteriores.
    setHasAttemptedSubmit(true); // Sinaliza tentativa (para PasswordInput).
    setIsLoading(true); // Ativa estado de carregamento.

    // --- Validação Client-Side ---
    const errors: FormErrors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório.';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Formato de email inválido.';
    }
    if (!formData.password) { // Validação simples de presença; força não é validada aqui.
        errors.password = 'Senha é obrigatória.';
    }

    // --- Verifica se houve erros de validação ---
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors); // Atualiza estado com os erros encontrados.
      setIsLoading(false); // Desativa carregamento.
      setHasAttemptedSubmit(false); // Reseta tentativa se falhou na validação.
      return; // Interrompe a submissão.
    }

    try {
      // Chamada à API de login
      const response = await LoginProfessor({
        email_professor: formData.email,
        password: formData.password
      });

      // Salvar o ID do professor no localStorage
      if (response.id) {
        localStorage.setItem('professorId', response.id.toString());
      }

      // Redirecionar para a página inicial
      router.push('/home');
    } catch (error: any) {
      console.error("Erro durante o login:", error);
      setFormErrors({ general: error.message || 'Erro ao fazer login. Verifique suas credenciais.' });
      setHasAttemptedSubmit(false);
    } finally {
      setIsLoading(false);
    }
  };

  // --- IDs para Acessibilidade ---
  // Usados para conectar inputs com suas mensagens de erro via `aria-describedby`.
  const emailErrorId = 'login-email-error';
  const passwordErrorId = 'login-password-error';
  const generalErrorId = 'login-general-error';

  // --- Lógica para Desabilitar Botão de Submit ---
  // Verifica se email ou senha estão vazios (após remover espaços).
  const isAnyFieldEmpty = !formData.email.trim() || !formData.password;
  // Desabilita se estiver carregando ou se algum campo estiver vazio.
  const isSubmitDisabled = isLoading || isAnyFieldEmpty;

  // --- Renderização do Componente ---
  return (
    // Container principal da página.
    <div className={styles.pageContainer}>

      {/* Painel Esquerdo: Carrossel e Logo Nexus. */}
      <div className={styles.leftPanel}>
         {/* Logo Nexus posicionado absolutamente sobre o carrossel. */}
         <div className={styles.NexusLogoContainer}>
           <Image
             src="/logo-Nexus.svg"
             alt="Nexus Logo"
             width={200} height={40} // Ajustar tamanho conforme necessário/definido no CSS
           />
         </div>
         {/* Componente Carrossel */}
         <Carousel autoSlide={true} autoSlideInterval={5000}>
           {loginSlides}
         </Carousel>
      </div> {/* Fim leftPanel */}

      {/* Painel Direito: Logo Luminus Fixo e Formulário de Login Centralizado. */}
      <div className={styles.rightPanel}>
        {/* Logo Luminus posicionado no topo do painel direito, FORA do wrapper de conteúdo. */}
        <div className={styles.logoContainer}>
            <Image
                src="/logo-Luminus.svg"
                alt="Luminus Logo"
                width={200} height={50} // Ajustar tamanho
                priority // Prioriza carregamento deste logo
            />
        </div>

        {/* Wrapper de Conteúdo: Centraliza o título, formulário e links verticalmente/horizontalmente.
            A estilização para centralização está em `login.module.css`. */}
        <div className={styles.contentWrapper}>

          {/* Título da seção */}
          <h1 className={styles.title}>LOGIN</h1>

          {/* Container para Erro Geral (exibido acima do formulário se houver) */}
          {formErrors.general && (
            // `role="alert"` informa tecnologias assistivas sobre esta mensagem importante.
            <div role="alert" className={styles.generalErrorContainer}>
               <span id={generalErrorId} className={styles.errorText}>
                 {formErrors.general}
               </span>
            </div>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* Campo de Email (usa EmailInput customizado) */}
            <div className={styles.inputWrapper}> {/* Wrapper padrão para input + erro */}
               <EmailInput
                 label="Email:"
                 id="login-email" // ID único para o input
                 placeholder="Digite seu email"
                 value={formData.email}
                 onChange={handleChange('email')} // Handler para atualizar estado
                 required // Marca como obrigatório
                 isInvalid={!!formErrors.email} // Define estilo de erro baseado no estado
                 aria-describedby={formErrors.email ? emailErrorId : undefined} // Liga ao erro (acessibilidade)
                 disabled={isLoading} // Desabilita durante carregamento
                 name="email" // Nome para submissão HTML
               />
               {/* Slot para exibir a mensagem de erro específica do email */}
               <div className={styles.errorSlot} aria-live="polite">
                 {formErrors.email && (
                   <span id={emailErrorId} className={styles.errorText}>
                     {formErrors.email}
                   </span>
                 )}
               </div>
            </div>

            {/* Campo de Senha (usa PasswordInput customizado) */}
            <div className={styles.inputWrapper}>
               <PasswordInput
                 label="Senha:"
                 id="login-password"
                 placeholder="Digite sua senha"
                 value={formData.password}
                 onChange={handleChange('password')}
                 required
                 disabled={isLoading}
                 name="password"
                 attemptedSubmit={hasAttemptedSubmit} // Informa tentativa (relevante p/ validação interna de senha, se houver)
                 isInvalid={!!formErrors.password} // Define estilo de erro (apenas se campo obrigatório faltar aqui)
                 aria-describedby={formErrors.password ? passwordErrorId : undefined}
                 // onErrorChange não é usado aqui pois não há validação interna de força no login
               />
               {/* Slot para exibir a mensagem de erro específica da senha */}
               <div className={styles.errorSlot} aria-live="polite">
                 {formErrors.password && (
                   <span id={passwordErrorId} className={styles.errorText}>
                     {formErrors.password}
                   </span>
                 )}
               </div>
            </div>

            {/* Container para opções extras: "Manter conectado" e "Esqueci minha senha" */}
            <div className={styles.extraOptions}>
              {/* Controle "Manter conectado" (Checkbox + Label) */}
              <div className={styles.rememberMeControl}>
                <input
                  type="checkbox"
                  id="remember-me" // ID para ligar com o label
                  name="rememberMe"
                  checked={formData.rememberMe} // Controlado pelo estado
                  onChange={handleCheckboxChange} // Handler para atualizar estado
                  disabled={isLoading} // Desabilita durante carregamento
                  className={styles.checkboxInput} // Classe para estilização customizada do checkbox
                />
                <label htmlFor="remember-me" className={styles.checkboxLabel}> {/* Liga ao input via htmlFor */}
                  Manter conectado
                </label>
              </div>
              {/* Link para a página de recuperação de senha */}
              <Link href="/forgot-password/enter-email" className={styles.forgotPasswordLink}>
                Esqueci minha senha
              </Link>
            </div>

            {/* Botão de Submissão */}
            <button
              type="submit"
              className={styles.submitButton} // Aplica estilos do CSS Module
              disabled={isSubmitDisabled} // Desabilita baseado na lógica definida
            >
              {/* Texto do botão muda durante o carregamento */}
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Link para a página de Cadastro */}
          <p className={styles.switchLink}>
            Não tem uma conta?{' '}
            <Link href="/register"> {/* Navega para a página de cadastro */}
              Cadastre-se
            </Link>
          </p>

        </div> {/* Fim contentWrapper */}

      </div> {/* Fim rightPanel */}
    </div> // Fim pageContainer
  );
}