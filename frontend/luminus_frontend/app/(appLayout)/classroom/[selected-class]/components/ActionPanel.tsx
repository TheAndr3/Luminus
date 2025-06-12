// luminus_frontend/app/(appLayout)/classroom/components/actionPainel.tsx
import { Trash2, Download, Archive, BarChart2 } from "lucide-react";
import React, { useRef, useState } from "react"; // Importe useRef
import { ColoredButton } from "@/components/colored-button/colored-button"; //
import { FiEdit } from "react-icons/fi";

interface ActionPanelProps {
  mainColor?: string;
  hoverColor: string;
  onDeleted: () => void;
  // Renomeado para refletir que esta função receberá o File
  onCsvFileSelected: (file: File) => void; // A função que `page.tsx` passa para processar o CSV
  onDownload?: () => void; // Adicionado para download, se precisar de uma ação
  onViewChart?: () => void; // Adicionado para gráfico, se precisar de uma ação
}

export default function ActionPanel({
  mainColor,
  hoverColor,
  onDeleted,
  onCsvFileSelected,
  onDownload,
  onViewChart,
}: ActionPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref para o input de arquivo
  // Função que será chamada pelo botão Archive para disparar o clique no input escondido
  const handleArchiveButtonClick = () => {
    fileInputRef.current?.click(); // Dispara o clique no input de arquivo
  };

  // Função que será chamada quando o arquivo for selecionado no input
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onCsvFileSelected(event.target.files[0]); // Passa o arquivo selecionado para a função prop
      event.target.value = ''; // Limpa o input para permitir re-selecionar o mesmo arquivo
    }
  };

  return (
    <div className="left-4 bg-[#0A2B3D] shadow-lg rounded-xl flex flex-row gap-4 z-50 w-fit">

      <ColoredButton //TESTE PARA VER SE DA CERTO!
          mainColor={"#0A2B3D"}
          hoverColor={hoverColor}
          icon={<Trash2 className="w-6 h-6 text-white" color="white" />}
          onClick={onDeleted}
          className={"p-2 rounded-xl"}
        />

        <ColoredButton //TESTE PARA VER SE DA CERTO!
          mainColor={"#0A2B3D"}
          hoverColor={hoverColor}
          icon={<FiEdit className="w-6 h-6 text-white" color="white" />}
          onClick={handleArchiveButtonClick}
          className={"p-2 rounded-xl"}
        />
    </div>
  );
}