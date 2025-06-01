export interface ItemData {
  id: string;
  description: string;
  value: string | number; // Mantido para uso futuro, mas não visível no SectionItem por padrão
}

export interface SectionData {
  id: string;
  title: string;
  description: string;
  weight: string; // Para armazenar o peso como "XX%"
  items: ItemData[];
}

export type EvaluationConcept = 'numerical' | 'letter';