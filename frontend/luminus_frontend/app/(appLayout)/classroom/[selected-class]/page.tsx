"use client"

// Componentes e tipos
import ListStudents from "./components/listStudents";
import { Classroom } from "@/app/(appLayout)/classroom/components/types";
import React from 'react';
import { Button } from "@/components/ui/button";
import { darkenHexColor } from '@/utils/colorHover';
import { BaseInput } from "@/components/inputs/BaseInput";
import { Header } from "./components/Header";
import { ActionBar} from "./components/Action-bar";
import { Folder, User, ClipboardEdit, Plus } from "lucide-react";
import styles from './selected-classroom.module.css'; // Importa estilos CSS Modules específicos para esta página

import { useState } from 'react';

interface Dossie {
  id: number;
  nome: string;
  selecionado: boolean;
}




export default function VisualizacaoAlunos() {


  /*LÓGICA PARA GET E SET DE CORES*/
  
  const color = "#ec3360"// #df355f;#2c76e6"//
  const hoverColor = darkenHexColor(color, 25); //escurece cor para hover
  const classTitle = "Álgebra EXA 502";

  // ============ ESTADOS ============
  // Mock de dados - DEVERIA SER SUBSTITUÍDO POR CHAMADA API
  const mockClass: Classroom[] = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    disciplina: 'Matematica',
    codigo: `EXA502 - TP${i + 1}`,
    dossie: `Dossiê Turma ${i + 1}`,
    selected: false,
  }));
  
  const [visualization, setVisualization] = useState<'grid' | 'list'>('list'); // Modo de visualização
  const [classi, setClassi] = useState(mockClass); // Lista de turmas
  const [currentPage, setCurrentPage] = useState(1); // Paginação
  const turmasPorPagina = visualization === 'grid' ? 8 : 6; // Itens por página
  const [confirmOpen, setConfirmOpen] = useState(false); // Controle do modal de delete
  const [idsToDelete, setIdsToDelete] = useState<number[]>([]); // IDs para deletar
  const [archiveConfirmation, setarchiveConfirmation] = useState(false) // Modal de arquivamento
  const [idsToArchive, setIdsToArchive] = useState<number[]>([]); // IDs para arquivar
  const [titleClass, setTitleClass] = useState<string | undefined>(undefined); // Info da turma
  const [classDescription, setClassDescription] = useState("") // Descrição para modal
  const [codeClass, setCodeClass] = useState<string | undefined>(undefined); // Código da turma
  const [searchTerm, setSearchTerm] = useState(""); // Termo de busca
  

  // ============ CÁLCULOS DERIVADOS ============
  const totalPages = Math.ceil(classi.length / turmasPorPagina);
  const startIndex = (currentPage - 1) * turmasPorPagina;
  const turmasVisiveis = classi.slice(startIndex, startIndex + turmasPorPagina);
  const isAllSelected = turmasVisiveis.every((t) => t.selected);
  const filteredClasses = turmasVisiveis.filter((turma) =>
    turma.dossie.toLowerCase().includes(searchTerm.toLowerCase()) || 
    turma.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.disciplina.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============ FUNÇÕES ============
  // Alterna seleção de todas as turmas visíveis
  const toggleSelectAll = () => {
    const newSelected = !isAllSelected;
    const novaLista = classi.map((turma, index) => {
      if (index >= startIndex && index < startIndex + turmasPorPagina) {
        return { ...turma, selected: newSelected };
      }
      return turma;
    });
    setClassi(novaLista);
  };

  // Alterna seleção individual
  const toggleOne = (id: number) => {
    setClassi((prev) =>
      prev.map((turma) =>
        turma.id === id ? { ...turma, selected: !turma.selected } : turma
      )
    );
  };

  // ============ CHAMADAS À API (FALTANTES) ============
  // 1. Aqui deveria ter uma chamada para carregar as turmas inicialmente
  // useEffect(() => {
  //   const fetchTurmas = async () => {
  //     const response = await fetch('/api/turmas');
  //     const data = await response.json();
  //     setClassi(data);
  //   };
  //   fetchTurmas();
  // }, []);

  // Prepara turmas para exclusão
  const handleDeleteClass = async () => {
    const selecionadas = classi.filter(turma => turma.selected).map(turma => turma.id);
    if (selecionadas.length === 0) return;
    setIdsToDelete(selecionadas);
    setConfirmOpen(true);
  };
  
  // 2. Aqui deveria ter a chamada real para a API de exclusão
  const confirmDeletion = async () => {
    try {
      console.log("Excluir:", idsToDelete);
      
      // CHAMADA À API FALTANTE:
      // await fetch('/api/turmas/delete', {
      //   method: 'POST',
      //   body: JSON.stringify({ ids: idsToDelete }),
      //   headers: { 'Content-Type': 'application/json' }
      // });

      // Atualização otimista do estado
      setClassi(prev => prev.filter(turma => !idsToDelete.includes(turma.id)));

      if (currentPage > Math.ceil((classi.length - idsToDelete.length) / turmasPorPagina)) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Erro ao excluir turmas:", error);
      alert("Erro ao excluir.");
    } finally {
      setConfirmOpen(false);
    }
  };

  // Prepara turmas para arquivamento
  const archiveHandle = async () => {
    const selecionadas = classi.filter(turma => turma.selected).map(turma => turma.id);
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

    setIdsToArchive(selecionadas);
    setarchiveConfirmation(true);
  }


  const [dossies, setDossies] = useState<Dossie[]>(
    Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      nome: `Dossiê ${i + 1}`,
      selecionado: false,
    }))
  );

  const toggleSelecionado = (id: number) => {
    setDossies((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, selecionado: !d.selecionado } : d
      )
    );
  };

  const toggleSelecionarTodos = () => {
    const todosSelecionados = dossies.every((d) => d.selecionado);
    setDossies((prev) =>
      prev.map((d) => ({ ...d, selecionado: !todosSelecionados }))
    );
  };


  return (
    <div className={styles.pageContainer}>

      {/* Main content */}
      <div className="flex-1 bg-white p-4">

        {/* Header */}
        <Header title={classTitle} mainColor={color} hoverColor = {hoverColor} />

        {/* Barra de ação */}
        <ActionBar mainColor={color} hoverColor = {hoverColor}/>

        <div className="px-10 flex items-center justify-center mt-10 ml-auto">
          <ListStudents
            students={filteredClasses}
            toggleSelectAll={toggleSelectAll}
            toggleOne={toggleOne}
            onDeleteStudents={handleDeleteClass}
            isAllSelected={isAllSelected}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}  