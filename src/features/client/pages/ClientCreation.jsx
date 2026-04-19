import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Divider, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { toast } from 'react-toastify';
import ClientForm from '../components/ClientForm';
import { fetchClient } from '../api/clientApi';

function resolveMode(stateMode, stateClient) {
  if (stateMode === 'view') return 'view';
  if (stateMode === 'edit') return 'edit';
  if (stateClient?.id) return 'edit';
  return 'create';
}

export default function ClientCreation() {
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.returnTo || '/clients';
  const stateClient = location.state?.client || null;
  const mode = resolveMode(location.state?.mode, stateClient);

  const [initialClient, setInitialClient] = useState(stateClient);
  const [isLoading, setIsLoading] = useState(Boolean(stateClient?.id && (mode === 'edit' || mode === 'view')));
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    const loadClient = async () => {
      if (!stateClient?.id || (mode !== 'edit' && mode !== 'view')) {
        setInitialClient(stateClient);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError('');

        const client = await fetchClient(stateClient.id);
        if (!active) return;

        setInitialClient(client || stateClient);
      } catch (error) {
        if (!active) return;

        setInitialClient(stateClient);
        setLoadError(error?.message || 'Unable to load client details.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadClient();

    return () => {
      active = false;
    };
  }, [mode, stateClient]);

  const title = useMemo(() => {
    if (mode === 'edit') return 'Edit Client';
    if (mode === 'view') return 'Client Details';
    return 'Create New Client';
  }, [mode]);

  const subtitle = useMemo(() => {
    if (mode === 'edit') return 'Update the client information below.';
    if (mode === 'view') return 'Review the client information below.';
    return 'Fill in the details below to add a new client.';
  }, [mode]);

  const handleSaved = (savedClient) => {
    const action = mode === 'edit' ? 'updated' : 'created';
    toast.success(`Client ${action} successfully.`);
    navigate(returnTo, {
      replace: true,
      state: {
        savedClientId: savedClient?.id || initialClient?.id || null,
      },
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
      <Box mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            onClick={() => navigate(returnTo)}
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
              flexShrink: 0,
              '&:hover': {
                bgcolor: '#f1f5f9',
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </Box>

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              bgcolor: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <PeopleAltIcon sx={{ fontSize: 22, color: '#2563eb' }} />
          </Box>

          <Box>
            <Typography variant="h5" fontWeight={700} color="#0f172a" lineHeight={1.2}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.3}>
              {subtitle}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {loadError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {loadError}
        </Alert>
      )}

      {isLoading ? (
        <Box
          sx={{
            minHeight: 260,
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            bgcolor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontWeight: 600,
          }}
        >
          Loading client details...
        </Box>
      ) : (
        <ClientForm
          initialClient={initialClient}
          mode={mode}
          onCancel={() => navigate(returnTo)}
          onSaved={handleSaved}
        />
      )}
    </Box>
  );
}
