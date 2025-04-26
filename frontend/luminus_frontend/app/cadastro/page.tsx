'use client'; // Essencial! Precisamos de estado (useState) e interatividade.

import React, { useState } from 'react';
import Image from 'next/image';       
import Link from 'next/link';        
import styles from './cadastro.module.css'; 

// UseState é como se fosse a memoria do sistema, para não perder as infos
export default function CadastroPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Constante de carregamento, pesquisar mais sobre
  const [isLoading, setIsLoading] = useState(false);   

  // Função chamada ao enviar o formulário
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Impede o recarregamento da página     
    setIsLoading(true);     // Mostra que estamos processando

    console.log('Dados do Cadastro:', {
      username,
      email,
      contactNumber,
      password,
      confirmPassword,
    });

    if (password !== confirmPassword) {
      setIsLoading(false);
      return; 
    }

    // Teste
    setIsLoading(false);
    alert('Cadastro (simulado) enviado! Verifique o console.'); // Mudar forma de aviso
  };

  // JSX
  return (
    <div className={styles.pageContainer}> 

      <div className={styles.leftPanel}>

        <div className={styles.logoContainer}>
          <Image
            src="/logo-Luminus.svg" // Caminho relativo à pasta 'public'
            alt="Luminus Nexus Logo"
            width={200} 
            height={50} 
            priority // Prioridade de carregamento
          />
        </div>

        <h1 className={styles.title}>CADASTRO</h1>

        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.inputGroup}>
            <label htmlFor="username">Usuário:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nome" 
              required // Campo obrigatório
              disabled={isLoading} // Desabilita durante o envio
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="contactNumber">Número de contato</label>
            <input
              type="tel" // Tipo apropriado para telefone
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="(XX) X XXXX - XXXX" // Formato como dica
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
              minLength={8} 
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirme a senha</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar Senha"
              required
              minLength={8}
              disabled={isLoading}
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className={styles.loginLink}>
          Já possui uma conta?{' '}
          <Link href="/login">Entrar</Link> {/* Link para a página de login, depois a gente ajeita Pedro */}
        </p>
      </div>

      {/*Carrossel Placeholder*/}
      <div className={styles.rightPanel}>
         <div className={styles.NexusLogoContainer}>
             <Image
                src="/logo-Nexus.svg" 
                alt="Nexus Logo"
                width={150}
                height={40}
             />
         </div>

         <div className={styles.carouselPlaceholder}>
            <h2>Crie, gerencie e obtenha dados de suas turmas.</h2>
            <p>(Aqui entrará o carrossel de imagens)</p>
         </div>
      </div>

    </div>
  );
}