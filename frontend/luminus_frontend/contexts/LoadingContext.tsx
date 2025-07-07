'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface LoadingContextType {
  isNavigating: boolean;
  setIsNavigating: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  
  console.log('LoadingProvider mounted, pathname:', pathname); // Debug

  // Detecta cliques em links para mostrar loading imediatamente
  useEffect(() => {
    console.log('Setting up click listener'); // Debug
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      console.log('Click detected on:', target.tagName, target.className); // Debug
      
      // Verifica se é um link tradicional
      if (link && link.href && !link.href.includes('#') && !link.target) {
        const currentUrl = window.location.origin + pathname;
        console.log('Link clicked:', link.href, 'Current:', currentUrl); // Debug
        
        if (link.href !== currentUrl) {
          console.log('Setting navigation to true (link)'); // Debug
          setIsNavigating(true);
        }
      }
      
      // Verifica se é um elemento clicável que pode ter navegação
      const clickableElement = target.closest('[onclick], [data-navigate], button, [role="button"], .cursor-pointer');
      if (clickableElement) {
        console.log('Clickable element detected:', clickableElement.tagName, clickableElement.className); // Debug
        
        // Verifica se é um botão que abre pop-up (deve ser ignorado)
        const isPopupButton = 
          // Verifica se está dentro de um modal/popup aberto
          clickableElement.closest('[data-state="open"], [aria-expanded="true"]') ||
          // Verifica se tem atributos específicos de pop-up
          clickableElement.getAttribute('data-modal') ||
          clickableElement.getAttribute('data-popup') ||
          clickableElement.getAttribute('aria-haspopup') ||
          clickableElement.getAttribute('aria-expanded') ||
          // Verifica se tem classes específicas de pop-up
          clickableElement.className.includes('modal') ||
          clickableElement.className.includes('popup') ||
          clickableElement.className.includes('dropdown') ||
          clickableElement.className.includes('dialog') ||
          // Verifica se é um DialogTrigger ou AlertDialogTrigger
          clickableElement.closest('[data-slot*="trigger"]') ||
          // Verifica se tem classes específicas de botões de ação que abrem pop-ups
          clickableElement.className.includes('hover:text-yellow-400') ||
          // Verifica se é um botão de fechar modal
          clickableElement.className.includes('sr-only') ||
          // Verifica se tem título específico de ações
          clickableElement.getAttribute('title')?.includes('Editar') ||
          clickableElement.getAttribute('title')?.includes('Excluir') ||
          clickableElement.getAttribute('title')?.includes('Download') ||
          clickableElement.getAttribute('title')?.includes('Exportar') ||
          clickableElement.getAttribute('title')?.includes('Arquivar') ||
          // Verifica se tem aria-label específico de ações
          clickableElement.getAttribute('aria-label')?.includes('Editar') ||
          clickableElement.getAttribute('aria-label')?.includes('Excluir') ||
          clickableElement.getAttribute('aria-label')?.includes('Download') ||
          clickableElement.getAttribute('aria-label')?.includes('Exportar') ||
          clickableElement.getAttribute('aria-label')?.includes('Arquivar') ||
          // Verifica se tem texto específico de botões que abrem modais
          clickableElement.textContent?.includes('Adicionar') ||
          clickableElement.textContent?.includes('Criar') ||
          clickableElement.textContent?.includes('Importar') ||
          clickableElement.textContent?.includes('Associar') ||
          clickableElement.textContent?.includes('Cancelar') ||
          // Verifica se tem classes específicas de botões de modal
          clickableElement.className.includes('bg-gray-300') ||
          clickableElement.className.includes('bg-gray-900') ||
          clickableElement.className.includes('rounded-full') ||
          // Verifica se tem classes específicas de botões de ação
          clickableElement.className.includes('hover:bg-gray-800') ||
          clickableElement.className.includes('hover:bg-gray-400') ||
          // Verifica se tem classes específicas de botões de edição
          clickableElement.className.includes('border-gray-900') ||
          clickableElement.className.includes('ml-50') ||
          // Verifica se tem classes específicas de botões de modal
          clickableElement.className.includes('modal') ||
          clickableElement.className.includes('dialog') ||
          // Verifica se tem classes específicas de botões de ação
          clickableElement.className.includes('action') ||
          clickableElement.className.includes('button') ||
          // Verifica se tem classes específicas de botões de fechar
          clickableElement.className.includes('close') ||
          clickableElement.className.includes('cancel');
        
        if (!isPopupButton) {
          // Se tem onclick ou parece ser um botão de navegação, mostra loading
          if ((clickableElement as HTMLElement).onclick || 
              clickableElement.getAttribute('data-navigate') ||
              clickableElement.className.includes('cursor-pointer') ||
              clickableElement.className.includes('hover:')) {
            console.log('Setting navigation to true (clickable)'); // Debug
            setIsNavigating(true);
          }
        } else {
          console.log('Ignoring popup button:', clickableElement.tagName, clickableElement.className, clickableElement.getAttribute('title'), clickableElement.textContent); // Debug
        }
      }
    };

    // Detecta cliques em toda a aplicação
    document.addEventListener('click', handleClick, true); // Use capture phase
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname]);

  // Para o loading quando a rota muda (página carregou)
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  return (
    <LoadingContext.Provider value={{ isNavigating, setIsNavigating }}>
      {children}
    </LoadingContext.Provider>
  );
}; 