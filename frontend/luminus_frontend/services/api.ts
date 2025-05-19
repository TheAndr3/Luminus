import axios from 'axios';

const API_URL = "https://localhost:3000";

//excluir quando terminar as rotas abaixo
export const api = axios.create( {baseURL: API_URL})



// Função assíncrona para enviar um email de verificação para o professor
export async function sendEmail(id: string) {
    try {
        // Faz uma requisição GET para o endpoint do back-end, passando o email do professor como parâmetro
        const response = await axios.get(`${API_URL}/professor/send-email/${id}`);
        
        // Retorna os dados da resposta da API
        return response.data;
    }
    catch(erro) {
        // Se ocorrer algum erro na requisição (como falha de rede ou erro no servidor), lança uma exceção
        throw new Error("Erro na requisição");
    }
}


// Função assíncrona para enviar o código de recuperação de senha
export async function sendCode(email: string, code: string) {
    
    // Bloco try para tentar executar o código dentro dele
    try {
        // Envio da requisição POST usando axios para a API
        // A URL é formada dinamicamente com o valor de API_URL, passando o email e o código no corpo da requisição
        const response = await axios.post(`${API_URL}/professor/recorver-password`, {
            email: email,      // Envio do email como "id"
            code: code    // Envio do código de recuperação como "codigo"
        });

        // Se a requisição for bem-sucedida, retornamos o corpo da resposta (dados)
        return response.data;

    // Se ocorrer algum erro na requisição (exemplo: API fora do ar, erro de rede, etc.)
    } 
    catch (erro) {
        if (axios.isAxiosError(erro)) {
            // Erro específico do Axios (ex.: status 400, 500)
            throw new Error(erro.response?.data?.message || "Erro na requisição");
        } else {
            // Outros erros (ex.: rede)
            throw new Error("Falha na comunicação com o servidor");
        }
    }
}



// Função assíncrona para enviar a nova senha de recuperação
export async function newPassoword(email: string, newPass: string, token:string) {

    // Bloco try para tentar executar a requisição
    try {
        // Envio da requisição POST usando axios para a API
        // A URL está usando um parâmetro ":token" (ainda precisa ajeitar isso do token)
        const response = await axios.post(`${API_URL}/professor/new-password/${token}`, { 
            email,        // Envio do email do usuário
            newPass      // Envio da nova senha do usuário
        });

        // Se a requisição for bem-sucedida, retorna os dados da resposta
        return response.data;

    // Se ocorrer algum erro na requisição (exemplo: API fora do ar, erro de rede, etc.)
    } 
    catch (erro) {
        if (axios.isAxiosError(erro)) {
            throw new Error(erro.response?.data?.msg || "Erro na requisição");
        } else {
            throw new Error("Falha de rede");
        }
    }
}





//criação de turma
export async function createClass(data:{id:number;  course: string; semester: string; institutio?:string}) {
    try {
        // Faz uma requisição POST para o endpoint do back-end, passando as informações como parametro
        const response = await axios.post(`${API_URL}`); //PRECISO SABER QUAL O ENDPOINT
        
        // Retorna os dados da resposta da API
        return response.data;
    }
    catch(erro) {
        // Se ocorrer algum erro na requisição (como falha de rede ou erro no servidor), lança uma exceção
        throw new Error("Erro na requisição");
    }
}