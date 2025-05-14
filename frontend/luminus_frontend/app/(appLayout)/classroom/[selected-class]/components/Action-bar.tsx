import { BaseInput } from "@/components/inputs/BaseInput";
import { ColoredButton } from "@/components/colored-button/colored-button";
import { useState } from 'react';
import { ClipboardEdit, Plus, Download, Filter, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function ActionBar({ mainColor, hoverColor }: {hoverColor : string; mainColor?: string }) {
    const [isHovered, setIsHovered] = useState(false);
   
    return (
        <div className="mt-6 flex justify-between items-center">
            <div className="flex justify-center items-center  ">
                <BaseInput
                type="text"
                placeholder="Procure pela turma"
                //value={searchTerm}
                //onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-full w-250 px-4 py-2"
                ></BaseInput>
            </div>
            <div className="flex items-center gap-3">
                
                <ColoredButton
                    mainColor={mainColor}
                    hoverColor={hoverColor}
                    text={'Adicionar Aluno'}  
                    icon={<Plus size={16}/>} 
                ></ColoredButton>

                <ColoredButton
                    mainColor={mainColor}
                    hoverColor={hoverColor}
                    text={'Editar Turma'}
                    icon={<ClipboardEdit size={16}/>} 
                ></ColoredButton>
                
            </div>
        </div>    
    );
  }


  