import { Turma } from '@/app/(appLayout)/classroom/components/types';
import DialogPage from './createClassModal';
import PageController from './paginationController';
import ClassViewMode from './classViewMode';

import class_icon from "@/components/icon/icon_turma.svg"
import Image from "next/image";

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
    <div className="w-full ">
      {/* Título e barra de ferramentas */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleSelectAll}
            className="w-6 h-6 accent-blue-600"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-4 px-1 max-w-1xl mx-auto">
        {turmas.map((turma) => (
          <div
            key={turma.id}
            className="bg-[#0A2B3D] text-white rounded-lg p-4 shadow-md flex flex-col justify-between w-80 h-50"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">

                <div className="p-2 flex items-center">
                <Image src={class_icon} alt="icone turma" className=" w-16 h-16" />
                <div className="text-xl text-gray-300 ml-3">{turma.disciplina} <br/> {turma.codigo}</div>
                
                </div>


                
              </div>
              <input
                type="checkbox"
                checked={turma.selected}
                onChange={() => toggleOne(turma.id)}
                className="w-6 h-6 accent-blue-600"
              />
            </div>
            <button className="mb-4 bg-gray-200 text-black px-1 py-1 rounded-2xl text-sm">
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
