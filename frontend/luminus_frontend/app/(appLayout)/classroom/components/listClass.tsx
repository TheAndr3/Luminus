// Importação do tipo Turma para tipagem dos dados
import { Turma } from "@/app/(appLayout)/classroom/components/types";
// Componente para o modal de criação de turmas
import DialogPage from "./createClassModal";
// Componente de controle de paginação
import PageController from "./paginationController";
// Componente para alternar entre visualização em lista ou grade
import ClassViewMode from "./classViewMode";

// Ícone padrão para as turmas
import class_icon from "@/components/icon/icon_turma.svg"

// Componente de imagem otimizada do Next.js
import Image from "next/image";
// Painel de ações que aparece quando turmas são selecionadas
import ActionPanel from "./actionPainel";
// Hooks do React para efeitos colaterais e estado
import { useEffect, useState } from "react";

// Tipo das propriedades recebidas pelo componente ListClass
type ListTurmasProps = {
  turmas: Turma[];                      // Lista de turmas visíveis (já paginadas)
  toggleSelectAll: () => void;         // Função para selecionar/deselecionar todas da página atual
  toggleOne: (id: number) => void;     // Função para alternar seleção de uma turma específica
  isAllSelected: boolean;              // Flag que indica se todas turmas da página estão selecionadas
  currentPage: number;                 // Número da página atual
  totalPages: number;                  // Total de páginas disponíveis
  setCurrentPage: (page: number) => void; // Função para navegar entre páginas
  visualization: string                // Modo de visualização atual ('grid' ou 'list')
  setVisualization: (set: 'grid' | 'list') => void; // Função para alterar visualização

  onDeleteClass: () => void;

};

// Componente principal que renderiza a lista de turmas
export default function ListClass({
  turmas,
  toggleSelectAll,
  toggleOne,
  isAllSelected,
  currentPage,
  totalPages,
  setCurrentPage,
  visualization,
  setVisualization,
  onDeleteClass
}: ListTurmasProps) {
  // Estado que controla se há turmas selecionadas (para mostrar o painel de ações)
  const [hasSelected, setHasSelected] = useState(false);

  // Efeito que verifica sempre que a lista de turmas muda
  // para atualizar o estado hasSelected
  useEffect(() => {
    // Verifica se existe pelo menos uma turma selecionada
    setHasSelected(turmas.some(turma => turma.selected));
  }, [turmas]); // Executa sempre que o array de turmas mudar

  // Handler para selecionar/deselecionar uma turma específica
  const handleToggleOne = (id: number) => {
    toggleOne(id); // Chama a função passada via props
  };

  // Handler para selecionar/deselecionar todas as turmas
  const handleToggleAll = () => {
    toggleSelectAll(); // Chama a função passada via props
  };

  return (
    <div className="w-full">
      {/* Tabela que lista todas as turmas */}
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-sm text-gray-600">
            {/* Checkbox para selecionar todas as turmas */}
            <th className="w-[0px] px-2">
              <input
                type="checkbox"
                onChange={handleToggleAll} // Handler para seleção total
                checked={!!isAllSelected} // Controlado pelo estado
                className="w-6 h-6 accent-blue-600"
              />
            </th>
            <th className="px-2 text-lg">Selecionar todos</th>
            <th className="px-2 text-lg">Disciplina</th>
            <th className="px-2 text-lg">Turma</th>
            <th className="px-2 text-lg flex items-center justify-between">
              <span>Dossiê</span>
              <div className="flex gap-2">
                {/* Componente para alternar entre visualizações */}
                <ClassViewMode
                  visualization={visualization}
                  setVisualization={setVisualization}
                />
                {/* Botão para abrir modal de criação de nova turma */}
                <DialogPage/>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {/* Mapeia cada turma para uma linha na tabela */}
          {turmas.map((turma) => (
            <tr
              key={turma.id} // Chave única para otimização do React
              className="bg-[#0A2B3D] text-white rounded px-4 py-2"
            >
              {/* Checkbox individual para cada turma */}
              <td className="p-2 w-[50px]">
                <input
                  type="checkbox"
                  checked={!!turma.selected} // Controlado pelo estado da turma
                  onChange={() => handleToggleOne(turma.id)} // Handler para seleção individual
                  className="w-6 h-6 accent-blue-600"
                />
              </td>
              {/* Ícone da turma */}
              <td className="p-2 flex items-center">
                <Image src={class_icon} alt="icone turma" className="w-10 h-10" />
              </td>
              {/* Dados da turma */}
              <td className="p-2 text-xl">{turma.disciplina}</td>
              <td className="p-2 text-xl">{turma.codigo}</td>
              <td className="p-2 text-xl">{turma.dossie}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Componente de paginação */}
      <PageController
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      {/* Painel de ações que aparece apenas quando há turmas selecionadas */}
      {hasSelected && <ActionPanel onDeleted={onDeleteClass}/>}
    </div>
  );
}