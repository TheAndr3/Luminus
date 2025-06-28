// Importação do tipo students para tipagem dos dados
import {Students} from "./types"
// Componente para o modal de criação de studentss
import DialogPage from "@/app/(appLayout)/classroom/components/createClassModal";
// Componente de controle de paginação
import PageController from "@/app/(appLayout)/classroom/[selected-class]/components/paginationController";
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
import StudentActions from "./StudentActions";
import { UpdateStudent } from "@/services/studentService";
import { useRouter } from "next/navigation";

// Tipagem das props que o componente ListClass recebe
interface ListStudentsProps {
  mainColor?: string;
  hoverColor: string;
  classroomId: number; // ID da turma atual

  students: Students[];                        // Lista de alunos visíveis (paginadas)

  toggleSelectAll: () => void;                 // Seleciona/deseleciona todas da página
  toggleOne: (id: number) => void;             // Alterna a seleção de um aluno específico
  onDeleteStudents: () => void;                // Função para deletar alunos
  onDeleteStudent: (id: number) => void;       // Função para deletar um aluno específico

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
  
  // Nova prop para refresh dos alunos
  refreshStudents: () => void;
  associatedDossier: { id: number; name: string } | null;
};

// Componente principal que renderiza a lista de studentss
export default function ListStudents({
  mainColor,
  hoverColor,
  classroomId,

  students,

  toggleSelectAll,
  toggleOne,
  onDeleteStudents,
  onDeleteStudent,

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
  
  // Nova prop para refresh dos alunos
  refreshStudents,
  associatedDossier,
}: ListStudentsProps) {

  // Estado local para verificar se algum item está selecionado
  const [hasSelected, setHasSelected] = useState(false);
  // Estado local para controlar qual classroom está sendo "hovered" (passando o mouse por cima)
  const [hovered, setHovered] = useState<number | null>(null);
  // Estado local para controlar se estamos editando uma classroom
  const [editingId, setEditingId] = useState<number | null>(null);
  // Estado para armazenar os dados editados de uma classroom
  const [editedData, setEditedData] = useState<Partial<Students>>({});
  const router = useRouter();

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
  const handleSave = async () => {
    if (!editingId || !editedData.matricula || !editedData.nome) {
      return;
    }

    try {
      const updateData = {
        id: parseInt(editedData.matricula.toString()),
        name: editedData.nome
      };

      await UpdateStudent(classroomId, editingId, updateData);
      
      // Limpa o estado de edição
      setEditingId(null);
      setEditedData({});
      
      // Recarrega a página para mostrar os dados atualizados
      refreshStudents();
    } catch (error: any) {
      console.error('Erro ao atualizar estudante:', error);
      alert(error.message || 'Erro ao atualizar estudante');
    }
  };

  // Função para cancelar a edição e limpar os dados
  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  // Função para lidar com a alteração de dados de uma classroom enquanto ela está sendo editada
  const handleInputChange = (field: keyof Students, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Função para iniciar a edição de um estudante
  const handleStartEdit = (student: Students) => {
    setEditingId(student.matricula);
    setEditedData({}); // Inicia com dados vazios para mostrar placeholders
  };

  const handleRowClick = (studentId: number) => {
    // Navega para a página do dossiê somente se um dossiê estiver associado
    // e se não estivermos no modo de edição para essa linha
    if (associatedDossier && editingId !== studentId) {
      router.push(`/classroom/${classroomId}/student/${studentId}/dossie/${associatedDossier.id}`);
    } else if (!associatedDossier && editingId !== studentId) {
      // Opcional: alertar o usuário que nenhum dossiê está associado
      alert("Nenhum dossiê associado a esta turma. Associe um dossiê na barra de ações.");
    }
    // Se estiver em modo de edição, o clique não faz nada para evitar navegação acidental
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
                className="w-5 h-5 accent-blue-600 cursor-pointer"
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
            <tr 
              className="text-white border-b border-gray-700"
              style={{ backgroundColor: mainColor || '#111827' }}
            >
              <td className="px-4 py-3 w-12"></td>
              <td className="w-10 px-5 py-3 text-left">
                <UserIcon className="w-6 h-6 text-gray-400" />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  value={inlineNewStudentMatricula}
                  onChange={(e) => setInlineNewStudentMatricula(e.target.value)}
                  placeholder="Matrícula"
                  className="w-[300px] p-2 rounded-md border border-gray-300 text-gray-900 bg-white relative z-10"
                  disabled={isLoading}
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={inlineNewStudentName}
                      onChange={(e) => setInlineNewStudentName(e.target.value)}
                      placeholder="Nome do Aluno"
                      className="w-[300px] p-2 rounded-md border border-gray-300 text-gray-900 bg-white relative z-10"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-green-500 hover:bg-green-600 cursor-pointer text-white px-3 py-1 rounded-md text-sm"
                      onClick={handleInlineAddStudent}
                      disabled={isLoading || !inlineNewStudentMatricula.trim() || !inlineNewStudentName.trim()}
                    >
                      Salvar
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-3 py-1 rounded-md text-sm"
                      onClick={handleCancelInlineAdd}
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
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
              onClick={() => handleRowClick(students.matricula)}
              className={`text-white transition-all duration-300 ease-in-out border-b border-gray-700
                ${hovered === students.matricula ? 'bg-opacity-40' : 'bg-opacity-20'}
                ${associatedDossier ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ backgroundColor: hovered === students.matricula ? hoverColor : mainColor }}
            >
              <td className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={students.selected}
                  onChange={() => handleToggleOne(students.matricula)}
                  onClick={(e) => e.stopPropagation()} // Impede que o clique no checkbox acione o onClick da linha
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
              </td>
              <td className="w-10 px-5 py-3 text-left">
                <FaUsers className="w-6 h-6" />
              </td>
              {editingId === students.matricula ? (
                <>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editedData.matricula || ""}
                      onChange={(e) => handleInputChange("matricula", e.target.value)}
                      placeholder={students.matricula.toString()}
                      className="w-[300px] p-2 rounded-md border border-gray-300 text-gray-900 bg-white relative z-10 placeholder-gray-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={editedData.nome || ""}
                          onChange={(e) => handleInputChange("nome", e.target.value)}
                          placeholder={students.nome}
                          className="w-[300px] p-2 rounded-md border border-gray-300 text-gray-900 bg-white relative z-10 placeholder-gray-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="bg-green-500 hover:bg-green-600 cursor-pointer text-white px-3 py-1 rounded-md text-sm"
                          onClick={handleSave}
                        >
                          Salvar
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-3 py-1 rounded-md text-sm"
                          onClick={handleCancel}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                  </td>
                </>
              ) : (
                <>
                  <td className="px-4 py-3 text-lg">{students.matricula}</td>
                  <td className="px-4 py-3 text-lg">{students.nome}</td>
                  <td className="p-2">
                    {hovered === students.matricula && (
                      <StudentActions
                        onEdit={() => handleStartEdit(students)}
                        onDelete={() => onDeleteStudent(students.matricula)}
                      />
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center -mt-6">
        <div className="mt-4">
          {hasSelected && (
            <ActionPanel
              mainColor={mainColor}
              hoverColor={hoverColor}
              onDeleted={onDeleteStudents}
              onCsvFileSelected={onCsvFileSelected}
            />
          )}
        </div>
        <PageController
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          mainColor={mainColor}
          hoverColor={hoverColor}
        />
      </div>
    </div>
  );
}
