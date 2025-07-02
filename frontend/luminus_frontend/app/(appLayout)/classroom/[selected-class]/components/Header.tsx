import { ColoredButton } from "@/components/colored-button/colored-button";
import { Edit, Folder } from 'lucide-react';
import { useState} from 'react';
import EditClassModal from '../../components/editClassModal';
import class_icon from "@/components/icon/icon_classroom.svg";
import Image from 'next/image';

// components/Header.tsx
export function Header({ 
  title, 
  mainColor, 
  originalColor,
  classroomId,
  associatedDossier,
}: { 
  title: string; 
  mainColor?: string; 
  hoverColor?: string;
  originalColor?: string;
  classroomId?: number | null;
  associatedDossier?: { id: number; name: string } | null;
  onDossierAssociated?: (dossierId: number) => void;
}) {
    const [showEditModal, setShowEditModal] = useState(false);



    return (
      <div 
      className={`content-end rounded mt-2 mx-10 h-28 px-4 ${mainColor}`}>
        <div className={`flex justify-between items-center text-white text-[35px] font-bold p-2 px-4`}>
          <div className="flex items-center gap-3">
            <Image src={class_icon} alt="Classroom icon" width={40} height={40} />
            {title}
          </div>
          <div className="flex items-center justify-between gap- -mt-6">
            <div className="flex flex-col items-center gap-0 ml-8">
              <div className="-mt-6">
                {/* Show dossier name button if associated, otherwise show "Nenhum dossiê associado" */}
                {associatedDossier ? (
                  <ColoredButton
                    mainColor="#ffffff"
                    hoverColor="#f3f4f6"
                    text={associatedDossier.name}
                    icon={<Folder size={18} color={originalColor} />}
                    haveBorder={false}
                    textColor={originalColor}
                    title={associatedDossier.name}
                    className="min-w-[14.2rem] max-w-[14.2rem] justify-center"
                    showPointer={false}
                  />
                ) : (
                  <ColoredButton
                    mainColor="#ffffff"
                    hoverColor="#f3f4f6"
                    text="Nenhum dossiê associado"
                    icon={<Folder size={18} color="#888" />}
                    haveBorder={false}
                    textColor="#888"
                    className="min-w-[14.2rem] max-w-[14.2rem] justify-center"
                    showPointer={false}
                  />
                )}
              </div>
              <ColoredButton
                mainColor="bg-gray-900"
                hoverColor="bg-gray-800"
                text={''}  
                icon={<Edit size={25}/>} 
                haveBorder={false}
                className="ml-50 mt-6 border border-gray-900"
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

  