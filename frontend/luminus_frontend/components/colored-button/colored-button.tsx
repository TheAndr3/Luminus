import { ReactNode, useState } from 'react';
import { Download, Filter } from 'lucide-react';

interface ColoredButtonProps { //NÃO FAÇO A MÍNIMA IDEIA PQ ISSO ACONTECEU, SÓ SEI QUE O INTERPRETADOR ESTAVA DANDO ERRO PORQUE ESTOU PASSANO O ÍCONE COMO UM PARÂMETRO NULL
  mainColor?: string;
  hoverColor?: string;
  text?: string;
  icon?: ReactNode;
  haveBorder?: boolean
}

export function ColoredButton({
  mainColor = '',
  hoverColor = '',
  text = '',
  icon = null, // <- agora é um JSX pronto
  haveBorder = false,
}: ColoredButtonProps) {
    
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <button 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
            backgroundColor: isHovered ? hoverColor : mainColor,
        }}
        className={`text-white flex items-center gap-1 px-3 py-1 rounded-full border text-sm transition-all duration-300 ease-in-out`}>    
            {icon && icon} {/* Se mandou ícone, mostra ele */}
            {text}
    </button>

    );
  }