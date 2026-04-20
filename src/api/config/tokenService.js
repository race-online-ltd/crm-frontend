const ACCESS_TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const TAB_ID_KEY = "auth_tab_id";
const ACTIVE_TABS_KEY = "auth_active_tabs";

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
    storage?.removeItem(ACTIVE_TABS_KEY);
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

    this.clearAuth();
    return [];
  },

  hasActiveTabs() {
    return readActiveTabs(getStorage()).length > 0;
  },
};
