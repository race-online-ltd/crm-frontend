const ACCESS_TOKEN_KEYS = ["auth_token", "token", "access_token"];
const USER_KEY = "auth_user";
const TAB_ID_KEY = "auth_tab_id";
const ACTIVE_TABS_KEY = "auth_active_tabs";
const LAST_ACTIVITY_KEY = "auth_last_activity";
const AUTH_CLOSE_PENDING_KEY = "auth_close_pending_at";
const BROWSER_CLOSE_GRACE_MS = 3000;

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function getSessionStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

function readTokenFromStorage(storage) {
  if (!storage) {
    return null;
  }

  for (const key of ACCESS_TOKEN_KEYS) {
    const token = storage.getItem(key);
    if (token) {
      return token;
    }
  }

  return null;
}

function readActiveTabs(storage) {
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(ACTIVE_TABS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeActiveTabs(storage, tabs) {
  if (!storage) {
    return;
  }

  storage.setItem(ACTIVE_TABS_KEY, JSON.stringify([...new Set(tabs)]));
}

function createTabId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clearAuthStorage(storage) {
  if (!storage) {
    return;
  }

  ACCESS_TOKEN_KEYS.forEach((key) => storage.removeItem(key));
  storage.removeItem(USER_KEY);
  storage.removeItem(AUTH_CLOSE_PENDING_KEY);
}

export const tokenService = {
  getAccessToken() {
    return readTokenFromStorage(getStorage());
  },

  setAccessToken(token) {
    const storage = getStorage();
    if (!storage) {
      return;
    }

    ACCESS_TOKEN_KEYS.forEach((key) => {
      storage.setItem(key, token);
    });
    storage.removeItem(AUTH_CLOSE_PENDING_KEY);
  },

  removeAccessToken() {
    clearAuthStorage(getStorage());
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
    storage?.removeItem(AUTH_CLOSE_PENDING_KEY);
  },

  removeUser() {
    const storage = getStorage();
    storage?.removeItem(USER_KEY);
    storage?.removeItem(AUTH_CLOSE_PENDING_KEY);
  },

  clearAuth() {
    const storage = getStorage();
    clearAuthStorage(storage);
    storage?.removeItem(ACTIVE_TABS_KEY);
    storage?.removeItem(LAST_ACTIVITY_KEY);
  },

  getTabId() {
    const storage = getSessionStorage();
    if (!storage) {
      return null;
    }

    let tabId = storage.getItem(TAB_ID_KEY);
    if (!tabId) {
      tabId = createTabId();
      storage.setItem(TAB_ID_KEY, tabId);
    }

    return tabId;
  },

  registerTab() {
    const storage = getStorage();
    const tabId = this.getTabId();

    if (!storage || !tabId) {
      return [];
    }

    const tabs = readActiveTabs(storage);
    if (!tabs.includes(tabId)) {
      tabs.push(tabId);
      writeActiveTabs(storage, tabs);
    }

    storage.removeItem(AUTH_CLOSE_PENDING_KEY);
    return tabs;
  },

  unregisterTab() {
    const storage = getStorage();
    const tabId = this.getTabId();

    if (!storage || !tabId) {
      return [];
    }

    const tabs = readActiveTabs(storage).filter((id) => id !== tabId);
    if (tabs.length > 0) {
      writeActiveTabs(storage, tabs);
      return tabs;
    }

    storage.setItem(AUTH_CLOSE_PENDING_KEY, String(Date.now()));
    storage.removeItem(ACTIVE_TABS_KEY);
    return [];
  },

  hasActiveTabs() {
    return readActiveTabs(getStorage()).length > 0;
  },

  getLastActivity() {
    const storage = getStorage();
    if (!storage) {
      return null;
    }

    const raw = storage.getItem(LAST_ACTIVITY_KEY);
    const timestamp = Number(raw);

    return Number.isFinite(timestamp) ? timestamp : null;
  },

  setLastActivity(timestamp = Date.now()) {
    const storage = getStorage();
    storage?.setItem(LAST_ACTIVITY_KEY, String(timestamp));
  },

  removeLastActivity() {
    const storage = getStorage();
    storage?.removeItem(LAST_ACTIVITY_KEY);
  },

  getClosePendingAt() {
    const storage = getStorage();
    if (!storage) {
      return null;
    }

    const raw = storage.getItem(AUTH_CLOSE_PENDING_KEY);
    const timestamp = Number(raw);
    return Number.isFinite(timestamp) ? timestamp : null;
  },

  isClosePendingExpired() {
    const pendingAt = this.getClosePendingAt();
    if (!pendingAt) {
      return false;
    }

    return Date.now() - pendingAt >= BROWSER_CLOSE_GRACE_MS;
  },

  clearClosePending() {
    const storage = getStorage();
    storage?.removeItem(AUTH_CLOSE_PENDING_KEY);
  },

  getBrowserCloseGraceMs() {
    return BROWSER_CLOSE_GRACE_MS;
  },
};
