export interface Dossie {
  id: number;
  name: string;
  description: string;
  evaluationMethod: string;
  customUserId: number;
  selected?: boolean;
}

export interface Section {
  id: number;
  name: string;
  description: string;
  weigth: number;
  questions: Question[];
}

export interface Question {
  id: number;
  description: string;
} 