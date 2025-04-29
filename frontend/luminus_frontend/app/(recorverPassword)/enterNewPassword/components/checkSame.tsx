"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import style from "@/app/(recorverPassword)/enterNewPassword/page.module.css";
import {api} from "@/services/api"

export default function CheckSame() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isEqual, setIsEqual] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Verifica igualdade em tempo real
    useEffect(() => {
        if (newPassword && confirmPassword) {
            setIsEqual(newPassword === confirmPassword);
        }
    }, [newPassword, confirmPassword]);

    // Função para enviar a senha à API
    const passwordToAPI = async (password: string) => {
        try {
            alert('Senha alterada com sucesso!');// colocar depois do endpoint q maike mandar
            setIsLoading(true);
            await api.post("/", { password }); // Ajustar conforme o que maike mandar
            
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