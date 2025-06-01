// src/pages/DossierAppPage.tsx
"use client"
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Head from 'next/head';

import PageHeader from '../../../../components/dossier/PageHeader';
import DossierHeader from '../../../../components/dossier/DossierHeader';
import SectionList from '../../../../components/dossier/SectionList';
import ActionSidebar from '../../../../components/dossier/ActionSidebar';

// Importa as interfaces e a função adaptadora diretamente de types/dossier
import { SectionData, ItemData, EvaluationConcept, adaptDossierStateToPayload} from '../../../../types/dossier';
// Importa a função de API e o tipo de payload
import { createDossier, CreateDossierPayload  } from '../../../../services/dossierServices'; // Ajuste o caminho se necessário

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

  // Professor ID: MOCK hardcoded por enquanto. Em um app real, viria do contexto/autenticação.
  const MOCK_PROFESSOR_ID = 1;


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

    // Já sabemos que 'element' é um HTMLElement aqui pela assinatura da prop onFieldFocus
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

    // Seleciona a nova seção e o novo item inicial
    setSelectedSectionIdForStyling(newSectionId);
    setSelectedItemIdGlobal(newItemId);

    // Tenta focar no primeiro campo editável do novo item para posicionar a sidebar
     requestAnimationFrame(() => {
         const newItemElement = document.getElementById(`dossier-item-${newItemId}`);
         if (newItemElement) {
             const editableField = newItemElement.querySelector('input, textarea');
             if (editableField instanceof HTMLElement) {
                editableField.focus(); // Isso aciona handleFieldFocus
             }
             // Se não focou em campo editável, focusedElementRef.current permanecerá null
             // e a sidebar não aparecerá, o que é o comportamento desejado.
         }
     });


  }, [sectionsData, getActiveSectionIdForActions, clearBlurTimeout]);

  const handleAddItemForSidebar = useCallback(() => {
     clearBlurTimeout();
    let activeSectionId = getActiveSectionIdForActions();

    if (!activeSectionId) {
        // Se nenhuma seção está selecionada ou focada, cria uma nova seção e adiciona o item nela
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
                 }
             }
        });

        return; // Termina aqui após adicionar nova seção e item
    }

    // Lógica para adicionar item na seção ativa (existente)
    const newItemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setSectionsData(prev =>
      prev.map(sec =>
        sec.id === activeSectionId
          ? { ...sec, items: [...sec.items, { id: newItemId, description: 'Novo Item Adicionado', value: 'N/A' }] }
          : sec
      )
    );
    // Seleciona o novo item na seção ativa
    setSelectedSectionIdForStyling(activeSectionId);
    setSelectedItemIdGlobal(newItemId);

    // Tenta focar no novo item imediatamente após adicionar
     requestAnimationFrame(() => {
         const newItemElement = document.getElementById(`dossier-item-${newItemId}`);
         if (newItemElement) {
             const editableField = newItemElement.querySelector('input, textarea');
             if (editableField instanceof HTMLElement) {
                editableField.focus(); // Isso aciona handleFieldFocus
             }
         }
     });


  }, [sectionsData, getActiveSectionIdForActions, clearBlurTimeout]);


  const handleDossierSettingsClick = useCallback(() => {
      clearBlurTimeout();
      console.log('Configurações do Dossiê (clicado via botão no header)');
  }, [clearBlurTimeout]);


  const handleDeleteItemForSidebar = useCallback(() => {
    if (!selectedItemIdGlobal) return;
    clearBlurTimeout(); // Limpa timeout de blur

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
         // Se a seção do item deletado ficou vazia e não é a única seção, deleta a seção também
         if (newSections.some(sec => sec.id === currentSelectedSectionId && sec.items.length === 0) && newSections.length > 1) {
            return newSections.filter(sec => sec.id !== currentSelectedSectionId);
         }
        return newSections;
      });

      // Limpa a seleção após a exclusão
      setSelectedItemIdGlobal(null);
      focusedElementRef.current = null;
      setSelectedSectionIdForStyling(null);
      setSidebarTargetTop(null);
    }
  }, [sectionsData, selectedItemIdGlobal, clearBlurTimeout]);

  const handleDeleteSectionForSidebar = useCallback(() => {
    const activeSectionId = getActiveSectionIdForActions();
    if (!activeSectionId || sectionsData.length <= 1) {
      // Adiciona uma validação para não deletar a última seção
      console.warn("Não é possível deletar a última seção.");
      return;
    }
    clearBlurTimeout(); // Limpa timeout de blur

    setSectionsData(prev => prev.filter(sec => sec.id !== activeSectionId));

    // Limpa a seleção após a exclusão
    if (selectedSectionIdForStyling === activeSectionId) {
      setSelectedSectionIdForStyling(null);
    }
    // Verifica se o item selecionado pertencia à seção deletada
    const sectionBeingDeleted = sectionsData.find(s => s.id === activeSectionId);
    if (sectionBeingDeleted && selectedItemIdGlobal && sectionBeingDeleted.items.some(it => it.id === selectedItemIdGlobal)) {
      setSelectedItemIdGlobal(null);
    }
     focusedElementRef.current = null;
     setSidebarTargetTop(null);
  }, [sectionsData, selectedItemIdGlobal, selectedSectionIdForStyling, getActiveSectionIdForActions, clearBlurTimeout]);


  // Efeito para posicionar a ActionSidebar quando o elemento focado muda
   useEffect(() => {
    // Adiciona a verificação de ambiente
    if (typeof window === 'undefined') {
        setSidebarTargetTop(null); // Garante que a sidebar fica escondida no servidor
        return;
    }

    // A sidebar só aparece no modo de edição E QUANDO um campo editável DENTRO de um item está focado E EXISTE no DOM.
    // focusedElementRef.current é o input/textarea focado. Precisamos do seu parent item.
    // Verifica se focusedElementRef.current existe e é um HTMLElement antes de chamar closest()
    if (!isEditingMode || !scrollableAreaRef.current || !(focusedElementRef.current instanceof HTMLElement)) {
        setSidebarTargetTop(null); // Esconde a sidebar
        return;
    }

    // Encontra o container pai do item a partir do elemento focado
    const parentItemElement = focusedElementRef.current.closest(`[id^="dossier-item-"]`);

    // Verifica se o container pai do item foi encontrado e é um HTMLElement válido para offsetTop
    if (!parentItemElement || !(parentItemElement instanceof HTMLElement)) {
         setSidebarTargetTop(null); // Esconde a sidebar se o parent item não for encontrado ou não for HTMLElement
         return;
    }

    // Agora temos certeza que parentItemElement é um HTMLElement válido e scrollableAreaRef.current não é null.
    const scrollableAreaElement = scrollableAreaRef.current as HTMLDivElement; // Cast seguro após a verificação
    const parentItemElementTyped = parentItemElement as HTMLElement; // Cast seguro

    // Calcula a posição do topo do container do item pai dentro da área scrollável (offsetTop é relativo ao offsetParent)
    const parentItemOffsetTop = parentItemElementTyped.offsetTop;
    // Obtém a altura do container do item pai
    const targetRectHeight = parentItemElementTyped.offsetHeight; // Use offsetHeight

    // Calcula a posição Y desejada para o centro da sidebar (centralizada verticalmente com o item)
    let finalSidebarTop = parentItemOffsetTop + (targetRectHeight / 2) - (sidebarHeightEstimate / 2);

    // Limita a posição para garantir que a sidebar fique visível e dentro da área scrollável
    const minTop = 0; // Começa no topo da área scrollável
    // Ajustar maxTop para considerar a altura da sidebar dentro da área scrollável total
    // scrollHeight é a altura total do conteúdo, offsetHeight é a altura visível do contêiner.
    // A posição máxima "top" da sidebar deve ser a altura total do conteúdo menos a altura da sidebar.
    const maxTop = scrollableAreaElement.scrollHeight - sidebarHeightEstimate;

    // Aplica os limites
    finalSidebarTop = Math.max(minTop, finalSidebarTop);
    finalSidebarTop = Math.min(finalSidebarTop, maxTop);

    // Define a nova posição da sidebar
    setSidebarTargetTop(finalSidebarTop);

    // Este useEffect depende do elemento focado (para saber onde posicionar) e dos dados das seções
    // (em caso de adição/remoção que mude o offset dos elementos)
  }, [focusedElementRef.current, isEditingMode, sidebarHeightEstimate, scrollableAreaRef, sectionsData]);


  // Efeito para atualizar a posição da sidebar DURANTE o scroll
  // Este efeito adiciona/remove o listener de scroll
  useEffect(() => {
     // Adiciona a verificação de ambiente
    if (typeof window === 'undefined') {
        return undefined; // Retorna função de limpeza que não faz nada no servidor
    }

    const scrollArea = scrollableAreaRef.current;

    // A sidebar só deve estar visível e precisar de re-posicionamento em scroll
    // QUANDO estiver em modo de edição E um CAMPO DE ITEM estiver focado (parent item existe e é HTMLElement).
     const isItemFieldFocused = focusedElementRef.current instanceof HTMLElement && focusedElementRef.current.closest(`[id^="dossier-item-"]`) instanceof HTMLElement;


    // Se não estamos em edição, não há área scrollável, ou nenhum campo de item está focado,
    // não precisamos do listener de scroll para a sidebar. Esconde a sidebar e sai.
    if (!scrollArea || !isEditingMode || !isItemFieldFocused) {
        setSidebarTargetTop(null); // Garante que a sidebar some
        return undefined; // Retorna uma função de limpeza que remove o listener (se adicionado)
    }

    // Se chegamos aqui, estamos em modo de edição e um campo de item VÁLIDO está focado.
    // Adicionamos o listener de scroll.
    const handleScroll = () => {
       // Dentro do handler de scroll, precisamos verificar novamente se as condições ainda são válidas
       // (principalmente se o elemento focado ainda existe e é um campo de item)
       const currentTargetElement = focusedElementRef.current;
       const currentScrollableAreaElement = scrollableAreaRef.current;

       // Verifica se o elemento focado ainda é um HTMLElement e se o parent item ainda existe e é HTMLElement
       if (!isEditingMode || !currentScrollableAreaElement || !(currentTargetElement instanceof HTMLElement)) {
            setSidebarTargetTop(null); // Esconde a sidebar se algo invalidou o estado
            return; // Sai do handler de scroll
       }
        const currentParentItemElement = currentTargetElement.closest(`[id^="dossier-item-"]`);

        // Verifica se o parent item ainda é válido (é HTMLElement)
       if (currentParentItemElement && currentParentItemElement instanceof HTMLElement) {
           // Recalcula a posição da sidebar com base na nova posição de scroll
           const parentItemOffsetTop = currentParentItemElement.offsetTop;
           const targetRectHeight = currentParentItemElement.offsetHeight;

           let targetTop = parentItemOffsetTop + (targetRectHeight / 2) - (sidebarHeightEstimate / 2);

           const minTop = 0;
           const maxTop = currentScrollableAreaElement.scrollHeight - sidebarHeightEstimate;

           targetTop = Math.max(minTop, targetTop);
           targetTop = Math.min(targetTop, maxTop);

           setSidebarTargetTop(targetTop);
       } else {
            // Se o elemento focado não está mais em um item válido (foi deletado, etc.)
            setSidebarTargetTop(null); // Esconde a sidebar
            // A limpeza dos refs deve vir do handler que causou a mudança (delete/blur).
       }
    };

    scrollArea.addEventListener('scroll', handleScroll);

    return () => {
      // Limpeza: Remove o listener de scroll quando este useEffect for re-executado ou o componente for desmontado
      scrollArea.removeEventListener('scroll', handleScroll);
    };

    // Este useEffect depende do elemento focado (para saber SE adicionar o listener e qual elemento observar)
    // e do modo de edição/área scrollável.
  }, [focusedElementRef.current, isEditingMode, sidebarHeightEstimate, scrollableAreaRef]);


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


  // Este handler é para cliques na área da seção (não em um item ou campo editável)
  // Ele agora APENAS controla a seleção visual da seção, NÃO posiciona a sidebar.
  const handleSectionAreaClick = useCallback((sectionId: string) => {
    if (!isEditingMode) return;

    clearBlurTimeout();

    // Clicar na área da seção deve desselecionar qualquer item e focar/selecionar a seção
    setSelectedItemIdGlobal(null);
    // Seleciona visualmente a seção
    setSelectedSectionIdForStyling(sectionId);

    // Clicar na área da seção tira o foco de qualquer campo e esconde a sidebar
    focusedElementRef.current = null;
    setSidebarTargetTop(null);
  }, [isEditingMode, clearBlurTimeout]);


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
  // Ele agora controla a seleção visual do item E tenta focar no primeiro campo editável do item.
  const handleItemSelect = useCallback((itemId: string | null) => {
    if (!isEditingMode || itemId === null) return;

    clearBlurTimeout();

    // Se o item clicado já está selecionado, deseleciona tudo.
    // Se não, seleciona o item e a seção pai, e tenta focar no primeiro campo editável do item.
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
        // Tenta encontrar o elemento DOM do item e focar no primeiro campo editável
         requestAnimationFrame(() => {
             const itemElement = document.getElementById(`dossier-item-${itemId}`);
             if (itemElement) {
                 // Seleciona o primeiro campo editável dentro do item (geralmente a descrição)
                 const editableField = itemElement.querySelector('input, textarea');
                 if (editableField instanceof HTMLElement) {
                     editableField.focus(); // Isso aciona handleFieldFocus
                 } else {
                     // Fallback: se não encontrar campo editável, a sidebar não aparecerá,
                     // pois ela só aparece com foco em campo editável de item.
                     focusedElementRef.current = null; // Garante que o ref está nulo
                     setSidebarTargetTop(null); // Garante que a sidebar está escondida
                 }
             } else {
                 // Se o elemento do item não foi encontrado (improvável após requestAnimationFrame)
                 focusedElementRef.current = null;
                 setSidebarTargetTop(null);
             }
         });
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
      // setIsEditingMode(false);

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
                           typeof window !== 'undefined' && // VERIFICAÇÃO ADICIONADA
                           focusedElementRef.current instanceof HTMLElement &&
                           focusedElementRef.current.closest(`[id^="dossier-item-"]`) instanceof HTMLElement;


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

            {/* Action Sidebar (posicionada absolutamente dentro da área scrollável) */}
            {/* Renderiza condicionalmente com base em showActionSidebar */}
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