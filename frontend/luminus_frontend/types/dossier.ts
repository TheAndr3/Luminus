// types/dossier.ts
import {
    CreateDossierPayload as ServiceCreateDossierPayload,
    Section as ServiceSection,
    Question, // Mantendo a importação original. { description: string; }
    EvaluationMethod as ServiceEvaluationMethod, // Importando o tipo do serviço
    EvaluationType as ServiceEvaluationType // Importando o tipo do serviço
} from '../services/dossierServices';

// UI types (permanecem os mesmos que você forneceu)
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

export interface EvaluationMethodItem { // UI type for custom eval methods (e.g., from modal)
  id: string;
  name: string;
  value: string; // User inputs as string, will be parsed to float for backend
}

// Interface para o que o backend controller espera para cada Question no payload.
// Baseado em DossierController.js: payloadQuestion.name = question.name
interface BackendQuestionPayload {
    name: string;
}


export const adaptDossierStateToPayload = (
    dossierTitle: string,
    dossierDescription: string,
    evaluationConcept: EvaluationConcept, // 'numerical' or 'letter'
    sectionsData: SectionData[], // UI sections
    professorId: number, // Corresponde a customUserId
    customEvaluationMethodsFromUI: EvaluationMethodItem[] // UI state for 'letter' concept methods
): ServiceCreateDossierPayload => {

    // 1. Construir o array `evaluationType` para o payload do serviço.
    // Este array conterá objetos do tipo ServiceEvaluationType: { name: string, value: number }
    const serviceEvaluationTypes: ServiceEvaluationType[] = [];
    if (evaluationConcept === 'letter') {
        customEvaluationMethodsFromUI.forEach(uiMethod => {
            serviceEvaluationTypes.push({
                name: uiMethod.name,
                value: parseFloat(uiMethod.value), // Converte o valor string da UI para número
            });
        });
    }
    // Se evaluationConcept for 'numerical', serviceEvaluationTypes permanecerá um array vazio.

    // 2. Construir o objeto `evaluationMethod` para o payload do serviço.
    // Este objeto deve corresponder à interface ServiceEvaluationMethod: { name: string, evaluationType: ServiceEvaluationType[] }
    const servicePayloadEvaluationMethod: ServiceEvaluationMethod = {
        name: evaluationConcept, // Será 'numerical' ou 'letter'
        evaluationType: serviceEvaluationTypes
    };

    // 3. Construir o array `sections` para o payload do serviço
    const backendSections: ServiceSection[] = sectionsData.map(sectionUI => {
        // O backend DossierController.js (em payloadQuestion) usa `question.name`.
        // A interface Question em dossierServices.ts usa `description`.
        // Vamos criar objetos com `name` para o que o controller parece consumir,
        // e então fazer um cast para Question[] para satisfazer a tipagem de ServiceSection.
        const questionsForBackendController: BackendQuestionPayload[] = sectionUI.items.map(itemUI => ({
            name: itemUI.description,
        }));

        const parsedWeight = parseInt(sectionUI.weight, 10);
        const sectionWeight = isNaN(parsedWeight) ? 0 : parsedWeight; // Garante que o peso seja um número

        return {
            name: sectionUI.title,
            description: sectionUI.description,
            weigth: sectionWeight,
            // Ponto crítico de tipagem:
            // Fazemos um cast de BackendQuestionPayload[] para Question[] (de dossierServices.ts).
            // Isso satisfaz o TypeScript para a interface ServiceSection. O conteúdo real dos
            // objetos no array é { name: string }, que é o que o backend controller parece usar.
            questions: questionsForBackendController as unknown as Question[],
        };
    });

    // 4. Construir o payload final para o serviço
    const servicePayload: ServiceCreateDossierPayload = {
        name: dossierTitle,
        customUserId: professorId,
        description: dossierDescription,
        evaluationMethod: servicePayloadEvaluationMethod, // Agora usa o objeto corretamente tipado
        sections: backendSections,
    };

    // O tipo de servicePayload agora corresponde a ServiceCreateDossierPayload.
    return servicePayload;
};