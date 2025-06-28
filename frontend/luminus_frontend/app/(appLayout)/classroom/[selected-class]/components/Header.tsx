import { ColoredButton } from "@/components/colored-button/colored-button";
import { clsx } from 'clsx';
import { ClipboardEdit, Plus, Download, Filter, Edit, Folder } from 'lucide-react';
import AssociarDossie from "./associarDossie";
import { useState, useEffect } from 'react';
import EditClassModal from '../../components/editClassModal';
import { getDossierById } from '@/services/dossierServices';
import class_icon from "@/components/icon/icon_classroom.svg";
import Image from 'next/image';

// components/Header.tsx
export function Header({ 
  title, 
  mainColor, 
  hoverColor,
  originalColor,
  classroomId,
  associatedDossier,
  onDossierAssociated
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
    const [isLoadingDossier, setIsLoadingDossier] = useState(false);

    // Fetch associated dossier information
    const fetchAssociatedDossier = async (dossierId: number) => {
        setIsLoadingDossier(true);
        try {
            const response = await getDossierById(dossierId);
            if (response.data) {
                // Update the parent component's state
                if (onDossierAssociated) {
                    onDossierAssociated(dossierId);
                }
            }
        } catch (error) {
            console.error('Error fetching dossier:', error);
        } finally {
            setIsLoadingDossier(false);
        }
    };

    // This function will be called when a dossier is associated
    const handleDossierAssociated = (dossierId: number) => {
        if (onDossierAssociated) {
            onDossierAssociated(dossierId);
        }
    };

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

  /*<div class="absolute top-0 -z-10 h-full w-full bg-white"><div class="
  absolute
  bottom-auto
  left-auto right-0 
  top-0 h-[500px] w-[500px]
  -translate-x-[30%] translate-y-[20%] rounded-full 
  bg-[rgba(173,109,244,0.5)]
  opacity-50 blur-[80px]"></div></div> */

  