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
    const token = sessionStorage.getItem('access_token');

    config.headers = {
      ...config.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    console.log("STATUS:", status, "URL:", url);

    // ❗ 1. login API skip
    if (url?.includes("/auth/login")) {
      return Promise.reject(error);
    }

    // ❗ 2. permission বা optional APIs skip
    if (url?.includes("/user-permissions")) {
      return Promise.reject(error);
    }

    // ❗ 3. main 401 handler
    if (status === 401) {
      const currentPath = window.location.pathname;

      if (currentPath !== "/login") {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("user-info");

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);