'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './not-found.module.css';
import logo from '@/public/logo-Luminus.svg';

export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <Image 
        src={logo} 
        alt="Luminus Logo" 
        className={styles.logo}
        unoptimized // Necessário para SVGs que não têm width/height intrínsecos definidos
      />
      <div className={styles.errorCode}>404</div>
      <h1 className={styles.title}>Página Não Encontrada</h1>
      <p className={styles.message}>
        Parece que esta página ainda não foi escrita. O capítulo que você procura não foi encontrado em nossa biblioteca.
      </p>
      <Link href="/home" className={styles.homeButton}>
        Voltar ao Painel Principal
      </Link>
    </div>
  );
}
