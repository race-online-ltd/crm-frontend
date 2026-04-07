// src/features/leads/pages/LeadCreation.jsx
import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Divider } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LeadForm from '../components/LeadForm';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


export default function LeadCreation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState(0);
  const editLead = location.state?.lead ?? null;
  const isEdit = Boolean(editLead);
  const initialValues = useMemo(() => (
    editLead
      ? {
          businessEntity: editLead.businessEntity || '',
          source: editLead.source || '',
          products: editLead.products || [],
          client: editLead.client || '',
          expectedRevenue: editLead.expectedRevenue || '',
          stage: editLead.stage || '',
          deadline: editLead.deadline ? new Date(editLead.deadline) : null,
          attachment: Array.isArray(editLead.attachment) ? editLead.attachment : [],
        }
      : null
  ), [editLead]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>

      {/* ── Page Header ── */}
      <Box mb={3}>
        {/* <Breadcrumbs
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
        </Breadcrumbs> */}

      <Stack direction="row" alignItems="center" spacing={1.5}>
  
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
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }}>
    <TrendingUpIcon sx={{ fontSize: 22, color: '#2563eb' }} />
  </Box>

  {/* Title */}
  <Box>
    <Typography variant="h5" fontWeight={700} color="#0f172a" lineHeight={1.2}>
      {isEdit ? 'Edit Lead' : 'Create New Lead'}
    </Typography>
  </Box>

  <Box flex={1} />

          {!isEdit && (
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
          )}
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* ── Form ── */}
      <LeadForm
        tab={isEdit ? 0 : tab}
        initialValues={initialValues}
        isEdit={isEdit}
        onCancel={() => navigate(-1)}
        onSubmit={(payload, formData) => {
          console.log(isEdit ? 'Lead updated:' : 'Lead submitted:', payload);
          console.log('Lead multipart payload:', Array.from(formData.entries()));
        }}
      />
    </Box>
  );
}
