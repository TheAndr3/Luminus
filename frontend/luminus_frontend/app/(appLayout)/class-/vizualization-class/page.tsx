"use client" 
// Declara que este arquivo é para ser executado no cliente (navegador), em vez de no servidor.
// Usado em frameworks como Next.js para marcar que o componente depende de código que só pode ser executado no cliente.

import {SubHeader} from "@/app/(appLayout)/class-/vizualization-class/components/subHeader"; 
// Importa o componente SubHeader que provavelmente exibe alguma informação no topo ou subtítulo da página.


export default function vizualizationClass(){ 
  // Cria o componente principal 'vizualizationClass', que vai ser renderizado na tela.
 
  return(
    <div> 
    {/* Cria o contêiner principal da página */}

      <div className="flex items-center justify-center mt-10 w-[80%] ml-auto bg-gray-200">
      {/* Cria uma div que vai conter o título, com as seguintes classes CSS:*/}

        <h1 className="text-4xl font-bold"> Turmas </h1>
        {/* Exibe o título "Turmas" com as seguintes classes CSS */}

      </div>

      <SubHeader></SubHeader>
      {/* Renderiza o componente SubHeader abaixo do título, que pode exibir mais informações ou um subtítulo. */}
     
    </div>
  )
}
// O componente 'vizualizationClass' renderiza:
// 1. Um título "Turmas" centralizado no topo da página.
// 2. O componente 'SubHeader' que foi importado, para mostrar mais informações ou uma barra de navegação.
