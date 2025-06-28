import axios from 'axios';

const API_PORT = process.env.NEXT_PUBLIC_API_PORT;
const API_IP = process.env.API_API
console.log(API_PORT);
const API_URL = `http://${API_IP}:${API_PORT}`;

export const api = axios.create({
  baseURL: API_URL,
});
