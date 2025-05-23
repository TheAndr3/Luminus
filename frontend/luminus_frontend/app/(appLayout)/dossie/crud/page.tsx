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

// Mocks atualizados
const initialDossierTitleData = "Dossiê Exemplo Avançado";
const initialDossierDescriptionData = "Descrição detalhada do dossiê, com múltiplos tópicos e itens editáveis.";
const initialEvaluationConcept: EvaluationConcept = 'numerical'; // Novo mock
const initialSectionsDataList: SectionData[] = [
  {
    id: 'section-alpha',
    title: 'Primeira Seção Editável',
    weight: '50%', // NOVO
    items: [
      { id: 'item-alpha-1', description: 'Critério de Avaliação A', value: 'N/A' }, // Valor pode ser N/A por enquanto
      { id: 'item-alpha-2', description: 'Observação sobre o item A', value: 'N/A' },
    ],
  },
  {
    id: 'section-beta',
    title: 'Segunda Seção Dinâmica',
    weight: '30%', // NOVO
    items: [
      { id: 'item-beta-1', description: 'Desempenho em Projeto X', value: 'N/A' },
      { id: 'item-beta-2', description: 'Participação em Reuniões', value: 'N/A' },
      { id: 'item-beta-3', description: 'Feedback Recebido', value: 'N/A'},
    ],
  },
    {
    id: 'section-gamma',
    title: 'Terceira Seção Longa para Scroll',
    weight: '20%', // NOVO
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
  const [evaluationConcept, setEvaluationConcept] = useState<EvaluationConcept>(initialEvaluationConcept); // NOVO
  const [sectionsData, setSectionsData] = useState<SectionData[]>(initialSectionsDataList);
  const [isEditingMode, setIsEditingMode] = useState(true);
  
  const [selectedSectionIdForStyling, setSelectedSectionIdForStyling] = useState<string | null>(null);
  const [selectedItemIdGlobal, setSelectedItemIdGlobal] = useState<string | null>(null);

  const [sidebarTargetTop, setSidebarTargetTop] = useState<number | null>(null);
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  const sidebarHeightEstimate = 240; // Altura estimada da ActionSidebar para cálculo de centralização

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
      weight: '0%', // Peso inicial
      items: [{ id: newItemId, description: 'Novo item inicial', value: 'N/A' }],
    };

    if (!activeSectionId && sectionsData.length === 0) { // Se não há seção ativa e a lista está vazia
        setSectionsData([newSectionData]);
    } else { // Adiciona após a seção ativa ou no final se nenhuma estiver ativa mas a lista não for vazia
        setSectionsData(prev => {
          const index = activeSectionId ? prev.findIndex(sec => sec.id === activeSectionId) : -1;
          if (index !== -1) {
            return [...prev.slice(0, index + 1), newSectionData, ...prev.slice(index + 1)];
          }
          return [...prev, newSectionData]; // Adiciona ao final se activeSectionId for null mas lista não vazia
        });
    }
    setSelectedSectionIdForStyling(newSectionId);
    setSelectedItemIdGlobal(newItemId);
  }, [sectionsData, selectedItemIdGlobal, selectedSectionIdForStyling]);

  const handleAddItemForSidebar = useCallback(() => {
    const activeSectionId = getActiveSectionIdForActions();
    if (!activeSectionId) {
        // Se não há seção ativa, cria uma nova seção primeiro
        handleAddNewSectionForSidebar();
        // A nova seção e item já serão selecionados por handleAddNewSectionForSidebar
        // A lógica abaixo para adicionar item a uma seção existente não será executada neste fluxo.
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
    setSelectedSectionIdForStyling(activeSectionId); // Mantém a seção ativa
    setSelectedItemIdGlobal(newItemId); // Seleciona o novo item
  }, [sectionsData, selectedItemIdGlobal, selectedSectionIdForStyling, handleAddNewSectionForSidebar]);

  const handleSectionSettingsForSidebar = useCallback(() => {
    const activeSectionId = getActiveSectionIdForActions();
    if (!activeSectionId) return;
    console.log('Configurações para a seção (via sidebar global):', activeSectionId);
    setSelectedSectionIdForStyling(activeSectionId);
    setSelectedItemIdGlobal(null);
  }, [selectedItemIdGlobal, selectedSectionIdForStyling]); // Removido sectionsData se não for usado diretamente

  const handleDeleteItemForSidebar = useCallback(() => {
    if (!selectedItemIdGlobal) return;
    const sectionOfItem = sectionsData.find(s => s.items.some(i => i.id === selectedItemIdGlobal));
    if (sectionOfItem) {
      setSectionsData(prev =>
        prev.map(sec =>
          sec.id === sectionOfItem.id
            ? { ...sec, items: sec.items.filter(item => item.id !== selectedItemIdGlobal) }
            : sec
        ).filter(sec => sec.items.length > 0 || sec.id !== sectionOfItem.id) // Opcional: remover seção se ficar vazia
      );
      setSelectedItemIdGlobal(null); 
      // Mantém a seção selecionada para styling ou define como null se a seção foi removida
      const sectionStillExists = sectionsData.some(s => s.id === sectionOfItem.id && s.items.some(i => i.id !== selectedItemIdGlobal));
      setSelectedSectionIdForStyling(sectionStillExists ? sectionOfItem.id : null);
    }
  }, [sectionsData, selectedItemIdGlobal]);

  const handleDeleteSectionForSidebar = useCallback(() => {
    const activeSectionId = getActiveSectionIdForActions();
    if (!activeSectionId) return;
    setSectionsData(prev => prev.filter(sec => sec.id !== activeSectionId));
    if (selectedSectionIdForStyling === activeSectionId) {
      setSelectedSectionIdForStyling(null);
    }
    // Desselecionar item se pertencer à seção excluída
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
      
      // Calcula o topo do item relativo à área de scroll visível
      const itemTopRelativeToScrollableVisible = itemRect.top - scrollableAreaRect.top;
      
      // Calcula o topo do item relativo ao conteúdo total da área de scroll (incluindo parte não visível)
      const itemTopRelativeToScrollableContent = itemTopRelativeToScrollableVisible + scrollableAreaElement.scrollTop;

      let targetTop = itemTopRelativeToScrollableContent + (itemRect.height / 2) - (sidebarHeightEstimate / 2);
      
      // Garante que a sidebar não saia dos limites da área de scroll
      targetTop = Math.max(5, targetTop); // Mínimo 5px do topo
      targetTop = Math.min(targetTop, scrollableAreaElement.scrollHeight - sidebarHeightEstimate - 5); // Máximo 5px do fundo
      
      setSidebarTargetTop(targetTop);
    } else {
      setSidebarTargetTop(null); // Item não encontrado, esconde sidebar
    }
  }, [selectedItemIdGlobal, isEditingMode, sectionsData, sidebarHeightEstimate]); // sectionsData para recalcular se a altura dos itens mudar

  // Efeito para atualizar a posição da sidebar durante o scroll
  useEffect(() => {
    const scrollArea = scrollableAreaRef.current;
    if (!scrollArea || !selectedItemIdGlobal || !isEditingMode) return;

    const handleScroll = () => {
      // Reutiliza a lógica do useEffect acima para recalcular a posição
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
  }, [selectedItemIdGlobal, isEditingMode, sidebarHeightEstimate]); // Não precisa de sectionsData aqui, pois o scroll não muda a estrutura dos dados

  const handleBackClick = useCallback(() => { console.log('Navigate back'); }, []);
  const handleToggleEditMode = useCallback(() => {
    setIsEditingMode(prev => {
      if (prev) { // Saindo do modo de edição
        setSelectedItemIdGlobal(null);
        setSelectedSectionIdForStyling(null);
        setSidebarTargetTop(null); // Esconde a sidebar
      }
      return !prev;
    });
  }, []);

  const handleDossierTitleChange = useCallback((newTitle: string) => { setDossierTitle(newTitle); }, []);
  const handleDossierDescriptionChange = useCallback((newDescription: string) => { setDossierDescription(newDescription); }, []);
  const handleEvaluationConceptChange = useCallback((concept: EvaluationConcept) => { setEvaluationConcept(concept); }, []); // NOVO

  const handleSectionAreaClick = useCallback((sectionId: string) => {
    if (!isEditingMode) return; // Clique na área da seção só funciona em modo de edição

    if (selectedSectionIdForStyling === sectionId && !selectedItemIdGlobal) {
      // Se a seção já está selecionada e nenhum item nela está, deseleciona a seção
      setSelectedSectionIdForStyling(null);
      setSidebarTargetTop(null); // Esconde sidebar se estava visível por seleção de seção
    } else {
      // Seleciona a seção e deseleciona qualquer item
      setSelectedSectionIdForStyling(sectionId);
      setSelectedItemIdGlobal(null);
      // Posicionar sidebar ao lado da seção (opcional, ou só quando item é selecionado)
      // Por ora, a sidebar só aparece com item selecionado.
      // Se quiser que apareça ao lado da seção:
      // const sectionElement = document.getElementById(`section-container-${sectionId}`); // Precisaria de ID na Section
      // if (sectionElement && scrollableAreaRef.current) { ... lógica de posicionamento ... }
      setSidebarTargetTop(null); // Garante que a sidebar não fique visível só com a seção selecionada
    }
  }, [isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal]);

  const handleSectionTitleChange = useCallback((sectionId: string, newTitle: string) => {
    setSectionsData(prev => prev.map(sec => (sec.id === sectionId ? { ...sec, title: newTitle } : sec)));
  }, []);

  const handleSectionWeightChange = useCallback((sectionId: string, newWeight: string) => { // NOVO
    setSectionsData(prev => prev.map(sec => (sec.id === sectionId ? { ...sec, weight: newWeight } : sec)));
  }, []);

  const handleItemSelect = useCallback((itemId: string | null) => {
    if (!isEditingMode && itemId !== null) return; // Não permite selecionar item se não estiver editando

    setSelectedItemIdGlobal(itemId);
    if (itemId) {
      const sectionOfItem = sectionsData.find(sec => sec.items.some(item => item.id === itemId));
      if (sectionOfItem) {
        setSelectedSectionIdForStyling(sectionOfItem.id); // Garante que a seção pai do item esteja estilizada
      }
    } else {
      // Se está deselecionando um item, mas uma seção ainda estava "ativa" para styling,
      // mantém a seção ativa (selectedSectionIdForStyling não muda aqui).
      // A sidebar será escondida pelo useEffect que depende de selectedItemIdGlobal.
    }
  }, [isEditingMode, sectionsData]);

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
      evaluationConcept: evaluationConcept, // NOVO
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
              evaluationConcept={evaluationConcept} // NOVO
              onTitleChange={handleDossierTitleChange}
              onDescriptionChange={handleDossierDescriptionChange}
              onEvaluationConceptChange={handleEvaluationConceptChange} // NOVO
              className={styles.dossierHeaderContainer}
              titleTextClassName={styles.dossierHeader_titleText}
              titleInputClassName={styles.dossierHeader_titleInput}
              evaluationConceptContainerClassName={styles.dossierHeader_evaluationConceptContainer} // NOVO
              evaluationConceptLabelTextClassName={styles.dossierHeader_evaluationConceptLabelText} // NOVO
              evaluationConceptRadioGroupClassName={styles.dossierHeader_evaluationRadioGroup} // NOVO
              evaluationConceptRadioLabelClassName={styles.dossierHeader_evaluationRadioLabel} // NOVO
              evaluationConceptRadioInputClassName={styles.dossierHeader_evaluationRadioInput} // NOVO
              evaluationConceptDisplayClassName={styles.dossierHeader_evaluationConceptDisplay} // NOVO
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
              onSectionWeightChange={handleSectionWeightChange} // NOVO
              onItemChange={handleItemChange}
              onItemSelect={handleItemSelect}
              
              className={styles.sectionListContainer}
              sectionComponentClassName={styles.section_outerContainer}
              sectionComponentContentWrapperClassName={styles.section_contentWrapper}
              sectionComponentSelectedStylingClassName={styles.section_selectedStyling}
              
              sectionComponentTitleAndWeightContainerClassName={styles.section_titleAndWeightContainer} // NOVO
              sectionComponentTitleContainerClassName={styles.section_titleContainer}
              sectionComponentTitleEditableFieldClassName={styles.editableField_inputBase} // Usando classe genérica para o EditableField do título
              sectionComponentTitleTextClassName={styles.section_titleText}
              sectionComponentTitleInputClassName={styles.section_titleInput}
              
              sectionComponentWeightFieldContainerClassName={styles.section_weightFieldContainer} // NOVO
              sectionComponentWeightEditableFieldClassName={styles.editableField_inputBase}      // NOVO
              sectionComponentWeightTextClassName={styles.section_weightText}                   // NOVO
              sectionComponentWeightInputClassName={styles.section_weightInput}                  // NOVO
              
              sectionComponentItemsListClassName={styles.section_itemsList}
              
              sectionItemClassName={`${styles.sectionItem_container} ${isEditingMode ? styles.sectionItem_containerEditable : ''}`}
              sectionItemSelectedClassName={styles.sectionItem_selected}
              sectionItemDescriptionFieldContainerClassName={styles.sectionItem_descriptionFieldWrapper}
              sectionItemDescriptionTextDisplayClassName={styles.editableField_textDisplayItem}
              sectionItemDescriptionInputClassName={styles.editableField_inputItem}
            />

            {isEditingMode && ( // ActionSidebar só é montada se estiver em modo de edição
              <ActionSidebar
                targetTopPosition={sidebarTargetTop}
                onAddItemToSection={handleAddItemForSidebar}
                onAddNewSection={handleAddNewSectionForSidebar}
                onSectionSettings={handleSectionSettingsForSidebar}
                onDeleteItemFromSection={handleDeleteItemForSidebar}
                onDeleteSection={handleDeleteSectionForSidebar}
                canDeleteItem={!!selectedItemIdGlobal} // Habilita delete de item se um item estiver selecionado
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