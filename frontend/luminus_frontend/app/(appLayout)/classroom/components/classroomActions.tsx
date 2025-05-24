import { Pencil } from "lucide-react";
import React from 'react';


interface ClassroomActionsProps {
    classroomId: number;  // Recebe o objeto completo agora
    onEdit: (id: number) => void;
}

export default function ClassroomActions({ classroomId, onEdit }: ClassroomActionsProps) {
  return (
    <div className="flex gap-3 text-white">
      <button onClick={() => onEdit(classroomId)} className="hover:text-yellow-400">
        <Pencil size={18} />
      </button>
    </div>
  );
}