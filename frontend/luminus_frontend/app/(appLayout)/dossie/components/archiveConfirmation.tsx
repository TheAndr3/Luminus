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

/**
 * Interface que define as propriedades do componente ArchiveConfirmation
 * @prop {boolean} open - Controla a visibilidade do diálogo
 * @prop {() => void} onCancel - Callback acionado ao cancelar a ação
 * @prop {() => void} onConfirm - Callback acionado ao confirmar a ação
 * @prop {number} total - Quantidade total de itens selecionados
 * @prop {string} [title] - Título opcional da turma (para single selection)
 * @prop {string} [code] - Código opcional da turma (para single selection)
 * @prop {string} description - Descrição principal da ação
 */
interface ArchiveConfirmationProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  total: number
  title?: string
  code?: string
  description: string
}

/**
 * Componente de diálogo para confirmação de arquivamento
 * - Exibe mensagem contextual (diferente para single/multi selection)
 * - Oferece ações de cancelar ou confirmar
 * - Estilizado com tema vermelho para ações destrutivas
 */
export function ArchiveConfirmation({
  open,
  onCancel,
  onConfirm,
  title,
  code,
  description
}: ArchiveConfirmationProps) {
  return (
    // Componente base do AlertDialog
    <AlertDialog 
      open={open}               // Controla visibilidade
      onOpenChange={onCancel}   // Fecha ao clicar fora/ESC
    >
      {/* Overlay semi-transparente */}
      <AlertDialogOverlay className="fixed inset-0 bg-gray-900/40" />
      
      {/* Container principal do conteúdo */}
      <AlertDialogContent className="bg-[#D72638] text-white h-45">
        {/* Cabeçalho com mensagem dinâmica */}
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-lg mt-6">
            {/* Renderização condicional da mensagem */}
            {description} {title} {code}
          </AlertDialogTitle>
        </AlertDialogHeader>

        {/* Área de ações - botões alinhados ao centro */}
        <AlertDialogFooter className="flex justify-center gap-4 mt-4 mx-auto">
          {/* Botão de cancelar */}
          <AlertDialogCancel 
            className="bg-[#D9D9D9] text-lg text-red-600 px-[4vh] py-[2vh] rounded-md"
          >
            Cancelar
          </AlertDialogCancel>

          {/* Botão principal de ação */}
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-[#D9D9D9] text-lg text-black px-[5vh] py-[2vh] rounded-md"
          >
            Arquivar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}