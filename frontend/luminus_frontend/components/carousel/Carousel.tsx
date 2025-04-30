'use client'; 

import React, { useEffect, useState } from 'react'; 
import styles from './Carousel.module.css'; 

// Define as props do componente
interface CarouselProps {
  children: React.ReactNode[]; 
  autoSlide?: boolean;
  autoSlideInterval?: number;
}

export default function Carousel({
  children: slides,
  autoSlide = false,
  autoSlideInterval = 3000,
}: CarouselProps) {
  const [curr, setCurr] = useState(0); // Estado para o índice do slide atual

  const next = () =>
    setCurr((current) => (current === slides.length - 1 ? 0 : current + 1));

  useEffect(() => {
    if (!autoSlide) return;
    const slideInterval = setInterval(next, autoSlideInterval);
    return () => clearInterval(slideInterval);
    // Se autoSlide ou autoSlideInterval puderem mudar dinamicamente após a montagem,
    // adicione-os ao array de dependências: [autoSlide, autoSlideInterval, next]
    // A função 'next' pode ser envolvida em useCallback se isso se tornar um problema.
  }, [autoSlide, autoSlideInterval]); 

  return (
    // Container principal do carrossel
    <div className={styles.carouselContainer}>
      {/* Container flex que se move */}
      <div
        className={styles.slidesWrapper}
        style={{ transform: `translateX(-${curr * 100}%)` }} // Move o container
      >
        {/* Mapeia e renderiza cada slide, envolvendo-o para estilo */}
        {slides.map((slide, i) => (
           <div key={i} className={styles.slide}> {/* Wrapper para cada slide */}
              {slide}
           </div>
        ))}
      </div>

      {/* Indicadores de Posição (Bolinhas) */}
      <div className={styles.indicatorsContainer}>
        <div className={styles.indicatorsWrapper}>
          {slides.map((_, i) => (
            <button // Use button para acessibilidade
              key={i}
              onClick={() => setCurr(i)} // Permite clicar na bolinha para navegar
              className={`${styles.indicatorDot} ${
                curr === i ? styles.indicatorDotActive : styles.indicatorDotInactive
              }`}
              aria-label={`Ir para slide ${i + 1}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}