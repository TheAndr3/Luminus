import { Trash2, Download, BarChart2 } from "lucide-react";

interface ActionPanelProps{
    onDeleted: () => void
    toExport: () => void
}

export default function ActionPanel( {onDeleted, toExport} : ActionPanelProps) {

    
        return (
            <div className="left-4 bg-gray-900 shadow-lg rounded-xl flex flex-row gap-4 z-50 w-fit">

            <button className="hover:bg-[#0A2B3D] cursor-pointer p-2 rounded-xl">
                <Trash2 className="w-6 h-6 text-white" 
                        onClick={onDeleted}
                />
            </button>
            {/* <button className="hover:bg-[#0A2B3D] cursor-pointer p-2 rounded-xl">
                <Download className="w-6 h-6 text-white"
                    onClick={toExport}
                />
            </button> */}
            </div>
        );
    }
  

