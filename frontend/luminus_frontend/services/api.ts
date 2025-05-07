import axios from "axios";

const apiPort = process.env.NEXT_PUBLIC_API_PORT
const API_URL = `https://localhost:${apiPort}`;

//excluir quando terminar as rotas abaixo
export const api = axios.create( {baseURL: `${API_URL}`});


