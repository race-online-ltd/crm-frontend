const ACCESS_TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

export const tokenService = {
  getAccessToken() {
    const storage = getStorage();
    return storage ? storage.getItem(ACCESS_TOKEN_KEY) : null;
  },

  setAccessToken(token) {
    const storage = getStorage();
    storage?.setItem(ACCESS_TOKEN_KEY, token);
  },

  removeAccessToken() {
    const storage = getStorage();
    storage?.removeItem(ACCESS_TOKEN_KEY);
  },

  getUser() {
    const storage = getStorage();
    const raw = storage ? storage.getItem(USER_KEY) : null;
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setUser(user) {
    const storage = getStorage();
    storage?.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser() {
    const storage = getStorage();
    storage?.removeItem(USER_KEY);
  },

  clearAuth() {
    const storage = getStorage();
    storage?.removeItem(ACCESS_TOKEN_KEY);
    storage?.removeItem(USER_KEY);
  },
};
