import { Classroom } from '@/app/(appLayout)/classroom/components/types';
import DialogPage from './createClassModal';
import PageController from './paginationController';
import ClassViewMode from './classViewMode';

import class_icon from "@/components/icon/icon_classroom.svg"
import Image from "next/image";
import { useEffect, useState } from 'react';
import ActionPanel from './actionPanel';
import { Download, Pencil, Trash } from 'lucide-react';
import EditClassModal from './editClassModal';
import { useRouter } from 'next/navigation';

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
  // CORREÇÃO: Removidas props 'toArchiveClass' e 'toExportClass' pois não eram utilizadas neste componente.
  // toArchiveClass: () => void;
  toExportClass: () => void; // Mantida pois é usada no botão de download individual
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
  onDeleteClass,
  toExportClass, // Mantida
  // CORREÇÃO: 'toArchiveClass' removida dos argumentos.
}: GridclassroomsProps) {

  const [hasSelected, setHasSelected] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [openEditingModal, setOpenEditingModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [lockHover, setLockHover] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setHasSelected(classrooms.some(classroom => classroom.selected));
  }, [classrooms]);

  const handleClickPageStudent = (id: number) => {
    router.push(`/classroom/${id}`)
  }

  return (
    <div className="w-full -mt-5">
      {/* Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-[2vw] gap-x-[4vh] vw-1 max-w-1xl mx-auto mb-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            onChange={toggleSelectAll}
            checked={!!isAllSelected}
            className="w-6 h-6 accent-blue-600 cursor-pointer"
          />
          <span className="text-lg text-gray-600 font-bold">Selecionar todos</span>
        </div>
        <div></div>
        <div className="flex gap-2 items-center justify-end">
          <ClassViewMode
            visualization={visualization}
            setVisualization={setVisualization}
          />
          <DialogPage/>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-[2vw] gap-x-[4vh] vw-1 max-w-1xl mx-auto">
        {classrooms.map((classroom) => (
          <div
            key={classroom.id}
            onMouseEnter={() =>!lockHover &&setHovered(classroom.id)}
            onMouseLeave={() =>!lockHover && setHovered(null)}
            className="bg-gray-900 text-white rounded-lg p-4 shadow-md flex flex-col justify-between h-48 cursor-pointer hover:brightness-110"
            onClick={() => handleClickPageStudent(classroom.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <Image src={class_icon} alt="icone classroom" className="w-16 h-16" />
                <div className="text-xl text-gray-300 ml-3">
                  <div>{classroom.disciplina}</div>
                  <div>{classroom.codigo}</div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3" onClick={(e)=>e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={classroom.selected}
                  onChange={() => toggleOne(classroom.id)}
                  className="w-6 h-6 accent-blue-600 cursor-pointer"
                />

                <div className={`flex flex-col gap-3 ${hovered === classroom.id ? 'visible' : 'invisible'}`}>
                  <button
                    title="Editar Turma"
                    className="hover:text-yellow-400 cursor-pointer"
                    onClick={() => {
                      setOpenEditingModal(true);
                      setEditingClassroom(classroom);
                      setLockHover(true);
                    }}
                  >
                    <Pencil size={24} />
                  </button>
                  <button
                    title="Excluir Turma"
                    className="hover:text-yellow-400 cursor-pointer"
                    onClick={() => {
                      classroom.selected = true;
                      onDeleteClass();
                      classroom.selected = false;
                    }}
                  >
                    <Trash size={24} />
                  </button>
                  <button
                    title="Baixar CSV"
                    className="hover:text-yellow-400 cursor-pointer"
                    onClick={() => {
                      classroom.selected = true;
                      toExportClass();
                      classroom.selected = false;
                    }}
                  >
                    <Download size={24} />
                  </button>
                </div>
              </div>
            </div>

            <button className="w-full mt-auto bg-gray-200 text-black px-3 rounded-lg text-sm hover:bg-gray-400"
              onClick={(e) => e.stopPropagation()}
            >
              {classroom.institution}
            </button>
          </div>
        ))} 
      </div>

      <div className="-mt-3">
        <PageController
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {editingClassroom && (
        <EditClassModal
          open={openEditingModal}
          onCancel={() => {
            setOpenEditingModal(false);
            setLockHover(false);
            setEditingClassroom(null);
          }}
          classroom={{
            id: editingClassroom.id,
            name: editingClassroom.disciplina,
            course: editingClassroom.codigo,
            season: editingClassroom.codigo,
            institution: editingClassroom.institution,
          }}
        />
      )}

      <div className="relative">
        {hasSelected && (
          <div className="absolute bottom-1 left">
            {/* CORREÇÃO: Removida a prop 'toExport' que não é mais aceita por ActionPanel */}
            <ActionPanel onDeleted={onDeleteClass} />
          </div>
        )}
      </div>

    </div>
  );
}