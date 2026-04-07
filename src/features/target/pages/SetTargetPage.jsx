// src/features/target/pages/SetTargetPage.jsx
// Page wrapper for the SetTarget form. Matches the modal/page pattern
// you likely use elsewhere (e.g. a centered card with a back button).

import React from 'react';
import {
  Box, Typography, Stack, Divider,
} from '@mui/material';
import ArrowBackIcon    from '@mui/icons-material/ArrowBack';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { useNavigate }  from 'react-router-dom';
import SetTarget        from '../components/SetTarget';

export default function SetTargetPage() {
  const navigate = useNavigate();

  const handleSubmit = (values) => {
    // TODO: dispatch to store / call API
    console.log('New target:', values);
    navigate('/target');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>

      {/* ── Page Header ── */}
      <Box mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Back Button */}
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
              '&:hover': {
                bgcolor: '#f1f5f9',
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </Box>

          {/* Icon */}
          <Box sx={{
            width: 42, height: 42, borderRadius: '12px',
            bgcolor: '#eff6ff', border: '1px solid #bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <TrackChangesIcon sx={{ fontSize: 22, color: '#2563eb' }} />
          </Box>

          {/* Title */}
          <Box>
            <Typography variant="h5" fontWeight={700} color="#0f172a" lineHeight={1.2}>
              Set KAM Target
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.3}>
              Define monthly performance targets for your Key Account Managers
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* ── Form ── */}
      <SetTarget onSubmit={handleSubmit} />
    </Box>
  );
}