// src/pages/DossierAppPage.tsx
"use client"
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'; // Adicionado useMemo
import Head from 'next/head';

import PageHeader from '../../../../components/dossier/PageHeader';
import DossierHeader from '../../../../components/dossier/DossierHeader';
import SectionList from '../../../../components/dossier/SectionList';
import ActionSidebar from '../../../../components/dossier/ActionSidebar';

import { SectionData, ItemData, EvaluationConcept, adaptDossierStateToPayload } from '../../../../types/dossier';
import { createDossier, CreateDossierPayload } from '../../../../services/dossierServices'; 

import styles from './DossierCRUDPage.module.css';

const initialDossierTitleData = "Dossiê Exemplo Avançado";
const initialDossierDescriptionData = "Descrição detalhada do dossiê, com múltiplos tópicos e itens editáveis.";
const initialEvaluationConcept: EvaluationConcept = 'numerical';
const initialSectionsDataList: SectionData[] = [
  {
    id: 'section-alpha',
    title: 'Primeira Seção Editável',
    description: 'Esta é a descrição da primeira seção. Ela pode ser editada no modo de edição.',
    weight: '50',
    items: [
      { id: 'item-alpha-1', description: 'Critério de Avaliação A', value: 'N/A' },
      { id: 'item-alpha-2', description: 'Observação sobre o item A', value: 'N/A' },
    ],
  },
  {
    id: 'section-beta',
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
    id: 'section-gamma',
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


const DossierAppPage: React.FC = () => {
  const [dossierTitle, setDossierTitle] = useState(initialDossierTitleData);
  const [dossierDescription, setDossierDescription] = useState(initialDossierDescriptionData);
  const [evaluationConcept, setEvaluationConcept] = useState<EvaluationConcept>(initialEvaluationConcept);
  const [sectionsData, setSectionsData] = useState<SectionData[]>(initialSectionsDataList);
  const [isEditingMode, setIsEditingMode] = useState(true);

  const [selectedSectionIdForStyling, setSelectedSectionIdForStyling] = useState<string | null>(null);
  const [selectedItemIdGlobal, setSelectedItemIdGlobal] = useState<string | null>(null);

  const focusedElementRef = useRef<HTMLElement | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ignoreNextBlurRef = useRef(false); 

  const [sidebarTargetTop, setSidebarTargetTop] = useState<number | null>(null);
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  const sidebarHeightEstimate = 240;
  const MOCK_PROFESSOR_ID = 1;

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const clearBlurTimeoutAndSignalIgnore = useCallback(() => {
    if (blurTimeoutRef.current) {
      console.log('%cDEBUG: clearBlurTimeoutAndSignalIgnore CALLED - Clearing timeout', 'color: orange; font-weight:bold;');
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    console.log('%cDEBUG: clearBlurTimeoutAndSignalIgnore - Setting ignoreNextBlurRef to true', 'color: orange; font-weight:bold;');
    ignoreNextBlurRef.current = true; 
  }, []);

  const handleFieldFocus = useCallback((element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => {
    console.log('%cDEBUG: handleFieldFocus CALLED', 'color: blue;', { elementId: element.id, context, isEditingMode });
    if (!isEditingMode) return;

    // console.log('%cDEBUG: handleFieldFocus - Current ignoreNextBlurRef:', 'color: blue;', ignoreNextBlurRef.current);
    // if (ignoreNextBlurRef.current) {
    //     console.log('%cDEBUG: handleFieldFocus - Resetting ignoreNextBlurRef to false because new field is focused.', 'color: blue;');
    //     ignoreNextBlurRef.current = false;
    // }
    // O reset do ignoreNextBlurRef será feito no blurTimeout ou quando uma ação da sidebar explicitamente o fizer.

    if (blurTimeoutRef.current) { 
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
        // console.log('%cDEBUG: handleFieldFocus - Cleared pending blur timeout from previous field', 'color: blue;');
    }
    
    focusedElementRef.current = element; 

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

  const handleFieldBlur = useCallback(() => {
    console.log('%cDEBUG: handleFieldBlur CALLED for element:', 'color: red;', focusedElementRef.current?.id);
    
    blurTimeoutRef.current = setTimeout(() => {
      if (ignoreNextBlurRef.current) {
        console.log('%cDEBUG: handleFieldBlur TIMEOUT - IGNORING BLUR due to ignoreNextBlurRef=true', 'color: red; font-weight: bold;');
        ignoreNextBlurRef.current = false; 
        return; 
      }

      console.log('%cDEBUG: handleFieldBlur TIMEOUT EXECUTED - Clearing focus and selections', 'color: red; font-weight: bold;');
      focusedElementRef.current = null; 
      setSelectedItemIdGlobal(null);
      setSelectedSectionIdForStyling(null);
      setSidebarTargetTop(null); 
    }, 100); 
  }, []);


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


  const handleBackClick = useCallback(() => { console.log('Navigate back'); }, []);

  const handleToggleEditMode = useCallback(() => {
    setIsEditingMode(prev => {
      if (prev) {
        if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current); 
        ignoreNextBlurRef.current = false; 
        focusedElementRef.current = null;
        setSelectedItemIdGlobal(null);
        setSelectedSectionIdForStyling(null);
        setSidebarTargetTop(null);
      }
      return !prev;
    });
  }, []);

  const handleDossierTitleChange = useCallback((newTitle: string) => { setDossierTitle(newTitle); }, []);
  const handleDossierDescriptionChange = useCallback((newDescription: string) => { setDossierDescription(newDescription); }, []);
  const handleEvaluationConceptChange = useCallback((concept: EvaluationConcept) => { setEvaluationConcept(concept); }, []);
  const handleSectionDescriptionChange = useCallback((sectionId: string, newDescription: string) => {
    setSectionsData(prev => prev.map((sec: SectionData) => (sec.id === sectionId ? { ...sec, description: newDescription } : sec)));
  }, []);
  const handleSectionTitleChange = useCallback((sectionId: string, newTitle: string) => {
    setSectionsData(prev => prev.map((sec: SectionData) => (sec.id === sectionId ? { ...sec, title: newTitle } : sec)));
  }, []);
  const handleSectionWeightChange = useCallback((sectionId: string, newWeight: string) => {
    setSectionsData(prev => prev.map((sec: SectionData) => (sec.id === sectionId ? { ...sec, weight: newWeight } : sec)));
  }, []);
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

  const handleAddNewSectionForSidebar = useCallback(() => {
    console.log('%cACTION: handleAddNewSectionForSidebar: START', 'color: #2E8B57; font-weight: bold;', { selectedItemIdGlobal, selectedSectionIdForStyling });
    
    if (!isEditingMode) return;

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
    // Não resetar ignoreNextBlurRef aqui, o foco no novo elemento deve acionar handleFieldFocus que o faz

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

  const handleAddItemForSidebar = useCallback(() => {
    console.log('%cACTION: handleAddItemForSidebar: START', 'color: #2E8B57; font-weight: bold;', { selectedItemIdGlobal, selectedSectionIdForStyling });
    if (!isEditingMode) return;

    let targetSectionId = selectedSectionIdForStyling;
    if (!targetSectionId && selectedItemIdGlobal) {
        const sectionOfItem = sectionsData.find(s => Array.isArray(s.items) && s.items.some(it => it.id === selectedItemIdGlobal));
        if (sectionOfItem) targetSectionId = sectionOfItem.id;
    }

    if (!targetSectionId) {
      console.warn("handleAddItemForSidebar: No target section identified.");
      return;
    }

    const newItemId = `item-${targetSectionId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setSectionsData(prev => prev.map(sec =>
        sec.id === targetSectionId
          ? { ...sec, items: [...(Array.isArray(sec.items) ? sec.items : []), { id: newItemId, description: 'Novo Item', value: 'N/A' }] } 
          : sec
    ));
    
    setSelectedSectionIdForStyling(targetSectionId); 
    setSelectedItemIdGlobal(newItemId); 
    // Não resetar ignoreNextBlurRef aqui

     requestAnimationFrame(() => {
         if (typeof document === 'undefined') return; 
         const newItemElement = document.getElementById(`dossier-item-${newItemId}`);
         if (newItemElement) {
             const editableField = newItemElement.querySelector('input, textarea') as HTMLElement | null;
             if (editableField) editableField.focus();
         }
     });
  }, [sectionsData, isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal]);

  const handleDeleteItemForSidebar = useCallback(() => {
    console.log('%cACTION: handleDeleteItemForSidebar: START', 'color: #DC143C; font-weight: bold;', { selectedItemIdGlobal });
    if (!isEditingMode || !selectedItemIdGlobal) return; // Esta checagem já é coberta por canDeleteItem, mas é bom ter uma validação extra.

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
    // ignoreNextBlurRef.current = false; // Resetado pelo próximo foco ou blur não ignorado
  }, [sectionsData, isEditingMode, selectedItemIdGlobal]);

  const handleDeleteSectionForSidebar = useCallback(() => {
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
    // ignoreNextBlurRef.current = false;
  }, [sectionsData, isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal]);
  
  const handleDossierSettingsClick = useCallback(() => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    ignoreNextBlurRef.current = false; 
    console.log('Configurações do Dossiê (clicado via botão no header)');
  }, []);

  const handleSave = useCallback(async () => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    ignoreNextBlurRef.current = false;
    const payload: CreateDossierPayload = adaptDossierStateToPayload(
      dossierTitle, dossierDescription, evaluationConcept, sectionsData, MOCK_PROFESSOR_ID
    );
    console.log("Payload para o Backend:", payload);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      alert("Dossiê salvo com sucesso (simulado)!");
    } catch (error: any) { alert(`Falha ao salvar dossiê: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);}
  }, [dossierTitle, dossierDescription, evaluationConcept, sectionsData, MOCK_PROFESSOR_ID]);


  const canDeleteItem = useMemo(() => {
    if (!selectedItemIdGlobal) {
      return false;
    }

    // Encontra a seção que contém o item selecionado
    const sectionOfSelectedItem = sectionsData.find(s => 
      Array.isArray(s.items) && s.items.some(item => item.id === selectedItemIdGlobal)
    );

    // Se o item selecionado não for encontrado em nenhuma seção (caso improvável)
    if (!sectionOfSelectedItem) {
      return true; 
    }

    // Verifica se é o último item na sua seção
    const isLastItemInSection = sectionOfSelectedItem.items.length === 1 && sectionOfSelectedItem.items[0].id === selectedItemIdGlobal;

    // Verifica se existe apenas uma seção no dossiê
    const isOnlySection = sectionsData.length === 1;

    // Permite a exclusão se:
    // 1. Não for o último item da seção (isLastItemInSection é falso), OU
    // 2. Não for a única seção (isOnlySection é falso).
    // Ou seja, impede a exclusão APENAS se for o último item E a única seção.
    return !(isLastItemInSection && isOnlySection);
  }, [selectedItemIdGlobal, sectionsData]);

  const canDeleteSection = useMemo(() => {
    const hasSelection = !!selectedSectionIdForStyling || !!selectedItemIdGlobal;
    const isMoreThanOneSection = sectionsData.length > 1;
    return hasSelection && isMoreThanOneSection;
  }, [selectedSectionIdForStyling, selectedItemIdGlobal, sectionsData.length]);


  const isFocusedElementAnItemField = isClient && 
                                     focusedElementRef.current instanceof HTMLElement &&
                                     focusedElementRef.current.closest(`[id^="dossier-item-"]`) instanceof HTMLElement;
  const showActionSidebar = isClient && isEditingMode && isFocusedElementAnItemField;

  useEffect(() => {
    if(isClient){
        // console.log('%cDEBUG: showActionSidebar check:', 'color: #8A2BE2;', { /* ... logs ... */ });
    }
  }, [isEditingMode, focusedElementRef.current, isFocusedElementAnItemField, sidebarTargetTop, showActionSidebar, isClient]);


  return (
    <>
      <Head><title>Dossiê CRUD - Avançado</title></Head>
      <div className={styles.appContainer}>
        <main className={styles.mainContent}>
          <PageHeader
            isEditing={isEditingMode} 
            onBackClick={handleBackClick} 
            onToggleEditMode={handleToggleEditMode}
            className={styles.pageHeader} 
            backButtonClassName={styles.pageHeader_backButton}
            backButtonIconClassName={styles.pageHeader_backIcon}
            toggleButtonClassName={`${styles.pageHeader_toggleButtonBase} ${isEditingMode ? styles.pageHeader_toggleButtonEditing : styles.pageHeader_toggleButtonViewing}`}
            onFieldFocus={handleFieldFocus} 
            onFieldBlur={handleFieldBlur}
          />
          <div ref={scrollableAreaRef} className={styles.scrollableArea}>
            <DossierHeader
              title={dossierTitle} 
              description={dossierDescription} 
              isEditing={isEditingMode}
              evaluationConcept={evaluationConcept} 
              onTitleChange={handleDossierTitleChange}
              onDescriptionChange={handleDossierDescriptionChange} 
              onEvaluationConceptChange={handleEvaluationConceptChange}
              onSettingsClick={handleDossierSettingsClick} 
              showSettingsButton={isEditingMode && evaluationConcept !== 'numerical'}
              onFieldFocus={handleFieldFocus} 
              onFieldBlur={handleFieldBlur}
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
              settingsButtonIconClassName={styles.pageHeader_backIcon}
            />
            <SectionList
              sections={sectionsData} 
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
                containerClassNameFromPage={styles.actionSidebarVisualBase}
                buttonClassNameFromPage={styles.actionSidebarButtonVisualBase}
                disabledButtonClassNameFromPage={styles.actionSidebarButtonDisabledVisualBase}
                iconClassNameFromPage={styles.actionSidebarIconVisualBase}
              />
            )}
          </div>
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

export default DossierAppPage;