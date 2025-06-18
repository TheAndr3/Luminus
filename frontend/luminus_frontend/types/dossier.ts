// types/dossier.ts
import {
    Question,
    Section,
    CreateDossierPayload as ServiceCreateDossierPayload // Importar o tipo do serviço
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
  id: string; // ID para UI
  name: string;
  value: string;
}

// NÃO redefinimos CreateDossierPayload aqui.
// A função adaptadora irá construir o tipo esperado pelo serviço.

/**
 * Adapta os dados do estado da UI do Dossiê para o formato esperado pelo payload do backend.
 */
export const adaptDossierStateToPayload = (
    dossierTitle: string,
    dossierDescription: string,
    evaluationConcept: EvaluationConcept, // 'numerical' ou 'letter'
    sections: SectionData[],
    professorId: number,
    customEvaluationMethods: EvaluationMethodItem[] // Vem da UI
): ServiceCreateDossierPayload => { // Retorna o tipo do SERVIÇO

    let evaluationMethodPayload: { name: string; value: string; }[];

    if (evaluationConcept === 'letter') {
        if (customEvaluationMethods.length > 0) {
            evaluationMethodPayload = customEvaluationMethods.map(method => ({
                name: method.name,
                value: method.value,
            }));
        } else {
            // Se for 'letter' e não houver métodos, o backend espera um array.
            // Poderíamos enviar um array vazio ou um default, dependendo da regra de negócio do backend.
            // Para ser seguro, podemos enviar um default se nenhum for fornecido.
            // Ou lançar um erro na UI antes de chegar aqui.
            // Conforme a validação na page.tsx, este caso não deve ocorrer se houver métodos.
            // Se a validação permitir array vazio, então: evaluationMethodPayload = [];
            // Por ora, assumindo que a UI garante que customEvaluationMethods não é vazio para 'letter'.
            // Se chegar aqui vazio, a validação na page.tsx falhou.
            // Se o backend espera SEMPRE algo, mesmo que 'default', adicionaríamos aqui.
            // Por segurança, vamos usar um placeholder se a validação da UI falhar em pegar.
            console.warn("adaptDossierStateToPayload: 'letter' concept with no custom methods. Sending default placeholder.");
            evaluationMethodPayload = [{ name: "Conceito Padrão", value: "P" }]; // Placeholder
        }
    } else { // 'numerical'
        // O backend espera um array para numerical também, ex: [{ name: 'numerical', value: '0.0-10.0' }]
        // ou [{ name: 'numerical', value: '1' }] como no seu exemplo original.
        // Vamos usar algo que indique o tipo.
        evaluationMethodPayload = [{ name: evaluationConcept, value: '0.0-10.0' }]; // ou '1' se for o caso
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

    const payload: ServiceCreateDossierPayload = {
        name: dossierTitle,
        costumUser_id: professorId,
        description: dossierDescription,
        evaluation_method: evaluationMethodPayload, // Agora está correto
        sections: backendSections,
    };

    return payload;
};