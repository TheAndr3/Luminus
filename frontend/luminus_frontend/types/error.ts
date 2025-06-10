/**
 * @interface ErrorComponentProps
 * @description Define as propriedades padrão que um componente genérico
 *              de exibição de erro pode aceitar.
 */
export interface ErrorComponentProps {
  /**
   * A mensagem de erro textual a ser exibida ao usuário.
   * Se for null, undefined ou uma string vazia, o componente pode
   * optar por não renderizar o conteúdo da mensagem visualmente.
   */
  message?: string | null;

  /**
   * (Opcional) Classes CSS adicionais a serem aplicadas ao elemento
   * raiz do componente de erro. Útil para estilização externa ou layout
   * (ex: adicionar margens, largura específica).
   */
  className?: string;

  /**
   * (Opcional) Um código de erro específico (string). Pode ser usado
   * internamente pelo componente para variar a exibição ou para
   * fins de teste/identificação.
   * Ex: 'VALIDATION_REQUIRED', 'API_AUTH_FAILED'
   */
  code?: string;

  /**
   * (Opcional) Indica a severidade ou o tipo do feedback.
   * Pode influenciar a cor, ícone ou destaque do componente.
   * @default 'error' (implícito ou explícito na implementação)
   */
  severity?: 'info' | 'warning' | 'error';

	/**
   (Opcional) ID único para este container, útil para aria-describedby
   */
	id?: string;

  // --- Outras propriedades poderiam ser adicionadas aqui conforme necessário ---
  // Ex: title?: string; // Para erros com título
  // Ex: fieldId?: string; // Para associar a um input específico (acessibilidade)
}