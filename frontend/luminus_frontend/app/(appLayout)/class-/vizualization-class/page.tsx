"use client"

import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";





export default function vizualizationClass(){
    function teste(){
        redirect("/class-/vizualization-class/dialog")
    }
 
    return(
        <div>
            <h1> Teste teste</h1>   
            <Button onClick={teste}> Clique aqui TESTE</Button>
        </div>
    )
}