"use client"

import ListClass from "./components/listClass";
import { Classroom } from "@/app/(appLayout)/classroom/components/types";
import { useState, useEffect, useRef } from "react";
import GridClass from "./components/gridClass";
import { BaseInput } from "@/components/inputs/BaseInput";
import { ConfirmDeleteDialog } from "./components/ConfirmDeleteDialog";
import { ErroMessageDialog } from "./components/erroMessageDialog";
import { ListClassroom, GetClassroomResponse, DeleteClassroom } from "@/services/classroomServices";
import DialogPage from "./components/createClassModal";
import toast from 'react-hot-toast';
import Loading from '@/components/ui/loading';

export default function VizualizationClass() {
  const [visualization, setVisualization] = useState<'grid' | 'list'>('grid');
  const [classi, setClassi] = useState<Classroom[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const turmasPorPagina = 6;
  const [totalItems, setTotalItems] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [missingDialog, setMissingDialog] = useState(false);
  const [messageErro, setMessageErro] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedVisualization = localStorage.getItem('classVisualization') as 'grid' | 'list' | null;
    if (savedVisualization) {
      setVisualization(savedVisualization);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('classVisualization', visualization);
  }, [visualization]);

  const totalPages = Math.ceil(totalItems / turmasPorPagina);
  const isAllSelected = classi.length > 0 && classi.every((t) => t.selected);
  const filteredClasses = classi;

  const fetchTurmas = async (searchValue = searchTerm) => {
    try {
      setIsLoading(true);
      const professorId = localStorage.getItem('professorId');
      if (!professorId) {
        throw new Error('ID do professor não encontrado');
      }
      const start = (currentPage - 1) * turmasPorPagina;
      const response = await ListClassroom(Number(professorId), start, turmasPorPagina, searchValue);
      const turmasFormatadas = response.data.map((turma: GetClassroomResponse) => ({
        id: turma.id,
        disciplina: turma.name,
        codigo: turma.season,
        dossie: turma.description,
        institution: turma.institution,
        selected: false
      }));
      setClassi(turmasFormatadas);
      setTotalItems(response.ammount);
    } catch (error: unknown) {
      let errorMessage = "Erro ao carregar turmas";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setMessageErro(errorMessage);
      setMissingDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTurmas();
    // eslint-disable-next-line
  }, [currentPage]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchTurmas(value);
    }, 400);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleSelectAll = () => {
    const newSelected = !isAllSelected;
    const novaLista = classi.map((turma) => ({
      ...turma,
      selected: newSelected
    }));
    setClassi(novaLista);
  };

  const toggleOne = (id: number) => {
    setClassi((prev) =>
      prev.map((turma) =>
        turma.id === id ? { ...turma, selected: !turma.selected } : turma
      )
    );
  };

  const handleDeleteClass = async () => {
    const selecionadas = classi.filter(turma => turma.selected).map(turma => turma.id);
    if (selecionadas.length === 0) return;
    setIdsToDelete(selecionadas);
    setConfirmOpen(true);
  };
  
  const confirmDeletion = async () => {
    try {
      setIsLoading(true);
      const professorId = localStorage.getItem('professorId');
      if (!professorId) {
        throw new Error('ID do professor não autenticado.');
      }
      for (const id of idsToDelete) {
        await DeleteClassroom(id, Number(professorId));
      }
      toast.success(`${idsToDelete.length} turma(s) deletada(s) com sucesso!`);
      
      const remainingItems = totalItems - idsToDelete.length;
      const newTotalPages = Math.ceil(remainingItems / turmasPorPagina);
      
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else {
        await fetchTurmas();
      }

    } catch (error: unknown) {
      let errorMessage = "Erro ao excluir turmas";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Erro ao excluir turmas:", errorMessage);
      setMessageErro(errorMessage);
      setMissingDialog(true);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setConfirmOpen(false);
      setIdsToDelete([]);
    }
  };


  const handleExportClass = () => {
    const selectedClasses = classi.filter(turma => turma.selected);
    if (selectedClasses.length === 0) {
      setMessageErro("Selecione pelo menos uma turma para exportar");
      setMissingDialog(true);
      return;
    }
    const headers = ["ID", "Disciplina", "Código", "Dossiê", "Instituição"];
    const csvContent = [
      headers.join(","),
      ...selectedClasses.map(turma => [
        turma.id,
        `"${turma.disciplina.replace(/"/g, '""')}"`,
        `"${turma.codigo.replace(/"/g, '""')}"`,
        `"${(turma.dossie || '').replace(/"/g, '""')}"`,
        `"${(turma.institution || '').replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "turmas_exportadas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex items-center justify-center mt-5 w-full ml-auto ">
        <h1 className="text-4xl font-bold"> Turmas </h1>
      </div>

      <div className="flex justify-center items-center my-[2vh] mb-[4vh]">
        <BaseInput
          type="text"
          placeholder="Procure pela turma"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="border bg-[#F5F5F5] border-[#B3B3B3] rounded-full w-[40vw] px-[2vh] py-[1vh] text-[1.5vh]"
        />
      </div>

      {/* Removed duplicate select all and create classroom buttons since they exist in GridClass and ListClass components */}

        <Loading isLoading={isLoading}>
          {filteredClasses.length === 0 ? (
            <div className="text-center p-10">
              <p className="text-xl text-gray-600 mb-4">Nenhuma turma encontrada.</p>
              <DialogPage />
            </div>
          ) : visualization === 'list' ? (
            <div className="px-[6vh] flex items-center justify-center mt-10 ml-auto">
              <ListClass
                classrooms={filteredClasses}
                toggleSelectAll={toggleSelectAll}
                toggleOne={toggleOne}
                isAllSelected={isAllSelected}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={handlePageChange}
                visualization={visualization}
                setVisualization={setVisualization}
                onDeleteClass={handleDeleteClass}
                toExportClass={handleExportClass}
              />
            </div>
          ) : (
            <div className="px-[7vh] flex items-center justify-center mt-10 ml-auto">
              <GridClass
                classrooms={filteredClasses}
                toggleSelectAll={toggleSelectAll}
                toggleOne={toggleOne}
                isAllSelected={isAllSelected}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={handlePageChange}
                visualization={visualization}
                setVisualization={setVisualization}
                onDeleteClass={handleDeleteClass}
                toExportClass={handleExportClass}
              />
            </div>
          )}
        </Loading>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDeletion}
        total={idsToDelete.length}
        type="classroom"
      />

      <ErroMessageDialog
        open={missingDialog}
        onConfirm={() => setMissingDialog(false)}
        description={messageErro}
      />
    </div>
  );
}