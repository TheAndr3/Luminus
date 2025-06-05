import { useState } from "react"; // Importa o hook useState do React para gerenciar o estado local

// Define as props esperadas pelo componente PageController
interface PageControllerProps {
  currentPage: number; // Página atual
  totalPages: number;  // Total de páginas disponíveis
  setCurrentPage: (page: number) => void; // Função para mudar a página atual
}

// Componente de paginação
export default function PageController({ currentPage, totalPages, setCurrentPage }: PageControllerProps) {

  // Estado para controlar o valor do input (campo de número da página)
  const [inputController, setInputController] = useState<number | ''>(''); // Aceita número ou string vazia

  return (
    <div>
      {/* Container dos controles de paginação */}
      <div className="flex items-center justify-end mt-6 gap-2">
        
        {/* Botão de página anterior */}
        <button
          className="border px-[3vh] py-[1vh] rounded-full bg-gray-400 hover:bg-gray-600"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1} // Desativa se já estiver na primeira página
        >
          Anterior
        </button>

        {/* Campo de entrada manual para número da página */}
        <input
          type="text" // Poderia ser type="number", mas manter "text" permite lidar melhor com vazio e validação
          placeholder="Page"
          className="border px-3 py-1 rounded w-16 text-sm"
          value={inputController} // Valor controlado pelo estado local
          onChange={(e) => {
            const value = e.target.value;

            if (value === '') {
              // Se o input for limpo, esvazia o estado
              setInputController('');
            } else {
              // Converte para número
              const num = parseInt(value, 10);
              if (!isNaN(num) && num <= totalPages && num > 0) {
                // Atualiza página e estado apenas se for número válido e dentro do limite
                setCurrentPage(num);
                setInputController(num);
              }
              // Se for inválido ou maior que totalPages, ignora 
            }
          }}
        />

        {/* Botões numéricos para cada página */}
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`border px-[2vh] py-[1vh] rounded-full ${
              currentPage === i + 1
                ? "bg-[#101828] text-white" // Estilo diferente para a página atual
                : "bg-gray-200 text-black hover:bg-gray-600"
            }`}
            onClick={() => setCurrentPage(i + 1)} // Altera a página ao clicar
          >
            {i + 1}
          </button>
        ))}

        {/* Botão de próxima página */}
        <button
          className="border px-[3vh] py-[1vh] rounded-full bg-gray-400 hover:bg-gray-600"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages} // Desativa se já estiver na última página
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
