import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserProfile } from '../features/settings/context/UserProfileContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useUserProfile();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
}
