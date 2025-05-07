// Importa o tipo Turma para tipagem dos dados
import { Turma } from "@/app/(appLayout)/class-/components/types";
// Importa o componente responsável por abrir o modal de criação de turmas
import DialogPage from "./createClassModal";
import PageController from "./paginationController";

// Define o tipo das props recebidas pelo componente ListClass
type ListTurmasProps = {
  turmas: Turma[];                      // Lista de turmas visíveis (paginadas)
  toggleSelectAll: () => void;         // Função para selecionar/deselecionar todas da página
  toggleOne: (id: number) => void;     // Função para alternar a seleção de uma turma específica
  isAllSelected: boolean;              // Indica se todas as turmas da página estão selecionadas
  currentPage: number;                 // Página atual
  totalPages: number;                  // Número total de páginas
  setCurrentPage: (page: number) => void; // Função para mudar a página
};

// Componente principal da tabela de turmas
export default function ListClass({
  turmas,
  toggleSelectAll,
  toggleOne,
  isAllSelected,
  currentPage,
  totalPages,
  setCurrentPage
}: ListTurmasProps) {
  return (
    <div className="w-full">
      {/* Tabela de turmas */}
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-sm text-gray-600">
            {/* Checkbox que seleciona todas as turmas da página atual */}
            <th className="w-[50px] px-2">
              <input
                type="checkbox"
                onChange={toggleSelectAll}
                checked={!!isAllSelected} // Cast para booleano
              />
            </th>
            <th className="px-2">Disciplina</th>
            <th className="px-2">Turma</th>
            <th className="px-2 flex items-center justify-between">
              <span>Dossiê</span>
              <DialogPage /> {/* Botão/modal para criar nova turma */}
            </th>
          </tr>
        </thead>

        <tbody>
          {turmas.map((turma) => (
            <tr
              key={turma.id}
              className="bg-[#0A2B3D] text-white rounded px-4 py-2"
            >
              {/* Checkbox individual da turma */}
              <td className="p-2 w-[50px]">
                <input
                  type="checkbox"
                  checked={!!turma.selected}
                  onChange={() => toggleOne(turma.id)} // Alterna seleção
                />
              </td>
              {/* Dados da turma */}
              <td className="p-4">{turma.disciplina}</td>
              <td className="p-2">{turma.codigo}</td>
              <td className="p-2">{turma.dossie}</td>
            </tr>
          ))}
        </tbody>
      </table>

     {/* Renderização do paginationController*/}
           <PageController
             currentPage={currentPage}
             totalPages={totalPages}
             setCurrentPage={setCurrentPage}
           />
    </div>
  );
}
