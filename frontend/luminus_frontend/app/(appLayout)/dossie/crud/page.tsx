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
      // Se o foco estiver em um campo da seção (título/peso), seleciona a seção
       setSelectedSectionIdForStyling(context.id);
       setSelectedItemIdGlobal(null); // Desseleciona o item se focou na seção
    }

  }, [isEditingMode, sectionsData, clearBlurTimeout]); // selectedItemIdGlobal removido da dependência para simplificar, foco sobrepõe seleção anterior

  // Define o timeout para limpar o estado de seleção e o elemento focado ao perder foco
  const handleFieldBlur = useCallback(() => {
     // Define um pequeno delay para permitir a transição de foco entre campos
     // Sem limpar imediatamente o estado se o foco for para outro EditableField.
     blurTimeoutRef.current = setTimeout(() => {
        // Só limpa o estado de foco/seleção se o novo elemento focado *não* for um dos nossos campos editáveis
        // ou se não estivermos mais no modo de edição.
        // A verificação de isEditingMode já é feita no handleFieldFocus.
        // Se focusedElementRef.current ainda for o elemento que disparou o blur (o que não deveria acontecer após o foco em outro),
        // ou se for null, significa que o foco saiu para fora do controle.
        // Uma maneira mais robusta seria verificar `document.activeElement`.
        // Por simplicidade, confiamos que o timeout é cancelado pelo próximo foco.
        focusedElementRef.current = null;
        setSelectedItemIdGlobal(null);
        // Limpa a seleção da seção também ao perder o foco de todos os campos editáveis
        setSelectedSectionIdForStyling(null);
        setSidebarTargetTop(null); // Oculta a sidebar
     }, 50); // Tempo em ms para diferenciar blur real de transição de foco
  }, []);


  const getActiveSectionIdForActions = useCallback((): string | null => {
    if (selectedItemIdGlobal) {
      const section = sectionsData.find(s => s.items.some(i => i.id === selectedItemIdGlobal));
      return section ? section.id : null; // Retorna ID da seção do item, ou null se não encontrar/não houver item selecionado
    }
    // Se nenhum item está selecionado, a seção ativa para ações é a seção selecionada para styling
    return selectedSectionIdForStyling;
  }, [sectionsData, selectedItemIdGlobal, selectedSectionIdForStyling]);
  
  const handleAddNewSectionForSidebar = useCallback(() => {
     clearBlurTimeout(); // Limpa o timeout de blur antes de adicionar
    const activeSectionId = getActiveSectionIdForActions(); // Usa a seção ativa (item ou seção selecionada)
    const newSectionId = `section-${Date.now()}`;
    const newItemId = `item-${newSectionId}-init-${Math.random().toString(36).substr(2, 5)}`;
    const newSectionData: SectionData = {
      id: newSectionId,
      title: `Nova Seção`,
      weight: '0%',
      items: [{ id: newItemId, description: 'Novo item inicial', value: 'N/A' }],
    };

    let newSections = [...sectionsData];
    let targetSectionIndex = -1;

    if (activeSectionId) {
         targetSectionIndex = sectionsData.findIndex(sec => sec.id === activeSectionId);
    }

    if (targetSectionIndex !== -1) {
        // Insere a nova seção após a seção ativa
        newSections = [...sectionsData.slice(0, targetSectionIndex + 1), newSectionData, ...sectionsData.slice(targetSectionIndex + 1)];
    } else {
        // Se não encontrou a seção ativa ou não havia seção, adiciona no final
         newSections = [...sectionsData, newSectionData];
    }
    
    setSectionsData(newSections);

    // Seleciona a nova seção e o primeiro item para focar a sidebar
    setSelectedSectionIdForStyling(newSectionId);
    setSelectedItemIdGlobal(newItemId); 
    // Não precisa focar o elemento DOM aqui; o useEffect com a nova seleção fará isso
  }, [sectionsData, getActiveSectionIdForActions, clearBlurTimeout]);

  const handleAddItemForSidebar = useCallback(() => {
     clearBlurTimeout(); // Limpa o timeout de blur antes de adicionar
    let activeSectionId = getActiveSectionIdForActions();
    
    // Se não há seção ativa (nenhum item/seção selecionado/focado), cria uma nova seção primeiro
    if (!activeSectionId) {
        const newSectionId = `section-${Date.now()}`;
        const newItemId = `item-${newSectionId}-init-${Math.random().toString(36).substr(2, 5)}`;
        const newSectionData: SectionData = {
          id: newSectionId,
          title: `Nova Seção (Automática)`,
          weight: '0%',
          items: [{ id: newItemId, description: 'Novo Item Adicionado', value: 'N/A' }],
        };
        setSectionsData(prev => [...prev, newSectionData]);
        // Define a nova seção e o novo item como ativos
        activeSectionId = newSectionId; // Usa o ID da nova seção
        setSelectedSectionIdForStyling(newSectionId);
        setSelectedItemIdGlobal(newItemId); 
        // Não precisa focar o elemento DOM aqui; o useEffect com a nova seleção fará isso
        return;
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
    // Mantém a seção ativa e seleciona o novo item
    setSelectedSectionIdForStyling(activeSectionId);
    setSelectedItemIdGlobal(newItemId); 
    // Não precisa focar o elemento DOM aqui; o useEffect com a nova seleção fará isso

  }, [sectionsData, getActiveSectionIdForActions, clearBlurTimeout]);


  const handleSectionSettingsForSidebar = useCallback(() => {
    clearBlurTimeout(); // Limpa o timeout de blur
    const activeSectionId = getActiveSectionIdForActions();
    if (!activeSectionId) return;
    console.log('Configurações para a seção (via sidebar global):', activeSectionId);
    setSelectedSectionIdForStyling(activeSectionId); // Garante que a seção está visualmente selecionada
    setSelectedItemIdGlobal(null); // Desseleciona qualquer item, foca na seção
    // Não precisa focar o elemento DOM aqui; o useEffect com a nova seleção fará isso
  }, [getActiveSectionIdForActions, clearBlurTimeout]);

  const handleDeleteItemForSidebar = useCallback(() => {
    if (!selectedItemIdGlobal) return;
    clearBlurTimeout(); // Limpa o timeout de blur antes de deletar

    const sectionOfItem = sectionsData.find(s => s.items.some(i => i.id === selectedItemIdGlobal));
    if (sectionOfItem) {
      const currentSelectedItemId = selectedItemIdGlobal; // Captura o ID antes da atualização de estado
      const currentSelectedSectionId = sectionOfItem.id;

      setSectionsData(prev => {
        const newSections = prev.map(sec =>
          sec.id === sectionOfItem.id
            ? { ...sec, items: sec.items.filter(item => item.id !== currentSelectedItemId) }
            : sec
        );
        // Decide se remove a seção se ela ficou vazia.
        // Vamos manter a seção se ela ficou vazia, a menos que seja a única seção e items.length fosse 1.
        // Se a seção deletada ficou vazia e havia outras seções, remove a seção vazia.
         if (newSections.some(sec => sec.id === currentSelectedSectionId && sec.items.length === 0) && newSections.length > 1) {
            return newSections.filter(sec => sec.id !== currentSelectedSectionId);
         }
        return newSections;
      });

      // Limpa a seleção global e a ref do elemento focado
      setSelectedItemIdGlobal(null);
      focusedElementRef.current = null;

      // Após deletar, decide o que selecionar/focar
      // A seleção da seção é limpa ao limpar selectedItemIdGlobal,
      // a menos que o clique na área da seção a tenha selecionado independentemente.
      // Simplificação: ao deletar item, limpa item e seção selecionada.
      setSelectedSectionIdForStyling(null); // Limpa a seleção da seção também
      setSidebarTargetTop(null); // Oculta a sidebar até um novo item/seção ser selecionado/focado
    }
  }, [sectionsData, selectedItemIdGlobal, clearBlurTimeout]);

  const handleDeleteSectionForSidebar = useCallback(() => {
    const activeSectionId = getActiveSectionIdForActions();
    if (!activeSectionId) return;
    clearBlurTimeout(); // Limpa o timeout de blur antes de deletar

    setSectionsData(prev => prev.filter(sec => sec.id !== activeSectionId));

    // Limpa a seleção global e a ref do elemento focado se a seção deletada estava selecionada
    if (selectedSectionIdForStyling === activeSectionId) {
      setSelectedSectionIdForStyling(null);
    }
    const sectionBeingDeleted = sectionsData.find(s => s.id === activeSectionId);
    if (sectionBeingDeleted && selectedItemIdGlobal && sectionBeingDeleted.items.some(it => it.id === selectedItemIdGlobal)) {
      setSelectedItemIdGlobal(null);
    }
     focusedElementRef.current = null;
     setSidebarTargetTop(null); // Oculta a sidebar
  }, [sectionsData, selectedItemIdGlobal, selectedSectionIdForStyling, getActiveSectionIdForActions, clearBlurTimeout]);


  // Efeito para posicionar a ActionSidebar
  // Este useEffect agora depende APENAS do focusedElementRef.current e isEditingMode
  useEffect(() => {
    // A sidebar só é visível e posicionada no modo de edição E quando um elemento focado existe
    if (!isEditingMode || !focusedElementRef.current || !scrollableAreaRef.current) {
      setSidebarTargetTop(null);
      return;
    }

    const targetElement = focusedElementRef.current;
    const scrollableAreaElement = scrollableAreaRef.current;

    const targetRect = targetElement.getBoundingClientRect();
    const scrollableAreaRect = scrollableAreaElement.getBoundingClientRect();

    // Calcula a posição do topo do elemento alvo *relativa ao topo da área scrollável visível*
    const targetTopRelativeToScrollableVisible = targetRect.top - scrollableAreaRect.top;

    // Calcula a posição do topo do elemento alvo *relativa ao topo do conteúdo scrollável total*
    const targetTopRelativeToScrollableContent = targetTopRelativeToScrollableVisible + scrollableAreaElement.scrollTop;

    // Calcula a posição alvo para o topo da sidebar
    // Alinha o centro da sidebar com o centro do elemento alvo.
    // Se o elemento focado for uma div de seção (clique na área), alinha a sidebar no topo da seção.
    const isSectionElement = targetElement.id.startsWith('dossier-section-');

    let targetTop;
    if (isSectionElement) {
         // Posiciona no topo da seção em vez de tentar o centro
         targetTop = targetTopRelativeToScrollableContent;
    } else {
         // Posiciona no centro do item/campo editável
         targetTop = targetTopRelativeToScrollableContent + (targetRect.height / 2) - (sidebarHeightEstimate / 2);
    }


    // Limita a posição para que a sidebar não saia para fora dos limites superior e inferior
    const minTop = 5; // Pequeno padding do topo
    const maxTop = scrollableAreaElement.scrollHeight - sidebarHeightEstimate - 5; // Pequeno padding do fundo

    targetTop = Math.max(minTop, targetTop);
    targetTop = Math.min(targetTop, maxTop);

    setSidebarTargetTop(targetTop);

  }, [focusedElementRef.current, isEditingMode, sidebarHeightEstimate, scrollableAreaRef]); // Depende do elemento focado atual


  // Efeito para atualizar a posição da sidebar DURANTE o scroll
  // Este efeito precisa re-executar a lógica de posicionamento sempre que a área scrollável rolar
  useEffect(() => {
    const scrollArea = scrollableAreaRef.current;
    // Só adiciona o listener se estiver em modo de edição E houver um elemento focado
    if (!scrollArea || !isEditingMode || !focusedElementRef.current) {
        // Se não estiver ativo, remove any existing listener when the effect cleans up
        return;
    }

    // Define the scroll function that recalcula a position
    const handleScroll = () => {
       // Recalculate the position only if there's still a focused element
       if (focusedElementRef.current && scrollableAreaRef.current) {
           const targetElement = focusedElementRef.current;
           const scrollableAreaElement = scrollableAreaRef.current;

           const targetRect = targetElement.getBoundingClientRect();
           const scrollableAreaRect = scrollableAreaElement.getBoundingClientRect();

           const targetTopRelativeToScrollableVisible = targetRect.top - scrollableAreaRect.top;
           const targetTopRelativeToScrollableContent = targetTopRelativeToScrollableVisible + scrollableAreaElement.scrollTop;

           const isSectionElement = targetElement.id.startsWith('dossier-section-');

           let targetTop;
           if (isSectionElement) {
                targetTop = targetTopRelativeToScrollableContent;
           } else {
                targetTop = targetTopRelativeToScrollableContent + (targetRect.height / 2) - (sidebarHeightEstimate / 2);
           }


           const minTop = 5;
           const maxTop = scrollableAreaElement.scrollHeight - sidebarHeightEstimate - 5;

           targetTop = Math.max(minTop, targetTop);
           targetTop = Math.min(targetTop, maxTop);

           setSidebarTargetTop(targetTop);
       } else {
           // If the focused element somehow disappeared during scroll, hide the sidebar
           setSidebarTargetTop(null);
       }
    };

    // Add the scroll listener
    scrollArea.addEventListener('scroll', handleScroll);

    // Cleanup function to remove the listener when dependencies change or component unmounts
    return () => {
      scrollArea.removeEventListener('scroll', handleScroll);
    };

  }, [focusedElementRef.current, isEditingMode, sidebarHeightEstimate, scrollableAreaRef]); // Depends on the currently focused element and edit mode


  const handleBackClick = useCallback(() => { console.log('Navigate back'); }, []);

  // Ao alternar o modo de edição, limpa todas as seleções e o foco
  const handleToggleEditMode = useCallback(() => {
    setIsEditingMode(prev => {
      if (prev) { // Se estava no modo de edição ao sair
        clearBlurTimeout(); // Limpa qualquer timeout pendente
        focusedElementRef.current = null;
        setSelectedItemIdGlobal(null);
        setSelectedSectionIdForStyling(null);
        setSidebarTargetTop(null); // Esconde a sidebar
      }
      return !prev;
    });
  }, [clearBlurTimeout]); // Adiciona clearBlurTimeout como dependência


  const handleDossierTitleChange = useCallback((newTitle: string) => { setDossierTitle(newTitle); }, []);
  const handleDossierDescriptionChange = useCallback((newDescription: string) => { setDossierDescription(newDescription); }, []);
  const handleEvaluationConceptChange = useCallback((concept: EvaluationConcept) => { setEvaluationConcept(concept); }, []);

  // Este handler é para cliques na área da seção (não em um item ou campo editável)
  const handleSectionAreaClick = useCallback((sectionId: string) => {
    if (!isEditingMode) return;

    clearBlurTimeout(); // Limpa o timeout de blur

    // Alterna a seleção da seção
    if (selectedSectionIdForStyling === sectionId && selectedItemIdGlobal === null) {
        // Se a seção JÁ ESTAVA selecionada E NENHUM item estava selecionado, deseleciona
        setSelectedSectionIdForStyling(null);
        focusedElementRef.current = null;
        setSidebarTargetTop(null); // Esconde a sidebar ao deselecionar
    } else {
        // Seleciona a seção e deseleciona qualquer item
        setSelectedSectionIdForStyling(sectionId);
        setSelectedItemIdGlobal(null);
        // Tenta encontrar o elemento DOM da seção para posicionar a sidebar
        const sectionElement = document.getElementById(`dossier-section-${sectionId}`);
        if (sectionElement) {
             focusedElementRef.current = sectionElement;
             // O useEffect de posicionamento se encarregará do resto
        } else {
            focusedElementRef.current = null;
            setSidebarTargetTop(null);
        }
    }
  }, [isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal, clearBlurTimeout]);


  const handleSectionTitleChange = useCallback((sectionId: string, newTitle: string) => {
    setSectionsData(prev => prev.map(sec => (sec.id === sectionId ? { ...sec, title: newTitle } : sec)));
  }, []);

  const handleSectionWeightChange = useCallback((sectionId: string, newWeight: string) => {
    setSectionsData(prev => prev.map(sec => (sec.id === sectionId ? { ...sec, weight: newWeight } : sec)));
  }, []);


  // Este handler é para cliques na div do item (não em um campo editável dentro dele)
  const handleItemSelect = useCallback((itemId: string | null) => {
    if (!isEditingMode || itemId === null) return; // Seleção só faz sentido no modo de edição, e itemId não pode ser null

    clearBlurTimeout(); // Limpa o timeout de blur

    // Alterna a seleção do item
    if (selectedItemIdGlobal === itemId) {
        // Se o mesmo item for clicado novamente, deseleciona tudo (item e seção visual)
        setSelectedItemIdGlobal(null);
        setSelectedSectionIdForStyling(null); // Deseleciona a seção também
        focusedElementRef.current = null;
        setSidebarTargetTop(null); // Esconde a sidebar
    } else {
        // Seleciona o novo item
        setSelectedItemIdGlobal(itemId);
        focusedElementRef.current = document.getElementById(`dossier-item-${itemId}`); // Tenta encontrar o elemento DOM do item
         // Encontra a seção do item clicado para definir a seleção da seção para styling
         const sectionOfItem = sectionsData.find(sec => sec.items.some(item => item.id === itemId));
         if (sectionOfItem) {
             setSelectedSectionIdForStyling(sectionOfItem.id); // Seleciona a seção visualmente
         } else {
             setSelectedSectionIdForStyling(null);
         }
        // O useEffect de posicionamento se encarregará do resto
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
      sections: sectionsData 
    });
    alert("Dados salvos no console!");
  }, [dossierTitle, dossierDescription, evaluationConcept, sectionsData]);

  // Determina se a ActionSidebar deve ser exibida
  // É exibida no modo de edição, quando um item está selecionado OU uma seção está selecionada
  const showActionSidebar = isEditingMode && (selectedItemIdGlobal !== null || selectedSectionIdForStyling !== null);


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
             {/* DossierHeader não participa do rastreamento de foco para a sidebar */}
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
              onItemSelect={handleItemSelect} // Handler para clique na área do item
              onFieldFocus={handleFieldFocus} // Handler para foco em EditableField
              onFieldBlur={handleFieldBlur} // Handler para blur em EditableField
              
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

            {showActionSidebar && (
              <ActionSidebar
                targetTopPosition={sidebarTargetTop}
                onAddItemToSection={handleAddItemForSidebar}
                onAddNewSection={handleAddNewSectionForSidebar}
                onSectionSettings={handleSectionSettingsForSidebar}
                onDeleteItemFromSection={handleDeleteItemForSidebar}
                onDeleteSection={handleDeleteSectionForSidebar}
                canDeleteItem={!!selectedItemIdGlobal} // Habilita delete item apenas se um item estiver selecionado globalmente (por foco ou clique)
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