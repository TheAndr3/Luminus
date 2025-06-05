// Importação do tipo students para tipagem dos dados
import {Students} from "./types"
// Componente para o modal de criação de studentss
import DialogPage from "@/app/(appLayout)/classroom/components/createClassModal";
// Componente de controle de paginação
import PageController from "@/app/(appLayout)/classroom/components/paginationController";
// Componente para alternar entre visualização em lista ou grade
import ClassViewMode from "@/app/(appLayout)/classroom/components/classViewMode";

// Ícone padrão para as studentss
import { FaUsers } from 'react-icons/fa';
import { Check, X, User as UserIcon } from 'lucide-react'; // Importa ícones de check e X, e um ícone de usuário para a nova linha

// Componente de imagem otimizada do Next.js
import Image from "next/image";
// Painel de ações que aparece quando studentss são selecionadas
import ActionPanel from "@/app/(appLayout)/classroom/[selected-class]/components/ActionPanel";
// Hooks do React para efeitos colaterais e estado
import { useEffect, useState } from "react";
// Componente com ações disponíveis para cada students
import ClassroomActions from "@/app/(appLayout)/classroom/components/classroomActions";
import { Classroom } from "../../components/types";
import AssociarDossie from "./associarDossie";

// Tipagem das props que o componente ListClass recebe
interface ListStudentsProps {
  mainColor?: string;
  hoverColor: string;

  students: Students[];                        // Lista de alunos visíveis (paginadas)

  toggleSelectAll: () => void;                 // Seleciona/deseleciona todas as da página
  toggleOne: (id: number) => void;             // Alterna a seleção de um aluno específico
  onDeleteStudents: () => void;                // Função para deletar alunos

  isAllSelected: boolean;                      // Indica se todas da página estão selecionadas
  currentPage: number;                         // Página atual
  totalPages: number;                          // Total de páginas
  setCurrentPage: (page: number) => void;      // Função para trocar de página

  // Novas props para a linha de adição inline
  showInlineAddStudent: boolean;
  inlineNewStudentMatricula: string;
  setInlineNewStudentMatricula: (value: string) => void;
  inlineNewStudentName: string;
  setInlineNewStudentName: (value: string) => void;
  handleInlineAddStudent: () => Promise<void>; // Função para adicionar o aluno
  handleCancelInlineAdd: () => void;           // Função para cancelar a adição
  inlineAddStudentError: string | null;        // Erro da adição inline
  isLoading: boolean;                          // Estado de loading global

  onCsvFileSelected: (file: File) => void;
};

// Componente principal que renderiza a lista de studentss
export default function ListStudents({
  mainColor,
  hoverColor,

  students,

  toggleSelectAll,
  toggleOne,
  onDeleteStudents,

  isAllSelected,
  currentPage,
  totalPages,
  setCurrentPage,

  // Novas props para a linha de adição inline
  showInlineAddStudent,
  inlineNewStudentMatricula,
  setInlineNewStudentMatricula,
  inlineNewStudentName,
  setInlineNewStudentName,
  handleInlineAddStudent,
  handleCancelInlineAdd,
  inlineAddStudentError,
  isLoading,

  onCsvFileSelected,
}: ListStudentsProps) {

  // Estado local para verificar se algum item está selecionado
  const [hasSelected, setHasSelected] = useState(false);
  // Estado local para controlar qual classroom está sendo "hovered" (passando o mouse por cima)
  const [hovered, setHovered] = useState<number | null>(null);
  // Estado local para controlar se estamos editando uma classroom
  const [editingId, setEditingId] = useState<number | null>(null);
  // Estado para armazenar os dados editados de uma classroom
  const [editedData, setEditedData] = useState<Partial<Students>>({});

  // UseEffect para verificar se alguma classroom está selecionada e atualizar o estado hasSelected
  useEffect(() => {
    setHasSelected(students.some((students) => students.selected));
  }, [students]);

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
      matricula: 0,
      nome: '',
    });
  };

  // Função para lidar com a alteração de dados de uma classroom enquanto ela está sendo editada
  const handleInputChange = (field: keyof Students, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="w-full">
      
      {/* Cabeçalho da tabela */}
      <table className="table-fixed w-full text-left border-separate border-spacing-y-2 rounded-md">
        <thead className="bg-gray-100">
          <tr className="text-sm text-gray-600">
            <th className="w-8 px-4 py-3">
              <input
                type="checkbox"
                onChange={handleToggleAll}
                checked={!!isAllSelected}
                className="w-5 h-5 accent-blue-600"
              />
            </th>
            <th className="w-10 px-4 py-3"></th> 
            <th className="px-4 py-3 text-left">Matrícula</th>
            <th className="px-4 py-3 text-left">Aluno</th>
            <th className="w-14 px-2"></th> 
          </tr>
        </thead>
        
        <tbody>
          {/* Linha para adicionar novo aluno (condicional) */}
          {showInlineAddStudent && (
            <tr className="bg-slate-800 text-white border-b border-slate-700">
              <td className="px-4 py-3 w-12"></td> {/* Checkbox vazio para alinhamento */}
              <td className="w-10 px-5 py-3 text-left">
                <UserIcon className="w-6 h-6 text-gray-400" /> {/* Ícone de usuário */}
              </td>
              <td className="px-4 py-3">
                <input
                  type="number" // Alterado para number para matrículas
                  value={inlineNewStudentMatricula}
                  onChange={(e) => setInlineNewStudentMatricula(e.target.value)}
                  placeholder="Matrícula"
                  className="w-full p-2 rounded-md border border-gray-300 text-gray-900 bg-gray-200"
                  disabled={isLoading}
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  value={inlineNewStudentName}
                  onChange={(e) => setInlineNewStudentName(e.target.value)}
                  placeholder="Nome do Aluno"
                  className="w-full p-2 rounded-md border border-gray-300 text-gray-900 bg-gray-200"
                  disabled={isLoading}
                />
              </td>
              <td className="px-4 py-3 flex gap-2 items-center">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full disabled:opacity-50"
                  onClick={handleInlineAddStudent}
                  disabled={isLoading || !inlineNewStudentMatricula.trim() || !inlineNewStudentName.trim()}
                  title="Adicionar Aluno"
                >
                  <Check size={20} />
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full disabled:opacity-50"
                  onClick={handleCancelInlineAdd}
                  disabled={isLoading}
                  title="Cancelar"
                >
                  <X size={20} />
                </button>
              </td>
            </tr>
          )}

          {/* Exibe erro de adição inline, se houver */}
          {showInlineAddStudent && inlineAddStudentError && (
            <tr className="bg-red-900/20">
              <td colSpan={5} className="px-4 py-2 text-center text-red-400 text-sm">
                {inlineAddStudentError}
              </td>
            </tr>
          )}

          {/* Renderiza uma linha para cada students */}
          {students.map((students) => (
            <tr
              key={students.matricula}
              onMouseEnter={() => setHovered(students.matricula)}
              onMouseLeave={() => setHovered(null)}
              className="bg-slate-900 text-white border-b border-slate-700 hover:brightness-110"//"bg-[#101828] text-white rounded-xl shadow-sm transition hover:brightness-110"
            >
              {/* Checkbox individual */}
              <td className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={!!students.selected}
                  onChange={() => handleToggleOne(students.matricula)}
                  className="w-5 h-5 accent-blue-600"
                />
              </td>
              {/* Ícone da students */}
              <td className="w-10 px-5 py-3 text-left">
                <FaUsers className="w-6 h-6" />
              </td>

              {/* Modo de edição ou exibição */}
              {editingId === students.matricula ? (
                <>
                <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editedData.matricula || ""}
                      onChange={(e) => handleInputChange("matricula", e.target.value)}
                      className="w-full p-2 rounded-md border border-gray-300 text-gray-900"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editedData.nome || ""}
                      onChange={(e) => handleInputChange("nome", e.target.value)}
                      className="w-full p-2 rounded-md border border-gray-300 text-gray-900"
                    />
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md"
                      onClick={handleSave}
                    >
                      Salvar
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                      onClick={handleCancel}
                    >
                      Cancelar
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-4 py-3 text-lg">{students.matricula}</td>
                  <td className="px-4 py-3 text-lg">{students.nome}</td>
                </>
              )}

              {/* Exibe as ações ao passar o mouse */}
              <td className="p-2">
                {hovered === students.matricula && editingId !== students.matricula && (
                  <ClassroomActions
                    classroomId={students.matricula}
                    onEdit={() => setEditingId(students.matricula)}  // Ao clicar para editar, altera o estado de edição
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-6">
      {/* Paginação */}
      <PageController
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
      </div>

      {/* Painel de ações que aparece quando há turmas selecionadas */}
      <div className="mt-10">
        {hasSelected && (
          <ActionPanel
            mainColor={mainColor}
            hoverColor={hoverColor}
            onDeleted={onDeleteStudents}
            onCsvFileSelected={onCsvFileSelected}
          />
        )}
      </div>
    </div>
  );
}
