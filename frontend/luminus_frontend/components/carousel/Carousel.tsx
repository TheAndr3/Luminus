'use client'; 

// CORREÇÃO: Importado 'useCallback' para memorizar a função 'next'.
import React, { useEffect, useState, useCallback } from 'react'; 
import styles from './Carousel.module.css'; 

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
  const [curr, setCurr] = useState(0);

  // CORREÇÃO: A função 'next' foi envolvida com 'useCallback'.
  // Ela só será recriada se o número de slides mudar.
  const next = useCallback(() => {
    setCurr((current) => (current === slides.length - 1 ? 0 : current + 1));
  }, [slides.length]);

  useEffect(() => {
    if (!autoSlide) return;
    const slideInterval = setInterval(next, autoSlideInterval);
    return () => clearInterval(slideInterval);
    // CORREÇÃO: 'next' foi adicionado ao array de dependências, resolvendo o aviso.
  }, [autoSlide, autoSlideInterval, next]); 

  return (
    <div className={styles.carouselContainer}>
      <div
        className={styles.slidesWrapper}
        style={{ transform: `translateX(-${curr * 100}%)` }}
      >
        {slides.map((slide, i) => (
           <div key={i} className={styles.slide}>
              {slide}
           </div>
        ))}
      </div>

      <div className={styles.indicatorsContainer}>
        <div className={styles.indicatorsWrapper}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurr(i)}
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