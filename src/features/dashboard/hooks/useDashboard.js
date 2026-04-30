import { useContext } from "react";
import { DashboardContext } from "../context/DashboardContext";

export function useDashboard() {
  return useContext(DashboardContext);
}
