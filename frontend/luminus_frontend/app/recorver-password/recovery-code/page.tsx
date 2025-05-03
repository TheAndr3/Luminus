import Image from "next/image";
import logoimg from "@/public/logo-Luminus.svg";
import style from "./page.module.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import OtpFunction from "./components/otp";



export default function recoveryCode(){

    return(

       <div className={style.container}>
            <div className={style.left_panel}>
                <h1> Parte da esquerda</h1>

            </div>

             <div className={style.right_panel}>
                <section className={style.section}>

                    <Image
                        src={logoimg}
                        alt="logo's company"
                        className={style.logo}
                    />
                    
                    <h2 className={style.title}> RECUPERAR SENHA</h2>
                    <h3 className={style.text}> Digite o código de recuperação</h3>


                    <div className={style.buttonContainer}> 
                        {/*<OtpFunction/>*/}
                    </div>
                    
                
                
                    <Link href={'/recorver-password/enter-email'} className={style.link}> Não recebeu código? <span className={style.red}> Reenviar código</span></Link>
                </section>
            </div>


       </div>

       
    );
}