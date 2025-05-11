import { Trash2, Download, Archive, BarChart2 } from "lucide-react";

interface ActionPanelProps{
    activated: boolean
}

export default function ActionPanel() {

    
        return (
            <div className="fixed bottom-12 left-4 bg-[#0A2B3D] shadow-lg rounded-xl ml-32 flex flex-row gap-4 z-50">
            <button className="hover:bg-[#123a4f] p-2 rounded">
                <Trash2 className="w-6 h-6 text-white" />
            </button>
            <button className="hover:bg-[#123a4f] p-2 rounded">
                <Download className="w-6 h-6 text-white" />
            </button>
            <button className="hover:bg-[#123a4f] p-2 rounded">
                <Archive className="w-6 h-6 text-white" />
            </button>
            <button className="hover:bg-[#123a4f] p-2 rounded">
                <BarChart2 className="w-6 h-6 text-white" />
            </button>
            </div>
        );
    }
  

