import axios from "axios";

const API_URL = "https://localhost:3000";

//excluir quando terminar as rotas abaixo
export const api = axios.create( {baseURL: "https://localhost:3000"})



export async function sendEmail(email: string | undefined){
    try{
        const response = await axios.get(`${API_URL}/professor/send-email/${email}`);
        return response.data;
    }
    catch(erro){
        throw new Error("Erro na requisição");
    }
}


export async function sendCode(email:string, code:string){
    //Aqui ta dando erro no otp (front) preciso ver como ajeitar 
    try{
        //const response = await axios.post(`${API_URL}/professor/recorver-password/:id`,{id:email, codigo: code});
        //return response;
    }
    catch(erro){
        //throw new Error("Erro na requisição");
    }
}