import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const Login = React.lazy(() => import("./features/auth/pages/Login"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const TestPage = React.lazy(() => import("./pages/TestPage"));
const Social = React.lazy(() => import("./pages/Social"));
const Components = React.lazy(() => import("./pages/Components"));
const LeadCreation = React.lazy(() => import("./features/leads/pages/LeadCreation"));
const ClientCreation = React.lazy(() => import("./features/client/pages/ClientCreation"));
const TaskCreation = React.lazy(() => import("./features/task/pages/TaskCreation"));
const TasksShell = React.lazy(() => import("./features/task/pages/TasksShell"));
const TargetList = React.lazy(() => import("./features/target/pages/TargetList"));
const SetTargetPage = React.lazy(() => import("./features/target/pages/SetTargetPage"));

const Loading = () => (
  <div className="loader-container">
    <span className="loader">Loading</span>
  </div>
);

export default function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Suspense fallback={<Loading />}>
        <CssBaseline />

        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/leads/new" element={<LeadCreation />} />
            <Route path="/tasks" element={<TasksShell />} />
            <Route path="/tasks/new" element={<TasksShell />} />
            <Route path="/client/new" element={<ClientCreation />} />
            <Route path="/social" element={<Social />} />
            <Route path="/social_v1" element={<Social />} />
            <Route path="/components" element={<Components />} />
            <Route path="/target" element={<TargetList />} />
            <Route path="/target/set" element={<SetTargetPage />} />
          </Route>

          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </Suspense>
    </LocalizationProvider>
  );
}