// Importação do tipo students para tipagem dos dados
import {Students} from "./types"
// Componente de controle de paginação
import PageController from "@/app/(appLayout)/classroom/[selected-class]/components/paginationController";

// Ícones
import { FaUsers } from 'react-icons/fa';
import { User as UserIcon } from 'lucide-react'; 

// Painel de ações que aparece quando studentss são selecionadas
import ActionPanel from "@/app/(appLayout)/classroom/[selected-class]/components/ActionPanel";
// Hooks do React para efeitos colaterais e estado
import { useEffect, useState } from "react";
// Componente com ações disponíveis para cada student
import StudentActions from "./StudentActions";
// Serviço para atualizar o estudante
import { UpdateStudent } from "@/services/studentService";
// Hook de navegação do Next.js
import { useRouter } from "next/navigation";

// Tipagem das props que o componente ListStudents recebe
interface ListStudentsProps {
  mainColor?: string;
  hoverColor: string;
  classroomId: number; // ID da turma atual

  students: Students[];                  // Lista de alunos visíveis (paginadas)

  toggleSelectAll: () => void;           // Seleciona/deseleciona todas da página
  toggleOne: (id: number) => void;       // Alterna a seleção de um aluno específico
  onDeleteStudents: () => void;          // Função para deletar alunos
  onDeleteStudent: (id: number) => void; // Função para deletar um aluno específico

  isAllSelected: boolean;                // Indica se todas da página estão selecionadas
  currentPage: number;                   // Página atual
  totalPages: number;                    // Total de páginas
  setCurrentPage: (page: number) => void;    // Função para trocar de página

  // Props para a linha de adição inline
  showInlineAddStudent: boolean;
  inlineNewStudentMatricula: string;
  setInlineNewStudentMatricula: (value: string) => void;
  inlineNewStudentName: string;
  setInlineNewStudentName: (value: string) => void;
  handleInlineAddStudent: () => Promise<void>; // Função para adicionar o aluno
  handleCancelInlineAdd: () => void;       // Função para cancelar a adição
  inlineAddStudentError: string | null;    // Erro da adição inline
  isLoading: boolean;                      // Estado de loading global

  onCsvFileSelected: (file: File) => void;
  
  // Prop para refresh dos alunos
  refreshStudents: () => void;
  // Prop para o dossiê associado
  associatedDossier: { id: number; name: string } | null;
};

// Componente principal que renderiza a lista de students
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

  // Props para a linha de adição inline
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
  
  // Prop para refresh dos alunos
  refreshStudents,
  associatedDossier,
}: ListStudentsProps) {

  const [hasSelected, setHasSelected] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<Partial<Students>>({});
  const router = useRouter();

  useEffect(() => {
    setHasSelected(students.some((student) => student.selected));
  }, [students]);

  const handleToggleOne = (id: number) => {
    toggleOne(id);
  };

  const handleToggleAll = () => {
    toggleSelectAll();
  };

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
      
      setEditingId(null);
      setEditedData({});
      
      refreshStudents();
    } catch (error: any) {
      console.error('Erro ao atualizar estudante:', error);
      alert(error.message || 'Erro ao atualizar estudante');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleInputChange = (field: keyof Students, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // MUDANÇA: Agora pré-preenche os dados para edição
  const handleStartEdit = (student: Students) => {
    setEditingId(student.matricula);
    setEditedData({ matricula: student.matricula, nome: student.nome });
  };

  const handleRowClick = (studentId: number) => {
    if (associatedDossier && editingId !== studentId) {
      router.push(`/classroom/${classroomId}/student/${studentId}/dossie/${associatedDossier.id}`);
    } else if (!associatedDossier && editingId !== studentId) {
      alert("Nenhum dossiê associado a esta turma. Associe um dossiê na barra de ações.");
    }
  };

  // MUDANÇA: Função para truncar o texto re-adicionada
  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <div className="w-full">
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
                  className="w-full p-2 rounded-md border border-gray-300 text-gray-900 bg-white"
                  disabled={isLoading}
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={inlineNewStudentName}
                      onChange={(e) => setInlineNewStudentName(e.target.value)}
                      placeholder="Nome do Aluno"
                      className="w-full p-2 rounded-md border border-gray-300 text-gray-900 bg-white"
                      disabled={isLoading}
                    />
                  <div className="flex gap-2 ml-3">
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
              <td className="px-4 py-3"></td>
            </tr>
          )}

          {showInlineAddStudent && inlineAddStudentError && (
            <tr className="bg-red-900/20">
              <td colSpan={5} className="px-4 py-2 text-center text-red-400 text-sm">
                {inlineAddStudentError}
              </td>
            </tr>
          )}

          {students.map((student) => (
            <tr
              key={student.matricula}
              onMouseEnter={() => setHovered(student.matricula)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleRowClick(student.matricula)}
              className={`text-white transition-all duration-300 ease-in-out border-b border-gray-700
                ${hovered === student.matricula ? 'bg-opacity-40' : 'bg-opacity-20'}
                ${associatedDossier && editingId !== student.matricula ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ backgroundColor: hovered === student.matricula ? hoverColor : mainColor }}
            >
              <td className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={!!student.selected}
                  onChange={() => handleToggleOne(student.matricula)}
                  onClick={(e) => e.stopPropagation()} 
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
              </td>
              <td className="w-10 px-5 py-3 text-left">
                <FaUsers className="w-6 h-6" />
              </td>
              {editingId === student.matricula ? (
                <>
                  <td className="px-4 py-3">
                    {/* MUDANÇA: Campo de edição pré-preenchido */}
                    <input
                      type="text"
                      value={editedData.matricula?.toString() ?? ''}
                      onChange={(e) => handleInputChange("matricula", e.target.value)}
                      placeholder="Matrícula do aluno"
                      className="w-full p-2 rounded-md border border-gray-300 text-gray-900 bg-white"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* MUDANÇA: Campo de edição pré-preenchido */}
                        <input
                          type="text"
                          value={editedData.nome ?? ''}
                          onChange={(e) => handleInputChange("nome", e.target.value)}
                          placeholder="Nome do aluno"
                          className="w-full p-2 rounded-md border border-gray-300 text-gray-900 bg-white"
                        />
                      <div className="flex gap-2 ml-3">
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
                  <td className="px-4 py-3"></td>
                </>
              ) : (
                <>
                  <td className="px-4 py-3 text-lg">{student.matricula}</td>
                  {/* MUDANÇA: Nome do aluno é truncado */}
                  <td className="px-4 py-3 text-lg" title={student.nome}>
                    {truncateText(student.nome, 30)}
                  </td>
                  <td className="p-2">
                    {hovered === student.matricula && (
                      <StudentActions
                        onEdit={() => handleStartEdit(student)}
                        onDelete={() => onDeleteStudent(student.matricula)}
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