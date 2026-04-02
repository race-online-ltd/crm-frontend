import httpClient from "@/services/httpClient";
import { setTokens, clearTokens } from "@/services/tokenService";

// LOGIN
export const login = async (credentials) => {
  const { data } = await httpClient.post("/auth/login", credentials);

  setTokens(data.accessToken, data.refreshToken);

  return data.user;
};

// REFRESH
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");

  const { data } = await httpClient.post("/auth/refresh", {
    refreshToken,
  });

  setTokens(data.accessToken, data.refreshToken);

  return data.accessToken;
};

// LOGOUT
export const logout = () => {
  clearTokens();
  window.location.href = "/login";
};