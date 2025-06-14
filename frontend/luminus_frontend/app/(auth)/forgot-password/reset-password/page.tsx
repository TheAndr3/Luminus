// -*- coding: utf-8 -*-
/**
 * @file ResetPasswordPage.tsx
 * @description Define o componente da página para definir uma nova senha após
 *              solicitar a recuperação. Utiliza layout e validação de senha
 *              baseados em EnterEmailPage e RegisterPage.
 * @version 1.0 
 * @date 03-05-2025 
 * @author Pedro e Armando 
 */

/*
-------------------------- FALTA TESTAR INTEGRAÇÃO COM A API REAL --------------------------
*/

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
// --- IMPORTANTE: Importa o NOVO CSS Module específico (copiado de EnterEmail.module.css) ---
import styles from './resetPassword.module.css'; // <<< Certifique-se que o nome do arquivo CSS corresponde

// --- Importações de Componentes Customizados ---
import { PasswordInput } from '@/components/inputs/PasswordInput'; // <<< Usa o PasswordInput
import Carousel from '@/components/carousel/Carousel';

// --- Importação do Serviço da API ---
import { UpdatePassword } from '@/services/professorService';

// --- Tipos ---
/**
 * @type FormErrors
 * @description Erros de validação detectados na página (campos obrigatórios, senhas não coincidem, erro geral da API).
 */
type FormErrors = {
  newPassword?: string | null;
  confirmPassword?: string | null;
  general?: string | null;
};

/**
 * @type InternalErrors
 * @description Erros comunicados pelo PasswordInput filho (força da senha).
 */
type InternalErrors = {
    newPassword?: string | null;
};

/**
 * @component ResetPasswordPage
 * @description Componente funcional que renderiza a página para definir nova senha.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Estados do Componente ---
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [internalErrors, setInternalErrors] = useState<InternalErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // --- Efeito para buscar email e token da URL ---
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    const tokenFromUrl = searchParams.get('token');
    setEmail(emailFromUrl);
    setToken(tokenFromUrl);

    if (!emailFromUrl || !tokenFromUrl) {
        // Lida com o caso de parâmetros ausentes - pode redirecionar ou mostrar erro
        console.error("Email ou token ausentes na URL.");
        setFormErrors({ general: "Link de redefinição inválido ou expirado. Por favor, solicite novamente." });
    }
  }, [searchParams]);


    // --- Slides para o Carrossel ---
  const resetPasswordSlides = [
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
  /** Handler genérico para atualizar o estado formData */
  const handleChange = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFormData(prevData => ({ ...prevData, [field]: value }));
      // Limpa erros específicos ao digitar
      if (formErrors[field]) {
          setFormErrors(prevErrors => ({ ...prevErrors, [field]: null, general: null }));
      }
      // Limpa erro de confirmação se qualquer senha for alterada
      if ((field === 'newPassword' || field === 'confirmPassword') && formErrors.confirmPassword) {
        setFormErrors(prevErrors => ({ ...prevErrors, confirmPassword: null, general: null }));
      }
      // Limpa erro interno de força ao digitar nova senha
      if (field === 'newPassword' && internalErrors.newPassword) {
          setInternalErrors(prev => ({ ...prev, newPassword: null}));
      }
    };

  /** Callback para receber erros internos do PasswordInput (força) */
  const handleInternalError = (field: keyof InternalErrors, errorMessage: string | null) => {
      // Apenas atualiza se o erro mudou para evitar re-renderizações
      if (internalErrors[field] !== errorMessage) {
        setInternalErrors(prev => ({ ...prev, [field]: errorMessage }));
      }
  };

  // --- Submissão do Formulário ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttemptedSubmit(true); // Marca que houve tentativa de envio
    setFormErrors({}); // Limpa erros de validação anteriores
    // Não limpa internalErrors aqui, pois eles vêm do componente filho

    const currentInternalPasswordError = internalErrors.newPassword; // Pega o erro de força atual
    const errors: FormErrors = {};

    // --- Validações Client-Side ---
    // 1. Verifica se email e token foram carregados da URL
    if (!email || !token) {
      errors.general = "Link inválido ou expirado. Solicite a recuperação novamente.";
      setFormErrors(errors);
      setIsLoading(false); // Garante que não fique carregando
      return;
    }

    // 2. Verifica campos obrigatórios (PasswordInput já lida com a mensagem via onErrorChange se vazio + attemptedSubmit)
    // Mas podemos adicionar uma verificação explícita aqui se quisermos redundância ou outra mensagem
    if (!formData.newPassword) errors.newPassword = 'Nova senha é obrigatória.'; // Mensagem pode vir do internalError tb
    if (!formData.confirmPassword) errors.confirmPassword = 'Confirmação de senha é obrigatória.';

    // 3. Verifica se as senhas coincidem (somente se ambas foram preenchidas)
    if (formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem.';
    }

    // 4. Incorpora o erro de força da senha vindo do PasswordInput
    if (currentInternalPasswordError) {
      // Prioriza o erro de força se a senha não estiver vazia. Se estiver vazia, o erro de "obrigatório" tem mais prioridade.
       if (formData.newPassword) {
            errors.newPassword = currentInternalPasswordError;
       } else if (!errors.newPassword) {
           // Se não havia erro de obrigatório definido antes, usa o erro interno (que pode ser de obrigatório tb)
           errors.newPassword = currentInternalPasswordError;
       }
    }

    // --- Verifica erros de validação ---
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      await UpdatePassword({
        newPass: formData.newPassword,
        email: email
      }, token);

      // Se chegou aqui, a senha foi atualizada com sucesso
      alert('Senha atualizada com sucesso!');
      router.push('/login');
    } catch (error: any) {
      console.error("Erro ao atualizar senha:", error);
      setFormErrors({ general: error.message || 'Erro ao atualizar senha. Tente novamente mais tarde.' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- IDs para Acessibilidade ---
  const newPasswordErrorId = 'new-password-error';
  const confirmPasswordErrorId = 'confirm-password-error';
  const generalErrorId = 'reset-password-general-error';

  // Combina erros de validação e internos para o campo newPassword
  const displayNewPasswordError = formErrors.newPassword || internalErrors.newPassword;
  const isNewPasswordInvalid = !!displayNewPasswordError;

  // Lógica para Desabilitar Botão (Melhorada)
  // Desabilita se: estiver carregando, OU (houve tentativa de envio E (algum erro existe OU algum campo está vazio)), OU email/token não carregaram
  const isSubmitDisabled = isLoading || !email || !token || (attemptedSubmit && (isNewPasswordInvalid || !!formErrors.confirmPassword || !formData.newPassword || !formData.confirmPassword ));
  // OU uma lógica mais simples: desabilitado se carregando, ou se algum erro existe, ou se campos não preenchidos (após tentativa ou não?)
  // Vamos usar uma mais direta: desabilitado se loading, se falta email/token, ou se senhas vazias, ou se erro de confirmação, ou se erro de força (interno)
   const isSubmitDisabledSimple = isLoading || !email || !token || !formData.newPassword || !formData.confirmPassword || !!formErrors.confirmPassword || !!internalErrors.newPassword;


  // --- Renderização do Componente ---
  return (
    <div className={styles.pageContainer}>

      {/* Painel Esquerdo: Carrossel e Logo Nexus */}
      <div className={styles.leftPanel}>
         <div className={styles.NexusLogoContainer}>
           <Image src="/logo-Nexus.svg" alt="Nexus Logo" width={200} height={40}/>
         </div>
         <Carousel autoSlide={true} autoSlideInterval={5000}>
           {resetPasswordSlides}
         </Carousel>
      </div>

      {/* Painel Direito: Logo Luminus Fixo e Formulário Centralizado */}
      <div className={styles.rightPanel}>
        {/* Logo Luminus */}
        <div className={styles.logoContainer}>
            <Image src="/logo-Luminus.svg" alt="Luminus Logo" width={200} height={50} priority />
        </div>

        {/* Wrapper de Conteúdo */}
        <div className={styles.contentWrapper}>

          {/* Título */}
          <h1 className={styles.title}>DEFINIR NOVA SENHA</h1>

          {/* Instrução adicional */}
          <p className={styles.instructionText}>
             Crie uma senha forte e confirme-a abaixo.
          </p>

          {/* Container para Erro Geral */}
          {formErrors.general && (
            <div role="alert" className={styles.generalErrorContainer}>
               <span id={generalErrorId} className={styles.errorText}>
                 {formErrors.general}
               </span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>

            {/* Campo Nova Senha */}
            <div className={styles.inputWrapper}>
               <PasswordInput
                 label="Nova Senha:"
                 id="newPassword"
                 placeholder="Mínimo 8 caracteres"
                 value={formData.newPassword}
                 onChange={handleChange('newPassword')}
                 required
                 minLength={8} // Pode ser útil para o navegador, mas a validação de força é mais completa
                 disabled={isLoading}
                 name="newPassword"
                 // --- Props de Erro ---
                 onErrorChange={(err) => handleInternalError('newPassword', err)} // Captura erro de força/obrigatoriedade
                 // externalError={formErrors.newPassword} // O erro de 'obrigatório' vem via onErrorChange se vazio+attemptedSubmit
                 attemptedSubmit={attemptedSubmit} // Informa se houve tentativa de envio
                 isInvalid={isNewPasswordInvalid} // Define visualmente se há erro (validação OU interno)
                 aria-describedby={isNewPasswordInvalid ? newPasswordErrorId : undefined} // Liga à mensagem de erro
                 // Usando as mensagens padrão do PasswordInput para obrigatoriedade e força
              />
               {/* Slot de Erro para Nova Senha */}
               <div className={styles.errorSlot} aria-live="polite">
                 {displayNewPasswordError && ( // Mostra erro de validação OU interno
                   <span id={newPasswordErrorId} className={styles.errorText}>
                     {displayNewPasswordError}
                   </span>
                 )}
               </div>
            </div>

             {/* Campo Confirmar Senha */}
            <div className={styles.inputWrapper}>
               <PasswordInput
                 label="Confirme a Nova Senha:"
                 id="confirmPassword"
                 placeholder="Digite novamente sua nova senha"
                 value={formData.confirmPassword}
                 onChange={handleChange('confirmPassword')}
                 required
                 disabled={isLoading}
                 name="confirmPassword"
                 // --- Props de Erro (Simplificadas para este campo) ---
                 // Não precisa de onErrorChange aqui (não validamos força da confirmação)
                 // Não precisa de externalError (erro de não coincidir é tratado no submit)
                 attemptedSubmit={attemptedSubmit} // Ainda útil para estilo se necessário
                 isInvalid={!!formErrors.confirmPassword} // Define visualmente se há erro (validação de não coincidir/obrigatório)
                 aria-describedby={formErrors.confirmPassword ? confirmPasswordErrorId : undefined} // Liga à mensagem de erro
              />
               {/* Slot de Erro para Confirmação */}
               <div className={styles.errorSlot} aria-live="polite">
                 {formErrors.confirmPassword && (
                   <span id={confirmPasswordErrorId} className={styles.errorText}>
                     {formErrors.confirmPassword}
                   </span>
                 )}
               </div>
            </div>

            {/* Botão de Submissão */}
            <button
              type="submit"
              // Adiciona a classe mt-1 para dar espaço acima, como no register.module.css
              className={`${styles.submitButton} ${styles.mt1}`} // <<< Garanta que .mt-1 existe no CSS Module
              disabled={isSubmitDisabledSimple} // Usa a lógica de desabilitar definida
            >
              {isLoading ? 'Salvando...' : 'Confirmar Nova Senha'}
            </button>
          </form>

          {/* Link para voltar ao Login */}
          <p className={styles.switchLink}>
            Lembrou sua senha ou quer cancelar?{' '}
            <Link href="/login">
              Voltar para Login
            </Link>
          </p>

        </div> {/* Fim contentWrapper */}
      </div> {/* Fim rightPanel */}
    </div> // Fim pageContainer
  );
}