import axios from "axios";
import { handleApiError } from "@/api/config/apiErrorHandler";
import { tokenService } from "@/api/config/tokenService";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = tokenService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const formattedError = handleApiError(error);
    return Promise.reject(formattedError);
  }
);

export default api;
