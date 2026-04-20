/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { defaultProfile } from '../api/userProfileApi';
import {
  changePassword as changePasswordApi,
  getProfile as getProfileApi,
  login as loginApi,
  logout as logoutApi,
  me as meApi,
} from '../../../api/authAPI';
import { tokenService } from '../../../api/config/tokenService';

const UserProfileContext = createContext(null);

function readStoredUser() {
  const stored = tokenService.getUser();
  return stored ? normalizeProfile(stored) : defaultProfile;
}

function normalizeProfile(input = {}) {
  if (!input) {
    return { ...defaultProfile };
  }

  const source = input.full_name || input.user_name || input.role_id !== undefined
    ? {
        id: input.id ?? null,
        fullName: input.full_name ?? input.fullName ?? defaultProfile.fullName,
        userName: input.user_name ?? input.userName ?? defaultProfile.userName,
        email: input.email ?? input.emailAddress ?? '',
        mobile: input.phone ?? input.mobile ?? '',
        phone: input.phone ?? input.mobile ?? '',
        roleId: input.role_id ?? input.roleId ?? null,
        role: input.role_name ?? input.role ?? defaultProfile.role,
        status: typeof input.status === 'boolean' ? input.status : defaultProfile.status,
        avatar: input.avatar ?? input.avatarUrl ?? '',
      }
    : {
        id: input.id ?? null,
        fullName: input.fullName ?? defaultProfile.fullName,
        userName: input.userName ?? defaultProfile.userName,
        email: input.email ?? '',
        mobile: input.mobile ?? input.phone ?? '',
        // phone: input.phone ?? input.mobile ?? '',
        roleId: input.roleId ?? null,
        role: input.role ?? defaultProfile.role,
        status: typeof input.status === 'boolean' ? input.status : defaultProfile.status,
        avatar: input.avatar ?? '',
      };

  return {
    ...defaultProfile,
    ...source,
  };
}

function persistUser(profile) {
  tokenService.setUser(profile);
}

export function UserProfileProvider({ children }) {
  const [token, setToken] = useState(() => (
    tokenService.getAccessToken() || ''
  ));
  const [profile, setProfile] = useState(readStoredUser);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(token));

  const syncAuthState = useCallback((nextToken, nextProfile) => {
    setToken(nextToken || '');
    setProfile(nextProfile || defaultProfile);
    setIsAuthenticated(Boolean(nextToken));

    if (nextToken) {
      tokenService.setAccessToken(nextToken);
      persistUser(nextProfile || defaultProfile);
    } else {
      tokenService.clearAuth();
    }
  }, []);

  const applyProfileUpdate = useCallback((updates = {}) => {
    setProfile((prev) => {
      const next = normalizeProfile({
        ...prev,
        ...updates,
        full_name: updates.full_name ?? updates.fullName ?? prev.fullName,
        user_name: updates.user_name ?? updates.userName ?? prev.userName,
        phone: updates.phone ?? updates.mobile ?? prev.phone,
        role_id: updates.role_id ?? updates.roleId ?? prev.roleId,
        role_name: updates.role_name ?? updates.role ?? prev.role,
      });

      persistUser(next);
      return next;
    });
  }, []);

  const login = useCallback(async ({ login: loginValue, password }) => {
    const response = await loginApi({ login: loginValue, password });
    const nextProfile = normalizeProfile(response?.user || {});
    syncAuthState(response?.token || '', nextProfile);
    return nextProfile;
  }, [syncAuthState]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await logoutApi();
      }
    } finally {
      syncAuthState('', defaultProfile);
    }
  }, [syncAuthState, token]);

  const initAuth = useCallback(() => {
    const storedToken = tokenService.getAccessToken() || '';
    const storedUser = tokenService.getUser() ? readStoredUser() : defaultProfile;
    setToken(storedToken);
    setProfile(storedUser);
    setIsAuthenticated(Boolean(storedToken));

    if (!storedToken) {
      tokenService.removeUser();
    }
  }, []);

  const me = useCallback(async () => {
    const user = await meApi();
    if (user) {
      applyProfileUpdate(user);
    }
    return user;
  }, [applyProfileUpdate]);

  const getProfile = useCallback(async () => {
    const user = await getProfileApi();
    if (user) {
      applyProfileUpdate(user);
    }
    return user;
  }, [applyProfileUpdate]);

  const updateUser = useCallback(async (updates) => {
    if (updates && (updates.full_name || updates.user_name || updates.role_id !== undefined)) {
      const next = normalizeProfile(updates);
      setProfile(next);
      persistUser(next);
      return next;
    }

    applyProfileUpdate(updates);
    return normalizeProfile({ ...profile, ...updates });
  }, [applyProfileUpdate, profile]);

  const updateProfile = useCallback((updates) => {
    applyProfileUpdate(updates);
  }, [applyProfileUpdate]);

  const changePassword = useCallback(async (payload) => changePasswordApi(payload), []);

  useEffect(() => {
    initAuth();
    tokenService.registerTab();
  }, [initAuth]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== 'auth_token' && event.key !== 'auth_user' && event.key !== null) {
        return;
      }

      const nextToken = tokenService.getAccessToken() || '';
      const nextProfile = tokenService.getUser() ? readStoredUser() : defaultProfile;

      setToken(nextToken);
      setProfile(nextProfile);
      setIsAuthenticated(Boolean(nextToken));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handlePageHide = () => {
      tokenService.unregisterTab();
    };

    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  const value = useMemo(() => ({
    profile,
    token,
    isAuthenticated,
    login,
    logout,
    initAuth,
    me,
    getProfile,
    changePassword,
    setProfile: updateProfile,
    updateProfile,
    updateUser,
  }), [
    changePassword,
    getProfile,
    initAuth,
    isAuthenticated,
    login,
    logout,
    me,
    profile,
    token,
    updateProfile,
    updateUser,
  ]);

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }

  return context;
}

export { defaultProfile };
