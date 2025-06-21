import { Pencil, Trash2 } from "lucide-react";
import React from 'react';

interface StudentActionsProps {
    studentId: number;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

export default function StudentActions({ studentId, onEdit, onDelete }: StudentActionsProps) {
  return (
    <div className="flex gap-3 text-white -ml-4">
      <button onClick={() => onEdit(studentId)} className="hover:text-yellow-400">
        <Pencil size={18} />
      </button>
      <button onClick={() => onDelete(studentId)} className="hover:text-yellow-400">
        <Trash2 size={18} />
      </button>
    </div>
  );
} 