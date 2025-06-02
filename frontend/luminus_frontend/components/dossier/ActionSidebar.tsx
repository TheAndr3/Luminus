// components/ActionSidebar.tsx
import React from 'react';
// Importa useSpring e animated para animações, e springConfig para configurações de animação da biblioteca react-spring
import { useSpring, animated, config as springConfig } from 'react-spring';

// --- Ícones SVG Placeholder ---
// Componente funcional para o ícone de adicionar item
const AddItemIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" /><path d="M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3ZM5 5V19H19V5H5Z" fillRule="evenodd" clipRule="evenodd"/></svg>
);
// Componente funcional para o ícone de adicionar seção
const AddSectionIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z" /></svg>
);
// Componente funcional para o ícone de deletar item
const DeleteItemIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9 3V4H4V6H5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6ZM9 8V17H11V8H9ZM13 8V17H15V8H13Z"/></svg>
);
// Componente funcional para o ícone de deletar seção
const DeleteSectionIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" ><path d="M6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" /></svg>
);

// Interface para definir as propriedades esperadas pelo componente ActionSidebar
interface ActionSidebarProps {
  targetTopPosition: number | null; // Posição vertical (top) onde a sidebar deve ser renderizada, ou null para escondê-la
  onAddItemToSection: () => void; // Função callback para adicionar um item à seção atual/focada
  onAddNewSection: () => void; // Função callback para adicionar uma nova seção
  onDeleteItemFromSection?: () => void; // Função callback opcional para deletar o item selecionado da seção
  onDeleteSection: () => void; // Função callback para deletar a seção atual/focada
  canDeleteItem: boolean; // Flag que indica se a ação de deletar item está disponível/permitida
  canDeleteSection: boolean; // Flag que indica se a ação de deletar seção está disponível/permitida
  onClearBlurTimeout: () => void; // Callback para limpar um timeout de "blur" e sinalizar para ignorar o próximo evento de blur.
                                  // (Originalmente 'onClearBlurTimeout', funcionalidade interna implica 'clearBlurTimeoutAndSignalIgnore')

  // Classes CSS opcionais passadas da página para customização de estilo
  containerClassNameFromPage?: string; // Classe CSS para o contêiner principal da sidebar
  buttonClassNameFromPage?: string; // Classe CSS para os botões dentro da sidebar
  disabledButtonClassNameFromPage?: string; // Classe CSS para botões desabilitados
  iconClassNameFromPage?: string; // Classe CSS para os ícones dentro dos botões
}

// Definição do componente funcional ActionSidebar
const ActionSidebar: React.FC<ActionSidebarProps> = ({
  targetTopPosition,
  onAddItemToSection,
  onAddNewSection,
  onDeleteItemFromSection,
  onDeleteSection,
  canDeleteItem,
  canDeleteSection,
  onClearBlurTimeout,
  containerClassNameFromPage = '', // Valor padrão para a classe do contêiner
  buttonClassNameFromPage = '', // Valor padrão para a classe dos botões
  disabledButtonClassNameFromPage = '', // Valor padrão para a classe de botões desabilitados
  iconClassNameFromPage = '', // Valor padrão para a classe dos ícones
}) => {
  // Configuração da animação usando useSpring
  // Anima a propriedade 'top' e 'opacity' da sidebar
  const springProps = useSpring({
    top: targetTopPosition !== null ? targetTopPosition : -250, // Posição final do 'top' ou fora da tela se null
    opacity: targetTopPosition !== null ? 1 : 0, // Opacidade total se visível, caso contrário, transparente
    config: springConfig.stiff, // Configuração de física da animação (rígida, menos "molejo")
  });

  // Condição para não renderizar o componente se ele estiver fora da tela e quase totalmente transparente
  // Isso evita renderizar o DOM desnecessariamente.
  if (targetTopPosition === null && springProps.opacity.get() < 0.01) {
      return null; // Retorna null para não renderizar nada
  }

  // Função auxiliar para obter as classes CSS corretas para um botão,
  // incluindo a classe de desabilitado se necessário.
  const getButtonClasses = (enabled: boolean): string => {
    let classes = `${buttonClassNameFromPage}`; // Começa com a classe base do botão
    if (!enabled) {
      // Adiciona a classe de desabilitado se o botão não estiver habilitado
      classes += ` ${disabledButtonClassNameFromPage}`;
    }
    return classes.trim(); // Remove espaços extras no início ou fim
  };

  // Manipulador de evento onMouseDown para o contêiner da sidebar.
  // Usado para interagir com o sistema de foco/blur.
  const handleContainerMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    // Verifica se o alvo do clique (ou um de seus pais) é um botão dentro da sidebar
    const targetIsButton = (e.target as HTMLElement).closest('button');
    if (targetIsButton) {
        // Log de depuração: indica que o clique foi em um botão e onClearBlurTimeout será chamado.
        console.log('%cDEBUG: ActionSidebar MouseDown on BUTTON - Calling onClearBlurTimeout (which signals ignore)', 'color:purple; font-weight:bold;');
        // Chama onClearBlurTimeout para sinalizar que o próximo evento de blur do campo de texto deve ser ignorado,
        // pois o foco está sendo intencionalmente movido para a sidebar.
        onClearBlurTimeout();
    } else {
        // Log de depuração: indica que o clique foi no contêiner, mas não em um botão.
        console.log('%cDEBUG: ActionSidebar MouseDown on CONTAINER (not button) - NOT calling onClearBlurTimeout', 'color:purple;');
        // Se o clique for no padding da sidebar, pode-se optar por chamar ou não onClearBlurTimeout.
        // A decisão de chamar ou não depende do comportamento desejado para o blur.
        // O código original optou por não chamar aqui, mas um comentário sugere testar.
        // onClearBlurTimeout(); // Esta linha está comentada, indicando que não é chamada para cliques no padding.
    }
  };

  // Renderiza a sidebar animada
  return (
    <animated.aside // Usa o componente 'animated.aside' do react-spring para aplicar as animações
      className={containerClassNameFromPage} // Aplica a classe CSS do contêiner
      style={springProps} // Aplica as propriedades de estilo animadas (top, opacity)
      onMouseDown={handleContainerMouseDown} // Adiciona o manipulador de mousedown ao contêiner da sidebar
    >
      {/* Botão para adicionar um item */}
      <button
        type="button" // Tipo do botão
        onClick={() => {
            // Log de depuração: indica que o onClick do botão AddItemIcon foi chamado.
            console.log('%cDEBUG: AddItemIcon onClick CALLED', 'color:green; font-weight:bold;');
            onAddItemToSection(); // Chama a função de callback para adicionar item
        }}
        className={getButtonClasses(true)} // Obtém as classes do botão (sempre habilitado aqui)
        aria-label="Adicionar item à seção" // Acessibilidade: rótulo para leitores de tela
        title="Adicionar item à seção" // Tooltip exibido ao passar o mouse
        disabled={false} // Botão nunca está desabilitado diretamente aqui (a lógica de "poder adicionar" está no pai)
      >
        <AddItemIcon className={iconClassNameFromPage} /> {/* Renderiza o ícone de adicionar item */}
      </button>

      {/* Botão para adicionar uma nova seção */}
      <button
        type="button"
        onClick={() => {
            // Log de depuração: indica que o onClick do botão AddSectionIcon foi chamado.
            console.log('%cDEBUG: AddSectionIcon onClick CALLED', 'color:green; font-weight:bold;');
            onAddNewSection(); // Chama a função de callback para adicionar seção
        }}
        className={getButtonClasses(true)} // Obtém as classes do botão (sempre habilitado aqui)
        aria-label="Adicionar nova seção abaixo" // Acessibilidade
        title="Adicionar nova seção abaixo" // Tooltip
        disabled={false} // Botão nunca está desabilitado diretamente aqui
      >
        <AddSectionIcon className={iconClassNameFromPage} /> {/* Renderiza o ícone de adicionar seção */}
      </button>

      {/* Botão para deletar um item */}
      <button
        type="button"
        onClick={() => {
          // Só executa a ação se a exclusão de item for permitida e a função de callback existir
          if (canDeleteItem && onDeleteItemFromSection) {
            // Log de depuração: indica que o onClick do botão DeleteItemIcon foi chamado.
            console.log('%cDEBUG: DeleteItemIcon onClick CALLED', 'color:green; font-weight:bold;');
            onDeleteItemFromSection(); // Chama a função de callback para deletar item
          }
        }}
        disabled={!canDeleteItem} // O botão é desabilitado se 'canDeleteItem' for false
        className={getButtonClasses(canDeleteItem)} // Obtém as classes do botão, considerando o estado 'canDeleteItem'
        aria-label="Excluir item selecionado" // Acessibilidade
        title="Excluir item selecionado" // Tooltip
      >
        <DeleteItemIcon className={iconClassNameFromPage} /> {/* Renderiza o ícone de deletar item */}
      </button>

      {/* Botão para deletar uma seção */}
      <button
        type="button"
        onClick={() => {
            // Só executa a ação se a exclusão de seção for permitida
            if (canDeleteSection) {
                // Log de depuração: indica que o onClick do botão DeleteSectionIcon foi chamado.
                console.log('%cDEBUG: DeleteSectionIcon onClick CALLED', 'color:green; font-weight:bold;');
                onDeleteSection(); // Chama a função de callback para deletar seção
            }
        }}
        disabled={!canDeleteSection} // O botão é desabilitado se 'canDeleteSection' for false
        className={getButtonClasses(canDeleteSection)} // Obtém as classes do botão, considerando o estado 'canDeleteSection'
        aria-label="Excluir seção inteira" // Acessibilidade
        title="Excluir seção inteira" // Tooltip
      >
        <DeleteSectionIcon className={iconClassNameFromPage} /> {/* Renderiza o ícone de deletar seção */}
      </button>
    </animated.aside>
  );
};

// Exporta o componente ActionSidebar como padrão
export default ActionSidebar;