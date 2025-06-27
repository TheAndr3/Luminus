export interface DossierItem {
  id: number;
  description: string;
  answer: EvaluationType | null;
}

export interface DossierSection {
  id: number;
  title: string;
  guidance: string;
  items: DossierItem[];
}

export interface DossierFillData {
  id: number;
  title: string;
  description?: string;
  studentName?: string;
  sections: DossierSection[];
}

export interface EvaluationType {
  id: number;
  name: string;
  value: number;
}

export type HandleItemChange = (
  sectionId: number,
  itemId: number,
  field: keyof DossierItem,
  value: EvaluationType | string | null
) => void;

export type HandleDossierChange = (field: keyof Omit<DossierFillData, 'sections' | 'studentName'>, value: string) => void; 