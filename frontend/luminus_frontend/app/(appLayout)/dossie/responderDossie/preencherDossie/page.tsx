//preencherDossie/page.tsx
"use client";

import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import styles from './preencherDossie.module.css';
import { DossierFillData, DossierSection, DossierItem, HandleItemChange, HandleSectionChange, HandleDossierChange } from '..//preencherDossieTypes/dossiePreenchimento';

// --- Mock de Dados Iniciais (Simulando um modelo de dossiê carregado) ---
const initialDossierData: DossierFillData = {
  id: 'dossie-modelo-123',
  title: 'Avaliação de Desempenho Trimestral - Q1 2025',
  description: 'Este dossiê visa coletar informações sobre o desempenho no primeiro trimestre.',
  studentName: 'Maria Silva', // Exemplo de campo adicional
  sections: [
    {
      id: 'section-1',
      title: 'Objetivos e Metas',
      guidance: 'Descreva o progresso em relação aos objetivos definidos para este trimestre.',
      items: [
        { id: 'item-1-1', description: 'Meta 1: Concluir o relatório XYZ.', answer: '' },
        { id: 'item-1-2', description: 'Meta 2: Apresentar resultados da pesquisa ABC.', answer: '' },
      ],
    },
    {
      id: 'section-2',
      title: 'Desenvolvimento de Habilidades',
      guidance: 'Quais habilidades foram desenvolvidas ou aprimoradas?',
      items: [
        { id: 'item-2-1', description: 'Habilidade em Comunicação Interpessoal:', answer: '' },
        { id: 'item-2-2', description: 'Habilidade em Análise de Dados:', answer: '' },
      ],
    },
    {
      id: 'section-3',
      title: 'Feedback e Comentários Adicionais',
      items: [
        { id: 'item-3-1', description: 'Comentários gerais sobre o período:', answer: '' },
      ],
    },
  ],
};

// --- Componentes Internos para Melhor Organização ---

interface DossierItemRowProps {
  item: DossierItem;
  sectionId: string;
  isEditing: boolean;
  onItemChange: HandleItemChange;
}

const DossierItemRow: React.FC<DossierItemRowProps> = ({ item, sectionId, isEditing, onItemChange }) => {
  return (
    <div className={styles.itemRow}>
      <label htmlFor={`item-desc-${item.id}`} className={styles.itemDescriptionLabel}>
        {item.description}
      </label>
      {isEditing ? (
        <textarea
          id={`item-answer-${item.id}`}
          value={item.answer}
          onChange={(e) => onItemChange(sectionId, item.id, 'answer', e.target.value)}
          className={styles.itemTextarea}
          placeholder="Sua resposta..."
          rows={3}
        />
      ) : (
        <p className={styles.itemAnswerDisplay}>
          {item.answer || <span className={styles.emptyAnswer}>Não preenchido</span>}
        </p>
      )}
    </div>
  );
};

interface DossierSectionCardProps {
  section: DossierSection;
  isEditing: boolean;
  onItemChange: HandleItemChange;
  // Seções não são editáveis neste contexto, apenas seus itens
}

const DossierSectionCard: React.FC<DossierSectionCardProps> = ({ section, isEditing, onItemChange }) => {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>{section.title}</h2>
      {section.guidance && <p className={styles.sectionGuidance}>{section.guidance}</p>}
      <div className={styles.itemsList}>
        {section.items.map(item => (
          <DossierItemRow
            key={item.id}
            item={item}
            sectionId={section.id}
            isEditing={isEditing}
            onItemChange={onItemChange}
          />
        ))}
      </div>
    </div>
  );
};

// --- Componente Principal da Página de Preenchimento ---
const PreencherDossiePage: React.FC = () => {
  const [dossierData, setDossierData] = useState<DossierFillData>(initialDossierData);
  const [isEditing, setIsEditing] = useState(true); // Começa em modo de edição

  const handleDossierFieldChange: HandleDossierChange = useCallback((field, value) => {
    setDossierData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // Neste exemplo, o título e descrição da seção não são editáveis, apenas as respostas dos itens.
  // const handleSectionFieldChange: HandleSectionChange = useCallback((sectionId, field, value) => {
  //   setDossierData(prev => ({
  //     ...prev,
  //     sections: prev.sections.map(sec =>
  //       sec.id === sectionId ? { ...sec, [field]: value } : sec
  //     ),
  //   }));
  // }, []);

  const handleItemFieldChange: HandleItemChange = useCallback((sectionId, itemId, field, value) => {
    setDossierData(prev => ({
      ...prev,
      sections: prev.sections.map(sec =>
        sec.id === sectionId
          ? {
              ...sec,
              items: sec.items.map(item =>
                item.id === itemId ? { ...item, [field]: value } : item
              ),
            }
          : sec
      ),
    }));
  }, []);

  const handleToggleEditMode = () => {
    setIsEditing(prev => !prev);
  };

  const handleSaveDossier = () => {
    console.log("Dossiê a ser salvo:", dossierData);
    // Aqui você faria a chamada para a API para salvar os dados
    alert("Dossiê salvo no console! (Simulação)");
    setIsEditing(false); // Sai do modo de edição após salvar
  };

  return (
    <>
      <Head>
        <title>Preencher Dossiê: {dossierData.title}</title>
      </Head>
      <div className={styles.pageContainer}>
        <header className={styles.pageHeader}>
          <h1>{isEditing ? "Preenchendo Dossiê" : "Visualizando Dossiê"}</h1>
          <div className={styles.headerActions}>
            <button onClick={handleToggleEditMode} className={styles.toggleButton}>
              {isEditing ? 'Modo Visualização' : 'Modo Edição'}
            </button>
            {isEditing && (
              <button onClick={handleSaveDossier} className={styles.saveButton}>
                Salvar Dossiê
              </button>
            )}
          </div>
        </header>

        <main className={styles.mainContent}>
          <div className={styles.dossierHeader}>
            <h2>{dossierData.title}</h2>
            {dossierData.description && <p className={styles.dossierDescription}>{dossierData.description}</p>}
            {isEditing && dossierData.hasOwnProperty('studentName') ? (
                 <div className={styles.dossierMetaField}>
                    <label htmlFor="studentName">Nome do Avaliado:</label>
                    <input
                        id="studentName"
                        type="text"
                        value={dossierData.studentName || ''}
                        onChange={(e) => handleDossierFieldChange('studentName', e.target.value)}
                        className={styles.metaInput}
                    />
                 </div>
            ) : dossierData.studentName && (
                <p className={styles.dossierMeta}>Avaliado: {dossierData.studentName}</p>
            )}
          </div>

          <div className={styles.sectionsContainer}>
            {dossierData.sections.map(section => (
              <DossierSectionCard
                key={section.id}
                section={section}
                isEditing={isEditing}
                onItemChange={handleItemFieldChange}
              />
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default PreencherDossiePage;