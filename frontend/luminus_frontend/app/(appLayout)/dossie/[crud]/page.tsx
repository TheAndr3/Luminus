// src/pages/DossierAppPage.tsx
"use client"

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter, useParams } from 'next/navigation';

import PageHeader from '../../../../components/dossier/PageHeader';
import DossierHeader from '../../../../components/dossier/DossierHeader';
import SectionList from '../../../../components/dossier/SectionList';
import ActionSidebar from '../../../../components/dossier/ActionSidebar';
import EvaluationSettingsModal from '../../../../components/dossier/EvaluationSettingsModal';

import { SectionData, ItemData, EvaluationConcept, adaptDossierStateToPayload, EvaluationMethodItem } from '../../../../types/dossier';
import { 
    createDossier, 
    updateDossier, 
    getDossierById, 
    Dossier,
    UpdateDossierPayload, 
    CreateDossierPayload as ServiceCreateDossierPayload, 
    DossierResponse 
} from '../../../../services/dossierServices';


import styles from './DossierCRUDPage.module.css';

// Interface para a estrutura de dados retornada pelo GET /dossier/:id (pgDossieSelect)
interface EvaluationTypeFromAPI {
    id: number; // ou string, dependendo do DB
    name: string;
    value: string;
}
interface EvaluationMethodFromAPI {
    id: number; // ou string
    name: string; // 'numerical' ou 'letter' ou o nome do método customizado
    evaluationType: { [key: string]: EvaluationTypeFromAPI }; // Objeto de tipos
}

interface DossierDetailFromAPI { // Não estende Dossier diretamente para evitar conflito de evaluation_method
  id: number;
  costumUser_id: number;
  name: string;
  description: string;
  evaluation_method: EvaluationMethodFromAPI; // Agora é um objeto
  sections: { // Esta estrutura de sections já é um objeto com chaves sectionId
    [key: string]: { // key é sectionId
        id: number; // ou string
        name: string;
        description: string;
        weigth: number;
        questions: { // Objeto com chaves questionId
            [key: string]: { // key é questionId
                id: number; // ou string
                name: string; // que é a description da questão na UI
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
    value: "N/A"
  }]
};

const DEFAULT_EVALUATION_METHODS_LETTER: EvaluationMethodItem[] = [
  { id: `default-method-${Date.now()}-1`, name: 'Excelente', value: 'A+' },
  { id: `default-method-${Date.now()}-2`, name: 'Muito Bom', value: 'A' },
  { id: `default-method-${Date.now()}-3`, name: 'Bom', value: 'B' },
  { id: `default-method-${Date.now()}-4`, name: 'Satisfatório', value: 'C' },
  { id: `default-method-${Date.now()}-5`, name: 'Insuficiente', value: 'D' },
];


const DossierAppPage: React.FC = () => {
  const [dossierTitle, setDossierTitle] = useState("");
  const [dossierDescription, setDossierDescription] = useState("");
  const [evaluationConcept, setEvaluationConcept] = useState<EvaluationConcept>('numerical');
  const [sectionsData, setSectionsData] = useState<SectionData[]>([]);
  const [isEditingMode, setIsEditingMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const modeParam = searchParams.get('mode');
  const dossierId = params?.crud !== 'create' ? parseInt(params.crud as string) : null;

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [evaluationMethodsForModal, setEvaluationMethodsForModal] = useState<EvaluationMethodItem[]>(
    DEFAULT_EVALUATION_METHODS_LETTER
  );

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

      if (!dossierId) {
        setDossierTitle("");
        setDossierDescription("");
        setSectionsData([DEFAULT_SECTION]);
        setEvaluationConcept('numerical');
        setEvaluationMethodsForModal(DEFAULT_EVALUATION_METHODS_LETTER);
        setIsEditingMode(true);
        setIsLoading(false);
        return;
      }

      try {
        const response: DossierResponse = await getDossierById(dossierId);
        const dossierFromApi = response.data as DossierDetailFromAPI;

        if (!dossierFromApi) {
            throw new Error("Dossiê não encontrado ou formato de resposta inesperado.");
        }

        setDossierTitle(dossierFromApi.name);
        setDossierDescription(dossierFromApi.description);
        
        // O nome do método principal ('numerical', 'letter', ou nome customizado)
        // é a chave para determinar o tipo de avaliação na UI.
        const mainMethodName = dossierFromApi.evaluation_method.name;
        let conceptTypeFromApi: EvaluationConcept = 'numerical'; // Default

        if (mainMethodName.toLowerCase() === 'letter' || 
            Object.values(dossierFromApi.evaluation_method.evaluationType).some(et => isNaN(parseFloat(et.value)))) {
            conceptTypeFromApi = 'letter';
        } else {
            conceptTypeFromApi = 'numerical';
        }
        setEvaluationConcept(conceptTypeFromApi);

        if (conceptTypeFromApi === 'letter') {
            const methodsFromApi = Object.values(dossierFromApi.evaluation_method.evaluationType).map((et, idx) => ({
                id: et.id.toString() || `loaded-type-${idx}-${Date.now()}`, // id do EvaluationType
                name: et.name,
                value: et.value,
            }));
            if (methodsFromApi.length > 0) {
                setEvaluationMethodsForModal(methodsFromApi);
            } else {
                setEvaluationMethodsForModal(DEFAULT_EVALUATION_METHODS_LETTER);
            }
        } else { // numerical
            setEvaluationMethodsForModal(DEFAULT_EVALUATION_METHODS_LETTER); // Mantém defaults para o modal
        }
        
        // Adaptar sections que agora é um objeto
        const adaptedSections: SectionData[] = Object.values(dossierFromApi.sections || {}).map(section => ({
            id: section.id.toString(),
            title: section.name,
            description: section.description,
            weight: section.weigth.toString(),
            items: Object.values(section.questions || {}).map(question => ({
                id: question.id.toString(),
                description: question.name, // 'name' da questão no backend é a 'description' na UI
                value: 'N/A' 
            }))
        }));


        if (adaptedSections.length === 0) {
          adaptedSections.push(DEFAULT_SECTION);
        }
        
        setSectionsData(adaptedSections);
        setIsEditingMode(modeParam !== 'view');
      } catch (error: any) {
        console.error("Erro ao carregar dossiê:", error);
        setError(error.message || 'Erro ao carregar dossiê. Tente recarregar a página.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isClient && isAuthenticated) {
      loadDossier();
    } else if (isClient && !dossierId && !isAuthenticated) { 
        setIsLoading(false);
    } else if (isClient && !dossierId && isAuthenticated) { 
        setDossierTitle("");
        setDossierDescription("");
        setSectionsData([DEFAULT_SECTION]);
        setEvaluationConcept('numerical');
        setEvaluationMethodsForModal(DEFAULT_EVALUATION_METHODS_LETTER);
        setIsEditingMode(true);
        setIsLoading(false);
    }
  }, [dossierId, isClient, modeParam, isAuthenticated]);
  

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
    } else { 
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
          const itemElement = document.getElementById(`dossier-item-${itemId}`);
          const inputInItem = itemElement?.querySelector('input, textarea') as HTMLElement | null;
          if (inputInItem) {
              focusedElementRef.current = inputInItem; 
          } else {
              focusedElementRef.current = itemElement;
          }
     }
  }, [isEditingMode, sectionsData, selectedItemIdGlobal, clearBlurTimeoutAndSignalIgnore]);

  const handleSectionAreaClick = useCallback((sectionId: string) => {
     if (!isEditingMode) return;
     clearBlurTimeoutAndSignalIgnore();

      if (selectedSectionIdForStyling === sectionId && !selectedItemIdGlobal) { 
          setSelectedSectionIdForStyling(null);
          focusedElementRef.current = null; 
      } else {
          setSelectedSectionIdForStyling(sectionId);
          const sectionTitleInput = document.querySelector(`#dossier-section-${sectionId} input[aria-label*="Título"]`) as HTMLElement | null;
          if (sectionTitleInput) {
            focusedElementRef.current = sectionTitleInput;
          } else {
            focusedElementRef.current = document.getElementById(`dossier-section-${sectionId}`);
          }
      }
     setSelectedItemIdGlobal(null); 
     setSidebarTargetTop(null);
  }, [isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal, clearBlurTimeoutAndSignalIgnore]);

  useEffect(() => {
    if (!isClient || typeof window === 'undefined' || !scrollableAreaRef.current) {
        if (sidebarTargetTop !== null) setSidebarTargetTop(null);
        return;
    }
    const focusedEl = focusedElementRef.current;
    const scrollableAreaEl = scrollableAreaRef.current;
    
    const isItemFieldCurrentlyFocused = focusedEl instanceof HTMLElement &&
                                     focusedEl.closest(`[id^="dossier-item-"]`) instanceof HTMLElement;

    if (!isEditingMode || !isItemFieldCurrentlyFocused || !focusedEl) {
      if (sidebarTargetTop !== null) setSidebarTargetTop(null);
      return;
    }

    const parentItemEl = focusedEl.closest(`[id^="dossier-item-"]`) as HTMLElement;
    if (!parentItemEl) {
        if (sidebarTargetTop !== null) setSidebarTargetTop(null);
        return;
    }

    const calculateAndSetPosition = () => {
        if (!parentItemEl || !scrollableAreaEl) return;
        const parentItemRect = parentItemEl.getBoundingClientRect();
        const scrollAreaRect = scrollableAreaEl.getBoundingClientRect();
        
        if (parentItemRect.bottom < scrollAreaRect.top || parentItemRect.top > scrollAreaRect.bottom) {
            setSidebarTargetTop(null);
            return;
        }

        const itemTopInViewport = parentItemRect.top - scrollAreaRect.top;
        const itemTopInScrollContent = itemTopInViewport + scrollableAreaEl.scrollTop;
        
        let newTop = itemTopInScrollContent + (parentItemRect.height / 2) - (sidebarHeightEstimate / 2);
        
        const minAllowedTop = 5;
        const maxAllowedTop = Math.max(minAllowedTop, scrollableAreaEl.scrollHeight - sidebarHeightEstimate - 5);
        
        newTop = Math.max(minAllowedTop, Math.min(newTop, maxAllowedTop));
        
        const roundedNewTop = Math.round(newTop);
        const roundedCurrentTop = sidebarTargetTop !== null ? Math.round(sidebarTargetTop) : null;

        if (roundedNewTop !== roundedCurrentTop) {
            setSidebarTargetTop(roundedNewTop);
        }
    };

    calculateAndSetPosition();
    const debouncedCalculate = setTimeout(calculateAndSetPosition, 50);

    scrollableAreaEl.addEventListener('scroll', calculateAndSetPosition);
    window.addEventListener('resize', calculateAndSetPosition);

    return () => {
        clearTimeout(debouncedCalculate);
        scrollableAreaEl.removeEventListener('scroll', calculateAndSetPosition);
        window.removeEventListener('resize', calculateAndSetPosition);
    };
  }, [focusedElementRef.current, isEditingMode, sidebarHeightEstimate, sidebarTargetTop, isClient]);


  const handleBackClick = useCallback(() => { router.push('/dossie'); }, [router]);

  const handleToggleEditMode = useCallback(() => {
    setIsEditingMode(prev => {
      const newEditingMode = !prev;
      if (!newEditingMode) { 
        if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
        ignoreNextBlurRef.current = false;
        focusedElementRef.current = null;
        setSelectedItemIdGlobal(null);
        setSelectedSectionIdForStyling(null);
        setSidebarTargetTop(null); 
      }
      return newEditingMode; 
    });
  }, []);

  const handleDossierTitleChange = useCallback((newTitle: string) => { setDossierTitle(newTitle); }, []);
  const handleDossierDescriptionChange = useCallback((newDescription: string) => { setDossierDescription(newDescription); }, []);
  const handleEvaluationConceptChange = useCallback((concept: EvaluationConcept) => { setEvaluationConcept(concept); }, []);
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
    if (!sectionOfSelectedItem) return true;
    const isOnlySection = sectionsData.length === 1;
    const isLastItemInItsSection = sectionOfSelectedItem.items.length === 1;
    return !(isOnlySection && isLastItemInItsSection);
  }, [selectedItemIdGlobal, sectionsData]);

  const canDeleteSection = useMemo(() => {
    let targetSectionId = selectedSectionIdForStyling;
    if (!targetSectionId && selectedItemIdGlobal) {
        const sectionOfItem = sectionsData.find(s => Array.isArray(s.items) && s.items.some(it => it.id === selectedItemIdGlobal));
        if (sectionOfItem) targetSectionId = sectionOfItem.id;
    }
    return !!targetSectionId && sectionsData.length > 1;
  }, [selectedSectionIdForStyling, selectedItemIdGlobal, sectionsData]);

  const handleAddNewSectionForSidebar = useCallback(() => {
    if (!isEditingMode) return;
    clearBlurTimeoutAndSignalIgnore();
    const newSectionId = `section-${Date.now()}`;
    const newItemId = `item-${newSectionId}-init-${Math.random().toString(36).substr(2, 5)}`;
    const newSectionData: SectionData = { 
        id: newSectionId, title: ``, description: ``, 
        weight: sectionsData.length === 0 ? '100' : '0',
        items: [{ id: newItemId, description: '', value: 'N/A' }]
    };

    let newSectionsList = [...sectionsData];
    let insertionIndex = sectionsData.length; 

    let currentContextId = selectedSectionIdForStyling || 
                           (selectedItemIdGlobal ? sectionsData.find(s => s.items.some(i => i.id === selectedItemIdGlobal))?.id : null);

    if (currentContextId) {
        const targetIdx = sectionsData.findIndex(sec => sec.id === currentContextId);
        if (targetIdx !== -1) insertionIndex = targetIdx + 1;
    }

    newSectionsList.splice(insertionIndex, 0, newSectionData);
    
    setSectionsData(newSectionsList);
    setSelectedSectionIdForStyling(newSectionId); 
    setSelectedItemIdGlobal(null);

    requestAnimationFrame(() => {
        if (typeof document === 'undefined') return;
        const titleInput = document.querySelector(`#dossier-section-${newSectionId} input[aria-label*="Título da seção"]`) as HTMLInputElement;
        if (titleInput) {
            titleInput.focus();
            handleFieldFocus(titleInput, { type: 'section', id: newSectionId });
        }
    });
  }, [sectionsData, isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal, handleFieldFocus, clearBlurTimeoutAndSignalIgnore]);

  const handleAddItemForSidebar = useCallback(() => {
    if (!isEditingMode) return;
    clearBlurTimeoutAndSignalIgnore();

    let targetSectionId = selectedSectionIdForStyling;
    if (!targetSectionId && selectedItemIdGlobal) {
        const sectionOfItem = sectionsData.find(s => s.items.some(it => it.id === selectedItemIdGlobal));
        if (sectionOfItem) targetSectionId = sectionOfItem.id;
    }
    if (!targetSectionId && sectionsData.length > 0) targetSectionId = sectionsData[sectionsData.length - 1].id;
    if (!targetSectionId) return;
    
    const newItemId = `item-${targetSectionId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newItem: ItemData = { id: newItemId, description: '', value: 'N/A' };

    setSectionsData(prev => prev.map(sec => {
        if (sec.id === targetSectionId) {
            const newItems = [...(Array.isArray(sec.items) ? sec.items : [])];
            const currentItemIndex = selectedItemIdGlobal ? newItems.findIndex(it => it.id === selectedItemIdGlobal) : -1;
            
            if (currentItemIndex !== -1) { 
                newItems.splice(currentItemIndex + 1, 0, newItem);
            } else { 
                newItems.push(newItem);
            }
            return { ...sec, items: newItems };
        }
        return sec;
    }));

    setSelectedSectionIdForStyling(targetSectionId); 
    setSelectedItemIdGlobal(newItemId); 

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
    let focusSectionTitle = false;
    
    const newSectionsState = sectionsData.map(sec => {
        if (!sec.items.some(item => item.id === currentItemId)) return sec;
        
        sectionIdOfModifiedSection = sec.id;
        const items = sec.items;
        const itemIndex = items.findIndex(item => item.id === currentItemId);
        const remainingItems = items.filter(item => item.id !== currentItemId);
        
        if (remainingItems.length > 0) {
            if (itemIndex < remainingItems.length) { 
                nextFocusedItemId = remainingItems[itemIndex].id;
            } else { 
                nextFocusedItemId = remainingItems[remainingItems.length - 1].id;
            }
        }
        return { ...sec, items: remainingItems };
    }).filter(sec => { 
        const isEmpty = sec.items.length === 0;
        return !(isEmpty && sectionsData.length > 1);
    });

    if (newSectionsState.length === 1 && newSectionsState[0].items.length === 0) {
        const placeholderId = `item-placeholder-${Date.now()}`;
        newSectionsState[0].items.push({ id: placeholderId, description: '', value: 'N/A' });
        nextFocusedItemId = placeholderId;
        sectionIdOfModifiedSection = newSectionsState[0].id; 
    } else if (newSectionsState.length > 0 && sectionIdOfModifiedSection && !newSectionsState.find(s => s.id === sectionIdOfModifiedSection)) {
        sectionIdOfModifiedSection = newSectionsState[0].id;
        focusSectionTitle = true; 
    }

    setSectionsData(newSectionsState);
    setSelectedItemIdGlobal(nextFocusedItemId);
    const finalSelectedSectionId = nextFocusedItemId && sectionIdOfModifiedSection ? sectionIdOfModifiedSection : 
                                   (newSectionsState.length > 0 && sectionIdOfModifiedSection && newSectionsState.find(s => s.id === sectionIdOfModifiedSection) ? sectionIdOfModifiedSection : 
                                   (newSectionsState.length > 0 ? newSectionsState[0].id : null));
    setSelectedSectionIdForStyling(finalSelectedSectionId);
    
    requestAnimationFrame(() => {
        if (typeof document === 'undefined') return;
        if (nextFocusedItemId && finalSelectedSectionId) {
            const el = document.querySelector(`#dossier-item-${nextFocusedItemId} input, #dossier-item-${nextFocusedItemId} textarea`) as HTMLElement;
            if (el) {
                el.focus();
                handleFieldFocus(el, { type: 'item', id: nextFocusedItemId });
            } else {
                focusedElementRef.current = null; setSidebarTargetTop(null);
            }
        } else if (focusSectionTitle && finalSelectedSectionId) {
            const sectionTitleInput = document.querySelector(`#dossier-section-${finalSelectedSectionId} input[aria-label*="Título"]`) as HTMLElement;
            if (sectionTitleInput) {
                sectionTitleInput.focus();
                handleFieldFocus(sectionTitleInput, {type: 'section', id: finalSelectedSectionId});
            } else {
                focusedElementRef.current = null; setSidebarTargetTop(null);
            }
        }
        else {
            focusedElementRef.current = null; setSidebarTargetTop(null);
        }
    });

  }, [sectionsData, isEditingMode, selectedItemIdGlobal, canDeleteItem, selectedSectionIdForStyling, handleFieldFocus, clearBlurTimeoutAndSignalIgnore]);

  const handleDeleteSectionForSidebar = useCallback(() => {
    if (!isEditingMode || !canDeleteSection) return;
    clearBlurTimeoutAndSignalIgnore();

    let targetId = selectedSectionIdForStyling;
    if (!targetId && selectedItemIdGlobal) {
        targetId = sectionsData.find(s => s.items.some(i => i.id === selectedItemIdGlobal))?.id || null;
    }
    if (!targetId) return;

    const remainingSections = sectionsData.filter(sec => sec.id !== targetId);
    setSectionsData(remainingSections);

    setSelectedItemIdGlobal(null);
    const newSelectedSectionId = remainingSections.length > 0 ? remainingSections[0].id : null;
    setSelectedSectionIdForStyling(newSelectedSectionId);
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
    setIsSettingsModalOpen(true);
  }, [clearBlurTimeoutAndSignalIgnore]);

  const closeEvaluationSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(false);
    const activeElement = document.activeElement as HTMLElement;
    const settingsButtonQuery = `.${styles.dossierHeader_settingsButton}`;
    const settingsButton = document.querySelector(settingsButtonQuery) as HTMLElement;

    if (activeElement && activeElement.closest(`.${styles.modalContent}`)) { 
        settingsButton?.focus();
    } else if (focusedElementRef.current && focusedElementRef.current.matches(settingsButtonQuery)) {
        settingsButton?.focus();
    }
  }, []);

  const handleSaveEvaluationMethods = useCallback((updatedMethods: EvaluationMethodItem[]) => {
    setEvaluationMethodsForModal(updatedMethods);
    closeEvaluationSettingsModal();
  }, [closeEvaluationSettingsModal]);

  const handleDossierSettingsClick = useCallback(() => {
    openEvaluationSettingsModal();
  }, [openEvaluationSettingsModal]);


  const handleSave = useCallback(async () => {
    setIsLoading(true); 
    setError(null);    
    try {
      const costumUserIdStr = localStorage.getItem('professorId');
      if (!costumUserIdStr) {
          throw new Error("Sua sessão expirou. Por favor, faça o login novamente.");
      }
      const costumUserId = parseInt(costumUserIdStr);

      if (!dossierTitle.trim()) throw new Error("O título do Dossiê não pode ser vazio.");
      if (!evaluationConcept) throw new Error("O método de avaliação não pode ser vazio.");
      if (evaluationConcept === 'letter' && evaluationMethodsForModal.length === 0) {
        openEvaluationSettingsModal(); 
        throw new Error("Para o conceito 'Letra', ao menos um método de avaliação customizado deve ser definido.");
      }
      if (sectionsData.length === 0) throw new Error("O Dossiê deve conter pelo menos uma seção.");
      
      const hasValidSectionWithQuestion = sectionsData.some(sec => 
        sec.title.trim() !== "" && Array.isArray(sec.items) && 
        sec.items.length > 0 && sec.items.some(it => it.description.trim() !== "")
      );
      if (!hasValidSectionWithQuestion) throw new Error("O Dossiê deve conter pelo menos uma seção com título e um item com descrição preenchidos.");

      let totalWeight = 0;
      for (const sec of sectionsData) {
        if (!sec.title.trim()) throw new Error(`Uma das seções não pode ter um título vazio.`);
        if (!Array.isArray(sec.items) || sec.items.length === 0) throw new Error(`A seção "${sec.title || 'sem título'}" deve conter pelo menos um item.`);
        for (const item of sec.items) {
            if (!item.description.trim()) throw new Error(`Um dos itens na seção "${sec.title || 'sem título'}" não pode ter a descrição vazia.`);
        }
        const parsedWeight = parseInt(sec.weight, 10);
        if (isNaN(parsedWeight) || parsedWeight < 0) throw new Error(`O peso da seção "${sec.title || 'sem título'}" é inválido. Deve ser um número positivo.`);
        totalWeight += parsedWeight;
      }
      if (totalWeight !== 100) throw new Error(`A soma dos pesos de todas as seções deve ser 100%, mas é ${totalWeight}%.`);
      
      const payload: ServiceCreateDossierPayload = adaptDossierStateToPayload(
        dossierTitle, dossierDescription, evaluationConcept, sectionsData,
        costumUserId, evaluationMethodsForModal 
      );

      if (dossierId) {
        await updateDossier(dossierId, payload as UpdateDossierPayload);
      } else {
        await createDossier(payload);
      }
      setIsEditingMode(false); 
      router.push('/dossie'); 
    } catch (error: any) {
      console.error("Falha ao salvar dossiê:", error); // Log do erro detalhado no console do navegador
      setError(error.response?.data?.msg || error.message || 'Falha ao salvar dossiê.'); // Tenta pegar msg do backend
    } finally {
        setIsLoading(false); 
    }
  }, [
      dossierTitle, dossierDescription, evaluationConcept, sectionsData, 
      dossierId, router, evaluationMethodsForModal, openEvaluationSettingsModal
    ]);

  const isFocusedElementAnItemField = isClient &&
                                     focusedElementRef.current instanceof HTMLElement &&
                                     focusedElementRef.current.closest(`[id^="dossier-item-"]`) instanceof HTMLElement;
  const showActionSidebar = isClient && isEditingMode && isFocusedElementAnItemField && sidebarTargetTop !== null;

  useEffect(() => {
    if (error && !isLoading) {
        if (error !== "Sua sessão expirou. Por favor, faça o login novamente.") {
            // setError(null); 
        }
    }
  }, [dossierTitle, dossierDescription, sectionsData, evaluationMethodsForModal, error, isLoading]);


  if (!isClient || (!isAuthenticated && dossierId)) { 
    return <div className={styles.loadingMessage}>Carregando e verificando autenticação...</div>;
  }
  if (!isClient && !dossierId && !isAuthenticated) {
    return <div className={styles.loadingMessage}>Verificando autenticação...</div>;
  }
  if (isLoading && (dossierId || (!isAuthenticated && !dossierId) )) { 
    return <div className={styles.loadingMessage}>Carregando dados...</div>;
  }
  // Mostrar erro de carregamento APENAS se o carregamento falhou e era para um dossiê existente
  if (error && isLoading && dossierId) { 
     return <div className={styles.errorMessage} style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Erro ao carregar: {error}</div>;
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

          {error && !isLoading && <div className={styles.modalError} style={{marginBottom: '15px'}}>{error}</div>}

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
    </>
  );
};

export default DossierAppPage;