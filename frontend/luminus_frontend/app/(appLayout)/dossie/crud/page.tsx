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

// Mocks (mantenha seus mocks como estão ou ajuste conforme necessário)
const initialDossierTitleData = "Dossiê Exemplo Avançado";
const initialDossierDescriptionData = "Descrição detalhada do dossiê, com múltiplos tópicos e itens editáveis.";
const initialEvaluationConcept: EvaluationConcept = 'numerical';
const initialSectionsDataList: SectionData[] = [
  {
    id: 'section-alpha',
    title: 'Primeira Seção Editável',
    weight: '50%',
    items: [
      { id: 'item-alpha-1', description: 'Critério de Avaliação A', value: 'N/A' },
      { id: 'item-alpha-2', description: 'Observação sobre o item A', value: 'N/A' },
    ],
  },
  {
    id: 'section-beta',
    title: 'Segunda Seção Dinâmica',
    weight: '30%',
    items: [
      { id: 'item-beta-1', description: 'Desempenho em Projeto X', value: 'N/A' },
      { id: 'item-beta-2', description: 'Participação em Reuniões', value: 'N/A' },
      { id: 'item-beta-3', description: 'Feedback Recebido', value: 'N/A'},
    ],
  },
    {
    id: 'section-gamma',
    title: 'Terceira Seção Longa para Scroll',
    weight: '20%',
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

  const [sidebarTargetTop, setSidebarTargetTop] = useState<number | null>(null);
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  const sidebarHeightEstimate = 240; // Altura estimada da ActionSidebar

  const getActiveSectionIdForActions = (): string | null => {
    if (selectedItemIdGlobal) {
      const section = sectionsData.find(s => s.items.some(i => i.id === selectedItemIdGlobal));
      return section ? section.id : selectedSectionIdForStyling;
    }
    return selectedSectionIdForStyling;
  };
  
  const handleAddNewSectionForSidebar = useCallback(() => {
    const activeSectionId = getActiveSectionIdForActions() || (sectionsData.length > 0 ? sectionsData[sectionsData.length - 1].id : null) ;
    const newSectionId = `section-${Date.now()}`;
    const newItemId = `item-${newSectionId}-init-${Math.random().toString(36).substr(2, 5)}`;
    const newSectionData: SectionData = {
      id: newSectionId,
      title: `Nova Seção`,
      weight: '0%',
      items: [{ id: newItemId, description: 'Novo item inicial', value: 'N/A' }],
    };

    if (!activeSectionId && sectionsData.length === 0) {
        setSectionsData([newSectionData]);
    } else {
        setSectionsData(prev => {
          const index = activeSectionId ? prev.findIndex(sec => sec.id === activeSectionId) : -1;
          if (index !== -1) {
            return [...prev.slice(0, index + 1), newSectionData, ...prev.slice(index + 1)];
          }
          return [...prev, newSectionData];
        });
    }
    setSelectedSectionIdForStyling(newSectionId);
    setSelectedItemIdGlobal(newItemId); // Seleciona o novo item para a sidebar seguir
  }, [sectionsData, selectedItemIdGlobal, selectedSectionIdForStyling]);

  const handleAddItemForSidebar = useCallback(() => {
    let activeSectionId = getActiveSectionIdForActions();
    
    if (!activeSectionId) {
        // Se não há seção ativa, cria uma nova seção primeiro e usa seu ID
        const newSectionId = `section-${Date.now()}`;
        const newItemId = `item-${newSectionId}-init-${Math.random().toString(36).substr(2, 5)}`;
        const newSectionData: SectionData = {
          id: newSectionId,
          title: `Nova Seção (Automática)`,
          weight: '0%',
          items: [{ id: newItemId, description: 'Novo Item Adicionado', value: 'N/A' }],
        };
        setSectionsData(prev => [...prev, newSectionData]);
        activeSectionId = newSectionId; // Define a nova seção como ativa
        setSelectedSectionIdForStyling(newSectionId);
        setSelectedItemIdGlobal(newItemId); // Seleciona o novo item
        return; // Retorna pois o item já foi adicionado com a nova seção
    }

    // Se já existe uma seção ativa, adiciona o item a ela
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
  }, [sectionsData, selectedItemIdGlobal, selectedSectionIdForStyling]);

  const handleSectionSettingsForSidebar = useCallback(() => {
    const activeSectionId = getActiveSectionIdForActions();
    if (!activeSectionId) return;
    console.log('Configurações para a seção (via sidebar global):', activeSectionId);
    setSelectedSectionIdForStyling(activeSectionId);
    setSelectedItemIdGlobal(null);
  }, [selectedItemIdGlobal, selectedSectionIdForStyling]);

  const handleDeleteItemForSidebar = useCallback(() => {
    if (!selectedItemIdGlobal) return;
    const sectionOfItem = sectionsData.find(s => s.items.some(i => i.id === selectedItemIdGlobal));
    if (sectionOfItem) {
      setSectionsData(prev => {
        const newSections = prev.map(sec =>
          sec.id === sectionOfItem.id
            ? { ...sec, items: sec.items.filter(item => item.id !== selectedItemIdGlobal) }
            : sec
        );
        // Opcional: remover seção se ficar vazia após deletar o item
        // return newSections.filter(sec => sec.items.length > 0 || sectionsData.length === 1); // Não remove a última seção se ela ficar vazia
        return newSections;
      });

      const currentSelectedSection = sectionOfItem.id;
      setSelectedItemIdGlobal(null); 
      
      // Verifica se a seção ainda existe e tem itens, ou se é a única seção
      const sectionAfterDelete = sectionsData.find(s => s.id === currentSelectedSection);
      if (sectionAfterDelete && sectionAfterDelete.items.length > 1) { // Maior que 1 porque o estado ainda não atualizou aqui
         setSelectedSectionIdForStyling(currentSelectedSection);
      } else if (!sectionsData.some(s => s.id === currentSelectedSection && s.items.some(i => i.id !== selectedItemIdGlobal))) {
         setSelectedSectionIdForStyling(null); // Seção foi removida ou ficou vazia e não é a última
      } else {
         setSelectedSectionIdForStyling(currentSelectedSection); // Mantém selecionada se ficou vazia mas é a única
      }
    }
  }, [sectionsData, selectedItemIdGlobal]);

  const handleDeleteSectionForSidebar = useCallback(() => {
    const activeSectionId = getActiveSectionIdForActions();
    if (!activeSectionId) return;
    setSectionsData(prev => prev.filter(sec => sec.id !== activeSectionId));
    if (selectedSectionIdForStyling === activeSectionId) {
      setSelectedSectionIdForStyling(null);
    }
    const sectionBeingDeleted = sectionsData.find(s => s.id === activeSectionId);
    if (sectionBeingDeleted && selectedItemIdGlobal && sectionBeingDeleted.items.some(it => it.id === selectedItemIdGlobal)) {
      setSelectedItemIdGlobal(null);
    }
  }, [sectionsData, selectedItemIdGlobal, selectedSectionIdForStyling]);

  // Efeito para posicionar a ActionSidebar
  useEffect(() => {
    if (!isEditingMode || !selectedItemIdGlobal || !scrollableAreaRef.current) {
      setSidebarTargetTop(null);
      return;
    }
    const itemElement = document.getElementById(`dossier-item-${selectedItemIdGlobal}`);
    const scrollableAreaElement = scrollableAreaRef.current;

    if (itemElement && scrollableAreaElement) {
      const itemRect = itemElement.getBoundingClientRect();
      const scrollableAreaRect = scrollableAreaElement.getBoundingClientRect();
      const itemTopRelativeToScrollableVisible = itemRect.top - scrollableAreaRect.top;
      const itemTopRelativeToScrollableContent = itemTopRelativeToScrollableVisible + scrollableAreaElement.scrollTop;
      let targetTop = itemTopRelativeToScrollableContent + (itemRect.height / 2) - (sidebarHeightEstimate / 2);
      targetTop = Math.max(5, targetTop);
      targetTop = Math.min(targetTop, scrollableAreaElement.scrollHeight - sidebarHeightEstimate - 5);
      setSidebarTargetTop(targetTop);
    } else {
      setSidebarTargetTop(null); 
    }
  }, [selectedItemIdGlobal, isEditingMode, sidebarHeightEstimate, scrollableAreaRef]); // scrollableAreaRef é estável, não precisa de sectionsData

  // Efeito para atualizar a posição da sidebar durante o scroll
  useEffect(() => {
    const scrollArea = scrollableAreaRef.current;
    if (!scrollArea || !selectedItemIdGlobal || !isEditingMode) {
        return;
    }
    const handleScroll = () => {
      const itemElement = document.getElementById(`dossier-item-${selectedItemIdGlobal}`);
      if (itemElement && scrollableAreaRef.current) {
        const itemRect = itemElement.getBoundingClientRect();
        const scrollableAreaRect = scrollableAreaRef.current.getBoundingClientRect();
        const itemTopRelativeToScrollableVisible = itemRect.top - scrollableAreaRect.top;
        const itemTopRelativeToScrollableContent = itemTopRelativeToScrollableVisible + scrollableAreaRef.current.scrollTop;
        let targetTop = itemTopRelativeToScrollableContent + (itemRect.height / 2) - (sidebarHeightEstimate / 2);
        targetTop = Math.max(5, targetTop);
        targetTop = Math.min(targetTop, scrollableAreaRef.current.scrollHeight - sidebarHeightEstimate - 5);
        setSidebarTargetTop(targetTop);
      } else {
        setSidebarTargetTop(null);
      }
    };
    scrollArea.addEventListener('scroll', handleScroll);
    return () => {
      scrollArea.removeEventListener('scroll', handleScroll);
    };
  }, [selectedItemIdGlobal, isEditingMode, sidebarHeightEstimate, scrollableAreaRef]);

  const handleBackClick = useCallback(() => { console.log('Navigate back'); }, []);
  const handleToggleEditMode = useCallback(() => {
    setIsEditingMode(prev => {
      if (prev) { 
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

  const handleSectionAreaClick = useCallback((sectionId: string) => {
    if (!isEditingMode) return;
    if (selectedSectionIdForStyling === sectionId && !selectedItemIdGlobal) {
      setSelectedSectionIdForStyling(null);
    } else {
      setSelectedSectionIdForStyling(sectionId);
      setSelectedItemIdGlobal(null); // Ao clicar na seção, deseleciona qualquer item
    }
     setSidebarTargetTop(null); // Esconde a sidebar ao clicar na área da seção
  }, [isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal]);

  const handleSectionTitleChange = useCallback((sectionId: string, newTitle: string) => {
    setSectionsData(prev => prev.map(sec => (sec.id === sectionId ? { ...sec, title: newTitle } : sec)));
  }, []);

  const handleSectionWeightChange = useCallback((sectionId: string, newWeight: string) => {
    setSectionsData(prev => prev.map(sec => (sec.id === sectionId ? { ...sec, weight: newWeight } : sec)));
  }, []);

  const handleItemSelect = useCallback((itemId: string | null) => {
    if (!isEditingMode && itemId !== null) return;
    
    // Se o mesmo item for clicado novamente, permite deselecionar.
    if (selectedItemIdGlobal === itemId) {
        setSelectedItemIdGlobal(null);
        // Mantém selectedSectionIdForStyling como está, pois o usuário pode querer a seção ainda "ativa"
    } else {
        setSelectedItemIdGlobal(itemId);
        if (itemId) {
          const sectionOfItem = sectionsData.find(sec => sec.items.some(item => item.id === itemId));
          if (sectionOfItem) {
            setSelectedSectionIdForStyling(sectionOfItem.id);
          }
        }
    }
  }, [isEditingMode, sectionsData, selectedItemIdGlobal]);

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
      sections: sectionsData 
    });
    alert("Dados salvos no console!");
  }, [dossierTitle, dossierDescription, evaluationConcept, sectionsData]);

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
            />

            <SectionList
              sections={sectionsData}
              isEditing={isEditingMode}
              selectedSectionIdForStyling={selectedSectionIdForStyling}
              selectedItemId={selectedItemIdGlobal}
              onSectionAreaClick={handleSectionAreaClick}
              onSectionTitleChange={handleSectionTitleChange}
              onSectionWeightChange={handleSectionWeightChange}
              onItemChange={handleItemChange}
              onItemSelect={handleItemSelect}
              
              className={styles.sectionListContainer}
              sectionComponentClassName={styles.section_outerContainer}
              sectionComponentContentWrapperClassName={styles.section_contentWrapper}
              sectionComponentSelectedStylingClassName={styles.section_selectedStyling}
              
              sectionComponentTitleAndWeightContainerClassName={styles.section_titleAndWeightContainer}
              sectionComponentTitleContainerClassName={styles.section_titleContainer}
              sectionComponentTitleEditableFieldClassName={styles.editableField_inputBase}
              sectionComponentTitleTextClassName={styles.section_titleText}
              sectionComponentTitleInputClassName={styles.section_titleInput}
              
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

            {isEditingMode && (
              <ActionSidebar
                targetTopPosition={sidebarTargetTop}
                onAddItemToSection={handleAddItemForSidebar}
                onAddNewSection={handleAddNewSectionForSidebar}
                onSectionSettings={handleSectionSettingsForSidebar}
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