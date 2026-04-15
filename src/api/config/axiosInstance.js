import axios from "axios";
import { handleApiError } from "@/api/config/apiErrorHandler";
import { tokenService } from "@/api/config/tokenService";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
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
    if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
      tokenService.clearAuth();

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    const formattedError = handleApiError(error);
    return Promise.reject(formattedError);
  }
);

export default api;
