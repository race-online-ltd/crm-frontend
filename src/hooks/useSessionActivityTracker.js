import { useEffect, useRef } from 'react';
import api from '../api/config/axiosInstance';
import { tokenService } from '../api/config/tokenService';

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
const DEFAULT_IDLE_TIMEOUT_MS = 60 * 60 * 1000;
const DEFAULT_CHECK_INTERVAL_MS = 60 * 1000;
const REFRESH_WINDOW_MS = 15 * 60 * 1000;
const REFRESH_LOCK_KEY = 'auth_refresh_lock';
const REFRESH_LOCK_TIMEOUT_MS = 15000;

function readLastActivity() {
  const stored = tokenService.getLastActivity();
  return stored || Date.now();
}

function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string' || token.split('.').length < 2) {
    return null;
  }

  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
}

function readRefreshLock() {
  try {
    const raw = window.localStorage.getItem(REFRESH_LOCK_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function tryAcquireRefreshLock() {
  const tabId = tokenService.getTabId();
  if (!tabId) {
    return false;
  }

  const existingLock = readRefreshLock();
  const now = Date.now();

  if (existingLock && existingLock.tabId !== tabId && (now - Number(existingLock.timestamp || 0)) < REFRESH_LOCK_TIMEOUT_MS) {
    return false;
  }

  window.localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify({ tabId, timestamp: now }));
  return true;
}

function releaseRefreshLock() {
  const tabId = tokenService.getTabId();
  const existingLock = readRefreshLock();

  if (!tabId || !existingLock || existingLock.tabId !== tabId) {
    return;
  }

  window.localStorage.removeItem(REFRESH_LOCK_KEY);
}

export default function useSessionActivityTracker({ isAuthenticated, logout }) {
  const logoutRef = useRef(logout);
  const idleLogoutInProgressRef = useRef(false);
  const refreshInProgressRef = useRef(false);

  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  useEffect(() => {
    if (!isAuthenticated) {
      idleLogoutInProgressRef.current = false;
      return undefined;
    }

    const touchActivity = () => {
      tokenService.setLastActivity(Date.now());
      idleLogoutInProgressRef.current = false;
    };

    const handleStorageChange = (event) => {
      if (event.key === 'auth_last_activity') {
        idleLogoutInProgressRef.current = false;
      }
    };

    const checkIdleState = async () => {
      if (!tokenService.getAccessToken()) {
        return;
      }

      const lastActivity = readLastActivity();
      const idleTime = Date.now() - lastActivity;
      const currentToken = tokenService.getAccessToken();
      const payload = decodeJwtPayload(currentToken);
      const expiresAt = payload?.exp ? payload.exp * 1000 : null;
      const remainingMs = expiresAt ? expiresAt - Date.now() : null;

      if (idleTime > DEFAULT_IDLE_TIMEOUT_MS && !idleLogoutInProgressRef.current) {
        idleLogoutInProgressRef.current = true;
        await logoutRef.current?.();
        return;
      }

      if (
        remainingMs !== null &&
        remainingMs > 0 &&
        remainingMs <= REFRESH_WINDOW_MS &&
        idleTime <= DEFAULT_IDLE_TIMEOUT_MS &&
        !refreshInProgressRef.current &&
        tryAcquireRefreshLock()
      ) {
        refreshInProgressRef.current = true;

        try {
          await api.get('/auth/me', {
            skipAuthRedirect: true,
            skipAuthRefresh: true,
          });
        } catch {
          await logoutRef.current?.();
        } finally {
          refreshInProgressRef.current = false;
          releaseRefreshLock();
        }
      }
    };

    touchActivity();

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, touchActivity, { passive: true });
    });
    window.addEventListener('storage', handleStorageChange);

    const idleTimer = window.setInterval(checkIdleState, DEFAULT_CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, touchActivity);
      });
      window.removeEventListener('storage', handleStorageChange);
      window.clearInterval(idleTimer);
    };
  }, [isAuthenticated]);
}
