// -*- coding: utf-8 -*-
/**
 * @file RegisterPage.tsx
 * @description Define o componente da página de cadastro de novos usuários.
 *              Inclui formulário com validação, interação com componentes de input customizados,
 *              simulação de chamada de API e navegação para a página de confirmação de email
 *              após um cadastro bem-sucedido.
 * @version 1.0
 * @date 02-05-2025
 * @author Pedro e Andre
 */

/*
-------------------------- FALTA INTEGRAÇÃO COM A API --------------------------
*/
// Diretiva de Componente de Cliente, necessária para hooks (useState, useEffect),
// manipulação de eventos e o hook `useRouter`.
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Componente otimizado para imagens do Next.js
import Link from 'next/link'; // Componente para navegação client-side entre páginas Next.js
import { useRouter } from 'next/navigation'; // Hook do Next.js 13+ (App Router) para navegação programática
import styles from './register.module.css'; // Importa estilos CSS Modules específicos para esta página
import Carousel from '@/components/carousel/Carousel'; // Componente reutilizável de Carrossel

// --- Importações de Componentes de Input Customizados ---
// Cada componente encapsula a lógica e aparência de um tipo específico de input.
import { TextInput } from '@/components/inputs/TextInput';
import { EmailInput } from '@/components/inputs/EmailInput';
import { PhoneInput, unformatPhoneNumber } from '@/components/inputs/PhoneInput'; // Importa também a função utilitária
import { PasswordInput } from '@/components/inputs/PasswordInput';

// --- Tipos ---

/**
 * @type FormErrors
 * @description Define a estrutura para armazenar erros de validação do formulário
 *              detectados diretamente na lógica da página (ex: campos obrigatórios, formato de email, senhas não coincidem).
 */
type FormErrors = {
  username?: string | null;
  email?: string | null;
  contactNumber?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
};

/**
 * @type InternalErrors
 * @description Define a estrutura para armazenar erros comunicados pelos componentes
 *              de input filhos através da callback `onErrorChange` (ex: erro de força da senha).
 */
type InternalErrors = {
    password?: string | null;
    contactNumber?: string | null; // Mantido caso PhoneInput venha a ter validação interna comunicável
};

/**
 * @component RegisterPage
 * @description Componente funcional que renderiza a página de cadastro completa.
 *
 * Responsabilidades:
 * - Exibir o formulário de cadastro com campos para usuário, email, telefone e senha.
 * - Gerenciar o estado dos dados do formulário (`formData`).
 * - Gerenciar o estado dos erros de validação (`formErrors`, `internalErrors`).
 * - Gerenciar o estado de carregamento (`isLoading`) durante a submissão.
 * - Controlar se uma tentativa de submissão já ocorreu (`attemptedSubmit`) para validações condicionais.
 * - Utilizar componentes de input customizados (`TextInput`, `EmailInput`, etc.), passando props
 *   necessárias como `value`, `onChange`, `isInvalid`, `aria-describedby`, e recebendo erros via `onErrorChange`.
 * - Realizar validações no lado do cliente ao submeter o formulário.
 * - Simular uma chamada de API para registrar o usuário.
 * - Em caso de sucesso, navegar programaticamente para a página `/confirm-email`, passando o email
 *   do usuário como parâmetro na URL, utilizando o `useRouter` do Next.js.
 * - Exibir um carrossel de imagens no painel direito da página.
 */
export default function RegisterPage() {
  // Hook para obter o objeto router e permitir navegação programática.
  const router = useRouter();

  // --- Estados do Componente ---
  // Armazena os dados atuais dos campos do formulário.
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    contactNumber: '', // Armazena o valor FORMATADO vindo do PhoneInput
    password: '',
    confirmPassword: ''
  });
  // Armazena erros de validação detectados nesta página (ex: obrigatório, formato, senhas não coincidem).
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  // Armazena erros comunicados pelos componentes filhos (ex: força da senha).
  const [internalErrors, setInternalErrors] = useState<InternalErrors>({});
  // Controla a exibição do estado de carregamento (ex: no botão de submit).
  const [isLoading, setIsLoading] = useState(false);
  // Sinaliza se o usuário já tentou submeter o formulário (útil para mostrar erros de 'required').
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // --- Funções Auxiliares ---
  /** Valida o formato básico de um endereço de email usando Regex. */
  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // --- Slides para o Carrossel ---
  // Array de elementos `Image` do Next.js a serem exibidos no carrossel.
  const registerSlides = [
    <Image key="reg-slide-1" src="/carroselAlunos.png" alt="Alunos utilizando a plataforma" layout="fill" objectFit="cover" priority />,
    <Image key="reg-slide-2" src="/carroselGerencie.png" alt="Interface de gerenciamento da plataforma" layout="fill" objectFit="cover" />,
    <Image key="reg-slide-3" src="/carroselAvaliação.png" alt="Tela de avaliação de desempenho" layout="fill" objectFit="cover" />,
  ];

  // --- Manipuladores de Eventos ---

  /**
   * Handler genérico para atualizar o estado `formData` quando um input muda.
   * Limpa o erro específico do campo e o erro de confirmação de senha ao digitar.
   * @param field A chave do campo no estado `formData` a ser atualizado.
   * @returns Uma função que recebe o evento `ChangeEvent` do input.
   */
  const handleChange = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      // Atualiza o estado do formulário com o novo valor.
      setFormData(prevData => ({ ...prevData, [field]: value }));
      // Limpa o erro correspondente a este campo, se existir.
      if (formErrors[field]) {
          setFormErrors(prevErrors => ({ ...prevErrors, [field]: null }));
      }
      // Se estiver alterando senha ou confirmação, limpa também o erro de "senhas não coincidem".
      if ((field === 'password' || field === 'confirmPassword') && formErrors.confirmPassword) {
        setFormErrors(prevErrors => ({ ...prevErrors, confirmPassword: null }));
      }
    };

  /**
   * Callback passada para componentes filhos (como PasswordInput) que possuem validação interna.
   * Atualiza o estado `internalErrors` com a mensagem de erro (ou null) vinda do componente filho.
   * @param field A chave do campo no estado `internalErrors` (ex: 'password').
   * @param errorMessage A mensagem de erro recebida do filho, ou null.
   */
  const handleInternalError = (field: keyof InternalErrors, errorMessage: string | null) => {
      // Atualiza o estado de erros internos.
      setInternalErrors(prev => ({ ...prev, [field]: errorMessage }));
  };

  // --- Submissão do Formulário ---

  /**
   * Handler para o evento de submissão do formulário.
   * Realiza validações, simula chamada de API e navega em caso de sucesso.
   * @param event O evento de submissão do formulário.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Previne o comportamento padrão de recarregar a página.
    setAttemptedSubmit(true); // Marca que a submissão foi tentada.
    setFormErrors({}); // Limpa erros de validação anteriores da página.
    setInternalErrors({}); // Limpa erros internos anteriores vindos dos filhos.
    const errors: FormErrors = {}; // Objeto para acumular novos erros de validação.

    // --- Validações Client-Side ---
    if (!formData.username.trim()) errors.username = 'Nome de usuário é obrigatório.';

    if (!formData.email.trim()) errors.email = 'Email é obrigatório.';
    else if (!validateEmail(formData.email)) errors.email = 'Formato de email inválido.';

    // Usa a função auxiliar para obter apenas os dígitos antes de validar o telefone.
    const phoneDigits = unformatPhoneNumber(formData.contactNumber);
    if (!formData.contactNumber.trim()) errors.contactNumber = 'Número de contato é obrigatório.';
    // Valida se tem 10 ou 11 dígitos (padrão brasileiro).
    else if (phoneDigits.length < 10 || phoneDigits.length > 11) errors.contactNumber = 'Telefone inválido (10 ou 11 dígitos).';

    if (!formData.password) errors.password = 'Senha é obrigatória.';
    // Nota: A validação de *força* da senha é delegada ao PasswordInput.
    // Se o PasswordInput comunicar um erro via `handleInternalError`, ele será considerado abaixo.

    if (!formData.confirmPassword) errors.confirmPassword = 'Confirmação de senha é obrigatória.';
    // Verifica se as senhas digitadas coincidem (apenas se ambas foram preenchidas).
    else if (formData.password && formData.password !== formData.confirmPassword) errors.confirmPassword = 'As senhas não coincidem.';
    // --- Fim Validações ---

    // --- Integração com Erros Internos dos Componentes ---
    // Verifica se o PasswordInput reportou algum erro (ex: de força) e o adiciona aos erros do formulário.
    if (internalErrors.password) errors.password = internalErrors.password;
    // Adicionar aqui verificações para outros erros internos se necessário (ex: internalErrors.contactNumber)

    // --- Verificação Final e Submissão ---
    // Se qualquer erro foi encontrado (na validação da página ou vindo dos filhos)...
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors); // Atualiza o estado de erros para exibi-los na UI.
      setIsLoading(false); // Garante que o estado de carregamento seja desativado.
      return; // Interrompe a submissão.
    }

    // Se todas as validações passaram...
    setIsLoading(true); // Ativa o estado de carregamento.
    console.log('Dados do Registro Validados (prontos para envio):', { ...formData, contactNumberDigits: phoneDigits }); // Log para debug

    try {
        // Simula uma chamada assíncrona à API (ex: usando fetch ou axios).
        // Aqui, usamos uma Promise com setTimeout para simular a demora da rede.
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Registro simulado com sucesso!');

        // --- Navegação Programática Pós-Sucesso ---
        // Constrói a URL para a página de confirmação, incluindo o email como query parameter.
        // `encodeURIComponent` garante que caracteres especiais no email sejam tratados corretamente na URL.
        const confirmUrl = `/confirm-email?email=${encodeURIComponent(formData.email)}`;
        router.push(confirmUrl); // Navega para a URL construída.

        // Opcional: Resetar o formulário após o sucesso. Pode ser feito aqui ou
        // deixar que o estado seja perdido naturalmente com a navegação.
        // setFormData({ username: '', email: '', contactNumber: '', password: '', confirmPassword: '' });
        // setAttemptedSubmit(false);

    } catch (error) {
        // Tratamento de erro caso a chamada à API (simulada ou real) falhe.
        console.error("Erro na simulação de registro:", error);
        // Exibe um erro genérico para o usuário (poderia ser mais específico).
        setFormErrors({ email: 'Ocorreu um erro ao tentar registrar. Tente novamente.' });
        setIsLoading(false); // Desativa o carregamento em caso de erro.
    } finally {
        // O bloco finally é executado sempre, mas em caso de sucesso, a navegação já
        // terá ocorrido, desmontando este componente. Parar o loading aqui é seguro,
        // principalmente para cobrir o cenário de erro onde a navegação não ocorre.
        // setIsLoading(false); // Pode ser redundante se já feito no catch
    }
  };

  // --- IDs para Acessibilidade (aria-describedby) ---
  // IDs únicos para conectar os inputs às suas respectivas mensagens de erro.
  const usernameErrorId = 'username-error';
  const emailErrorId = 'email-error';
  const contactNumberErrorId = 'contactNumber-error';
  const passwordErrorId = 'password-error';
  const confirmPasswordErrorId = 'confirmPassword-error';

  // Determina qual erro de senha exibir (prioriza o erro do form, depois o interno).
  const displayPasswordError = formErrors.password || internalErrors.password;
  // Define se o campo de senha deve ser marcado como inválido (visual e acessibilidade).
  const isPasswordInvalid = !!displayPasswordError;

  // --- Lógica para Desabilitar o Botão de Submit ---
  // Verifica se algum campo essencial está vazio.
  const isAnyFieldEmpty = !formData.username.trim() || !formData.email.trim() || !formData.contactNumber.trim() || !formData.password.trim() || !formData.confirmPassword.trim();
  // O botão é desabilitado se estiver carregando, algum campo estiver vazio, ou existir qualquer erro (do form ou interno).
  const isSubmitDisabled = isLoading || isAnyFieldEmpty || !!internalErrors.password || !!formErrors.password || !!formErrors.confirmPassword || !!formErrors.email || !!formErrors.username || !!formErrors.contactNumber;


  // --- Renderização do Componente ---
  return (
    // Container principal da página (usa CSS Modules para estilização).
    <div className={styles.pageContainer}>

      {/* Painel Esquerdo: Contém o formulário de cadastro. */}
      <div className={styles.leftPanel}>
        {/* Logo da aplicação */}
        <div className={styles.logoContainer}>
          <Image src="/logo-Luminus.svg" alt="Luminus Nexus Logo" width={200} height={50} priority />
        </div>
        {/* Título da página */}
        <h1 className={styles.title}>CADASTRO</h1>

        {/* Formulário: onSubmit chama `handleSubmit`, noValidate desabilita validação HTML5 padrão. */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Wrapper para cada campo de input + mensagem de erro */}
          {/* Campo Usuário */}
          <div className={styles.inputWrapper}>
            <TextInput
              label="Usuário:" id="username" placeholder="Nome"
              value={formData.username} onChange={handleChange('username')}
              required // Indica visualmente e semanticamente que é obrigatório
              isInvalid={!!formErrors.username} // Controla estilo de erro no input
              aria-describedby={formErrors.username ? usernameErrorId : undefined} // Liga ao erro para acessibilidade
              disabled={isLoading} // Desabilita durante o carregamento
              name="username" // Nome para submissão HTML (se aplicável)
            />
            {/* Slot para exibir a mensagem de erro */}
            <div className={styles.errorSlot} aria-live="polite"> {/* aria-live anuncia mudanças para leitores de tela */}
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

          {/* Campo Telefone */}
          <div className={styles.inputWrapper}>
             <PhoneInput
               label="Número de contato:" id="contactNumber"
               value={formData.contactNumber} onChange={handleChange('contactNumber')} // Recebe valor formatado
               required isInvalid={!!formErrors.contactNumber}
               aria-describedby={formErrors.contactNumber ? contactNumberErrorId : undefined}
               disabled={isLoading} name="contactNumber"
               // onErrorChange={(err) => handleInternalError('contactNumber', err)} // Descomentar se PhoneInput tiver validação interna
             />
              <div className={styles.errorSlot} aria-live="polite">
                { formErrors.contactNumber && (<span id={contactNumberErrorId} className={styles.errorText}>{formErrors.contactNumber}</span>)}
              </div>
          </div>

          {/* Campo Senha */}
          <div className={styles.inputWrapper}>
             <PasswordInput
               label="Senha:" id="password" placeholder="Mínimo 8 caracteres"
               value={formData.password} onChange={handleChange('password')}
               required minLength={8} // Prop padrão HTML, pode não ser usada internamente pelo PasswordInput
               disabled={isLoading} name="password"
               onErrorChange={(err) => handleInternalError('password', err)} // <<< Recebe erro de força/interno
               externalError={formErrors.password} // <<< Passa erro de validação da página (ex: obrigatório)
               attemptedSubmit={attemptedSubmit}   // <<< Informa tentativa de submit
               isInvalid={isPasswordInvalid} // <<< Define estado visual/acessibilidade de erro
               aria-describedby={isPasswordInvalid ? passwordErrorId : undefined} // <<< Liga ao erro
             />
             <div className={styles.errorSlot} aria-live="polite">
                {/* Exibe o erro de senha (seja do form ou interno) */}
                {displayPasswordError && (<span id={passwordErrorId} className={styles.errorText}>{displayPasswordError}</span>)}
             </div>
          </div>

          {/* Campo Confirmar Senha */}
          <div className={styles.inputWrapper}>
             {/* Nota: Confirmar Senha usa PasswordInput para ter o toggle de visibilidade, mas não precisa da validação de força */}
             <PasswordInput
               label="Confirme a senha:" id="confirmPassword" placeholder="Digite novamente sua senha"
               value={formData.confirmPassword} onChange={handleChange('confirmPassword')}
               required minLength={8} // Prop HTML
               isInvalid={!!formErrors.confirmPassword} // Erro de "não coincide"
               aria-describedby={formErrors.confirmPassword ? confirmPasswordErrorId : undefined}
               disabled={isLoading} name="confirmPassword"
               // Não precisa passar onErrorChange, externalError ou attemptedSubmit aqui, pois a validação é só de igualdade.
             />
             <div className={styles.errorSlot} aria-live="polite">
                {formErrors.confirmPassword && (<span id={confirmPasswordErrorId} className={styles.errorText}>{formErrors.confirmPassword}</span>)}
             </div>
          </div>

          {/* Botão de Submissão */}
          <button type="submit" className={`${styles.submitButton} mt-1`} disabled={isSubmitDisabled}>
            {/* Texto dinâmico baseado no estado de carregamento */}
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        {/* Link para a página de Login */}
        <p className={styles.loginLink}>
          Já possui uma conta?{' '}
          <Link href="/login">Entrar</Link> {/* Link client-side */}
        </p>
      </div> {/* Fim leftPanel */}

      {/* Painel Direito: Contém logos e o carrossel de imagens. */}
      <div className={styles.rightPanel}>
         {/* Logo Secundária */}
         <div className={styles.NexusLogoContainer}>
          <Image src="/logo-Nexus.svg" alt="Nexus Logo" width={200} height={40} />
        </div>
        {/* Carrossel de Imagens */}
        <Carousel autoSlide={true} autoSlideInterval={5000}>
          {/* Passa o array de slides como children */}
          {registerSlides}
        </Carousel>
      </div> {/* Fim rightPanel */}
    </div> // Fim pageContainer
  );
}