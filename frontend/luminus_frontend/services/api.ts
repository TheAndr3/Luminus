import axios from 'axios';

const API_IP = process.env.NEXT_PUBLIC_API_IP;
const API_PORT = process.env.NEXT_PUBLIC_API_PORT;

console.log(API_PORT);
console.log(API_IP);

const API_URL = `http://${API_IP}:${API_PORT}`;

export const api = axios.create({
  baseURL: API_URL,
});
