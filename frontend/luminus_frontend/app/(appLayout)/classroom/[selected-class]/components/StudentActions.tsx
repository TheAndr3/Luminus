import { Pencil, Trash2 } from "lucide-react";
import React from 'react';

interface StudentActionsProps {
    onEdit: () => void;
    onDelete: () => void;
}

export default function StudentActions({ onEdit, onDelete }: StudentActionsProps) {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="flex gap-3 text-white -ml-4">
      <button onClick={handleEditClick} className="hover:text-yellow-400 cursor-pointer">
        <Pencil size={18} />
      </button>
      <button onClick={handleDeleteClick} className="hover:text-yellow-400 cursor-pointer">
        <Trash2 size={18} />
      </button>
    </div>
  );
} 