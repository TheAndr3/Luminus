// src/pages/DossierAppPage.tsx
"use client"
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Head from 'next/head';

import PageHeader from '../../../../components/dossier/PageHeader';
import DossierHeader from '../../../../components/dossier/DossierHeader';
import SectionList from '../../../../components/dossier/SectionList';
import ActionSidebar from '../../../../components/dossier/ActionSidebar';

// Importa as interfaces e a função adaptadora diretamente de types/dossier
import { SectionData, ItemData, EvaluationConcept, adaptDossierStateToPayload } from '../../../../types/dossier';
// Importa a função de API e o tipo de payload
import { createDossier, CreateDossierPayload } from '../../../../services/dossierServices'; // Ajuste o caminho se necessário

import styles from './DossierCRUDPage.module.css';

// Mocks (mantidos)
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
      { id: 'item-beta-3', description: 'Feedback Recebido', value: 'N/A' },
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
      { id: 'item-gamma-7', description: 'Item Gamma 7', value: 'N/A' },
      { id: 'item-gamma-8', description: 'Item Gamma 8', value: 'N/A' },
      { id: 'item-gamma-9', description: 'Item Gamma 9', value: 'N/A' },
      { id: 'item-gamma-10', description: 'Item Gamma 10', value: 'N/A' },
      { id: 'item-gamma-11', description: 'Item Gamma 11', value: 'N/A' },
      { id: 'item-gamma-12', description: 'Item Gamma 12', value: 'N/A' },
    ],
  },
];


const DossierAppPage: React.FC = () => {
  const [dossierTitle, setDossierTitle] = useState(initialDossierTitleData);
  const [dossierDescription, setDossierDescription] = useState(initialDossierDescriptionData);
  const [evaluationConcept, setEvaluationConcept] = useState<EvaluationConcept>(initialEvaluationConcept);
  const [sectionsData, setSectionsData] = useState<SectionData[]>(initialSectionsDataList);
  const [isEditingMode, setIsEditingMode] = useState(true);

  // Controlam a estilização de seleção (borda azul)
  const [selectedSectionIdForStyling, setSelectedSectionIdForStyling] = useState<string | null>(null);
  const [selectedItemIdGlobal, setSelectedItemIdGlobal] = useState<string | null>(null);

  // Ref para o elemento DOM focado que dita a posição da sidebar
  const focusedElementRef = useRef<HTMLElement | null>(null);
  // Ref para o timeout de blur
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Estado para a posição "top" da sidebar (relativa ao scrollableArea)
  const [sidebarTargetTop, setSidebarTargetTop] = useState<number | null>(null);
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  // Altura estimada da ActionSidebar para o cálculo de centralização
  const sidebarHeightEstimate = 240;


  // Professor ID: MOCK hardcoded por enquanto. Em um app real, viria do contexto/autenticação.
  const MOCK_PROFESSOR_ID = 1;


  // Limpa o timeout de blur existente
  const clearBlurTimeout = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  }, []);

  // Manipula o foco em qualquer EditableField
  // Esta é a função primária que aciona o posicionamento da sidebar
  const handleFieldFocus = useCallback((element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => {
    if (!isEditingMode) return;

    clearBlurTimeout(); // Limpa qualquer timeout de blur pendente

    focusedElementRef.current = element; // Guarda a referência do elemento focado

    // Atualiza o estado de seleção visual
    if (context.type === 'item') {
      setSelectedItemIdGlobal(context.id);
      // Encontra a seção do item focado para definir a seleção da seção para styling
      const sectionOfItem = sectionsData.find(s => s.items.some(item => item.id === context.id));
      if (sectionOfItem) {
        setSelectedSectionIdForStyling(sectionOfItem.id);
      } else {
         // Se por algum motivo não encontrar a seção do item, deseleciona a seção
        setSelectedSectionIdForStyling(null);
      }
    } else if (context.type === 'section') {
      // Se o foco estiver em um campo da seção (título/peso/descrição), seleciona a seção
      setSelectedSectionIdForStyling(context.id);
      setSelectedItemIdGlobal(null); // Desseleciona o item se focou na seção da seção
    } else {
        // Se o contexto não é nem item nem seção (ex: PageHeader, DossierHeader), limpa tudo
        setSelectedItemIdGlobal(null);
        setSelectedSectionIdForStyling(null);
    }

    // O useEffect que observa focusedElementRef.current cuidará de calcular e definir a posição da sidebar
    // Ele só fará isso se o foco for em um item, conforme a lógica de showActionSidebar.

  }, [isEditingMode, sectionsData, clearBlurTimeout]);

  // Manipula a perda de foco de qualquer EditableField
  // Usa um timeout para permitir cliques na sidebar antes de esconder
  const handleFieldBlur = useCallback(() => {
    // Define um pequeno timeout. Se outro elemento focado acionar handleFieldFocus antes do timeout,
    // o timeout é limpo. Se o timeout completar, significa que o foco saiu de um EditableField
    // para um elemento não rastreado (ou fora da página), então limpamos a seleção/foco.
    blurTimeoutRef.current = setTimeout(() => {
      focusedElementRef.current = null;
      setSelectedItemIdGlobal(null);
      setSelectedSectionIdForStyling(null);
      setSidebarTargetTop(null); // Esconde a sidebar
    }, 50); // Tempo suficiente para registrar um clique na sidebar
  }, []);


  // Manipula o clique na div de um SectionItem (não nos campos editáveis internos)
  // Serve para selecionar visualmente o item e sua seção pai.
  // Esta função agora é chamada APENAS quando o clique não foi em um campo editável.
  const handleItemSelect = useCallback((itemId: string) => {
     if (!isEditingMode) return;

     clearBlurTimeout(); // Limpa qualquer timeout de blur pendente

     // Se o item clicado já está selecionado, deseleciona tudo (equivalente a clicar fora).
     // Se não, seleciona o item e a seção pai.
     // Importante: Clicar na div do item (não no campo) NÃO reposiciona a sidebar,
     // pois focusedElementRef.current permanece null. A sidebar só aparece com FOCO real em campo de item.
     if (selectedItemIdGlobal === itemId) {
         setSelectedItemIdGlobal(null);
         setSelectedSectionIdForStyling(null);
          focusedElementRef.current = null; // Clicar na div do item não mantém o foco em um campo específico
          setSidebarTargetTop(null); // Esconde a sidebar se não há campo focado
     } else {
         setSelectedItemIdGlobal(itemId);
          const sectionOfItem = sectionsData.find(sec => sec.items.some(item => item.id === itemId));
          if (sectionOfItem) {
              setSelectedSectionIdForStyling(sectionOfItem.id);
          } else {
              setSelectedSectionIdForStyling(null);
          }
          // Não tentamos focar em um campo aqui. focusedElementRef.current permanece null.
     }
  }, [isEditingMode, sectionsData, selectedItemIdGlobal, clearBlurTimeout]);

  // Manipula o clique na área da seção (sem ser nos campos editáveis ou itens)
  // Serve para selecionar visualmente a seção e limpar seleção/foco de item.
  const handleSectionAreaClick = useCallback((sectionId: string) => {
     if (!isEditingMode) return;

     clearBlurTimeout(); // Limpa qualquer timeout de blur pendente

     // Se a seção clicada já está selecionada, deseleciona tudo.
     // Se não, seleciona a seção.
      if (selectedSectionIdForStyling === sectionId) {
          setSelectedSectionIdForStyling(null);
      } else {
          setSelectedSectionIdForStyling(sectionId);
      }

     // Clicar na área da seção sempre deseleciona o item e limpa o foco
     setSelectedItemIdGlobal(null);
     focusedElementRef.current = null;
     setSidebarTargetTop(null); // Esconde a sidebar

  }, [isEditingMode, clearBlurTimeout, selectedSectionIdForStyling]);


  // Efeito para posicionar a ActionSidebar quando o elemento focado ou o scroll mudam
  useEffect(() => {
    // Adiciona a verificação de ambiente
    if (typeof window === 'undefined' || !scrollableAreaRef.current) {
      setSidebarTargetTop(null); // Garante que a sidebar fica escondida no servidor ou sem scrollarea
      return;
    }

    const focusedElement = focusedElementRef.current;
    const scrollableAreaElement = scrollableAreaRef.current;

    // A sidebar só aparece no modo de edição E QUANDO um campo editável DENTRO de um item está focado.
    // Verifica se focusedElement existe, é um HTMLElement e se é descendente de um elemento com id começando com "dossier-item-"
    const isItemFieldFocused = focusedElement instanceof HTMLElement && focusedElement.closest(`[id^="dossier-item-"]`) instanceof HTMLElement;

    if (!isEditingMode || !isItemFieldFocused) {
      setSidebarTargetTop(null); // Esconde a sidebar
      return;
    }

    // Se chegamos aqui, estamos em modo de edição e um campo de item está focado.
    // Precisamos encontrar o container pai do item para o cálculo da posição.
    const parentItemElement = focusedElement.closest(`[id^="dossier-item-"]`) as HTMLElement; // Já verificamos que é um HTMLElement

    if (!parentItemElement) {
        // Isso não deve acontecer dado a verificação acima, mas por segurança
        setSidebarTargetTop(null);
        return;
    }

    // Calcula a posição do topo do container do item pai RELATIVO ao topo do container scrollável
    // Usamos getBoundingClientRect para obter a posição no viewport e subtraímos a posição do scrollableArea
    const parentItemRect = parentItemElement.getBoundingClientRect();
    const scrollAreaRect = scrollableAreaElement.getBoundingClientRect();

    // Posição vertical do topo do item em relação ao topo visível da área scrollável
    const itemTopRelativeToScrollAreaViewport = parentItemRect.top - scrollAreaRect.top;

    // Adicionamos o scroll actual para obter a posição do topo do item em relação ao TOPO DO CONTEÚDO scrollável
    const itemTopRelativeToScrollAreaContent = itemTopRelativeToScrollAreaViewport + scrollableAreaElement.scrollTop;


    // Calcula a posição Y desejada para o centro da sidebar (centralizada verticalmente com o item)
    let finalSidebarTop = itemTopRelativeToScrollAreaContent + (parentItemRect.height / 2) - (sidebarHeightEstimate / 2);


    // Limita a posição para garantir que a sidebar fique visível e dentro da área scrollável
    // A posição mínima é 0 (topo do conteúdo scrollável)
    const minTop = 0;
    // A posição máxima é a altura total do conteúdo menos a altura da sidebar
    // Ajustamos para evitar que a sidebar vá para muito perto do fim se o conteúdo for pequeno
    const maxTop = scrollableAreaElement.scrollHeight > sidebarHeightEstimate
                   ? scrollableAreaElement.scrollHeight - sidebarHeightEstimate
                   : 0; // Se a área scrollável é menor que a sidebar, posiciona no topo


    // Aplica os limites
    finalSidebarTop = Math.max(minTop, finalSidebarTop);
    finalSidebarTop = Math.min(finalSidebarTop, maxTop);

    // Define a nova posição da sidebar
    setSidebarTargetTop(finalSidebarTop);

    // Adiciona o listener de scroll APENAS QUANDO a sidebar está visível (ou seja, um item field está focado)
    const handleScroll = () => {
       // Recalcula a posição no scroll. A lógica é a mesma do cálculo inicial.
       // Verifica novamente se o estado ainda é válido (item field focado)
       const currentTargetElement = focusedElementRef.current; // Pega o ref atual
       const currentScrollableAreaElement = scrollableAreaRef.current; // Pega o ref atual

        // Se não estamos em modo de edição, não há área scrollável, ou nenhum campo de item está focado,
        // remove o listener e esconde a sidebar.
        const isCurrentItemFieldFocused = currentTargetElement instanceof HTMLElement && currentTargetElement.closest(`[id^="dossier-item-"]`) instanceof HTMLElement;

        if (!isEditingMode || !currentScrollableAreaElement || !isCurrentItemFieldFocused) {
             // Remove o listener aqui para garantir que ele não continue disparando desnecessariamente
             currentScrollableAreaElement?.removeEventListener('scroll', handleScroll);
             setSidebarTargetTop(null); // Esconde a sidebar
             return; // Sai do handler de scroll
       }

        const currentParentItemElement = currentTargetElement.closest(`[id^="dossier-item-"]`);

        if (currentParentItemElement && currentParentItemElement instanceof HTMLElement) {
            const currentParentItemRect = currentParentItemElement.getBoundingClientRect();
            const currentScrollAreaRect = currentScrollableAreaElement.getBoundingClientRect();

            const currentItemTopRelativeToScrollAreaViewport = currentParentItemRect.top - currentScrollAreaRect.top;
            const currentItemTopRelativeToScrollAreaContent = currentItemTopRelativeToScrollAreaViewport + currentScrollableAreaElement.scrollTop;

            let currentTargetTop = currentItemTopRelativeToScrollAreaContent + (currentParentItemRect.height / 2) - (sidebarHeightEstimate / 2);

             const currentMinTop = 0;
             const currentMaxTop = currentScrollableAreaElement.scrollHeight > sidebarHeightEstimate
                                 ? currentScrollableAreaElement.scrollHeight - sidebarHeightEstimate
                                 : 0;

            currentTargetTop = Math.max(currentMinTop, currentTargetTop);
            currentTargetTop = Math.min(currentTargetTop, currentMaxTop);

            setSidebarTargetTop(currentTargetTop);
       } else {
            // Se o elemento focado não está mais em um item válido (foi deletado, etc.)
            setSidebarTargetTop(null); // Esconde a sidebar
            // A limpeza dos refs/seleção deve vir do handler que causou a mudança (delete/blur).
       }
    };

    // Adiciona o listener de scroll
    scrollableAreaElement.addEventListener('scroll', handleScroll);

    // Limpeza: Remove o listener de scroll quando este efeito for re-executado ou componente desmontado
    return () => {
        scrollableAreaElement.removeEventListener('scroll', handleScroll);
    };

    // Dependências do useEffect:
    // focusedElementRef.current: Dispara quando o elemento focado muda (incluindo null)
    // isEditingMode: Dispara quando o modo muda
    // sidebarHeightEstimate: Dispara se a estimativa de altura mudar (improvável)
    // sectionsData: Dispara se os dados mudarem (adicionar/remover itens/seções pode mudar offsets)
    // scrollableAreaRef.current: Dispara se a área scrollável mudar (improvável)
  }, [focusedElementRef.current, isEditingMode, sidebarHeightEstimate, sectionsData, scrollableAreaRef.current]);


  const handleBackClick = useCallback(() => { console.log('Navigate back'); }, []);

  // Ao alternar o modo de edição, limpa todas as seleções e o foco
  const handleToggleEditMode = useCallback(() => {
    setIsEditingMode(prev => {
      if (prev) { // Se estava editando, limpa tudo ao sair
        clearBlurTimeout();
        focusedElementRef.current = null;
        setSelectedItemIdGlobal(null);
        setSelectedSectionIdForStyling(null);
        setSidebarTargetTop(null);
        // TODO: Adicionar lógica para perguntar se quer salvar antes de sair do modo de edição
      }
      return !prev;
    });
  }, [clearBlurTimeout]);


  const handleDossierTitleChange = useCallback((newTitle: string) => { setDossierTitle(newTitle); }, []);
  const handleDossierDescriptionChange = useCallback((newDescription: string) => { setDossierDescription(newDescription); }, []);
  const handleEvaluationConceptChange = useCallback((concept: EvaluationConcept) => { setEvaluationConcept(concept); }, []);


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


  // Action Sidebar Handlers:
  // As ações devem operar na seção/item atualmente selecionado (que é refletido pelo foco do item ou clique na seção)

  const handleAddNewSectionForSidebar = useCallback(() => {
    if (!isEditingMode) return;
    clearBlurTimeout();

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

    // Encontra a seção selecionada (ou a seção do item selecionado/focado) para inserir a nova seção após ela
    if (selectedSectionIdForStyling) {
      targetSectionIndex = sectionsData.findIndex(sec => sec.id === selectedSectionIdForStyling);
    } else if (selectedItemIdGlobal) { // Fallback caso um item esteja selecionado mas a seção não
       const sectionOfSelectedItem = sectionsData.find(s => s.items.some(item => item.id === selectedItemIdGlobal));
       if(sectionOfSelectedItem) {
         targetSectionIndex = sectionsData.findIndex(sec => sec.id === sectionOfSelectedItem.id);
       }
    }


    if (targetSectionIndex !== -1) {
      newSections = [...sectionsData.slice(0, targetSectionIndex + 1), newSectionData, ...sectionsData.slice(targetSectionIndex + 1)];
    } else {
      // Adiciona ao final se nenhuma seção/item estiver selecionado
      newSections = [...sectionsData, newSectionData];
    }

    setSectionsData(newSections);

    // Limpa a seleção de item (se houver) e seleciona a nova seção
    setSelectedItemIdGlobal(null); // Item antigo desselecionado
    setSelectedSectionIdForStyling(newSectionId); // Nova seção selecionada

     // Tenta focar no primeiro campo editável do novo item para posicionar a sidebar
     // Usamos o ID do novo item que está na *nova* seção
     requestAnimationFrame(() => {
         const newItemElement = document.getElementById(`dossier-item-${newItemId}`);
         if (newItemElement) {
             const editableField = newItemElement.querySelector('input, textarea');
             if (editableField instanceof HTMLElement) {
                editableField.focus(); // Isso aciona handleFieldFocus com o novo item
             } else {
                 // Se não encontrou campo editável no novo item, limpa o foco
                 focusedElementRef.current = null;
                 setSidebarTargetTop(null);
                 // A seleção visual da nova seção permanece
             }
         } else {
             // Se o elemento do item não foi encontrado (improvável)
             focusedElementRef.current = null;
             setSidebarTargetTop(null);
              // A seleção visual da nova seção permanece
         }
     });


  }, [sectionsData, isEditingMode, clearBlurTimeout, selectedSectionIdForStyling, selectedItemIdGlobal]);


  const handleAddItemForSidebar = useCallback(() => {
    if (!isEditingMode) return;
    clearBlurTimeout();

    let targetSectionId = selectedSectionIdForStyling; // Adiciona na seção selecionada
     // Se nenhuma seção selecionada, mas um item selecionado, adiciona na seção daquele item
    if (!targetSectionId && selectedItemIdGlobal) {
        const sectionOfSelectedItem = sectionsData.find(s => s.items.some(item => item.id === selectedItemIdGlobal));
        targetSectionId = sectionOfSelectedItem ? sectionOfSelectedItem.id : null;
    }


    if (!targetSectionId) {
      // Se nenhuma seção ou item está selecionado/focado, adiciona uma nova seção e o item nela
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
      targetSectionId = newSectionId;
      // Seleciona a nova seção e o novo item
      setSelectedSectionIdForStyling(newSectionId);
      setSelectedItemIdGlobal(newItemId);

      // Tenta focar no novo item imediatamente após adicionar
      requestAnimationFrame(() => {
        const newItemElement = document.getElementById(`dossier-item-${newItemId}`);
        if (newItemElement) {
          const editableField = newItemElement.querySelector('input, textarea');
          if (editableField instanceof HTMLElement) {
            editableField.focus(); // Isso aciona handleFieldFocus
          } else {
              focusedElementRef.current = null;
              setSidebarTargetTop(null);
          }
        } else {
            focusedElementRef.current = null;
            setSidebarTargetTop(null);
        }
      });

      return; // Termina aqui após adicionar nova seção e item
    }

    // Lógica para adicionar item na seção alvo (existente)
    const newItemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setSectionsData(prev =>
      prev.map(sec =>
        sec.id === targetSectionId
          ? { ...sec, items: [...sec.items, { id: newItemId, description: 'Novo Item Adicionado', value: 'N/A' }] }
          : sec
      )
    );
    // Seleciona o novo item na seção alvo
    setSelectedSectionIdForStyling(targetSectionId); // Garante que a seção pai está selecionada
    setSelectedItemIdGlobal(newItemId); // Seleciona o novo item

    // Tenta focar no novo item imediatamente após adicionar
     requestAnimationFrame(() => {
         const newItemElement = document.getElementById(`dossier-item-${newItemId}`);
         if (newItemElement) {
             const editableField = newItemElement.querySelector('input, textarea');
             if (editableField instanceof HTMLElement) {
                editableField.focus(); // Isso aciona handleFieldFocus
             } else {
                 // Se não encontrou campo editável no novo item, limpa o foco/sidebar
                 focusedElementRef.current = null;
                 setSidebarTargetTop(null);
                 // A seleção visual do novo item e da seção pai permanece
             }
         } else {
              // Se o elemento do item não foi encontrado (improvável)
              focusedElementRef.current = null;
              setSidebarTargetTop(null);
              // A seleção visual do novo item e da seção pai permanece
         }
     });

  }, [sectionsData, isEditingMode, clearBlurTimeout, selectedSectionIdForStyling, selectedItemIdGlobal]);


  const handleDeleteItemForSidebar = useCallback(() => {
    // Só permite deletar se houver um item selecionado (que acontece quando um campo de item está focado)
    if (!isEditingMode || !selectedItemIdGlobal) return;

    clearBlurTimeout(); // Limpa timeout de blur

    const currentSelectedItemId = selectedItemIdGlobal;
    const sectionOfItem = sectionsData.find(s => s.items.some(i => i.id === currentSelectedItemId));

    if (!sectionOfItem) return; // Item não encontrado (estado inconsistente?)

    const currentSelectedSectionId = sectionOfItem.id;

    setSectionsData(prev => {
      const newSections = prev.map(sec =>
        sec.id === currentSelectedSectionId
          ? { ...sec, items: sec.items.filter(item => item.id !== currentSelectedItemId) }
          : sec
      );

      // Se a seção do item deletado ficou vazia E não é a única seção, deleta a seção também
      const sectionIsEmpty = newSections.some(sec => sec.id === currentSelectedSectionId && sec.items.length === 0);
      if (sectionIsEmpty && newSections.length > 1) {
        return newSections.filter(sec => sec.id !== currentSelectedSectionId);
      }
      return newSections;
    });

    // Limpa a seleção e o foco após a exclusão
    setSelectedItemIdGlobal(null);
    setSelectedSectionIdForStyling(null); // Limpa a seleção da seção também (ela pode ter sido deletada ou o item era o último)
    focusedElementRef.current = null;
    setSidebarTargetTop(null); // Esconde a sidebar

  }, [sectionsData, selectedItemIdGlobal, isEditingMode, clearBlurTimeout]);


  const handleDeleteSectionForSidebar = useCallback(() => {
     // Só permite deletar se houver uma seção selecionada E houver mais de uma seção no total
    if (!isEditingMode || !selectedSectionIdForStyling || sectionsData.length <= 1) {
      if (sectionsData.length <= 1) console.warn("Não é possível deletar a última seção.");
      return;
    }

    clearBlurTimeout(); // Limpa timeout de blur

    const sectionIdToDelete = selectedSectionIdForStyling;

    setSectionsData(prev => prev.filter(sec => sec.id !== sectionIdToDelete));

    // Limpa a seleção e o foco após a exclusão
    // Verifica se o item selecionado pertencia à seção deletada
    const sectionBeingDeleted = sectionsData.find(s => s.id === sectionIdToDelete);
    if (sectionBeingDeleted && selectedItemIdGlobal && sectionBeingDeleted.items.some(it => it.id === selectedItemIdGlobal)) {
      setSelectedItemIdGlobal(null);
    }
    setSelectedSectionIdForStyling(null); // Limpa a seleção da seção
    focusedElementRef.current = null;
    setSidebarTargetTop(null); // Esconde a sidebar

  }, [sectionsData, selectedItemIdGlobal, selectedSectionIdForStyling, isEditingMode, clearBlurTimeout]);


  const handleDossierSettingsClick = useCallback(() => {
    clearBlurTimeout();
    console.log('Configurações do Dossiê (clicado via botão no header)');
  }, [clearBlurTimeout]);


  // Usando a função adaptadora e a função de API
  const handleSave = useCallback(async () => { // Torna a função assíncrona
    clearBlurTimeout(); // Limpa qualquer timeout de blur pendente ao salvar

    // 1. Adapta os dados do estado da UI para o payload do backend
    const payload: CreateDossierPayload = adaptDossierStateToPayload(
      dossierTitle,
      dossierDescription,
      evaluationConcept,
      sectionsData,
      MOCK_PROFESSOR_ID // Passa o ID do professor (mockado por enquanto)
    );

    console.log("Payload para o Backend:", payload); // Mostra o payload no console

    // 2. Chama a função de API para criar/salvar o dossiê
    try {
      // await createDossier(payload); // Descomente para enviar para a API real
      console.log("Simulando chamada à API de salvar..."); // Simulação
      // Você pode adicionar um pequeno delay para simular a rede:
      // await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Dossiê salvo (simulado)!"); // Confirmação simulada

      alert("Dossiê salvo com sucesso (simulado)!");

      // Opcional: Transicionar para o modo de visualização após salvar
      // setIsEditingMode(false); // Pode querer manter no modo edição para continuar trabalhando

    } catch (error: any) {
      console.error("Erro ao salvar dossiê:", error);
      // Tratamento de erro mais detalhado, se necessário
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar';
      alert(`Falha ao salvar dossiê: ${errorMessage}`);
    }

  }, [dossierTitle, dossierDescription, evaluationConcept, sectionsData, MOCK_PROFESSOR_ID, clearBlurTimeout]); // Adiciona dependências


  // Determina se a ActionSidebar deve ser exibida
  // A sidebar aparece apenas no modo de edição E QUANDO um campo editável DENTRO de um item está focado E estamos no cliente.
  // A verificação `typeof window !== 'undefined'` é crucial aqui.
  const showActionSidebar = isEditingMode &&
    typeof window !== 'undefined' && // Verifica se está no navegador
    focusedElementRef.current instanceof HTMLElement && // Verifica se há um elemento focado
    focusedElementRef.current.closest(`[id^="dossier-item-"]`) instanceof HTMLElement; // Verifica se o elemento focado está dentro de um item


  // Determina se o botão "Excluir Item" na sidebar deve estar habilitado
  // Habilitado apenas se houver um item selecionado (que acontece quando um campo de item está focado)
  const canDeleteItem = !!selectedItemIdGlobal;

  // Determina se o botão "Excluir Seção" na sidebar deve estar habilitado
  // Habilitado se houver uma seção selecionada E houver mais de uma seção no total
  const canDeleteSection = !!selectedSectionIdForStyling && sectionsData.length > 1;


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
            toggleButtonClassName={`${styles.pageHeader_toggleButtonBase} ${isEditingMode ? styles.pageHeader_toggleButtonEditing : styles.pageHeader_toggleButtonViewing
              }`}
            onFieldFocus={handleFieldFocus} // Passa para que os botões possam limpar o estado de foco
            onFieldBlur={handleFieldBlur} // Passa para que os botões possam limpar o estado de foco
          />

          {/* Área scrollável para o conteúdo principal */}
          <div ref={scrollableAreaRef} className={styles.scrollableArea}>
            {/* Header do Dossiê */}
            <DossierHeader
              title={dossierTitle}
              description={dossierDescription}
              isEditing={isEditingMode}
              evaluationConcept={evaluationConcept}
              onTitleChange={handleDossierTitleChange}
              onDescriptionChange={handleDossierDescriptionChange}
              onEvaluationConceptChange={handleEvaluationConceptChange}
              onSettingsClick={handleDossierSettingsClick}
              // Mostrar botão de settings apenas em modo de edição e se NÃO for avaliação numérica
              showSettingsButton={isEditingMode && evaluationConcept !== 'numerical'}
              onFieldFocus={handleFieldFocus} // Passa para que os campos do header possam limpar o estado de foco do item
              onFieldBlur={handleFieldBlur} // Passa para que os campos do header possam limpar o estado de foco do item

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

            {/* Lista de Seções */}
            <SectionList
              sections={sectionsData}
              isEditing={isEditingMode}
              selectedSectionIdForStyling={selectedSectionIdForStyling}
              selectedItemId={selectedItemIdGlobal}
              onSectionAreaClick={handleSectionAreaClick} // Passa o handler de clique na área da seção
              onSectionTitleChange={handleSectionTitleChange}
              onSectionDescriptionChange={handleSectionDescriptionChange}
              onSectionWeightChange={handleSectionWeightChange}
              onItemChange={handleItemChange}
              onItemSelect={handleItemSelect} // Passa o handler de clique na div do item (seleção visual)
              onFieldFocus={handleFieldFocus} // Passa o handler de foco para EditableFields
              onFieldBlur={handleFieldBlur} // Passa o handler de blur para EditableFields

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

            {/* Action Sidebar (posicionada absolutamente dentro da área scrollável) */}
            {/* Renderiza condicionalmente com base em showActionSidebar */}
            {showActionSidebar && (
              <ActionSidebar
                targetTopPosition={sidebarTargetTop}
                onAddItemToSection={handleAddItemForSidebar} // Adiciona item na seção selecionada/focada
                onAddNewSection={handleAddNewSectionForSidebar} // Adiciona nova seção após a selecionada/focada
                onDeleteItemFromSection={handleDeleteItemForSidebar} // Deleta o item selecionado/focado
                onDeleteSection={handleDeleteSectionForSidebar} // Deleta a seção selecionada/focada
                canDeleteItem={canDeleteItem} // Habilita/desabilita botão de deletar item
                canDeleteSection={canDeleteSection} // Habilita/desabilita botão de deletar seção

                containerClassNameFromPage={styles.actionSidebarVisualBase}
                buttonClassNameFromPage={styles.actionSidebarButtonVisualBase}
                disabledButtonClassNameFromPage={styles.actionSidebarButtonDisabledVisualBase}
                iconClassNameFromPage={styles.actionSidebarIconVisualBase}
              />
            )}
          </div>

          {/* Botão Salvar (visível apenas em modo de edição) */}
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