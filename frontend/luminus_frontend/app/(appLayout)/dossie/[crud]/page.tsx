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

import { SectionData, ItemData, EvaluationConcept, EvaluationMethodItem, adaptDossierStateToPayload } from '../../../../types/dossier'; 
import { createDossier, updateDossier, getDossierById, CreateDossierPayload, Dossier, UpdateDossierPayload } from '../../../../services/dossierServices';

import styles from './DossierCRUDPage.module.css';

interface DossierSectionFromAPI { 
  id: number;
  name: string;
  description: string;
  weigth: number; 
  questions: {
    id: number;
    description: string;
  }[];
}

// Ensure these defaults always produce unique IDs if multiple defaults are instantiated quickly
const createDefaultSection = (): SectionData => ({
  id: `section-default-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  title: "Nova Seção",
  description: "",
  weight: "100",
  items: [{
    id: `item-default-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    description: "Novo item",
    value: "N/A"
  }]
});

const createDefaultEvaluationMethodDetails = (): EvaluationMethodItem[] => [
  { id: `eval-default-S-${Date.now()}`, name: 'S', value: '10' },
  { id: `eval-default-A-${Date.now()}`, name: 'A', value: '8' },
  { id: `eval-default-B-${Date.now()}`, name: 'B', value: '6' },
  { id: `eval-default-C-${Date.now()}`, name: 'C', value: '4' },
];


const DossierAppPage: React.FC = () => {
  const [dossierTitle, setDossierTitle] = useState("");
  const [dossierDescription, setDossierDescription] = useState("");
  const [evaluationConcept, setEvaluationConcept] = useState<EvaluationConcept>('numerical');
  const [evaluationMethodDetails, setEvaluationMethodDetails] = useState<EvaluationMethodItem[]>(() => createDefaultEvaluationMethodDetails());
  const [sectionsData, setSectionsData] = useState<SectionData[]>(() => [createDefaultSection()]);
  const [isEditingMode, setIsEditingMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // Start true for initial load check
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
  const searchParams = useMemo(() => (typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()), []);
  const mode = useMemo(() => searchParams.get('mode'), [searchParams]);
  const dossierId = useMemo(() => (params?.crud !== 'create' ? parseInt(params.crud as string, 10) : null), [params]);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    const professorId = localStorage.getItem('professorId');
    if (professorId) {
      setIsAuthenticated(true); 
    } else {
      router.push('/login'); 
    }
    setIsClient(true);
  }, [router]);

  useEffect(() => {
    const loadDossier = async () => {
      setIsLoading(true); // Set loading true at the beginning of load attempt
      setError(null); // Clear previous errors

      if (!dossierId) { // This is CREATE mode
        setSectionsData([createDefaultSection()]);
        setEvaluationConcept('numerical'); 
        setEvaluationMethodDetails(createDefaultEvaluationMethodDetails()); 
        setIsEditingMode(true); // Ensure editing mode for create
        setIsLoading(false);
        return;
      }

      // This is EDIT or VIEW mode
      try {
        const response = await getDossierById(dossierId);
        const dossierFromApi = response.data as Dossier & { 
            evaluation_method: string | Array<{ name: string; value: string; }>; // Expect string or array of specific shape
            sections: DossierSectionFromAPI[] 
        };
        
        setDossierTitle(dossierFromApi.name || ""); // Fallback for name
        setDossierDescription(dossierFromApi.description || ""); // Fallback for description
        
        const backendEvalMethod = dossierFromApi.evaluation_method;

        if (Array.isArray(backendEvalMethod)) { // If backend sends an array (preferred for 'letter')
             setEvaluationConcept('letter');
             setEvaluationMethodDetails(backendEvalMethod.map((m: {name: string; value: string}, index: number) => ({
                 name: m.name,
                 value: m.value,
                 id: `loaded-method-arr-${dossierId}-${index}-${Date.now()}`
             })));
        } else if (typeof backendEvalMethod === 'string') {
            if (backendEvalMethod.toLowerCase() === 'numerical') {
                setEvaluationConcept('numerical');
                setEvaluationMethodDetails([]); 
            } else { // String might be JSON for 'letter' or just "letter"
                setEvaluationConcept('letter');
                try {
                    const parsedMethods: Array<{name: string, value: string}> = JSON.parse(backendEvalMethod);
                    // Check if parsedMethods is an array and its elements have the right shape
                    if (Array.isArray(parsedMethods) && parsedMethods.every(m => typeof m.name === 'string' && typeof m.value === 'string')) {
                        setEvaluationMethodDetails(parsedMethods.map((m: {name: string; value: string}, index: number) => ({ 
                            ...m, 
                            id: `loaded-method-json-${dossierId}-${index}-${Date.now()}` 
                        })));
                    } else { // Parsed but not the expected array structure
                        console.warn("Parsed evaluation_method string was not an array of expected objects. Using defaults for 'letter'. Parsed:", parsedMethods);
                        setEvaluationMethodDetails(createDefaultEvaluationMethodDetails());
                    }
                } catch (e) { // JSON.parse failed
                    console.warn("Evaluation_method string from backend is not 'numerical' and not valid JSON. Using defaults for 'letter'. Received:", backendEvalMethod);
                    setEvaluationMethodDetails(createDefaultEvaluationMethodDetails());
                }
            }
        } else { // Unexpected type or undefined
            console.warn("Unexpected or undefined evaluation_method from backend. Defaulting to numerical.", backendEvalMethod);
            setEvaluationConcept('numerical');
            setEvaluationMethodDetails(createDefaultEvaluationMethodDetails()); // Use fresh defaults
        }
        
        const adaptedSections: SectionData[] = Array.isArray(dossierFromApi.sections) ? dossierFromApi.sections.map((section: DossierSectionFromAPI, sIdx: number) => ({
          id: section.id?.toString() || `api-section-${sIdx}-${Date.now()}`,
          title: section.name || "Seção Sem Título",
          description: section.description || "",
          weight: section.weigth?.toString() || "0",
          items: Array.isArray(section.questions) ? section.questions.map((question: { id: number; description: string }, qIdx: number) => ({
            id: question.id?.toString() || `api-question-${sIdx}-${qIdx}-${Date.now()}`,
            description: question.description || "Item Sem Descrição",
            value: 'N/A' 
          })) : []
        })) : [];

        if (adaptedSections.length === 0) {
          adaptedSections.push(createDefaultSection());
        }
        
        setSectionsData(adaptedSections);
        setIsEditingMode(mode !== 'view');
      } catch (err: any) {
        console.error("Error loading dossier:", err);
        setError(err.message || 'Erro ao carregar dossiê');
        // Fallback to safe defaults on error to prevent UI crash
        setSectionsData([createDefaultSection()]);
        setEvaluationMethodDetails(createDefaultEvaluationMethodDetails());
      } finally {
        setIsLoading(false);
      }
    };

    if (isClient && isAuthenticated) { 
        if (dossierId !== undefined) { // dossierId can be null (create) or a number (edit/view)
             loadDossier();
        }
    } else if (!isAuthenticated && isClient) {
        // If not authenticated but client is ready, it means the auth useEffect already redirected.
        // No further action needed here, or set loading to false if it's still true.
        setIsLoading(false);
    }

  }, [dossierId, isClient, mode, isAuthenticated]); // Removed router from deps as it's stable


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
    }
  }, [isEditingMode, sectionsData]); // Removed redundant else for setSelectedItemIdGlobal(null) etc.

  const handleFieldBlur = useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => {
      if (ignoreNextBlurRef.current) {
        ignoreNextBlurRef.current = false;
        return;
      }
      focusedElementRef.current = null;
      // Only deselect if focus is not moving to another editable field or sidebar immediately
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
         // Keep section selected if an item within it was deselected by clicking itself
         // setSelectedSectionIdForStyling(null); 
         focusedElementRef.current = null; // Clear focus if item is deselected
         setSidebarTargetTop(null);
     } else {
         setSelectedItemIdGlobal(itemId);
          const sectionOfItem = sectionsData.find((sec: SectionData) =>
            Array.isArray(sec.items) && sec.items.some((item: ItemData) => item.id === itemId)
          );
          setSelectedSectionIdForStyling(sectionOfItem ? sectionOfItem.id : null);
     }
  }, [isEditingMode, sectionsData, selectedItemIdGlobal]);

  const handleSectionAreaClick = useCallback((sectionId: string) => {
     if (!isEditingMode) return;
     if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
     ignoreNextBlurRef.current = false;

      if (selectedSectionIdForStyling === sectionId && !selectedItemIdGlobal) { 
          setSelectedSectionIdForStyling(null);
      } else {
          setSelectedSectionIdForStyling(sectionId);
      }
     setSelectedItemIdGlobal(null); 
     focusedElementRef.current = null;
     setSidebarTargetTop(null);
  }, [isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal]);

  useEffect(() => {
    const scrollableAreaElem = scrollableAreaRef.current;
    if (!isClient || typeof window === 'undefined' || !scrollableAreaElem) {
        setSidebarTargetTop(null);
        return;
    }

    const focusedElem = focusedElementRef.current;
    const isItemFieldFocusedCurrently = focusedElem instanceof HTMLElement &&
                                       focusedElem.closest(`[id^="dossier-item-"]`) instanceof HTMLElement;
    
    if (!isEditingMode || !isItemFieldFocusedCurrently || !focusedElem) {
      setSidebarTargetTop(null);
      return;
    }

    const parentItemElement = focusedElem.closest(`[id^="dossier-item-"]`) as HTMLElement;
    if (!parentItemElement) {
        setSidebarTargetTop(null);
        return;
    }
    
    const calculateAndSetPosition = (targetItemElement: HTMLElement, areaElement: HTMLDivElement) => {
        const parentRect = targetItemElement.getBoundingClientRect();
        const areaRect = areaElement.getBoundingClientRect();

        if (parentRect.bottom < areaRect.top || parentRect.top > areaRect.bottom) {
            setSidebarTargetTop(null);
            return;
        }

        const topRelativeToViewport = parentRect.top - areaRect.top;
        const topRelativeToContent = topRelativeToViewport + areaElement.scrollTop;
        let finalTop = topRelativeToContent + (parentRect.height / 2) - (sidebarHeightEstimate / 2);

        const minTop = 5;
        const maxScroll = areaElement.scrollHeight;
        const maxPossibleTop = maxScroll > sidebarHeightEstimate + 5 ? maxScroll - sidebarHeightEstimate - 5 : minTop;
        
        finalTop = Math.max(minTop, Math.min(finalTop, maxPossibleTop));
        setSidebarTargetTop(current => current !== finalTop ? finalTop : current);
    };

    calculateAndSetPosition(parentItemElement, scrollableAreaElem);

    const handleScroll = () => {
        const currentFocused = focusedElementRef.current;
        const currentScrollArea = scrollableAreaRef.current;
        // Check if component is still mounted and conditions are met
        if (!currentFocused || !currentScrollArea || !isEditingMode || !(currentFocused.closest(`[id^="dossier-item-"]`))) {
            setSidebarTargetTop(null);
            currentScrollArea?.removeEventListener('scroll', handleScroll); // Clean up listener if conditions no longer met
            return;
        }
        const currentParentItem = currentFocused.closest(`[id^="dossier-item-"]`) as HTMLElement;
        if (currentParentItem) {
            calculateAndSetPosition(currentParentItem, currentScrollArea);
        } else {
            setSidebarTargetTop(null);
        }
    };

    scrollableAreaElem.addEventListener('scroll', handleScroll);
    return () => {
        scrollableAreaElem.removeEventListener('scroll', handleScroll);
    };
  }, [focusedElementRef.current, isEditingMode, sidebarHeightEstimate, isClient]);


  const handleBackClick = useCallback(() => {
    router.push('/dossie'); 
  }, [router]);

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
  
  const handleEvaluationConceptChange = useCallback((concept: EvaluationConcept) => {
    setEvaluationConcept(concept);
    if (concept === 'letter' && (!evaluationMethodDetails || evaluationMethodDetails.length === 0)) {
      setEvaluationMethodDetails(createDefaultEvaluationMethodDetails());
    }
  }, [evaluationMethodDetails]); 

  const handleSectionDescriptionChange = useCallback((sectionId: string, newDescription: string) => {
    setSectionsData(prev => prev.map((sec) => (sec.id === sectionId ? { ...sec, description: newDescription } : sec)));
  }, []);
  const handleSectionTitleChange = useCallback((sectionId: string, newTitle: string) => {
    setSectionsData(prev => prev.map((sec) => (sec.id === sectionId ? { ...sec, title: newTitle } : sec)));
  }, []);
  const handleSectionWeightChange = useCallback((sectionId: string, newWeight: string) => {
    setSectionsData(prev => prev.map((sec) => (sec.id === sectionId ? { ...sec, weight: newWeight } : sec)));
  }, []);

  const handleItemChange = useCallback(
    (sectionId: string, itemId: string, field: 'description' | 'value', newValue: string) => {
      setSectionsData(prev =>
        prev.map((sec) =>
          sec.id === sectionId
            ? { ...sec, items: Array.isArray(sec.items) ? sec.items.map((item) => item.id === itemId ? { ...item, [field]: newValue } : item) : [] }
            : sec
        )
      );
    }, []);

  const handleAddNewSectionForSidebar = useCallback(() => {
    if (!isEditingMode) return;
    const newSectionId = `section-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newItemId = `item-${newSectionId}-init-${Math.random().toString(36).substring(2, 7)}`;
    const newSectionData: SectionData = { id: newSectionId, title: `Nova Seção`, description: ``, weight: '0', items: [{ id: newItemId, description: 'Novo item', value: 'N/A' }]};

    setSectionsData(prevSections => {
        let newSectionsList = [...prevSections];
        let targetSectionIndex = -1;
        let currentTargetIdForNewSection = selectedSectionIdForStyling;

        if (!currentTargetIdForNewSection && selectedItemIdGlobal) {
           const sectionOfSelectedItem = prevSections.find(s => Array.isArray(s.items) && s.items.some(item => item.id === selectedItemIdGlobal));
           if(sectionOfSelectedItem) currentTargetIdForNewSection = sectionOfSelectedItem.id;
        }

        if (currentTargetIdForNewSection) {
            targetSectionIndex = prevSections.findIndex(sec => sec.id === currentTargetIdForNewSection);
        }

        if (targetSectionIndex !== -1) {
          newSectionsList.splice(targetSectionIndex + 1, 0, newSectionData);
        } else {
          newSectionsList.push(newSectionData);
        }
        return newSectionsList;
    });
    
    setSelectedItemIdGlobal(null);
    setSelectedSectionIdForStyling(newSectionId);

     requestAnimationFrame(() => {
         if (typeof window === 'undefined' || typeof document === 'undefined') return;
         const titleInputOfNewSection = document.querySelector(`#dossier-section-${newSectionId} input[aria-label*="Título da seção"]`) as HTMLInputElement | null;
         if (titleInputOfNewSection) {
            titleInputOfNewSection.focus();
            handleFieldFocus(titleInputOfNewSection, {type: 'section', id: newSectionId});
         } else {
             const newItemElement = document.getElementById(`dossier-item-${newItemId}`);
             if (newItemElement) {
                 const editableField = newItemElement.querySelector('input, textarea') as HTMLElement | null;
                 if (editableField) {
                    editableField.focus();
                    handleFieldFocus(editableField, {type: 'item', id: newItemId});
                 }
             }
         }
     });
  }, [isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal, handleFieldFocus]); // removed sectionsData, setSectionsData handles prev state

  const handleAddItemForSidebar = useCallback(() => {
    if (!isEditingMode) return;
    
    let targetSectionIdResolved = selectedSectionIdForStyling;
    if (!targetSectionIdResolved && selectedItemIdGlobal) {
        const currentSectionOfItem = sectionsData.find(s => Array.isArray(s.items) && s.items.some(it => it.id === selectedItemIdGlobal));
        if (currentSectionOfItem) targetSectionIdResolved = currentSectionOfItem.id;
    }

    if (!targetSectionIdResolved) {
      if (sectionsData.length > 0) {
        targetSectionIdResolved = sectionsData[sectionsData.length -1].id;
      } else { // No sections exist, create one first
        const newSection = createDefaultSection();
        setSectionsData([newSection]);
        targetSectionIdResolved = newSection.id;
        // setSelectedSectionIdForStyling(newSection.id); // Set by upcoming logic
      }
    }
    
    const newItemId = `item-${targetSectionIdResolved}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setSectionsData(prev => prev.map(sec =>
        sec.id === targetSectionIdResolved
          ? { ...sec, items: [...(Array.isArray(sec.items) ? sec.items : []), { id: newItemId, description: 'Novo Item', value: 'N/A' }] }
          : sec
    ));

    setSelectedSectionIdForStyling(targetSectionIdResolved); 
    setSelectedItemIdGlobal(newItemId); 

     requestAnimationFrame(() => {
         if (typeof window === 'undefined' || typeof document === 'undefined') return;
         const newItemElement = document.getElementById(`dossier-item-${newItemId}`);
         if (newItemElement) {
             const editableField = newItemElement.querySelector('input, textarea') as HTMLElement | null;
             if (editableField) {
                editableField.focus();
                handleFieldFocus(editableField, {type: 'item', id: newItemId});
             }
         }
     });
  }, [isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal, handleFieldFocus, sectionsData]);

  const handleDeleteItemForSidebar = useCallback(() => {
    if (!isEditingMode || !selectedItemIdGlobal) return;

    const currentSelectedItemId = selectedItemIdGlobal;
    let nextSelectedItemId: string | null = null;
    let nextSelectedSectionId: string | null = null;
    let focusType: 'item' | 'section' | null = null;

    setSectionsData(prevSections => {
        const sectionContainingItemIndex = prevSections.findIndex(s => s.items.some(i => i.id === currentSelectedItemId));
        if (sectionContainingItemIndex === -1) return prevSections;

        const sectionContainingItem = prevSections[sectionContainingItemIndex];
        const itemIndexInItsSection = sectionContainingItem.items.findIndex(i => i.id === currentSelectedItemId);

        let updatedSections = prevSections.map(s => {
            if (s.id === sectionContainingItem.id) {
                return { ...s, items: s.items.filter(i => i.id !== currentSelectedItemId) };
            }
            return s;
        });

        const sectionAfterItemRemoved = updatedSections[sectionContainingItemIndex];

        if (sectionAfterItemRemoved.items.length > 0) {
            nextSelectedSectionId = sectionAfterItemRemoved.id;
            nextSelectedItemId = sectionAfterItemRemoved.items[Math.min(itemIndexInItsSection, sectionAfterItemRemoved.items.length - 1)].id;
            focusType = 'item';
        } else { // Section became empty
            if (updatedSections.length === 1) { // It was the only section
                const newDefaultSection = createDefaultSection();
                newDefaultSection.title = sectionAfterItemRemoved.title; // Preserve title if possible
                updatedSections = [newDefaultSection];
                nextSelectedSectionId = newDefaultSection.id;
                nextSelectedItemId = newDefaultSection.items[0].id;
                focusType = 'item';
            } else { // More than one section, remove the empty one
                updatedSections = updatedSections.filter(s => s.id !== sectionAfterItemRemoved.id);
                if (updatedSections.length > 0) {
                    const focusSectionIdx = Math.max(0, sectionContainingItemIndex - (sectionContainingItemIndex >= updatedSections.length ? 1 : 0) );
                    nextSelectedSectionId = updatedSections[focusSectionIdx].id;
                    focusType = 'section';
                }
            }
        }
        return updatedSections;
    });
    
    // Update selection state after sectionsData has been set
    // This needs to be outside setSectionsData to use the new state values for nextSelected...
    // However, the values for nextSelectedItemId/Id were determined from prevSections logic.
    // So, we need to pass these determined IDs directly.
    setSelectedItemIdGlobal(nextSelectedItemId);
    setSelectedSectionIdForStyling(nextSelectedSectionId);

    focusedElementRef.current = null; 
    setSidebarTargetTop(null);

    requestAnimationFrame(() => {
      if (typeof window === 'undefined' || typeof document === 'undefined') return;
      if (focusType === 'item' && nextSelectedItemId) {
        const itemElement = document.getElementById(`dossier-item-${nextSelectedItemId}`);
        const editableField = itemElement?.querySelector('input, textarea') as HTMLElement | null;
        if (editableField) {
            editableField.focus();
            handleFieldFocus(editableField, { type: 'item', id: nextSelectedItemId });
        }
      } else if (focusType === 'section' && nextSelectedSectionId) {
        const sectionTitleInput = document.querySelector(`#dossier-section-${nextSelectedSectionId} input[aria-label*="Título da seção"]`) as HTMLInputElement | null;
        if (sectionTitleInput) {
            sectionTitleInput.focus();
            handleFieldFocus(sectionTitleInput, { type: 'section', id: nextSelectedSectionId });
        }
      }
    });

  }, [isEditingMode, selectedItemIdGlobal, handleFieldFocus, sectionsData]); // sectionsData dependency

  const handleDeleteSectionForSidebar = useCallback(() => {
    let targetSectionIdToDelete = selectedSectionIdForStyling;
    if(!targetSectionIdToDelete && selectedItemIdGlobal) {
        const sectionOfItem = sectionsData.find(s => s.items.some(it => it.id === selectedItemIdGlobal));
        if(sectionOfItem) targetSectionIdToDelete = sectionOfItem.id;
    }

    if (!isEditingMode || !targetSectionIdToDelete || sectionsData.length <= 1) return;

    let nextSelectedSectionIdAfterDelete: string | null = null;

    setSectionsData(prevSections => {
        const deletedSectionIndex = prevSections.findIndex(s => s.id === targetSectionIdToDelete);
        const newList = prevSections.filter(sec => sec.id !== targetSectionIdToDelete);
        
        if (newList.length > 0) {
            const focusIndex = Math.min(Math.max(0, deletedSectionIndex), newList.length - 1);
            nextSelectedSectionIdAfterDelete = newList[focusIndex].id;
        }
        return newList;
    });
    
    // Update selection state. nextSelectedSectionIdAfterDelete contains the ID.
    setSelectedSectionIdForStyling(nextSelectedSectionIdAfterDelete);
    if (selectedItemIdGlobal && sectionsData.find(s => s.id === targetSectionIdToDelete)?.items.some(i => i.id === selectedItemIdGlobal)) {
        setSelectedItemIdGlobal(null); 
    }
    
    focusedElementRef.current = null;
    setSidebarTargetTop(null);

    requestAnimationFrame(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return; 
        if (nextSelectedSectionIdAfterDelete) { 
          const sectionTitleInput = document.querySelector(`#dossier-section-${nextSelectedSectionIdAfterDelete} input[aria-label*="Título da seção"]`) as HTMLInputElement | null;
          if (sectionTitleInput) {
              sectionTitleInput.focus();
              handleFieldFocus(sectionTitleInput, {type: 'section', id: nextSelectedSectionIdAfterDelete});
          }
        }
      });

  }, [isEditingMode, selectedSectionIdForStyling, selectedItemIdGlobal, handleFieldFocus, sectionsData]); // sectionsData dependency

  const handleDossierSettingsClick = useCallback(() => {
    if (!isEditingMode) return;
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    setIsSettingsModalOpen(true);
  }, [isEditingMode]);

  const handleSaveEvaluationSettings = useCallback((newMethods: EvaluationMethodItem[]) => {
    setEvaluationMethodDetails(newMethods);
    setIsSettingsModalOpen(false);
  }, []);


  const handleSave = useCallback(async () => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);

    try {
      const professorIdStr = localStorage.getItem('professorId');
      if (!professorIdStr) {
          alert("Sua sessão expirou. Por favor, faça o login novamente.");
          router.push('/login');
          return;
      }
      const professorId = Number(professorIdStr);

      if (!dossierTitle.trim()) {
        throw new Error("O título do Dossiê não pode ser vazio.");
      }
      if (!evaluationConcept) {
        throw new Error("O método de avaliação não pode ser vazio.");
      }
      
      if (evaluationConcept === 'letter') {
        if (!evaluationMethodDetails || evaluationMethodDetails.length === 0) {
            throw new Error("Para o método de avaliação por Conceito, defina os conceitos e seus valores nas configurações.");
        }
        for (const detail of evaluationMethodDetails) {
            if (!detail.name.trim() || !detail.value.trim()) {
                throw new Error("Todos os conceitos definidos devem ter nome e valor preenchidos.");
            }
        }
      }

      const hasValidSection = sectionsData.some(sec => 
        sec.title.trim() !== "" &&
        Array.isArray(sec.items) && 
        sec.items.length > 0 && 
        sec.items.some(item => item.description.trim() !== "")
      );
      if (!hasValidSection) {
        throw new Error("O Dossiê deve conter pelo menos uma seção com título e um item com descrição preenchidos.");
      }

      let totalWeight = 0;
      for (const sec of sectionsData) {
        if (!sec.title.trim()) {
          throw new Error(`Toda seção deve ter um título.`);
        }
        if (!Array.isArray(sec.items) || sec.items.length === 0 || sec.items.every(item => !item.description.trim())) {
             throw new Error(`A seção "${sec.title}" deve conter pelo menos um item com descrição preenchida.`);
        }
        // Check for empty item descriptions only if items array is not empty
        if (Array.isArray(sec.items) && sec.items.length > 0) {
            for (const item of sec.items) {
                if (!item.description.trim()) {
                  throw new Error(`Todo item na seção "${sec.title}" deve ter uma descrição.`);
                }
            }
        }

        const parsedWeight = parseInt(sec.weight, 10);
        if (isNaN(parsedWeight) || parsedWeight < 0 || parsedWeight > 100) { // Weight should be between 0 and 100
          throw new Error(`O peso da seção "${sec.title}" é inválido. Deve ser um número entre 0 e 100.`);
        }
        totalWeight += parsedWeight;
      }

      if (totalWeight !== 100) {
        throw new Error(`A soma dos pesos de todas as seções deve ser 100%, mas é ${totalWeight}%.`);
      }

      const payload = adaptDossierStateToPayload(
        dossierTitle,
        dossierDescription,
        evaluationConcept,
        sectionsData,
        professorId, 
        evaluationMethodDetails 
      );

      setIsLoading(true); 
      if (dossierId) {
        const updatePayload: UpdateDossierPayload = {
          name: payload.name,
          description: payload.description,
          evaluation_method: payload.evaluation_method,
          sections: payload.sections
        };
        await updateDossier(dossierId, updatePayload);
        alert("Dossiê atualizado com sucesso!");
      } else {
        await createDossier(payload); 
        alert("Dossiê criado com sucesso!");
      }
      router.push('/dossie');
    } catch (error: any) {
      alert(`Falha ao salvar dossiê: ${error.response?.data?.msg || error.message}`);
    } finally {
        setIsLoading(false);
    }
  }, [dossierTitle, dossierDescription, evaluationConcept, sectionsData, dossierId, router, evaluationMethodDetails]); 

  const canDeleteItem = useMemo(() => {
    if (!selectedItemIdGlobal || !sectionsData.length) return false;    
    const sectionOfSelectedItem = sectionsData.find(s => 
        Array.isArray(s.items) && s.items.some(item => item.id === selectedItemIdGlobal)
    );
    if (!sectionOfSelectedItem) return false; 
    
    return !(sectionsData.length === 1 && sectionOfSelectedItem.items.length === 1);
  }, [selectedItemIdGlobal, sectionsData]);

  const canDeleteSection = useMemo(() => {
    const hasSelection = !!selectedSectionIdForStyling || !!selectedItemIdGlobal;
    return hasSelection && sectionsData.length > 1;
  }, [selectedSectionIdForStyling, selectedItemIdGlobal, sectionsData.length]);

  const isFocusedElementAnItemField = useMemo(() => {
    if (!isClient) return false;
    const currentFocusedElement = focusedElementRef.current;
    return currentFocusedElement instanceof HTMLElement &&
           currentFocusedElement.closest(`[id^="dossier-item-"]`) instanceof HTMLElement;
  }, [isClient, focusedElementRef.current]); 
  
  const showActionSidebar = useMemo(() => 
      isClient && isEditingMode && isFocusedElementAnItemField && sidebarTargetTop !== null, 
      [isClient, isEditingMode, isFocusedElementAnItemField, sidebarTargetTop]
  );


  if (!isClient || !isAuthenticated) {
    return <div className={styles.loadingMessage}>Carregando e verificando autenticação...</div>;
  }
  if (isLoading && dossierId !== null && !isSettingsModalOpen) { 
    return <div className={styles.loadingMessage}>Carregando dados do dossiê...</div>;
  }
  if (error && !isSettingsModalOpen) { 
    return <div className={styles.errorMessage}>Erro: {error} <button onClick={() => setError(null)}>Tentar Novamente</button></div>;
  }

  return (
    <>
      <Head>
        <title>{dossierId ? (isEditingMode? 'Editar Dossiê' : 'Visualizar Dossiê') : 'Novo Dossiê'}</title>
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
              settingsButtonClassName={styles.dossierHeader_settingsButton}
              settingsButtonIconClassName={styles.pageHeader_backIcon} 
            />
            {(!isLoading || dossierId === null) && sectionsData.length > 0 && ( // Render SectionList only if not loading (for edit) or if create mode and sectionsData is populated
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
            )}
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
              <button onClick={handleSave} className={styles.saveButton} disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          )}
        </main>
      </div>
      {isClient && (
          <EvaluationSettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            initialMethods={evaluationMethodDetails} // This should always be an array
            onSave={handleSaveEvaluationSettings}
            modalOverlayClassName={styles.modalOverlay}
            modalContentClassName={styles.modalContent}
            modalHeaderClassName={styles.modalHeader}
            modalTitleClassName={styles.modalTitle}
            modalCloseButtonClassName={styles.modalCloseButton}
            modalBodyClassName={styles.modalBody}
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