// src/features/leads/pages/LeadCreation.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Stack, Divider } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LeadForm from '../components/LeadForm';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchLead } from '../api/leadApi';


export default function LeadCreation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { leadId } = useParams();
  const [tab, setTab] = useState(0);
  const [loadedLead, setLoadedLead] = useState(null);
  const [loadingLead, setLoadingLead] = useState(Boolean(leadId) && !location.state?.lead);
  const editLead = location.state?.lead ?? loadedLead ?? null;
  const isEdit = Boolean(editLead);

  useEffect(() => {
    let active = true;

    const loadLead = async () => {
      if (!leadId || location.state?.lead) {
        return;
      }

      try {
        setLoadingLead(true);
        const data = await fetchLead(leadId);
        if (active) {
          setLoadedLead(data);
        }
      } catch {
        if (active) {
          setLoadedLead(null);
        }
      }
      if (active) {
        setLoadingLead(false);
      }
    };

    loadLead();

    return () => {
      active = false;
    };
  }, [leadId, location.state?.lead]);

  const initialValues = useMemo(() => (
    editLead
      ? {
          id: editLead.id,
          business_entity_id: editLead.business_entity_id || '',
          source_id: editLead.source_id || '',
          source_info: editLead.source_info || '',
          lead_assign_id: editLead.lead_assign_id || '',
          kam_id: editLead.kam_id || editLead.assigned_to_user_id || '',
          backoffice_id: editLead.backoffice_id || '',
          products: Array.isArray(editLead.product_ids)
            ? editLead.product_ids
            : (Array.isArray(editLead.products) ? editLead.products.map((item) => item.id || item) : []),
          client_id: editLead.client_id || '',
          expected_revenue: editLead.expected_revenue || '',
          lead_pipeline_stage_id: editLead.lead_pipeline_stage_id || '',
          deadline: editLead.deadline ? new Date(editLead.deadline) : null,
          attachment: Array.isArray(editLead.attachment)
              ? editLead.attachment.map((file) => ({
                name: file.file_name || file.name,
                size: file.file_size || 0,
                lastModified: file.lastModified || 0,
              }))
            : [],
        }
      : null
  ), [editLead]);

  if (leadId && loadingLead && !editLead) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: 4, textAlign: 'center', color: '#64748b' }}>
        Loading lead...
      </Box>
    );
  }

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
        onSubmit={() => {
          navigate('/leads');
        }}
      />
    </Box>
  );
}
