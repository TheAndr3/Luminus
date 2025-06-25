import { ReactNode, useState, MouseEventHandler } from 'react'; 

interface ColoredButtonProps {
  mainColor?: string;
  hoverColor?: string;
  text?: string;
  icon?: ReactNode;
  haveBorder?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string; 
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  textColor?: string;
  title?: string;
  showPointer?: boolean;
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
  textColor = 'white',
  title,
  showPointer = true,
}: ColoredButtonProps) {
    
    const [isHovered, setIsHovered] = useState(false);
    
    // Combina classes internas com externas, se houver
    const combinedClassName = `flex items-center gap-1 px-3 py-1 rounded-xl border text-sm transition-all duration-300 ease-in-out ${className || ''}`.trim();

    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
            backgroundColor: disabled ? '#A0A0A0' : (isHovered ? hoverColor : mainColor), 
            borderColor: haveBorder ? (isHovered ? hoverColor : mainColor) : 'transparent', 
            color: textColor,
            cursor: showPointer ? 'pointer' : 'default',
        }}
        className={combinedClassName}
        title={title || text}
      >    
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="truncate w-full text-center">{text}</span>
      </button>
    );
  }
