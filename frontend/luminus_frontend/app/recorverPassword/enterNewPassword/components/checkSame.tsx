"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import style from "@/app/recorverPassword/enterNewPassword/page.module.css";
import {api} from "@/services/api"
import { redirect } from "next/navigation";

import { useSearchParams } from "next/navigation";

export default function CheckSame() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isEqual, setIsEqual] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const searchParams = useSearchParams();


    // Verifica igualdade em tempo real
    useEffect(() => {
        if (newPassword && confirmPassword) {
            setIsEqual(newPassword === confirmPassword);
        }
    }, [newPassword, confirmPassword]);

    // Função para enviar a senha à API
    const passwordToAPI = async (password: string) => {
        //usa o searchparams para receber o parametro email da outra pagina
        const email = searchParams.get('email');
        try {



            //teste
            alert('Senha alterada com sucesso!'+email);// colocar depois do endpoint q maike mandar
            setIsLoading(true);
            //teste termina aqui


            
            const response = await api.post("/professor/new-password/:id", {id:email ,senha: password }); 
            
            if(response.status >= 200 && response.status < 300){
                if(response.data.valid){
                    //redirecionamento para a pagina de login
                    alert('Senha alterada com sucesso!'+email);// colocar depois do endpoint q maike mandar
                    setIsLoading(true);
                    redirect("/")
                }
                else{
                    alert("Erro ao armazenar senha");
                }
            }



        } catch (err) {
            console.error('Erro ao enviar a senha:', err);
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