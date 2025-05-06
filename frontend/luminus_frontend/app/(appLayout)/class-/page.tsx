'use client';

import { useState } from 'react';

type Turma = {
  id: number;
  disciplina: string;
  codigo: string;
  dossie: string;
};

const mockTurmas: Turma[] = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  disciplina: 'Álgebra',
  codigo: 'EXA502 - TP01',
  dossie: 'Dossiê Turma 1',
}));

export default function TurmasPage() {
  const [visualizacao, setVisualizacao] = useState<'grid' | 'list'>('grid');

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Turmas</h1>

      {/* Filtro e controles */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search for class"
          className="border p-2 rounded w-1/2"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVisualizacao('list')}
            className={`p-2 rounded border ${visualizacao === 'list' ? 'bg-blue-200' : ''}`}
          >
            📄 Lista
          </button>
          <button
            onClick={() => setVisualizacao('grid')}
            className={`p-2 rounded border ${visualizacao === 'grid' ? 'bg-blue-200' : ''}`}
          >
            🧱 Grade
          </button>
          <button className="bg-gray-300 px-4 py-2 rounded">Adicionar Turma ➕</button>
        </div>
      </div>

      {/* Visualização */}
      {visualizacao === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockTurmas.map((turma) => (
            <div key={turma.id} className="bg-[#0A2B3D] text-white rounded p-4 shadow-md">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm">📘 {turma.disciplina}</div>
                  <div className="text-xs text-gray-300">{turma.codigo}</div>
                </div>
                <input type="checkbox" />
              </div>
              <button className="mt-2 bg-gray-200 text-black px-2 py-1 rounded w-full text-sm">
                {turma.dossie}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-sm text-gray-600">
              <th></th>
              <th>Disciplina</th>
              <th>Turma</th>
              <th>Dossiê</th>
            </tr>
          </thead>
          <tbody>
            {mockTurmas.map((turma) => (
              <tr
                key={turma.id}
                className="bg-[#0A2B3D] text-white rounded px-4 py-2"
              >
                <td className="p-2"><input type="checkbox" /></td>
                <td className="p-2">📘 {turma.disciplina}</td>
                <td className="p-2">{turma.codigo}</td>
                <td className="p-2">{turma.dossie}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}