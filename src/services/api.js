import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gks_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthorized access & parse errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      
      // If token expired or unauthorized on protected routes
      if (status === 401) {
        const currentToken = localStorage.getItem('gks_token');
        if (currentToken) {
          localStorage.removeItem('gks_token');
          localStorage.removeItem('gks_user');
          window.dispatchEvent(new CustomEvent('gks:auth-expired', {
            detail: { message: error.response.data?.message || 'Session expired. Please log in again.' }
          }));
        }
      }
    }
    return Promise.reject(error);
  }
);

export const extractErrorMessage = (error, fallback = 'An unexpected error occurred. Please try again.') => {
  if (!error) return fallback;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return fallback;
};

export default api;
