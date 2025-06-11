"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface Professor {
  id: number;
  nome: string;
  email: string;
}

type TabType = "recent" | "archived" | null;

export default function Home() {
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabType>(null);

  useEffect(() => {
    const professorId = localStorage.getItem('professorId');
    if (professorId) {
      // Aqui tem que buscar os dados do professor usando o ID
      // Por enquanto, tá usando "Professor"
      setProfessor({
        id: parseInt(professorId),
        nome: "Professor",
        email: ""
      });
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      <div className="flex flex-col p-8 space-y-8">
        <div className="text-center mt-8">
          <h1 className="font-poppins font-semibold text-[68px] text-[#1E1E1E]">
            Bem vindo ao Luminus,{" "}
            <span className="text-[#112C3F]">{professor?.nome}</span>!
          </h1>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-[#1E1E1E] text-xl font-medium">Acesso rápido</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedTab(selectedTab === "recent" ? null : "recent")}
              className={`px-4 py-2 rounded-full border transition-all ${
                selectedTab === "recent"
                  ? "bg-[#112C3F] text-white"
                  : "bg-white text-[#1E1E1E] hover:bg-gray-100"
              }`}
            >
              Aberto recentemente
            </button>
            <button
              onClick={() => setSelectedTab(selectedTab === "archived" ? null : "archived")}
              className={`px-4 py-2 rounded-full border transition-all ${
                selectedTab === "archived"
                  ? "bg-[#112C3F] text-white"
                  : "bg-white text-[#1E1E1E] hover:bg-gray-100"
              }`}
            >
              Arquivados
            </button>
            <button
              className="px-4 py-2 rounded-full border bg-white text-[#1E1E1E] hover:bg-gray-100 transition-all"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-full max-w-3xl aspect-[16/9]">
            <Image
              src="/homiEstudando.svg"
              alt="Student studying illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center space-y-1">
            <p className="font-ag-title text-2xl text-[#1E1E1E]">
              Nenhum conteúdo recente
            </p>
            <p className="font-ag-subtitle text-lg text-[#1E1E1E]">
              Crie um novo dossiê para começar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}