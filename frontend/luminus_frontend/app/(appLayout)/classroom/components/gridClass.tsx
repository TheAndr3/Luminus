import { Classroom } from '@/app/(appLayout)/classroom/components/types';
import DialogPage from './createClassModal';
import PageController from './paginationController';
import ClassViewMode from './classViewMode';

import class_icon from "@/components/icon/icon_classroom.svg"
import Image from "next/image";
import { useEffect, useState } from 'react';
import ActionPanel from './actionPainel';
import { Archive, Download, Pencil, Trash } from 'lucide-react';
import EditClassModal from './editClassModal';

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
  toArchiveClass: () => void;
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
  toArchiveClass

}: GridclassroomsProps) {

  const [hasSelected, setHasSelected] = useState(false);
  // Estado que armazena o id da turma que está sendo "hovered" (mouse sobre ela)
  const [hovered, setHovered] = useState<number | null>(null);

    // Estado para controlar a abertura do modal de edição
  const [openEditingModal, setOpenEditingModal] = useState(false);

  // Estado que guarda a turma atualmente sendo editada (ou null se nenhuma)
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);

  const [lockHover, setLockHover] = useState(false)

    // Efeito que verifica sempre que a lista de classrooms muda
    // para atualizar o estado hasSelected
    useEffect(() => {
      // Verifica se existe pelo menos uma classroom selecionada
      setHasSelected(classrooms.some(classroom => classroom.selected));
    }, [classrooms]); // Executa sempre que o array de classrooms mudar

  return (
    <div className="w-full ">
      {/* Título e barra de ferramentas */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleSelectAll}
            className="w-6 h-6 accent-blue-600"
          />
          <span className="px-2vh text-lg text-gray-600 font-bold">Selecionar todos</span>
        </div>
        <div className="flex gap-2 items-center">
          {/*Renderização tipo de visualização das classrooms (lista ou grade) */}
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
            onMouseEnter={() =>!lockHover &&setHovered(classroom.id)}  // Marca a turma como "hovered" quando o mouse passar por cima
            onMouseLeave={() =>!lockHover && setHovered(null)}  // Remove o "hovered" quando o mouse sair da linha
            className="bg-[#0A2B3D] text-white rounded-lg p-[1vh] shadow-md flex flex-col justify-between w-[27vw] h-46"

          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">

                <div className="p-2 flex items-center">
                  <Image src={class_icon} alt="icone classroom" className=" w-16 h-16" />
                  <div className="text-xl text-gray-300 ml-3">{classroom.disciplina} <br/> {classroom.codigo}</div>
                  
                </div>
 
              </div>
              
              <div className="flex flex-col gap-2">
                    <input
                    type="checkbox"
                    checked={classroom.selected}
                    onChange={() => toggleOne(classroom.id)}
                    className="w-6 h-6 accent-blue-600"
                  />

                  {/* Coluna com o botão para editar, visível somente quando a linha está "hovered" */}
                <td className="p-1 w-8 relative">
                  {hovered === classroom.id && (
                    <div className="absolute right-0 top-0 flex flex-col gap-2 bg-[#0A2B3D]">
                      {/* Botão de edição com ícone de lápis */}
                      <button
                        className="hover:text-yellow-400"
                        onClick={() => {
                          setOpenEditingModal(true);  // Abre o modal de edição
                          setEditingClassroom(classroom);  // Define qual turma está sendo editada
                          setLockHover(true);
                        }}
                      >
                        <Pencil size={18} />
                      </button>
                        
                      <button
                        className="hover:text-yellow-400"
                        onClick={()=> {
                          classroom.selected = true;
                          onDeleteClass()
                          classroom.selected = false;
                        }}
                      >
                        <Trash size={18}></Trash>
                      
                      </button>

                      <button
                        className="hover:text-yellow-400"
                        onClick={()=> {
                          classroom.selected = true;
                          toArchiveClass();
                          classroom.selected = false;
                        }}
                        >
                          <Archive size={18}></Archive>
                        </button>
                      
                        <button
                          className="hover:text-yellow-400"
                        >
                      
                          <Download size={18}></Download>
                        </button>

                      {/* Modal de edição da turma */}
                      <EditClassModal
                        open={openEditingModal}
                        onCancel={() => {setOpenEditingModal(false); setLockHover(false)}}  // Fecha o modal ao cancelar
                        classroom={{
                          id: classroom.id,
                          name: classroom.disciplina,
                          course: classroom.codigo,
                          institution: classroom.dossie,
                        }}
                      />
                    </div>
                  )}
                </td>
                  
              </div> 

            </div>

            <button className="mb-2 bg-gray-200 text-black vw-1 vh-1 rounded-2xl text-sm hover:bg-gray-400">
              {classroom.dossie}
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

      <div className="-mt-11">
        {/* Painel de ações que aparece apenas quando há classrooms selecionadas */}
        {hasSelected && <ActionPanel onDeleted={onDeleteClass} toArchive={toArchiveClass}/>}
      </div>

    </div>
  );
}
