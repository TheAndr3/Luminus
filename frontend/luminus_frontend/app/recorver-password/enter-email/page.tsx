import Image from 'next/image';
import logoLuminus from '@/app/Image/logoLuminus.svg';
import style from '@/app/recorver-password/enter-email/page.module.css';
import Link from 'next/link';

import {sendEmail} from "@/services/api";
import {redirect} from 'next/navigation';




export default function enterEmail(){

    //função para mandar email para API 
    async function emailtoAPI(formData: FormData){
        "use server"
        const email = formData.get("email")?.toString();



        //teste
        redirect(`/recorver-password/recovery-code?email=${encodeURIComponent(email!)}`);
        //teste termina aqui



        //try para enviar para api
        try {
            const response = await sendEmail(email!); // Recebe diretamente o email ou undefined
            
            if (response.status === 200) { //verifica se a response foi 200 (OK)
                redirect(`/recorver-password/recovery-code?email=${encodeURIComponent(email!)}`);
            } 
            else {
                alert("Não encontramos seu email em nossos registros!");
            }
        } 
        catch (error) {
            alert("Erro ao verificar email: ");
        }
        

    }

    return(


        <div className={style.container}>
            <div className={style.left_panel}>
                <h1> PArte esquerda do painel </h1>
                


            </div>


            <div className={style.right_panel}>
                <Image className={style.logo}
                    src={logoLuminus}
                    alt="logo's company"
                />

                <section>
                    <form action={emailtoAPI} className={style.form}>

                        <h2 className={style.title}> RECUPERAR SENHA </h2>
                        <h3 className={style.text}> Informe seu e-mail:</h3>
                        <input
                            type='email'
                            required
                            name='email'
                            placeholder='Email'
                            className={style.input}
                        ></input>

                        <button type='submit' className={style.submitButton}> Enviar código</button>

                        <Link href={'/login'} className={style.link}>  Já possui uma conta? <span className={style.red}> Entre</span></Link>

                    </form>
                </section>

            </div>

            



        </div>
        
    );
}