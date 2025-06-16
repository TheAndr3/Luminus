import axios from 'axios';

const API_PORT = process.env.NEXT_PUBLIC_API_PORT;
console.log(API_PORT);
const API_URL = `http://localhost:${API_PORT}`;

export const api = axios.create({
  baseURL: API_URL,
});
