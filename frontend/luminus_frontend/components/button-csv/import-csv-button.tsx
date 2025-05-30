// /components/button-csv/import-csv-button.tsx
import { useRef, ReactNode } from "react";
import { ColoredButton } from "@/components/colored-button/colored-button"; // Importe o seu ColoredButton

interface ImportCSVButtonProps {
  onFileSelected: (file: File) => void;
  icon?: ReactNode;       // Ícone para o botão (ex: ClipboardEdit)
  mainColor?: string;     // Cor principal, para ser passada ao ColoredButton
  hoverColor?: string;    // Cor de hover, para ser passada ao ColoredButton
  // Outras props que seu ColoredButton possa precisar para este caso específico (ex: haveBorder)
  // Se o texto "Importar CSV" precisar ser dinâmico, adicione uma prop 'text'
}

export function ImportCSVButton({
  onFileSelected,
  icon,
  mainColor,
  hoverColor,
}: ImportCSVButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Esta função será o onClick do ColoredButton interno
  const handleActualButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.value = ""; // Limpa seleção anterior para permitir re-selecionar o mesmo arquivo
      inputRef.current.click();   // Aciona o clique no input de arquivo escondido
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".csv"
        ref={inputRef}
        className="hidden" // O input de arquivo real continua escondido
        onChange={handleFileChange}
        // Adicionar um data-testid pode ser útil para testes
        data-testid="hidden-csv-input"
      />
      <ColoredButton
        text="Importar CSV" // Texto fixo para este botão
        icon={icon} // Repassa o ícone fornecido
        mainColor={mainColor} // Repassa a cor principal
        hoverColor={hoverColor} // Repassa a cor de hover
        onClick={handleActualButtonClick} // Faz o ColoredButton acionar o input de arquivo
        // Se o seu ColoredButton "Importar CSV" precisar de uma borda ou outras props específicas:
        // haveBorder={false} // Exemplo, ajuste conforme o padrão do ColoredButton
        // className="" // Se precisar de classes adicionais de layout para este wrapper
        type="button" // Garante que não seja um submit por padrão
      />
    </>
  );
}