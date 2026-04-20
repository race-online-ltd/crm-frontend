import React from 'react';
import { UserProfileProvider } from '../features/settings/context/UserProfileContext';
import { ToastContainer } from 'react-toastify';
import useSessionActivityTracker from '../hooks/useSessionActivityTracker';
import { useUserProfile } from '../features/settings/context/UserProfileContext';

function SessionActivityTracker() {
  const { isAuthenticated, logout } = useUserProfile();

  useSessionActivityTracker({
    isAuthenticated,
    logout,
  });

  return null;
}

export default function AppProviders({ children }) {
  return (
    <UserProfileProvider>
      <SessionActivityTracker />
      {children}
      <ToastContainer position="top-right" autoClose={2500} />
    </UserProfileProvider>
  );
}
