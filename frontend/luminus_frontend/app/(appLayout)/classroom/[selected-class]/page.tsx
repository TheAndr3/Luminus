"use client"

// Componentes e tipos
import ListStudents from "./components/listStudents";
import { Students } from "@/app/(appLayout)/classroom/[selected-class]/components/types";
import React from 'react';
import { Button } from "@/components/ui/button";
import { darkenHexColor } from '@/utils/colorHover';
import { BaseInput } from "@/components/inputs/BaseInput";
import { Header } from "./components/Header";
import { ActionBar} from "./components/Action-bar";
import { Folder, User, ClipboardEdit, Plus } from "lucide-react";
import styles from './selected-classroom.module.css'; // Importa estilos CSS Modules específicos para esta página

import { useState } from 'react';


export default function VisualizacaoAlunos() {


  /*LÓGICA PARA GET E SET DE CORES*/
  
  const color = "#ec3360"// #df355f;#2c76e6"//
  const hoverColor = darkenHexColor(color, 25); //escurece cor para hover
  const classTitle = "Álgebra EXA 502";

  // ============ ESTADOS ============
  // Mock de dados - DEVERIA SER SUBSTITUÍDO POR CHAMADA API
  const mockStudents: Students[] = Array.from({ length: 30 }, (_, i) => ({
    matricula: i,
    nome: 'Renato e Mirian',
    selected: false,
  }));
  
  const [visualization, setVisualization] = useState<'grid' | 'list'>('list'); // Modo de visualização
  const [classi, setClassi] = useState(mockStudents); // Lista de turmas
  const [currentPage, setCurrentPage] = useState(1); // Paginação
  const alunosPorPagina = 6; // Itens por página
  const [confirmOpen, setConfirmOpen] = useState(false); // Controle do modal de delete
  const [idsToDelete, setIdsToDelete] = useState<number[]>([]); // IDs para deletar
  const [archiveConfirmation, setarchiveConfirmation] = useState(false) // Modal de arquivamento
  const [idsToArchive, setIdsToArchive] = useState<number[]>([]); // IDs para arquivar
  const [titleClass, setTitleClass] = useState<string | undefined>(undefined); // Info da turma
  const [classDescription, setClassDescription] = useState("") // Descrição para modal
  const [codeClass, setCodeClass] = useState<string | undefined>(undefined); // Código da turma
  const [searchTerm, setSearchTerm] = useState(""); // Termo de busca
  

  // ============ CÁLCULOS DERIVADOS ============
  const totalPages = Math.ceil(classi.length / alunosPorPagina);
  const startIndex = (currentPage - 1) * alunosPorPagina;
  const alunosVisiveis = classi.slice(startIndex, startIndex + alunosPorPagina);
  const isAllSelected = alunosVisiveis.every((t) => t.selected);
  const filteredClasses = alunosVisiveis.filter((aluno) =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============ FUNÇÕES ============
  // Alterna seleção de todas as turmas visíveis
  const toggleSelectAll = () => {
    const newSelected = !isAllSelected;
    const novaLista = classi.map((aluno, index) => {
      if (index >= startIndex && index < startIndex + alunosPorPagina) {
        return { ...aluno, selected: newSelected };
      }
      return aluno;
    });
    setClassi(novaLista);
  };

  // Alterna seleção individual
  const toggleOne = (id: number) => {
    setClassi((prev) =>
      prev.map((aluno) =>
        aluno.matricula === id ? { ...aluno, selected: !aluno.selected } : aluno
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
  const handleDeleteStudent = async () => {
    const selecionadas = classi.filter(aluno => aluno.selected).map(aluno => aluno.matricula);
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
      setClassi(prev => prev.filter(aluno => !idsToDelete.includes(aluno.matricula)));

      if (currentPage > Math.ceil((classi.length - idsToDelete.length) / alunosPorPagina)) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Erro ao excluir alunos:", error);
      alert("Erro ao excluir.");
    } finally {
      setConfirmOpen(false);
    }
  };


  return (
    <div className={styles.pageContainer}>

      {/* Main content */}
      <div className="flex-1 bg-white px-1">

        {/* Header */}
        <Header title={classTitle} mainColor={color} hoverColor = {hoverColor} />

        {/* Barra de ação */}
        <ActionBar mainColor={color} hoverColor = {hoverColor}/>

        <div className="px-10 flex items-center justify-center mt-10 ml-auto">
          <ListStudents
            students={filteredClasses}
            toggleSelectAll={toggleSelectAll}
            toggleOne={toggleOne}
            onDeleteStudents={handleDeleteStudent}
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