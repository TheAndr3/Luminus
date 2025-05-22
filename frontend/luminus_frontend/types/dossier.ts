// src/types/dossier.ts
export interface ItemData {
  id: string;
  description: string;
  value: string | number;
}

export interface SectionData {
  id: string;
  title: string;
  items: ItemData[];
}