// src/pages/DossierAppPage.tsx
"use client" // Diretiva do Next.js para indicar que este é um Componente do Cliente

// Importações de bibliotecas React e Next.js
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Head from 'next/head'; // Componente para manipular o <head> do HTML da página

// Importações de componentes customizados da aplicação
import PageHeader from '../../../../components/dossier/PageHeader';
import DossierHeader from '../../../../components/dossier/DossierHeader';
import SectionList from '../../../../components/dossier/SectionList';
import ActionSidebar from '../../../../components/dossier/ActionSidebar';

// Importações de tipos e funções de utilidade específicas do dossiê
import { SectionData, ItemData, EvaluationConcept, adaptDossierStateToPayload } from '../../../../types/dossier';
// IMPORTANTE PARA O BACKEND: Esta importação (createDossier) é um exemplo de como um serviço de API pode ser chamado.
// O backend definirá a assinatura e o comportamento real desta função.
import { createDossier, CreateDossierPayload } from '../../../../services/dossierServices';

// Importação de estilos CSS Modules para este componente
import styles from './DossierCRUDPage.module.css';

// --- Dados Iniciais para o Dossiê (Mock/Placeholder) ---
// MOCK: Título inicial do dossiê. Em um cenário real, para um novo dossiê, isso poderia ser uma string vazia ou um placeholder.
// Se estiver carregando um dossiê existente, estes dados viriam da API.
const initialDossierTitleData = "Dossiê Exemplo Avançado";
// MOCK: Descrição inicial do dossiê. Similar ao título.
const initialDossierDescriptionData = "Descrição detalhada do dossiê, com múltiplos tópicos e itens editáveis.";
// MOCK: Conceito de avaliação inicial. Similar ao título.
const initialEvaluationConcept: EvaluationConcept = 'numerical';
// MOCK: Lista inicial de seções e itens. Para um novo dossiê, isso geralmente seria um array vazio ou com uma seção/item padrão.
// Se estiver carregando um dossiê existente, estes dados viriam da API.
const initialSectionsDataList: SectionData[] = [
  {
    id: 'section-alpha', // MOCK: IDs gerados no frontend. A API pode retornar IDs ao salvar, ou o frontend pode enviar IDs temporários.
    title: 'Primeira Seção Editável',
    description: 'Esta é a descrição da primeira seção. Ela pode ser editada no modo de edição.',
    weight: '50', // Peso da seção (ex: 50%)
    items: [
      { id: 'item-alpha-1', description: 'Critério de Avaliação A', value: 'N/A' }, // Itens dentro da seção
      { id: 'item-alpha-2', description: 'Observação sobre o item A', value: 'N/A' },
    ],
  },
  {
    id: 'section-beta', // MOCK: IDs
    title: 'Segunda Seção Dinâmica',
    description: 'Descrição para a seção beta, explicando seu propósito ou conteúdo.',
    weight: '30',
    items: [
      { id: 'item-beta-1', description: 'Desempenho em Projeto X', value: 'N/A' },
      { id: 'item-beta-2', description: 'Participação em Reuniões', value: 'N/A' },
      { id: 'item-beta-3', description: 'Feedback Recebido', value: 'N/A' },
    ],
  },
  {
    id: 'section-gamma', // MOCK: IDs
    title: 'Terceira Seção Longa para Scroll',
    description: 'Uma descrição mais longa para esta seção, testando o layout com múltiplas linhas.',
    weight: '20',
    items: [
      { id: 'item-gamma-1', description: 'Item Gamma 1', value: 'N/A' },
      { id: 'item-gamma-2', description: 'Item Gamma 2', value: 'N/A' },
      { id: 'item-gamma-3', description: 'Item Gamma 3', value: 'N/A' },
    ],
  },
];


// --- Componente Principal da Página ---
const DossierAppPage: React.FC = () => {
  // --- Estados do Componente ---
  // MOCK: Os valores iniciais para estes estados são os dados mockados acima.
  // Em um cenário de edição de um dossiê existente, estes estados seriam populados com dados da API (provavelmente em um useEffect no início do componente).
  const [dossierTitle, setDossierTitle] = useState(initialDossierTitleData);
  const [dossierDescription, setDossierDescription] = useState(initialDossierDescriptionData);
  const [evaluationConcept, setEvaluationConcept] = useState<EvaluationConcept>(initialEvaluationConcept);
  const [sectionsData, setSectionsData] = useState<SectionData[]>(initialSectionsDataList);
  // Estado para controlar o modo de edição da página
  const [isEditingMode, setIsEditingMode] = useState(true);

  // Estados para controlar a seleção visual e o foco
  const [selectedSectionIdForStyling, setSelectedSectionIdForStyling] = useState<string | null>(null); // ID da seção selecionada para destaque visual
  const [selectedItemIdGlobal, setSelectedItemIdGlobal] = useState<string | null>(null); // ID do item selecionado globalmente

  // Refs para manipulação de DOM e controle de comportamento
  const focusedElementRef = useRef<HTMLElement | null>(null); // Referência ao elemento HTML atualmente focado
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Referência para o timeout usado no gerenciamento de "blur"
  const ignoreNextBlurRef = useRef(false); // Flag para controlar se o próximo evento de "blur" deve ser ignorado

  // Estados e Refs para o posicionamento da ActionSidebar
  const [sidebarTargetTop, setSidebarTargetTop] = useState<number | null>(null); // Posição 'top' calculada para a ActionSidebar
  const scrollableAreaRef = useRef<HTMLDivElement>(null); // Referência à área rolável principal do conteúdo
  const sidebarHeightEstimate = 240; // Altura estimada da ActionSidebar, usada para cálculos de posicionamento
  // MOCK: MOCK_PROFESSOR_ID - Em produção, este ID viria do usuário autenticado/contexto da sessão.
  // IMPORTANTE PARA O BACKEND: Este ID é um exemplo de dado que o frontend precisa enviar para identificar o proprietário/autor do dossiê.
  const MOCK_PROFESSOR_ID = 1;

  // Estado para garantir que o código dependente do cliente (ex: window) só rode após a montagem no cliente
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true); // Define como true após a primeira renderização no cliente
  }, []); // Roda apenas uma vez após a montagem

  // --- Funções de Callback e Manipuladores de Evento (memoizados com useCallback) ---

  // Função para limpar o timeout de blur e sinalizar para ignorar o próximo evento de blur.
  const clearBlurTimeoutAndSignalIgnore = useCallback(() => {
    if (blurTimeoutRef.current) {
      // MOCK: Log de depuração. Pode ser removido em produção.
      console.log('%cDEBUG: clearBlurTimeoutAndSignalIgnore CALLED - Clearing timeout', 'color: orange; font-weight:bold;');
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    // MOCK: Log de depuração. Pode ser removido em produção.
    console.log('%cDEBUG: clearBlurTimeoutAndSignalIgnore - Setting ignoreNextBlurRef to true', 'color: orange; font-weight:bold;');
    ignoreNextBlurRef.current = true;
  }, []);

  // Manipulador de foco para campos editáveis (título, descrição, itens).
  const handleFieldFocus = useCallback((element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => {
    // MOCK: Log de depuração. Pode ser removido em produção.
    console.log('%cDEBUG: handleFieldFocus CALLED', 'color: blue;', { elementId: element.id, context, isEditingMode });
    if (!isEditingMode) return; // Só processa o foco se estiver em modo de edição

    // MOCK: Logs de depuração comentados. Podem ser removidos.
    // console.log('%cDEBUG: handleFieldFocus - Current ignoreNextBlurRef:', 'color: blue;', ignoreNextBlurRef.current);
    // if (ignoreNextBlurRef.current) {
    //     console.log('%cDEBUG: handleFieldFocus - Resetting ignoreNextBlurRef to false because new field is focused.', 'color: blue;');
    //     ignoreNextBlurRef.current = false;
    // }

    if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
        // MOCK: Log de depuração comentado.
        // console.log('%cDEBUG: handleFieldFocus - Cleared pending blur timeout from previous field', 'color: blue;');
    }

    focusedElementRef.current = element; // Armazena o elemento focado

    // Atualiza os IDs selecionados com base no contexto do foco
    if (context.type === 'item') {
      setSelectedItemIdGlobal(context.id);
      const sectionOfItem = sectionsData.find((s: SectionData) =>
        Array.isArray(s.items) && s.items.some((item: ItemData) => item.id === context.id)
      );
      if (sectionOfItem) {
        setSelectedSectionIdForStyling(sectionOfItem.id);
      } else {
        setSelectedSectionIdForStyling(null);
      }
    } else if (context.type === 'section') {
      setSelectedSectionIdForStyling(context.id);
      setSelectedItemIdGlobal(null);
    } else {
        setSelectedItemIdGlobal(null);
        setSelectedSectionIdForStyling(null);
    }
  }, [isEditingMode, sectionsData]);

  // Manipulador de "blur" (perda de foco) para campos editáveis.
  const handleFieldBlur = useCallback(() => {
    // MOCK: Log de depuração. Pode ser removido em produção.
    console.log('%cDEBUG: handleFieldBlur CALLED for element:', 'color: red;', focusedElementRef.current?.id);

    blurTimeoutRef.current = setTimeout(() => {
      if (ignoreNextBlurRef.current) {
        // MOCK: Log de depuração. Pode ser removido em produção.
        console.log('%cDEBUG: handleFieldBlur TIMEOUT - IGNORING BLUR due to ignoreNextBlurRef=true', 'color: red; font-weight: bold;');
        ignoreNextBlurRef.current = false;
        return;
      }
      // MOCK: Log de depuração. Pode ser removido em produção.
      console.log('%cDEBUG: handleFieldBlur TIMEOUT EXECUTED - Clearing focus and selections', 'color: red; font-weight: bold;');
      focusedElementRef.current = null;
      setSelectedItemIdGlobal(null);
      setSelectedSectionIdForStyling(null);
      setSidebarTargetTop(null); // Esconde a ActionSidebar
    }, 100); // Pequeno delay para permitir que outras interações ocorram
  }, []);


  // Manipulador para seleção de um item (clique em um SectionItem).
  const handleItemSelect = useCallback((itemId: string) => {
     if (!isEditingMode) return;
     if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
     ignoreNextBlurRef.current = false;

     if (selectedItemIdGlobal === itemId) {
         setSelectedItemIdGlobal(null);
         setSelectedSectionIdForStyling(null);
          focusedElementRef.current = null;
          setSidebarTargetTop(null);
     } else {
         setSelectedItemIdGlobal(itemId);
          const sectionOfItem = sectionsData.find((sec: SectionData) =>
            Array.isArray(sec.items) && sec.items.some((item: ItemData) => item.id === itemId)
          );
          if (sectionOfItem) {
              setSelectedSectionIdForStyling(sectionOfItem.id);
          } else {
              setSelectedSectionIdForStyling(null);
          }
          focusedElementRef.current = null;
          setSidebarTargetTop(null);
     }
  }, [isEditingMode, sectionsData, selectedItemIdGlobal]);

  // Manipulador para clique na área de uma seção (não em um item ou campo editável).
  const handleSectionAreaClick = useCallback((sectionId: string) => {
     if (!isEditingMode) return;
     if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
     ignoreNextBlurRef.current = false;

      if (selectedSectionIdForStyling === sectionId) {
          setSelectedSectionIdForStyling(null);
      } else {
          setSelectedSectionIdForStyling(sectionId);
      }
     setSelectedItemIdGlobal(null);
     focusedElementRef.current = null;
     setSidebarTargetTop(null);
  }, [isEditingMode, selectedSectionIdForStyling]);

  // useEffect para posicionamento da ActionSidebar quando um campo de item está focado.
  // Também lida com o reposicionamento da sidebar durante o scroll.
  useEffect(() => {
    if (!isClient || typeof window === 'undefined' || !scrollableAreaRef.current) {
        if (sidebarTargetTop !== null) setSidebarTargetTop(null);
        return;
    }
    const focusedElement = focusedElementRef.current;
    const scrollableAreaElement = scrollableAreaRef.current;
    const isItemFieldFocused = focusedElement instanceof HTMLElement &&
                               focusedElement.closest(`[id^="dossier-item-"]`) instanceof HTMLElement;
    if (!isEditingMode || !isItemFieldFocused) {
      if (sidebarTargetTop !== null) {
        setSidebarTargetTop(null);
      }
      return;
    }
    const parentItemElement = focusedElement.closest(`[id^="dossier-item-"]`) as HTMLElement;
    if (!parentItemElement) {
        if (sidebarTargetTop !== null) setSidebarTargetTop(null);
        return;
    }
    const parentItemRect = parentItemElement.getBoundingClientRect();
    const scrollAreaRect = scrollableAreaElement.getBoundingClientRect();
    const itemTopRelativeToScrollAreaViewport = parentItemRect.top - scrollAreaRect.top;
    const itemTopRelativeToScrollAreaContent = itemTopRelativeToScrollAreaViewport + scrollableAreaElement.scrollTop;
    let finalSidebarTop = itemTopRelativeToScrollAreaContent + (parentItemRect.height / 2) - (sidebarHeightEstimate / 2);
    const minTop = 5;
    const maxTop = scrollableAreaElement.scrollHeight > sidebarHeightEstimate + 5
                   ? scrollableAreaElement.scrollHeight - sidebarHeightEstimate - 5
                   : minTop;
    finalSidebarTop = Math.max(minTop, Math.min(finalSidebarTop, maxTop));
    if (finalSidebarTop !== sidebarTargetTop) {
        setSidebarTargetTop(finalSidebarTop);
    }
    const handleScroll = () => {
       if (!isClient) return;
       const currentTargetElement = focusedElementRef.current;
       const currentScrollableAreaElement = scrollableAreaRef.current;
       const isCurrentItemFieldFocused = currentTargetElement instanceof HTMLElement &&
                                         currentTargetElement.closest(`[id^="dossier-item-"]`) instanceof HTMLElement;
        if (!isEditingMode || !currentScrollableAreaElement || !isCurrentItemFieldFocused) {
             currentScrollableAreaElement?.removeEventListener('scroll', handleScroll);
             if (sidebarTargetTop !== null) setSidebarTargetTop(null);
             return;
       }
        const currentParentItemElement = currentTargetElement.closest(`[id^="dossier-item-"]`) as HTMLElement;
        if (currentParentItemElement) {
            const currentParentItemRect = currentParentItemElement.getBoundingClientRect();
            const currentScrollAreaRect = currentScrollableAreaElement.getBoundingClientRect();
            const currentItemTopRelativeToScrollAreaViewport = currentParentItemRect.top - currentScrollAreaRect.top;
            const currentItemTopRelativeToScrollAreaContent = currentItemTopRelativeToScrollAreaViewport + currentScrollableAreaElement.scrollTop;
            let currentTargetTop = currentItemTopRelativeToScrollAreaContent + (currentParentItemRect.height / 2) - (sidebarHeightEstimate / 2);
            currentTargetTop = Math.max(minTop, Math.min(currentTargetTop, maxTop));
            if (currentTargetTop !== sidebarTargetTop) setSidebarTargetTop(currentTargetTop);
       } else {
            if (sidebarTargetTop !== null) setSidebarTargetTop(null);
       }
    };
    scrollableAreaElement.addEventListener('scroll', handleScroll);
    return () => {
        scrollableAreaElement.removeEventListener('scroll', handleScroll);
    };
  }, [focusedElementRef.current, isEditingMode, sidebarHeightEstimate, sectionsData, sidebarTargetTop, isClient]);


  // --- Manipuladores de Ações da UI (PageHeader, DossierHeader) ---
  // MOCK: Ação de voltar, atualmente apenas loga. Em produção, usaria o router do Next.js ou outra lógica de navegação.
  const handleBackClick = useCallback(() => { console.log('Navigate back'); }, []);

  const handleToggleEditMode = useCallback(() => {
    setIsEditingMode(prev => {
      if (prev) { // Se estava saindo do modo de edição
        if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
        ignoreNextBlurRef.current = false;
        focusedElementRef.current = null;
        setSelectedItemIdGlobal(null);
        setSelectedSectionIdForStyling(null);
        setSidebarTargetTop(null); // Esconde a sidebar
      }
      return !prev; // Alterna o modo de edição
    });
  }, []);

  // Manipuladores para alterações nos campos do DossierHeader
  const handleDossierTitleChange = useCallback((newTitle: string) => { setDossierTitle(newTitle); }, []);
  const handleDossierDescriptionChange = useCallback((newDescription: string) => { setDossierDescription(newDescription); }, []);
  const handleEvaluationConceptChange = useCallback((concept: EvaluationConcept) => { setEvaluationConcept(concept); }, []);

  // Manipuladores para alterações nos campos das Seções
  const handleSectionDescriptionChange = useCallback((sectionId: string, newDescription: string) => {
    setSectionsData(prev => prev.map((sec: SectionData) => (sec.id === sectionId ? { ...sec, description: newDescription } : sec)));
  }, []);
  const handleSectionTitleChange = useCallback((sectionId: string, newTitle: string) => {
    setSectionsData(prev => prev.map((sec: SectionData) => (sec.id === sectionId ? { ...sec, title: newTitle } : sec)));
  }, []);
  const handleSectionWeightChange = useCallback((sectionId: string, newWeight: string) => {
    setSectionsData(prev => prev.map((sec: SectionData) => (sec.id === sectionId ? { ...sec, weight: newWeight } : sec)));
  }, []);

  // Manipulador para alterações nos campos dos Itens
  const handleItemChange = useCallback(
    (sectionId: string, itemId: string, field: 'description' | 'value', newValue: string) => {
      setSectionsData(prev =>
        prev.map((sec: SectionData) =>
          sec.id === sectionId
            ? { ...sec, items: Array.isArray(sec.items) ? sec.items.map((item: ItemData) => item.id === itemId ? { ...item, [field]: newValue } : item) : [] }
            : sec
        )
      );
    }, []);

  // --- Manipuladores de Ações da ActionSidebar ---
  // Adiciona uma nova seção.
  const handleAddNewSectionForSidebar = useCallback(() => {
    // MOCK: Log de depuração.
    console.log('%cACTION: handleAddNewSectionForSidebar: START', 'color: #2E8B57; font-weight: bold;', { selectedItemIdGlobal, selectedSectionIdForStyling });
    if (!isEditingMode) return;

    // MOCK: IDs gerados no frontend com Date.now() e Math.random().
    // Em um sistema real, o backend pode gerar e retornar IDs após a criação, ou o frontend pode usar UUIDs mais robustos.
    const newSectionId = `section-${Date.now()}`;
    const newItemId = `item-${newSectionId}-init-${Math.random().toString(36).substr(2, 5)}`;
    const newSectionData: SectionData = { id: newSectionId, title: `Nova Seção (${newSectionId.slice(-4)})`, description: ``, weight: '0', items: [{ id: newItemId, description: 'Novo item', value: 'N/A' }]};

    let newSectionsList = [...sectionsData];
    let targetSectionIndex = -1;
    let currentTargetIdForNewSection = selectedSectionIdForStyling;

    if (!currentTargetIdForNewSection && selectedItemIdGlobal) {
       const sectionOfSelectedItem = sectionsData.find(s => Array.isArray(s.items) && s.items.some(item => item.id === selectedItemIdGlobal));
       if(sectionOfSelectedItem) currentTargetIdForNewSection = sectionOfSelectedItem.id;
    }

    if (currentTargetIdForNewSection) {
        targetSectionIndex = sectionsData.findIndex(sec => sec.id === currentTargetIdForNewSection);
    }

    if (targetSectionIndex !== -1) {
      newSectionsList.splice(targetSectionIndex + 1, 0, newSectionData);
    } else {
      newSectionsList.push(newSectionData);
    }

    setSectionsData(newSectionsList);
    setSelectedItemIdGlobal(null);
    setSelectedSectionIdForStyling(newSectionId);

     requestAnimationFrame(() => {
         if (typeof document === 'undefined') return;
         const titleInputOfNewSection = document.querySelector(`#dossier-section-${newSectionId} input[aria-label*="Título da seção"]`) as HTMLInputElement | null;
         if (titleInputOfNewSection) {
            titleInputOfNewSection.focus();
         } else {
             const newItemElement = document.getElementById(`dossier-item-${newItemId}`);
             if (newItemElement) {
                 const editableField = newItemElement.querySelector('input, textarea') as HTMLElement | null;
                 if (editableField) editableField.focus();
             }
         }
     });
  }, [sectionsData, isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal]);

  // Adiciona um novo item à seção.
  const handleAddItemForSidebar = useCallback(() => {
    // MOCK: Log de depuração.
    console.log('%cACTION: handleAddItemForSidebar: START', 'color: #2E8B57; font-weight: bold;', { selectedItemIdGlobal, selectedSectionIdForStyling });
    if (!isEditingMode) return;

    let targetSectionId = selectedSectionIdForStyling;
    if (!targetSectionId && selectedItemIdGlobal) {
        const sectionOfItem = sectionsData.find(s => Array.isArray(s.items) && s.items.some(it => it.id === selectedItemIdGlobal));
        if (sectionOfItem) targetSectionId = sectionOfItem.id;
    }

    if (!targetSectionId) {
      // MOCK: Log de aviso.
      console.warn("handleAddItemForSidebar: No target section identified.");
      return;
    }

    // MOCK: IDs gerados no frontend.
    const newItemId = `item-${targetSectionId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setSectionsData(prev => prev.map(sec =>
        sec.id === targetSectionId
          ? { ...sec, items: [...(Array.isArray(sec.items) ? sec.items : []), { id: newItemId, description: 'Novo Item', value: 'N/A' }] }
          : sec
    ));

    setSelectedSectionIdForStyling(targetSectionId);
    setSelectedItemIdGlobal(newItemId);

     requestAnimationFrame(() => {
         if (typeof document === 'undefined') return;
         const newItemElement = document.getElementById(`dossier-item-${newItemId}`);
         if (newItemElement) {
             const editableField = newItemElement.querySelector('input, textarea') as HTMLElement | null;
             if (editableField) editableField.focus();
         }
     });
  }, [sectionsData, isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal]);

  // Deleta o item atualmente selecionado.
  const handleDeleteItemForSidebar = useCallback(() => {
    // MOCK: Log de depuração.
    console.log('%cACTION: handleDeleteItemForSidebar: START', 'color: #DC143C; font-weight: bold;', { selectedItemIdGlobal });
    if (!isEditingMode || !selectedItemIdGlobal) return;

    const currentSelectedItemId = selectedItemIdGlobal;
    const sectionOfItem = sectionsData.find(s => Array.isArray(s.items) && s.items.some(i => i.id === currentSelectedItemId));
    if (!sectionOfItem) return;

    const currentSelectedSectionId = sectionOfItem.id;
    let finalSections: SectionData[] = [];

    setSectionsData(prev => {
      const sectionsWithItemRemoved = prev.map(sec =>
        sec.id === currentSelectedSectionId
          ? { ...sec, items: Array.isArray(sec.items) ? sec.items.filter(item => item.id !== currentSelectedItemId) : [] }
          : sec
      );
      const sectionAfterItemDelete = sectionsWithItemRemoved.find(sec => sec.id === currentSelectedSectionId);
      const sectionIsEmpty = sectionAfterItemDelete && Array.isArray(sectionAfterItemDelete.items) && sectionAfterItemDelete.items.length === 0;
      if (sectionIsEmpty && sectionsWithItemRemoved.length > 1) {
        finalSections = sectionsWithItemRemoved.filter(sec => sec.id !== currentSelectedSectionId);
      } else {
        finalSections = sectionsWithItemRemoved;
      }
      return finalSections;
    });

    setSelectedItemIdGlobal(null);
    const sectionStillExists = finalSections.some(s => s.id === currentSelectedSectionId);
    if (!sectionStillExists) setSelectedSectionIdForStyling(null);

    focusedElementRef.current = null;
    setSidebarTargetTop(null);
  }, [sectionsData, isEditingMode, selectedItemIdGlobal]);

  // Deleta a seção atualmente selecionada/focada.
  const handleDeleteSectionForSidebar = useCallback(() => {
    // MOCK: Log de depuração.
    console.log('%cACTION: handleDeleteSectionForSidebar: START', 'color: #DC143C; font-weight: bold;', { selectedSectionIdForStyling, selectedItemIdGlobal });

    let targetSectionIdToDelete = selectedSectionIdForStyling;
    if(!targetSectionIdToDelete && selectedItemIdGlobal) {
        const sectionOfItem = sectionsData.find(s => Array.isArray(s.items) && s.items.some(it => it.id === selectedItemIdGlobal));
        if(sectionOfItem) targetSectionIdToDelete = sectionOfItem.id;
    }

    if (!isEditingMode || !targetSectionIdToDelete || sectionsData.length <= 1) return;

    const originalSectionOfSelectedItem = selectedItemIdGlobal ? sectionsData.find(s => Array.isArray(s.items) && s.items.some(it => it.id === selectedItemIdGlobal)) : undefined;

    setSectionsData(prev => prev.filter(sec => sec.id !== targetSectionIdToDelete));

    if (originalSectionOfSelectedItem && originalSectionOfSelectedItem.id === targetSectionIdToDelete) {
        setSelectedItemIdGlobal(null);
    }
    setSelectedSectionIdForStyling(null);
    focusedElementRef.current = null;
    setSidebarTargetTop(null);
  }, [sectionsData, isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal]);

  // Manipulador para clique no botão de configurações do dossiê (no DossierHeader).
  const handleDossierSettingsClick = useCallback(() => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    ignoreNextBlurRef.current = false;
    // MOCK: Log de ação. Em um cenário real, poderia abrir um modal de configurações.
    console.log('Configurações do Dossiê (clicado via botão no header)');
  }, []);

  // ==========================================================================================
  // == IMPORTANTE PARA O BACKEND: PONTO PRINCIPAL DE INTERAÇÃO PARA SALVAR DADOS ==
  // Esta função `handleSave` é chamada pelo botão "Salvar Alterações".
  // É aqui que a lógica para enviar os dados do dossiê para a API do backend será implementada.
  // ==========================================================================================
  const handleSave = useCallback(async () => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    ignoreNextBlurRef.current = false;

    // --- Validações no Frontend (idealmente, o backend também deve ter suas próprias validações) ---
    // 1. Título do Dossiê não pode ser vazio
    if (!dossierTitle.trim()) {
      // MOCK: Usando `throw new Error`. Em produção, tratar erros de forma mais amigável para o usuário (ex: Toasts/Notificações).
      throw new Error("O título do Dossiê não pode ser vazio.");
    }

    // 2. ID do Professor não pode ser vazio
    // MOCK: MOCK_PROFESSOR_ID é usado aqui. Em produção, este ID deve vir do usuário autenticado.
    // A API precisará deste ID.
    if (!MOCK_PROFESSOR_ID) {
      throw new Error("O ID do Professor não pode ser vazio.");
    }

    // 3. Conceito de Avaliação deve ser selecionado
    if (!evaluationConcept) {
      throw new Error("Um Conceito de Avaliação deve ser selecionado.");
    }

    // 6. Dossiê deve ter pelo menos uma seção com um item/questão
    const hasSectionWithQuestion = sectionsData.some(sec => Array.isArray(sec.items) && sec.items.length > 0);
    if (!hasSectionWithQuestion) {
      throw new Error("O Dossiê deve conter pelo menos uma seção com um item/questão.");
    }

    // Validações por seção
    let totalWeight = 0;
    for (const sec of sectionsData) {
      // 5. Título da Seção não pode ser vazio
      if (!sec.title.trim()) {
        throw new Error(`A seção com ID "${sec.id}" não pode ter um título vazio.`);
      }

      // Validação: Descrição do Item não pode ser vazia
      if (Array.isArray(sec.items)) {
        for (const item of sec.items) {
          if (!item.description.trim()) {
            throw new Error(`O item com ID "${item.id}" na seção "${sec.title}" não pode ter a descrição vazia.`);
          }
        }
      }

      // Peso da seção deve ser um número válido
      const parsedWeight = parseInt(sec.weight, 10);
      if (isNaN(parsedWeight)) {
        throw new Error(`O peso da seção "${sec.title}" é inválido. Deve ser um número.`);
      }
      totalWeight += parsedWeight;
    }

    // 4. Soma dos pesos das seções deve ser 100%
    if (totalWeight !== 100) {
      throw new Error(`A soma dos pesos de todas as seções deve ser 100%, mas é ${totalWeight}%.`);
    }

    // Se todas as validações passarem, prossegue com o salvamento
    // IMPORTANTE PARA O BACKEND: A função `adaptDossierStateToPayload` transforma o estado do frontend
    // para o formato que a API do backend espera. A estrutura deste payload é crucial
    // e deve ser acordada entre frontend e backend.
    // Note que MOCK_PROFESSOR_ID é passado aqui.
    const payload: CreateDossierPayload = adaptDossierStateToPayload(
      dossierTitle, dossierDescription, evaluationConcept, sectionsData, MOCK_PROFESSOR_ID // MOCK: MOCK_PROFESSOR_ID
    );
    // MOCK: Log do payload. Remover ou usar condicionalmente em produção.
    console.log("Payload para o Backend:", payload);
    try {
      // IMPORTANTE PARA O BACKEND: ESTE É O LOCAL PARA A CHAMADA À API DE CRIAÇÃO/ATUALIZAÇÃO DO DOSSIÊ.
      // A linha `await createDossier(payload);` é onde a chamada real à API aconteceria.
      // Substitua a simulação abaixo pela chamada real ao seu serviço/API.
      // Exemplo:
      // const response = await createDossier(payload);
      // if (response && response.success) { // ou como quer que sua API retorne sucesso
      //   alert("Dossiê salvo com sucesso!"); // MOCK: Notificação de sucesso
      //   // Opcional: atualizar IDs no frontend se o backend os gerou/modificou
      // } else {
      //   throw new Error(response?.message || "Falha ao salvar dossiê na API.");
      // }

      // MOCK: Linha de exemplo para chamar o serviço (atualmente comentada). REMOVER ESTA LINHA COMENTADA EM PRODUÇÃO.
      // await createDossier(payload);

      // MOCK: Simulação de delay de rede. REMOVER EM PRODUÇÃO.
      await new Promise(resolve => setTimeout(resolve, 300));

      // MOCK: Usando `alert` para feedback. Substituir por um sistema de notificação de UI (toast, etc.).
      alert("Dossiê salvo com sucesso (simulado)!");
    } catch (error: any) {
      // MOCK: Usando `alert` para feedback de erro. Substituir por um sistema de notificação de UI.
      alert(`Falha ao salvar dossiê: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  // IMPORTANTE PARA O BACKEND: As dependências do useCallback incluem todos os estados que compõem o payload do dossiê.
  // MOCK_PROFESSOR_ID também é uma dependência (embora constante aqui, se fosse dinâmica, seria importante).
  }, [dossierTitle, dossierDescription, evaluationConcept, sectionsData, MOCK_PROFESSOR_ID]);


  // --- Lógica de UI derivada de estados (useMemo) ---
  // Determina se o botão de deletar item deve estar habilitado.
  const canDeleteItem = useMemo(() => {
    if (!selectedItemIdGlobal) {
      return false;
    }
    const sectionOfSelectedItem = sectionsData.find(s =>
      Array.isArray(s.items) && s.items.some(item => item.id === selectedItemIdGlobal)
    );
    if (!sectionOfSelectedItem) {
      return true;
    }
    const isLastItemInSection = sectionOfSelectedItem.items.length === 1 && sectionOfSelectedItem.items[0].id === selectedItemIdGlobal;
    const isOnlySection = sectionsData.length === 1;
    return !(isLastItemInSection && isOnlySection);
  }, [selectedItemIdGlobal, sectionsData]);

  // Determina se o botão de deletar seção deve estar habilitado.
  const canDeleteSection = useMemo(() => {
    const hasSelection = !!selectedSectionIdForStyling || !!selectedItemIdGlobal;
    const isMoreThanOneSection = sectionsData.length > 1;
    return hasSelection && isMoreThanOneSection;
  }, [selectedSectionIdForStyling, selectedItemIdGlobal, sectionsData.length]);


  // Determina se o elemento focado é um campo de item, para mostrar a ActionSidebar.
  const isFocusedElementAnItemField = isClient &&
                                     focusedElementRef.current instanceof HTMLElement &&
                                     focusedElementRef.current.closest(`[id^="dossier-item-"]`) instanceof HTMLElement;
  // Determina se a ActionSidebar deve ser mostrada.
  const showActionSidebar = isClient && isEditingMode && isFocusedElementAnItemField;

  // useEffect para logs de depuração relacionados à visibilidade da ActionSidebar (opcional)
  useEffect(() => {
    if(isClient){
        // MOCK: Log de depuração comentado. Pode ser removido.
        // console.log('%cDEBUG: showActionSidebar check:', 'color: #8A2BE2;', { /* ... logs ... */ });
    }
  }, [isEditingMode, focusedElementRef.current, isFocusedElementAnItemField, sidebarTargetTop, showActionSidebar, isClient]);


  // --- Renderização do Componente ---
  return (
    <>
      {/* Define o título da aba do navegador */}
      <Head><title>Dossiê CRUD - Avançado</title></Head>
      {/* Contêiner principal da aplicação */}
      <div className={styles.appContainer}>
        {/* Conteúdo principal */}
        <main className={styles.mainContent}>
          {/* Cabeçalho da Página */}
          <PageHeader
            isEditing={isEditingMode}
            onBackClick={handleBackClick} // MOCK: Ação de voltar
            onToggleEditMode={handleToggleEditMode}
            className={styles.pageHeader}
            backButtonClassName={styles.pageHeader_backButton}
            backButtonIconClassName={styles.pageHeader_backIcon}
            toggleButtonClassName={`${styles.pageHeader_toggleButtonBase} ${isEditingMode ? styles.pageHeader_toggleButtonEditing : styles.pageHeader_toggleButtonViewing}`}
            onFieldFocus={handleFieldFocus} // Passa o manipulador de foco
            onFieldBlur={handleFieldBlur}   // Passa o manipulador de blur
          />
          {/* Área rolável principal que contém o DossierHeader e SectionList */}
          <div ref={scrollableAreaRef} className={styles.scrollableArea}>
            {/* Cabeçalho do Dossiê */}
            <DossierHeader
              title={dossierTitle} // MOCK: Usa estado inicial mockado
              description={dossierDescription} // MOCK: Usa estado inicial mockado
              isEditing={isEditingMode}
              evaluationConcept={evaluationConcept} // MOCK: Usa estado inicial mockado
              onTitleChange={handleDossierTitleChange}
              onDescriptionChange={handleDossierDescriptionChange}
              onEvaluationConceptChange={handleEvaluationConceptChange}
              onSettingsClick={handleDossierSettingsClick} // MOCK: Ação de configurações
              showSettingsButton={isEditingMode && evaluationConcept !== 'numerical'}
              onFieldFocus={handleFieldFocus}
              onFieldBlur={handleFieldBlur}
              // Classes de estilização
              className={styles.dossierHeaderContainer}
              titleTextClassName={styles.dossierHeader_titleText}
              titleInputClassName={styles.dossierHeader_titleInput}
              evaluationConceptContainerClassName={styles.dossierHeader_evaluationConceptContainer}
              evaluationConceptLabelTextClassName={styles.dossierHeader_evaluationConceptLabelText}
              evaluationConceptRadioGroupClassName={styles.dossierHeader_evaluationRadioGroup}
              evaluationConceptRadioLabelClassName={styles.dossierHeader_evaluationRadioLabel}
              evaluationConceptRadioInputClassName={styles.dossierHeader_evaluationRadioInput}
              evaluationConceptDisplayClassName={styles.dossierHeader_evaluationConceptDisplay}
              titleDescriptionDividerClassName={styles.dossierHeader_divider}
              descriptionLabelClassName={styles.dossierHeader_descriptionLabel}
              descriptionTextClassName={styles.dossierHeader_descriptionTextDisplay}
              descriptionTextareaClassName={styles.dossierHeader_descriptionTextarea}
              evaluationAndSettingsClassName={styles.dossierHeader_evaluationAndSettings}
              settingsButtonClassName={styles.dossierHeader_settingsButton}
              settingsButtonIconClassName={styles.pageHeader_backIcon} // Reutiliza ícone
            />
            {/* Lista de Seções */}
            <SectionList
              sections={sectionsData} // MOCK: Usa estado inicial mockado
              isEditing={isEditingMode}
              selectedSectionIdForStyling={selectedSectionIdForStyling}
              selectedItemId={selectedItemIdGlobal}
              onSectionAreaClick={handleSectionAreaClick}
              onSectionTitleChange={handleSectionTitleChange}
              onSectionDescriptionChange={handleSectionDescriptionChange}
              onSectionWeightChange={handleSectionWeightChange}
              onItemChange={handleItemChange}
              onItemSelect={handleItemSelect}
              onFieldFocus={handleFieldFocus}
              onFieldBlur={handleFieldBlur}
              // Classes de estilização
              className={styles.sectionListContainer}
              sectionComponentClassName={styles.section_outerContainer}
              sectionComponentContentWrapperClassName={styles.section_contentWrapper}
              sectionComponentSelectedStylingClassName={styles.section_selectedStyling}
              sectionComponentTitleAndWeightContainerClassName={styles.section_titleAndWeightContainer}
              sectionComponentTitleContainerClassName={styles.section_titleContainer}
              sectionComponentTitleEditableFieldClassName={styles.editableField_inputBase}
              sectionComponentTitleTextClassName={styles.section_titleText}
              sectionComponentTitleInputClassName={styles.section_titleInput}
              sectionComponentDescriptionContainerClassName={styles.section_descriptionContainer}
              sectionComponentDescriptionEditableFieldClassName={styles.editableField_inputBase}
              sectionComponentDescriptionTextClassName={styles.section_descriptionText}
              sectionComponentDescriptionTextareaClassName={styles.section_descriptionTextarea}
              sectionComponentWeightFieldContainerClassName={styles.section_weightFieldContainer}
              sectionComponentWeightEditableFieldClassName={styles.editableField_inputBase}
              sectionComponentWeightTextClassName={styles.section_weightText}
              sectionComponentWeightInputClassName={styles.section_weightInput}
              sectionComponentItemsListClassName={styles.section_itemsList}
              sectionItemClassName={`${styles.sectionItem_container} ${isEditingMode ? styles.sectionItem_containerEditable : ''}`}
              sectionItemSelectedClassName={styles.sectionItem_selected}
              sectionItemDescriptionFieldContainerClassName={styles.sectionItem_descriptionFieldWrapper}
              sectionItemDescriptionTextDisplayClassName={styles.editableField_textDisplayItem}
              sectionItemDescriptionInputClassName={styles.editableField_inputItem}
            />
            {/* ActionSidebar (barra lateral de ações) - renderizada condicionalmente */}
            {isClient && showActionSidebar && (
              <ActionSidebar
                targetTopPosition={sidebarTargetTop}
                onAddItemToSection={handleAddItemForSidebar}
                onAddNewSection={handleAddNewSectionForSidebar}
                onDeleteItemFromSection={handleDeleteItemForSidebar}
                onDeleteSection={handleDeleteSectionForSidebar}
                canDeleteItem={canDeleteItem}
                canDeleteSection={canDeleteSection}
                onClearBlurTimeout={clearBlurTimeoutAndSignalIgnore}
                // Classes de estilização
                containerClassNameFromPage={styles.actionSidebarVisualBase}
                buttonClassNameFromPage={styles.actionSidebarButtonVisualBase}
                disabledButtonClassNameFromPage={styles.actionSidebarButtonDisabledVisualBase}
                iconClassNameFromPage={styles.actionSidebarIconVisualBase}
              />
            )}
          </div>
          {/* Ações no rodapé (ex: botão Salvar) - visível apenas em modo de edição */}
          {/* IMPORTANTE PARA O BACKEND: O botão abaixo dispara a função handleSave(), que é o ponto principal de interação com a API para salvar. */}
          {isEditingMode && (
            <div className={styles.footerActions}>
              <button onClick={handleSave} className={styles.saveButton}>Salvar Alterações</button>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

// Exporta o componente da página
export default DossierAppPage;