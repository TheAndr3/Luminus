import axios from "axios";

const API_URL = `http://localhost:8081`;

export const api = axios.create( {baseURL: `${API_URL}`});


