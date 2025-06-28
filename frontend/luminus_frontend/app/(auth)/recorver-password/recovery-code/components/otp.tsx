"use client"

import { useEffect, useState } from "react";
import styleOtp from "@/app/recorver-password/recovery-code/components/otp.module.css"
import style from "@/app/recorver-password/recovery-code/page.module.css"

import { useRouter, useSearchParams} from "next/navigation";

import {sendCode} from "@/services/api";



export default function OtpFunction(){

    const [otp, setOtp] =  useState(new Array(4).fill(""));
    const [otpCompleted, setotpCompleted] = useState(otp.length === 4);
    const router = useRouter();

    const searchParams = useSearchParams();

    //verifica se os campos estão preenchidos com todos os numeros, se não o botao de confirmar ficará bloqueado
    useEffect(()=>{
        const allFieldsFilled = otp.every(item => item !== "");
        setotpCompleted(allFieldsFilled);
    }, [otp]);

    


    //Função para não deixar entrar letras, apenas números
    function handleChange(element:any, index:any){
        if(isNaN(element.target.value)) return false;
        
        setOtp([...otp.map((data, indx) => (indx === index? element.target.value:data))])


        //Se preenchido o quadrado, muda pro proximo
        if(element.target.value && element.target.nextSibling){
            element.target.nextSibling.focus();
        }
    }


    //Função para mandar o codigo para api e tratar se passa pra proxima pagina ou não
    async function codeToAPI() {
        const otpConected = otp.join("");
        const email = searchParams.get('email')
        
        try {



            //teste

            router.push(`/recorver-password/enter-new-password?email=${email}`)
            alert("Código correto!"+otpConected);
            //teste termina aq


            //comentario pq como ta dando erro com a comunicação API, vejo depois
            /*
            const response = await sendCode.post("/professor/recorver-password/:id", {id:email, codigo: otpConected }); 

            if (response.status >= 200 && response.status < 300) {
                if (response.data.valid) { 
                    router.push(`/recorver-password/enter-new-password?email=${email}`);
                } else {
                    alert("Código incorreto ou expirado!");
                }
            } else {
                alert("Resposta inesperada da API");
            }

            */
        } 
        catch(err) {
        }
        
    }


    //função para fazer voltar a tela de inserção de email 
    function backToEnterEmail(){
        router.push("/recorver-password/enter-email");
    }

    return(
            <div>
                <div className={styleOtp.otp_area}>
                    {
                        otp.map((data, i) =>{
                            return(<input type="text" value={data} onChange={(element) => handleChange(element, i)} maxLength={1}/>)
                        })
                    }                
                </div>
                <div className={styleOtp.buttonContainer}>
                    <button className={style.buttonBack} onClick={backToEnterEmail}> Voltar</button>
                    <button className={style.buttonGo} onClick={codeToAPI} disabled={!otpCompleted}> Confirmar</button>
                </div>
            
            </div>
            
    )
}