import React from 'react';
import { Navigate,Outlet } from "react-router-dom";

export const PublicRoutes = () => {
    const isAuthenticated = Boolean(localStorage.getItem("user-info"));
  if (isAuthenticated) {
    return <Navigate to='/admin/dashboard' />;
  }

  return <Outlet />;
  
}
