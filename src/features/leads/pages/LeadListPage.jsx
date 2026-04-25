import React, { Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Divider, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { LeadCalendarSkeleton, LeadPipelineSkeleton, LeadStatsSkeleton } from '../components/LeadSectionSkeletons';

const LeadStatCardsSection = React.lazy(() => import('../components/LeadStatCardsSection'));
const LeadPipelineSection = React.lazy(() => import('../components/LeadPipelineSection'));
const TaskCalendarSection = React.lazy(() => import('../components/TaskCalendarSection'));

export default function LeadListPage() {
  /* ── MOCK LEAD DATA — inline so it can be removed easily when backend is wired ── */
  const [leads, setLeads] = useState({
    new: { title: 'New', items: [] },
    contacted: { title: 'Contacted', items: [] },
    qualified: {
      title: 'Qualified',
      items: [
        {
          id: 'lead-1',
          name: 'StartupXYZ',
          user: 'John Smith',
          source: 'Website',
          sourceId: 'bt3',
          businessEntity: 'Alpha Corp',
          businessEntityId: 'be1',
          client: 'Global Systems Inc',
          clientId: 'c1',
          productsIds: ['p1', 'p3'],
          amount: 24000,
          expectedRevenue: '24000',
          stage: 'qualified',
          deadline: '2026-04-25T00:00:00.000Z',
          status: 'In Progress',
          products: 'Product Alpha, Product Gamma',
          subtitle: '-',
        },
      ],
    },
    proposal: {
      title: 'Proposal',
      items: [
        {
          id: 'lead-2',
          name: 'Tech Corporation',
          user: 'John Smith',
          source: 'Direct',
          sourceId: 'bt1',
          businessEntity: 'Beta Holdings',
          businessEntityId: 'be2',
          client: 'Nexus Solutions',
          clientId: 'c2',
          productsIds: ['p2'],
          amount: 150000,
          expectedRevenue: '150000',
          stage: 'proposal',
          deadline: '2026-05-02T00:00:00.000Z',
          status: 'In Progress',
          products: 'Product Beta',
          subtitle: '-',
        },
      ],
    },
    negotiation: { title: 'Negotiation', items: [] },
    closed: {
      title: 'Closed',
      items: [
        {
          id: 'lead-3',
          name: 'MedTech Solutions',
          user: 'John Smith',
          source: 'LinkedIn',
          sourceId: 'bt3',
          businessEntity: 'Gamma Ltd',
          businessEntityId: 'be3',
          client: 'Global Systems Inc',
          clientId: 'c1',
          productsIds: ['p4'],
          amount: 275000,
          expectedRevenue: '275000',
          stage: 'closed_won',
          deadline: '2026-03-28T00:00:00.000Z',
          status: 'Won',
          products: 'Product Delta',
          subtitle: '-',
        },
        {
          id: 'lead-4',
          name: 'dataSafe Inc',
          user: 'Rimon Ahmed',
          source: 'WhatsApp',
          sourceId: 'bt2',
          businessEntity: 'Alpha Corp',
          businessEntityId: 'be1',
          client: 'Nexus Solutions',
          clientId: 'c2',
          productsIds: ['p1', 'p2'],
          amount: 275000,
          expectedRevenue: '275000',
          stage: 'closed_won',
          deadline: '2026-03-30T00:00:00.000Z',
          status: 'Won',
          products: 'Product Alpha, Product Beta',
          subtitle: '-',
        },
      ],
    },
  });
  /* ── END MOCK LEAD DATA ── */

  const navigate = useNavigate();

  const openLeadInNewTab = (leadId) => {
    if (!leadId) return;
    window.open(`/leads/${leadId}/edit`, '_blank', 'noopener,noreferrer');
  };

  const handleEditLead = (lead) => {
    openLeadInNewTab(lead.id);
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
