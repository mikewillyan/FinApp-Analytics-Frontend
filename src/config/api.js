// Configuração da API para diferentes ambientes
// Prioriza a variável de ambiente VITE_API_URL (definida no Vercel)
// Se não estiver definida, usa fallback baseado no ambiente
const getApiBaseUrl = () => {
  // 1. Verifica se VITE_API_URL está definida (variável de ambiente no Vercel)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Verifica se estamos em desenvolvimento local
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Usa o backend local na porta 10000
    return 'http://localhost:10000';
  }
  
  // 3. Fallback para produção (caso VITE_API_URL não esteja definida)
  // Esta URL será substituída pela variável de ambiente no Vercel
  return 'https://finapp-backend-production-5abe.up.railway.app';
};


export const API_BASE_URL = getApiBaseUrl();
export const API_URL = getApiBaseUrl();
