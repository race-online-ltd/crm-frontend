import React, { Suspense } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useUserProfile } from "./features/settings/context/UserProfileContext";
import ProtectedRoute from "./app/ProtectedRoute";

const Login = React.lazy(() => import("./features/auth/pages/Login"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Social = React.lazy(() => import("./pages/Social"));
const Components = React.lazy(() => import("./pages/Components"));
const LeadCreation = React.lazy(() => import("./features/leads/pages/LeadCreation"));
const LeadListPage = React.lazy(() => import("./features/leads/pages/LeadListPage"));
const ClientCreation = React.lazy(() => import("./features/client/pages/ClientCreation"));
const TaskCreation = React.lazy(() => import("./features/task/pages/TaskCreation"));
const TasksShell = React.lazy(() => import("./features/task/pages/TasksShell"));
const PriceProposalPage = React.lazy(() => import("./features/priceproposal/pages/PriceProposalPage"));
const PriceHistoryPage = React.lazy(() => import("./features/pricehistory/pages/PriceHistoryPage"));
const TargetList = React.lazy(() => import("./features/target/pages/TargetList"));
const SetTargetPage = React.lazy(() => import("./features/target/pages/SetTargetPage"));
const SystemUsersPage = React.lazy(() => import("./features/settings/pages/SystemUsersPage"));
const CreateUserPage = React.lazy(() => import("./features/settings/pages/CreateUserPage"));
const UserMappingPage = React.lazy(() => import("./features/settings/pages/UserMappingPage"));
const ConnectSystemAccountsPage = React.lazy(() => import("./features/settings/pages/ConnectSystemAccountsPage"));
const DataAccessControlPage = React.lazy(() => import("./features/settings/pages/DataAccessControlPage"));
const RoleMappingPage = React.lazy(() => import("./features/settings/pages/RoleMappingPage"));
const SocialSettingsPage = React.lazy(() => import("./features/settings/pages/SocialSettingsPage"));
const BusinessEntityPage = React.lazy(() => import("./features/settings/pages/BusinessEntityPage"));
const TeamPage = React.lazy(() => import("./features/settings/pages/TeamPage"));
const GroupPage = React.lazy(() => import("./features/settings/pages/GroupPage"));
const UserProfile = React.lazy(() => import("./features/settings/pages/UserProfile/UserProfile"));
const ApprovalRequestsPage = React.lazy(() => import("./features/approval/pages/ApprovalRequestsPage"));
const KamPerformancePage = React.lazy(() => import("./features/performance/pages/KamPerformancePage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const Loading = () => (
  <div className="loader-container">
    <span className="loader">Loading</span>
  </div>
);

export default function App() {
  const { isAuthenticated } = useUserProfile();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Suspense fallback={<Loading />}>
        <CssBaseline />

        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
  
            <Route path="/leads" element={<LeadListPage />} />
            <Route path="/leads/new" element={<LeadCreation />} />
            <Route path="/tasks" element={<TasksShell />} />
            <Route path="/tasks/new" element={<TasksShell />} />
            <Route path="/price-proposal" element={<PriceProposalPage />} />
            <Route path="/price-history" element={<PriceHistoryPage />} />
            <Route path="/client/new" element={<ClientCreation />} />
            <Route path="/social" element={<Social />} />
            <Route path="/social_v1" element={<Social />} />
            <Route path="/components" element={<Components />} />
            <Route path="/target" element={<TargetList />} />
            <Route path="/target/set" element={<SetTargetPage />} />
            <Route path="/performance" element={<KamPerformancePage />} />
            <Route path="/settings/users" element={<SystemUsersPage />} />
            <Route path="/settings/users/create" element={<CreateUserPage />} />
            <Route path="/settings/users/mapping" element={<UserMappingPage />} />
            <Route path="/settings/users/connect-system-accounts" element={<ConnectSystemAccountsPage />} />
            <Route path="/settings/data-access-control" element={<DataAccessControlPage />} />
            <Route path="/settings/role-mapping" element={<RoleMappingPage />} />
            <Route path="/settings/social" element={<SocialSettingsPage />} />
            <Route path="/settings/business-entities" element={<BusinessEntityPage />} />
            <Route path="/settings/team" element={<TeamPage />} />
            <Route path="/settings/group" element={<GroupPage />} />
            <Route path="/approval/requests" element={<ApprovalRequestsPage />} />
            <Route path="/settings/user-profile" element={<UserProfile />} />
            <Route path="/profile" element={<UserProfile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </LocalizationProvider>
  );
}
