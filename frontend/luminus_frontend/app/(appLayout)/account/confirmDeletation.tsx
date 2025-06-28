// Importação dos componentes do shadcn/ui para construção do diálogo de alerta
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogOverlay,
} from "@/components/ui/alert-dialog"
import { Trash2, AlertTriangle } from "lucide-react";

// Definição da interface das props do componente
interface ConfirmDeletationProps {
  open: boolean          // Controla se o diálogo está aberto ou fechado
  onCancel: () => void   // Função chamada ao cancelar (fechar o diálogo)
  onConfirm: () => void  // Função chamada ao confirmar a exclusão
}

// Componente de diálogo de confirmação de exclusão
export function ConfirmDeletation({
  open,
  onCancel,
  onConfirm,
}: ConfirmDeletationProps) {
  return (
    // Componente principal do diálogo
    <AlertDialog 
      open={open}               // Controla a visibilidade
      onOpenChange={onCancel}   // Fecha o diálogo quando muda o estado (cancelar)
    >
      <AlertDialogOverlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />
      {/* Container do conteúdo (estilizado com fundo vermelho) */}
      <AlertDialogContent className="max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200">
        
        {/* Cabeçalho do diálogo */}
        <AlertDialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <AlertDialogTitle className="text-xl font-bold text-gray-900">
            Excluir Conta
          </AlertDialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão perdidos permanentemente.
          </p>
        </AlertDialogHeader>

        {/* Rodapé com botões de ação */}
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
          {/* Botão de cancelar - estilizado em branco com texto vermelho */}
          <AlertDialogCancel className="w-full sm:w-auto px-8 py-3 border-gray-300 text-gray-700 bg-gray-300 hover:bg-gray-400 rounded-full font-medium shadow-md border transition-all duration-200 hover:shadow-lg cursor-pointer">
            Cancelar
          </AlertDialogCancel>

          {/* Botão de ação principal - estilizado igual mas com handler de confirmação */}
          <AlertDialogAction
            onClick={onConfirm}  // Dispara a função de confirmação
            className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium shadow-md border border-red-600 transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Excluir Conta
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
