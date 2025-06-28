// src/components/dossier/EvaluationSettingsModal.tsx
import React, { useState, useEffect } from 'react';
import { EvaluationMethodItem } from '../../types/dossier';
import EditableField from './EditableField';
import localStyles from './EvaluationSettingsModal.module.css';

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" />
  </svg>
);

interface EvaluationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMethods: EvaluationMethodItem[];
  onSave: (methods: EvaluationMethodItem[]) => void; // onSave agora pode falhar se a validação aqui não passar
  evaluationConcept: 'numerical' | 'letter'; // Nova prop
  modalOverlayClassName?: string;
  modalContentClassName?: string;
  modalHeaderClassName?: string;
  modalTitleClassName?: string;
  modalCloseButtonClassName?: string;
  modalBodyClassName?: string;
  modalErrorClassName?: string;
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
  evaluationConcept, // Recebe a nova prop
  modalOverlayClassName = localStyles.modalOverlay,
  modalContentClassName = localStyles.modalContent,
  modalHeaderClassName = localStyles.modalHeader,
  modalTitleClassName = localStyles.modalTitle,
  modalCloseButtonClassName = localStyles.modalCloseButton,
  modalBodyClassName = localStyles.modalBody,
  modalErrorClassName = localStyles.modalError,
  modalListClassName = localStyles.modalList,
  modalListItemClassName = localStyles.modalListItem,
  modalListItemNameClassName = localStyles.modalListItemName,
  modalListItemValueClassName = localStyles.modalListItemValue,
  modalListItemDeleteBtnClassName = localStyles.modalListItemDeleteBtn,
  modalActionsClassName = localStyles.modalActions,
  modalAddButtonClassName = localStyles.modalAddButton,
  modalSaveButtonClassName = localStyles.modalSaveButton,
  modalCancelButtonClassName = localStyles.modalCancelButton,
  editableFieldForModalInputClassName = localStyles.editableFieldInput,
  editableFieldForModalTextDisplayClassName = localStyles.editableFieldTextDisplay,
}) => {
  const [methods, setMethods] = useState<EvaluationMethodItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMethods(
      initialMethods.map((m, index) => ({
        ...m,
        id: m.id || `method-${Date.now()}-${index}`,
      }))
    );
    setError(null); // Limpa erro ao reabrir ou mudar initialMethods
  }, [isOpen, initialMethods]);

  if (!isOpen) {
    return null;
  }

  const isLimitReached = evaluationConcept === 'letter' && methods.length >= 7;

  const handleAddMethod = () => {
    if (isLimitReached) return;
    setError(null);
    setMethods([
      ...methods,
      { id: `method-${Date.now()}`, name: '', value: '' }, // Valor inicial vazio para o novo método
    ]);
  };

  const handleMethodChange = (
    id: string,
    field: 'name' | 'value',
    newValue: string
  ) => {
    setError(null);
    let processedValue = newValue;
    if (field === 'value') {
      // Permite apenas números e um ponto decimal. Remove caracteres não permitidos.
      // Permite string vazia para o usuário poder apagar. A validação final pegará isso.
      processedValue = newValue.replace(/[^0-9.]/g, '');
      // Garante apenas um ponto decimal
      const parts = processedValue.split('.');
      if (parts.length > 2) {
        processedValue = `${parts[0]}.${parts.slice(1).join('')}`;
      }
    }

    setMethods(
      methods.map(method =>
        method.id === id ? { ...method, [field]: processedValue } : method
      )
    );
  };

  const handleDeleteMethod = (id: string) => {
    setError(null);
    // Não permitir deletar se for deixar menos de 2 métodos.
    // Essa regra é mais forte na page.tsx, mas podemos adicionar um feedback aqui.
    if (methods.length <= 2) {
        setError('São necessários pelo menos dois conceitos de avaliação.');
        // Não deleta se for deixar com menos de 2. A page.tsx terá a validação final.
        // Se quiser impedir aqui mesmo, pode adicionar: return;
    }
    setMethods(methods.filter(method => method.id !== id));
  };

  const validateMethods = (): boolean => {
    if (methods.length === 0) { // Embora a regra seja >=2, essa pega o caso de 0.
      setError('Adicione pelo menos um conceito de avaliação.');
      return false;
    }
    // A regra de "pelo menos 2 conceitos" será aplicada na page.tsx ao salvar do modal.
    // O modal se preocupa com a validade dos campos individuais.
    // if (methods.length < 2) {
    //   setError('São necessários pelo menos dois conceitos de avaliação.');
    //   return false;
    // }


    for (const method of methods) {
      if (!method.name.trim()) {
        setError(`O nome do conceito não pode ser vazio (item: ${method.name || 'novo'}).`);
        return false;
      }
      if (!method.value.trim()) {
        setError(`O valor para o conceito "${method.name}" não pode ser vazio.`);
        return false;
      }
      
      // Validação do valor numérico entre 0.0 e 10.0
      const numericValue = parseFloat(method.value);
      if (isNaN(numericValue)) {
        setError(`O valor para o conceito "${method.name}" deve ser um número (ex: 7.5).`);
        return false;
      }
      if (numericValue < 0.0 || numericValue > 10.0) {
        setError(`O valor para o conceito "${method.name}" deve estar entre 0.0 e 10.0.`);
        return false;
      }
      // Formata para ter uma casa decimal se for inteiro (ex: 7 -> 7.0)
      // Isso é mais cosmético para o backend, mas pode ser feito no onSave da página
      // method.value = numericValue.toFixed(1); 
    }

    const names = methods.map(m => m.name.trim().toLowerCase());
    if (new Set(names).size !== names.length) {
      setError('Os nomes dos conceitos devem ser únicos.');
      return false;
    }
    const values = methods.map(m => parseFloat(m.value));
    if (new Set(values).size !== values.length) {
        setError('Os valores numéricos dos conceitos devem ser únicos.');
        return false;
    }

    return true;
  };

  const handleSaveClicked = () => { // Renomeado para evitar conflito com prop onSave
    if (validateMethods()) {
      // Antes de chamar o onSave da página, formata os valores para uma casa decimal
      const formattedMethods = methods.map(m => ({
          ...m,
          value: parseFloat(m.value).toFixed(1)
      }));
      onSave(formattedMethods); 
      // onClose(); // onClose é chamado pela page.tsx após salvar os métodos no estado dela
    }
  };

  return (
    <div className={modalOverlayClassName} onClick={onClose}>
      <div className={modalContentClassName} onClick={e => e.stopPropagation()}>
        <div className={modalHeaderClassName}>
          <h2 className={modalTitleClassName}>Configurar Conceitos de Avaliação (0.0 - 10.0)</h2>
          <button onClick={onClose} className={modalCloseButtonClassName} aria-label="Fechar modal">
            ×
          </button>
        </div>
        <div className={modalBodyClassName}>
          {error && <p className={modalErrorClassName}>{error}</p>}
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
                    placeholder="Nome (Ex: Excelente)"
                    inputClassName={editableFieldForModalInputClassName}
                    textDisplayClassName={editableFieldForModalTextDisplayClassName}
                    ariaLabel={`Nome do conceito ${method.id.slice(-4)}`}
                  />
                </div>
                <div className={modalListItemValueClassName}>
                  <EditableField
                    value={method.value}
                    isEditing={true}
                    onChange={newValue =>
                      handleMethodChange(method.id, 'value', newValue)
                    }
                    placeholder="Valor (Ex: 9.5)"
                    inputClassName={editableFieldForModalInputClassName}
                    textDisplayClassName={editableFieldForModalTextDisplayClassName}
                    ariaLabel={`Valor do conceito ${method.id.slice(-4)}`}
                  />
                </div>
                <button
                  onClick={() => handleDeleteMethod(method.id)}
                  className={modalListItemDeleteBtnClassName}
                  aria-label={`Excluir conceito ${method.name || 'novo'}`}
                  disabled={methods.length <= 2} // Desabilita se tem apenas 2 ou menos itens
                  title={methods.length <=2 ? "São necessários pelo menos 2 conceitos." : `Excluir conceito ${method.name || 'novo'}`}
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
          <button 
            onClick={handleAddMethod} 
            className={modalAddButtonClassName}
            disabled={isLimitReached}
            title={isLimitReached ? "Limite de 7 conceitos atingido" : "Adicionar novo conceito"}
          >
            Adicionar Conceito
          </button>
          {isLimitReached && (
            <p className={localStyles.limitMessage}>
              O limite de 7 conceitos foi atingido.
            </p>
          )}
        </div>
        <div className={modalActionsClassName}>
          <button onClick={onClose} className={modalCancelButtonClassName}>
            Cancelar
          </button>
          <button onClick={handleSaveClicked} className={modalSaveButtonClassName}>
            Salvar Conceitos
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationSettingsModal;