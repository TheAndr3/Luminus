import { Classroom } from "@/app/(appLayout)/classroom/components/types";
import DialogPage from "./createClassModal";
import PageController from "./paginationController";
import ClassViewMode from "./classViewMode";
import class_icon from "@/components/icon/icon_classroom.svg";
import Image from "next/image";
import ActionPanel from "./actionPanel";
import { useEffect, useState } from "react";
import EditClassModal from "./editClassModal";
import { Download, Pencil, Trash } from "lucide-react";
import { useRouter } from "next/navigation";

type ListclassroomsProps = {
  classrooms: Classroom[];
  toggleSelectAll: () => void;
  toggleOne: (id: number) => void;
  isAllSelected: boolean;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  visualization: string;
  setVisualization: (set: "grid" | "list") => void;
  onDeleteClass: () => void;
  toExportClass: () => void;
  // CORREÇÃO: Removida a prop 'toArchiveClass' pois não era utilizada.
};

export default function ListClass({
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
  toExportClass,
  // CORREÇÃO: Removida 'toArchiveClass' dos argumentos.
}: ListclassroomsProps) {
  const [hasSelected, setHasSelected] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [openEditingModal, setOpenEditingModal] = useState(false);
  // CORREÇÃO: 'editingClassroom' agora será usado corretamente.
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [lockHover, setLockHover] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasSelected(classrooms.some((classroom) => classroom.selected));
  }, [classrooms]);

  const handleToggleOne = (id: number) => {
    toggleOne(id);
  };

  const handleToggleAll = () => {
    toggleSelectAll();
  };

  const handleClickPageStudent = (id: number) => {
    router.push(`/classroom/${id}`);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <div className="w-full -mt-5">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-sm text-gray-600">
            <th className="w-[0px] px-2 gap-10 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  onChange={handleToggleAll}
                  checked={!!isAllSelected}
                  className="w-6 h-6 accent-blue-600 cursor-pointer"
                />
                <span className="text-lg text-gray-600 font-bold">Selecionar todos</span>
              </div>
            </th>
            <th className="px-2vh text-lg"></th>
            <th className="px-2vh text-lg pl-24">Disciplina</th>
            <th className="px-2vh text-lg pl-2">Turma</th>
            <th className="px-2vh text-lg pl-15">Instituição</th>
            <th className="px-2vh text-lg">
              <div className="flex gap-2 items-center justify-end">
                <ClassViewMode
                  visualization={visualization}
                  setVisualization={setVisualization}
                />
                <DialogPage />
              </div>
            </th>
            <th className="px-2vh text-lg"></th>
          </tr>
        </thead>
        <tbody>
          {classrooms.map((classroom) => (
            <tr
              key={classroom.id}
              onMouseEnter={() => !lockHover && setHovered(classroom.id)}
              onMouseLeave={() => !lockHover && setHovered(null)}
              className="bg-gray-900 text-white rounded px-[4vh] py-[2vh] cursor-pointer hover:brightness-110"
              onClick={() => handleClickPageStudent(classroom.id)}
            >
              <td className="p-2 w-[50px]" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={!!classroom.selected}
                  onChange={() => handleToggleOne(classroom.id)}
                  className="w-6 h-6 accent-blue-600 cursor-pointer"
                />
              </td>
              <td className="p-2 -ml-30 flex items-center">
                <Image
                  src={class_icon}
                  alt="icone classroom"
                  className="w-10 h-10"
                />
              </td>
              <td className="p-2 pl-24 text-xl" title={classroom.disciplina}>
                {truncateText(classroom.disciplina, 15)}
              </td>
              <td className="p-2 pl-2 text-xl" title={classroom.codigo}>
                {truncateText(classroom.codigo, 15)}
              </td>
              <td className="p-2 pl-15 text-xl" title={classroom.institution}>
                {truncateText(classroom.institution || '', 15)}
              </td>
              <td className="p-1 w-[5vw]" onClick={(e) => e.stopPropagation()}>
                {hovered === classroom.id && (
                  <div className="flex gap-2 justify-end mr-2">
                    <button
                      title="Editar Turma"
                      className="hover:text-yellow-400 cursor-pointer"
                      onClick={() => {
                        setEditingClassroom(classroom);
                        setOpenEditingModal(true);
                        setLockHover(true);
                      }}
                    >
                      <Pencil />
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
                      <Trash />
                    </button>
                    <button
                      title="Download CSV da Turma"
                      className="hover:text-yellow-400 cursor-pointer"
                      onClick={() => {
                        classroom.selected = true;
                        toExportClass();
                        classroom.selected = false;
                      }}
                    >
                      <Download />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="-mt-5">
        <PageController
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* CORREÇÃO: Modal movido para fora do loop de renderização (map) */}
      {editingClassroom && (
        <EditClassModal
          open={openEditingModal}
          onCancel={() => {
            setOpenEditingModal(false);
            setLockHover(false);
            setEditingClassroom(null); // Limpa a turma selecionada
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

      <div className="-mt-10">
        {hasSelected && (
          // CORREÇÃO: Removida a prop 'toExport' que não é aceita por ActionPanel
          <ActionPanel onDeleted={onDeleteClass} />
        )}
      </div>
    </div>
  );
}