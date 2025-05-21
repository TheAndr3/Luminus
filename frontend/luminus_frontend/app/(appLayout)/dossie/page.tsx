"use client";

// pages/gerenciar-dossies.tsx
import { useState } from 'react';
import { Folder, Plus, Download, Filter } from 'lucide-react';

interface Dossie {
  id: number;
  nome: string;
  selecionado: boolean;
}

export default function GerenciarDossies() {
  const [dossies, setDossies] = useState<Dossie[]>(
    Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      nome: `Dossiê ${i + 1}`,
      selecionado: false,
    }))
  );

  const toggleSelecionado = (id: number) => {
    setDossies((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, selecionado: !d.selecionado } : d
      )
    );
  };

  const toggleSelecionarTodos = () => {
    const todosSelecionados = dossies.every((d) => d.selecionado);
    setDossies((prev) =>
      prev.map((d) => ({ ...d, selecionado: !todosSelecionados }))
    );
  };

  return (
    <div className="flex h-screen bg-[#473e71]">

      {/* Conteúdo principal */}
      <main className="flex-1 bg-white p-8 overflow-auto">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Folder className="w-6 h-6" /> Dossiês
        </h1>

        {/* Barra de ações */}
        <div className="mt-6 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search for class"
            className="border rounded-full px-4 py-2 w-1/2"
          />
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 px-3 py-1 rounded-full border text-sm">
              <Filter size={16} /> Exportar Dossiê <Download size={14} />
            </button>
            <button className="flex items-center gap-1 px-3 py-1 rounded-full border text-sm">
              Importar Dossiê <Download size={14} />
            </button>
            <button className="flex items-center gap-1 px-3 py-1 rounded-full border text-sm bg-gray-100 hover:bg-gray-200">
              Criar dossiê <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Lista de dossiês */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={dossies.every((d) => d.selecionado)}
              onChange={toggleSelecionarTodos}
            />
            <span className="text-sm">Selecionar Todos</span>
          </div>

          {dossies.map((dossie) => (
            <div
              key={dossie.id}
              className="flex items-center justify-start gap-4 bg-[#101828] text-white px-6 py-3 rounded mb-2"
            >
              <input
                type="checkbox"
                checked={dossie.selecionado}
                onChange={() => toggleSelecionado(dossie.id)}
              />
              <Folder className="w-5 h-5" />
              <span className="text-sm">{dossie.nome}</span>
            </div>
          ))}
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-end mt-6 gap-2">
          <button className="bg-[#101828] text-white px-3 py-1 rounded-full">
            1
          </button>
          <button className="border px-3 py-1 rounded-full">2</button>
          <button className="border px-3 py-1 rounded-full">3</button>
          <input
            type="text"
            placeholder="Page"
            className="border px-2 py-1 rounded w-16 text-sm"
          />
          <select className="border px-2 py-1 rounded text-sm">
            <option>20</option>
            <option>50</option>
            <option>100</option>
          </select>
          <button className="border px-3 py-1 rounded-full">Next</button>
        </div>
      </main>
    </div>
  );
}
