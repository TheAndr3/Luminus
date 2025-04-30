/**
 * @file confirmPage.tsx
 * @description Página de confirmação de PIN após cadastro inicial (modificado).
 * Contém apenas um campo para inserir o PIN recebido por email.
 */
'use client';

import React, { useState, useEffect } from 'react'; // Adicionado useEffect se for buscar de URL/API
import Image from 'next/image';
// import { useRouter } from 'next/navigation'; // Descomente se for pegar da URL
// import { useSearchParams } from 'next/navigation'; // Descomente se for pegar da URL
import styles from './confirmEmail.module.css';

// --- Importações de Componentes ---
import { PinInput } from '@/components/inputs/PinInput';

// --- Tipos (mantidos) ---
type FormErrors = { userPin?: string | null; };
type FormDataState = { userPin: string; };

/**
 * @component CadastroPage
 * @description Componente funcional que renderiza a página de confirmação de PIN.
 */
export default function CadastroPage() {
  // --- Estados do Componente ---

  const [formData, setFormData] = useState<FormDataState>({ userPin: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // --- ESTADO PARA O EMAIL (Exemplo/Placeholder) ---
  // Em uma aplicação real, você obteria isso de uma fonte apropriada
  // Ex: contexto, props, URL, etc.
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // --- Exemplo: Buscar email dos parâmetros da URL (se aplicável) ---
  // const searchParams = useSearchParams();
  // useEffect(() => {
  //   const emailFromUrl = searchParams.get('email');
  //   if (emailFromUrl) {
  //     setUserEmail(decodeURIComponent(emailFromUrl)); // Decodifica caso tenha caracteres especiais
  //   } else {
  //      // Lógica de fallback se o email não estiver na URL
  //      // Poderia buscar de um contexto, ou exibir uma mensagem genérica
  //      console.warn("Email não encontrado nos parâmetros da URL.");
  //      setUserEmail("seu email"); // Fallback genérico
  //   }
  // }, [searchParams]);
  // --- Fim do Exemplo URL ---

  // --- Exemplo: Usando um valor fixo para demonstração ---
  useEffect(() => {
    // Simula a obtenção do email (substitua pela sua lógica real)
    setUserEmail("email.do.usuario@exemplo.com");
  }, []); // Executa apenas uma vez na montagem


  // --- Manipuladores de Eventos (handlePinChange, handleSubmit - mantidos como antes) ---
  const handlePinChange = (value: string) => {
      setFormData(prevData => ({ ...prevData, userPin: value }));
      if (formErrors.userPin) {
          setFormErrors(prevErrors => ({ ...prevErrors, userPin: null }));
      }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({});
    setIsLoading(true);

    const errors: FormErrors = {};
    const PIN_LENGTH = 4;

    if (!formData.userPin) {
        errors.userPin = 'O PIN é obrigatório.';
    } else if (formData.userPin.length !== PIN_LENGTH) {
        errors.userPin = `O PIN deve ter exatamente ${PIN_LENGTH} dígitos.`;
    } else if (!/^\d+$/.test(formData.userPin)) {
        errors.userPin = 'O PIN deve conter apenas números.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    console.log('PIN para verificação:', formData.userPin, 'para o email:', userEmail);

    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert(`PIN verificado com sucesso para ${userEmail}! (simulado)`);
        setFormData({ userPin: '' });
    } catch (error) {
        console.error("Erro na simulação de verificação do PIN:", error);
        setFormErrors({ userPin: 'Falha ao verificar o PIN. Tente novamente.' });
    } finally {
        setIsLoading(false);
    }
  };

  // --- Renderização do Componente ---
  return (
    <div className={`${styles.pageContainer} overflow-hidden`}>
      <div className={styles.leftPanel}>
        <div className={styles.logoContainer}>
          <Image src="/logo-Luminus.svg" alt="Luminus Nexus Logo" width={200} height={50} priority />
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* --- LABEL MODULARIZADA --- */}
          <p className={styles.pinPromptLabel}>
            {userEmail ? ( // Verifica se o email já foi carregado/obtido
              <> {/* Fragmento React para agrupar elementos */}
                Insira o pin que você recebeu no email{' '}
                {/* Usa <strong> para destacar o email, opcional */}
                <strong>{userEmail}</strong>
                {' '}de confirmação.
              </>
            ) : (
              // Mensagem enquanto o email não está disponível ou como fallback
              'Insira o pin que você recebeu no seu email de confirmação...'
            )}
          </p>
          {/* --- FIM DA LABEL MODULARIZADA --- */}

          <PinInput
            label=""
            value={formData.userPin}
            onChange={handlePinChange}
            length={4}
            error={formErrors.userPin}
            disabled={isLoading || !userEmail} // Desabilita enquanto email não carrega (opcional)
            containerClassName="mb-4"
            name="userPin"
            aria-label={`PIN de confirmação enviado para ${userEmail || 'seu email'}`} // Atualiza aria-label também
            inputContainerClassName={styles.pinInputContainer}
          />

          <button type="submit" className={`${styles.submitButton} mt-3`} disabled={isLoading || !userEmail}>
            {isLoading ? 'Confirmando...' : 'Confirmar PIN'}
          </button>
        </form>
      </div>

      {/* Painel Direito (inalterado) */}
       <div className={styles.rightPanel}>
         <div className={styles.NexusLogoContainer}>
           <Image src="/logo-Nexus.svg" alt="Nexus Logo" width={150} height={40} />
         </div>
         <div className={styles.carouselPlaceholder}>
           <h2>Crie, gerencie e obtenha dados de suas turmas.</h2>
           <p>(Aqui entrará o carrossel de imagens)</p>
         </div>
       </div>
    </div>
  );
}