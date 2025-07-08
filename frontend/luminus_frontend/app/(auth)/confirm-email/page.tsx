// -*- coding: utf-8 -*-
/**
 * @file confirm-email.tsx
 * @description Define o componente da página de confirmação de email via PIN/OTP.
 *              Esta página lê o endereço de email do usuário a partir de um parâmetro
 *              na URL (`?email=...`), exibe um campo para inserção de PIN,
 *              valida o PIN inserido e simula uma verificação.
 * @version 1.0
 * @date 02-05-2025
 * @author Pedro
 */

/*
-------------------------- FALTA INTEGRAÇÃO COM A API --------------------------
*/

// Diretiva de Componente de Cliente, necessária para hooks (useState, useEffect, etc.)
// e especialmente para useSearchParams.
'use client';

import React, { useState, useEffect, useId, Suspense } from 'react'; // Importa Suspense para lidar com useSearchParams
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; // Hook para ler parâmetros da URL no App Router
import styles from './confirmEmail.module.css'; // Estilos CSS Modules específicos
import { useRouter } from 'next/navigation'; // Importa useRouter para redirecionar
import { ConfirmEmail, SendRecoveryEmail } from '@/services/professorService';

// --- Importações de Componentes ---
import { PinInput } from '@/components/inputs/PinInput'; // Componente reutilizável para entrada de PIN
import Carousel from '@/components/carousel/Carousel'; // Componente reutilizável de Carrossel

// --- Tipos ---

/**
 * @type FormErrors
 * @description Define a estrutura para armazenar erros de validação específicos do campo PIN.
 */
type FormErrors = {
  userPin?: string | null; // Erro relacionado ao campo PIN
};

/**
 * @type FormDataState
 * @description Define a estrutura do estado que armazena os dados do formulário (apenas o PIN).
 */
type FormDataState = {
  userPin: string; // Armazena o valor atual do PIN digitado pelo usuário
};

// --- Slides para o Carrossel ---
// Array de elementos Image para serem exibidos no painel direito.
const confirmEmailSlides = [
    <Image key="conf-slide-1" src="/carroselAlunos.png" alt="Confirmação Segura de Email" layout="fill" objectFit="cover" priority />,
    <Image key="conf-slide-2" src="/carroselGerencie.png" alt="Seu acesso está quase pronto" layout="fill" objectFit="cover" />,
    <Image key="conf-slide-3" src="/carroselAvaliação.png" alt="Apenas mais um passo para acessar a plataforma" layout="fill" objectFit="cover" />,
];

// --- Componente Interno de Conteúdo ---
/**
 * @component ConfirmEmailContent
 * @description Componente interno que contém toda a lógica e UI da página de confirmação.
 *              É separado para permitir o uso do hook `useSearchParams` dentro de um `<Suspense>`.
 *
 * Responsabilidades:
 * - Ler o parâmetro 'email' da URL usando `useSearchParams`.
 * - Gerenciar o estado do formulário (PIN), erros e carregamento.
 * - Renderizar o layout da página, incluindo logos, prompt com o email, componente `PinInput` e botões.
 * - Lidar com a entrada do PIN e a submissão do formulário.
 * - Realizar validação do PIN e simular a verificação.
 * - Definir e passar as classes de estilo (Tailwind) para o componente `PinInput`.
 */
function ConfirmEmailContent() {
  // Hook para acessar os parâmetros de busca da URL atual.
  const searchParams = useSearchParams();
  const router = useRouter(); // Importa useRouter para redirecionar

  // --- Estados do Componente ---
  // Estado para os dados do formulário (o PIN digitado).
  const [formData, setFormData] = useState<FormDataState>({ userPin: '' });
  // Estado para armazenar mensagens de erro de validação do PIN.
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  // Estado para controlar a exibição de carregamento (ex: durante a verificação).
  const [isLoading, setIsLoading] = useState(false);
  // Estado para controlar o carregamento do reenvio de email
  const [isResending, setIsResending] = useState(false);
  // Estado para armazenar o email lido da URL. Inicia como null.
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // --- Constantes ---
  const PIN_LENGTH = 4; // Define o comprimento esperado do PIN.
  const pinErrorId = useId(); // Gera um ID único para associar o input de PIN ao seu erro (acessibilidade).

  // --- Efeito para Ler o Email e Token da URL ---
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    const tokenFromUrl = searchParams.get('token');
    
    if (emailFromUrl && tokenFromUrl) {
      setUserEmail(decodeURIComponent(emailFromUrl));
      setToken(decodeURIComponent(tokenFromUrl));
    } else {
      console.warn("Parâmetros 'email' ou 'token' não encontrados na URL.");
      router.push('/register');
    }
  }, [searchParams, router]);

  // --- Manipuladores de Eventos ---

  /**
   * Handler chamado quando o valor do `PinInput` muda.
   * Atualiza o estado `formData` apenas com dígitos e limpa erros relacionados ao PIN.
   * @param value O novo valor vindo do PinInput (pode conter não-dígitos se algo der errado).
   */
  const handlePinChange = (value: string) => {
      // Garante que apenas dígitos sejam armazenados no estado.
      const numericValue = value.replace(/\D/g, '');
      setFormData({ userPin: numericValue });
      // Limpa o erro do PIN sempre que o usuário digita algo novo.
      if (formErrors.userPin) setFormErrors({});
  };

  /**
   * Handler para o evento de submissão do formulário de PIN.
   * Valida o PIN, simula a verificação e atualiza o estado de erros/carregamento.
   * @param event O evento de submissão do formulário.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Previne recarregamento da página.
    setFormErrors({}); // Limpa erros anteriores.
    const errors: FormErrors = {}; // Objeto para acumular novos erros.

    // --- Validação do PIN ---
    if (!formData.userPin) { // Verifica se está vazio
      errors.userPin = 'O PIN é obrigatório.';
    } else if (formData.userPin.length !== PIN_LENGTH) { // Verifica o comprimento
      errors.userPin = `O PIN deve ter ${PIN_LENGTH} dígitos.`;
    } else if (!/^\d+$/.test(formData.userPin)) { // Verifica se contém apenas números (redundante devido ao handlePinChange, mas seguro)
      errors.userPin = 'O PIN deve conter apenas números.';
    }

    // Se houver erros de validação...
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors); // Atualiza o estado de erros.
      return; // Interrompe a submissão.
    }

    if (!userEmail || !token) {
      setFormErrors({ userPin: 'Dados de verificação inválidos. Por favor, tente novamente.' });
      return;
    }

    setIsLoading(true);

    try {
      await ConfirmEmail({
        email: userEmail,
        code: parseInt(formData.userPin),
        token: token
      });

      // Se chegou aqui, a confirmação foi bem-sucedida
      alert('Email confirmado com sucesso!');
      router.push('/login'); // Redireciona para o login após confirmação

    } catch (error: unknown) {
      console.error("Erro na verificação do PIN:", error);
      const errorMessage = error instanceof Error ? error.message : 'PIN inválido ou expirado. Tente novamente.';
      setFormErrors({ userPin: errorMessage });
    } finally {
        // Garante que o estado de carregamento seja desativado, independentemente de sucesso ou falha.
        setIsLoading(false);
    }
  };

  /**
   * Handler para reenviar o email de confirmação.
   * Chama a API para gerar um novo código e enviar por email.
   */
  const handleResendEmail = async () => {
    if (!userEmail) {
      alert('Email não encontrado. Por favor, tente novamente.');
      return;
    }

    setIsResending(true);

    try {
      await SendRecoveryEmail(userEmail);
      alert('Email de confirmação reenviado com sucesso!');
    } catch (error: unknown) {
      console.error("Erro ao reenviar email:", error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao reenviar email de confirmação. Tente novamente.';
      alert(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  // --- Lógica para Desabilitar o Botão de Submit ---
  // O botão é desabilitado se:
  // - Estiver carregando (isLoading).
  // - O email ainda não foi carregado da URL (!userEmail).
  // - O PIN não tem o comprimento correto.
  // - Existe algum erro de validação no PIN (!!formErrors.userPin).
  const isSubmitDisabled = isLoading || !userEmail || formData.userPin.length !== PIN_LENGTH || !!formErrors.userPin;

  // --- Definição Dinâmica dos Estilos para PinInput (Exemplo com Tailwind) ---
  // Define as classes para o container que envolve os inputs do PIN (layout flex, espaçamento).
  const pinInputContainerStyle = `flex items-center justify-center space-x-3`;
  // Função que retorna as classes CSS para CADA input individual do PIN.
  const getPinInputStyle = (): string => {
    // Classes base de aparência (tamanho, texto, borda, fundo, transição, foco).
    let classes = `w-14 h-16 text-center text-xl font-semibold border-2 rounded-lg bg-white text-gray-900 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-600 focus:border-blue-600 caret-color-blue-600`;
    // Adiciona classe de borda vermelha se houver erro.
    if (formErrors.userPin) {
        classes += ' border-red-500';
    } else { // Borda preta padrão se não houver erro.
        classes += ' border-black';
    }
    // Adiciona classes de estilo desabilitado se estiver carregando ou se o email não foi carregado.
    if (isLoading || !userEmail) {
        classes += ' bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed';
    }
    return classes; // Retorna a string final de classes.
  };
  // Classe para o wrapper mais externo do componente PinInput (adiciona margem inferior).
  const pinInputWrapperStyle = `mb-2`; // Ajuste a margem conforme necessário.

  // --- Renderização do Conteúdo da Página ---
  return (
    // Container principal da página.
    <div className={styles.pageContainer}>

      {/* Painel Esquerdo: Logo e Formulário de PIN. */}
      <div className={styles.leftPanel}>
        {/* Logo Luminus */}
        <div className={styles.logoContainer}>
          <Image src="/logo-Luminus.svg" alt="Luminus Logo" width={200} height={50} priority />
        </div>
        {/* Wrapper para centralizar o conteúdo do formulário. */}
        <div className={styles.contentWrapper}>
          {/* Texto de instrução que exibe o email lido da URL. */}
          <p className={styles.pinPromptLabel}>
            {userEmail ? ( // Renderização condicional: mostra o email se já foi carregado.
              <>
                Insira o pin recebido em <br />
                <strong>{userEmail}</strong>. {/* Exibe o email em negrito. */}
              </>
            ) : (
              'Carregando email...' // Mensagem de placeholder enquanto o email é lido da URL.
            )}
          </p>
          {/* Formulário para entrada do PIN. */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* Container para o PinInput e seu slot de erro. */}
            <div>
              {/* Componente PinInput reutilizável. */}
              <PinInput
                length={PIN_LENGTH} // Define o número de dígitos.
                value={formData.userPin} // Passa o valor do estado.
                onChange={handlePinChange} // Passa o handler de mudança.
                isInvalid={!!formErrors.userPin} // Define o estado de erro visual/acessibilidade.
                aria-describedby={formErrors.userPin ? pinErrorId : undefined} // Liga ao erro para acessibilidade.
                autoFocus // Foca automaticamente no primeiro campo ao montar.
                disabled={isLoading || !userEmail} // Desabilita se carregando ou sem email.
                name="userPin" // Nome para o input oculto (se usado em form padrão).
                aria-label={`PIN de ${PIN_LENGTH} dígitos enviado para ${userEmail || 'seu email'}`} // Label acessível.
                // Passa as classes de estilo definidas acima para o componente PinInput.
                containerClassName={pinInputWrapperStyle} // Classe para o wrapper mais externo.
                inputContainerClassName={pinInputContainerStyle} // Classe para o container dos inputs (layout).
                inputClassName={getPinInputStyle()} // Classes para cada input individual (aparência).
              />
              {/* Slot para exibir a mensagem de erro específica do PIN. */}
              <div className={styles.errorSlot} aria-live="polite">
                {formErrors.userPin && (<span id={pinErrorId} className={styles.errorText}>{formErrors.userPin}</span>)}
              </div>
            </div>
            {/* Grupo de botões (Confirmar e Voltar). */}
            <div className={styles.buttonGroup}>
              {/* Botão de Submissão */}
              <button type="submit" className={styles.submitButton} disabled={isSubmitDisabled}>
                {isLoading ? 'Confirmando...' : 'Confirmar PIN'}
              </button>
              {/* Botão/Link para Voltar (ex: para a página de cadastro). */}
              <Link href="/register" className={styles.backButton}>
                Voltar
              </Link>
            </div>
          </form>

          {/* Link para reenviar email */}
          <p className={styles.switchLink}>
            Não recebeu o código?{' '}
            <button 
              type="button" 
              onClick={handleResendEmail} 
              disabled={isResending}
              className={styles.resendButton}
            >
              {isResending ? 'Reenviando...' : 'Reenviar código'}
            </button>
          </p>
        </div>
      </div> {/* Fim leftPanel */}

      {/* Painel Direito: Logo Nexus e Carrossel. */}
      <div className={styles.rightPanel}>
         {/* Logo Nexus */}
         <div className={styles.NexusLogoContainer}>
           <Image src="/logo-Nexus.svg" alt="Nexus Logo" width={150} height={40} />
         </div>
         {/* Carrossel de Imagens */}
         <Carousel autoSlide={true} autoSlideInterval={6000}>
           {confirmEmailSlides}
         </Carousel>
      </div> {/* Fim rightPanel */}
    </div> // Fim pageContainer
  );
}

// --- Componente Principal da Página (Wrapper com Suspense) ---
/**
 * @component ConfirmEmailPage
 * @description Componente principal exportado para a rota `/confirm-email`.
 *              Atua como um wrapper que utiliza `React.Suspense` para envolver
 *              o `ConfirmEmailContent`. Isso é necessário porque o hook `useSearchParams`
 *              usado dentro de `ConfirmEmailContent` pode suspender a renderização
 *              enquanto aguarda os parâmetros da URL serem lidos no lado do cliente,
 *              especialmente durante a navegação inicial ou hidratação.
 *
 * @returns JSX.Element
 */
export default function ConfirmEmailPage() {
  // Envolve o componente que usa `useSearchParams` com `Suspense`.
  // O `fallback` é exibido enquanto o conteúdo está suspendido (aguardando dados da URL).
  return (
    <Suspense fallback={<div>Carregando informações...</div>}> {/* Pode ser um componente de Spinner ou Skeleton UI mais elaborado */}
      <ConfirmEmailContent /> {/* Renderiza o conteúdo principal uma vez que os dados (searchParams) estejam prontos. */}
    </Suspense>
  );
}