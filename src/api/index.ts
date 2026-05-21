import axios from "axios";

// Ele vai tentar buscar a URL das variáveis de ambiente. 
// Se não encontrar (em dev local), ele usa o localhost como plano de fundo.
const baseURL = import.meta.env?.VITE_API_URL // Se estiver usando Vite
  || process.env.REACT_APP_API_URL            // Se estiver usando Create React App
  || "http://localhost:3000";                 // Seu fallback local

export const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("@App:token");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});