import axios from "axios";
import { handleApiError } from "@/api/config/apiErrorHandler";
import { tokenService } from "@/api/config/tokenService";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  timeout: 15000,
});

async function refreshAccessToken() {
  const currentToken = tokenService.getAccessToken();
  if (!currentToken) {
    throw new Error("No access token available.");
  }

  const refreshResponse = await api.post(
    "/auth/refresh",
    undefined,
    {
      skipAuthRedirect: true,
      skipAuthRefresh: true,
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    }
  );

  const refreshedData = refreshResponse.data?.data;
  if (!refreshedData?.token) {
    throw new Error("Token refresh failed.");
  }

  tokenService.setAccessToken(refreshedData.token);
  if (refreshedData.user) {
    tokenService.setUser(refreshedData.user);
  }

  return refreshedData.token;
}

function syncAuthFromResponse(response) {
  const headerToken = response?.headers?.authorization || response?.headers?.Authorization;
  if (!headerToken) {
    return;
  }

  const token = headerToken.toLowerCase().startsWith("bearer ")
    ? headerToken.slice(7).trim()
    : headerToken.trim();

  if (token) {
    tokenService.setAccessToken(token);
  }
}

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = tokenService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  tokenService.setLastActivity(Date.now());
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => {
    syncAuthFromResponse(response);
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;

    if (error.response) {
      syncAuthFromResponse(error.response);
    }

    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh &&
      tokenService.getAccessToken()
    ) {
      originalRequest._retry = true;

      try {
        const refreshedToken = await refreshAccessToken();
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${refreshedToken}`,
        };

        return api(originalRequest);
      } catch (refreshError) {
        tokenService.clearAuth();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    if (status === 401 && !originalRequest.skipAuthRedirect) {
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
