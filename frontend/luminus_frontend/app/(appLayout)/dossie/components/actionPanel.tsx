import { Trash2, Download, Archive, BarChart2 } from "lucide-react";

interface ActionPanelProps{
    onDeleted: () => void
    toExport: () => void
}

export default function ActionPanel( {onDeleted,  toExport} : ActionPanelProps) {

    
        return (
            <div className="left-4 bg-gray-900 shadow-lg rounded-xl flex flex-row gap-4 z-50 w-fit">

            <button className="hover:bg-[#0A2B3D] p-2 rounded-xl cursor-pointer">
                <Trash2 className="w-6 h-6 text-white" 
                        onClick={onDeleted}
                />
            </button>
            <button className="hover:bg-[#0A2B3D] p-2 rounded-xl cursor-pointer">
                <Download className="w-6 h-6 text-white" 
                    onClick={toExport}
                />
            </button>
            </div>
        );
    }
  

