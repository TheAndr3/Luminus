// Importação do tipo students para tipagem dos dados
import {Students} from "./types"
// Componente para o modal de criação de studentss
import DialogPage from "@/app/(appLayout)/classroom/components/createClassModal";
// Componente de controle de paginação
import PageController from "@/app/(appLayout)/classroom/components/paginationController";
// Componente para alternar entre visualização em lista ou grade
import ClassViewMode from "@/app/(appLayout)/classroom/components/classViewMode";

// Ícone padrão para as studentss
import class_icon from "@/components/icon/icon_classroom.svg"

// Componente de imagem otimizada do Next.js
import Image from "next/image";
// Painel de ações que aparece quando studentss são selecionadas
import ActionPanel from "@/app/(appLayout)/classroom/components/actionPainel";
// Hooks do React para efeitos colaterais e estado
import { useEffect, useState } from "react";
// Componente com ações disponíveis para cada students
import ClassroomActions from "@/app/(appLayout)/classroom/components/classroomActions";
import { Classroom } from "../../components/types";

// Tipagem das props que o componente ListClass recebe
type ListStudentsProps = {
  students: Students[];                      // Lista de alunos visíveis (paginadas)
  toggleSelectAll: () => void;                 // Seleciona/deseleciona todas as da página
  toggleOne: (id: number) => void;             // Alterna a seleção de um aluno específico
  isAllSelected: boolean;                      // Indica se todas da página estão selecionadas
  currentPage: number;                         // Página atual
  totalPages: number;                          // Total de páginas
  setCurrentPage: (page: number) => void;      // Função para trocar de página
  visualization: string;                       // NE
  setVisualization: (set: 'grid' | 'list') => void; // NE
  onDeleteClass: () => void;                   // Função para deletar alunos
  toArchiveClass: () => void;                  // NA
};

// Componente principal que renderiza a lista de studentss
export default function ListClass({
  students,
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
}: ListStudentsProps) {
  // Controla se há studentss selecionadas para exibir o painel de ações
  const [hasSelected, setHasSelected] = useState(false);

  // ID da students atualmente com hover (para mostrar ações)
  const [hovered, sethovered] = useState(Number);

  // ID da students em modo de edição
  const [editingId, setEditingId] = useState<number | null>(null);
  // Dados temporários editados durante a edição
  const [editedData, setEditedData] = useState<Partial<Students>>({});

  // Atualiza o estado de seleção sempre que a lista muda
  useEffect(() => {
    setHasSelected(students.some(students => students.selected));
  }, [students]);

  // Alterna a seleção de uma única students
  const handleToggleOne = (id: number) => {
    toggleOne(id);
  };

  // Alterna a seleção de todas as studentss da página
  const handleToggleAll = () => {
    toggleSelectAll();
  };

  // Ainda não implementado: lógica para entrar no modo de edição
  const handleEdit = () => {
    // A lógica pode ser implementada dentro do componente studentsActions
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
          {/* Renderiza uma linha para cada students */}
          {students.map((students) => (
            <tr
              key={students.id}
              onMouseEnter={()=> sethovered(students.id)}
              onMouseLeave={() => sethovered(-1)}
              className="bg-[#0A2B3D] text-white rounded px-4 py-2"
            >
              {/* Checkbox individual */}
              <td className="p-2 w-[50px]">
                <input
                  type="checkbox"
                  checked={!!students.selected}
                  onChange={() => handleToggleOne(students.id)}
                  className="w-6 h-6 accent-blue-600"
                />
              </td>
              {/* Ícone da students */}
              <td className="p-2 flex items-center">
                <Image src={class_icon} alt="icone students" className="w-10 h-10" />
              </td>

              {/* Modo de edição ou exibição */}
              {editingId === students.id ? (
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
                  <td className="p-2 text-xl">{students.disciplina}</td>
                  <td className="p-2 text-xl">{students.codigo}</td>
                  <td className="p-2 text-xl">{students.dossie}</td>
                </>
              )}

              {/* Exibe as ações ao passar o mouse */}
              <td className="p-2">
                {hovered === students.id && editingId !== students.id && (
                  <ClassroomActions
                    classroomId={students.id}
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
