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

// Tipo das propriedades recebidas pelo componente ListClass
type ListclassroomsProps = {
  classrooms: Classroom[];                      // Lista de classrooms visíveis (já paginadas)
  toggleSelectAll: () => void;         // Função para selecionar/deselecionar todas da página atual
  toggleOne: (id: number) => void;     // Função para alternar seleção de uma classroom específica
  isAllSelected: boolean;              // Flag que indica se todas classrooms da página estão selecionadas
  currentPage: number;                 // Número da página atual
  totalPages: number;                  // Total de páginas disponíveis
  setCurrentPage: (page: number) => void; // Função para navegar entre páginas
  visualization: string                // Modo de visualização atual ('grid' ou 'list')
  setVisualization: (set: 'grid' | 'list') => void; // Função para alterar visualização

  onDeleteClass: () => void;
  toArchiveClass: () => void;

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
  // Estado que controla se há classrooms selecionadas (para mostrar o painel de ações)
  const [hasSelected, setHasSelected] = useState(false);

  // Efeito que verifica sempre que a lista de classrooms muda
  // para atualizar o estado hasSelected
  useEffect(() => {
    // Verifica se existe pelo menos uma classroom selecionada
    setHasSelected(classrooms.some(classroom => classroom.selected));
  }, [classrooms]); // Executa sempre que o array de classrooms mudar

  // Handler para selecionar/deselecionar uma classroom específica
  const handleToggleOne = (id: number) => {
    toggleOne(id); // Chama a função passada via props
  };

  // Handler para selecionar/deselecionar todas as classrooms
  const handleToggleAll = () => {
    toggleSelectAll(); // Chama a função passada via props
  };

  return (
    <div className="w-full">
      {/* Tabela que lista todas as classrooms */}
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-sm text-gray-600">
            {/* Checkbox para selecionar todas as classrooms */}
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
            <th className="px-2 text-lg">classroom</th>
            <th className="px-2 text-lg flex items-center justify-between">
              <span>Dossiê</span>
              <div className="flex gap-2">
                {/* Componente para alternar entre visualizações */}
                <ClassViewMode
                  visualization={visualization}
                  setVisualization={setVisualization}
                />
                {/* Botão para abrir modal de criação de nova classroom */}
                <DialogPage/>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {/* Mapeia cada classroom para uma linha na tabela */}
          {classrooms.map((classroom) => (
            <tr
              key={classroom.id} // Chave única para otimização do React
              className="bg-[#0A2B3D] text-white rounded px-4 py-2"
            >
              {/* Checkbox individual para cada classroom */}
              <td className="p-2 w-[50px]">
                <input
                  type="checkbox"
                  checked={!!classroom.selected} // Controlado pelo estado da classroom
                  onChange={() => handleToggleOne(classroom.id)} // Handler para seleção individual
                  className="w-6 h-6 accent-blue-600"
                />
              </td>
              {/* Ícone da classroom */}
              <td className="p-2 flex items-center">
                <Image src={class_icon} alt="icone classroom" className="w-10 h-10" />
              </td>
              {/* Dados da classroom */}
              <td className="p-2 text-xl">{classroom.disciplina}</td>
              <td className="p-2 text-xl">{classroom.codigo}</td>
              <td className="p-2 text-xl">{classroom.dossie}</td>
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

      {/* Painel de ações que aparece apenas quando há classrooms selecionadas */}
      {hasSelected && <ActionPanel onDeleted={onDeleteClass} toArchive={toArchiveClass}/>}
    </div>
  );
}