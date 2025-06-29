import { ReactNode, useState } from 'react';
// CORREÇÃO: Ícones não utilizados ('Download', 'Filter') foram removidos.

interface ColoredButtonProps {
  customClassName?: string;
  mainColor?: string;
  hoverColor?: string;
  text?: string;
  icon?: ReactNode;
  haveBorder?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function ColoredButtonPagination({
  customClassName = '',
  mainColor = '',
  hoverColor = '',
  text = '',
  icon = null,
  haveBorder = false, // CORREÇÃO: Esta prop ainda não é usada, mas a manterei caso seja implementada.
  onClick,
  disabled,
}: ColoredButtonProps) {

  const [isHovered, setIsHovered] = useState(false);

  // Lógica para a borda
  const borderClass = haveBorder ? 'border' : 'border-transparent';

  return (
    <button
      onClick={onClick} // CORREÇÃO: onClick adicionado ao botão.
      disabled={disabled} // CORREÇÃO: disabled adicionado ao botão.
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: disabled ? '#A0A0A0' : (isHovered ? hoverColor : mainColor), // Cor cinza quando desabilitado
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      // CORREÇÃO: customClassName e a lógica da borda foram adicionados.
      className={`text-white flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-300 ease-in-out ${borderClass} ${customClassName}`}
    >
      {icon && icon}
      {text}
    </button>
  );
}