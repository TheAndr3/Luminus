// Importação do tipo classroom para tipagem dos dados
import {Classroom} from "@/app/(appLayout)/classroom/components/types"
// Componente para o modal de criação de classrooms
import DialogPage from "./createClassModal";
// Componente de controle de paginação
import PageController from "./paginationController";
// Componente para alternar entre visualização em lista ou grade
import ClassViewMode from "./classViewMode";

// Ícone padrão para as classrooms
import class_icon from "@/components/icon/icon_classroom.svg"

// Componente de imagem otimizada do Next.js
import Image from "next/image";
// Painel de ações que aparece quando classrooms são selecionadas
import ActionPanel from "./actionPainel";
// Hooks do React para efeitos colaterais e estado
import { useEffect, useState } from "react";
// Componente com ações disponíveis para cada classroom
import ClassroomActions from "./classroomActions";

// Tipagem das props que o componente ListClass recebe
type ListclassroomsProps = {
  classrooms: Classroom[];                      // Lista de classrooms visíveis (paginadas)
  toggleSelectAll: () => void;                 // Seleciona/deseleciona todas as da página
  toggleOne: (id: number) => void;             // Alterna a seleção de uma classroom específica
  isAllSelected: boolean;                      // Indica se todas da página estão selecionadas
  currentPage: number;                         // Página atual
  totalPages: number;                          // Total de páginas
  setCurrentPage: (page: number) => void;      // Função para trocar de página
  visualization: string;                       // Modo atual de visualização ('grid' ou 'list')
  setVisualization: (set: 'grid' | 'list') => void; // Troca o modo de visualização
  onDeleteClass: () => void;                   // Função para deletar classrooms
  toArchiveClass: () => void;                  // Função para arquivar classrooms
};

// Componente principal que renderiza a lista de classrooms
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
  toArchiveClass
}: ListclassroomsProps) {
  // Controla se há classrooms selecionadas para exibir o painel de ações
  const [hasSelected, setHasSelected] = useState(false);

  // ID da classroom atualmente com hover (para mostrar ações)
  const [hovered, sethovered] = useState(Number);

  // ID da classroom em modo de edição
  const [editingId, setEditingId] = useState<number | null>(null);
  // Dados temporários editados durante a edição
  const [editedData, setEditedData] = useState<Partial<Classroom>>({});

  // Atualiza o estado de seleção sempre que a lista muda
  useEffect(() => {
    setHasSelected(classrooms.some(classroom => classroom.selected));
  }, [classrooms]);

  // Alterna a seleção de uma única classroom
  const handleToggleOne = (id: number) => {
    toggleOne(id);
  };

  // Alterna a seleção de todas as classrooms da página
  const handleToggleAll = () => {
    toggleSelectAll();
  };

  // Ainda não implementado: lógica para entrar no modo de edição
  const handleEdit = () => {
    // A lógica pode ser implementada dentro do componente ClassroomActions
  };

  // Cancela o modo de edição
  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  // Salva os dados editados
  const handleSave = () => {
    console.log("Salvando alterações:", editingId, editedData);
    setEditingId(null);
  };

  // Atualiza os campos editados conforme o usuário digita
  const handleInputChange = (field: keyof Classroom, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="w-full">
      {/* Cabeçalho da tabela */}
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-sm text-gray-600">
            {/* Checkbox para selecionar todos */}
            <th className="w-[0px] px-2">
              <input
                type="checkbox"
                onChange={handleToggleAll}
                checked={!!isAllSelected}
                className="w-6 h-6 accent-blue-600"
              />
            </th>
            <th className="px-2 text-lg">Selecionar todos</th>
            <th className="px-2 text-lg">Disciplina</th>
            <th className="px-2 text-lg">Turma</th>
            <th className="px-2 text-lg flex items-center justify-between">
              <span>Dossiê</span>
              <div className="flex gap-2 fixed top-43 left-325 z-50">
                <ClassViewMode
                  visualization={visualization}
                  setVisualization={setVisualization}
                />
                <DialogPage/>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {/* Renderiza uma linha para cada classroom */}
          {classrooms.map((classroom) => (
            <tr
              key={classroom.id}
              onMouseEnter={()=> sethovered(classroom.id)}
              onMouseLeave={() => sethovered(-1)}
              className="bg-[#0A2B3D] text-white rounded px-4 py-2"
            >
              {/* Checkbox individual */}
              <td className="p-2 w-[50px]">
                <input
                  type="checkbox"
                  checked={!!classroom.selected}
                  onChange={() => handleToggleOne(classroom.id)}
                  className="w-6 h-6 accent-blue-600"
                />
              </td>
              {/* Ícone da classroom */}
              <td className="p-2 flex items-center">
                <Image src={class_icon} alt="icone classroom" className="w-10 h-10" />
              </td>

              {/* Modo de edição ou exibição */}
              {editingId === classroom.id ? (
                <>
                  <td className="p-2">
                    <input
                      type="text"
                      value={editedData.disciplina || ""}
                      onChange={(e) => handleInputChange("disciplina", e.target.value)}
                      className="text-black px-2 py-1 rounded"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={editedData.codigo || ""}
                      onChange={(e) => handleInputChange("codigo", e.target.value)}
                      className="text-black px-2 py-1 rounded"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={editedData.dossie || ""}
                      onChange={(e) => handleInputChange("dossie", e.target.value)}
                      className="text-black px-2 py-1 rounded"
                    />
                  </td>
                </>
              ) : (
                <>
                  <td className="p-2 text-xl">{classroom.disciplina}</td>
                  <td className="p-2 text-xl">{classroom.codigo}</td>
                  <td className="p-2 text-xl">{classroom.dossie}</td>
                </>
              )}

              {/* Exibe as ações ao passar o mouse */}
              <td className="p-2">
                {hovered === classroom.id && editingId !== classroom.id && (
                  <ClassroomActions
                    classroomId={classroom.id}
                    onEdit={handleEdit}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginação */}
      <PageController
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      {/* Painel de ações aparece se houver seleção */}
      {hasSelected && <ActionPanel onDeleted={onDeleteClass} toArchive={toArchiveClass} />}
    </div>
  );
}
