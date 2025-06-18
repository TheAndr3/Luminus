// src/pages/DossierAppPage.tsx
"use client" // Diretiva do Next.js para indicar que este é um Componente do Cliente

// Importações de bibliotecas React e Next.js
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Head from 'next/head'; // Componente para manipular o <head> do HTML da página
import { useRouter, useParams } from 'next/navigation'; // Importa o hook de navegação do Next.js

// Importações de componentes customizados da aplicação
import PageHeader from '../../../../components/dossier/PageHeader';
import DossierHeader from '../../../../components/dossier/DossierHeader';
import SectionList from '../../../../components/dossier/SectionList';
import ActionSidebar from '../../../../components/dossier/ActionSidebar';

// Importações de tipos e funções de utilidade específicas do dossiê
import { SectionData, ItemData, EvaluationConcept, adaptDossierStateToPayload } from '../../../../types/dossier';
// IMPORTANTE PARA O BACKEND: Esta importação (createDossier) é um exemplo de como um serviço de API pode ser chamado.
// O backend definirá a assinatura e o comportamento real desta função.
import { createDossier, updateDossier, getDossierById, CreateDossierPayload, Dossier, UpdateDossierPayload } from '../../../../services/dossierServices';

// Importação de estilos CSS Modules para este componente
import styles from './DossierCRUDPage.module.css';

// Interface para a estrutura completa de dados do dossiê retornada pelo backend
interface DossierSection {
  id: number;
  name: string;
  description: string;
  weigth: number;
  questions: {
    id: number;
    description: string;
  }[];
}

// Seção vazia padrão para garantir que sempre haja pelo menos uma seção
const DEFAULT_SECTION: SectionData = {
  id: `section-${Date.now()}`,
  title: "",
  description: "",
  weight: "100",
  items: [{
    id: `item-${Date.now()}`,
    description: "",
    value: "N/A"
  }]
};

// --- Componente Principal da Página ---
const DossierAppPage: React.FC = () => {
  // --- Estados do Componente ---
  const [dossierTitle, setDossierTitle] = useState("");
  const [dossierDescription, setDossierDescription] = useState("");
  const [evaluationConcept, setEvaluationConcept] = useState<EvaluationConcept>('numerical');
  const [sectionsData, setSectionsData] = useState<SectionData[]>([]);
  const [isEditingMode, setIsEditingMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para controlar a seleção visual e o foco
  const [selectedSectionIdForStyling, setSelectedSectionIdForStyling] = useState<string | null>(null);
  const [selectedItemIdGlobal, setSelectedItemIdGlobal] = useState<string | null>(null);

  // Refs para manipulação de DOM e controle de comportamento
  const focusedElementRef = useRef<HTMLElement | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ignoreNextBlurRef = useRef(false);

  // Estados e Refs para o posicionamento da ActionSidebar
  const [sidebarTargetTop, setSidebarTargetTop] = useState<number | null>(null);
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  const sidebarHeightEstimate = 240;

  // Estado para garantir que o código dependente do cliente só rode após a montagem no cliente
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const params = useParams();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const mode = searchParams.get('mode');
  const dossierId = params?.crud !== 'create' ? parseInt(params.crud as string) : null;

  useEffect(() => {
    const professorId = localStorage.getItem('professorId');
    if (professorId) {
      setIsAuthenticated(true); // Id do professor encontrado, permite a renderização da página
    } else {
      router.push('/login'); // Não foi encontrado o id do professor, redireciona para o login
    }
    
    setIsClient(true);
  }, [router]);

  // Carrega os dados do dossiê se estiver em modo de edição
  useEffect(() => {
    const loadDossier = async () => {
      if (!dossierId) {
        // Se estiver criando novo dossiê, inicializa com seção padrão
        setSectionsData([DEFAULT_SECTION]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await getDossierById(dossierId);
        const dossier = response.data;
        
        setDossierTitle(dossier.name);
        setDossierDescription(dossier.description);
        setEvaluationConcept(dossier.evaluation_method as EvaluationConcept);
        
        // Adapta as seções do backend para o formato da UI
        const adaptedSections: SectionData[] = dossier.sections.map((section: DossierSection) => ({
          id: section.id.toString(),
          title: section.name,
          description: section.description,
          weight: section.weigth.toString(),
          items: section.questions.map((question: { id: number; description: string }) => ({
            id: question.id.toString(),
            description: question.description,
            value: 'N/A'
          }))
        }));

        // Garante que haja pelo menos uma seção
        if (adaptedSections.length === 0) {
          adaptedSections.push(DEFAULT_SECTION);
        }
        
        setSectionsData(adaptedSections);
        // Define o modo de edição inicial com base no parâmetro da URL
        setIsEditingMode(mode !== 'view');
      } catch (error: any) {
        setError(error.message || 'Erro ao carregar dossiê');
      } finally {
        setIsLoading(false);
      }
    };

    if (isClient) {
      loadDossier();
    }
  }, [dossierId, isClient, mode]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Funções de Callback e Manipuladores de Evento (memoizados com useCallback) ---

  // Função para limpar o timeout de blur e sinalizar para ignorar o próximo evento de blur
  const clearBlurTimeoutAndSignalIgnore = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    ignoreNextBlurRef.current = true;
  }, []);

  // Manipulador de foco para campos editáveis (título, descrição, itens)
  const handleFieldFocus = useCallback((element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => {
    if (!isEditingMode) return; // Só processa o foco se estiver em modo de edição

    if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
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

  // Manipulador de "blur" (perda de foco) para campos editáveis
  const handleFieldBlur = useCallback(() => {

    blurTimeoutRef.current = setTimeout(() => {
      if (ignoreNextBlurRef.current) {
        ignoreNextBlurRef.current = false;
        return;
      }
      focusedElementRef.current = null;
      setSelectedItemIdGlobal(null);
      setSelectedSectionIdForStyling(null);
      setSidebarTargetTop(null); // Esconde a ActionSidebar
    }, 100); // Pequeno delay para permitir que outras interações ocorram
  }, []);

  // Manipulador para seleção de um item (clique em um SectionItem)
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

  // Manipulador para clique na área de uma seção (não em um item ou campo editável)
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

  // useEffect para posicionamento da ActionSidebar quando um campo de item está focado
  // Também lida com o reposicionamento da sidebar durante o scroll
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
  // Função para voltar à página de dossiês
  const handleBackClick = useCallback(() => {
    router.push('/dossie'); // Redireciona para a página de dossiês
  }, [router]);

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
  // Adiciona uma nova seção
  const handleAddNewSectionForSidebar = useCallback(() => {
    // MOCK: Log de depuração
    console.log('%cAÇÃO: handleAddNewSectionForSidebar: INÍCIO', 'color: #2E8B57; font-weight: bold;', { selectedItemIdGlobal, selectedSectionIdForStyling });
    if (!isEditingMode) return;

    // MOCK: IDs gerados no frontend com Date.now() e Math.random()
    // Em um sistema real, o backend pode gerar e retornar IDs após a criação, ou o frontend pode usar UUIDs mais robustos
    const newSectionId = `section-${Date.now()}`;
    const newItemId = `item-${newSectionId}-init-${Math.random().toString(36).substr(2, 5)}`;
    const newSectionData: SectionData = { id: newSectionId, title: ``, description: ``, weight: '0', items: [{ id: newItemId, description: '', value: 'N/A' }]};

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

  // Adiciona um novo item à seção
  const handleAddItemForSidebar = useCallback(() => {
    // MOCK: Log de depuração
    console.log('%cAÇÃO: handleAddItemForSidebar: INÍCIO', 'color: #2E8B57; font-weight: bold;', { selectedItemIdGlobal, selectedSectionIdForStyling });
    if (!isEditingMode) return;

    let targetSectionId = selectedSectionIdForStyling;
    if (!targetSectionId && selectedItemIdGlobal) {
        const sectionOfItem = sectionsData.find(s => Array.isArray(s.items) && s.items.some(it => it.id === selectedItemIdGlobal));
        if (sectionOfItem) targetSectionId = sectionOfItem.id;
    }

    if (!targetSectionId) {
      // MOCK: Log de aviso
      console.warn("handleAddItemForSidebar: Nenhuma seção alvo identificada.");
      return;
    }

    // MOCK: IDs gerados no frontend
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

  // Deleta o item atualmente selecionado
  const handleDeleteItemForSidebar = useCallback(() => {
    // MOCK: Log de depuração
    console.log('%cAÇÃO: handleDeleteItemForSidebar: INÍCIO', 'color: #DC143C; font-weight: bold;', { selectedItemIdGlobal });
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

  // Deleta a seção atualmente selecionada/focada
  const handleDeleteSectionForSidebar = useCallback(() => {
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

  // Manipulador para clique no botão de configurações do dossiê (no DossierHeader)
  const handleDossierSettingsClick = useCallback(() => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    ignoreNextBlurRef.current = false;
    // MOCK: Log de ação. Em um cenário real, poderia abrir um modal de configurações
    console.log('Configurações do Dossiê (clicado via botão no header)');
  }, []);

  // ==========================================================================================
  // == IMPORTANTE PARA O BACKEND: PONTO PRINCIPAL DE INTERAÇÃO PARA SALVAR DADOS ==
  // Esta função `handleSave` é chamada pelo botão "Salvar Alterações"
  // É aqui que a lógica para enviar os dados do dossiê para a API do backend será implementada
  // ==========================================================================================
  const handleSave = useCallback(async () => {
    try {
      const professorId = localStorage.getItem('professorId');
      if (!professorId) {
          alert("Sua sessão expirou. Por favor, faça o login novamente.");
          router.push('/login');
          return;
      }

      // Validações
      if (!dossierTitle.trim()) {
        throw new Error("O título do Dossiê não pode ser vazio.");
      }

      if (!evaluationConcept) {
        throw new Error("O método de avaliação não pode ser vazio.");
      }

      const hasSectionWithQuestion = sectionsData.some(sec => Array.isArray(sec.items) && sec.items.length > 0);
      if (!hasSectionWithQuestion) {
        throw new Error("O Dossiê deve conter pelo menos uma seção com um item/questão.");
      }

      // Validações por seção
      let totalWeight = 0;
      for (const sec of sectionsData) {
        if (!sec.title.trim()) {
          throw new Error(`A seção com ID "${sec.id}" não pode ter um título vazio.`);
        }

        if (Array.isArray(sec.items)) {
          for (const item of sec.items) {
            if (!item.description.trim()) {
              throw new Error(`O item com ID "${item.id}" na seção "${sec.title}" não pode ter a descrição vazia.`);
            }
          }
        }

        const parsedWeight = parseInt(sec.weight, 10);
        if (isNaN(parsedWeight)) {
          throw new Error(`O peso da seção "${sec.title}" é inválido. Deve ser um número.`);
        }
        totalWeight += parsedWeight;
      }

      if (totalWeight !== 100) {
        throw new Error(`A soma dos pesos de todas as seções deve ser 100%, mas é ${totalWeight}%.`);
      }

      // Prepara o payload
      const payload = adaptDossierStateToPayload(
        dossierTitle,
        dossierDescription,
        evaluationConcept,
        sectionsData,
        parseInt(professorId)
      );

      if (dossierId) {
        // Atualizar dossiê existente
        await updateDossier(dossierId, {
          ...payload,
          costumUser_id: parseInt(professorId)
        });
      } else {
        // Criar novo dossiê
        await createDossier({
          ...payload,
          costumUser_id: parseInt(professorId)
        });
      }

      router.push('/dossie');
    } catch (error: any) {
      setError(error.message || 'Falha ao salvar dossiê');
    }
  }, [dossierTitle, dossierDescription, evaluationConcept, sectionsData, dossierId, router]);

  // --- Lógica de UI derivada de estados (useMemo) ---
  // Determina se o botão de deletar item deve estar habilitado
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

  // Determina se o botão de deletar seção deve estar habilitado
  const canDeleteSection = useMemo(() => {
    const hasSelection = !!selectedSectionIdForStyling || !!selectedItemIdGlobal;
    const isMoreThanOneSection = sectionsData.length > 1;
    return hasSelection && isMoreThanOneSection;
  }, [selectedSectionIdForStyling, selectedItemIdGlobal, sectionsData.length]);


  // Determina se o elemento focado é um campo de item, para mostrar a ActionSidebar
  const isFocusedElementAnItemField = isClient &&
                                     focusedElementRef.current instanceof HTMLElement &&
                                     focusedElementRef.current.closest(`[id^="dossier-item-"]`) instanceof HTMLElement;
  // Determina se a ActionSidebar deve ser mostrada
  const showActionSidebar = isClient && isEditingMode && isFocusedElementAnItemField;

  // useEffect para logs de depuração relacionados à visibilidade da ActionSidebar (opcional)
  useEffect(() => {
    if(isClient){
        // MOCK: Log de depuração comentado. Pode ser removido
        // console.log('%cDEBUG: showActionSidebar check:', 'color: #8A2BE2;', { /* ... logs ... */ });
    }
  }, [isEditingMode, focusedElementRef.current, isFocusedElementAnItemField, sidebarTargetTop, showActionSidebar, isClient]);


  // --- Renderização do Componente ---
  if (!isClient || !isAuthenticated) {
    return <div>Carregando e verificando autenticação...</div>;
  }


  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <>
      {/* Define o título da aba do navegador */}
      <Head>
        <title>{dossierId ? 'Editar Dossiê' : 'Novo Dossiê'}</title>
      </Head>
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
          {/* IMPORTANTE PARA O BACKEND: O botão abaixo dispara a função handleSave(), que é o ponto principal de interação com a API para salvar */}
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