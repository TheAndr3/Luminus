"use client"

import { useEffect, useState } from "react";
import styleOtp from "@/app/recorverPassword/recoveryCode/components/otp.module.css"
import style from "@/app/recorverPassword/recoveryCode/page.module.css"

import { useRouter} from "next/navigation";

import {api} from "@/services/api";



export default function OtpFunction(){

    const [otp, setOtp] =  useState(new Array(4).fill(""));
    const [otpCompleted, setotpCompleted] = useState(otp.length === 4);
    const router = useRouter();

    //verifica se os campos estão preenchidos com todos os numeros, se não o botao de confirmar ficará bloqueado
    useEffect(()=>{
        const allFieldsFilled = otp.every(item => item !== "");
        setotpCompleted(allFieldsFilled);
    }, [otp]);

    


    //Função para não deixar entrar letras, apenas números
    function handleChange(element, index){
        if(isNaN(element.target.value)) return false;
        
        setOtp([...otp.map((data, indx) => (indx === index? element.target.value:data))])


        //Se preenchido o quadrado, muda pro proximo
        if(element.target.value && element.target.nextSibling){
            element.target.nextSibling.focus();
        }
    }


    //Função para mandar o codigo para api e tratar se passa pra proxima pagina ou não
    async function provisoryFunction() {
        const otpConected = otp.join("");
        
        try {
            //abaixo é apenas teste retirar
            router.push("/enterNewPassword")
            alert("Código correto!"+otpConected);
            //teste termina aq

            const response = await api.post("/", { codigo: otpConected }); 

            if (response.status >= 200 && response.status < 300) {
                if (response.data.valid) { 
                    router.push("/enterNewPassword");
                } else {
                    alert("Código incorreto ou expirado!");
                }
            } else {
                alert("Resposta inesperada da API");
            }
        } 
        catch(err) {
        }
    }

    function backToEnterEmail(){
        router.push("/enterEmail");
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
                    <button className={style.buttonGo} onClick={provisoryFunction} disabled={!otpCompleted}> Confirmar</button>
                </div>
            
            </div>
            
    )
}