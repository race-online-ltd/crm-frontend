const TOKEN_KEYS = ["auth_token", "token", "access_token"];
const REFRESH_KEY = "refresh_token";

export const getAccessToken = () => {
  for (const key of TOKEN_KEYS) {
    const token = localStorage.getItem(key);
    if (token) {
      return token;
    }
  }

  return null;
};
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setTokens = (access, refresh) => {
  TOKEN_KEYS.forEach((key) => localStorage.setItem(key, access));
  localStorage.setItem(REFRESH_KEY, refresh);
};

export const clearTokens = () => {
  TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem(REFRESH_KEY);
};
