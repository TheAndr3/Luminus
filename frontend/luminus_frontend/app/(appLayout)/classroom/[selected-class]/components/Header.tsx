import { ColoredButton } from "@/components/colored-button/colored-button";
import { ClipboardEdit, Plus, Download, Filter, Edit } from 'lucide-react';
// components/Header.tsx
export function Header({ title, mainColor, hoverColor}: { title: string; mainColor?: string; hoverColor?:string}) {
    return (
      <div className={`bg-[${mainColor}] content-end rounded h-40 px-4`}>
        <div className="flex justify-between items-center text-white text-[35px] font-bold p-4 px-4">
          {title}

          <ColoredButton
            mainColor={mainColor}
            hoverColor={hoverColor}
            text={''}  
            icon={<Edit size={35}/>} 
            haveBorder={true}
          ></ColoredButton>

          
        </div>
      </div>
    );
  }

  /*<div class="absolute top-0 -z-10 h-full w-full bg-white"><div class="
  absolute
  bottom-auto
  left-auto right-0 
  top-0 h-[500px] w-[500px]
  -translate-x-[30%] translate-y-[20%] rounded-full 
  bg-[rgba(173,109,244,0.5)]
  opacity-50 blur-[80px]"></div></div> */

  