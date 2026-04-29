// import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Box, Stack, Divider, Button, Typography } from '@mui/material';
// import AddIcon from '@mui/icons-material/Add';
// import { LeadCalendarSkeleton, LeadPipelineSkeleton, LeadStatsSkeleton } from '../components/LeadSectionSkeletons';
// import { fetchLeadFormOptions, fetchLeads } from '../api/leadApi';
// import { buildPipelineStateFromLeads, createEmptyPipelineState, normalizeStageDefinitions } from '../components/LeadPipeline';
// import LeadFilterDrawer from '../components/LeadFilterDrawer';
// import { DEFAULT_LEAD_FILTERS } from '../constants/leadFilters';
// import { fetchGroups, fetchTeams } from '../../settings/api/settingsApi';

// const LeadStatCardsSection = React.lazy(() => import('../components/LeadStatCardsSection'));
// const LeadPipelineSection = React.lazy(() => import('../components/LeadPipelineSection'));
// const TaskCalendarSection = React.lazy(() => import('../components/TaskCalendarSection'));

// export default function LeadListPage() {
//   const navigate = useNavigate();
//   const [defaultBusinessEntityId, setDefaultBusinessEntityId] = useState('');
//   const [pipelineStages, setPipelineStages] = useState([]);
//   const [rawLeads, setRawLeads] = useState([]);
//   const [leads, setLeads] = useState(createEmptyPipelineState());
//   const [isLoadingLeads, setIsLoadingLeads] = useState(true);
//   const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
//   const [draftFilters, setDraftFilters] = useState(DEFAULT_LEAD_FILTERS);
//   const [appliedFilters, setAppliedFilters] = useState(DEFAULT_LEAD_FILTERS);
//   const [businessEntityOptions, setBusinessEntityOptions] = useState([]);
//   const [kamOptions, setKamOptions] = useState([]);
//   const [teamOptions, setTeamOptions] = useState([]);
//   const [groupOptions, setGroupOptions] = useState([]);
//   const selectedBusinessEntityId = appliedFilters.business_entity_id || '';

//   const loadLeads = useCallback(async () => {
//     try {
//       setIsLoadingLeads(true);
//       const response = await fetchLeads();
//       const rows = Array.isArray(response) ? response : [];
//       setRawLeads(rows);
//       setLeads(buildPipelineStateFromLeads(rows, pipelineStages));
//     } catch {
//       setRawLeads([]);
//       setLeads(createEmptyPipelineState());
//     } finally {
//       setIsLoadingLeads(false);
//     }
//   }, [pipelineStages]);

//   useEffect(() => {
//     loadLeads();
//   }, [loadLeads]);

//   useEffect(() => {
//     let mounted = true;

//     const loadInitialOptions = async () => {
//       try {
//         const [leadOptions, teams, groups] = await Promise.all([
//           fetchLeadFormOptions(),
//           fetchTeams(),
//           fetchGroups(),
//         ]);

//         if (!mounted) {
//           return;
//         }

//         const entityOptions = Array.isArray(leadOptions?.business_entities) ? leadOptions.business_entities : [];
//         const earthEntity = entityOptions.find((entity) => /earth/i.test(String(entity.label || '')));
//         const nextDefaultBusinessEntityId = String(earthEntity?.id || entityOptions[0]?.id || '');

//         setBusinessEntityOptions(entityOptions);
//         setDefaultBusinessEntityId(nextDefaultBusinessEntityId);
//         setDraftFilters((prev) => ({
//           ...prev,
//           business_entity_id: prev.business_entity_id || nextDefaultBusinessEntityId,
//         }));
//         setAppliedFilters((prev) => ({
//           ...prev,
//           business_entity_id: prev.business_entity_id || nextDefaultBusinessEntityId,
//         }));
//         setTeamOptions(
//           (Array.isArray(teams) ? teams : []).map((item) => ({
//             id: String(item.id),
//             label: item.label || item.team_name || item.name || `Team ${item.id}`,
//             kam_ids: Array.isArray(item.kam_id) ? item.kam_id.map((value) => String(value)) : [],
//           })),
//         );
//         setGroupOptions(
//           (Array.isArray(groups) ? groups : []).map((item) => ({
//             id: String(item.id),
//             label: item.label || item.group_name || item.name || `Group ${item.id}`,
//             team_ids: Array.isArray(item.team_id) ? item.team_id.map((value) => String(value)) : [],
//           })),
//         );
//       } catch {
//         if (!mounted) {
//           return;
//         }

//         setBusinessEntityOptions([]);
//         setKamOptions([]);
//         setDefaultBusinessEntityId('');
//         setPipelineStages([]);
//         setTeamOptions([]);
//         setGroupOptions([]);
//       }
//     };

//     loadInitialOptions();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   useEffect(() => {
//     let mounted = true;

//     const loadEntityScopedOptions = async () => {
//       if (!selectedBusinessEntityId) {
//         setKamOptions([]);
//         setPipelineStages([]);
//         return;
//       }

//       try {
//         const leadOptions = await fetchLeadFormOptions(selectedBusinessEntityId);

//         if (!mounted) {
//           return;
//         }

//         setKamOptions(Array.isArray(leadOptions?.kam_users) ? leadOptions.kam_users : []);
//         setPipelineStages(normalizeStageDefinitions(leadOptions?.stages || []));
//       } catch {
//         if (!mounted) {
//           return;
//         }

//         setKamOptions([]);
//         setPipelineStages([]);
//       }
//     };

//     loadEntityScopedOptions();

//     return () => {
//       mounted = false;
//     };
//   }, [selectedBusinessEntityId]);

//   useEffect(() => {
//     setLeads(buildPipelineStateFromLeads(rawLeads, pipelineStages));
//   }, [pipelineStages, rawLeads]);

//   const teamMembershipByKamId = useMemo(() => (
//     teamOptions.reduce((acc, team) => {
//       const kamIds = Array.isArray(team.kam_ids) ? team.kam_ids : [];
//       kamIds.forEach((kamId) => {
//         const key = String(kamId);
//         if (!acc[key]) {
//           acc[key] = [];
//         }
//         if (!acc[key].includes(String(team.id))) {
//           acc[key].push(String(team.id));
//         }
//       });
//       return acc;
//     }, {})
//   ), [teamOptions]);

//   const groupMembershipByKamId = useMemo(() => (
//     groupOptions.reduce((acc, group) => {
//       const groupTeamIds = Array.isArray(group.team_ids) ? group.team_ids.map((value) => String(value)) : [];

//       Object.entries(teamMembershipByKamId).forEach(([kamId, memberTeamIds]) => {
//         if (memberTeamIds.some((teamId) => groupTeamIds.includes(String(teamId)))) {
//           if (!acc[kamId]) {
//             acc[kamId] = [];
//           }
//           if (!acc[kamId].includes(String(group.id))) {
//             acc[kamId].push(String(group.id));
//           }
//         }
//       });

//       return acc;
//     }, {})
//   ), [groupOptions, teamMembershipByKamId]);

//   const activeFilterCount = useMemo(() => (
//     Object.values(appliedFilters).filter((value) => (
//       value !== null
//       && value !== ''
//       && !(Array.isArray(value) && value.length === 0)
//     )).length
//   ), [appliedFilters]);

//   const handleEditLead = (lead) => {
//     navigate(`/leads/${lead.id}/edit`, {
//       state: {
//         lead: {
//           id: lead.id,
//           business_entity_id: lead.businessEntityId || '',
//           source_id: lead.sourceId || '',
//           source_info: lead.sourceInfo || '',
//           lead_assign_id: lead.leadAssignId || '',
//           kam_id: lead.kamId || '',
//           backoffice_id: lead.backofficeId || '',
//           products: lead.productsIds || [],
//           client_id: lead.clientId || '',
//           expected_revenue: lead.expectedRevenue || String(lead.amount || ''),
//           lead_pipeline_stage_id: lead.leadPipelineStageId || lead.stageId || lead.stage || '',
//           deadline: lead.deadline ? new Date(lead.deadline) : null,
//         },
//       },
//     });
//   };

//   return (
//     <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
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

//       <Suspense fallback={<LeadStatsSkeleton />}>
//         <LeadStatCardsSection />
//       </Suspense>

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
//           />
//         </Suspense>
//       </Box>

//       <LeadFilterDrawer
//         open={filterDrawerOpen}
//         onClose={() => setFilterDrawerOpen(false)}
//         filters={draftFilters}
//         onChange={(field, value) => {
//           setDraftFilters((prev) => ({
//             ...prev,
//             [field]: value,
//           }));
//         }}
//         onApply={(nextFilters) => {
//           setAppliedFilters(nextFilters);
//           setFilterDrawerOpen(false);
//         }}
//         onReset={() => {
//           const resetFilters = {
//             ...DEFAULT_LEAD_FILTERS,
//             business_entity_id: defaultBusinessEntityId,
//           };
//           setDraftFilters(resetFilters);
//           setAppliedFilters(resetFilters);
//           setFilterDrawerOpen(false);
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
import { createEmptyPipelineState } from '../components/LeadPipeline';
import LeadFilterDrawer from '../components/LeadFilterDrawer';
import { DEFAULT_LEAD_FILTERS } from '../constants/leadFilters';
import { fetchGroups, fetchTeams } from '../../settings/api/settingsApi';

const LeadStatCardsSection = React.lazy(() => import('../components/LeadStatCardsSection'));
const LeadPipelineSection  = React.lazy(() => import('../components/LeadPipelineSection'));
const TaskCalendarSection  = React.lazy(() => import('../components/TaskCalendarSection'));

// ─── Adapter helpers ──────────────────────────────────────────────────────────

function stageDefinitionsFromPipeline(stages = []) {
  return (Array.isArray(stages) ? stages : [])
    .filter((entry) => entry?.stage && !entry.stage.deleted_at)
    .map((entry) => {
      const { stage } = entry;
      return {
        id:         String(stage.id),
        title:      stage.stage_name,
        color:      stage.color || '#2563eb',
        sort_order: stage.sort_order ?? 0,
      };
    })
    .sort((a, b) => (a.sort_order - b.sort_order) || a.title.localeCompare(b.title));
}

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

function buildPipelineFromApiResponse(data = {}) {
  const rawStages = Array.isArray(data.stages) ? data.stages : [];
  const stageDefs = stageDefinitionsFromPipeline(rawStages);

  const pipelineState = stageDefs.reduce((acc, s) => {
    acc[s.id] = { title: s.title, items: [] };
    return acc;
  }, {});

  rawStages.forEach((entry) => {
    if (!entry?.stage) return;
    const stageId = String(entry.stage.id);
    if (!pipelineState[stageId]) return;
    pipelineState[stageId].items = (Array.isArray(entry.leads) ? entry.leads : []).map(
      (lead) => normalisePipelineLead(lead, stageDefs),
    );
  });

  return { stageDefinitions: stageDefs, pipelineState };
}

// function statsFromPipelineSummary(summary = {}) {
//   return {
//     pipeline: {
//       count:
//         (summary.active_lead_count ?? 0) +
//         (summary.won_lead_count ?? 0) +
//         (summary.lost_lead_count ?? 0),
//       amount: 0,
//       footer: '৳0',
//     },
//     forwarded: { count: summary.forward_lead_count ?? 0, footer: 0 },
//     pending:   { count: 0, footer: 0 },
//     won:       { count: summary.won_lead_count  ?? 0, amount: 0, footer: '৳0' },
//     lost:      { count: summary.lost_lead_count ?? 0, amount: 0, footer: '৳0' },
//     active:    { count: summary.active_lead_count ?? 0, amount: 0, footer: 0 },
//   };
// }

// ─── Page ─────────────────────────────────────────────────────────────────────

// function statsFromPipelineSummary(summary = {}) {
//   const won     = Number(summary.won_lead_count ?? 0);
//   const lost    = Number(summary.lost_lead_count ?? 0);
//   const active  = Number(summary.active_lead_count ?? 0);
//   const forward = Number(summary.forward_lead_count ?? 0);

//   const pipelineCount = won + lost + active;

//   return {
//     pipeline: {
//       count: pipelineCount,
//       amount: 0,
//       footer: 0,
//     },
//     forwarded: {
//       count: forward,
//       footer: 0,
//     },
//     pending: {
//       count: 0,
//       footer: 0,
//     },
//     won: {
//       count: won,
//       amount: 0,
//       footer: 0,
//     },
//     lost: {
//       count: lost,
//       amount: 0,
//       footer: 0,
//     },
//     active: {
//       count: active,
//       amount: 0,
//       footer: active,
//     },
//   };
// }

function statsFromPipelineSummary(summary = {}) {
  const won       = Number(summary.won_lead_count      ?? 0);
  const lost      = Number(summary.lost_lead_count     ?? 0);
  const active    = Number(summary.active_lead_count   ?? 0);
  const forward   = Number(summary.forward_lead_count  ?? 0);
  const pending   = Number(summary.pending_lead_count  ?? 0);
  const cancelled = Number(summary.cancelled_lead_count ?? 0);

  return {
    forwarded: { count: forward,   amount: summary.forward_revenue   ?? 0, lastMonthCount: 0, lastMonthAmount: 0, last24hCount: 0, last24hAmount: 0 },
    pending:   { count: pending,   amount: summary.pending_revenue   ?? 0, lastMonthCount: 0, lastMonthAmount: 0, last24hCount: summary.pending_24h_count ?? 0, last24hAmount: 0 },
    pipeline:  { count: won + lost + active, amount: summary.pipeline_revenue ?? 0, lastMonthCount: 0, lastMonthAmount: 0, last24hCount: 0, last24hAmount: 0 },
    won:       { count: won,       amount: summary.won_revenue       ?? 0, lastMonthCount: 0, lastMonthAmount: 0, last24hCount: 0, last24hAmount: 0 },
    lost:      { count: lost,      amount: summary.lost_revenue      ?? 0, lastMonthCount: 0, lastMonthAmount: 0, last24hCount: 0, last24hAmount: 0 },
    cancelled: { count: cancelled, amount: summary.cancelled_revenue ?? 0, lastMonthCount: 0, lastMonthAmount: 0, last24hCount: 0, last24hAmount: 0 },
  };
}

export default function LeadListPage() {
  const navigate = useNavigate();

  // Pipeline state
  const [pipelineStages, setPipelineStages] = useState([]);
  const [leads,          setLeads]          = useState(createEmptyPipelineState());
  const [pipelineStats,  setPipelineStats]  = useState(null);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);

  // Filters
  const [filterDrawerOpen,        setFilterDrawerOpen]        = useState(false);
  const [draftFilters,            setDraftFilters]            = useState(DEFAULT_LEAD_FILTERS);
  const [appliedFilters,          setAppliedFilters]          = useState(DEFAULT_LEAD_FILTERS);
  const [defaultBusinessEntityId, setDefaultBusinessEntityId] = useState('');

  // Options
  const [businessEntityOptions, setBusinessEntityOptions] = useState([]);
  const [kamOptions,   setKamOptions]   = useState([]);
  const [teamOptions,  setTeamOptions]  = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);

  const selectedBusinessEntityId = appliedFilters.business_entity_id || '';

  // ── Fetch pipeline ─────────────────────────────────────────────────────────
  // const loadPipeline = useCallback(async (params = {}) => {
  //   try {
  //     setIsLoadingLeads(true);
  //     const data = await fetchLeadPipeline(params);
  //     const { stageDefinitions, pipelineState } = buildPipelineFromApiResponse(data);
  //     setPipelineStages(stageDefinitions);
  //     setLeads(pipelineState);
  //     setPipelineStats(statsFromPipelineSummary(data.summary ?? {}));
  //   } catch {
  //     setPipelineStages([]);
  //     setLeads(createEmptyPipelineState());
  //     setPipelineStats(null);
  //   } finally {
  //     setIsLoadingLeads(false);
  //   }
  // }, []);
  const loadPipeline = useCallback(async (params = {}) => {
  try {
    setIsLoadingLeads(true);
    const response = await fetchLeadPipeline(params);

    // API shape: response -> { message, data: { summary, stages, default } }
    // Axios wraps it as: response.data -> { message, data: { summary, stages } }
    // So we need to dig two levels: response.data.data OR response.data
    const envelope = response?.data ?? response;          // unwrap axios
    const data     = envelope?.data ?? envelope;          // unwrap { message, data: {...} }

    const { stageDefinitions, pipelineState } = buildPipelineFromApiResponse(data);
    setPipelineStages(stageDefinitions);
    setLeads(pipelineState);
    setPipelineStats(statsFromPipelineSummary(data.summary ?? {}));
  } catch {
    setPipelineStages([]);
    setLeads(createEmptyPipelineState());
    setPipelineStats(null);
  } finally {
    setIsLoadingLeads(false);
  }
}, []);

  useEffect(() => { loadPipeline(); }, [loadPipeline]);

  // ── Initial dropdown options ───────────────────────────────────────────────
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

        const entityOptions  = Array.isArray(leadOptions?.business_entities) ? leadOptions.business_entities : [];
        const earthEntity    = entityOptions.find((e) => /earth/i.test(String(e.label || '')));
        const nextDefaultId  = String(earthEntity?.id || entityOptions[0]?.id || '');

        setBusinessEntityOptions(entityOptions);
        setDefaultBusinessEntityId(nextDefaultId);
        setDraftFilters((prev) => ({
          ...prev,
          business_entity_id: prev.business_entity_id || nextDefaultId,
        }));
        setAppliedFilters((prev) => ({
          ...prev,
          business_entity_id: prev.business_entity_id || nextDefaultId,
        }));
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
      } catch {
        if (!mounted) return;
        setBusinessEntityOptions([]);
        setKamOptions([]);
        setDefaultBusinessEntityId('');
        setTeamOptions([]);
        setGroupOptions([]);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // ── KAM options per entity ─────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!selectedBusinessEntityId) { setKamOptions([]); return; }
      try {
        const opts = await fetchLeadFormOptions(selectedBusinessEntityId);
        if (!mounted) return;
        setKamOptions(Array.isArray(opts?.kam_users) ? opts.kam_users : []);
      } catch {
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

  // ─────────────────────────────────────────────────────────────────────────
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

      {/* Stat cards — data sourced from pipeline API summary */}
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
          setAppliedFilters(nextFilters);
          setFilterDrawerOpen(false);
        }}
        onReset={() => {
          const reset = { ...DEFAULT_LEAD_FILTERS, business_entity_id: defaultBusinessEntityId };
          setDraftFilters(reset);
          setAppliedFilters(reset);
          setFilterDrawerOpen(false);
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