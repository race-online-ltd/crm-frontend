import React, { useCallback, useMemo } from 'react';
import { useFormik } from 'formik';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import {
  fetchBusinessEntitiesForAccountConnection,
  fetchExternalUsersForBusinessEntity,
  saveSystemAccountConnections,
} from '../api/systemAccountApi';

const EMPTY_CONNECTION_ROW = () => ({
  id: crypto.randomUUID(),
  businessEntityId: '',
  externalUserId: '',
});

export default function ConnectSystemAccountsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || null;

  const formik = useFormik({
    initialValues: {
      connections: [EMPTY_CONNECTION_ROW()],
    },
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        setStatus(undefined);
        const payload = {
          systemUserId: user?.id || null,
          connections: values.connections.map((row) => ({
            businessEntityId: row.businessEntityId || null,
            externalUserId: row.externalUserId || null,
          })),
        };

        await saveSystemAccountConnections(payload);
        navigate('/settings/users');
      } catch (error) {
        setStatus({
          error: error?.message || 'Unable to save connected system accounts.',
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleAddRow = useCallback(() => {
    formik.setFieldValue('connections', [
      ...formik.values.connections,
      EMPTY_CONNECTION_ROW(),
    ]);
  }, [formik]);

  const handleRemoveRow = useCallback((index) => {
    const nextRows = formik.values.connections.filter((_, rowIndex) => rowIndex !== index);
    formik.setFieldValue('connections', nextRows.length > 0 ? nextRows : [EMPTY_CONNECTION_ROW()]);
  }, [formik]);

  const handleEntityChange = useCallback((index, businessEntityId) => {
    const nextRows = formik.values.connections.map((row, rowIndex) => (
      rowIndex === index
        ? { ...row, businessEntityId, externalUserId: '' }
        : row
    ));

    formik.setFieldValue('connections', nextRows);
  }, [formik]);

  const handleExternalUserChange = useCallback((index, externalUserId) => {
    const nextRows = formik.values.connections.map((row, rowIndex) => (
      rowIndex === index
        ? { ...row, externalUserId }
        : row
    ));

    formik.setFieldValue('connections', nextRows);
  }, [formik]);

  const cardSx = useMemo(() => ({
    bgcolor: '#fff',
    border: '1px solid #d1d9e0',
    borderRadius: '16px',
    p: { xs: 2, sm: 2.5 },
  }), []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#ffffff',
        px: { xs: 2, sm: 3, md: 3 },
        py: { xs: 3, sm: 3 },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box
          onClick={() => navigate(-1)}
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
            '&:hover': { bgcolor: '#f1f5f9' },
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
          <HubOutlinedIcon sx={{ fontSize: 22, color: '#2563eb' }} />
        </Box>

        <Box>
          <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
            Connect System Accounts
          </Typography>
          {user && (
            <Typography variant="caption" color="#64748b">
              Connecting external accounts for: <strong>{user.full_name || user.fullName || user.id}</strong>
            </Typography>
          )}
        </Box>
      </Stack>

      <Box component="form" noValidate onSubmit={formik.handleSubmit}>
        <Box sx={cardSx}>
          <Typography variant="subtitle1" fontWeight={700} color="#0f172a" mb={0.5}>
            Business Entity Account Connections
          </Typography>
          <Typography variant="body2" color="#64748b" mb={2}>
            Select a business entity, then load its user list from that entity&apos;s own system and map the external account.
          </Typography>

          <Alert severity="info" sx={{ mb: 2, borderRadius: '12px' }}>
            Backend ready: the second dropdown is wired to call an API per selected business entity.
          </Alert>

          {formik.status?.error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
              {formik.status.error}
            </Alert>
          )}

          <Stack spacing={1.5}>
            {formik.values.connections.map((row, index) => {
              const businessEntityFetcher = async () => fetchBusinessEntitiesForAccountConnection();
              const externalUserFetcher = async () => {
                if (!row.businessEntityId) {
                  return [];
                }

                return fetchExternalUsersForBusinessEntity(row.businessEntityId);
              };

              return (
                <Box
                  key={row.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr) 72px' },
                    gap: 1.5,
                    alignItems: 'start',
                  }}
                >
                  <SelectDropdownSingle
                    name={`connections[${index}].businessEntityId`}
                    label="Business Entity"
                    fetchOptions={businessEntityFetcher}
                    value={row.businessEntityId}
                    onChange={(id) => handleEntityChange(index, id)}
                  />

                  <SelectDropdownSingle
                    name={`connections[${index}].externalUserId`}
                    label="User From Business Entity System"
                    fetchOptions={externalUserFetcher}
                    value={row.externalUserId}
                    onChange={(id) => handleExternalUserChange(index, id)}
                    disabled={!row.businessEntityId}
                    helperText={!row.businessEntityId ? 'Select a business entity first' : undefined}
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mt: '10px' }}>
                    {index === formik.values.connections.length - 1 && (
                      <IconButton
                        onClick={handleAddRow}
                        size="small"
                        sx={{
                          color: '#2563eb',
                          '&:hover': { bgcolor: '#eff6ff' },
                        }}
                      >
                        <AddCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => handleRemoveRow(index)}
                      disabled={formik.values.connections.length === 1}
                      size="small"
                      sx={{
                        color: formik.values.connections.length === 1 ? '#cbd5e1' : '#ef4444',
                        '&:hover': { bgcolor: '#fef2f2' },
                      }}
                    >
                      <RemoveCircleOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
          </Stack>

          <Divider sx={{ my: 2.5, borderColor: '#e2e8f0' }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate('/settings/users')}
              sx={{
                minWidth: { xs: '100%', sm: 120 },
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '10px',
                borderColor: '#e2e8f0',
                color: '#64748b',
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              sx={{
                minWidth: { xs: '100%', sm: 150 },
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '10px',
                bgcolor: '#2563eb',
                boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
                '&:hover': { bgcolor: '#1d4ed8' },
              }}
            >
              {formik.isSubmitting ? 'Saving...' : 'Save Connections'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
