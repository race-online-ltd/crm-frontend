import React from 'react';
import { UserProfileProvider } from '../features/settings/context/UserProfileContext';

export default function AppProviders({ children }) {
  return (
    <UserProfileProvider>
      {children}
    </UserProfileProvider>
  );
}
