// components/DossierHeader.tsx
import React from 'react'; // Importa a biblioteca React para criar componentes de UI.
import { EvaluationConcept } from '../../types/dossier'; // Importa o tipo 'EvaluationConcept', presumindo que seja um enum ou união de strings.

// 1. Componente de Ícone de Configurações (SVG)
//    Este é um componente React simples que renderiza um ícone de engrenagem (configurações) usando SVG.
//    Ele aceita uma prop `className` para permitir estilização via CSS.
const SettingsIcon = ({ className }: { className?: string }) => (
  // O SVG é inline, o que o torna leve e fácil de colorir com 'currentColor'.
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.4301 12.98L21.5401 11.33C21.7301 11.18 21.7801 10.91 21.6601 10.69L19.6601 7.23C19.5401 7.01 19.2701 6.92999 19.0501 7.00999L16.5601 8.00999C16.0401 7.60999 15.4801 7.26999 14.8701 7.01999L14.4901 4.42C14.4601 4.18 14.2501 3.99999 14.0001 3.99999H10.0001C9.75006 3.99999 9.54006 4.18 9.51006 4.42L9.13006 7.01999C8.52006 7.26999 7.96006 7.60999 7.44006 8.00999L4.95006 7.00999C4.73006 6.92999 4.46006 7.01 4.34006 7.23L2.34006 10.69C2.22006 10.91 2.27006 11.18 2.46006 11.33L4.57006 12.98C4.53006 13.3 4.50006 13.63 4.50006 13.96C4.50006 14.29 4.53006 14.62 4.57006 14.94L2.46006 16.59C2.27006 16.74 2.22006 17.01 2.34006 17.23L4.34006 20.69C4.46006 20.91 4.73006 20.99 4.95006 20.91L7.44006 19.91C7.96006 20.31 8.52006 20.65 9.13006 20.9L9.51006 23.5C9.54006 23.74 9.75006 23.92 10.0001 23.92H14.0001C14.2501 23.92 14.4601 23.74 14.4901 23.5L14.8701 20.9C15.4801 20.65 16.0401 20.31 16.5601 19.91L19.0501 20.91C19.2701 20.99 19.5401 20.91 19.6601 20.69L21.6601 17.23C21.7801 17.01 21.7301 16.74 21.5401 16.59L19.4301 14.94C19.4701 14.62 19.5001 14.29 19.5001 13.96C19.5001 13.63 19.4701 13.3 19.4301 12.98ZM12.0001 16.46C10.0801 16.46 8.50006 14.88 8.50006 12.96C8.50006 11.04 10.0801 9.45999 12.0001 9.45999C13.9201 9.45999 15.5001 11.04 15.5001 12.96C15.5001 14.88 13.9201 16.46 12.0001 16.46Z" />
  </svg>
);

// 2. Definição das Propriedades (Props)
//    Esta interface detalha todas as propriedades que o componente `DossierHeader` pode receber,
//    incluindo dados, estados, e funções de callback para interações do usuário.
interface DossierHeaderProps {
  title: string; // O título do dossiê.
  description: string; // A descrição do dossiê.
  isEditing: boolean; // Booleano que controla se os campos estão em modo de edição (true) ou exibição (false).
  evaluationConcept: EvaluationConcept; // O conceito de avaliação selecionado (e.g., 'numerical' ou 'letter').
  onTitleChange: (newTitle: string) => void; // Callback para quando o título é alterado.
  onDescriptionChange: (newDescription: string) => void; // Callback para quando a descrição é alterada.
  onEvaluationConceptChange: (concept: EvaluationConcept) => void; // Callback para quando o conceito de avaliação é alterado.
  onSettingsClick?: () => void; // Callback opcional para o clique no botão de configurações.
  showSettingsButton?: boolean; // Booleano opcional para controlar a visibilidade do botão de configurações.
  // Callback opcional para quando um campo ganha foco, útil para rastreamento de interação ou UI condicional.
  // Fornece o elemento focado e um contexto (tipo 'section' e ID 'dossier-header').
  onFieldFocus?: (element: HTMLElement, context: { type: 'item', id: string } | { type: 'section', id: string }) => void;
  onFieldBlur?: () => void; // Callback opcional para quando um campo perde o foco.

  // Propriedades para classes CSS, permitindo alta customização do estilo externo.
  className?: string; // Classe CSS para o contêiner principal do cabeçalho.
  titleTextClassName?: string; // Classe para o <h1> do título em modo de exibição.
  titleInputClassName?: string; // Classe para o <input> do título em modo de edição.
  titleDescriptionDividerClassName?: string; // Classe para a linha divisória <hr>.
  descriptionLabelClassName?: string; // Classe para o <label> da descrição.
  descriptionTextClassName?: string; // Classe para o <p> da descrição em modo de exibição.
  descriptionTextareaClassName?: string; // Classe para o <textarea> da descrição em modo de edição.
  evaluationConceptContainerClassName?: string; // Classe para o contêiner do conceito de avaliação.
  evaluationConceptLabelTextClassName?: string; // Classe para o texto do rótulo "Conceito de Avaliação:".
  evaluationConceptRadioGroupClassName?: string; // Classe para o grupo de radio buttons.
  evaluationConceptRadioLabelClassName?: string; // Classe para os <label>s de cada radio button.
  evaluationConceptRadioInputClassName?: string; // Classe para os <input type="radio">.
  evaluationConceptDisplayClassName?: string; // Classe para o <p> que exibe o conceito de avaliação em modo de exibição.
  evaluationAndSettingsClassName?: string; // Classe para o contêiner que agrupa avaliação e botão de configurações.
  settingsButtonClassName?: string; // Classe para o botão de configurações.
  settingsButtonIconClassName?: string; // Classe para o ícone SVG dentro do botão de configurações.
}

// 3. Definição do Componente Funcional DossierHeader
//    Este é o componente React principal que renderiza o cabeçalho do dossiê.
const DossierHeader: React.FC<DossierHeaderProps> = ({
  title,
  description,
  isEditing,
  evaluationConcept,
  onTitleChange,
  onDescriptionChange,
  onEvaluationConceptChange,
  onSettingsClick,
  showSettingsButton,
  onFieldFocus,
  onFieldBlur,
  // Valores padrão para as classes CSS para evitar `undefined` e garantir que strings vazias sejam usadas se não forem fornecidas.
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
  // 4. Funções de Manipulação de Foco e Desfoque Locais
  //    Estas funções encapsulam as callbacks `onFieldFocus` e `onFieldBlur` passadas via props.
  //    Elas adicionam um contexto específico ao foco, indicando que o evento veio do "dossier-header".
  const handleLocalFocus = (element: HTMLElement, fieldType: 'title' | 'description' | 'settings') => {
      if (onFieldFocus) {
          // Quando um campo neste componente ganha foco, ele informa o elemento e um contexto.
          // O `id: 'dossier-header'` é um identificador para a seção onde o foco ocorreu.
          onFieldFocus(element, { type: 'section', id: 'dossier-header' });
      }
  };

  const handleLocalBlur = () => {
      if (onFieldBlur) {
          onFieldBlur(); // Chama a função onBlur da prop.
      }
  };

  // 5. Estrutura de Renderização do Componente
  //    O componente retorna JSX, que descreve a UI.
  return (
    // Contêiner principal do cabeçalho do dossiê, com um ID e classe personalizável.
    <div id="dossier-header" className={className}>
      {/* Renderização Condicional do Título */}
      {isEditing ? (
        // Se `isEditing` for true, mostra um campo de input para editar o título.
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)} // Atualiza o título no estado pai.
          className={titleInputClassName}
          aria-label="Título do Dossiê" // Rótulo de acessibilidade.
          placeholder="Digite o título do dossiê" // Placeholder.
          onFocus={(e) => handleLocalFocus(e.target, 'title')} // Gerencia o foco do campo.
          onBlur={handleLocalBlur} // Gerencia o desfoque do campo.
        />
      ) : (
        // Se `isEditing` for false, mostra o título como um <h1>.
        <h1 className={titleTextClassName}>{title}</h1>
      )}

      {/* Renderização Condicional do Conceito de Avaliação e Botão de Configurações */}
      {isEditing ? (
         // Se `isEditing` for true, mostra os radio buttons para selecionar o conceito de avaliação
         // e o botão de configurações (se `showSettingsButton` for true).
         <div className={evaluationAndSettingsClassName}>
              <div className={evaluationConceptContainerClassName} style={{ flexGrow: 1 }}>
                 {/* O rótulo "Conceito de Avaliação:" só é renderizado se a classe para ele for fornecida. */}
                 {evaluationConceptLabelTextClassName && (
                   <p id="evaluation-concept-label" className={evaluationConceptLabelTextClassName}>
                     Conceito de Avaliação:
                   </p>
                 )}
                 {/* Grupo de radio buttons para acessibilidade. */}
                 <div role="radiogroup" aria-labelledby="evaluation-concept-label" className={evaluationConceptRadioGroupClassName}>
                   <label className={evaluationConceptRadioLabelClassName}>
                     <input
                       type="radio"
                       name="evaluationConcept" // `name` garante que apenas um radio button no grupo pode ser selecionado.
                       value="numerical"
                       checked={evaluationConcept === 'numerical'} // Marca como selecionado se o valor corresponder.
                       onChange={() => onEvaluationConceptChange('numerical')} // Atualiza o conceito de avaliação.
                       className={evaluationConceptRadioInputClassName}
                       onFocus={() => handleLocalFocus(document.activeElement as HTMLElement, 'settings')} // Foco para acessibilidade.
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
                       onFocus={() => handleLocalFocus(document.activeElement as HTMLElement, 'settings')}
                       onBlur={handleLocalBlur}
                     />
                     Conceito (A, B, C...)
                   </label>
                 </div>
              </div>

             {/* Botão de Configurações, visível apenas se `showSettingsButton` for true. */}
             {showSettingsButton && (
                 <button
                     type="button" // Sempre use `type="button"` para botões que não submetem formulários.
                     onClick={onSettingsClick} // Chama a função de callback ao clicar.
                     aria-label="Configurações do Dossiê" // Rótulo de acessibilidade.
                     title="Configurações do Dossiê" // Tooltip ao passar o mouse.
                     className={settingsButtonClassName}
                     onFocus={(e) => handleLocalFocus(e.target, 'settings')}
                     onBlur={handleLocalBlur}
                 >
                     <SettingsIcon className={settingsButtonIconClassName} /> {/* Renderiza o ícone de engrenagem. */}
                 </button>
             )}
         </div>
      ) : (
          // Se `isEditing` for false, apenas exibe o conceito de avaliação selecionado.
          <div className={evaluationConceptContainerClassName}>
             {evaluationConceptLabelTextClassName && (
               <p className={evaluationConceptLabelTextClassName} style={{ fontWeight: 'normal', marginBottom: '2px' }}>
                 Conceito de Avaliação:
               </p>
             )}
             <p className={evaluationConceptDisplayClassName}>
               {/* Exibe o texto correspondente ao conceito de avaliação. */}
               {evaluationConcept === 'numerical' ? 'Numeral (0.0 - 10.0)' : 'Conceito (A, B, C...)'}
             </p>
          </div>
      )}

      {/* Linha Divisória */}
      {/* A linha horizontal <hr> só é renderizada se a classe para ela for fornecida. */}
      {titleDescriptionDividerClassName && <hr className={titleDescriptionDividerClassName} />}

      {/* Rótulo da Descrição */}
      {/* O rótulo para a descrição só é renderizado se a classe para ele for fornecida. */}
      {descriptionLabelClassName && (
        <label htmlFor="dossier-description-field" className={descriptionLabelClassName}>
          Descrição
        </label>
      )}

      {/* Renderização Condicional da Descrição */}
      {isEditing ? (
        // Se `isEditing` for true, mostra um <textarea> para editar a descrição.
        <textarea
          id="dossier-description-field" // ID para associar com o label.
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)} // Atualiza a descrição no estado pai.
          className={descriptionTextareaClassName}
          aria-label="Descrição do Dossiê"
          placeholder="Digite a descrição do dossiê"
          rows={3} // Define a altura inicial do textarea em linhas.
          onFocus={(e) => handleLocalFocus(e.target, 'description')}
          onBlur={handleLocalBlur}
        />
      ) : (
        // Se `isEditing` for false, mostra a descrição como um <p>.
        <p id="dossier-description-field" className={descriptionTextClassName}>
          {description}
        </p>
      )}
    </div>
  );
};

// 6. Exportação do Componente
//    Permite que o componente `DossierHeader` seja importado e utilizado em outras partes da aplicação.
export default DossierHeader;