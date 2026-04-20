import React from 'react';
import { UserProfileProvider } from '../features/settings/context/UserProfileContext';
import { ToastContainer } from 'react-toastify';
import useSessionActivityTracker from '../hooks/useSessionActivityTracker';
import { useUserProfile } from '../features/settings/context/UserProfileContext';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';

function SessionActivityTracker() {
  const { authReady, isAuthenticated, logout } = useUserProfile();

  useSessionActivityTracker({
    isAuthenticated: authReady && isAuthenticated,
    logout,
  });

  return null;
}

function AuthBootstrapScreen() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8fafc',
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress size={28} />
        <Typography variant="body2" color="#64748b" fontWeight={600}>
          Restoring your session...
        </Typography>
      </Stack>
    </Box>
  );
}

function AuthGate({ children }) {
  const { authReady } = useUserProfile();

  if (!authReady) {
    return <AuthBootstrapScreen />;
  }

  return children;
}

export default function AppProviders({ children }) {
  return (
    <UserProfileProvider>
      <SessionActivityTracker />
      <AuthGate>
        {children}
        <ToastContainer position="top-right" autoClose={2500} />
      </AuthGate>
    </UserProfileProvider>
  );
}
