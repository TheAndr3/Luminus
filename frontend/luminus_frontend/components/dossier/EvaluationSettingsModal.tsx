// src/components/dossier/EvaluationSettingsModal.tsx
import React, { useState, useEffect } from 'react';
import { EvaluationMethodItem } from '../../types/dossier';
import EditableField from './EditableField'; // Reutilizando o componente
import styles from './EvaluationSettingsModal.module.css'; // Criaremos este CSS

// Ícone simples de Lixeira (SVG inline)
const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" />
  </svg>
);

interface EvaluationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMethods: EvaluationMethodItem[];
  onSave: (methods: EvaluationMethodItem[]) => void;
  // Prop para passar classes CSS do page.tsx (DossierCRUDPage.module.css)
  modalOverlayClassName?: string;
  modalContentClassName?: string;
  modalHeaderClassName?: string;
  modalTitleClassName?: string;
  modalCloseButtonClassName?: string;
  modalBodyClassName?: string;
  modalListClassName?: string;
  modalListItemClassName?: string;
  modalListItemNameClassName?: string;
  modalListItemValueClassName?: string;
  modalListItemDeleteBtnClassName?: string;
  modalActionsClassName?: string;
  modalAddButtonClassName?: string;
  modalSaveButtonClassName?: string;
  modalCancelButtonClassName?: string;
  editableFieldForModalInputClassName?: string;
  editableFieldForModalTextDisplayClassName?: string;
}

const EvaluationSettingsModal: React.FC<EvaluationSettingsModalProps> = ({
  isOpen,
  onClose,
  initialMethods,
  onSave,
  modalOverlayClassName = styles.modalOverlay,
  modalContentClassName = styles.modalContent,
  modalHeaderClassName = styles.modalHeader,
  modalTitleClassName = styles.modalTitle,
  modalCloseButtonClassName = styles.modalCloseButton,
  modalBodyClassName = styles.modalBody,
  modalListClassName = styles.modalList,
  modalListItemClassName = styles.modalListItem,
  modalListItemNameClassName = styles.modalListItemName,
  modalListItemValueClassName = styles.modalListItemValue,
  modalListItemDeleteBtnClassName = styles.modalListItemDeleteBtn,
  modalActionsClassName = styles.modalActions,
  modalAddButtonClassName = styles.modalAddButton,
  modalSaveButtonClassName = styles.modalSaveButton,
  modalCancelButtonClassName = styles.modalCancelButton,
  editableFieldForModalInputClassName = styles.editableFieldInput,
  editableFieldForModalTextDisplayClassName = styles.editableFieldTextDisplay,
}) => {
  const [methods, setMethods] = useState<EvaluationMethodItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Quando o modal abre ou initialMethods muda, reseta o estado interno
    // Clona para evitar mutação direta e garante IDs únicos se vierem sem
    setMethods(
      initialMethods.map((m, index) => ({
        ...m,
        id: m.id || `method-${Date.now()}-${index}`, // Garante ID para React keys
      }))
    );
    setError(null);
  }, [isOpen, initialMethods]);

  if (!isOpen) {
    return null;
  }

  const handleAddMethod = () => {
    setError(null);
    setMethods([
      ...methods,
      { id: `method-${Date.now()}`, name: '', value: '' },
    ]);
  };

  const handleMethodChange = (
    id: string,
    field: 'name' | 'value',
    newValue: string
  ) => {
    setError(null);
    setMethods(
      methods.map(method =>
        method.id === id ? { ...method, [field]: newValue } : method
      )
    );
  };

  const handleDeleteMethod = (id: string) => {
    setError(null);
    setMethods(methods.filter(method => method.id !== id));
  };

  const validateMethods = (): boolean => {
    if (methods.length === 0) {
      setError('Adicione pelo menos um conceito de avaliação.');
      return false;
    }
    for (const method of methods) {
      if (!method.name.trim()) {
        setError(`O nome do conceito não pode ser vazio (item ID: ${method.id.slice(-4)}).`);
        return false;
      }
      if (!method.value.trim()) {
        setError(`O valor do conceito não pode ser vazio (item ID: ${method.id.slice(-4)}).`);
        return false;
      }
      // Validação de valor numérico (opcional, mas bom ter)
      // if (isNaN(parseFloat(method.value))) {
      //   setError(`O valor do conceito '${method.name}' deve ser um número.`);
      //   return false;
      // }
    }
    const names = methods.map(m => m.name.trim().toLowerCase());
    if (new Set(names).size !== names.length) {
      setError('Os nomes dos conceitos devem ser únicos.');
      return false;
    }
    return true;
  };

  const handleSaveMethods = () => {
    if (validateMethods()) {
      onSave(methods); // Envia os métodos com IDs da UI
      onClose();
    }
  };

  return (
    <div className={modalOverlayClassName} onClick={onClose}>
      <div className={modalContentClassName} onClick={e => e.stopPropagation()}>
        <div className={modalHeaderClassName}>
          <h2 className={modalTitleClassName}>Configurar Conceitos de Avaliação</h2>
          <button onClick={onClose} className={modalCloseButtonClassName} aria-label="Fechar modal">
            ×
          </button>
        </div>
        <div className={modalBodyClassName}>
          {error && <p className={styles.modalError}>{error}</p>}
          <ul className={modalListClassName}>
            {methods.map(method => (
              <li key={method.id} className={modalListItemClassName}>
                <div className={modalListItemNameClassName}>
                  <EditableField
                    value={method.name}
                    isEditing={true}
                    onChange={newValue =>
                      handleMethodChange(method.id, 'name', newValue)
                    }
                    placeholder="Nome (Ex: A, Excelente)"
                    inputClassName={editableFieldForModalInputClassName}
                    textDisplayClassName={editableFieldForModalTextDisplayClassName} // Não usado pois isEditing é true
                    ariaLabel={`Nome do conceito ${method.id}`}
                  />
                </div>
                <div className={modalListItemValueClassName}>
                  <EditableField
                    value={method.value}
                    isEditing={true}
                    onChange={newValue =>
                      handleMethodChange(method.id, 'value', newValue)
                    }
                    placeholder="Valor (Ex: 10, Bom)"
                    inputClassName={editableFieldForModalInputClassName}
                    textDisplayClassName={editableFieldForModalTextDisplayClassName} // Não usado
                    ariaLabel={`Valor do conceito ${method.id}`}
                  />
                </div>
                <button
                  onClick={() => handleDeleteMethod(method.id)}
                  className={modalListItemDeleteBtnClassName}
                  aria-label={`Excluir conceito ${method.name}`}
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
          <button onClick={handleAddMethod} className={modalAddButtonClassName}>
            Adicionar Conceito
          </button>
        </div>
        <div className={modalActionsClassName}>
          <button onClick={onClose} className={modalCancelButtonClassName}>
            Cancelar
          </button>
          <button onClick={handleSaveMethods} className={modalSaveButtonClassName}>
            Salvar Conceitos
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationSettingsModal;