"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { GetProfile } from '@/services/professorService';

interface Professor {
  id: number;
  name: string;
  email: string;
  role: string;
}

type TabType = "recent" | "archived" | null;

export default function Home() {
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabType>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfessorData = async () => {
      try {
        const professorId = localStorage.getItem('professorId');
        if (professorId) {
          const userData = await GetProfile(parseInt(professorId));
          setProfessor(userData);
        }
      } catch (error) {
        console.error('Home page - Error fetching professor data:', error);
        setProfessor({
          id: 0,
          name: "Usuário",
          email: "",
          role: ""
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfessorData();
  }, []);

  return (
    <div className="flex flex-col bg-white min-h-0">
      <div className="flex flex-col px-4 pt-3 pb-4 flex-1 overflow-hidden">

        {/* TÍTULO */}
        <div className="text-center mb-4 flex-shrink-0">
          <h1 className="font-poppins font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#1E1E1E] leading-tight">
            Bem vindo ao Luminus,{" "}
            <span className="text-[#112C3F]">{professor?.name}</span>!
          </h1>
        </div>

        {/* ACESSO RÁPIDO
        <div className="flex flex-col pl-4 flex-shrink-0 mb-1">
        
          <div className="flex gap-2 flex-wrap mt-1">
            <button
              onClick={() => setSelectedTab(selectedTab === "recent" ? null : "recent")}
              className={`px-4 py-2 rounded-full border transition-all text-sm md:text-base ${
                selectedTab === "recent"
                  ? "bg-[#112C3F] text-white"
                  : "bg-white text-[#1E1E1E] hover:bg-gray-100"
              }`}
            >
              Aberto recentemente
            </button>
            <button
              onClick={() => setSelectedTab(selectedTab === "archived" ? null : "archived")}
              className={`px-4 py-2 rounded-full border transition-all text-sm md:text-base ${
                selectedTab === "archived"
                  ? "bg-[#112C3F] text-white"
                  : "bg-white text-[#1E1E1E] hover:bg-gray-100"
              }`}
            >
              Arquivados
            </button>
            <button
              className="px-4 py-2 rounded-full border bg-white text-[#1E1E1E] hover:bg-gray-100 transition-all text-sm md:text-base"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div> */}

        {/* VÍDEO E TEXTO */}
        <div className="flex flex-col items-center flex-1 min-h-0 mt-2">
          <div className="text-center mb-2 flex-shrink-0 w-full">
            <p className="font-poppins font-semibold text-base sm:text-lg md:text-xl lg:text-2xl text-[#1E1E1E]">
              Criar e avaliar dossiês nunca foi tão fácil.
            </p>
            <p className="text-center text-sm md:text-base lg:text-lg text-[#1E1E1E] max-w-2xl mx-auto mt-1">
              Assista ao tutorial e descubra como aproveitar todos os recursos.
            </p>
          </div>
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl aspect-[16/9] flex-shrink-0">
            <iframe
              src="https://www.youtube.com/embed/wMTD8maO6U4"
              title="Luminus Platform Introduction"
              className="w-full h-full rounded-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
          <div className="text-center mt-2 flex-shrink-0">
            <p className="font-ag-title text-sm md:text-base lg:text-lg text-[#1E1E1E]">
              Simples, rápido e eficiente
            </p>
            <p className="font-ag-subtitle text-sm md:text-base text-[#1E1E1E]">
              Cadastre turmas, e crie um novo dossiê para começar!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
