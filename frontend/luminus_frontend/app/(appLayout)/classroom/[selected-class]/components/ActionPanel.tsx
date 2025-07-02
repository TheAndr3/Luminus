// luminus_frontend/app/(appLayout)/classroom/components/actionPainel.tsx
import {Trash2} from "lucide-react";
import React from "react"; // Importe useRef
import { ColoredButton } from "@/components/colored-button/colored-button"; //

interface ActionPanelProps {
  mainColor?: string;
  hoverColor: string;
  onDeleted: () => void;
  // Renomeado para refletir que esta função receberá o File
  onCsvFileSelected: (file: File) => void; // A função que `page.tsx` passa para processar o CSV
}

export default function ActionPanel({
  mainColor,
  hoverColor,
  onDeleted
}: ActionPanelProps) {

  return (
    <div 
      className={`left-4 shadow-lg rounded-xl flex flex-row z-50 w-fit ${mainColor}`}
    >
      
      <ColoredButton
          mainColor={mainColor}
          hoverColor={hoverColor}
          icon={<Trash2 className="w-6 h-6 text-white" color="white" />}
          onClick={onDeleted}
        />

    </div>
  );
}