// components/DossierHeader.tsx
import React from 'react';

interface DossierHeaderProps {
  title: string;
  description: string;
  isEditing: boolean;
  onTitleChange: (newTitle: string) => void;
  onDescriptionChange: (newDescription: string) => void;

  /** Classe CSS para o container principal do DossierHeader */
  className?: string;

  /** Classe CSS para o elemento de texto do título (ex: h1) quando não está editando */
  titleTextClassName?: string;
  /** Classe CSS para o input do título quando está editando */
  titleInputClassName?: string;

  /**
   * Classe CSS para a linha divisória que aparece abaixo do título e acima do label "Descrição".
   * Conforme a imagem original.
   */
  titleDescriptionDividerClassName?: string;

  /** Classe CSS para o rótulo "Descrição" */
  descriptionLabelClassName?: string;

  /** Classe CSS para o elemento de texto da descrição (ex: p) quando não está editando */
  descriptionTextClassName?: string;
  /** Classe CSS para o textarea da descrição quando está editando */
  descriptionTextareaClassName?: string;
}

const DossierHeader: React.FC<DossierHeaderProps> = ({
  title,
  description,
  isEditing,
  onTitleChange,
  onDescriptionChange,
  className = '',
  titleTextClassName = '',
  titleInputClassName = '',
  titleDescriptionDividerClassName = '',
  descriptionLabelClassName = '',
  descriptionTextClassName = '',
  descriptionTextareaClassName = '',
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

      {/* Linha divisória entre Título e label "Descrição" */}
      {titleDescriptionDividerClassName && <hr className={titleDescriptionDividerClassName} />}

      {/* Label "Descrição" */}
      {/* Renderiza o label "Descrição" se uma classe for fornecida para ele,
          imitando a estrutura visual da imagem. */}
      {descriptionLabelClassName && (
        <label htmlFor="dossier-description-field" className={descriptionLabelClassName}>
          Descrição
        </label>
      )}

      {/* Campo da Descrição */}
      {isEditing ? (
        <textarea
          id="dossier-description-field" // id para o htmlFor do label
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className={descriptionTextareaClassName}
          aria-label="Descrição do Dossiê"
          placeholder="Digite a descrição do dossiê"
          rows={3} // Um valor padrão, pode ser sobrescrito por CSS
        />
      ) : (
        <p id="dossier-description-field" className={descriptionTextClassName}>
          {description}
        </p>
        // Se a descrição for uma string vazia, o <p> será renderizado vazio.
        // A estilização CSS (ex: min-height, border) pode fazer com que ele
        // apareça como uma linha, similar à imagem original.
      )}
    </div>
  );
};

export default DossierHeader;