import axios from "axios";
import { getRefreshToken, setTokens, clearTokens } from "../tokenService";

export const responseInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = getRefreshToken();

          const { data } = await axiosInstance.post("/auth/refresh", {
            refreshToken,
          });

          setTokens(data.accessToken, data.refreshToken);

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

          return axiosInstance(originalRequest);
        } catch (err) {
          clearTokens();
          window.location.href = "/login";
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );
};
