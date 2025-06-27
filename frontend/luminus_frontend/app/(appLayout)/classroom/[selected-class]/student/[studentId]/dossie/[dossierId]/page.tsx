"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import styles from './preencherDossie.module.css';
import { DossierFillData, DossierSection, DossierItem, HandleItemChange, HandleDossierChange, EvaluationType } from './types';
import { getDossierById } from '@/services/dossierServices';
import { GetStudentAppraisal, UpdateAppraisal, CreateAppraisal } from '@/services/appraisalService';
import { GetStudent } from '@/services/studentService';

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
    sections: { [key: string]: { id: number; name: string; description: string; questions: { [key: string]: { id: number; name: string; }; }; }; };
}

interface AppraisalApiResponse {
    id: number;
    student_id: number;
    dossier_id: number;
    answers: Array<{ question_id: number; evaluation_type_id: number; }>; // Campo de resposta atualizado
}


// --- Componentes Internos para Melhor Organização ---

interface DossierItemRowProps {
  item: DossierItem;
  sectionId: number;
  isEditing: boolean;
  onItemChange: HandleItemChange;
  evaluationOptions: EvaluationType[]; // Opções para o select
}

const DossierItemRow: React.FC<DossierItemRowProps> = ({ item, sectionId, isEditing, onItemChange, evaluationOptions }) => {
  const selectedValue = item.answer && typeof item.answer === 'object' ? (item.answer as EvaluationType).id : item.answer;

  return (
    <div className={styles.itemRow}>
      <label htmlFor={`item-desc-${item.id}`} className={styles.itemDescriptionLabel}>
        {item.description}
      </label>
      {isEditing ? (
        <select
          id={`item-answer-${item.id}`}
          value={selectedValue || ''}
          onChange={(e) => {
            const selectedOption = evaluationOptions.find(opt => opt.id === Number(e.target.value));
            onItemChange(sectionId, item.id, 'answer', selectedOption || null);
          }}
          className={styles.itemSelect}
        >
          <option value="">Selecione...</option>
          {evaluationOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
      ) : (
        <p className={styles.itemAnswerDisplay}>
          {typeof item.answer === 'object' && item.answer !== null ? (item.answer as EvaluationType).name : <span className={styles.emptyAnswer}>Não preenchido</span>}
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
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>{section.title}</h2>
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
  const [isEditing, setIsEditing] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();
  const dossierId = params.dossierId as string;
  const studentId = params.studentId as string;
  const classroomId = params['selected-class'] as string; // Corrigido para corresponder ao nome da pasta

  useEffect(() => {
    if (!dossierId || !studentId || !classroomId) {
      setError("IDs de dossiê, aluno ou turma não fornecidos na URL.");
      setIsLoading(false);
      return;
    }

    const loadDossierAndAppraisal = async () => {
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
        
        const answersMap = new Map<number, number>();
        if (appraisalData?.answers) {
            appraisalData.answers.forEach(ans => answersMap.set(ans.question_id, ans.evaluation_type_id));
        }

        const adaptedSections: DossierSection[] = Object.values(dossierApiData.sections).map(apiSection => ({
            id: apiSection.id,
            title: apiSection.name,
            guidance: apiSection.description,
            items: Object.values(apiSection.questions).map(apiQuestion => {
                const answerId = answersMap.get(apiQuestion.id);
                const answerObject = dossierApiData.evaluation_method.evaluationType.find(opt => opt.id === answerId);
                return {
                    id: apiQuestion.id,
                    description: apiQuestion.name,
                    answer: answerObject || null // Armazena o objeto da opção ou null
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
    };

    loadDossierAndAppraisal();

  }, [dossierId, studentId, classroomId]);


  const handleDossierFieldChange: HandleDossierChange = useCallback((field, value) => {
    setDossierData(prev => prev ? { ...prev, [field]: value } : null);
  }, []);

  const handleItemFieldChange: HandleItemChange = useCallback((sectionId, itemId, field, value) => {
    setDossierData(prev => {
      if (!prev) return null;
      return { ...prev, sections: prev.sections.map(sec => sec.id === sectionId ? { ...sec, items: sec.items.map(item => item.id === itemId ? { ...item, [field]: value } : item ) } : sec ), }
    });
  }, []);

  const handleToggleEditMode = () => setIsEditing(prev => !prev);

  const handleSaveDossier = async () => {
    if (!dossierData) return alert("Nenhum dado de dossiê para salvar.");
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
            const creationResponse = await CreateAppraisal(Number(classroomId), Number(studentId), Number(professorId), Number(dossierId));
            if (creationResponse && creationResponse.data && creationResponse.data.id) {
                currentAppraisalId = creationResponse.data.id;
                setAppraisalId(currentAppraisalId);
            } else throw new Error("Falha ao criar o registro da avaliação.");
        }
        
        if (currentAppraisalId) {
            await UpdateAppraisal(currentAppraisalId, { answers: answersPayload });
        } else {
            throw new Error("Não foi possível obter um ID para a avaliação.");
        }
        
        alert("Progresso salvo com sucesso!");
    } catch (err: any) {
        const errorMessage = err.message || "Ocorreu um erro ao salvar o dossiê.";
        setError(errorMessage);
        alert(`Erro: ${errorMessage}`);
    } finally {
        setIsSaving(false);
    }
  };
  
  if (isLoading) return <div className={styles.pageContainer}><p>Carregando dossiê...</p></div>;
  if (error) return <div className={styles.pageContainer}><p style={{ color: 'red' }}>{error}</p></div>;
  if (!dossierData) return <div className={styles.pageContainer}><p>Nenhum dossiê para exibir.</p></div>;

  return (
    <>
      <Head>
        <title>Preencher Dossiê: {dossierData.title}</title>
      </Head>
      <div className={styles.pageContainer}>
        <header className={styles.pageHeader}>
          <button 
            onClick={() => router.push(`/classroom/${classroomId}`)} 
            className={styles.backButton}
            aria-label="Voltar para a lista de alunos"
          >
            <ChevronLeft size={24} />
          </button>
          
          <h1 className={styles.pageTitle}>{isEditing ? "Preenchendo Dossiê" : "Visualizando Dossiê"}</h1>
          
          <div className={styles.headerActions}>
            {isEditing && (
              <button onClick={handleSaveDossier} className={styles.saveButton} disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar Progresso'}
              </button>
            )}
            <button onClick={handleToggleEditMode} className={styles.editButton}>
              {isEditing ? 'Modo Visualização' : 'Modo Edição'}
            </button>
          </div>
        </header>

        <main className={styles.mainContent}>
          <div className={styles.dossierHeader}>
            <h2>{`Dossiê: ${dossierData.title} - Aluno: ${dossierData.studentName}`}</h2>
            {dossierData.description && <p className={styles.dossierDescription}>{dossierData.description}</p>}
          </div>

          <div className={styles.sectionsContainer}>
            {dossierData.sections.map(section => (
              <DossierSectionCard 
                key={section.id} 
                section={section} 
                isEditing={isEditing} 
                onItemChange={handleItemFieldChange}
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