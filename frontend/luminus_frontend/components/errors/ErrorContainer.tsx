import React from 'react';
import { ErrorComponentProps } from '@/types/error'; // Ajuste o caminho

/**
 * @component ErrorContainer
 * @description Componente focado em exibir a mensagem de erro formatada.
 * NÃO gerencia altura mínima ou espaço reservado; isso é responsabilidade do componente pai (ex: BaseInput).
 * Renderiza a mensagem apenas se ela for fornecida.
 */
export const ErrorContainer: React.FC<ErrorComponentProps> = ({
  message,
  className, // Classe para o div da mensagem
  id,
  severity = 'error',
}) => {
  // --- Classes Tailwind para o TEXTO ---
  const getColorClass = (sev: 'info' | 'warning' | 'error'): string => {
    switch (sev) {
      case 'info':    return 'text-blue-600 dark:text-blue-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'error': default: return 'text-red-600 dark:text-red-400';
    }
  };
  // Classes aplicadas diretamente ao div da mensagem
  const textClasses = `text-xs leading-tight ${getColorClass(severity)} ${className || ''}`.trim();

  // Renderiza o div da mensagem APENAS se 'message' existir
  // Não há container externo nem min-h aqui.
  return message ? (
    <div
      id={id}
      className={textClasses}
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  ) : null; // Retorna null se não houver mensagem, não renderizando nada
};