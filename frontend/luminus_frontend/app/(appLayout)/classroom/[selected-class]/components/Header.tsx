import { ColoredButton } from "@/components/colored-button/colored-button";
import { clsx } from 'clsx';
import { ClipboardEdit, Plus, Download, Filter, Edit } from 'lucide-react';
import AssociarDossie from "./associarDossie";
import { useState } from 'react';
import EditClassModal from '../../components/editClassModal';

// components/Header.tsx
export function Header({ 
  title, 
  mainColor, 
  hoverColor,
  classroomId
}: { 
  title: string; 
  mainColor?: string; 
  hoverColor?: string;
  classroomId?: number | null;
}) {
    const [showEditModal, setShowEditModal] = useState(false);

    return (
      <div 
      style={{backgroundColor: mainColor,}}
      className={`content-end rounded h-18 px-4`}>
        <div className={`flex justify-between items-center text-white text-[35px] font-bold p-2 px-4`}>
          {title}
          <div className="flex items-center justify-between gap- -mt-6">
            <div className="flex flex-col items-center gap-0 ml-8">
              <AssociarDossie
                mainColor="white"
                hoverColor="gray-100"
              />
              <ColoredButton
                mainColor={mainColor}
                hoverColor={hoverColor}
                text={''}  
                icon={<Edit size={25}/>} 
                haveBorder={true}
                className="ml-20"
                onClick={() => setShowEditModal(true)}
              ></ColoredButton>
            </div>
          </div>
        </div>

        {/* Edit Class Modal */}
        {showEditModal && (
          <EditClassModal
            open={showEditModal}
            onCancel={() => setShowEditModal(false)}
            classroom={{
              id: classroomId || 0,
              name: title,
              course: title,
              season: "",
              institution: ""
            }}
          />
        )}
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

  