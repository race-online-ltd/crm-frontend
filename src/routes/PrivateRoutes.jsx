import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Main } from "../layout/Main";

export const PrivateRoutes = () => {
  const isAuthenticated = Boolean(localStorage.getItem("user-info"));
  if (!isAuthenticated) {
    return <Navigate to='/' />;
  }

  return (
    <Main>
      <Outlet />
    </Main>
  );
};
