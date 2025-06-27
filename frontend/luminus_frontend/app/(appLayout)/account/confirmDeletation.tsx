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
      <AlertDialogOverlay className="fixed inset-0 bg-gray-900/40 " />
      {/* Container do conteúdo (estilizado com fundo vermelho) */}
      <AlertDialogContent className="bg-[#D72638] text-white  h-45">
        
        {/* Cabeçalho do diálogo */}
        <AlertDialogHeader>
          {/* Título com contagem dinâmica de turmas */}
          <AlertDialogTitle className="text-center text-lg mt-6">
            Tem certeza que deseja excluir esse perfil?
          </AlertDialogTitle>
        </AlertDialogHeader>

        {/* Rodapé com botões de ação */}
        <AlertDialogFooter className="flex justify-center gap-4 mt-4 mx-auto">
          {/* Botão de cancelar - estilizado em branco com texto vermelho */}
          <AlertDialogCancel className="bg-[#D9D9D9] text-lg text-red-600 px-[4vh] py-[2vh] rounded-md">
            Cancelar
          </AlertDialogCancel>

          {/* Botão de ação principal - estilizado igual mas com handler de confirmação */}
          <AlertDialogAction
            onClick={onConfirm}  // Dispara a função de confirmação
            className="bg-[#D9D9D9] text-lg text-black px-[6vh] py-[2vh] rounded-md"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
