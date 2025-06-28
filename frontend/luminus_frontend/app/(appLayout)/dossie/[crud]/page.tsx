// src/pages/DossierAppPage.tsx
"use client"

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

import PageHeader from '../../../../components/dossier/PageHeader';
import DossierHeader from '../../../../components/dossier/DossierHeader';
import SectionList from '../../../../components/dossier/SectionList';
import ActionSidebar from '../../../../components/dossier/ActionSidebar';
import EvaluationSettingsModal from '../../../../components/dossier/EvaluationSettingsModal';
import { ErroMessageDialog } from '../../classroom/components/erroMessageDialog';

import { SectionData, ItemData, EvaluationConcept, adaptDossierStateToPayload, EvaluationMethodItem } from '../../../../types/dossier';
import { 
    createDossier, 
    updateDossier, 
    getDossierById, 
    // Dossier, // Não usado diretamente aqui
    UpdateDossierPayload, 
    CreateDossierPayload as ServiceCreateDossierPayload, 
    DossierResponse,
    EvaluationMethod as BackendEvaluationMethod, // Para tipar a resposta do backend
    EvaluationType as BackendEvaluationType // Para tipar a resposta do backend
} from '../../../../services/dossierServices';


import styles from './DossierCRUDPage.module.css';

// Interface para a estrutura esperada do evaluation_method na resposta do GET
interface EvaluationMethodFromAPI extends BackendEvaluationMethod {
    id?: number | string; // O backend pode incluir um ID para o método principal
    evaluationType: Array<BackendEvaluationType & { id?: number | string }>; // Tipos podem ter IDs
}


interface DossierDetailFromAPI {
  id: number;
  customUserId: number; // Atualizado para customUserId
  name: string;
  description: string;
  evaluation_method: EvaluationMethodFromAPI; // Usando a interface mais específica
  sections: { 
    [key: string]: {
        id: number | string;
        name: string;
        description: string;
        weigth: number;
        questions: {
            [key: string]: {
                id: number | string;
                name: string; // Corresponde à 'description' do ItemData
            }
        }
    }
  };
}


const DEFAULT_SECTION: SectionData = {
  id: `section-${Date.now()}`,
  title: "",
  description: "",
  weight: "100",
  items: [{
    id: `item-${Date.now()}-default`,
    description: "",
    value: "N/A" // value em ItemData da UI não é diretamente a nota
  }]
};

const DEFAULT_EVALUATION_METHODS_LETTER: EvaluationMethodItem[] = [
  { id: `default-method-${Date.now()}-1`, name: 'Máximo', value: '10.0' },
  { id: `default-method-${Date.now()}-2`, name: 'Mínimo', value: '0.0' },
];


const DossierAppPage: React.FC = () => {
  const [dossierTitle, setDossierTitle] = useState("");
  const [dossierDescription, setDossierDescription] = useState("");
  const [evaluationConcept, setEvaluationConcept] = useState<EvaluationConcept>('numerical');
  const [sectionsData, setSectionsData] = useState<SectionData[]>([]);
  const [isEditingMode, setIsEditingMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  const [selectedSectionIdForStyling, setSelectedSectionIdForStyling] = useState<string | null>(null);
  const [selectedItemIdGlobal, setSelectedItemIdGlobal] = useState<string | null>(null);

  const focusedElementRef = useRef<HTMLElement | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ignoreNextBlurRef = useRef(false);

  const [sidebarTargetTop, setSidebarTargetTop] = useState<number | null>(null);
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  const sidebarHeightEstimate = 240;

  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode');
  const dossierIdParam = params?.crud;
  const dossierId = dossierIdParam && dossierIdParam !== 'create' ? parseInt(dossierIdParam as string) : null;
  const templateId = searchParams.get('templateId');


  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [evaluationMethodsForModal, setEvaluationMethodsForModal] = useState<EvaluationMethodItem[]>(
    DEFAULT_EVALUATION_METHODS_LETTER.map(m => ({...m}))
  );

  // Função para mostrar o diálogo de erro
  const showErrorDialog = useCallback((message: string) => {
    setErrorDialogMessage(message);
    setErrorDialogOpen(true);
    setError(message); // Mantém o estado de erro para compatibilidade
  }, []);

  const closeErrorDialog = useCallback(() => {
    setErrorDialogOpen(false);
    setError(null);
  }, []);

  useEffect(() => {
    const costumUserId = localStorage.getItem('professorId');
    if (costumUserId) {
      setIsAuthenticated(true);
    } else {
      router.push('/login');
    }
    setIsClient(true);
  }, [router]);

  useEffect(() => {
    const loadDossier = async () => {
      setIsLoading(true);
      setError(null);

      if (!dossierId) { // Modo de criação
        // Se templateId está presente, carrega o dossiê como template
        if (templateId) {
          try {
            const response: DossierResponse = await getDossierById(Number(templateId));
            const dossierFromApi = response.data as DossierDetailFromAPI;
            if (!dossierFromApi || !dossierFromApi.evaluation_method) {
              throw new Error("Dossiê não encontrado ou formato de resposta inválido.");
            }
            setDossierTitle(dossierFromApi.name);
            setDossierDescription(dossierFromApi.description);
            // Determina o conceito de avaliação ('numerical' ou 'letter')
            const conceptNameFromApi = dossierFromApi.evaluation_method.name.toLowerCase();
            let conceptTypeFromApi: EvaluationConcept;
            if (conceptNameFromApi === 'letter') {
                conceptTypeFromApi = 'letter';
            } else if (conceptNameFromApi === 'numerical') {
                conceptTypeFromApi = 'numerical';
            } else {
                conceptTypeFromApi = 'numerical';
            }
            setEvaluationConcept(conceptTypeFromApi);
            // Métodos de avaliação
            if (conceptTypeFromApi === 'letter') {
                const typesFromApi = dossierFromApi.evaluation_method.evaluationType;
                if (Array.isArray(typesFromApi) && typesFromApi.length > 0) {
                    const methodsFromApi = typesFromApi.map((et, idx) => ({
                        id: et.id?.toString() || `loaded-type-${idx}-${Date.now()}`,
                        name: et.name,
                        value: typeof et.value === 'number' ? et.value.toFixed(1) : parseFloat(et.value || "0").toFixed(1),
                    }));
                    setEvaluationMethodsForModal(methodsFromApi.length >= 2 ? methodsFromApi : DEFAULT_EVALUATION_METHODS_LETTER.map(m => ({...m})));
                } else {
                    setEvaluationMethodsForModal(DEFAULT_EVALUATION_METHODS_LETTER.map(m => ({...m})));
                }
            } else {
                setEvaluationMethodsForModal(DEFAULT_EVALUATION_METHODS_LETTER.map(m => ({...m})));
            }
            // Seções
            const adaptedSections: SectionData[] = Object.values(dossierFromApi.sections || {}).map(section => ({
                id: section.id.toString(),
                title: section.name,
                description: section.description || "",
                weight: section.weigth.toString(),
                items: Object.values(section.questions || {}).map(question => ({
                    id: question.id.toString(),
                    description: question.name,
                    value: 'N/A'
                }))
            }));
            setSectionsData(adaptedSections.length > 0 ? adaptedSections : [JSON.parse(JSON.stringify(DEFAULT_SECTION))]);
            setIsEditingMode(true);
            setIsLoading(false);
            return;
          } catch (err) {
            showErrorDialog('Erro ao carregar dossiê como template.');
            setDossierTitle("");
            setDossierDescription("");
            setSectionsData([JSON.parse(JSON.stringify(DEFAULT_SECTION))]);
            setEvaluationConcept('numerical');
            setEvaluationMethodsForModal(DEFAULT_EVALUATION_METHODS_LETTER.map(m => ({...m})));
            setIsEditingMode(true);
            setIsLoading(false);
            return;
          }
        } else {
          setDossierTitle("");
          setDossierDescription("");
          setSectionsData([JSON.parse(JSON.stringify(DEFAULT_SECTION))]); // Deep copy
          setEvaluationConcept('numerical');
          setEvaluationMethodsForModal(DEFAULT_EVALUATION_METHODS_LETTER.map(m => ({...m})));
          setIsEditingMode(true);
          setIsLoading(false);
          return;
        }
      }

      // Modo de edição/visualização
      try {
        const response: DossierResponse = await getDossierById(dossierId);
        // Assume-se que response.data tem a estrutura de DossierDetailFromAPI
        const dossierFromApi = response.data as DossierDetailFromAPI;

        if (!dossierFromApi || !dossierFromApi.evaluation_method) {
            throw new Error("Dossiê não encontrado ou formato de resposta inválido.");
        }

        setDossierTitle(dossierFromApi.name);
        setDossierDescription(dossierFromApi.description);
        
        // Determina o conceito de avaliação ('numerical' ou 'letter')
        const conceptNameFromApi = dossierFromApi.evaluation_method.name.toLowerCase();
        let conceptTypeFromApi: EvaluationConcept;
        if (conceptNameFromApi === 'letter') {
            conceptTypeFromApi = 'letter';
        } else if (conceptNameFromApi === 'numerical') {
            conceptTypeFromApi = 'numerical';
        } else {
            console.warn(`Conceito de avaliação desconhecido '${conceptNameFromApi}' recebido da API. Usando 'numerical' como padrão.`);
            conceptTypeFromApi = 'numerical'; // Fallback
        }
        setEvaluationConcept(conceptTypeFromApi);

        // Processa os métodos de avaliação para o modal, se for 'letter'
        if (conceptTypeFromApi === 'letter') {
            const typesFromApi = dossierFromApi.evaluation_method.evaluationType; // Deve ser um array
            if (Array.isArray(typesFromApi) && typesFromApi.length > 0) {
                const methodsFromApi = typesFromApi.map((et, idx) => ({
                    id: et.id?.toString() || `loaded-type-${idx}-${Date.now()}`,
                    name: et.name,
                    // Garante que o valor seja uma string formatada com uma casa decimal para a UI
                    value: typeof et.value === 'number' ? et.value.toFixed(1) : parseFloat(et.value || "0").toFixed(1),
                }));

                if (methodsFromApi.length >= 2) {
                    setEvaluationMethodsForModal(methodsFromApi);
                } else {
                    console.warn("API retornou menos de 2 métodos de avaliação para 'letter'. Usando defaults da UI.");
                    setEvaluationMethodsForModal(DEFAULT_EVALUATION_METHODS_LETTER.map(m => ({...m})));
                }
            } else {
                 console.warn("API não retornou métodos de avaliação para 'letter' ou formato inválido. Usando defaults da UI.");
                setEvaluationMethodsForModal(DEFAULT_EVALUATION_METHODS_LETTER.map(m => ({...m})));
            }
        } else { // 'numerical' ou fallback
            // Para 'numerical', o modal pode ser preenchido com defaults, embora não sejam usados diretamente no payload se for numérico.
            setEvaluationMethodsForModal(DEFAULT_EVALUATION_METHODS_LETTER.map(m => ({...m})));
        }
        
        const adaptedSections: SectionData[] = Object.values(dossierFromApi.sections || {}).map(section => ({
            id: section.id.toString(),
            title: section.name,
            description: section.description || "", // Garante que description seja string
            weight: section.weigth.toString(),
            items: Object.values(section.questions || {}).map(question => ({
                id: question.id.toString(),
                description: question.name, 
                value: 'N/A' // 'value' aqui é para a estrutura ItemData da UI, não a nota final.
            }))
        }));

        if (adaptedSections.length === 0) {
          adaptedSections.push(JSON.parse(JSON.stringify(DEFAULT_SECTION))); // Deep copy
        }
        
        setSectionsData(adaptedSections);
        setIsEditingMode(modeParam !== 'view');
      } catch (error: any) {
        console.error("Erro ao carregar dossiê:", error);
        showErrorDialog(
          error.response?.data?.msg || error.message || 'Erro ao carregar dossiê. Tente recarregar a página.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (isClient && isAuthenticated) {
      loadDossier();
    } else if (isClient && !dossierId && !isAuthenticated) { 
        // Não autenticado e tentando criar, já tratado pelo useEffect de autenticação
        setIsLoading(false);
    } else if (isClient && !dossierId && isAuthenticated) { 
        // Autenticado e criando novo dossiê
        setDossierTitle("");
        setDossierDescription("");
        setSectionsData([JSON.parse(JSON.stringify(DEFAULT_SECTION))]); // Deep copy
        setEvaluationConcept('numerical');
        setEvaluationMethodsForModal(DEFAULT_EVALUATION_METHODS_LETTER.map(m => ({...m})));
        setIsEditingMode(true);
        setIsLoading(false);
    }
  // Adicionado dossierIdParam para reagir a mudanças no ID da URL
  }, [dossierId, isClient, modeParam, isAuthenticated, dossierIdParam, templateId]);
  

  const clearBlurTimeoutAndSignalIgnore = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    ignoreNextBlurRef.current = true;
  }, []);

  const handleFieldFocus = useCallback((element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => {
    if (!isEditingMode) return; 

    if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
    }
    ignoreNextBlurRef.current = false;

    focusedElementRef.current = element; 

    if (context.type === 'item') {
      setSelectedItemIdGlobal(context.id);
      const sectionOfItem = sectionsData.find((s: SectionData) =>
        Array.isArray(s.items) && s.items.some((item: ItemData) => item.id === context.id)
      );
      setSelectedSectionIdForStyling(sectionOfItem ? sectionOfItem.id : null);
    } else if (context.type === 'section') { 
      setSelectedSectionIdForStyling(context.id);
      setSelectedItemIdGlobal(null);
    } else { // Foco nos headers da página, por exemplo
        setSelectedItemIdGlobal(null);
        setSelectedSectionIdForStyling(null);
    }
  }, [isEditingMode, sectionsData]);

  const handleFieldBlur = useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => {
      if (ignoreNextBlurRef.current) {
        ignoreNextBlurRef.current = false;
        return;
      }
      if (isSettingsModalOpen) return;

      focusedElementRef.current = null;
      setSelectedItemIdGlobal(null);
      setSelectedSectionIdForStyling(null);
      setSidebarTargetTop(null); 
    }, 150);
  }, [isSettingsModalOpen]);

  const handleItemSelect = useCallback((itemId: string) => {
     if (!isEditingMode) return;
     clearBlurTimeoutAndSignalIgnore();

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
          setSelectedSectionIdForStyling(sectionOfItem ? sectionOfItem.id : null);
          // Tenta focar o campo de input/textarea dentro do item se ele existir.
          const itemElement = document.getElementById(`dossier-item-${itemId}`);
          const inputInItem = itemElement?.querySelector('input, textarea') as HTMLElement | null;
          if (inputInItem) {
              focusedElementRef.current = inputInItem; // Define como elemento focado para cálculo da sidebar
          } else {
              focusedElementRef.current = itemElement; // Fallback para o próprio elemento do item
          }
     }
  }, [isEditingMode, sectionsData, selectedItemIdGlobal, clearBlurTimeoutAndSignalIgnore]);

  const handleSectionAreaClick = useCallback((sectionId: string) => {
     if (!isEditingMode) return;
     clearBlurTimeoutAndSignalIgnore();

      if (selectedSectionIdForStyling === sectionId && !selectedItemIdGlobal) { // Se já selecionado e nenhum item focado, deseleciona
          setSelectedSectionIdForStyling(null);
          focusedElementRef.current = null; // Limpa o foco
      } else {
          setSelectedSectionIdForStyling(sectionId);
          // Tenta focar o input do título da seção.
          const sectionTitleInput = document.querySelector(`#dossier-section-${sectionId} input[aria-label*="Título"]`) as HTMLElement | null;
          if (sectionTitleInput) {
            focusedElementRef.current = sectionTitleInput;
          } else {
            // Fallback para o elemento da seção se o input do título não for encontrado
            focusedElementRef.current = document.getElementById(`dossier-section-${sectionId}`);
          }
      }
     setSelectedItemIdGlobal(null); // Garante que nenhum item esteja selecionado ao clicar na área da seção
     // Não necessariamente reseta sidebarTargetTop aqui, pois o foco pode ser em um campo da seção que a exibe.
     // A sidebar deve aparecer se o foco for em um campo de item. Se o foco for na seção, ela não deve aparecer.
     // A lógica em useEffect[focusedElementRef.current,...] cuidará de mostrar/esconder a sidebar.
  }, [isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal, clearBlurTimeoutAndSignalIgnore]);

  useEffect(() => {
    if (!isClient || typeof window === 'undefined' || !scrollableAreaRef.current) {
        if (sidebarTargetTop !== null) setSidebarTargetTop(null);
        return;
    }
    const focusedEl = focusedElementRef.current;
    const scrollableAreaEl = scrollableAreaRef.current;
    
    // Verifica se o elemento focado (ou seu pai mais próximo que seja um item) é de fato um item.
    const isItemFieldCurrentlyFocused = focusedEl instanceof HTMLElement &&
                                     focusedEl.closest(`[id^="dossier-item-"]`) instanceof HTMLElement;

    if (!isEditingMode || !isItemFieldCurrentlyFocused || !focusedEl) {
      if (sidebarTargetTop !== null) setSidebarTargetTop(null);
      return;
    }

    // Pega o elemento pai do item (ex: o div com id `dossier-item-...`)
    const parentItemEl = focusedEl.closest(`[id^="dossier-item-"]`) as HTMLElement;
    if (!parentItemEl) { // Segurança adicional, embora isItemFieldCurrentlyFocused já verifique
        if (sidebarTargetTop !== null) setSidebarTargetTop(null);
        return;
    }

    const calculateAndSetPosition = () => {
        if (!parentItemEl || !scrollableAreaEl) return; // Checa de novo se os elementos existem
        const parentItemRect = parentItemEl.getBoundingClientRect();
        const scrollAreaRect = scrollableAreaEl.getBoundingClientRect();
        
        // Se o item estiver fora da área visível do scroll, não mostra a sidebar
        if (parentItemRect.bottom < scrollAreaRect.top || parentItemRect.top > scrollAreaRect.bottom) {
            setSidebarTargetTop(null);
            return;
        }

        // Calcula a posição do topo do item relativa ao conteúdo da área de scroll
        const itemTopInViewport = parentItemRect.top - scrollAreaRect.top; // Posição do topo do item dentro da viewport da scrollArea
        const itemTopInScrollContent = itemTopInViewport + scrollableAreaEl.scrollTop; // Posição absoluta dentro do conteúdo scrollável
        
        // Centraliza a sidebar verticalmente em relação ao item
        let newTop = itemTopInScrollContent + (parentItemRect.height / 2) - (sidebarHeightEstimate / 2);
        
        // Garante que a sidebar não saia dos limites da área de scroll
        const minAllowedTop = 5; // Pequeno padding do topo
        const maxAllowedTop = Math.max(minAllowedTop, scrollableAreaEl.scrollHeight - sidebarHeightEstimate - 5); // Pequeno padding do fundo
        
        newTop = Math.max(minAllowedTop, Math.min(newTop, maxAllowedTop));
        
        // Arredonda para evitar re-renders por diferenças mínimas de float
        const roundedNewTop = Math.round(newTop);
        const roundedCurrentTop = sidebarTargetTop !== null ? Math.round(sidebarTargetTop) : null;

        if (roundedNewTop !== roundedCurrentTop) {
            setSidebarTargetTop(roundedNewTop);
        }
    };

    calculateAndSetPosition(); // Calcula imediatamente
    const debouncedCalculate = setTimeout(calculateAndSetPosition, 50); // E recalcula após um pequeno delay para estabilizar

    // Adiciona listeners para recalcular em scroll ou resize
    scrollableAreaEl.addEventListener('scroll', calculateAndSetPosition);
    window.addEventListener('resize', calculateAndSetPosition);

    return () => {
        clearTimeout(debouncedCalculate);
        scrollableAreaEl.removeEventListener('scroll', calculateAndSetPosition);
        window.removeEventListener('resize', calculateAndSetPosition);
    };
  // Adicionado isClient para garantir que execute apenas no cliente
  }, [focusedElementRef.current, isEditingMode, sidebarHeightEstimate, sidebarTargetTop, isClient]);


  const handleBackClick = useCallback(() => { router.push('/dossie'); }, [router]);

  const handleToggleEditMode = useCallback(() => {
    setIsEditingMode(prev => {
      const newEditingMode = !prev;
      if (!newEditingMode) { // Saindo do modo de edição
        if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
        ignoreNextBlurRef.current = false;
        focusedElementRef.current = null;
        setSelectedItemIdGlobal(null);
        setSelectedSectionIdForStyling(null);
        setSidebarTargetTop(null); 
      }
      // Se entrando no modo de edição, não precisa fazer nada especial aqui,
      // o foco nos campos habilitará a sidebar e seleção.
      return newEditingMode; 
    });
  }, []);

  const handleDossierTitleChange = useCallback((newTitle: string) => { setDossierTitle(newTitle); }, []);
  const handleDossierDescriptionChange = useCallback((newDescription: string) => { setDossierDescription(newDescription); }, []);
  const handleEvaluationConceptChange = useCallback((concept: EvaluationConcept) => { 
    setEvaluationConcept(concept);
    if (concept === 'letter' && evaluationMethodsForModal.length < 2) {
        // Se mudar para 'letter' e não tiver métodos suficientes, preenche com defaults.
        // A UI deve então forçar o usuário a abrir o modal para configurar se tentar salvar.
        setEvaluationMethodsForModal(DEFAULT_EVALUATION_METHODS_LETTER.map(m => ({...m})));
    }
  }, [evaluationMethodsForModal]); // Adicionado evaluationMethodsForModal como dependência

  const handleSectionDescriptionChange = useCallback((sectionId: string, newDescription: string) => {
    setSectionsData(prev => prev.map(sec => (sec.id === sectionId ? { ...sec, description: newDescription } : sec)));
  }, []);
  const handleSectionTitleChange = useCallback((sectionId: string, newTitle: string) => {
    setSectionsData(prev => prev.map(sec => (sec.id === sectionId ? { ...sec, title: newTitle } : sec)));
  }, []);
  const handleSectionWeightChange = useCallback((sectionId: string, newWeight: string) => {
    setSectionsData(prev => prev.map(sec => (sec.id === sectionId ? { ...sec, weight: newWeight } : sec)));
  }, []);
  const handleItemChange = useCallback(
    (sectionId: string, itemId: string, field: 'description' | 'value', newValue: string) => {
      setSectionsData(prev =>
        prev.map(sec =>
          sec.id === sectionId
            ? { ...sec, items: Array.isArray(sec.items) ? sec.items.map(item => (item.id === itemId ? { ...item, [field]: newValue } : item)) : [] }
            : sec
        )
      );
    }, []);

  const canDeleteItem = useMemo(() => {
    if (!selectedItemIdGlobal) return false;
    const sectionOfSelectedItem = sectionsData.find(s =>
      Array.isArray(s.items) && s.items.some(item => item.id === selectedItemIdGlobal)
    );
    // Se não encontrar a seção do item selecionado (improvável, mas seguro), permite deletar.
    if (!sectionOfSelectedItem) return true; 

    // Não pode deletar se for o único item na única seção.
    const isOnlySection = sectionsData.length === 1;
    const isLastItemInItsSection = sectionOfSelectedItem.items.length === 1;
    
    return !(isOnlySection && isLastItemInItsSection);
  }, [selectedItemIdGlobal, sectionsData]);

  const canDeleteSection = useMemo(() => {
    // Determina qual seção está "em foco" para exclusão.
    // Pode ser a seção explicitamente selecionada OU a seção do item selecionado.
    let targetSectionId = selectedSectionIdForStyling;
    if (!targetSectionId && selectedItemIdGlobal) { // Se nenhuma seção selecionada, mas um item sim
        const sectionOfItem = sectionsData.find(s => Array.isArray(s.items) && s.items.some(it => it.id === selectedItemIdGlobal));
        if (sectionOfItem) targetSectionId = sectionOfItem.id;
    }
    // Permite deletar seção se uma seção estiver efetivamente selecionada E houver mais de uma seção no total.
    return !!targetSectionId && sectionsData.length > 1;
  }, [selectedSectionIdForStyling, selectedItemIdGlobal, sectionsData]);

  const handleAddNewSectionForSidebar = useCallback(() => {
    if (!isEditingMode) return;
    clearBlurTimeoutAndSignalIgnore(); // Importante para manter o foco gerenciado

    const newSectionId = `section-${Date.now()}`;
    const newItemId = `item-${newSectionId}-init-${Math.random().toString(36).substr(2, 5)}`;
    const newSectionData: SectionData = { 
        id: newSectionId, title: ``, description: ``, 
        weight: sectionsData.length === 0 ? '100' : '0', // Primeira seção peso 100, outras 0 por padrão
        items: [{ id: newItemId, description: '', value: 'N/A' }]
    };

    let newSectionsList = [...sectionsData];
    let insertionIndex = sectionsData.length; // Padrão: adiciona no final

    // Determina o contexto atual para inserir a nova seção APÓS ele.
    let currentContextId = selectedSectionIdForStyling || 
                           (selectedItemIdGlobal ? sectionsData.find(s => s.items.some(i => i.id === selectedItemIdGlobal))?.id : null);

    if (currentContextId) {
        const targetIdx = sectionsData.findIndex(sec => sec.id === currentContextId);
        if (targetIdx !== -1) insertionIndex = targetIdx + 1; // Insere após o contexto atual
    }

    newSectionsList.splice(insertionIndex, 0, newSectionData);
    
    setSectionsData(newSectionsList);
    setSelectedSectionIdForStyling(newSectionId); // Seleciona a nova seção para estilização
    setSelectedItemIdGlobal(null); // Nenhum item da nova seção está selecionado ainda

    // Foca no campo de título da nova seção
    requestAnimationFrame(() => {
        if (typeof document === 'undefined') return;
        const titleInput = document.querySelector(`#dossier-section-${newSectionId} input[aria-label*="Título da seção"]`) as HTMLInputElement;
        if (titleInput) {
            titleInput.focus();
            // Atualiza o focusedElementRef através do handleFieldFocus
            handleFieldFocus(titleInput, { type: 'section', id: newSectionId });
        }
    });
  }, [sectionsData, isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal, handleFieldFocus, clearBlurTimeoutAndSignalIgnore]);

  const handleAddItemForSidebar = useCallback(() => {
    if (!isEditingMode) return;
    clearBlurTimeoutAndSignalIgnore();

    // Determina a seção alvo para adicionar o item.
    // Prioriza a seção do item atualmente focado, depois a seção explicitamente selecionada,
    // ou a última seção se nenhuma estiver em foco.
    let targetSectionId = selectedSectionIdForStyling; // Pode ser null se o foco estiver num item de outra seção
    if (selectedItemIdGlobal) { // Se um item está focado, sua seção é o alvo primário
        const sectionOfItem = sectionsData.find(s => s.items.some(it => it.id === selectedItemIdGlobal));
        if (sectionOfItem) targetSectionId = sectionOfItem.id;
    }
    
    if (!targetSectionId && sectionsData.length > 0) { // Fallback para a última seção se nenhuma estiver em foco
      targetSectionId = sectionsData[sectionsData.length - 1].id;
    }
    if (!targetSectionId) return; // Não pode adicionar item se não houver seções
    
    const newItemId = `item-${targetSectionId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newItem: ItemData = { id: newItemId, description: '', value: 'N/A' };

    setSectionsData(prev => prev.map(sec => {
        if (sec.id === targetSectionId) {
            const newItems = [...(Array.isArray(sec.items) ? sec.items : [])];
            // Encontra o índice do item atualmente focado para inserir o novo item após ele.
            const currentItemIndex = selectedItemIdGlobal ? newItems.findIndex(it => it.id === selectedItemIdGlobal) : -1;
            
            if (currentItemIndex !== -1) { // Se um item está focado, insere após ele
                newItems.splice(currentItemIndex + 1, 0, newItem);
            } else { // Senão, adiciona no final da lista de itens da seção
                newItems.push(newItem);
            }
            return { ...sec, items: newItems };
        }
        return sec;
    }));

    setSelectedSectionIdForStyling(targetSectionId); // Mantém/Define a seção como selecionada para estilo
    setSelectedItemIdGlobal(newItemId); // Seleciona o novo item

    // Foca no campo de descrição do novo item
    requestAnimationFrame(() => {
        if (typeof document === 'undefined') return;
        const itemInput = document.querySelector(`#dossier-item-${newItemId} input, #dossier-item-${newItemId} textarea`) as HTMLElement;
        if (itemInput) {
            itemInput.focus();
            handleFieldFocus(itemInput, { type: 'item', id: newItemId });
        }
    });
  }, [sectionsData, isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal, handleFieldFocus, clearBlurTimeoutAndSignalIgnore]);

  const handleDeleteItemForSidebar = useCallback(() => {
    if (!isEditingMode || !selectedItemIdGlobal || !canDeleteItem) return;
    clearBlurTimeoutAndSignalIgnore();

    const currentItemId = selectedItemIdGlobal;
    let sectionIdOfModifiedSection: string | null = null;
    let nextFocusedItemId: string | null = null;
    let focusSectionTitleIfItemWasLastInSection = false; // Flag para focar no título da seção se o item era o último
    
    const newSectionsState = sectionsData.map(sec => {
        if (!Array.isArray(sec.items) || !sec.items.some(item => item.id === currentItemId)) return sec;
        
        sectionIdOfModifiedSection = sec.id;
        const items = sec.items;
        const itemIndex = items.findIndex(item => item.id === currentItemId);
        const remainingItems = items.filter(item => item.id !== currentItemId);
        
        if (remainingItems.length > 0) {
            // Tenta focar no item seguinte, ou no anterior se o excluído era o último
            if (itemIndex < remainingItems.length) { 
                nextFocusedItemId = remainingItems[itemIndex].id;
            } else { 
                nextFocusedItemId = remainingItems[remainingItems.length - 1].id;
            }
        } else {
            // Se não houver mais itens na seção, e houver mais de uma seção, esta seção será removida (ver filter abaixo)
            // Se for a única seção, um item placeholder será adicionado.
            // Se esta seção for removida, o foco deve ir para outra seção ou nada.
        }
        return { ...sec, items: remainingItems };
    }).filter(sec => { // Remove seções que ficaram vazias, A MENOS que seja a única seção
        const isEmpty = !Array.isArray(sec.items) || sec.items.length === 0;
        if (isEmpty && sectionsData.length > 1) { // Se ficou vazia E NÃO é a única seção
            if (sec.id === sectionIdOfModifiedSection) { // Se a seção modificada é a que ficou vazia
                // A seção será removida. Precisamos decidir para onde vai o foco.
                // O foco irá para a próxima seção ou a anterior, se houver.
                // Esta lógica é tratada após o filter.
            }
            return false; // Remove a seção vazia
        }
        return true; // Mantém a seção
    });

    // Se todas as seções foram removidas (improvável com a lógica acima, mas defensivo)
    // ou se a única seção ficou vazia, adiciona um item placeholder.
    if (newSectionsState.length === 0) { // Deveria ser prevenido por canDeleteItem, mas como fallback
        const newSectionId = sectionIdOfModifiedSection || `section-fallback-${Date.now()}`;
        const placeholderItemId = `item-placeholder-${Date.now()}`;
        newSectionsState.push({ 
            ...DEFAULT_SECTION, 
            id: newSectionId, 
            items: [{id: placeholderItemId, description: '', value: 'N/A'}] 
        });
        sectionIdOfModifiedSection = newSectionId;
        nextFocusedItemId = placeholderItemId;
    } else if (newSectionsState.length === 1 && (!Array.isArray(newSectionsState[0].items) || newSectionsState[0].items.length === 0)) {
        // Se a única seção ficou vazia
        const placeholderId = `item-placeholder-${Date.now()}`;
        newSectionsState[0].items.push({ id: placeholderId, description: '', value: 'N/A' });
        nextFocusedItemId = placeholderId;
        sectionIdOfModifiedSection = newSectionsState[0].id; // Garante que sectionIdOfModifiedSection está correto
    } else if (sectionIdOfModifiedSection && newSectionsState.find(s => s.id === sectionIdOfModifiedSection)?.items.length === 0) {
        // A seção modificada ficou vazia e foi mantida (porque era a única, mas agora tem um placeholder)
        // OU a seção modificada ficou vazia e foi removida (e o foco precisa mudar)
        // Se a seção modificada foi removida, sectionIdOfModifiedSection ainda aponta para ela.
        // Precisamos encontrar a nova seção para focar.
        const originalSectionIndex = sectionsData.findIndex(s => s.id === sectionIdOfModifiedSection);
        if (newSectionsState.length > 0) {
            sectionIdOfModifiedSection = newSectionsState[Math.min(originalSectionIndex, newSectionsState.length - 1)].id;
        } else { // Todas as seções se foram, já tratado acima com placeholder.
            sectionIdOfModifiedSection = newSectionsState[0].id;
        }
        focusSectionTitleIfItemWasLastInSection = true; // Focar no título da seção (nova ou existente)
        nextFocusedItemId = null; // Não há item para focar.
    }


    setSectionsData(newSectionsState);
    setSelectedItemIdGlobal(nextFocusedItemId);
    
    // Determina a seção para estilização
    let finalSelectedSectionId = sectionIdOfModifiedSection; // Default para a seção modificada (ou seu substituto)
    if (nextFocusedItemId && sectionIdOfModifiedSection) { // Se um item foi focado, usa sua seção
        finalSelectedSectionId = sectionIdOfModifiedSection;
    } else if (newSectionsState.length > 0) { // Senão, se há seções, foca na primeira (ou a que foi determinada)
        finalSelectedSectionId = sectionIdOfModifiedSection || newSectionsState[0].id;
    } else {
        finalSelectedSectionId = null;
    }
    setSelectedSectionIdForStyling(finalSelectedSectionId);
    
    requestAnimationFrame(() => {
        if (typeof document === 'undefined' || !finalSelectedSectionId) {
            focusedElementRef.current = null; setSidebarTargetTop(null);
            return;
        }

        if (nextFocusedItemId) {
            const el = document.querySelector(`#dossier-item-${nextFocusedItemId} input, #dossier-item-${nextFocusedItemId} textarea`) as HTMLElement;
            if (el) {
                el.focus();
                handleFieldFocus(el, { type: 'item', id: nextFocusedItemId });
            } else { // Elemento do item não encontrado
                focusedElementRef.current = null; setSidebarTargetTop(null);
            }
        } else if (focusSectionTitleIfItemWasLastInSection || (finalSelectedSectionId && !nextFocusedItemId)) {
            // Foca no título da seção se o item era o último ou se não há item para focar
            const sectionTitleInput = document.querySelector(`#dossier-section-${finalSelectedSectionId} input[aria-label*="Título"]`) as HTMLElement;
            if (sectionTitleInput) {
                sectionTitleInput.focus();
                handleFieldFocus(sectionTitleInput, {type: 'section', id: finalSelectedSectionId});
            } else { // Input do título não encontrado
                focusedElementRef.current = null; setSidebarTargetTop(null);
            }
        } else { // Nenhum foco específico determinado
            focusedElementRef.current = null; setSidebarTargetTop(null);
        }
    });

  }, [sectionsData, isEditingMode, selectedItemIdGlobal, canDeleteItem, handleFieldFocus, clearBlurTimeoutAndSignalIgnore]);

  const handleDeleteSectionForSidebar = useCallback(() => {
    if (!isEditingMode || !canDeleteSection) return;
    clearBlurTimeoutAndSignalIgnore();

    let targetIdToDelete = selectedSectionIdForStyling;
    if (!targetIdToDelete && selectedItemIdGlobal) { // Se nenhuma seção selecionada, mas um item sim
        targetIdToDelete = sectionsData.find(s => s.items.some(i => i.id === selectedItemIdGlobal))?.id || null;
    }
    if (!targetIdToDelete) return; // Nenhuma seção para deletar

    const sectionIndexToDelete = sectionsData.findIndex(sec => sec.id === targetIdToDelete);
    const remainingSections = sectionsData.filter(sec => sec.id !== targetIdToDelete);
    
    setSectionsData(remainingSections);
    setSelectedItemIdGlobal(null); // Nenhum item selecionado após deletar seção

    // Determina qual seção focar após a exclusão
    let newSelectedSectionId: string | null = null;
    if (remainingSections.length > 0) {
        // Tenta focar na seção que estava na mesma posição ou na anterior
        newSelectedSectionId = remainingSections[Math.min(sectionIndexToDelete, remainingSections.length - 1)].id;
    }
    setSelectedSectionIdForStyling(newSelectedSectionId);
    
    // Limpa o foco da sidebar, pois a seção foi removida ou o contexto mudou
    focusedElementRef.current = null; 
    setSidebarTargetTop(null);

    if (newSelectedSectionId) {
        requestAnimationFrame(() => {
            if (typeof document === 'undefined') return;
            const firstSectionTitleInput = document.querySelector(`#dossier-section-${newSelectedSectionId} input[aria-label*="Título"]`) as HTMLElement;
            if (firstSectionTitleInput) {
                firstSectionTitleInput.focus();
                handleFieldFocus(firstSectionTitleInput, {type: 'section', id: newSelectedSectionId});
            }
        });
    }

  }, [sectionsData, isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal, canDeleteSection, handleFieldFocus, clearBlurTimeoutAndSignalIgnore]);

  const openEvaluationSettingsModal = useCallback(() => {
    clearBlurTimeoutAndSignalIgnore(); 
    setError(null); 
    setIsSettingsModalOpen(true);
  }, [clearBlurTimeoutAndSignalIgnore]);

  const closeEvaluationSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(false);
    // Tenta devolver o foco ao botão de configurações se ele era o elemento focado
    // ou se o foco estava dentro do modal.
    const activeElement = document.activeElement as HTMLElement;
    const settingsButtonQuery = `.${styles.dossierHeader_settingsButton}`; // Seletor do botão de engrenagem
    const settingsButton = document.querySelector(settingsButtonQuery) as HTMLElement;

    // Se o foco atual está dentro do modal OU se o botão de settings era o último focado (via focusedElementRef)
    if (activeElement && activeElement.closest(`.${styles.modalContent}`)) { // Checa se o foco está no modal
        settingsButton?.focus();
    } else if (focusedElementRef.current && focusedElementRef.current.matches(settingsButtonQuery)) {
        // Se o `focusedElementRef` aponta para o botão de settings, devolve o foco para ele.
        // Isso é útil se o modal foi fechado por 'ESC' ou clique fora, e não por um botão interno.
        settingsButton?.focus();
    }
    // Não precisa chamar handleFieldFocus aqui, pois o botão de settings já tem seu próprio handler de foco.
  }, []); // Adicionado styles.modalContent e styles.dossierHeader_settingsButton como referência mental para as classes.

  const handleSaveEvaluationMethods = useCallback((updatedMethods: EvaluationMethodItem[]) => {
    if (evaluationConcept === 'letter' && updatedMethods.length < 2) {
        // A validação de "pelo menos 2 métodos" é feita dentro do modal antes de chamar este onSave.
        // Se chegar aqui, é um erro de lógica ou o usuário bypassou a validação do modal.
        // O modal agora deve mostrar seu próprio erro e não fechar.
        // No entanto, como segurança, podemos alertar ou exibir erro na página.
        showErrorDialog("Para o conceito 'Letra', são necessários pelo menos dois métodos de avaliação. Configure-os nas configurações.");
        // Não fechar o modal, deixar o usuário corrigir lá.
        // A lógica do modal deve impedir que onSave seja chamado se inválido.
        return; 
    }
    setEvaluationMethodsForModal(updatedMethods);
    closeEvaluationSettingsModal(); // Fecha o modal APÓS salvar os métodos no estado da página.
  }, [closeEvaluationSettingsModal, evaluationConcept, showErrorDialog]);

  const handleDossierSettingsClick = useCallback(() => {
    // Antes de abrir o modal, se o botão de settings for focado,
    // o handleFieldFocus da PageHeader ou DossierHeader já deve ter sido chamado.
    // Guardamos esse foco para poder retornar a ele.
    // O onFieldFocus do PageHeader/DossierHeader já deve ter atualizado focusedElementRef.
    openEvaluationSettingsModal();
  }, [openEvaluationSettingsModal]);


  const handleSave = useCallback(async () => {
    setIsLoading(true); 
    setError(null);    
    try {
      const customUserIdStr = localStorage.getItem('professorId'); // Nome da chave no localStorage
      if (!customUserIdStr) { // Se não houver ID do professor no localStorage
          showErrorDialog("Sua sessão expirou ou o ID do usuário não foi encontrado. Por favor, faça o login novamente.");
          setIsLoading(false);
          return; // Interrompe a execução
      }
      const customUserId = parseInt(customUserIdStr);

      // Validação adicional para customUserId
      if (isNaN(customUserId) || customUserId <= 0) {
          showErrorDialog("ID de usuário inválido. Por favor, verifique os dados de login ou entre em contato com o suporte.");
          setIsLoading(false);
          return; // Interrompe a execução
      }

      if (!dossierTitle.trim()) {
        showErrorDialog("O título do Dossiê não pode ser vazio.");
        setIsLoading(false);
        return;
      }
      if (!evaluationConcept) {
        showErrorDialog("O método de avaliação não pode ser vazio.");
        setIsLoading(false);
        return;
      }
      
      if (evaluationConcept === 'letter') {
          if (evaluationMethodsForModal.length < 2) {
            openEvaluationSettingsModal(); 
            showErrorDialog("Para o conceito 'Letra', são necessários pelo menos dois métodos de avaliação. Configure-os nas configurações.");
            setIsLoading(false);
            return;
          }
          for(const method of evaluationMethodsForModal) {
              if (!method.name.trim()) {
                  openEvaluationSettingsModal();
                  showErrorDialog(`Um dos conceitos de avaliação está sem nome. Verifique as configurações.`);
                  setIsLoading(false);
                  return;
              }
              if (method.value.trim() === '') {
                  openEvaluationSettingsModal();
                  showErrorDialog(`O valor para o conceito '${method.name}' não pode ser vazio. Deve ser entre 0.0 e 10.0.`);
                  setIsLoading(false);
                  return;
              }
              const val = parseFloat(method.value);
              if(isNaN(val) || val < 0.0 || val > 10.0) {
                  openEvaluationSettingsModal();
                  showErrorDialog(`Valor inválido '${method.value}' para o conceito '${method.name}'. Deve ser entre 0.0 e 10.0.`);
                  setIsLoading(false);
                  return;
              }
          }
           // Validar nomes e valores únicos para 'letter'
          const names = evaluationMethodsForModal.map(m => m.name.trim().toLowerCase());
          if (new Set(names).size !== names.length) {
              openEvaluationSettingsModal();
              showErrorDialog('Os nomes dos conceitos de avaliação devem ser únicos. Verifique as configurações.');
              setIsLoading(false);
              return;
          }
          const values = evaluationMethodsForModal.map(m => parseFloat(m.value));
          if (new Set(values).size !== values.length) {
              openEvaluationSettingsModal();
              showErrorDialog('Os valores numéricos dos conceitos de avaliação devem ser únicos. Verifique as configurações.');
              setIsLoading(false);
              return;
          }
      }

      if (sectionsData.length === 0) {
        showErrorDialog("O Dossiê deve conter pelo menos uma seção.");
        setIsLoading(false);
        return;
      }
      
      const hasValidSectionWithQuestion = sectionsData.some(sec => 
        sec.title.trim() !== "" && Array.isArray(sec.items) && 
        sec.items.length > 0 && sec.items.some(it => it.description.trim() !== "")
      );
      if (!hasValidSectionWithQuestion) {
        showErrorDialog("O Dossiê deve conter pelo menos uma seção com título e um item com descrição preenchidos.");
        setIsLoading(false);
        return;
      }

      let totalWeight = 0;
      for (const sec of sectionsData) {
        if (!sec.title.trim()) {
            showErrorDialog(`Uma das seções não pode ter um título vazio.`);
            setIsLoading(false);
            return;
        }
        if (!Array.isArray(sec.items) || sec.items.length === 0) {
            showErrorDialog(`A seção "${sec.title || 'sem título'}" deve conter pelo menos um item.`);
            setIsLoading(false);
            return;
        }
        for (const item of sec.items) {
            if (!item.description.trim()) {
                showErrorDialog(`Um dos itens na seção "${sec.title || 'sem título'}" não pode ter a descrição vazia.`);
                setIsLoading(false);
                return;
            }
        }
        const parsedWeight = parseInt(sec.weight, 10);
        if (isNaN(parsedWeight) || parsedWeight < 0) {
            showErrorDialog(`O peso da seção "${sec.title || 'sem título'}" é inválido. Deve ser um número positivo (0-100).`);
            setIsLoading(false);
            return;
        }
        totalWeight += parsedWeight;
      }
      if (totalWeight !== 100) {
        showErrorDialog(`A soma dos pesos de todas as seções deve ser 100%, mas é ${totalWeight}%.`);
        setIsLoading(false);
        return;
      }
      
      const payload: ServiceCreateDossierPayload = adaptDossierStateToPayload(
        dossierTitle, dossierDescription, evaluationConcept, sectionsData,
        customUserId, 
        evaluationMethodsForModal
      );

      if (dossierId) {
        const updatePayload = {
          ...payload,
          id: dossierId
        } as UpdateDossierPayload;
        await updateDossier(dossierId, updatePayload);
      } else {
        await createDossier(payload);
      }
      setIsEditingMode(false); 
      router.push('/dossie'); 
    } catch (error: any) {
      console.error("Falha ao salvar dossiê:", error); 
      showErrorDialog(error.response?.data?.msg || error.message || 'Falha ao salvar dossiê.');
    } finally {
        setIsLoading(false); 
    }
  }, [
      dossierTitle, dossierDescription, evaluationConcept, sectionsData, 
      dossierId, router, evaluationMethodsForModal, openEvaluationSettingsModal, showErrorDialog
    ]);

  // Determina se a sidebar de ações deve ser mostrada.
  const isFocusedElementAnItemField = isClient && 
                                     focusedElementRef.current instanceof HTMLElement &&
                                     focusedElementRef.current.closest(`[id^="dossier-item-"]`) instanceof HTMLElement;
  const showActionSidebar = isClient && isEditingMode && isFocusedElementAnItemField && sidebarTargetTop !== null;

  // --- Renderização ---
  if (!isClient || (!isAuthenticated && dossierId)) { 
    return <div className={styles.loadingMessage}>Carregando e verificando autenticação...</div>;
  }
  if (!isClient && !dossierId && !isAuthenticated) { 
    return <div className={styles.loadingMessage}>Verificando autenticação...</div>;
  }
  if (isLoading && (dossierId || (!isAuthenticated && !dossierId) )) { 
    return <div className={styles.loadingMessage}>Carregando dados...</div>;
  }

  return (
    <>
      <Head>
        <title>{dossierId ? (isEditingMode ? 'Editar Dossiê' : 'Visualizar Dossiê') : 'Novo Dossiê'}</title>
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
              settingsButtonClassName={`${styles.pageHeader_backButton} ${styles.dossierHeader_settingsButton}`}
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
              <button 
                onClick={handleSave} 
                className={styles.saveButton} 
                disabled={isLoading} 
              >
                {isLoading && !error ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          )}
        </main>
      </div>

      {isClient && ( 
        <EvaluationSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={closeEvaluationSettingsModal}
          initialMethods={evaluationMethodsForModal}
          onSave={handleSaveEvaluationMethods}
          modalOverlayClassName={styles.modalOverlay} 
          modalContentClassName={styles.modalContent}
          modalHeaderClassName={styles.modalHeader}
          modalTitleClassName={styles.modalTitle}
          modalCloseButtonClassName={styles.modalCloseButton}
          modalBodyClassName={styles.modalBody}
          modalErrorClassName={styles.modalError} 
          modalListClassName={styles.modalList}
          modalListItemClassName={styles.modalListItem}
          modalListItemNameClassName={styles.modalListItemName}
          modalListItemValueClassName={styles.modalListItemValue}
          modalListItemDeleteBtnClassName={styles.modalListItemDeleteBtn}
          modalActionsClassName={styles.modalActions}
          modalAddButtonClassName={styles.modalAddButton}
          modalSaveButtonClassName={styles.modalSaveButton}
          modalCancelButtonClassName={styles.modalCancelButton}
          editableFieldForModalInputClassName={styles.modalEditableFieldInput} 
          editableFieldForModalTextDisplayClassName={styles.modalEditableFieldTextDisplay}
        />
      )}

      <ErroMessageDialog
        open={errorDialogOpen}
        onConfirm={closeErrorDialog}
        description={errorDialogMessage}
      />
    </>
  );
};

export default DossierAppPage;