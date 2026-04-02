import { getAccessToken } from "../tokenService";

export const requestInterceptor = (config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};
