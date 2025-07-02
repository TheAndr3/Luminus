"use client";

// CORREÇÃO: As importações de 'Image', 'Button' e 'Plus' foram removidas pois não eram utilizadas.
import { useEffect, useState } from "react";
import { GetProfile } from '@/services/professorService';
import { useRouter } from 'next/navigation';

interface Professor {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Componente do Ícone de Turma
const ClassroomIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="64" height="64" viewBox="0 0 158 143" fill="currentColor">
    <g transform="translate(0.000000,143.000000) scale(0.100000,-0.100000)">
      <path d="M710 1104 c-69 -30 -96 -71 -117 -179 -18 -98 -17 -119 13 -154 l26 -31 152 0 c169 0 189 6 204 63 9 37 -12 176 -33 216 -18 35 -64 77 -98 90 -40 15 -106 13 -147 -5z"/>
      <path d="M218 981 c-56 -8 -57 -10 -92 -77 -23 -43 -25 -55 -16 -80 6 -15 9 -38 6 -50 -10 -38 11 -74 51 -90 26 -12 62 -15 126 -12 84 3 90 4 116 34 24 27 27 37 25 90 -3 72 -13 124 -27 142 -18 23 -85 52 -114 51 -15 -1 -49 -5 -75 -8z"/>
      <path d="M1147 953 c-14 -14 -6 -42 18 -61 22 -17 24 -24 15 -47 -15 -38 -12 -66 8 -104 20 -38 73 -71 112 -71 96 0 157 115 116 215 -24 57 -66 75 -172 75 -50 0 -94 -3 -97 -7z"/>
      <path d="M660 679 c-111 -20 -216 -86 -246 -156 -8 -18 -14 -64 -14 -103 l0 -70 385 0 385 0 0 72 c0 127 -56 197 -194 240 -72 23 -236 32 -316 17z"/>
      <path d="M182 599 c-55 -10 -120 -47 -143 -79 -12 -17 -19 -47 -21 -95 l-3 -70 141 -3 141 -3 6 85 c3 46 13 101 21 121 9 20 13 41 10 46 -6 11 -93 10 -152 -2z"/>
      <path d="M1238 605 c-3 -3 3 -29 13 -58 11 -31 18 -81 19 -124 l0 -73 145 0 145 0 0 60 c0 106 -46 160 -158 186 -56 14 -154 19 -164 9z"/>
    </g>
  </svg>
);

// Componente do Ícone de Dossiê
const DossierIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"/>
    <path d="M8 12H16V14H8V12Z"/>
    <path d="M8 16H14V18H8V16Z"/>
  </svg>
);

// Componente do Ícone de Play Button em Tela
const PlayButtonIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 3H3C1.9 3 1 3.9 1 5V19C1 20.1 1.9 21 3 21H21C22.1 21 23 20.1 23 19V5C23 3.9 22.1 3 21 3ZM21 19H3V5H21V19Z"/>
    <path d="M10 8L16 12L10 16V8Z"/>
  </svg>
);

export default function Home() {
  const [professor, setProfessor] = useState<Professor | null>(null);
  // CORREÇÃO: O estado 'isLoading' foi removido pois não era utilizado.
  // const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
      }
      // CORREÇÃO: A chamada a setIsLoading foi removida.
      // finally {
      //   setIsLoading(false);
      // }
    };

    fetchProfessorData();
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex flex-col bg-white min-h-0">
      <div className="flex flex-col px-4 pt-3 pb-4 flex-1 overflow-hidden">
        {/* Título no topo */}
        <div className="text-center mb-8">
          <h1 className="font-poppins font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#1E1E1E] leading-tight">
            Bem vindo ao Luminus,{" "}
            <span className="text-[#112C3F]">{professor?.name || '...'}</span>!
          </h1>
        </div>

        {/* Bloco central com botões */}
        <div className="flex-1 flex items-center justify-center mt-20">
          <div className="w-full max-w-4xl mx-auto">
            {/* LINHA SEPARADORA SUPERIOR */}
            <div className="w-full mb-12">
              <hr className="border-t-2 border-[#112C3F] opacity-30" />
            </div>

            {/* BOTÕES DE NAVEGAÇÃO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full">
              {/* BOTÃO TURMAS */}
              <button
                onClick={() => handleNavigation('/classroom')}
                className="flex flex-col items-center p-6 rounded-xl border-2 border-[#112C3F] bg-white hover:bg-[#112C3F] hover:text-white transition-all duration-300 cursor-pointer group"
              >
                <div className="mb-4 text-[#112C3F] group-hover:text-white transition-colors duration-300">
                  <ClassroomIcon />
                </div>
                <span className="font-poppins font-semibold text-lg text-[#1E1E1E] group-hover:text-white transition-colors duration-300">
                  Turmas
                </span>
              </button>

              {/* BOTÃO DOSSIÊS */}
              <button
                onClick={() => handleNavigation('/dossie')}
                className="flex flex-col items-center p-6 rounded-xl border-2 border-[#112C3F] bg-white hover:bg-[#112C3F] hover:text-white transition-all duration-300 cursor-pointer group"
              >
                <div className="mb-4 text-[#112C3F] group-hover:text-white transition-colors duration-300">
                  <DossierIcon />
                </div>
                <span className="font-poppins font-semibold text-lg text-[#1E1E1E] group-hover:text-white transition-colors duration-300">
                  Dossiês
                </span>
              </button>

              {/* BOTÃO TUTORIAL */}
              <button
                onClick={() => handleNavigation('/home/tutorial')}
                className="flex flex-col items-center p-6 rounded-xl border-2 border-[#112C3F] bg-white hover:bg-[#112C3F] hover:text-white transition-all duration-300 cursor-pointer group"
              >
                <div className="mb-4 text-[#112C3F] group-hover:text-white transition-colors duration-300">
                  <PlayButtonIcon />
                </div>
                <span className="font-poppins font-semibold text-lg text-[#1E1E1E] group-hover:text-white transition-colors duration-300">
                  Tutorial
                </span>
              </button>
            </div>

            {/* LINHA SEPARADORA INFERIOR */}
            <div className="w-full mt-12">
              <hr className="border-t-2 border-[#112C3F] opacity-30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}