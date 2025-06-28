'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#332D56] text-white px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-2">404 - Página não encontrada</h1>
        <p className="text-lg mb-6">Oops! Parece que a página que você tentou acessar não existe ou foi movida.</p>
        <button
          onClick={() => router.back()}
          className="bg-white text-[#0A2B3D] px-6 py-2 rounded hover:bg-gray-200 transition"
        >
          Voltar para a página anterior
        </button>
        
      </div>
    </div>
  );
}
