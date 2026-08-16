import axios from 'axios';

let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

if (baseURL && !baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
  baseURL = `https://${baseURL}`;
}

baseURL = baseURL.replace(/\/+$/, '');

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('storage'));
    }
    return Promise.reject(error);
  },
);

export default api;
