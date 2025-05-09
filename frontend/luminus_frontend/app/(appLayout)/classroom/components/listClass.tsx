// Importa o tipo Turma para tipagem dos dados
import { Turma } from "@/app/(appLayout)/classroom/components/types";
// Importa o componente responsável por abrir o modal de criação de turmas
import DialogPage from "./createClassModal";
import PageController from "./paginationController";
import ClassViewMode from "./classViewMode";

// Define o tipo das props recebidas pelo componente ListClass
type ListTurmasProps = {
  turmas: Turma[];                      // Lista de turmas visíveis (paginadas)
  toggleSelectAll: () => void;         // Função para selecionar/deselecionar todas da página
  toggleOne: (id: number) => void;     // Função para alternar a seleção de uma turma específica
  isAllSelected: boolean;              // Indica se todas as turmas da página estão selecionadas
  currentPage: number;                 // Página atual
  totalPages: number;                  // Número total de páginas
  setCurrentPage: (page: number) => void; // Função para mudar a página

  visualization: string
  setVisualization:  (set: 'grid' | 'list') => void;
};

// Componente principal da tabela de turmas
export default function ListClass({
  turmas,
  toggleSelectAll,
  toggleOne,
  isAllSelected,
  currentPage,
  totalPages,
  setCurrentPage,
  visualization,
  setVisualization
}: ListTurmasProps) {
  return (
    <div className="w-full">
      {/* Tabela de turmas */}
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-sm text-gray-600">
            {/* Checkbox que seleciona todas as turmas da página atual */}
            <th className="w-[0px] px-2">
              <input
                type="checkbox"
                onChange={toggleSelectAll}
                checked={!!isAllSelected} // Cast para booleano
                className="w-6 h-6 accent-blue-600"
              />
            </th>
            <th className="px-2 text-lg">Disciplina</th>
            <th className="px-2 text-lg">Turma</th>
            <th className="px-2 text-lg flex items-center justify-between">
              <span>Dossiê</span>

              <div className="flex gap-2">
              
                {/*Renderização tipo de visualização das turmas (lista ou grade) */}
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
                  className="w-6 h-6 accent-blue-600"
                />
              </td>
              {/* Dados da turma */}
              <td className="p-3 text-2xl">{turma.disciplina}</td>
              <td className="p-2 text-2xl">{turma.codigo}</td>
              <td className="p-2 text-2xl">{turma.dossie}</td>
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
