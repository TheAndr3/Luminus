"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import style from "@/app/recorver-password/enter-new-password/page.module.css";
import {newPassoword} from "@/services/api"
import { redirect } from "next/navigation";

import { useSearchParams } from "next/navigation";

export default function CheckSame() {
    // Estado que armazena a nova senha que o usuário deseja definir
    const [newPassword, setNewPassword] = useState('');

    // Estado que armazena a confirmação da senha, ou seja, o valor inserido pelo usuário para garantir que as senhas sejam iguais
    const [confirmPassword, setConfirmPassword] = useState('');

    // Estado que indica se as senhas inseridas (nova senha e confirmação) são iguais ou não
    // Inicialmente, é definido como "true", assumindo que as senhas são iguais
    const [isEqual, setIsEqual] = useState(true);

    // Estado que controla se o processo de envio ou carregamento da nova senha está em andamento
    // Inicialmente, é definido como "false", indicando que não há carregamento em andamento
    const [isLoading, setIsLoading] = useState(false);

    // Obtém os parâmetros de busca da URL, como os parâmetros passados na query string (email)
    // È ser usado para capturar o valor de "email" na URL e utilizá-lo como parametro a mandar pra API
    const searchParams = useSearchParams();



    // Verifica igualdade em tempo real
    useEffect(() => {
        if (newPassword && confirmPassword) {
            setIsEqual(newPassword === confirmPassword);
        }
    }, [newPassword, confirmPassword]);

    // Função para enviar a senha à API
    const passwordToAPI = async (password: string) => {
        //usa o searchparams para receber o parametro email e token da outra pagina
        const email = searchParams.get('email');
        const token = searchParams.get('token');

        try {

            //teste
            alert('Senha alterada com sucesso!'+email);
            setIsLoading(true);
            //teste termina aqui


            const response = await newPassoword(email!, password,token!); 
            
            if(response.msg === "password trocado com sucesso"){
                //redirecionamento para a pagina de login
                alert('Senha alterada com sucesso!');
                setIsLoading(true);
                redirect("/login") 
            }
            else{
                    alert("Erro ao armazenar senha");
                }
            }

        catch (err) {
            alert('Falha ao atualizar a senha. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    // Submit do formulário
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEqual && newPassword) {
            await passwordToAPI(newPassword);
        }
    };

    return (
        <section>
            <form className={style.form} onSubmit={handleSubmit}>
                <h2 className={style.title}>RECUPERAR SENHA</h2>
                
                <label className={style.label1}>Informe a nova senha:</label>
                <input 
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={style.passwordInput}
                    placeholder="Nova senha"
                />
                
                <label className={style.label1}>Confirme a nova senha:</label>
                <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={style.passwordInput}
                    placeholder="Nova senha"
                />

                {!isEqual && newPassword && confirmPassword && (
                    <p style={{ color: "red" }}>As senhas não coincidem!</p>
                )}

                <button
                    type="submit"
                    className={style.submitButton}
                    disabled={!isEqual || !newPassword || isLoading} // Desabilita durante o loading
                >
                    {isLoading ? "Enviando..." : "Confirmar"}
                </button>

                <Link href="/login" className={style.link}>
                    Já possui uma conta? <span className={style.red}>Entre</span>
                </Link>
            </form>
        </section>
    );
}