import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');

    config.headers = {
      ...config.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return config;
  },
  (error) => Promise.reject(error)
);
