// Importação do tipo Classroom para tipar os dados das turmas que serão manipuladas
import { Classroom } from "@/app/(appLayout)/classroom/components/types";
// Importação do modal para criar novas turmas (classrooms)
import DialogPage from "./createClassModal";
// Importação do componente que controla a paginação das turmas exibidas
import PageController from "./paginationController";
// Componente para alternar entre modos de visualização (grade ou lista)
import ClassViewMode from "./classViewMode";
// Ícone padrão para representar uma turma
import class_icon from "@/components/icon/icon_classroom.svg";
// Componente do Next.js para otimizar a exibição de imagens
import Image from "next/image";
// Painel de ações que aparece quando pelo menos uma turma está selecionada
import ActionPanel from "./actionPainel";
// Hooks do React para controlar estados e efeitos colaterais
import { useEffect, useState } from "react";

// Modal para editar uma turma
import EditClassModal from "./editClassModal";
// Ícones para as ações de editar, excluir, arquivar e download
import { Archive, Download, Pencil, Trash } from "lucide-react";

import { useRouter } from "next/navigation"; 


// Definição do tipo das propriedades que o componente ListClass recebe
type ListclassroomsProps = {
  classrooms: Classroom[];  // Lista das turmas a serem exibidas
  toggleSelectAll: () => void;  // Função para selecionar ou desmarcar todas as turmas
  toggleOne: (id: number) => void;  // Função para selecionar ou desmarcar uma turma específica pelo id
  isAllSelected: boolean;  // Indica se todas as turmas estão selecionadas
  currentPage: number;  // Página atual exibida na listagem
  totalPages: number;  // Número total de páginas para paginação
  setCurrentPage: (page: number) => void;  // Função para alterar a página atual
  visualization: string;  // Tipo de visualização atual: "grid" ou "list"
  setVisualization: (set: "grid" | "list") => void;  // Função para alterar o tipo de visualização
  onDeleteClass: () => void;  // Função para deletar as turmas selecionadas
  toArchiveClass: () => void;  // Função para arquivar as turmas selecionadas
  toExportClass: () => void;
};

// Componente principal que renderiza a lista de turmas (classrooms)
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
  toArchiveClass,
  toExportClass
}: ListclassroomsProps) {
  // Estado que indica se há pelo menos uma turma selecionada
  const [hasSelected, setHasSelected] = useState(false);
  // Estado que armazena o id da turma que está sendo "hovered" (mouse sobre ela)
  const [hovered, setHovered] = useState<number | null>(null);

  // Estado para controlar a abertura do modal de edição
  const [openEditingModal, setOpenEditingModal] = useState(false);

  // Estado que guarda a turma atualmente sendo editada (ou null se nenhuma)
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);

  // Estado que controla se o hover está bloqueado (ex: quando um modal está aberto)
  const [lockHover, setLockHover] = useState(false);

  const router = useRouter()

  // useEffect que atualiza o estado hasSelected sempre que a lista de turmas muda
  // Ele verifica se alguma turma está selecionada e atualiza o estado local
  useEffect(() => {
    setHasSelected(classrooms.some((classroom) => classroom.selected));
  }, [classrooms]);

  // Função para alternar a seleção de uma turma individual pelo id
  const handleToggleOne = (id: number) => {
    toggleOne(id);
  };

  // Função para alternar a seleção de todas as turmas
  const handleToggleAll = () => {
    toggleSelectAll();
  };

  const handleClickPageStudent = (id: number) => {
    
    router.push(`/classroom/${id+1}`)
    
    
    //pesquisar sobre cache que mano maike falou
  }

  return (
    <div className="w-full -mt-5">
      {/* Tabela que exibe as turmas com seus dados */}
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-sm text-gray-600">
            {/* Coluna com checkbox para selecionar todas as turmas */}
            <th className="w-[0px] px-2 gap-10">
              <input
                type="checkbox"
                onChange={handleToggleAll}
                checked={!!isAllSelected}
                className="w-6 h-6 accent-blue-600"
              />
            </th>
            {/* Ícone */}
            <th className="px-2vh text-lg"></th>

            {/* Cabeçalhos para as colunas principais da tabela */}
            <th className="px-2vh text-lg pl-4">Disciplina</th>
            <th className="px-2vh text-lg pl-10">Turma</th>
            <th className="px-2vh text-lg pl-4">Dossiê</th>
            <th className="px-2vh text-lg"></th>
          </tr>
        </thead>
        <tbody>
          {/* Mapeia a lista de turmas para renderizar cada uma como uma linha da tabela */}
          {classrooms.map((classroom) => (
            <tr
              key={classroom.id}
              onMouseEnter={() =>!lockHover && setHovered(classroom.id)}  // Marca a turma como "hovered" quando o mouse passar por cima
              onMouseLeave={() =>!lockHover && setHovered(null)}  // Remove o "hovered" quando o mouse sair da linha
              className="bg-[#0A2B3D] text-white rounded px-[4vh] py-[2vh] "
              onClick={() => handleClickPageStudent(classroom.id)}
            >
              {/* Checkbox para selecionar essa turma individualmente */}
              <td className="p-2 w-[50px]" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={!!classroom.selected}  // Marca se a turma está selecionada
                  onChange={() => handleToggleOne(classroom.id)}  // Alterna seleção ao clicar
                  className="w-6 h-6 accent-blue-600"
                />
              </td>

              {/* Ícone que representa a turma */}
              <td className="p-2 flex items-center">
                <Image
                  src={class_icon}
                  alt="icone classroom"
                  className="w-10 h-10"
                />
              </td>

              {/* Colunas com dados da turma: disciplina, código da turma e dossiê */}
              <>
                <td className="p-2 text-xl">{classroom.disciplina}</td>
                <td className="p-2 text-xl">{classroom.codigo}</td>
                <td className="p-2 text-xl">{classroom.dossie}</td>
              </>

              {/* Coluna com os botões de ação, visíveis somente quando a linha está "hovered" */}
              <td className="p-1 w-[5vw]" onClick={(e) => e.stopPropagation()}>
                {hovered === classroom.id && (
                  <div className="flex gap-2 justify-end mr-2">
                    {/* Botões de ação: editar, excluir, arquivar e download */}
                    <button
                      className="hover:text-yellow-400"
                      onClick={() => {
                        
                        setOpenEditingModal(true);  // Abre o modal de edição
                        setEditingClassroom(classroom);  // Define qual turma está sendo editada
                        setLockHover(true)
                      }}
                    >
                      <Pencil />
                    </button>
                    
                    <button
                      className="hover:text-yellow-400"
                      onClick={()=> {
                        classroom.selected = true;
                        onDeleteClass()
                        classroom.selected = false;
                      }}
                    >
                      <Trash></Trash>
                    </button>

                    <button
                      className="hover:text-yellow-400"
                      onClick={()=> {
                        classroom.selected = true;
                        toArchiveClass();
                        classroom.selected = false;
                      }}
                    >
                      <Archive></Archive>
                    </button>

                    <button
                      className="hover:text-yellow-400"
                      onClick={() => {
                        classroom.selected = true;
                        toExportClass();
                        classroom.selected = false
                      }}

                    >
                      <Download></Download>
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
            </tr>
          ))}
        </tbody>
      </table>

      {/* Controlador de paginação */}
      <div className="-mt-5">
        <PageController
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* Painel de ações que aparece quando há turmas selecionadas */}
      <div className="-mt-10">
        {hasSelected && (
          <ActionPanel
            onDeleted={onDeleteClass}
            toArchive={toArchiveClass}
            toExport={toExportClass}
          />
        )}
      </div>
    </div>
  );
}