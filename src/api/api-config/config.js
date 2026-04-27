import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 🔒 redirect loop prevent flag
let isRedirecting = false;
 
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

// ✅ RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    console.log("STATUS:", status, "URL:", url);

    // 🚫 login API skip
    if (url?.includes("/auth/login")) {
      return Promise.reject(error);
    }

    // 🚫 optional API skip
    if (url?.includes("/user-permissions")) {
      return Promise.reject(error);
    }

    // 🔥 MAIN FIX
    if (status === 401 && !isRedirecting) {
      isRedirecting = true;

      // clear session
      localStorage.clear();

      // ✅ IMPORTANT: login route = "/"
      window.location.replace("/");
    }

    return Promise.reject(error);
  }
);