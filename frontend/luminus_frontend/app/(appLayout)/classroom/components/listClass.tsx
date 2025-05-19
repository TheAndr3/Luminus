// Importação do tipo Classroom para tipagem dos dados que serão manipulados
import { Classroom } from "@/app/(appLayout)/classroom/components/types";
// Importação do modal para criar novas classrooms
import DialogPage from "./createClassModal";
// Importação do componente de controle de paginação
import PageController from "./paginationController";
// Importação do componente que alterna entre visualização em lista ou grade
import ClassViewMode from "./classViewMode";
// Ícone padrão para representar as classrooms
import class_icon from "@/components/icon/icon_classroom.svg";
// Importação do componente de imagem otimizada do Next.js
import Image from "next/image";
// Painel de ações que aparece quando alguma classroom é selecionada
import ActionPanel from "./actionPainel";
// Importação dos hooks do React para efeitos colaterais e estado
import { useEffect, useState } from "react";
// Importação do componente com ações disponíveis para cada classroom
import ClassroomActions from "./classroomActions";
// Importação do componente de input base (campo de texto)
import { BaseInput } from "@/components/inputs/BaseInput";

// Tipagem das props que o componente ListClass recebe
type ListclassroomsProps = {
  classrooms: Classroom[];  // Lista de classrooms
  toggleSelectAll: () => void;  // Função para selecionar/desmarcar todas as classrooms
  toggleOne: (id: number) => void;  // Função para selecionar/desmarcar uma classroom específica
  isAllSelected: boolean;  // Flag que indica se todas as classrooms estão selecionadas
  currentPage: number;  // Página atual de exibição
  totalPages: number;  // Total de páginas
  setCurrentPage: (page: number) => void;  // Função para mudar a página atual
  visualization: string;  // Tipo de visualização (lista ou grade)
  setVisualization: (set: "grid" | "list") => void;  // Função para mudar o tipo de visualização
  onDeleteClass: () => void;  // Função para deletar a classroom selecionada
  toArchiveClass: () => void;  // Função para arquivar a classroom selecionada
};

// Componente principal ListClass para renderizar a lista de classrooms
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
}: ListclassroomsProps) {
  // Estado local para verificar se algum item está selecionado
  const [hasSelected, setHasSelected] = useState(false);
  // Estado local para controlar qual classroom está sendo "hovered" (passando o mouse por cima)
  const [hovered, setHovered] = useState<number | null>(null);
  // Estado local para controlar se estamos editando uma classroom
  const [editingId, setEditingId] = useState<number | null>(null);
  // Estado para armazenar os dados editados de uma classroom
  const [editedData, setEditedData] = useState<Partial<Classroom>>({});

  // UseEffect para verificar se alguma classroom está selecionada e atualizar o estado hasSelected
  useEffect(() => {
    setHasSelected(classrooms.some((classroom) => classroom.selected));
  }, [classrooms]);

  // Função para alternar o estado de seleção de uma classroom individual
  const handleToggleOne = (id: number) => {
    toggleOne(id);
  };

  // Função para alternar o estado de seleção de todas as classrooms
  const handleToggleAll = () => {
    toggleSelectAll();
  };

  // Função para salvar as edições feitas em uma classroom (ainda não implementada)
  const handleSave = () => {
    // A lógica de salvamento pode ser implementada aqui
  };

  // Função para cancelar a edição e limpar os dados
  const handleCancel = () => {
    setEditingId(null);
    setEditedData({
      disciplina: '',
      codigo: '',
      dossie: '',
    });
  };

  // Função para lidar com a alteração de dados de uma classroom enquanto ela está sendo editada
  const handleInputChange = (field: keyof Classroom, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="w-full">
      {/* Tabela para exibir as classrooms */}
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-sm text-gray-600">
            {/* Coluna de checkbox para selecionar todas as classrooms */}
            <th className="w-[0px] px-2 gap-10">
              <input
                type="checkbox"
                onChange={handleToggleAll}  // Função chamada ao alterar o estado de seleção
                checked={!!isAllSelected}  // Verifica se todas estão selecionadas
                className="w-6 h-6 accent-blue-600"
              />
            </th>
            {/* Cabeçalho para selecionar todos */}
            <th className="px-2vh text-lg ">Selecionar todos</th>
            {/* Cabeçalhos para as colunas de Disciplina, Turma e Dossiê */}
            <th className="px-2vh text-lg absolute left-[35vw]">Disciplina</th>
            <th className="px-2vh text-lg absolute left-[54vw]">Turma</th>
            <th className="px-2vh text-lg flex items-center mt-4">
              <span className="absolute left-[74vw]">Dossiê</span>
              <div className="flex gap-2 absolute right-[10vh] top-[22vh]">
                {/* Componente de alternância de visualização (lista ou grade) */}
                <ClassViewMode
                  visualization={visualization}
                  setVisualization={setVisualization}
                />
                {/* Componente para abrir o modal de criação de novas classrooms */}
                <DialogPage />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Mapeamento das classrooms para exibir suas informações */}
          {classrooms.map((classroom) => (
            <tr
              key={classroom.id}
              onMouseEnter={() => setHovered(classroom.id)}  // Quando passar o mouse por cima, altera o estado de "hovered"
              onMouseLeave={() => setHovered(null)}  // Quando sair o mouse, retorna ao estado inicial
              className="bg-[#0A2B3D] text-white rounded px-[4vh] py-[2vh] "
            >
              {/* Coluna de checkbox para seleção de cada classroom */}
              <td className="p-2 w-[50px]">
                <input
                  type="checkbox"
                  checked={!!classroom.selected}  // Verifica se essa classroom está selecionada
                  onChange={() => handleToggleOne(classroom.id)}  // Chama a função para alternar o estado de seleção dessa classroom
                  className="w-6 h-6 accent-blue-600"
                />
              </td>
              {/* Exibe o ícone da classroom */}
              <td className="p-2 flex items-center">
                <Image
                  src={class_icon}
                  alt="icone classroom"
                  className="w-10 h-10"
                />
              </td>

              {/* Se a classroom estiver sendo editada, exibe campos de edição */}
              {editingId === classroom.id ? (
                <>
                  <td className="p-2">
                    <BaseInput
                      type="text"
                      value={editedData.disciplina || ""}  // Valor atual do campo disciplina
                      onChange={(e) =>
                        handleInputChange("disciplina", e.target.value)}  // Função chamada ao digitar no campo
                      className="focus:border-transparent transition text-gray-900 font-medium bg-white rounded-2xl"
                    />
                  </td>
                  <td className="p-2">
                    <BaseInput
                      type="text"
                      value={editedData.codigo || ""}  // Valor atual do campo código
                      onChange={(e) => handleInputChange("codigo", e.target.value)}  // Função chamada ao digitar no campo
                      className="focus:border-transparent transition text-gray-900 font-medium bg-white rounded-2xl"
                    />
                  </td>
                  <td className="p-2 flex gap-2 items-center">
                    {/* Botões de salvar e cancelar */}
                    <button
                      className="bg-green-500 text-white px-4 py-1 rounded-2xl hover:bg-green-700"
                      onClick={handleSave}
                    >
                      Salvar
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded-2xl hover:bg-red-700"
                      onClick={handleCancel}
                    >
                      Cancelar
                    </button>
                  </td>
                </>
              ) : (
                // Caso contrário, exibe as informações normais da classroom
                <>
                  <td className="p-2 text-xl">{classroom.disciplina}</td>
                  <td className="p-2 text-xl">{classroom.codigo}</td>
                  <td className="p-2 text-xl">{classroom.dossie}</td>
                </>
              )}

              {/* Coluna com ícones de ações (edição, exclusão, etc.) */}
              <td className="p-1 w-8">
                {hovered === classroom.id && editingId !== classroom.id && (
                  <ClassroomActions
                    classroomId={classroom.id}
                    onEdit={() => setEditingId(classroom.id)}  // Ao clicar para editar, altera o estado de edição
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="absolute right-[5vw] top-[83vh]">
        {/* Componente de controle de página */}
        <PageController
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* Exibe o painel de ações quando há seleções */}
      {hasSelected && (
        <ActionPanel onDeleted={onDeleteClass} toArchive={toArchiveClass} />
      )}
    </div>
  );
}
