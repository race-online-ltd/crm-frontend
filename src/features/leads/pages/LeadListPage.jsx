// // src/features/leads/pages/LeadListPage.jsx
// import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Box, Stack, Divider, Button, Typography } from '@mui/material';
// import AddIcon from '@mui/icons-material/Add';
// import { LeadCalendarSkeleton, LeadPipelineSkeleton, LeadStatsSkeleton } from '../components/LeadSectionSkeletons';
// import { fetchLeadPipeline, fetchLeadFormOptions } from '../api/leadApi';
// import { createEmptyPipelineState, buildPipelineFromApiResponse } from '../components/LeadPipeline';
// import LeadFilterDrawer from '../components/LeadFilterDrawer';
// import { DEFAULT_LEAD_FILTERS } from '../constants/leadFilters';
// import { fetchGroups, fetchTeams } from '../../settings/api/settingsApi';

// const LeadStatCardsSection = React.lazy(() => import('../components/LeadStatCardsSection'));
// const LeadPipelineSection  = React.lazy(() => import('../components/LeadPipelineSection'));
// const TaskCalendarSection  = React.lazy(() => import('../components/TaskCalendarSection'));

// // ─── Normalise a single lead from pipeline API ────────────────────────────────

// function normalisePipelineLead(raw, stageDefs = []) {
//   const stageId  = String(raw.lead_pipeline_stage_id ?? '');
//   const stageDef = stageDefs.find((s) => s.id === stageId);

//   const products = Array.isArray(raw.products)
//     ? raw.products.map((p) => p?.product_name ?? p?.label ?? '').filter(Boolean)
//     : [];

//   const expectedRevenue =
//     Number(String(raw.expected_revenue ?? 0).replace(/[^0-9.-]/g, '')) || 0;

//   const stageName = (raw.stage_name ?? stageDef?.title ?? '').toLowerCase();
//   let status = 'In Progress';
//   if (stageName === 'won')  status = 'Won';
//   if (stageName === 'lost') status = 'Lost';

//   return {
//     id:                  String(raw.id),
//     businessEntityId:    String(raw.business_entity_id ?? ''),
//     name:                raw.client_name ?? raw.client ?? 'Untitled Lead',
//     subtitle:            raw.business_entity_name ?? '-',
//     businessEntity:      raw.business_entity_name ?? '-',
//     user:                raw.kam_name ?? '-',
//     kamId:               String(raw.kam_id ?? ''),
//     backofficeId:        String(raw.backoffice_id ?? ''),
//     leadAssignId:        String(raw.lead_assign_id ?? ''),
//     source:              raw.source_name ?? '-',
//     sourceId:            String(raw.source_id ?? ''),
//     sourceInfo:          raw.source_info ?? '',
//     stageId,
//     stage:               stageId,
//     leadPipelineStageId: stageId,
//     stageLabel:          raw.stage_name ?? stageDef?.title ?? stageId,
//     stageColor:          stageDef?.color ?? '#2563eb',
//     clientId:            String(raw.client_id ?? ''),
//     client:              raw.client_name ?? '-',
//     amount:              expectedRevenue,
//     expectedRevenue:     String(expectedRevenue),
//     productsIds:         (raw.products ?? []).map((p) => String(p?.product_id ?? '')).filter(Boolean),
//     products:            products.length ? products.join(', ') : '-',
//     deadline:            raw.deadline ?? null,
//     createdAt:           raw.created_at ?? null,
//     assignedDate:        raw.created_at ? new Date(raw.created_at).toLocaleDateString() : '-',
//     status,
//     duration:            '-',
//   };
// }

// // ─── Map API summary → StatCards shape ───────────────────────────────────────

// function statsFromPipelineSummary(summary = {}) {
//   const won       = Number(summary.won_lead_count       ?? 0);
//   const lost      = Number(summary.lost_lead_count      ?? 0);
//   const active    = Number(summary.active_lead_count    ?? 0);
//   const forward   = Number(summary.forward_lead_count   ?? 0);
//   const pending   = Number(summary.backoffice_pending_count ?? 0);
//   const cancelled = Number(summary.cancelled_lead_count ?? 0);

//   return {
//     forwarded: {
//       count:           forward,
//       amount:          summary.forward_lead_revenew ?? 0,
//       lastMonthCount:  0,
//       lastMonthAmount: 0,
//       last24hCount:    summary.forward_last_twentity_four_hour_lead_count ?? 0,
//       last24hAmount:   0,
//     },
//     pending: {
//       count:           pending,
//       amount:          summary.backoffice_pending_revenue ?? 0,
//       lastMonthCount:  0,
//       lastMonthAmount: 0,
//       last24hCount:    summary.backoffice_pending_last_twienty_four_hour_count ?? 0,
//       last24hAmount:   0,
//     },
//     pipeline: {
//       count:           won + lost + active,
//       amount:          summary.active_lead_revenue ?? 0,
//       lastMonthCount:  0,
//       lastMonthAmount: 0,
//       last24hCount:    summary.active_last_twienty_four_hour_lead_count ?? 0,
//       last24hAmount:   0,
//     },
//     won: {
//       count:           won,
//       amount:          summary.won_lead_revenew ?? 0,
//       lastMonthCount:  0,
//       lastMonthAmount: 0,
//       last24hCount:    0,
//       last24hAmount:   0,
//     },
//     lost: {
//       count:           lost,
//       amount:          summary.lost_lead_revenue ?? 0,
//       lastMonthCount:  0,
//       lastMonthAmount: 0,
//       last24hCount:    0,
//       last24hAmount:   0,
//     },
//     cancelled: {
//       count:           cancelled,
//       amount:          summary.cancelled_lead_revenue ?? 0,
//       lastMonthCount:  0,
//       lastMonthAmount: 0,
//       last24hCount:    0,
//       last24hAmount:   0,
//     },
//   };
// }

// // ─── Build API params from filters ───────────────────────────────────────────

// function buildPipelineParams(filters = {}) {
//   const params = {};
//   const hasFilter = filters.business_entity_id || filters.kam_id || filters.team_id;

//   if (filters.business_entity_id) params.business_entity_id = filters.business_entity_id;
//   if (filters.kam_id)             params.kam_id             = filters.kam_id;
//   if (filters.team_id)            params.team_id            = filters.team_id;

//   if (hasFilter && filters.date_from && filters.date_to) {
//     params.from_date = new Date(filters.date_from).toISOString().split('T')[0];
//     params.to_date   = new Date(filters.date_to).toISOString().split('T')[0];
//   }

//   return params;
// }

// // ─── Page ─────────────────────────────────────────────────────────────────────

// export default function LeadListPage() {
//   const navigate = useNavigate();

//   // Pipeline
//   const [pipelineStages,  setPipelineStages]  = useState([]);
//   const [leads,           setLeads]           = useState(createEmptyPipelineState());
//   const [pipelineStats,   setPipelineStats]   = useState(null);
//   const [isLoadingLeads,  setIsLoadingLeads]  = useState(true);
//   const [stagePagination, setStagePagination] = useState({});

//   // Filters
//   const [filterDrawerOpen,        setFilterDrawerOpen]        = useState(false);
//   const [draftFilters,            setDraftFilters]            = useState(DEFAULT_LEAD_FILTERS);
//   const [appliedFilters,          setAppliedFilters]          = useState(DEFAULT_LEAD_FILTERS);
//   const [defaultBusinessEntityId, setDefaultBusinessEntityId] = useState('');

//   // Track whether options have loaded so we know when to trigger pipeline
//   const [optionsReady, setOptionsReady] = useState(false);

//   // Dropdown options
//   const [businessEntityOptions, setBusinessEntityOptions] = useState([]);
//   const [kamOptions,            setKamOptions]            = useState([]);
//   const [teamOptions,           setTeamOptions]           = useState([]);
//   const [groupOptions,          setGroupOptions]          = useState([]);

//   const selectedBusinessEntityId = appliedFilters.business_entity_id || '';

//   // ── Load full pipeline ─────────────────────────────────────────────────────
//   const loadPipeline = useCallback(async (params = {}) => {
//     try {
//       setIsLoadingLeads(true);

//       const data = await fetchLeadPipeline({ per_page: 10, page: 1, ...params });
//       const { stageDefinitions, pipelineState } = buildPipelineFromApiResponse(data);

//       setPipelineStages(stageDefinitions);
//       setLeads(pipelineState);
//       setPipelineStats(statsFromPipelineSummary(data.summary ?? {}));

//       const initialPagination = {};
//       (data.stages ?? []).forEach((s) => {
//         const id = String(s.stage?.id ?? '');
//         initialPagination[id] = {
//           page:    1,
//           hasMore: (s.pagination?.total ?? 0) > (s.leads?.length ?? 0),
//         };
//       });
//       setStagePagination(initialPagination);

//     } catch {
//       setPipelineStages([]);
//       setLeads(createEmptyPipelineState());
//       setPipelineStats(null);
//       setStagePagination({});
//     } finally {
//       setIsLoadingLeads(false);
//     }
//   }, []);

//   // ── Load more leads for a single stage (infinite scroll) ──────────────────
//   const loadMoreStageLeads = useCallback(async (stageId) => {
//     const current = stagePagination[stageId];
//     if (!current?.hasMore) return;

//     const nextPage = (current.page ?? 1) + 1;
//     const params = {
//       ...buildPipelineParams(appliedFilters),
//       page:     nextPage,
//       per_page: 10,
//     };

//     try {
//       const data = await fetchLeadPipeline(params);
//       const newStageData = (data.stages ?? []).find(
//         (s) => String(s.stage?.id) === String(stageId),
//       );
//       if (!newStageData) return;

//       const { stageDefinitions } = buildPipelineFromApiResponse(data);
//       const newLeads = (newStageData.leads ?? []).map(
//         (lead) => normalisePipelineLead(lead, stageDefinitions),
//       );

//       setLeads((prev) => ({
//         ...prev,
//         [stageId]: {
//           ...prev[stageId],
//           items: [...(prev[stageId]?.items ?? []), ...newLeads],
//         },
//       }));

//       setStagePagination((prev) => ({
//         ...prev,
//         [stageId]: {
//           page:    nextPage,
//           hasMore: newLeads.length >= 10,
//         },
//       }));
//     } catch {
//       // silent fail
//     }
//   }, [stagePagination, appliedFilters]);

//   // ── Load dropdown options FIRST, then trigger pipeline ────────────────────
//   // This is the key fix: pipeline only loads AFTER we have the default entity ID
//   useEffect(() => {
//     let mounted = true;
//     const load = async () => {
//       try {
//         const [leadOptions, teams, groups] = await Promise.all([
//           fetchLeadFormOptions(),
//           fetchTeams(),
//           fetchGroups(),
//         ]);
//         if (!mounted) return;

//         const entityOptions  = Array.isArray(leadOptions?.business_entities)
//           ? leadOptions.business_entities : [];
//         const earthEntity    = entityOptions.find((e) => /earth/i.test(String(e.label || '')));
//         const nextDefaultId  = String(earthEntity?.id || entityOptions[0]?.id || '');

//         setBusinessEntityOptions(entityOptions);
//         setDefaultBusinessEntityId(nextDefaultId);

//         // Build the initial filters with the earth entity pre-selected
//         const initialFilters = {
//           ...DEFAULT_LEAD_FILTERS,
//           business_entity_id: nextDefaultId,
//         };

//         setDraftFilters(initialFilters);
//         setAppliedFilters(initialFilters);

//         setTeamOptions(
//           (Array.isArray(teams) ? teams : []).map((item) => ({
//             id:      String(item.id),
//             label:   item.label || item.team_name || item.name || `Team ${item.id}`,
//             kam_ids: Array.isArray(item.kam_id) ? item.kam_id.map(String) : [],
//           })),
//         );
//         setGroupOptions(
//           (Array.isArray(groups) ? groups : []).map((item) => ({
//             id:       String(item.id),
//             label:    item.label || item.group_name || item.name || `Group ${item.id}`,
//             team_ids: Array.isArray(item.team_id) ? item.team_id.map(String) : [],
//           })),
//         );

//         // Signal that options are ready — pipeline load will trigger below
//         setOptionsReady(true);

//       } catch {
//         if (!mounted) return;
//         setBusinessEntityOptions([]);
//         setKamOptions([]);
//         setDefaultBusinessEntityId('');
//         setTeamOptions([]);
//         setGroupOptions([]);
//         // Still mark ready so pipeline loads (will load without entity filter)
//         setOptionsReady(true);
//       }
//     };
//     load();
//     return () => { mounted = false; };
//   }, []);

//   // ── Trigger pipeline load only after options+defaultId are ready ──────────
//   useEffect(() => {
//     if (!optionsReady) return;
//     const filters = {
//       ...DEFAULT_LEAD_FILTERS,
//       business_entity_id: defaultBusinessEntityId,
//     };
//     loadPipeline(buildPipelineParams(filters));
//   }, [optionsReady, defaultBusinessEntityId, loadPipeline]);

//   // ── KAM options per entity ─────────────────────────────────────────────────
//   useEffect(() => {
//     let mounted = true;
//     const load = async () => {
//       if (!selectedBusinessEntityId) { setKamOptions([]); return; }
//       try {
//         const opts = await fetchLeadFormOptions(selectedBusinessEntityId);
//         if (!mounted) return;
//         setKamOptions(Array.isArray(opts?.kam_users) ? opts.kam_users : []);
//       } catch {
//         if (!mounted) return;
//         setKamOptions([]);
//       }
//     };
//     load();
//     return () => { mounted = false; };
//   }, [selectedBusinessEntityId]);

//   // ── Membership maps ────────────────────────────────────────────────────────
//   const teamMembershipByKamId = useMemo(() => (
//     teamOptions.reduce((acc, team) => {
//       (team.kam_ids ?? []).forEach((kamId) => {
//         const key = String(kamId);
//         if (!acc[key]) acc[key] = [];
//         if (!acc[key].includes(String(team.id))) acc[key].push(String(team.id));
//       });
//       return acc;
//     }, {})
//   ), [teamOptions]);

//   const groupMembershipByKamId = useMemo(() => (
//     groupOptions.reduce((acc, group) => {
//       const gTeamIds = (group.team_ids ?? []).map(String);
//       Object.entries(teamMembershipByKamId).forEach(([kamId, tIds]) => {
//         if (tIds.some((tid) => gTeamIds.includes(tid))) {
//           if (!acc[kamId]) acc[kamId] = [];
//           if (!acc[kamId].includes(String(group.id))) acc[kamId].push(String(group.id));
//         }
//       });
//       return acc;
//     }, {})
//   ), [groupOptions, teamMembershipByKamId]);

//   const activeFilterCount = useMemo(() => (
//     Object.values(appliedFilters).filter(
//       (v) => v !== null && v !== '' && !(Array.isArray(v) && v.length === 0),
//     ).length
//   ), [appliedFilters]);

//   // ── Edit lead ──────────────────────────────────────────────────────────────
//   const handleEditLead = (lead) => {
//     navigate(`/leads/${lead.id}/edit`, {
//       state: {
//         lead: {
//           id:                     lead.id,
//           business_entity_id:     lead.businessEntityId || '',
//           source_id:              lead.sourceId || '',
//           source_info:            lead.sourceInfo || '',
//           lead_assign_id:         lead.leadAssignId || '',
//           kam_id:                 lead.kamId || '',
//           backoffice_id:          lead.backofficeId || '',
//           products:               lead.productsIds || [],
//           client_id:              lead.clientId || '',
//           expected_revenue:       lead.expectedRevenue || String(lead.amount || ''),
//           lead_pipeline_stage_id: lead.leadPipelineStageId || lead.stageId || lead.stage || '',
//           deadline:               lead.deadline ? new Date(lead.deadline) : null,
//         },
//       },
//     });
//   };

//   // ── Render ─────────────────────────────────────────────────────────────────
//   return (
//     <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>

//       {/* Header */}
//       <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
//         <Box>
//           <Typography variant="h5" fontWeight={700} color="#0f172a">Leads</Typography>
//           <Typography variant="body2" color="#64748b">Manage and track your leads</Typography>
//         </Box>
//         <Button
//           variant="contained"
//           startIcon={<AddIcon />}
//           onClick={() => navigate('/leads/new')}
//           sx={{
//             textTransform: 'none',
//             fontWeight: 600,
//             borderRadius: '10px',
//             bgcolor: '#2563eb',
//             px: 2.5,
//             py: 1,
//             '&:hover': { bgcolor: '#1d4ed8' },
//           }}
//         >
//           New Lead
//         </Button>
//       </Stack>

//       {/* Stat cards */}
//       <Suspense fallback={<LeadStatsSkeleton />}>
//         <LeadStatCardsSection stats={pipelineStats} />
//       </Suspense>

//       {/* Pipeline */}
//       <Box sx={{ mt: 3 }}>
//         <Suspense fallback={<LeadPipelineSkeleton />}>
//           <LeadPipelineSection
//             leads={leads}
//             setLeads={setLeads}
//             loading={isLoadingLeads}
//             stages={pipelineStages}
//             filters={appliedFilters}
//             teamMembershipByKamId={teamMembershipByKamId}
//             groupMembershipByKamId={groupMembershipByKamId}
//             activeFilterCount={activeFilterCount}
//             onFilterClick={() => {
//               setDraftFilters(appliedFilters);
//               setFilterDrawerOpen(true);
//             }}
//             onEditLead={handleEditLead}
//             onReload={loadPipeline}
//             stagePagination={stagePagination}
//             onLoadMore={loadMoreStageLeads}
//           />
//         </Suspense>
//       </Box>

//       {/* Filter drawer */}
//       <LeadFilterDrawer
//         open={filterDrawerOpen}
//         onClose={() => setFilterDrawerOpen(false)}
//         filters={draftFilters}
//         onChange={(field, value) =>
//           setDraftFilters((prev) => ({ ...prev, [field]: value }))
//         }
//         onApply={(nextFilters) => {
//           const hasFilter =
//             nextFilters.business_entity_id ||
//             nextFilters.kam_id ||
//             nextFilters.team_id;
//           if (hasFilter && (!nextFilters.date_from || !nextFilters.date_to)) {
//             alert('Please select a date range when using filters.');
//             return;
//           }
//           setAppliedFilters(nextFilters);
//           setFilterDrawerOpen(false);
//           loadPipeline(buildPipelineParams(nextFilters));
//         }}
//         onReset={() => {
//           const reset = {
//             ...DEFAULT_LEAD_FILTERS,
//             business_entity_id: defaultBusinessEntityId,
//           };
//           setDraftFilters(reset);
//           setAppliedFilters(reset);
//           setFilterDrawerOpen(false);
//           loadPipeline(buildPipelineParams(reset));
//         }}
//         businessEntityOptions={businessEntityOptions}
//         groupOptions={groupOptions}
//         teamOptions={teamOptions}
//         kamOptions={kamOptions}
//       />

//       <Divider sx={{ my: 3 }} />

//       <Suspense fallback={<LeadCalendarSkeleton />}>
//         <TaskCalendarSection />
//       </Suspense>

//     </Box>
//   );
// }






import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Divider, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { LeadCalendarSkeleton, LeadPipelineSkeleton, LeadStatsSkeleton } from '../components/LeadSectionSkeletons';
import { fetchLeadPipeline, fetchLeadFormOptions } from '../api/leadApi';
import { createEmptyPipelineState, buildPipelineFromApiResponse } from '../components/LeadPipeline';
import LeadFilterDrawer from '../components/LeadFilterDrawer';
import { DEFAULT_LEAD_FILTERS } from '../constants/leadFilters';
import { fetchGroups, fetchTeams } from '../../settings/api/settingsApi';

const LeadStatCardsSection = React.lazy(() => import('../components/LeadStatCardsSection'));
const LeadPipelineSection  = React.lazy(() => import('../components/LeadPipelineSection'));
const TaskCalendarSection  = React.lazy(() => import('../components/TaskCalendarSection'));

// ─── Normalise a single lead from pipeline API ────────────────────────────────

function normalisePipelineLead(raw, stageDefs = []) {
  const stageId  = String(raw.lead_pipeline_stage_id ?? '');
  const stageDef = stageDefs.find((s) => s.id === stageId);

  const products = Array.isArray(raw.products)
    ? raw.products.map((p) => p?.product_name ?? p?.label ?? '').filter(Boolean)
    : [];

  const expectedRevenue =
    Number(String(raw.expected_revenue ?? 0).replace(/[^0-9.-]/g, '')) || 0;

  const stageName = (raw.stage_name ?? stageDef?.title ?? '').toLowerCase();
  let status = 'In Progress';
  if (stageName === 'won')  status = 'Won';
  if (stageName === 'lost') status = 'Lost';

  return {
    id:                  String(raw.id),
    businessEntityId:    String(raw.business_entity_id ?? ''),
    name:                raw.client_name ?? raw.client ?? 'Untitled Lead',
    subtitle:            raw.business_entity_name ?? '-',
    businessEntity:      raw.business_entity_name ?? '-',
    user:                raw.kam_name ?? '-',
    kamId:               String(raw.kam_id ?? ''),
    backofficeId:        String(raw.backoffice_id ?? ''),
    leadAssignId:        String(raw.lead_assign_id ?? ''),
    source:              raw.source_name ?? '-',
    sourceId:            String(raw.source_id ?? ''),
    sourceInfo:          raw.source_info ?? '',
    stageId,
    stage:               stageId,
    leadPipelineStageId: stageId,
    stageLabel:          raw.stage_name ?? stageDef?.title ?? stageId,
    stageColor:          stageDef?.color ?? '#2563eb',
    clientId:            String(raw.client_id ?? ''),
    client:              raw.client_name ?? '-',
    amount:              expectedRevenue,
    expectedRevenue:     String(expectedRevenue),
    productsIds:         (raw.products ?? []).map((p) => String(p?.product_id ?? '')).filter(Boolean),
    products:            products.length ? products.join(', ') : '-',
    deadline:            raw.deadline ?? null,
    createdAt:           raw.created_at ?? null,
    assignedDate:        raw.created_at ? new Date(raw.created_at).toLocaleDateString() : '-',
    status,
    duration:            '-',
  };
}

// ─── Map API summary → StatCards shape ───────────────────────────────────────

function statsFromPipelineSummary(summary = {}) {
  const won       = Number(summary.won_lead_count       ?? 0);
  const lost      = Number(summary.lost_lead_count      ?? 0);
  const active    = Number(summary.active_lead_count    ?? 0);
  const forward   = Number(summary.forward_lead_count   ?? 0);
  const pending   = Number(summary.backoffice_pending_count ?? 0);
  const cancelled = Number(summary.cancelled_lead_count ?? 0);

  return {
    forwarded: {
      count:           forward,
      amount:          summary.forward_lead_revenew ?? 0,
      lastMonthCount:  0,
      lastMonthAmount: 0,
      last24hCount:    summary.forward_last_twentity_four_hour_lead_count ?? 0,
      last24hAmount:   0,
    },
    pending: {
      count:           pending,
      amount:          summary.backoffice_pending_revenue ?? 0,
      lastMonthCount:  0,
      lastMonthAmount: 0,
      last24hCount:    summary.backoffice_pending_last_twienty_four_hour_count ?? 0,
      last24hAmount:   0,
    },
    pipeline: {
      count:           won + lost + active,
      amount:          summary.active_lead_revenue ?? 0,
      lastMonthCount:  0,
      lastMonthAmount: 0,
      last24hCount:    summary.active_last_twienty_four_hour_lead_count ?? 0,
      last24hAmount:   0,
    },
    won: {
      count:           won,
      amount:          summary.won_lead_revenew ?? 0,
      lastMonthCount:  0,
      lastMonthAmount: 0,
      last24hCount:    0,
      last24hAmount:   0,
    },
    lost: {
      count:           lost,
      amount:          summary.lost_lead_revenue ?? 0,
      lastMonthCount:  0,
      lastMonthAmount: 0,
      last24hCount:    0,
      last24hAmount:   0,
    },
    cancelled: {
      count:           cancelled,
      amount:          summary.cancelled_lead_revenue ?? 0,
      lastMonthCount:  0,
      lastMonthAmount: 0,
      last24hCount:    0,
      last24hAmount:   0,
    },
  };
}

// ─── Build API params from filters ───────────────────────────────────────────

function buildPipelineParams(filters = {}) {
  const params = {};
  const hasFilter = filters.business_entity_id || filters.kam_id || filters.team_id;

  if (filters.business_entity_id) params.business_entity_id = filters.business_entity_id;
  if (filters.kam_id)             params.kam_id             = filters.kam_id;
  if (filters.team_id)            params.team_id            = filters.team_id;

  if (hasFilter && filters.date_from && filters.date_to) {
    params.from_date = new Date(filters.date_from).toISOString().split('T')[0];
    params.to_date   = new Date(filters.date_to).toISOString().split('T')[0];
  }

  return params;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeadListPage() {
  const navigate = useNavigate();

  // Pipeline
  const [pipelineStages,  setPipelineStages]  = useState([]);
  const [leads,           setLeads]           = useState(createEmptyPipelineState());
  const [pipelineStats,   setPipelineStats]   = useState(null);
  const [isLoadingLeads,  setIsLoadingLeads]  = useState(true);
  const [stagePagination, setStagePagination] = useState({});

  // Filters
  const [filterDrawerOpen,        setFilterDrawerOpen]        = useState(false);
  const [draftFilters,            setDraftFilters]            = useState(DEFAULT_LEAD_FILTERS);
  const [appliedFilters,          setAppliedFilters]          = useState(DEFAULT_LEAD_FILTERS);
  const [defaultBusinessEntityId, setDefaultBusinessEntityId] = useState('');

  // Track whether options have loaded so we know when to trigger pipeline
  const [optionsReady, setOptionsReady] = useState(false);

  // Dropdown options
  const [businessEntityOptions, setBusinessEntityOptions] = useState([]);
  const [kamOptions,            setKamOptions]            = useState([]);
  const [teamOptions,           setTeamOptions]           = useState([]);
  const [groupOptions,          setGroupOptions]          = useState([]);

  const selectedBusinessEntityId = appliedFilters.business_entity_id || '';

  // ── Load full pipeline ─────────────────────────────────────────────────────
  const loadPipeline = useCallback(async (params = {}) => {
    try {
      setIsLoadingLeads(true);

      // 🔧 CHANGED: Use 'response' variable name for clarity
      const response = await fetchLeadPipeline({ per_page: 10, page: 1, ...params });
      
      // 🔧 CHANGED: Added debug log
      console.log('🔍 Pipeline API response:', response);

      const { stageDefinitions, pipelineState } = buildPipelineFromApiResponse(response);
      
      // 🔧 CHANGED: Added debug logs
      console.log('🎯 Parsed stageDefinitions:', stageDefinitions);
      console.log('📋 Parsed pipelineState keys:', Object.keys(pipelineState));

      setPipelineStages(stageDefinitions);
      setLeads(pipelineState);
      setPipelineStats(statsFromPipelineSummary(response.summary ?? {}));

      const initialPagination = {};
      // 🔧 CHANGED: Use response.stages instead of data.stages
      (response.stages ?? []).forEach((s) => {
        const id = String(s.stage?.id ?? '');
        initialPagination[id] = {
          page:    1,
          hasMore: (s.pagination?.total ?? 0) > (s.leads?.length ?? 0),
        };
      });
      setStagePagination(initialPagination);

    } catch (error) {
      console.error('❌ Pipeline load error:', error);
      setPipelineStages([]);
      setLeads(createEmptyPipelineState());
      setPipelineStats(null);
      setStagePagination({});
    } finally {
      setIsLoadingLeads(false);
      // 🔧 CHANGED: Added debug log
      console.log('✅ isLoadingLeads set to false');
    }
  }, []);

  // ── Load more leads for a single stage (infinite scroll) ──────────────────
  const loadMoreStageLeads = useCallback(async (stageId) => {
    const current = stagePagination[stageId];
    if (!current?.hasMore) return;

    const nextPage = (current.page ?? 1) + 1;
    const params = {
      ...buildPipelineParams(appliedFilters),
      page:     nextPage,
      per_page: 10,
    };

    try {
      // 🔧 CHANGED: Use 'response' variable name
      const response = await fetchLeadPipeline(params);
      
      const newStageData = (response.stages ?? []).find(
        (s) => String(s.stage?.id) === String(stageId),
      );
      if (!newStageData) return;

      const { stageDefinitions } = buildPipelineFromApiResponse(response);
      const newLeads = (newStageData.leads ?? []).map(
        (lead) => normalisePipelineLead(lead, stageDefinitions),
      );

      setLeads((prev) => ({
        ...prev,
        [stageId]: {
          ...prev[stageId],
          items: [...(prev[stageId]?.items ?? []), ...newLeads],
        },
      }));

      setStagePagination((prev) => ({
        ...prev,
        [stageId]: {
          page:    nextPage,
          hasMore: newLeads.length >= 10,
        },
      }));
    } catch (error) {
      console.error('❌ Load more error:', error);
      // silent fail
    }
  }, [stagePagination, appliedFilters]);

  // ── Load dropdown options FIRST, then trigger pipeline ────────────────────
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [leadOptions, teams, groups] = await Promise.all([
          fetchLeadFormOptions(),
          fetchTeams(),
          fetchGroups(),
        ]);
        if (!mounted) return;

        const entityOptions  = Array.isArray(leadOptions?.business_entities)
          ? leadOptions.business_entities : [];
        const earthEntity    = entityOptions.find((e) => /earth/i.test(String(e.label || '')));
        const nextDefaultId  = String(earthEntity?.id || entityOptions[0]?.id || '');

        setBusinessEntityOptions(entityOptions);
        setDefaultBusinessEntityId(nextDefaultId);

        // Build the initial filters with the earth entity pre-selected
        const initialFilters = {
          ...DEFAULT_LEAD_FILTERS,
          business_entity_id: nextDefaultId,
        };

        setDraftFilters(initialFilters);
        setAppliedFilters(initialFilters);

        setTeamOptions(
          (Array.isArray(teams) ? teams : []).map((item) => ({
            id:      String(item.id),
            label:   item.label || item.team_name || item.name || `Team ${item.id}`,
            kam_ids: Array.isArray(item.kam_id) ? item.kam_id.map(String) : [],
          })),
        );
        setGroupOptions(
          (Array.isArray(groups) ? groups : []).map((item) => ({
            id:       String(item.id),
            label:    item.label || item.group_name || item.name || `Group ${item.id}`,
            team_ids: Array.isArray(item.team_id) ? item.team_id.map(String) : [],
          })),
        );

        // Signal that options are ready — pipeline load will trigger below
        setOptionsReady(true);

      } catch (error) {
        console.error('❌ Options load error:', error);
        if (!mounted) return;
        setBusinessEntityOptions([]);
        setKamOptions([]);
        setDefaultBusinessEntityId('');
        setTeamOptions([]);
        setGroupOptions([]);
        // Still mark ready so pipeline loads (will load without entity filter)
        setOptionsReady(true);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // ── Trigger pipeline load only after options+defaultId are ready ──────────
  useEffect(() => {
    if (!optionsReady) return;
    const filters = {
      ...DEFAULT_LEAD_FILTERS,
      business_entity_id: defaultBusinessEntityId,
    };
    // 🔧 CHANGED: Added debug log
    console.log('🚀 Loading pipeline with filters:', buildPipelineParams(filters));
    loadPipeline(buildPipelineParams(filters));
  }, [optionsReady, defaultBusinessEntityId, loadPipeline]);

  // ── KAM options per entity ─────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!selectedBusinessEntityId) { setKamOptions([]); return; }
      try {
        const opts = await fetchLeadFormOptions(selectedBusinessEntityId);
        if (!mounted) return;
        setKamOptions(Array.isArray(opts?.kam_users) ? opts.kam_users : []);
      } catch (error) {
        console.error('❌ KAM options load error:', error);
        if (!mounted) return;
        setKamOptions([]);
      }
    };
    load();
    return () => { mounted = false; };
  }, [selectedBusinessEntityId]);

  // ── Membership maps ────────────────────────────────────────────────────────
  const teamMembershipByKamId = useMemo(() => (
    teamOptions.reduce((acc, team) => {
      (team.kam_ids ?? []).forEach((kamId) => {
        const key = String(kamId);
        if (!acc[key]) acc[key] = [];
        if (!acc[key].includes(String(team.id))) acc[key].push(String(team.id));
      });
      return acc;
    }, {})
  ), [teamOptions]);

  const groupMembershipByKamId = useMemo(() => (
    groupOptions.reduce((acc, group) => {
      const gTeamIds = (group.team_ids ?? []).map(String);
      Object.entries(teamMembershipByKamId).forEach(([kamId, tIds]) => {
        if (tIds.some((tid) => gTeamIds.includes(tid))) {
          if (!acc[kamId]) acc[kamId] = [];
          if (!acc[kamId].includes(String(group.id))) acc[kamId].push(String(group.id));
        }
      });
      return acc;
    }, {})
  ), [groupOptions, teamMembershipByKamId]);

  const activeFilterCount = useMemo(() => (
    Object.values(appliedFilters).filter(
      (v) => v !== null && v !== '' && !(Array.isArray(v) && v.length === 0),
    ).length
  ), [appliedFilters]);

  // ── Edit lead ──────────────────────────────────────────────────────────────
  const handleEditLead = (lead) => {
    navigate(`/leads/${lead.id}/edit`, {
      state: {
        lead: {
          id:                     lead.id,
          business_entity_id:     lead.businessEntityId || '',
          source_id:              lead.sourceId || '',
          source_info:            lead.sourceInfo || '',
          lead_assign_id:         lead.leadAssignId || '',
          kam_id:                 lead.kamId || '',
          backoffice_id:          lead.backofficeId || '',
          products:               lead.productsIds || [],
          client_id:              lead.clientId || '',
          expected_revenue:       lead.expectedRevenue || String(lead.amount || ''),
          lead_pipeline_stage_id: lead.leadPipelineStageId || lead.stageId || lead.stage || '',
          deadline:               lead.deadline ? new Date(lead.deadline) : null,
        },
      },
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>

      {/* Header */}
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

      {/* Stat cards */}
      <Suspense fallback={<LeadStatsSkeleton />}>
        <LeadStatCardsSection stats={pipelineStats} />
      </Suspense>

      {/* Pipeline */}
      <Box sx={{ mt: 3 }}>
        <Suspense fallback={<LeadPipelineSkeleton />}>
          <LeadPipelineSection
            leads={leads}
            setLeads={setLeads}
            loading={isLoadingLeads}
            stages={pipelineStages}
            filters={appliedFilters}
            teamMembershipByKamId={teamMembershipByKamId}
            groupMembershipByKamId={groupMembershipByKamId}
            activeFilterCount={activeFilterCount}
            onFilterClick={() => {
              setDraftFilters(appliedFilters);
              setFilterDrawerOpen(true);
            }}
            onEditLead={handleEditLead}
            onReload={loadPipeline}
            stagePagination={stagePagination}
            onLoadMore={loadMoreStageLeads}
          />
        </Suspense>
      </Box>

      {/* Filter drawer */}
      <LeadFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={draftFilters}
        onChange={(field, value) =>
          setDraftFilters((prev) => ({ ...prev, [field]: value }))
        }
        onApply={(nextFilters) => {
          const hasFilter =
            nextFilters.business_entity_id ||
            nextFilters.kam_id ||
            nextFilters.team_id;
          if (hasFilter && (!nextFilters.date_from || !nextFilters.date_to)) {
            alert('Please select a date range when using filters.');
            return;
          }
          setAppliedFilters(nextFilters);
          setFilterDrawerOpen(false);
          loadPipeline(buildPipelineParams(nextFilters));
        }}
        onReset={() => {
          const reset = {
            ...DEFAULT_LEAD_FILTERS,
            business_entity_id: defaultBusinessEntityId,
          };
          setDraftFilters(reset);
          setAppliedFilters(reset);
          setFilterDrawerOpen(false);
          loadPipeline(buildPipelineParams(reset));
        }}
        businessEntityOptions={businessEntityOptions}
        groupOptions={groupOptions}
        teamOptions={teamOptions}
        kamOptions={kamOptions}
      />

      <Divider sx={{ my: 3 }} />

      <Suspense fallback={<LeadCalendarSkeleton />}>
        <TaskCalendarSection />
      </Suspense>

    </Box>
  );
}