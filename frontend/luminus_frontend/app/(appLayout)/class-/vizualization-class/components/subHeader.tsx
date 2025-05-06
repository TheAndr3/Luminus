// components/HeaderCampos.tsx
// Define o arquivo como um componente para o projeto, no qual será importado e utilizado em outras partes da aplicação.

import DialogPage from "./createClassModal"; 
// Importa o componente 'DialogPage', que é um modal provavelmente utilizado para criar uma turma ou algo relacionado, dentro deste arquivo.

export function SubHeader() { 
  // Cria o componente 'SubHeader', que é um subtítulo ou barra com opções que será renderizado na tela.

  return (
    <div className="mt-10 flex gap-42 w-[80%] ml-auto p-4 rounded">


      <h3>Selecionar todos</h3>
      {/* Cria o título "Selecionar todos" */}
      <h3>Disciplina</h3>
      {/* Cria o título "Disciplina" */}
      <h3>Turma</h3>
      {/* Cria o título "Turma" */}
      <h3>Dossiê</h3>
      {/* Cria o título "Dossiê" */}
      
      
      {/* Renderiza o componente 'DialogPage', que é o modal de criação de turma ou algo relacionado, no final da barra. */}
    </div>
  );
}
