// components/DossierHeader.tsx
import React from 'react';
import { EvaluationConcept } from '../../types/dossier'; // Ajuste o caminho se necessário

interface DossierHeaderProps {
  title: string;
  description: string;
  isEditing: boolean;
  evaluationConcept: EvaluationConcept; // NOVO
  onTitleChange: (newTitle: string) => void;
  onDescriptionChange: (newDescription: string) => void;
  onEvaluationConceptChange: (concept: EvaluationConcept) => void; // NOVO

  className?: string;
  titleTextClassName?: string;
  titleInputClassName?: string;
  titleDescriptionDividerClassName?: string;
  descriptionLabelClassName?: string;
  descriptionTextClassName?: string;
  descriptionTextareaClassName?: string;

  // Novas classes para o seletor de conceito
  evaluationConceptContainerClassName?: string;
  evaluationConceptLabelTextClassName?: string; // Para o texto "Conceito de Avaliação:"
  evaluationConceptRadioGroupClassName?: string;
  evaluationConceptRadioLabelClassName?: string;
  evaluationConceptRadioInputClassName?: string;
  evaluationConceptDisplayClassName?: string; // Para mostrar o conceito em modo visualização
}

const DossierHeader: React.FC<DossierHeaderProps> = ({
  title,
  description,
  isEditing,
  evaluationConcept,
  onTitleChange,
  onDescriptionChange,
  onEvaluationConceptChange,
  className = '',
  titleTextClassName = '',
  titleInputClassName = '',
  titleDescriptionDividerClassName = '',
  descriptionLabelClassName = '',
  descriptionTextClassName = '',
  descriptionTextareaClassName = '',
  evaluationConceptContainerClassName = '',
  evaluationConceptLabelTextClassName = '',
  evaluationConceptRadioGroupClassName = '',
  evaluationConceptRadioLabelClassName = '',
  evaluationConceptRadioInputClassName = '',
  evaluationConceptDisplayClassName = '',
}) => {
  return (
    <div className={className}>
      {/* Campo do Título */}
      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={titleInputClassName}
          aria-label="Título do Dossiê"
          placeholder="Digite o título do dossiê"
        />
      ) : (
        <h1 className={titleTextClassName}>{title}</h1>
      )}

      {/* Seletor de Conceito de Avaliação */}
      <div className={evaluationConceptContainerClassName}>
        {isEditing ? (
          <>
            {evaluationConceptLabelTextClassName && (
              <p id="evaluation-concept-label" className={evaluationConceptLabelTextClassName}>
                Conceito de Avaliação:
              </p>
            )}
            <div role="radiogroup" aria-labelledby="evaluation-concept-label" className={evaluationConceptRadioGroupClassName}>
              <label className={evaluationConceptRadioLabelClassName}>
                <input
                  type="radio"
                  name="evaluationConcept"
                  value="numerical"
                  checked={evaluationConcept === 'numerical'}
                  onChange={() => onEvaluationConceptChange('numerical')}
                  className={evaluationConceptRadioInputClassName}
                />
                Numeral (0.0 - 10.0)
              </label>
              <label className={evaluationConceptRadioLabelClassName}>
                <input
                  type="radio"
                  name="evaluationConcept"
                  value="letter"
                  checked={evaluationConcept === 'letter'}
                  onChange={() => onEvaluationConceptChange('letter')}
                  className={evaluationConceptRadioInputClassName}
                />
                Conceito (A, B, C...)
              </label>
            </div>
          </>
        ) : (
          <>
            {evaluationConceptLabelTextClassName && (
              <p className={evaluationConceptLabelTextClassName} style={{ fontWeight: 'normal', marginBottom: '2px' }}>
                Conceito de Avaliação:
              </p>
            )}
            <p className={evaluationConceptDisplayClassName}>
              {evaluationConcept === 'numerical' ? 'Numeral (0.0 - 10.0)' : 'Conceito (A, B, C...)'}
            </p>
          </>
        )}
      </div>

      {/* Linha divisória */}
      {titleDescriptionDividerClassName && <hr className={titleDescriptionDividerClassName} />}

      {/* Label "Descrição" */}
      {descriptionLabelClassName && (
        <label htmlFor="dossier-description-field" className={descriptionLabelClassName}>
          Descrição
        </label>
      )}

      {/* Campo da Descrição */}
      {isEditing ? (
        <textarea
          id="dossier-description-field"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className={descriptionTextareaClassName}
          aria-label="Descrição do Dossiê"
          placeholder="Digite a descrição do dossiê"
          rows={3}
        />
      ) : (
        <p id="dossier-description-field" className={descriptionTextClassName}>
          {description}
        </p>
      )}
    </div>
  );
};

export default DossierHeader;