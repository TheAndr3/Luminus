// src/types/dossiePreenchimento.ts

export interface DossierItem {
  id: number;
  description: string; // Descrição do critério ou pergunta
  answer: number|string;      // Resposta ou valor preenchido pelo usuário
}

export interface DossierSection {
  id: number;
  title: string;       // Título da seção (ex: "Competências Técnicas")
  guidance?: string;   // Orientação ou descrição da seção (opcional)
  items: DossierItem[];
}

export interface DossierFillData {
  id: number;
  title: string;               // Título do modelo de Dossiê (ex: "Avaliação Semestral")
  description?: string;        // Descrição geral do Dossiê (opcional)
  studentName?: string;        // Nome do aluno/avaliado (se aplicável)
  sections: DossierSection[];
}

// Tipos para os handlers de mudança
export type HandleItemChange = (sectionId: number, itemId: number, field: keyof Omit<DossierItem, 'id'>, value: number|string) => void;
export type HandleSectionChange = (sectionId: number, field: keyof Omit<DossierSection, 'id' | 'items'>, value: number|string) => void;
export type HandleDossierChange = (field: keyof Omit<DossierFillData, 'id' | 'sections'>, value: number | string) => void;