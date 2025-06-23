import { ReactNode, useState, MouseEventHandler } from 'react'; 

interface ColoredButtonProps {
  mainColor?: string;
  hoverColor?: string;
  text?: string;
  icon?: ReactNode;
  haveBorder?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>; // <<< ADICIONADO AQUI
  className?: string; 
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  textColor?: string; // New prop for text color
}

export function ColoredButton({
  mainColor = '',
  hoverColor = '',
  text = '',
  icon = null,
  haveBorder = false,
  onClick, 
  className, 
  disabled,  
  type = "button", 
  textColor = 'white', // Default to white
}: ColoredButtonProps) {
    
    const [isHovered, setIsHovered] = useState(false);
    
    // Combina classes internas com externas, se houver
    const combinedClassName = `flex items-center gap-1 px-3 py-1 rounded-xl border text-sm transition-all duration-300 ease-in-out ${className || ''}`.trim();

    return (
      <button
        type={type} // Adicionado
        disabled={disabled} // Adicionado
        onClick={onClick} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
            backgroundColor: disabled ? '#A0A0A0' : (isHovered ? hoverColor : mainColor), 
            borderColor: haveBorder ? (isHovered ? hoverColor : mainColor) : 'transparent', 
            color: textColor, // Use the textColor prop
        }}
        className={combinedClassName}
      >    
        {icon && icon}
        {text}
      </button>
    );
  }
