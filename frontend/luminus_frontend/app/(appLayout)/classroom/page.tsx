"use client" // Habilita o uso de recursos do lado do cliente (ex: useState) no Next.js 13+

// Importa o componente da lista de turmas
import ListClass from "./components/listClass";
// Importa o tipo Turma para tipar os dados corretamente
import { Classroom } from "@/app/(appLayout)/classroom/components/types";
// Importa o hook useState para controle de estado
import { useState } from "react";
import GridClass from "./components/gridClass";
import { LayoutGrid, Menu } from "lucide-react";
import ClassViewMode from "./components/classViewMode";
import { BaseInput } from "@/components/inputs/BaseInput";
import { ConfirmDeleteDialog } from "./components/ConfirmDeleteDialog";

import {ArchiveConfirmation} from "./components/archiveConfirmation"


export default function VizualizationClass() {
  // Cria uma lista fictícia com 30 turmas para simular os dados (mock)
  const mockClass: Classroom[] = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    disciplina: 'Matematica',
    codigo: `EXA502 - TP${i + 1}`,
    dossie: `Dossiê Turma ${i + 1}`,
    selected: false, // Inicia como não selecionada
  }));
  

  // Estado que controla o modo de visualização (lista ou grade)
  const [visualization, setVisualization] = useState<'grid' | 'list'>('list');

  // Estado que armazena todas as turmas (com seleção)
  const [classi, setClassi] = useState(mockClass);

  // Estado que controla qual página está sendo exibida
  const [currentPage, setCurrentPage] = useState(1);

  // Quantas turmas serão exibidas por página
  const turmasPorPagina = visualization === 'grid' ? 8 : 6;


  // Cálculo do total de páginas baseado na quantidade de turmas
  const totalPages = Math.ceil(classi.length / turmasPorPagina);

  // Índice inicial para cortar a lista de turmas visíveis da página atual
  const startIndex = (currentPage - 1) * turmasPorPagina;

  // Fatia a lista de turmas de acordo com a página atual
  const turmasVisiveis = classi.slice(startIndex, startIndex + turmasPorPagina);

  // Verifica se todas as turmas visíveis estão selecionadas
  const isAllSelected = turmasVisiveis.every((t) => t.selected);


  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<number[]>([]);


  const [archiveConfirmation, setarchiveConfirmation] = useState(false)
  const [idsToArchive, setIdsToArchive] = useState<number[]>([]);

  const [titleClass, setTitleClass] = useState<string | undefined>(undefined);

  const [classDescription, setClassDescription] = useState("")
  const [codeClass, setCodeClass] = useState<string | undefined>(undefined);





  // Alterna a seleção de todas as turmas da página atual
  const toggleSelectAll = () => {
    const newSelected = !isAllSelected; // Inverte o estado atual
    const novaLista = classi.map((turma, index) => {
      if (index >= startIndex && index < startIndex + turmasPorPagina) {
        return { ...turma, selected: newSelected }; // Atualiza apenas as visíveis
      }
      return turma; // Mantém as outras inalteradas
    });
    setClassi(novaLista); // Atualiza o estado com a nova lista
  };


        // Função para preparar a exclusão de turmas selecionadas
    const handleDeleteClass = async () => {
        // Filtra as turmas selecionadas e mapeia apenas os IDs
        const selecionadas = classi.filter(turma => turma.selected).map(turma => turma.id);

        // Se não houver turmas selecionadas, sai da função
        if (selecionadas.length === 0) return;

        // Atualiza o estado com os IDs das turmas a serem excluídas
        setIdsToDelete(selecionadas);
        // Abre o modal de confirmação
        setConfirmOpen(true);
    };
    
    const confirmDeletion = async () => {
        try {
            // Log dos IDs que serão excluídos (para debug)
            console.log("Excluir:", idsToDelete);
            
            // Atualiza o estado removendo as turmas com IDs selecionados
            setClassi(prev => prev.filter(turma => !idsToDelete.includes(turma.id)));

            // Verifica se a página atual ficaria vazia após a exclusão
            // Caso positivo, retorna para a primeira página
            if (currentPage > Math.ceil((classi.length - idsToDelete.length) / turmasPorPagina)) {
                setCurrentPage(1);
            }
        } catch (error) {
            // Tratamento de erro genérico
            console.error("Erro ao excluir turmas:", error);
            alert("Erro ao excluir.");
        } finally {
            // Fecha o modal de confirmação independentemente de sucesso ou falha
            setConfirmOpen(false);
        }
    };

    const archiveHandle = async () => {
      // Filtra as turmas selecionadas e mapeia apenas os IDs
        const selecionadas = classi.filter(turma => turma.selected).map(turma => turma.id);

        // Se não houver turmas selecionadas, sai da função
        if (selecionadas.length === 0) return;

        if (selecionadas.length === 1) {
          const turmaSelecionada = classi.find(turma => turma.id === selecionadas[0]);

          setTitleClass(turmaSelecionada?.disciplina);
          setCodeClass(turmaSelecionada?.codigo);
          setClassDescription("Tem certeza que deseja arquivar a turma: ");
        } else {
          setTitleClass(undefined);
          setCodeClass(undefined);
          setClassDescription("Tem certeza que deseja arquivar as turmas selecionadas?"); 
        }

        // Atualiza o estado com os IDs das turmas a serem arquivadas
        setIdsToArchive(selecionadas);
        // Abre o modal de confirmação
        setarchiveConfirmation(true);
    }


  // Alterna a seleção individual de uma turma
  const toggleOne = (id: number) => {
    setClassi((prev) =>
      prev.map((turma) =>
        turma.id === id ? { ...turma, selected: !turma.selected } : turma
      )
    );
  };

  // Filtro para buscar turmas
  const [searchTerm, setSearchTerm] = useState(""); // Estado para armazenar o termo de busca

  const filteredClasses = turmasVisiveis.filter((turma) =>
    turma.dossie.toLowerCase().includes(searchTerm.toLowerCase()) || 
    turma.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.disciplina.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-center mt-5 w-full ml-auto ">
        <h1 className="text-4xl font-bold"> Turmas </h1>
      </div>

      {/* Filtro e controles */}
      <div className="flex justify-center items-center mb-4">
        <BaseInput
          type="text"
          placeholder="Procure pela turma"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-250"
        ></BaseInput>
      </div>



      {/* Renderização visualização de Lista */}
      {visualization === 'list' && (
        <div className="px-10 flex items-center justify-center mt-10 ml-auto">
          <ListClass
            classrooms={filteredClasses} // Aplica o filtro de busca nas turmas visíveis
            toggleSelectAll={toggleSelectAll}
            toggleOne={toggleOne}
            isAllSelected={isAllSelected}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            visualization={visualization}
            setVisualization={setVisualization}

            onDeleteClass={handleDeleteClass}
            toArchiveClass={archiveHandle}
          />
        </div>
      )}

      {/* Rederização visualização de Grade */}
      {visualization === 'grid' && (
        <div className="px-10 flex items-center justify-center mt-10 ml-auto">
          <GridClass
            classrooms={filteredClasses} // Aplica o filtro de busca nas turmas visíveis
            toggleSelectAll={toggleSelectAll}
            toggleOne={toggleOne}
            isAllSelected={isAllSelected}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}

            visualization={visualization}
            setVisualization={setVisualization}

            onDeleteClass={handleDeleteClass}
            toArchiveClass={archiveHandle}

          />

          ))
        </div>
      )}
      <ConfirmDeleteDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDeletion}
        total={idsToDelete.length}
      />

      <ArchiveConfirmation
        open={archiveConfirmation}
        onCancel={() => setarchiveConfirmation(false)}
        onConfirm={archiveHandle}
        total={idsToArchive.length}
        title={titleClass}
        code={codeClass}
        description={classDescription}
      />

        
      
    </div>
  );
}
