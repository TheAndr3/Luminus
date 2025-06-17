// src/types/dossier.ts
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

// Novo tipo para a UI do modal de configurações de avaliação
export interface EvaluationMethodItem {
  id: string; // ID para a UI (gerenciado pelo React para keys)
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
 * @param evaluationMethodDetails Detalhes customizados para métodos de avaliação do tipo 'letter'.
 * @returns O payload formatado para envio ao backend.
 */
export const adaptDossierStateToPayload = (
    dossierTitle: string,
    dossierDescription: string,
    evaluationConcept: EvaluationConcept,
    sections: SectionData[],
    professorId: number,
    evaluationMethodDetails: EvaluationMethodItem[] // Novo parâmetro
): CreateDossierPayload => {

    let backendEvaluationMethod: { name: string; value: string; }[];

    if (evaluationConcept === 'numerical') {
        // Para 'numerical', o backend espera um array com um item específico ou uma convenção.
        // Baseado na estrutura de CreateDossierPayload, ele espera um array.
        // O valor '1' aqui é um placeholder, o backend pode ignorá-lo para o tipo 'numerical'.
        backendEvaluationMethod = [{ name: 'numerical', value: '1' }];
    } else { // 'letter'
        if (evaluationMethodDetails && evaluationMethodDetails.length > 0) {
            backendEvaluationMethod = evaluationMethodDetails.map(item => ({
                name: item.name,
                value: item.value,
            }));
        } else {
            // Se for 'letter' mas não houver detalhes (ex: usuário não configurou),
            // é importante ter um fallback ou que a UI previna isso.
            // Para este exemplo, vamos assumir que a UI garante que 'letter' tenha pelo menos um conceito
            // ou enviamos um default que o backend possa entender.
            // Esta situação idealmente seria validada antes de chamar adaptDossierStateToPayload.
            // Por segurança, pode-se enviar um array vazio ou um default conhecido pelo backend.
            // Por hora, enviaremos um array vazio se não houver detalhes, mas isso pode precisar de ajuste
            // dependendo de como o backend trata evaluation_method para 'letter' sem conceitos definidos.
            // Ou melhor, lançar um erro se evaluationMethodDetails estiver vazio para 'letter'.
            // Para o exemplo, vamos deixar a validação para a UI/handleSave.
            // Se chegar aqui vazio, a UI não validou corretamente.
            // Temporariamente, para evitar erro de compilação, se vazio:
            console.warn("adaptDossierStateToPayload: 'letter' concept chosen but no evaluationMethodDetails provided. Sending empty array.");
            backendEvaluationMethod = []; // Ou um default: [{ name: "Padrão", value: "Pendente" }]
        }
    }

    // Adapta a lista de seções
    const backendSections: Section[] = sections.map(sectionData => {
        // Adapta a lista de itens (questions) dentro de cada seção
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

    // Cria o payload final para o backend
    const payload: CreateDossierPayload = {
        name: dossierTitle,
        costumUser_id: professorId,
        description: dossierDescription,
        evaluation_method: backendEvaluationMethod,
        sections: backendSections,
    };

    return payload;
};