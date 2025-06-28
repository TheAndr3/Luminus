"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Download } from 'lucide-react';
import styles from './preencherDossie.module.css';
import { DossierFillData, DossierSection, DossierItem, HandleItemChange, HandleDossierChange, EvaluationType } from './types';
import { getDossierById } from '@/services/dossierServices';
import { GetStudentAppraisal, UpdateAppraisal, CreateAppraisal } from '@/services/appraisalService';
import { GetStudent } from '@/services/studentService';
import { api } from '@/services/api';

// --- Interface para a estrutura da resposta da API ---
interface DossierApiResponse {
    id: number;
    name: string;
    description: string;
    evaluation_method: { // Atualizado para corresponder à API
        id: number;
        name: 'numerical' | 'letter';
        evaluationType: Array<{ id: number; name: string; value: number }>;
    };
    sections: { [key: string]: { id: number; name: string; description: string; weigth: number; questions: { [key: string]: { id: number; name: string; }; }; }; };
}

interface AppraisalApiResponse {
    id: number;
    student_id: number;
    dossier_id: number;
    answers: Array<{ question_id: number; evaluation_type_id?: number; question_option_id?: number; answer_value?: number; }>;
}

type AnswerPayload = {
  question_id: number;
  evaluation_type_id?: number;
  answer_value?: number;
};


// --- Componentes Internos para Melhor Organização ---

interface DossierItemRowProps {
  item: DossierItem;
  sectionId: number;
  isEditing: boolean;
  onItemChange: HandleItemChange;
  evaluationOptions: EvaluationType[]; // Opções para o select
  evaluationConcept: 'numerical' | 'letter'; // Para saber como formatar o dropdown
}

const DossierItemRow: React.FC<DossierItemRowProps> = ({ item, sectionId, isEditing, onItemChange, evaluationOptions, evaluationConcept }) => {
  const initialValue = (item.answer && typeof item.answer === 'object' && 'value' in item.answer)
    ? (item.answer as EvaluationType).value.toString()
    : '';
  const [inputValue, setInputValue] = useState(initialValue);

  useEffect(() => {
    const externalValue = (item.answer && typeof item.answer === 'object' && 'value' in item.answer)
      ? (item.answer as EvaluationType).value.toString()
      : '';
    setInputValue(externalValue);
  }, [item.answer]);

  const handleNumericBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (rawValue === '') {
      onItemChange(sectionId, item.id, 'answer', null);
      return;
    }
    
    // Força para inteiro e remove decimais
    let numValue = parseInt(rawValue, 10);
    if (isNaN(numValue)) {
      setInputValue('');
      onItemChange(sectionId, item.id, 'answer', null);
      return;
    }

    // Garante que o valor está entre 0 e 10
    const clampedValue = Math.max(0, Math.min(10, numValue));

    const selectedOption = evaluationOptions.find(opt => opt.value === clampedValue);

    if (selectedOption) {
      onItemChange(sectionId, item.id, 'answer', selectedOption);
      setInputValue(selectedOption.value.toString());
    } else {
      setInputValue('');
      onItemChange(sectionId, item.id, 'answer', null);
    }
  };

  if (isEditing && evaluationConcept === 'numerical') {
    return (
      <div className={styles.itemRow}>
        <label htmlFor={`item-desc-${item.id}`} className={styles.itemDescriptionLabel}>
          {item.description}
        </label>
        <input
          type="number"
          id={`item-answer-${item.id}`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleNumericBlur}
          className={styles.itemInput}
          step="1" // Apenas inteiros
          min="0"
          max="10"
          placeholder="Nota (0-10)"
        />
      </div>
    );
  }
  
  const selectedValue = item.answer && typeof item.answer === 'object' ? (item.answer as EvaluationType).id : '';

  return (
    <div className={styles.itemRow}>
      <label htmlFor={`item-desc-${item.id}`} className={styles.itemDescriptionLabel}>
        {item.description}
      </label>
      {isEditing ? (
        <select
          id={`item-answer-${item.id}`}
          value={selectedValue}
          onChange={(e) => {
            const selectedOption = evaluationOptions.find(opt => opt.id === Number(e.target.value));
            onItemChange(sectionId, item.id, 'answer', selectedOption || null);
          }}
          className={styles.itemSelect}
        >
          <option value="">Selecione...</option>
          {evaluationOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{`${opt.name} (${opt.value})`}</option>
          ))}
        </select>
      ) : (
        <p className={styles.itemAnswerDisplay}>
          {(item.answer && typeof item.answer === 'object' && 'name' in item.answer)
            ? (item.answer as EvaluationType).name
            : <span className={styles.emptyAnswer}>Não preenchido</span>
          }
        </p>
      )}
    </div>
  );
};

interface DossierSectionCardProps {
  section: DossierSection;
  isEditing: boolean;
  onItemChange: HandleItemChange;
  evaluationOptions: EvaluationType[];
}

const DossierSectionCard: React.FC<DossierSectionCardProps> = ({ section, isEditing, onItemChange, evaluationOptions }) => {
  // Define o conceito com base nas opções para passar para o item
  const evaluationConcept = evaluationOptions.some(opt => isNaN(Number(opt.name))) ? 'letter' : 'numerical';

  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{section.title}</h2>
        <span className={styles.sectionWeight}>{`Peso: ${section.weight}%`}</span>
      </div>
      {section.guidance && <p className={styles.sectionGuidance}>{section.guidance}</p>}
      <div className={styles.itemsList}>
        {section.items.map(item => (
          <DossierItemRow 
            key={item.id} 
            item={item} 
            sectionId={section.id} 
            isEditing={isEditing} 
            onItemChange={onItemChange}
            evaluationOptions={evaluationOptions}
            evaluationConcept={evaluationConcept}
          />
        ))}
      </div>
    </div>
  );
};

// --- Componente Principal da Página de Preenchimento ---
const PreencherDossiePage: React.FC = () => {
  const [dossierData, setDossierData] = useState<DossierFillData | null>(null);
  const [evaluationOptions, setEvaluationOptions] = useState<EvaluationType[]>([]);
  const [appraisalId, setAppraisalId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [progress, setProgress] = useState(0);

  // Novo estado para verificar se o dossiê está completo
  const [isDossierComplete, setIsDossierComplete] = useState(false);

  const params = useParams();
  const router = useRouter();
  const dossierId = params.dossierId as string;
  const studentId = params.studentId as string;
  const classroomId = params['selected-class'] as string; // Corrigido para corresponder ao nome da pasta

  const loadDossierAndAppraisal = useCallback(async () => {
    setIsLoading(true);
    if (!dossierId || !studentId || !classroomId) {
      setError("IDs de dossiê, aluno ou turma não fornecidos na URL.");
      setIsLoading(false);
      return;
    }

    try {
      const dossierResponse = await getDossierById(Number(dossierId));
      const dossierApiData = dossierResponse.data as DossierApiResponse;
      
      const studentResponse = await GetStudent(Number(studentId), Number(classroomId));
      const studentName = studentResponse.name || 'Nome não encontrado';

      // Carrega opções de avaliação
      if (dossierApiData.evaluation_method && dossierApiData.evaluation_method.evaluationType) {
          setEvaluationOptions(dossierApiData.evaluation_method.evaluationType);
      }

      let appraisalData: AppraisalApiResponse | null = null;
      try {
          const appraisalResponse = await GetStudentAppraisal(Number(classroomId), Number(studentId), Number(dossierId));
          if (appraisalResponse && appraisalResponse.data) {
              appraisalData = appraisalResponse.data as AppraisalApiResponse;
              if (appraisalData) setAppraisalId(appraisalData.id);
          }
      } catch (appraisalError: any) {
          if (appraisalError.response?.status !== 404) console.warn("Não foi possível carregar a avaliação existente:", appraisalError);
      }
      
      const answersMap = new Map<number, number | EvaluationType>();
      if (appraisalData?.answers) {
          appraisalData.answers.forEach(ans => {
              const answerValue = ans.question_option_id;

              if (answerValue !== null && answerValue !== undefined) {
                  // Para AMBOS os tipos, usamos o ID para encontrar o objeto completo.
                  const answerObject = dossierApiData.evaluation_method.evaluationType.find(opt => opt.id === Number(answerValue));
                  if (answerObject) {
                      answersMap.set(ans.question_id, answerObject);
                  }
              }
          });
      }

      const adaptedSections: DossierSection[] = Object.values(dossierApiData.sections).map(apiSection => ({
          id: apiSection.id,
          title: apiSection.name,
          guidance: apiSection.description,
          weight: apiSection.weigth, // Mapeando o peso
          items: Object.values(apiSection.questions).map(apiQuestion => {
              const answer = answersMap.get(apiQuestion.id);
              return {
                  id: apiQuestion.id,
                  description: apiQuestion.name,
                  answer: answer !== undefined ? answer : null
              };
          })
      }));

      setDossierData({
          id: dossierApiData.id,
          title: dossierApiData.name,
          description: dossierApiData.description,
          studentName: studentName,
          sections: adaptedSections,
      });

    } catch (err) {
      setError("Erro ao carregar os dados. Verifique se os IDs na URL são válidos.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [dossierId, studentId, classroomId]);

  useEffect(() => {
    loadDossierAndAppraisal();
  }, [loadDossierAndAppraisal]);

  // Efeito para verificar se o dossiê está completo e calcular a nota/progresso
  useEffect(() => {
    if (dossierData) {
      const allAnswered = dossierData.sections.every(section =>
        section.items.every(item => item.answer !== null)
      );
      setIsDossierComplete(allAnswered);

      // Lógica de cálculo de progresso e pontuação
      let finalScore = 0;
      let completedSections = 0;
      const totalSections = dossierData.sections.length;

      dossierData.sections.forEach(section => {
        const isSectionComplete = section.items.every(item => item.answer !== null);
        
        if (isSectionComplete) {
          completedSections++;
          let sectionScore = 0;
          section.items.forEach(item => {
            if (item.answer && typeof item.answer === 'object' && 'value' in item.answer) {
              sectionScore += (item.answer as EvaluationType).value;
            }
          });

          const sectionAverage = sectionScore / section.items.length;
          const weightedSectionScore = sectionAverage * (section.weight / 100);
          finalScore += weightedSectionScore;
        }
      });
      
      const newProgress = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;
      setProgress(newProgress);
      setTotalScore(finalScore);

    } else {
      setIsDossierComplete(false);
      setTotalScore(0);
      setProgress(0);
    }
  }, [dossierData]);

  const handleDossierChange: HandleDossierChange = useCallback((key, value) => {
    setDossierData(prev => prev ? { ...prev, [key]: value } : null);
  }, []);

  const handleItemChange: HandleItemChange = useCallback((sectionId, itemId, key, value) => {
    setDossierData(prev => {
      if (!prev) return null;
      return { ...prev, sections: prev.sections.map(sec => sec.id === sectionId ? { ...sec, items: sec.items.map(item => item.id === itemId ? { ...item, [key]: value } : item ) } : sec ), }
    });
  }, []);

  const handleSaveDossier = async () => {
    if (!dossierData || !studentId || !dossierId || !classroomId) {
      setError("Faltam dados essenciais para salvar.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
        const answersPayload = dossierData.sections.flatMap(s => 
            s.items.map(i => {
                const answerId = i.answer && typeof i.answer === 'object' ? (i.answer as EvaluationType).id : null;
                return { question_id: i.id, evaluation_type_id: answerId };
            }).filter(ans => ans.evaluation_type_id !== null) // Envia apenas respondidas
        );

        let currentAppraisalId = appraisalId;
        if (!currentAppraisalId) {
            const professorId = localStorage.getItem('professorId');
            if (!professorId) throw new Error("ID do professor não encontrado. Faça login novamente.");
            
            const createResponse = await CreateAppraisal(Number(classroomId), Number(studentId), Number(professorId), Number(dossierId));
            if (createResponse && createResponse.data && createResponse.data.id) {
              currentAppraisalId = createResponse.data.id;
              setAppraisalId(currentAppraisalId); 
            } else {
                throw new Error("Falha ao criar o registro da avaliação.");
            }
        }
        
        if (currentAppraisalId) {
            await UpdateAppraisal(currentAppraisalId, { answers: answersPayload });
        } else {
            throw new Error("Não foi possível obter um ID para a avaliação.");
        }

        alert("Dossiê salvo com sucesso!");
        // Recarrega os dados para refletir o que foi salvo
        await loadDossierAndAppraisal();
    } catch (err: any) {
        setError(err.message || "Erro ao salvar o dossiê.");
        console.error("Erro ao salvar avaliação:", err);
        setError(`Erro ao salvar: ${err.response?.data?.message || err.message}`);
    } finally {
        setIsSaving(false);
    }
  };

  const handleExportPdf = () => {
    handleSaveDossier();
    if (!classroomId || !studentId || !dossierId) {
      alert("Não é possível exportar o PDF: IDs de turma, aluno ou dossiê ausentes.");
      return;
    }
    const pdfUrl = `${api.defaults.baseURL}/student/${classroomId}/pdf/${dossierId}/${studentId}`;
    window.open(pdfUrl, '_blank');
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return <div className={styles.loadingState}>Carregando dossiê...</div>;
  }

  if (error) {
    return <div className={styles.errorState}>{error}</div>;
  }

  if (!dossierData) {
    return <div className={styles.emptyState}>Nenhum dado de dossiê para exibir.</div>;
  }
  
  return (
    <>
      <Head>
        <title>Preencher Dossiê: {dossierData.title}</title>
      </Head>
      <div className={styles.pageContainer}>
        <header className={styles.pageHeader}>
          <button 
            onClick={handleGoBack} 
            className={styles.backButton}
            aria-label="Voltar para a lista de alunos"
          >
            <ChevronLeft size={24} />
            <span>Voltar</span>
          </button>
          
          <div className={styles.headerActions}>
            <button onClick={handleSaveDossier} className={styles.saveButton} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Progresso'}
            </button>
            <button 
                onClick={handleExportPdf} 
                className={`${styles.actionButton} ${!isDossierComplete ? styles.disabled : styles.exportButtonAvailable}`}
                disabled={!isDossierComplete}
                title={!isDossierComplete ? "Preencha todos os campos para exportar" : "Exportar como PDF"}
              >
                <Download size={20} />
                Exportar PDF
            </button>
          </div>
        </header>
        
        <main className={styles.mainContent}>
            <div className={styles.dossierHeader}>
              <h2>{`Dossiê: ${dossierData.title} - Aluno: ${dossierData.studentName}`}</h2>
              <div className={styles.scoreDisplay}>
                  <strong>Pontuação Atual:</strong> {totalScore.toFixed(2)}
              </div>
              {dossierData.description && <p className={styles.dossierDescription}>{dossierData.description}</p>}

              <div className={styles.progressBarContainer}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-right mt-1">{Math.round(progress)}% Completo</p>
              </div>
            </div>

            <div className={styles.sectionsContainer}>
              {dossierData.sections.map(section => (
                <DossierSectionCard 
                  key={section.id} 
                  section={section} 
                  isEditing={true} 
                  onItemChange={handleItemChange} 
                  evaluationOptions={evaluationOptions}
                />
              ))}
            </div>
        </main>
      </div>
    </>
  );
};

export default PreencherDossiePage; 