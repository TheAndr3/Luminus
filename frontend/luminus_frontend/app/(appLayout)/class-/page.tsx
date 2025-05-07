"use client" // Habilita o uso de recursos do lado do cliente (ex: useState) no Next.js 13+

// Importa o componente da lista de turmas
import ListClass from "./components/listClass";
// Importa o tipo Turma para tipar os dados corretamente
import { Turma } from "@/app/(appLayout)/class-/components/types";
// Importa o hook useState para controle de estado
import { useState } from "react";
import GridClass from "./components/gridClass";
import { LayoutGrid, Menu } from "lucide-react";
import ClassViewMode from "./components/classViewMode";
import { BaseInput } from "@/components/inputs/BaseInput";

export default function VizualizationClass() {
  // Cria uma lista fictícia com 30 turmas para simular os dados (mock)
  const mockClass: Turma[] = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    disciplina: 'Matematica',
    codigo: `EXA502 - TP${i + 1}`,
    dossie: `Dossiê Turma ${i + 1}`,
    selected: false, // Inicia como não selecionada
  }));

  // Estado que controla o modo de visualização (lista ou grade)
  const [visualization, setVisualization] = useState<'grid' | 'list'>('list');

  // Estado que armazena todas as turmas (com seleção)
  const [classi, setClassi] = useState(mockClass);

  // Estado que controla qual página está sendo exibida
  const [currentPage, setCurrentPage] = useState(1);

  // Quantas turmas serão exibidas por página
  const turmasPorPagina = 6;

  // Cálculo do total de páginas baseado na quantidade de turmas
  const totalPages = Math.ceil(classi.length / turmasPorPagina);

  // Índice inicial para cortar a lista de turmas visíveis da página atual
  const startIndex = (currentPage - 1) * turmasPorPagina;

  // Fatia a lista de turmas de acordo com a página atual
  const turmasVisiveis = classi.slice(startIndex, startIndex + turmasPorPagina);

  // Verifica se todas as turmas visíveis estão selecionadas
  const isAllSelected = turmasVisiveis.every((t) => t.selected);

  // Alterna a seleção de todas as turmas da página atual
  const toggleSelectAll = () => {
    const newSelected = !isAllSelected; // Inverte o estado atual
    const novaLista = classi.map((turma, index) => {
      if (index >= startIndex && index < startIndex + turmasPorPagina) {
        return { ...turma, selected: newSelected }; // Atualiza apenas as visíveis
      }
      return turma; // Mantém as outras inalteradas
    });
    setClassi(novaLista); // Atualiza o estado com a nova lista
  };

  // Alterna a seleção individual de uma turma
  const toggleOne = (id: number) => {
    setClassi((prev) =>
      prev.map((turma) =>
        turma.id === id ? { ...turma, selected: !turma.selected } : turma
      )
    );
  };

  // Filtro para buscar turmas
  const [searchTerm, setSearchTerm] = useState(""); // Estado para armazenar o termo de busca

  const filteredClasses = turmasVisiveis.filter((turma) =>
    turma.dossie.toLowerCase().includes(searchTerm.toLowerCase()) || 
    turma.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.disciplina.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-center mt-10 w-full ml-auto ">
        <h1 className="text-4xl font-bold"> Turmas </h1>
      </div>

      {/* Filtro e controles */}
      <div className="flex justify-center items-center mb-4">
        <BaseInput
          type="text"
          placeholder="Procure pela turma"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-250"
        ></BaseInput>
      </div>



      {/* Renderização visualização de Lista */}
      {visualization === 'list' && (
        <div className="px-10 flex items-center justify-center mt-10 ml-auto">
          <ListClass
            turmas={filteredClasses} // Aplica o filtro de busca nas turmas visíveis
            toggleSelectAll={toggleSelectAll}
            toggleOne={toggleOne}
            isAllSelected={isAllSelected}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            visualization={visualization}
            setVisualization={setVisualization}
          />
        </div>
      )}

      {/* Rederização visualização de Grade */}
      {visualization === 'grid' && (
        <div className="px-10 flex items-center justify-center mt-10 ml-auto">
          <GridClass
            turmas={filteredClasses} // Aplica o filtro de busca nas turmas visíveis
            toggleSelectAll={toggleSelectAll}
            toggleOne={toggleOne}
            isAllSelected={isAllSelected}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}

            visualization={visualization}
            setVisualization={setVisualization}

          />

          ))
        </div>
      )}
    </div>
  );
}
