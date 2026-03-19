import axios from 'axios';

const isProduction = import.meta.env.PROD;
const api = axios.create({
  // Force absolute Render URL in production when frontend is on Netlify
  baseURL: isProduction 
    ? (import.meta.env.VITE_API_URL || 'https://pinkmanos.onrender.com/api') 
    : 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't hard-redirect on initial auth check; let the app decide.
      const url = error.config?.url || '';
      const isAuthMeCall = typeof url === 'string' && url.includes('/auth/me');
      if (!isAuthMeCall && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
