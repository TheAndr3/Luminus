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
  
  // Detecta cliques em links para mostrar loading imediatamente
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      // Verifica se é um link tradicional
      if (link && link.href && !link.href.includes('#') && !link.target) {
        const currentUrl = window.location.origin + pathname;
        
        if (link.href !== currentUrl) {
          setIsNavigating(true);
        }
      }
      
      // Verifica se é um elemento clicável que pode ter navegação
      const clickableElement = target.closest('[onclick], [data-navigate], button, [role="button"], .cursor-pointer');
      if (clickableElement) {
        // Nova lógica robusta para ignorar botões de ação, alternância, download/exportação e botões em modais/dialogs
        const isButton = clickableElement.tagName === 'BUTTON';
        const isRoleButton = clickableElement.getAttribute('role') === 'button';
        const isTabIndexButton = (clickableElement as HTMLElement).tabIndex === 0;
        const isInsideModal = clickableElement.closest('.modal, [role="dialog"], .DialogContent, .exportDownloadDialog, .archiveConfirmation, .ConfirmDeleteDialog, .importDossierDialog');
        const isInsideExportDialog = clickableElement.closest('.exportDownloadDialog');
        const isDownloadButton =
          ((clickableElement as HTMLElement).innerText && /baixar|exportar|download/i.test((clickableElement as HTMLElement).innerText)) ||
          clickableElement.querySelector('svg[data-lucide="download"]') ||
          clickableElement.className && clickableElement.className.toString().includes('download');
        const isViewToggleButton =
          clickableElement.className &&
          (clickableElement.className.toString().includes('LayoutGrid') || clickableElement.className.toString().includes('List'));
        
        // Detecção específica para botões de download/exportação que fazem navegação temporária
        const hasDownloadTitle = clickableElement.getAttribute('title') && 
          /baixar|exportar|download|csv/i.test(clickableElement.getAttribute('title')!.toLowerCase());
        const hasDownloadIcon = clickableElement.querySelector('svg[data-lucide="download"], svg[data-lucide="file-text"], svg[data-lucide="download-cloud"]');
        const isDownloadAction = hasDownloadTitle || hasDownloadIcon || isDownloadButton;
        
        // Verificar se está dentro de contexto de download/exportação
        const isInsideDownloadContext = clickableElement.closest('[class*="download"], [class*="export"], [class*="csv"], [data-action*="download"], [data-action*="export"]');
        
        // Verificar se tem onClick relacionado a download/exportação
        const hasDownloadOnClick = clickableElement.getAttribute('onClick') && 
          /download|export|csv|baixar|exportar/i.test(clickableElement.getAttribute('onClick')!);
        const parentHasDownloadOnClick = clickableElement.closest('[onClick*="download"], [onClick*="export"], [onClick*="csv"], [onClick*="baixar"], [onClick*="exportar"]');
        
        // Detecção específica para botões de editar dossiê (deve acionar loading)
        const isEditDossierButton = clickableElement.getAttribute('title') === 'Editar Dossiê';
        
        // Detecção específica para botões de baixar que NÃO devem acionar loading
        const isDownloadButtonInList = clickableElement.getAttribute('title') === 'Baixar CSV' || 
                                     clickableElement.getAttribute('title') === 'Download CSV da Turma' ||
                                     clickableElement.getAttribute('title') === 'Exportar Dossiê';
        
        // Detecção específica para botões de baixar em listClass e gridClass (devem acionar loading por 0.01s)
        const isDownloadButtonInClassroom = clickableElement.getAttribute('title') === 'Baixar CSV' || 
                                          clickableElement.getAttribute('title') === 'Download CSV da Turma';
        
        // Detecção específica para botões de exportar dossiê (NÃO devem acionar loading)
        const isExportDossierButton = clickableElement.getAttribute('title') === 'Exportar Dossiê';
        
        // Lógica simplificada: só ignorar se for claramente um botão de ação/modal/alternância
        const shouldIgnore = isButton || isRoleButton || isTabIndexButton || isInsideModal || isViewToggleButton;
        
        // Para download/exportação, acionar loading mas parar rapidamente
        const isDownloadOrExport = isDownloadAction || isInsideDownloadContext || hasDownloadOnClick || parentHasDownloadOnClick || isInsideExportDialog;
        
        // Se for botão de editar dossiê, NÃO ignorar (deve acionar loading)
        if (isEditDossierButton) {
          setIsNavigating(true);
          return;
        }
        
        // Se for botão de baixar em listClass/gridClass, acionar loading por 0.01s
        if (isDownloadButtonInClassroom) {
          setIsNavigating(true);
          setTimeout(() => {
            setIsNavigating(false);
          }, 10);
          return;
        }
        
        // Se for botão de exportar dossiê em listDossie, ignorar (não acionar loading)
        if (isExportDossierButton) {
          return;
        }
        
        // Se for download/exportação em outros contextos, acionar loading mas parar após 0.5 segundos
        if (isDownloadOrExport) {
          setIsNavigating(true);
          setTimeout(() => {
            setIsNavigating(false);
          }, 500);
          return;
        }
        
        // Para outros botões, ignorar se não fizerem navegação real
        if (shouldIgnore) {
          return;
        }
        
        // Verifica se é um botão com texto que indica ação de modal
        const buttonText = clickableElement.textContent?.toLowerCase() || '';
        const isModalActionButton = buttonText.includes('cancelar') || 
                                  buttonText.includes('fechar') || 
                                  buttonText.includes('ok') ||
                                  buttonText.includes('confirmar') ||
                                  buttonText.includes('salvar') ||
                                  buttonText.includes('editar') ||
                                  buttonText.includes('excluir') ||
                                  buttonText.includes('deletar') ||
                                  buttonText.includes('importar') ||
                                  buttonText.includes('exportar') ||
                                  buttonText.includes('adicionar') ||
                                  buttonText.includes('criar');
        
        if (!isModalActionButton) {
          // Se tem onclick ou parece ser um botão de navegação, mostra loading
          if ((clickableElement as HTMLElement).onclick || 
              clickableElement.getAttribute('data-navigate') ||
              clickableElement.className.includes('cursor-pointer') ||
              clickableElement.className.includes('hover:')) {
            setIsNavigating(true);
          }
        }
      }
    };

    // Detecta cliques em toda a aplicação
    document.addEventListener('click', handleClick, true); // Usa fase de captura
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