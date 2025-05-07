import { Turma } from '@/app/(appLayout)/class-/components/types';
import DialogPage from './createClassModal';
import PageController from './paginationController';
import ClassViewMode from './classViewMode';

type GridTurmasProps = {
  turmas: Turma[];
  toggleSelectAll: () => void;
  toggleOne: (id: number) => void;
  isAllSelected: boolean;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;

  visualization: string
  setVisualization: (set: 'grid' | 'list') => void;
};

export default function GridTurmas({
  turmas,
  toggleSelectAll,
  toggleOne,
  isAllSelected,
  currentPage,
  totalPages,
  setCurrentPage,
  visualization,
  setVisualization
}: GridTurmasProps) {
  return (
    <div className="w-full">
      {/* Título e barra de ferramentas */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleSelectAll}
          />
          <span className="text-lg font-semibold">Selecionar todos</span>
        </div>
        <div className="flex gap-2">

            {/*Renderização tipo de visualização das turmas (lista ou grade) */}
            <ClassViewMode
              visualization={visualization}
              setVisualization={setVisualization}
            />

          <DialogPage/>
        </div>
        
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
        {turmas.map((turma) => (
          <div
            key={turma.id}
            className="bg-[#0A2B3D] text-white rounded-lg p-8 shadow-md flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <div className="text-xl mb-1">👥</div>
                <div className="text-sm">{turma.disciplina}</div>
                <div className="text-xs text-gray-300">{turma.codigo}</div>
              </div>
              <input
                type="checkbox"
                checked={turma.selected}
                onChange={() => toggleOne(turma.id)}
              />
            </div>
            <button className="mt-2 bg-gray-200 text-black px-3 py-1 rounded text-sm">
              {turma.dossie}
            </button>
          </div>
        ))}
      </div>


        {/* Renderização do paginationController*/}
      <PageController
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

    </div>
  );
}
