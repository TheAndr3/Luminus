
import { 
    Question, 
    Section, 
    CreateDossierPayload 
} from '../services/dossierServices'; // Ajuste o caminho conforme a localização dos seus tipos

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

// utils/dossierAdapter.ts


/**
 * Adapta os dados do estado da UI do Dossiê para o formato esperado pelo payload do backend.
 * @param dossierTitle O título do dossiê.
 * @param dossierDescription A descrição do dossiê.
 * @param evaluationConcept O conceito de avaliação ('numerical' ou 'letter').
 * @param sections Os dados das seções no formato da UI.
 * @param professorId O ID do professor (necessário para o payload, assumindo que vem de outro lugar).
 * @returns O payload formatado para envio ao backend.
 */
export const adaptDossierStateToPayload = (
    dossierTitle: string,
    dossierDescription: string,
    evaluationConcept: EvaluationConcept,
    sections: SectionData[],
    professorId: number // Professor ID precisa ser fornecido, pois não está no estado local que você mostrou
): CreateDossierPayload => {

    // Mapeia o conceito de avaliação para o formato esperado pelo backend
    const evaluationMethod = evaluationConcept === 'numerical' ? 'numerical' : 'letter'; // Exemplo de mapeamento simples

    // Adapta a lista de seções
    const backendSections: Section[] = sections.map(sectionData => {
        // Adapta a lista de itens (questions) dentro de cada seção
        const backendQuestions: Question[] = sectionData.items.map(itemData => ({
            description: itemData.description,
            // itemData.value não é incluído, pois a interface Question não o possui
        }));

        // Converte o peso de string para número.
        // Assume que weight é uma string contendo um número, pode ser vazia.
        // Trata casos onde a conversão falha (NaN), retornando 0.
        const parsedWeight = parseInt(sectionData.weight, 10);
        const sectionWeight = isNaN(parsedWeight) ? 0 : parsedWeight;

        return {
            name: sectionData.title,
            description: sectionData.description,
            weigth: sectionWeight, // ATENÇÃO: Usando 'weigth' com 'i' conforme sua interface de backend
            questions: backendQuestions,
        };
    });

    // Cria o payload final para o backend
    const payload: CreateDossierPayload = {
        name: dossierTitle,
        professor_id: professorId,
        description: dossierDescription,
        evaluation_method: evaluationMethod,
        sections: backendSections,
    };

    return payload;
};