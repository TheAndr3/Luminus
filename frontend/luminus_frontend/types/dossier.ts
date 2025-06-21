// types/dossier.ts
import {
    CreateDossierPayload as ServiceCreateDossierPayload,
    Section as ServiceSection,
    // Question as ServiceQuestion // Não vamos usar ServiceQuestion diretamente para o mapeamento
                                 // por causa da incompatibilidade com o uso de 'name' no backend.
    Question // Importando Question para referência, mas sabendo da limitação.
} from '../services/dossierServices';

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

interface BackendEvaluationTypePayload {
    name: string;
    value: number;
}

// Interface para o que o backend realmente espera para cada questão DENTRO do payload
// baseado no DossierController.js (payloadQuestion.name = question.name)
interface BackendQuestionPayload {
    name: string;
    // Se a interface Question do dossierServices tivesse outros campos obrigatórios,
    // teríamos que adicioná-los aqui com valores dummy ou reais se o backend os usasse.
    // Como Question só tem 'description', e o backend usa 'name',
    // vamos priorizar 'name' e fazer um cast.
}


export const adaptDossierStateToPayload = (
    dossierTitle: string,
    dossierDescription: string,
    evaluationConcept: EvaluationConcept,
    sectionsData: SectionData[],
    professorId: number,
    customEvaluationMethodsFromUI: EvaluationMethodItem[]
): ServiceCreateDossierPayload => {

    let evaluationMethodPayloadForBackend: BackendEvaluationTypePayload[];

    if (evaluationConcept === 'letter') {
        evaluationMethodPayloadForBackend = customEvaluationMethodsFromUI.map(method => ({
            name: method.name,
            value: parseFloat(method.value),
        }));
    } else {
        evaluationMethodPayloadForBackend = [];
    }

    const backendSections: ServiceSection[] = sectionsData.map(sectionUI => {
        // O backend DossierController.js usa 'question.name' ao criar payloadQuestion.
        // A interface Question em dossierServices.ts espera 'description'.
        // Vamos criar objetos com 'name' e depois fazer um cast para Question[].
        const questionsForBackendController: BackendQuestionPayload[] = sectionUI.items.map(itemUI => ({
            name: itemUI.description,
        }));

        const parsedWeight = parseInt(sectionUI.weight, 10);
        const sectionWeight = isNaN(parsedWeight) ? 0 : parsedWeight;

        return {
            name: sectionUI.title,
            description: sectionUI.description,
            weigth: sectionWeight,
            // Aqui está o ponto crítico:
            // Fazemos um cast de BackendQuestionPayload[] para Question[] (de dossierServices.ts).
            // Isso satisfaz o TypeScript para a interface ServiceSection, mas o conteúdo real
            // dos objetos no array é { name: string }, que é o que o backend controller usa.
            questions: questionsForBackendController as unknown as Question[],
        };
    });

    const payloadStructureForController = {
        name: dossierTitle,
        customUserId: professorId,
        description: dossierDescription,
        evaluationMethod: evaluationMethodPayloadForBackend as any, // Para o loop do controller
        sections: backendSections,
    };

    // Adiciona a propriedade .name ao array evaluationMethod para o backend controller
    if (evaluationConcept === 'letter' && evaluationMethodPayloadForBackend.length > 0) {
      (payloadStructureForController.evaluationMethod as any).name = evaluationConcept;
    } else if (evaluationConcept === 'numerical') {
      (payloadStructureForController.evaluationMethod as any).name = evaluationConcept;
    }
    // O tipo de payloadStructureForController aqui é quase ServiceCreateDossierPayload,
    // exceto pela estrutura interna de `evaluationMethod` e `questions` que foram
    // ajustadas para o que o *código do controller* espera, não necessariamente a *interface*.

    // Precisamos fazer um cast final para ServiceCreateDossierPayload.
    // A incompatibilidade principal é `evaluationMethod` (array vs objeto)
    // e o conteúdo de `questions` (name vs description).
    // O `as any` em evaluationMethod já lida com a primeira.
    // O `as unknown as Question[]` em questions lida com a segunda para a tipagem.
    return payloadStructureForController as ServiceCreateDossierPayload;
};