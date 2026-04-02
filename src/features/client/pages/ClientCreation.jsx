// src/features/clients/pages/ClientCreation.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Breadcrumbs, Link, Divider } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PeopleAltIcon    from '@mui/icons-material/PeopleAlt';
import ClientForm       from '../components/ClientForm';

export default function ClientCreation() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 4, md: 6 }, py: { xs: 3, sm: 5 } }}>

      <Box mb={3}>
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 14, color: '#94a3b8' }} />}
          sx={{ mb: 1.5 }}
        >
          <Link underline="hover" href="/clients"
            sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
            Clients
          </Link>
          <Typography sx={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 600 }}>
            New Client
          </Typography>
        </Breadcrumbs>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{
            width: 42, height: 42, borderRadius: '12px',
            bgcolor: '#eff6ff', border: '1px solid #bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <PeopleAltIcon sx={{ fontSize: 22, color: '#2563eb' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} color="#0f172a" lineHeight={1.2}>
              Create New Client
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.3}>
              Fill in the details below to add a new client.
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <ClientForm
        onCancel={() => navigate(-1)}
        onSubmit={(payload) => {
          console.log('Client payload:', payload);
          // TODO: POST to API then navigate('/clients')
        }}
      />
    </Box>
  );
}