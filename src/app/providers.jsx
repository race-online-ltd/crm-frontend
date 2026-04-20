import React from 'react';
import { UserProfileProvider } from '../features/settings/context/UserProfileContext';
import { ToastContainer } from 'react-toastify';

export default function AppProviders({ children }) {
  return (
    <UserProfileProvider>
      {children}
      <ToastContainer position="top-right" autoClose={2500} />
    </UserProfileProvider>
  );
}
