import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Divider, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { LeadCalendarSkeleton, LeadPipelineSkeleton, LeadStatsSkeleton } from '../components/LeadSectionSkeletons';
import { fetchLeads } from '../api/leadApi';
import { buildPipelineStateFromLeads, createEmptyPipelineState } from '../components/LeadPipeline';

const LeadStatCardsSection = React.lazy(() => import('../components/LeadStatCardsSection'));
const LeadPipelineSection = React.lazy(() => import('../components/LeadPipelineSection'));
const TaskCalendarSection = React.lazy(() => import('../components/TaskCalendarSection'));

export default function LeadListPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState(createEmptyPipelineState());
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);

  const loadLeads = useCallback(async () => {
    try {
      setIsLoadingLeads(true);
      const response = await fetchLeads();
      const rows = Array.isArray(response) ? response : [];
      setLeads(buildPipelineStateFromLeads(rows));
    } catch {
      setLeads(createEmptyPipelineState());
    } finally {
      setIsLoadingLeads(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleEditLead = (lead) => {
    navigate(`/leads/${lead.id}/edit`, {
      state: {
        lead: {
          id: lead.id,
          business_entity_id: lead.businessEntityId || '',
          source_id: lead.sourceId || '',
          source_info: lead.sourceInfo || '',
          lead_assign_id: lead.leadAssignId || '',
          kam_id: lead.kamId || '',
          backoffice_id: lead.backofficeId || '',
          products: lead.productsIds || [],
          client_id: lead.clientId || '',
          expected_revenue: lead.expectedRevenue || String(lead.amount || ''),
          lead_pipeline_stage_id: lead.leadPipelineStageId || lead.stageId || lead.stage || '',
          deadline: lead.deadline ? new Date(lead.deadline) : null,
        },
      },
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#0f172a">Leads</Typography>
          <Typography variant="body2" color="#64748b">Manage and track your leads</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/leads/new')}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
            bgcolor: '#2563eb',
            px: 2.5,
            py: 1,
            '&:hover': { bgcolor: '#1d4ed8' },
          }}
        >
          New Lead
        </Button>
      </Stack>

      <Suspense fallback={<LeadStatsSkeleton />}>
        <LeadStatCardsSection />
      </Suspense>

      <Box sx={{ mt: 3 }}>
        <Suspense fallback={<LeadPipelineSkeleton />}>
          <LeadPipelineSection
            leads={leads}
            setLeads={setLeads}
            loading={isLoadingLeads}
            onFilterClick={() => console.log('Filter clicked')}
            onEditLead={handleEditLead}
          />
        </Suspense>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Suspense fallback={<LeadCalendarSkeleton />}>
        <TaskCalendarSection />
      </Suspense>
    </Box>
  );
}
