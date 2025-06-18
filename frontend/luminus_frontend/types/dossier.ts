// types/dossier.ts
import {
    Question,
    Section,
    CreateDossierPayload
    // Não precisamos mais importar EvaluationMethodItem daqui para o adapter,
    // pois ele será um tipo de entrada da UI.
} from '../services/dossierServices'; // Ajuste o caminho conforme a localização dos seus tipos

export interface ItemData {
  id: string;
  description: string;
  value: string | number;
}

export interface SectionData {
  id: string;
  title: string;
  description: string;
  weight: string;
  items: ItemData[];
}

export type EvaluationConcept = 'numerical' | 'letter';

export interface EvaluationMethodItem {
  id: string;
  name: string;
  value: string;
}

/**
 * Adapta os dados do estado da UI do Dossiê para o formato esperado pelo payload do backend.
 * @param dossierTitle O título do dossiê.
 * @param dossierDescription A descrição do dossiê.
 * @param evaluationConcept O conceito de avaliação ('numerical' ou 'letter').
 * @param sections Os dados das seções no formato da UI.
 * @param professorId O ID do professor.
 * @param customEvaluationMethods A lista de métodos de avaliação customizados (para conceito 'letter').
 * @returns O payload formatado para envio ao backend.
 */
export const adaptDossierStateToPayload = (
    dossierTitle: string,
    dossierDescription: string,
    evaluationConcept: EvaluationConcept,
    sections: SectionData[],
    professorId: number,
    customEvaluationMethods: EvaluationMethodItem[] // Novo parâmetro
): CreateDossierPayload => {

    let evaluationMethodPayload: { name: string; value: string; }[];

    if (evaluationConcept === 'letter') {
        // Usa os métodos customizados, removendo o 'id' que é apenas para a UI
        evaluationMethodPayload = customEvaluationMethods.map(method => ({
            name: method.name,
            value: method.value,
        }));
        // Garante que não envie um array vazio se for 'letter' e nenhum método for definido (embora o modal deva ter validações)
        if (evaluationMethodPayload.length === 0) {
            // Poderia lançar um erro aqui ou usar um default, dependendo da regra de negócio.
            // Por ora, para o backend, pode ser que um array vazio seja aceitável ou não.
            // Vamos assumir que o modal impede isso. Caso contrário:
            // evaluationMethodPayload = [{ name: "default", value: "default" }];
            console.warn("Conceito 'letter' selecionado, mas nenhum método de avaliação customizado foi fornecido. O payload pode estar incompleto.");
        }
    } else { // 'numerical'
        evaluationMethodPayload = [{ name: 'numerical', value: '0.0-10.0' }]; // Valor mais descritivo para numérico
    }

    const backendSections: Section[] = sections.map(sectionData => {
        const backendQuestions: Question[] = sectionData.items.map(itemData => ({
            description: itemData.description,
        }));

        const parsedWeight = parseInt(sectionData.weight, 10);
        const sectionWeight = isNaN(parsedWeight) ? 0 : parsedWeight;

        return {
            name: sectionData.title,
            description: sectionData.description,
            weigth: sectionWeight,
            questions: backendQuestions,
        };
    });

    const payload: CreateDossierPayload = {
        name: dossierTitle,
        costumUser_id: professorId,
        description: dossierDescription,
        evaluation_method: evaluationMethodPayload,
        sections: backendSections,
    };

    return payload;
};