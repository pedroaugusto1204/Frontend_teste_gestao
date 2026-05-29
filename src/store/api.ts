import axios from 'axios';

const getStoredToken = (): string | null => {
  try {
    const token = localStorage.getItem('contratos_pro_token');
    return token ? JSON.parse(token) : null;
  } catch {
    return null;
  }
};

// Configura o baseURL a partir de variáveis de ambiente do Vite ou usa porta 3001 como fallback
const baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o Token JWT automaticamente em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token && !token.startsWith('fictional-') && !token.startsWith('token-')) {
      // Injeta apenas tokens reais emitidos pelo backend (não os placeholders locais)
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta para lidar com desautenticação automática
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Se receber 401 Unauthorized, limpa credenciais locais expiradas/inválidas
      try {
        localStorage.removeItem('contratos_pro_token');
        localStorage.removeItem('contratos_pro_user');
      } catch (e) {
        console.error('Falha ao limpar credenciais locais', e);
      }
      
      // Opcionalmente redireciona para a tela de login se não estiver nela
      if (!window.location.hash.includes('#/login') && !window.location.hash.includes('#/sign')) {
        window.location.href = '/#/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
