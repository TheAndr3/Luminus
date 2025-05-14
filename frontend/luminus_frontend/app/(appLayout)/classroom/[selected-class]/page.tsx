"use client"

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
  
  const color = "#ec3360";
  const hoverColor = darkenHexColor(color, 25); //escurece cor para hover
  const classTitle = "Álgebra EXA 502";

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

        {/* Tabela de alunos */}
      <div className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={dossies.every((d) => d.selecionado)}
              onChange={toggleSelecionarTodos}
            />
            <span className="text-sm">Selecionar Todos</span>
          </div>

          {dossies.map((dossie) => (
            <div
              key={dossie.id}
              className="flex items-center justify-start gap-4 bg-[#101828] text-white px-6 py-3 rounded mb-2"
            >
              <input
                type="checkbox"
                checked={dossie.selecionado}
                onChange={() => toggleSelecionado(dossie.id)}
              />
              <Folder className="w-5 h-5" />
              <span className="text-sm">{dossie.nome}</span>
            </div>
          ))}
        </div>

        {/* Componente inferior destacado em verde */}
        <div className="flex justify-end mt-4 space-x-2">
          <Button className="bg-[#ec3360] text-white">🔴</Button>
          <Button className="bg-[#ec3360] text-white">🟠</Button>
          <Button className="bg-[#ec3360] text-white">🔵</Button>
        </div>
      </div>
    </div>
  );
}  