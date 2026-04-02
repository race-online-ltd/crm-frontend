// src/features/leads/pages/LeadCreation.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Breadcrumbs, Link, Divider } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LeadForm from '../components/LeadForm';

export default function LeadCreation() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 4, md: 6 }, py: { xs: 3, sm: 5 } }}>

      {/* ── Page Header ── */}
      <Box mb={3}>
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 14, color: '#94a3b8' }} />}
          sx={{ mb: 1.5 }}
        >
          <Link underline="hover" href="/leads"
            sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
            Leads
          </Link>
          <Typography sx={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 600 }}>
            New Lead
          </Typography>
        </Breadcrumbs>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{
            width: 42, height: 42, borderRadius: '12px',
            bgcolor: '#eff6ff', border: '1px solid #bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <TrendingUpIcon sx={{ fontSize: 22, color: '#2563eb' }} />
          </Box>

          <Box>
            <Typography variant="h5" fontWeight={700} color="#0f172a" lineHeight={1.2}>
              Create New Lead
            </Typography>
            {/* <Typography variant="body2" color="text.secondary" mt={0.3}>
              Fill in the details below to add a new lead to your pipeline.
            </Typography> */}
          </Box>

          <Box flex={1} />

          {/* ── Tab switcher — top right ── */}
          <Box sx={{ display: 'inline-flex', bgcolor: '#f1f5f9', borderRadius: '12px', p: '4px' }}>
            {['Single Lead', 'Bulk Upload'].map((label, i) => (
              <Box
                key={label}
                onClick={() => setTab(i)}
                sx={{
                  px: 2.5, py: 0.8, borderRadius: '9px', cursor: 'pointer',
                  fontSize: '0.825rem',
                  fontWeight: tab === i ? 700 : 500,
                  color:     tab === i ? '#1e293b' : '#64748b',
                  bgcolor:   tab === i ? '#fff' : 'transparent',
                  boxShadow: tab === i ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.18s ease',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </Box>
            ))}
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* ── Form ── */}
      <LeadForm
        tab={tab}
        onCancel={() => navigate(-1)}
        onSubmit={(values) => {
          console.log('Lead submitted:', values);
        }}
      />
    </Box>
  );
}