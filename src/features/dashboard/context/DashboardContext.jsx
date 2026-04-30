import { createContext, useMemo } from "react";
import { dashboardData } from "../api/dashboardData";

export const DashboardContext = createContext(dashboardData);

export function DashboardProvider({ children }) {
  const value = useMemo(() => dashboardData, []);
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
