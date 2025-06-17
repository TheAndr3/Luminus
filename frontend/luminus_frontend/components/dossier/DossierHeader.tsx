// components/DossierHeader.tsx
import React from 'react'; 
import { EvaluationConcept } from '../../types/dossier'; 

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.4301 12.98L21.5401 11.33C21.7301 11.18 21.7801 10.91 21.6601 10.69L19.6601 7.23C19.5401 7.01 19.2701 6.92999 19.0501 7.00999L16.5601 8.00999C16.0401 7.60999 15.4801 7.26999 14.8701 7.01999L14.4901 4.42C14.4601 4.18 14.2501 3.99999 14.0001 3.99999H10.0001C9.75006 3.99999 9.54006 4.18 9.51006 4.42L9.13006 7.01999C8.52006 7.26999 7.96006 7.60999 7.44006 8.00999L4.95006 7.00999C4.73006 6.92999 4.46006 7.01 4.34006 7.23L2.34006 10.69C2.22006 10.91 2.27006 11.18 2.46006 11.33L4.57006 12.98C4.53006 13.3 4.50006 13.63 4.50006 13.96C4.50006 14.29 4.53006 14.62 4.57006 14.94L2.46006 16.59C2.27006 16.74 2.22006 17.01 2.34006 17.23L4.34006 20.69C4.46006 20.91 4.73006 20.99 4.95006 20.91L7.44006 19.91C7.96006 20.31 8.52006 20.65 9.13006 20.9L9.51006 23.5C9.54006 23.74 9.75006 23.92 10.0001 23.92H14.0001C14.2501 23.92 14.4601 23.74 14.4901 23.5L14.8701 20.9C15.4801 20.65 16.0401 20.31 16.5601 19.91L19.0501 20.91C19.2701 20.99 19.5401 20.91 19.6601 20.69L21.6601 17.23C21.7801 17.01 21.7301 16.74 21.5401 16.59L19.4301 14.94C19.4701 14.62 19.5001 14.29 19.5001 13.96C19.5001 13.63 19.4701 13.3 19.4301 12.98ZM12.0001 16.46C10.0801 16.46 8.50006 14.88 8.50006 12.96C8.50006 11.04 10.0801 9.45999 12.0001 9.45999C13.9201 9.45999 15.5001 11.04 15.5001 12.96C15.5001 14.88 13.9201 16.46 12.0001 16.46Z" />
  </svg>
);

interface DossierHeaderProps {
  title: string; 
  description: string; 
  isEditing: boolean; 
  evaluationConcept: EvaluationConcept; 
  onTitleChange: (newTitle: string) => void; 
  onDescriptionChange: (newDescription: string) => void; 
  onEvaluationConceptChange: (concept: EvaluationConcept) => void; 
  onSettingsClick?: () => void; 
  showSettingsButton?: boolean; // Esta prop será controlada pela lógica interna baseada em isEditing e evaluationConcept
  onFieldFocus?: (element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => void;
  onFieldBlur?: () => void; 

  className?: string; 
  titleTextClassName?: string; 
  titleInputClassName?: string; 
  titleDescriptionDividerClassName?: string; 
  descriptionLabelClassName?: string; 
  descriptionTextClassName?: string; 
  descriptionTextareaClassName?: string; 
  evaluationConceptContainerClassName?: string; 
  evaluationConceptLabelTextClassName?: string; 
  evaluationConceptRadioGroupClassName?: string; 
  evaluationConceptRadioLabelClassName?: string; 
  evaluationConceptRadioInputClassName?: string; 
  evaluationConceptDisplayClassName?: string; 
  evaluationAndSettingsClassName?: string; 
  settingsButtonClassName?: string; 
  settingsButtonIconClassName?: string; 
}

const DossierHeader: React.FC<DossierHeaderProps> = ({
  title,
  description,
  isEditing,
  evaluationConcept,
  onTitleChange,
  onDescriptionChange,
  onEvaluationConceptChange,
  onSettingsClick,
  // showSettingsButton não é mais pego das props, é determinado internamente
  onFieldFocus,
  onFieldBlur,
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
  evaluationAndSettingsClassName = '',
  settingsButtonClassName = '',
  settingsButtonIconClassName = '',
}) => {
  const handleLocalFocus = (element: HTMLElement, fieldType: 'title' | 'description' | 'settings' | 'evaluation_concept') => {
      if (onFieldFocus) {
          onFieldFocus(element, { type: 'section', id: 'dossier-header' });
      }
  };

  const handleLocalBlur = () => {
      if (onFieldBlur) {
          onFieldBlur(); 
      }
  };

  // Determina se o botão de configurações deve ser mostrado
  const internalShowSettingsButton = isEditing && evaluationConcept === 'letter';

  return (
    <div id="dossier-header" className={className}>
      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)} 
          className={titleInputClassName}
          aria-label="Título do Dossiê" 
          placeholder="Digite o título do dossiê" 
          onFocus={(e) => handleLocalFocus(e.target, 'title')} 
          onBlur={handleLocalBlur} 
        />
      ) : (
        <h1 className={titleTextClassName}>{title}</h1>
      )}

      {isEditing ? (
         <div className={evaluationAndSettingsClassName}>
              <div className={evaluationConceptContainerClassName} style={{ flexGrow: 1 }}>
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
                       onFocus={(e) => handleLocalFocus(e.target as HTMLInputElement, 'evaluation_concept')}
                       onBlur={handleLocalBlur}
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
                       onFocus={(e) => handleLocalFocus(e.target as HTMLInputElement, 'evaluation_concept')}
                       onBlur={handleLocalBlur}
                     />
                     Conceito (Customizável) 
                   </label>
                 </div>
              </div>

             {internalShowSettingsButton && onSettingsClick && ( // Verifica se onSettingsClick existe
                 <button
                     type="button" 
                     onClick={onSettingsClick} 
                     aria-label="Configurar conceitos de avaliação" 
                     title="Configurar conceitos de avaliação" 
                     className={settingsButtonClassName}
                     onFocus={(e) => handleLocalFocus(e.target, 'settings')}
                     onBlur={handleLocalBlur}
                 >
                     <SettingsIcon className={settingsButtonIconClassName} /> 
                 </button>
             )}
         </div>
      ) : (
          <div className={evaluationConceptContainerClassName}>
             {evaluationConceptLabelTextClassName && (
               <p className={evaluationConceptLabelTextClassName} style={{ fontWeight: 'normal', marginBottom: '2px' }}>
                 Conceito de Avaliação:
               </p>
             )}
             <p className={evaluationConceptDisplayClassName}>
               {evaluationConcept === 'numerical' ? 'Numeral (0.0 - 10.0)' : 'Conceito'}
             </p>
          </div>
      )}

      {titleDescriptionDividerClassName && <hr className={titleDescriptionDividerClassName} />}

      {descriptionLabelClassName && (
        <label htmlFor="dossier-description-field" className={descriptionLabelClassName}>
          Descrição
        </label>
      )}

      {isEditing ? (
        <textarea
          id="dossier-description-field" 
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)} 
          className={descriptionTextareaClassName}
          aria-label="Descrição do Dossiê"
          placeholder="Digite a descrição do dossiê"
          rows={3} 
          onFocus={(e) => handleLocalFocus(e.target, 'description')}
          onBlur={handleLocalBlur}
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