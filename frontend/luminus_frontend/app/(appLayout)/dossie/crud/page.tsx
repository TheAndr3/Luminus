// src/pages/DossierAppPage.tsx
"use client"
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Head from 'next/head';

import PageHeader from '../../../../components/dossier/PageHeader';
import DossierHeader from '../../../../components/dossier/DossierHeader';
import SectionList from '../../../../components/dossier/SectionList';
import ActionSidebar from '../../../../components/dossier/ActionSidebar';

import { SectionData, ItemData, EvaluationConcept } from '../../../../types/dossier'; // Ajuste o caminho

import styles from './DossierCRUDPage.module.css';

// Mocks (atualizados para incluir a descrição da seção e peso como string numérica)
const initialDossierTitleData = "Dossiê Exemplo Avançado";
const initialDossierDescriptionData = "Descrição detalhada do dossiê, com múltiplos tópicos e itens editáveis.";
const initialEvaluationConcept: EvaluationConcept = 'numerical';
const initialSectionsDataList: SectionData[] = [
  {
    id: 'section-alpha',
    title: 'Primeira Seção Editável',
    description: 'Esta é a descrição da primeira seção. Ela pode ser editada no modo de edição.', 
    weight: '50', // Peso apenas com número (string)
    items: [
      { id: 'item-alpha-1', description: 'Critério de Avaliação A', value: 'N/A' },
      { id: 'item-alpha-2', description: 'Observação sobre o item A', value: 'N/A' },
    ],
  },
  {
    id: 'section-beta',
    title: 'Segunda Seção Dinâmica',
    description: 'Descrição para a seção beta, explicando seu propósito ou conteúdo.', 
    weight: '30', // Peso apenas com número (string)
    items: [
      { id: 'item-beta-1', description: 'Desempenho em Projeto X', value: 'N/A' },
      { id: 'item-beta-2', description: 'Participação em Reuniões', value: 'N/A' },
      { id: 'item-beta-3', description: 'Feedback Recebido', value: 'N/A'},
    ],
  },
    {
    id: 'section-gamma',
    title: 'Terceira Seção Longa para Scroll',
    description: 'Uma descrição mais longa para esta seção, testando o layout com múltiplas linhas.', 
    weight: '20', // Peso apenas com número (string)
    items: [
      { id: 'item-gamma-1', description: 'Item Gamma 1', value: 'N/A' },
      { id: 'item-gamma-2', description: 'Item Gamma 2', value: 'N/A' },
      { id: 'item-gamma-3', description: 'Item Gamma 3', value: 'N/A' },
      { id: 'item-gamma-4', description: 'Item Gamma 4', value: 'N/A' },
      { id: 'item-gamma-5', description: 'Item Gamma 5', value: 'N/A' },
      { id: 'item-gamma-6', description: 'Item Gamma 6', value: 'N/A' },
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

  // Ref para o elemento DOM focado que dita a posição da sidebar
  const focusedElementRef = useRef<HTMLElement | null>(null);
  // Ref para o timeout de blur
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [sidebarTargetTop, setSidebarTargetTop] = useState<number | null>(null);
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  const sidebarHeightEstimate = 240; // Altura estimada da ActionSidebar

  // Limpa o timeout de blur existente
  const clearBlurTimeout = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  }, []);

  // Define o estado de seleção e o elemento focado ao receber foco
  const handleFieldFocus = useCallback((element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => {
    if (!isEditingMode) return;

    clearBlurTimeout(); // Limpa qualquer timeout de blur pendente

    focusedElementRef.current = element;

    if (context.type === 'item') {
      setSelectedItemIdGlobal(context.id);
      // Encontra a seção do item focado para definir a seleção da seção para styling
      const sectionOfItem = sectionsData.find(s => s.items.some(item => item.id === context.id));
      if (sectionOfItem) {
        setSelectedSectionIdForStyling(sectionOfItem.id);
      } else {
        setSelectedSectionIdForStyling(null);
      }
    } else if (context.type === 'section') {
      // Se o foco estiver em um campo da seção (título/peso/descrição), seleciona a seção
       setSelectedSectionIdForStyling(context.id);
       setSelectedItemIdGlobal(null); // Desseleciona o item se focou na seção
    }

  }, [isEditingMode, sectionsData, clearBlurTimeout]); 

  // Define o timeout para limpar o estado de seleção e o elemento focado ao perder foco
  const handleFieldBlur = useCallback(() => {
     blurTimeoutRef.current = setTimeout(() => {
        focusedElementRef.current = null;
        setSelectedItemIdGlobal(null);
        setSelectedSectionIdForStyling(null);
        setSidebarTargetTop(null); 
     }, 50); 
  }, []);


  const getActiveSectionIdForActions = useCallback((): string | null => {
    if (selectedItemIdGlobal) {
      const section = sectionsData.find(s => s.items.some(i => i.id === selectedItemIdGlobal));
      return section ? section.id : null; 
    }
    return selectedSectionIdForStyling;
  }, [sectionsData, selectedItemIdGlobal, selectedSectionIdForStyling]);
  
  const handleAddNewSectionForSidebar = useCallback(() => {
     clearBlurTimeout(); 
    const activeSectionId = getActiveSectionIdForActions(); 
    const newSectionId = `section-${Date.now()}`;
    const newItemId = `item-${newSectionId}-init-${Math.random().toString(36).substr(2, 5)}`;
    const newSectionData: SectionData = {
      id: newSectionId,
      title: `Nova Seção`,
      description: `Descrição da nova seção...`, 
      weight: '0', // peso inicial como string numérica
      items: [{ id: newItemId, description: 'Novo item inicial', value: 'N/A' }],
    };

    let newSections = [...sectionsData];
    let targetSectionIndex = -1;

    if (activeSectionId) {
         targetSectionIndex = sectionsData.findIndex(sec => sec.id === activeSectionId);
    }

    if (targetSectionIndex !== -1) {
        newSections = [...sectionsData.slice(0, targetSectionIndex + 1), newSectionData, ...sectionsData.slice(targetSectionIndex + 1)];
    } else {
         newSections = [...sectionsData, newSectionData];
    }
    
    setSectionsData(newSections);

    setSelectedSectionIdForStyling(newSectionId);
    setSelectedItemIdGlobal(newItemId); 
  }, [sectionsData, getActiveSectionIdForActions, clearBlurTimeout]);

  const handleAddItemForSidebar = useCallback(() => {
     clearBlurTimeout(); 
    let activeSectionId = getActiveSectionIdForActions();
    
    if (!activeSectionId) {
        const newSectionId = `section-${Date.now()}`;
        const newItemId = `item-${newSectionId}-init-${Math.random().toString(36).substr(2, 5)}`;
        const newSectionData: SectionData = {
          id: newSectionId,
          title: `Nova Seção (Automática)`,
          description: `Descrição da seção automática...`, 
          weight: '0', // peso inicial como string numérica
          items: [{ id: newItemId, description: 'Novo Item Adicionado', value: 'N/A' }],
        };
        setSectionsData(prev => [...prev, newSectionData]);
        activeSectionId = newSectionId; 
        setSelectedSectionIdForStyling(newSectionId);
        setSelectedItemIdGlobal(newItemId); 
        return;
    }

    const newItemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setSectionsData(prev =>
      prev.map(sec =>
        sec.id === activeSectionId
          ? { ...sec, items: [...sec.items, { id: newItemId, description: 'Novo Item Adicionado', value: 'N/A' }] }
          : sec
      )
    );
    setSelectedSectionIdForStyling(activeSectionId);
    setSelectedItemIdGlobal(newItemId); 

  }, [sectionsData, getActiveSectionIdForActions, clearBlurTimeout]);


  const handleDossierSettingsClick = useCallback(() => {
      clearBlurTimeout(); 
      console.log('Configurações do Dossiê (clicado via botão no header)');
  }, [clearBlurTimeout]);


  const handleDeleteItemForSidebar = useCallback(() => {
    if (!selectedItemIdGlobal) return;
    clearBlurTimeout(); 

    const sectionOfItem = sectionsData.find(s => s.items.some(i => i.id === selectedItemIdGlobal));
    if (sectionOfItem) {
      const currentSelectedItemId = selectedItemIdGlobal; 
      const currentSelectedSectionId = sectionOfItem.id;

      setSectionsData(prev => {
        const newSections = prev.map(sec =>
          sec.id === sectionOfItem.id
            ? { ...sec, items: sec.items.filter(item => item.id !== currentSelectedItemId) }
            : sec
        );
         if (newSections.some(sec => sec.id === currentSelectedSectionId && sec.items.length === 0) && newSections.length > 1) {
            return newSections.filter(sec => sec.id !== currentSelectedSectionId);
         }
        return newSections;
      });

      setSelectedItemIdGlobal(null);
      focusedElementRef.current = null;

      setSelectedSectionIdForStyling(null); 
      setSidebarTargetTop(null); 
    }
  }, [sectionsData, selectedItemIdGlobal, clearBlurTimeout]);

  const handleDeleteSectionForSidebar = useCallback(() => {
    const activeSectionId = getActiveSectionIdForActions();
    if (!activeSectionId) return;
    clearBlurTimeout(); 

    setSectionsData(prev => prev.filter(sec => sec.id !== activeSectionId));

    if (selectedSectionIdForStyling === activeSectionId) {
      setSelectedSectionIdForStyling(null);
    }
    const sectionBeingDeleted = sectionsData.find(s => s.id === activeSectionId);
    if (sectionBeingDeleted && selectedItemIdGlobal && sectionBeingDeleted.items.some(it => it.id === selectedItemIdGlobal)) {
      setSelectedItemIdGlobal(null);
    }
     focusedElementRef.current = null;
     setSidebarTargetTop(null); 
  }, [sectionsData, selectedItemIdGlobal, selectedSectionIdForStyling, getActiveSectionIdForActions, clearBlurTimeout]);


  // Efeito para posicionar a ActionSidebar
  useEffect(() => {
    if (!isEditingMode || !focusedElementRef.current || !scrollableAreaRef.current) {
      setSidebarTargetTop(null);
      return;
    }

    const targetElement = focusedElementRef.current;
    const scrollableAreaElement = scrollableAreaRef.current;

    // Verifica se o elemento focado é um campo dentro de um SectionItem
    const parentItemElement = targetElement.closest(`[id^="dossier-item-"]`);

    if (!parentItemElement) {
         setSidebarTargetTop(null);
         return;
    }

    const targetRect = parentItemElement.getBoundingClientRect(); 
    const scrollableAreaRect = scrollableAreaElement.getBoundingClientRect();

    const targetTopRelativeToScrollableVisible = targetRect.top - scrollableAreaRect.top;

    const targetTopRelativeToScrollableContent = targetTopRelativeToScrollableVisible + scrollableAreaElement.scrollTop;

    let targetTop = targetTopRelativeToScrollableContent + (targetRect.height / 2) - (sidebarHeightEstimate / 2);

    const minTop = 5; 
    const maxTop = scrollableAreaElement.scrollHeight - sidebarHeightEstimate - 5; 

    targetTop = Math.max(minTop, targetTop);
    targetTop = Math.min(targetTop, maxTop);

    setSidebarTargetTop(targetTop);

  }, [focusedElementRef.current, isEditingMode, sidebarHeightEstimate, scrollableAreaRef]); 


  // Efeito para atualizar a posição da sidebar DURANTE o scroll
  useEffect(() => {
    const scrollArea = scrollableAreaRef.current;
    if (!scrollArea || !isEditingMode || !focusedElementRef.current || !focusedElementRef.current.closest(`[id^="dossier-item-"]`)) {
        return;
    }

    const handleScroll = () => {
       const targetElement = focusedElementRef.current;
       const scrollableAreaElement = scrollableAreaRef.current;
       const parentItemElement = targetElement?.closest(`[id^="dossier-item-"]`);

       if (parentItemElement && scrollableAreaElement) {
           const targetRect = parentItemElement.getBoundingClientRect(); 
           const scrollableAreaRect = scrollableAreaElement.getBoundingClientRect();

           const targetTopRelativeToScrollableVisible = targetRect.top - scrollableAreaRect.top;
           const targetTopRelativeToScrollableContent = targetTopRelativeToScrollableVisible + scrollableAreaElement.scrollTop;

           let targetTop = targetTopRelativeToScrollableContent + (targetRect.height / 2) - (sidebarHeightEstimate / 2);

           const minTop = 5;
           const maxTop = scrollableAreaElement.scrollHeight - sidebarHeightEstimate - 5;

           targetTop = Math.max(minTop, targetTop);
           targetTop = Math.min(targetTop, maxTop);

           setSidebarTargetTop(targetTop);
       } else {
           setSidebarTargetTop(null);
       }
    };

    scrollArea.addEventListener('scroll', handleScroll);

    return () => {
      scrollArea.removeEventListener('scroll', handleScroll);
    };

  }, [focusedElementRef.current, isEditingMode, sidebarHeightEstimate, scrollableAreaRef]); 


  const handleBackClick = useCallback(() => { console.log('Navigate back'); }, []);

  // Ao alternar o modo de edição, limpa todas as seleções e o foco
  const handleToggleEditMode = useCallback(() => {
    setIsEditingMode(prev => {
      if (prev) { 
        clearBlurTimeout(); 
        focusedElementRef.current = null;
        setSelectedItemIdGlobal(null);
        setSelectedSectionIdForStyling(null);
        setSidebarTargetTop(null); 
      }
      return !prev;
    });
  }, [clearBlurTimeout]); 


  const handleDossierTitleChange = useCallback((newTitle: string) => { setDossierTitle(newTitle); }, []);
  const handleDossierDescriptionChange = useCallback((newDescription: string) => { setDossierDescription(newDescription); }, []);
  const handleEvaluationConceptChange = useCallback((concept: EvaluationConcept) => { setEvaluationConcept(concept); }, []);


  // Este handler é para cliques na área da seção (não em um item ou campo editável)
  // Ele agora APENAS controla a seleção visual da seção, NÃO posiciona a sidebar.
  const handleSectionAreaClick = useCallback((sectionId: string) => {
    if (!isEditingMode) return;

    clearBlurTimeout(); 

    const isCurrentSectionSelected = selectedSectionIdForStyling === sectionId;
    const isItemInCurrentSectionFocused = selectedItemIdGlobal !== null && sectionsData.some(s => s.id === sectionId && s.items.some(i => i.id === selectedItemIdGlobal));


    if (isCurrentSectionSelected && !selectedItemIdGlobal && !isItemInCurrentSectionFocused) {
        setSelectedSectionIdForStyling(null);
    } else {
        setSelectedSectionIdForStyling(sectionId);
        setSelectedItemIdGlobal(null); 
    }
  }, [isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal, sectionsData, clearBlurTimeout]);

  // Handler para mudança na descrição da seção
  const handleSectionDescriptionChange = useCallback((sectionId: string, newDescription: string) => {
    setSectionsData(prev => prev.map(sec => (sec.id === sectionId ? { ...sec, description: newDescription } : sec)));
  }, []);


  const handleSectionTitleChange = useCallback((sectionId: string, newTitle: string) => {
    setSectionsData(prev => prev.map(sec => (sec.id === sectionId ? { ...sec, title: newTitle } : sec)));
  }, []);

  // Handler para mudança no peso da seção - agora espera uma string numérica (ou vazia)
  const handleSectionWeightChange = useCallback((sectionId: string, newWeight: string) => {
     // O filtro de caracteres não numéricos já ocorre em Section.tsx antes de chamar este handler
    setSectionsData(prev => prev.map(sec => (sec.id === sectionId ? { ...sec, weight: newWeight } : sec)));
  }, []);


  // Este handler é para cliques na div do item (não em um campo editável dentro dele)
  // Ele agora controla a seleção visual do item/seção E posiciona a sidebar no item.
  const handleItemSelect = useCallback((itemId: string | null) => {
    if (!isEditingMode || itemId === null) return; 

    clearBlurTimeout(); 

    if (selectedItemIdGlobal === itemId) {
        setSelectedItemIdGlobal(null);
        setSelectedSectionIdForStyling(null); 
        focusedElementRef.current = null; 
        setSidebarTargetTop(null); 
    } else {
        setSelectedItemIdGlobal(itemId);
         const sectionOfItem = sectionsData.find(sec => sec.items.some(item => item.id === itemId));
         if (sectionOfItem) {
             setSelectedSectionIdForStyling(sectionOfItem.id); 
         } else {
             setSelectedSectionIdForStyling(null);
         }
        focusedElementRef.current = document.getElementById(`dossier-item-${itemId}`); 
    }
  }, [isEditingMode, sectionsData, selectedItemIdGlobal, clearBlurTimeout]);


  const handleItemChange = useCallback(
    (sectionId: string, itemId: string, field: 'description' | 'value', newValue: string) => {
      setSectionsData(prev =>
        prev.map(sec =>
          sec.id === sectionId
            ? { ...sec, items: sec.items.map(item => item.id === itemId ? { ...item, [field]: newValue } : item) }
            : sec
        )
      );
    }, []);
  
  const handleSave = useCallback(() => {
    console.log("Salvar Dados:", { 
      title: dossierTitle, 
      description: dossierDescription, 
      evaluationConcept: evaluationConcept,
      sections: sectionsData // sectionsData agora armazena peso como string numérica
    });
    alert("Dados salvos no console!");
  }, [dossierTitle, dossierDescription, evaluationConcept, sectionsData]);

  // Determina se a ActionSidebar deve ser exibida
   const showActionSidebar = isEditingMode && focusedElementRef.current !== null && focusedElementRef.current.closest(`[id^="dossier-item-"]`) !== null;


  return (
    <>
      <Head>
        <title>Dossiê CRUD - Avançado</title>
      </Head>
      <div className={styles.appContainer}>
        <main className={styles.mainContent}>
          <PageHeader
            isEditing={isEditingMode}
            onBackClick={handleBackClick}
            onToggleEditMode={handleToggleEditMode}
            className={styles.pageHeader}
            backButtonClassName={styles.pageHeader_backButton}
            backButtonIconClassName={styles.pageHeader_backIcon}
            toggleButtonClassName={`${styles.pageHeader_toggleButtonBase} ${
              isEditingMode ? styles.pageHeader_toggleButtonEditing : styles.pageHeader_toggleButtonViewing
            }`}
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
              onSectionWeightChange={handleSectionWeightChange} // Passa o handler de peso
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
              // CORRIGIDO: Passando as classes para SectionList com os nomes corretos esperados por SectionListProps
              sectionItemDescriptionFieldContainerClassName={styles.sectionItem_descriptionFieldWrapper} 
              sectionItemDescriptionTextDisplayClassName={styles.editableField_textDisplayItem} 
              sectionItemDescriptionInputClassName={styles.editableField_inputItem} 
              // Note: value field classes are not passed as showValueField is false
            />

            {showActionSidebar && (
              <ActionSidebar
                targetTopPosition={sidebarTargetTop}
                onAddItemToSection={handleAddItemForSidebar}
                onAddNewSection={handleAddNewSectionForSidebar}
                onDeleteItemFromSection={handleDeleteItemForSidebar}
                onDeleteSection={handleDeleteSectionForSidebar}
                canDeleteItem={!!selectedItemIdGlobal} 
                containerClassNameFromPage={styles.actionSidebarVisualBase}
                buttonClassNameFromPage={styles.actionSidebarButtonVisualBase}
                disabledButtonClassNameFromPage={styles.actionSidebarButtonDisabledVisualBase}
                iconClassNameFromPage={styles.actionSidebarIconVisualBase}
              />
            )}
          </div>

          {isEditingMode && (
            <div className={styles.footerActions}>
              <button onClick={handleSave} className={styles.saveButton}>
                Salvar Alterações
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default DossierAppPage;