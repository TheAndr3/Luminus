import { Classroom } from '@/app/(appLayout)/classroom/components/types';
import DialogPage from './createClassModal';
import PageController from './paginationController';
import ClassViewMode from './classViewMode';

import class_icon from "@/components/icon/icon_classroom.svg"
import Image from "next/image";
import { useEffect, useState } from 'react';
import ActionPanel from './actionPainel';

type GridclassroomsProps = {
  classrooms: Classroom[];
  toggleSelectAll: () => void;
  toggleOne: (id: number) => void;
  isAllSelected: boolean;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  visualization: string
  setVisualization: (set: 'grid' | 'list') => void;

  onDeleteClass: () => void;
};

export default function Gridclassrooms({
  classrooms,
  toggleSelectAll,
  toggleOne,
  isAllSelected,
  currentPage,
  totalPages,
  setCurrentPage,
  visualization,
  setVisualization,
  onDeleteClass

}: GridclassroomsProps) {

const [hasSelected, setHasSelected] = useState(false);

    // Efeito que verifica sempre que a lista de classrooms muda
    // para atualizar o estado hasSelected
    useEffect(() => {
      // Verifica se existe pelo menos uma classroom selecionada
      setHasSelected(classrooms.some(classroom => classroom.selected));
    }, [classrooms]); // Executa sempre que o array de classrooms mudar

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
          <span className="px-2 text-lg">Selecionar todos</span>
        </div>
        <div className="flex gap-2">

            {/*Renderização tipo de visualização das classrooms (lista ou grade) */}
            <ClassViewMode
              visualization={visualization}
              setVisualization={setVisualization}
            />

          <DialogPage/>
        </div>
        
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-4 px-1 max-w-1xl mx-auto">
        {classrooms.map((classroom) => (
          <div
            key={classroom.id}
            className="bg-[#0A2B3D] text-white rounded-lg p-3 shadow-md flex flex-col justify-between w-80 h-46"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">

                <div className="p-2 flex items-center">
                <Image src={class_icon} alt="icone classroom" className=" w-16 h-16" />
                <div className="text-xl text-gray-300 ml-3">{classroom.disciplina} <br/> {classroom.codigo}</div>
                
                </div>


                
              </div>
              <input
                type="checkbox"
                checked={classroom.selected}
                onChange={() => toggleOne(classroom.id)}
                className="w-6 h-6 accent-blue-600"
              />
            </div>
            <button className="mb-4 bg-gray-200 text-black px-1 py-1 rounded-2xl text-sm hover:bg-gray-400">
              {classroom.dossie}
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

      <div className=''>
        {/* Painel de ações que aparece apenas quando há classrooms selecionadas */}
        {hasSelected && <ActionPanel onDeleted={onDeleteClass}/>}
      </div>

    </div>
  );
}
