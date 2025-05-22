// src/pages/DossierAppPage.tsx
"use client"
import React, { useState, useCallback } from 'react';
import Head from 'next/head';

// Componentes
import PageHeader from '../../../../components/dossier/PageHeader';
import DossierHeader from '../../../../components/dossier/DossierHeader';
import SectionList from '../../../../components/dossier/SectionList';

// Tipos
import { SectionData, ItemData } from '../../../../types/dossier';

// Estilos (CSS Module ÚNICO)
import styles from './DossierCRUDPage.module.css'; // ÚNICA IMPORTAÇÃO DE ESTILO PARA COMPONENTES DE DOSSIÊ

// Mocks
const initialDossierTitleData = "Dossie 1 - 1 ✎";
const initialDossierDescriptionData = "";
const initialSectionsDataList: SectionData[] = [
  {
    id: 'section-1',
    title: 'Sessão ✎',
    items: [
      { id: 'item-1-1', description: 'Desempenho individual', value: '30%' },
      { id: 'item-1-2', description: 'O aluno participou de todas as aulas', value: '' },
    ],
  },
  {
    id: 'section-2',
    title: 'Sessão ✎',
    items: [
      { id: 'item-2-1', description: 'Desempenho em grupo', value: '70%' },
      { id: 'item-2-2', description: 'O aluno participou de todas as atividades em grupo', value: '' },
      { id: 'item-2-3', description: 'O aluno entregou todas as atividades desenvolvidas em grupo', value: ''},
    ],
  },
  {
    id: 'section-3',
    title: 'Sessão ✎',
    items: [
      { id: 'item-3-1', description: 'Pontualidade', value: '10%' },
    ],
  },
];

const DossierAppPage: React.FC = () => {
  const [dossierTitle, setDossierTitle] = useState(initialDossierTitleData);
  const [dossierDescription, setDossierDescription] = useState(initialDossierDescriptionData);
  const [sectionsData, setSectionsData] = useState<SectionData[]>(initialSectionsDataList);
  const [isEditingMode, setIsEditingMode] = useState(true);
  const [selectedSectionIdUI, setSelectedSectionIdUI] = useState<string | null>('section-2');
  const [selectedItemIdGlobal, setSelectedItemIdGlobal] = useState<string | null>(null);

  // --- Handlers (MESMOS HANDLERS DA VERSÃO ANTERIOR) ---
  const handleBackClick = useCallback(() => { console.log('Navigate back'); }, []);
  const handleToggleEditMode = useCallback(() => {
    setIsEditingMode(prev => !prev);
    if (!isEditingMode) { setSelectedItemIdGlobal(null); }
  }, [isEditingMode]);
  const handleDossierTitleChange = useCallback((newTitle: string) => { setDossierTitle(newTitle); }, []);
  const handleDossierDescriptionChange = useCallback((newDescription: string) => { setDossierDescription(newDescription); }, []);
  const handleSectionAreaClick = useCallback((sectionId: string | null) => { setSelectedSectionIdUI(sectionId); }, []);
  const handleSectionTitleChange = useCallback((sectionId: string, newTitle: string) => {
    setSectionsData(prev => prev.map(sec => (sec.id === sectionId ? { ...sec, title: newTitle } : sec)));
  }, []);
  const handleAddNewSection = useCallback((sectionId: string) => {
    const sectionToDuplicate = sectionsData.find(sec => sec.id === sectionId);
    if (sectionToDuplicate) {
      const newSection: SectionData = {
        ...sectionToDuplicate,
        id: `section-${Date.now()}`,
        title: `${sectionToDuplicate.title} (Cópia)`,
        items: sectionToDuplicate.items.map(item => ({ ...item, id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` })),
      };
      const index = sectionsData.findIndex(sec => sec.id === sectionId);
      setSectionsData(prev => [...prev.slice(0, index + 1), newSection, ...prev.slice(index + 1)]);
    }
  }, [sectionsData]);
  const handleSectionSettings = useCallback((sectionId: string) => { console.log('Settings for section:', sectionId); }, []);
  const handleSectionDelete = useCallback((sectionId: string) => {
    setSectionsData(prev => prev.filter(sec => sec.id !== sectionId));
    if (selectedSectionIdUI === sectionId) setSelectedSectionIdUI(null);
    const sectionItems = sectionsData.find(s => s.id === sectionId)?.items || [];
    if (selectedItemIdGlobal && sectionItems.some(it => it.id === selectedItemIdGlobal)) {
      setSelectedItemIdGlobal(null);
    }
  }, [sectionsData, selectedItemIdGlobal, selectedSectionIdUI]);
  const handleItemSelect = useCallback((itemId: string | null) => {
    setSelectedItemIdGlobal(itemId);
    if (itemId) {
      const sectionOfItem = sectionsData.find(sec => sec.items.some(item => item.id === itemId));
      if (sectionOfItem) setSelectedSectionIdUI(sectionOfItem.id);
    }
  }, [sectionsData]);
  const handleItemAdd = useCallback((sectionId: string) => {
    const newItemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setSectionsData(prev =>
      prev.map(sec =>
        sec.id === sectionId
          ? { ...sec, items: [...sec.items, { id: newItemId, description: 'Novo Item', value: '' }] }
          : sec
      )
    );
    setSelectedItemIdGlobal(newItemId);
    setSelectedSectionIdUI(sectionId);
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
  const handleItemDelete = useCallback((sectionId: string, itemId: string) => {
    if (selectedItemIdGlobal !== itemId && itemId) { /* Usar o itemId passado explicitamente */ }
    setSectionsData(prev => prev.map(sec => ({ ...sec, items: sec.items.filter(item => item.id !== (itemId || selectedItemIdGlobal)) })));
    if (selectedItemIdGlobal === (itemId || selectedItemIdGlobal) ) setSelectedItemIdGlobal(null);
  }, [selectedItemIdGlobal]);
  const handleSave = useCallback(() => {
    console.log("Salvar Dados:", { title: dossierTitle, description: dossierDescription, sections: sectionsData });
    alert("Dados salvos no console!");
  }, [dossierTitle, dossierDescription, sectionsData]);

  return (
    <>
      <Head>
        <title>Dossiê App</title>
      </Head>
      <div className={styles.appContainer}>
        <main className={styles.mainContent}>
          <PageHeader
            isEditing={isEditingMode}
            onBackClick={handleBackClick}
            onToggleEditMode={handleToggleEditMode}
            className={styles.pageHeader}
            backButtonClassName={styles.pageHeader_backButton}
            // backButtonIconClassName={styles.pageHeader_backIcon} // Se tiver
            toggleButtonClassName={`${styles.pageHeader_toggleButtonBase} ${
              isEditingMode ? styles.pageHeader_toggleButtonEditing : styles.pageHeader_toggleButtonViewing
            }`}
          />

          <div className={styles.scrollableArea}>
            <DossierHeader
              title={dossierTitle}
              description={dossierDescription}
              isEditing={isEditingMode}
              onTitleChange={handleDossierTitleChange}
              onDescriptionChange={handleDossierDescriptionChange}
              className={styles.dossierHeaderContainer}
              titleTextClassName={styles.dossierHeader_titleText}
              titleInputClassName={styles.dossierHeader_titleInput}
              titleDescriptionDividerClassName={styles.dossierHeader_divider}
              descriptionLabelClassName={styles.dossierHeader_descriptionLabel}
              descriptionTextClassName={styles.dossierHeader_descriptionTextDisplay}
              descriptionTextareaClassName={styles.dossierHeader_descriptionTextarea}
            />

            <SectionList
              sections={sectionsData}
              isEditing={isEditingMode}
              selectedSectionIdForStyling={selectedSectionIdUI}
              selectedItemId={selectedItemIdGlobal}
              onSectionAreaClick={handleSectionAreaClick}
              onSectionTitleChange={handleSectionTitleChange}
              onAddNewSection={handleAddNewSection}
              onSectionSettings={handleSectionSettings}
              onSectionDelete={handleSectionDelete}
              onItemAdd={handleItemAdd}
              onItemChange={handleItemChange}
              onItemDelete={handleItemDelete}
              onItemSelect={handleItemSelect}
              
              className={styles.sectionListContainer}
              // Section classes
              sectionComponentClassName={styles.section_outerContainer}
              sectionComponentContentWrapperClassName={styles.section_contentWrapper}
              sectionComponentSelectedStylingClassName={styles.section_selectedStyling}
              sectionComponentTitleContainerClassName={styles.section_titleContainer}
              sectionComponentTitleTextClassName={styles.section_titleText}
              sectionComponentTitleInputClassName={styles.section_titleInput}
              sectionComponentItemsListClassName={styles.section_itemsList}
              // SectionItem classes (passadas para Section)
              sectionItemClassName={`${styles.sectionItem_container} ${isEditingMode ? styles.sectionItem_containerEditable : ''}`}
              sectionItemSelectedClassName={styles.sectionItem_selected}
              sectionItemDescriptionFieldContainerClassName={styles.sectionItem_descriptionFieldWrapper}
              sectionItemDescriptionTextDisplayClassName={styles.editableField_textDisplayItem}
              sectionItemDescriptionInputClassName={styles.editableField_inputItem}
              sectionItemValueFieldContainerClassName={styles.sectionItem_valueFieldWrapper}
              sectionItemValueTextDisplayClassName={styles.editableField_textDisplayItem}
              sectionItemValueInputClassName={styles.editableField_inputItem}
              // ActionSidebar classes (passadas para Section)
              actionSidebarContainerClassName={styles.actionSidebar_container}
              actionSidebarButtonClassName={styles.actionSidebar_buttonBase}
              actionSidebarDisabledButtonClassName={styles.actionSidebar_buttonDisabled}
            />
          </div>

          <div className={styles.footerActions}>
            <button onClick={handleSave} className={styles.saveButton}>
              Salvar
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

export default DossierAppPage;