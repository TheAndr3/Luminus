"use client"

import {SubHeader} from "@/app/(appLayout)/class-/vizualization-class/components/subHeader"
import DialogPage from "./components/createClassModal";





export default function vizualizationClass(){
 
    return(
        <div>
            <div className="flex items-center justify-center mt-10 w-[80%] ml-auto bg-gray-200">
                <h1 className="text-4xl font-bold"> Turmas </h1>

                
            </div>
            <SubHeader></SubHeader>
             
            
        </div>
    )
}