export interface Dossie {
  id: number;
  name: string;
  description: string;
  evaluation_method: string;
  costumUser_id: number;
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