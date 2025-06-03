import { Trash2, Download, Archive, BarChart2 } from "lucide-react";

interface ActionPanelProps{
    onDeleted: () => void
    toArchive: () => void
    toExport: () => void
}

export default function ActionPanel( {onDeleted, toArchive, toExport} : ActionPanelProps) {

    
        return (
            <div className="left-4 bg-[#0A2B3D] shadow-lg rounded-xl flex flex-row gap-4 z-50 w-fit">

            <button className="hover:bg-[#123a4f] p-2 rounded-xl">
                <Trash2 className="w-6 h-6 text-white" 
                        onClick={onDeleted}
                />
            </button>
            <button className="hover:bg-[#123a4f] p-2 rounded-xl">
                <Download className="w-6 h-6 text-white"
                    onClick={toExport}
                />
            </button>
            <button className="hover:bg-[#123a4f] p-2 rounded-xl">
                <Archive className="w-6 h-6 text-white" 
                    onClick={toArchive}
                />
            </button>
            <button className="hover:bg-[#123a4f] p-2 rounded-xl">
                <BarChart2 className="w-6 h-6 text-white" />
            </button>
            </div>
        );
    }
  

