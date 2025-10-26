// Configuração da API para diferentes ambientes
const getApiBaseUrl = () => {
  // Verifica se estamos em desenvolvimento local
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Usa o backend local na porta 10000
    return 'http://localhost:10000';
  }
  
  // Para produção, usa a URL do Railway
  return 'https://finapp-backend-production-b3e5.up.railway.app';
};


export const API_BASE_URL = getApiBaseUrl();
export const API_URL = getApiBaseUrl();
