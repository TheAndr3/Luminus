// src/types/dossiePreenchimento.ts

export interface DossierItem {
  id: string;
  description: string; // Descrição do critério ou pergunta
  answer: string;      // Resposta ou valor preenchido pelo usuário
}

export interface DossierSection {
  id: string;
  title: string;       // Título da seção (ex: "Competências Técnicas")
  guidance?: string;   // Orientação ou descrição da seção (opcional)
  items: DossierItem[];
}

export interface DossierFillData {
  id: string;
  title: string;               // Título do modelo de Dossiê (ex: "Avaliação Semestral")
  description?: string;        // Descrição geral do Dossiê (opcional)
  studentName?: string;        // Nome do aluno/avaliado (se aplicável)
  sections: DossierSection[];
}

// Tipos para os handlers de mudança
export type HandleItemChange = (sectionId: string, itemId: string, field: keyof Omit<DossierItem, 'id'>, value: string) => void;
export type HandleSectionChange = (sectionId: string, field: keyof Omit<DossierSection, 'id' | 'items'>, value: string) => void;
export type HandleDossierChange = (field: keyof Omit<DossierFillData, 'id' | 'sections'>, value: string) => void;