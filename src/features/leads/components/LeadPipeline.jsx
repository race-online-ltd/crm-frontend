// src/features/leads/components/LeadPipeline.jsx
import React, { Suspense, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Box, Typography, Card, CardContent, Chip, Stack, IconButton,
  Menu, MenuItem, ListItemIcon, ListItemText,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import TrendingUpIcon      from '@mui/icons-material/TrendingUp';
import CloseIcon           from '@mui/icons-material/Close';
import PersonOutlineIcon   from '@mui/icons-material/PersonOutline';
import LanguageIcon        from '@mui/icons-material/Language';
import FilterListIcon      from '@mui/icons-material/FilterList';
import ViewKanbanIcon      from '@mui/icons-material/ViewKanban';
import ViewListIcon        from '@mui/icons-material/ViewList';
import MoreHorizIcon       from '@mui/icons-material/MoreHoriz';
import VisibilityIcon      from '@mui/icons-material/Visibility';
import EditIcon            from '@mui/icons-material/Edit';
import ForwardIcon         from '@mui/icons-material/Forward';
import AddTaskIcon         from '@mui/icons-material/AddTask';
import OrbitLoader         from '../../../components/shared/OrbitLoader';
import useInitialTableLoading from '../../../components/shared/useInitialTableLoading';
import { updateLeadStage, forwardLead } from '../api/leadApi';

const StageChangeDialog  = React.lazy(() => import('./StageChangeDialog'));
const LeadForwardDialog  = React.lazy(() => import('./LeadForwardDialog'));
const ViewDetailsDrawer  = React.lazy(() => import('./ViewDetailsDrawer'));
const TaskForm           = React.lazy(() => import('../../task/components/TaskForm'));

const DialogLoading = (
  <Box sx={{ p: 3, textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
    Loading...
  </Box>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hashString(value = '') {
  const seed = String(value || 'default');
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getDynamicColor(value = '') {
  const palette = ['#2563eb', '#7c3aed', '#0f766e', '#db2777', '#d97706', '#16a34a', '#dc2626', '#4f46e5'];
  return palette[hashString(value) % palette.length];
}

const ENTITY_COLOR_PALETTE = [
  '#2563eb', '#7c3aed', '#0f766e', '#db2777',
  '#d97706', '#16a34a', '#dc2626', '#4f46e5',
];

const STATUS_COLORS = {
  'In Progress': { bg: '#eff6ff', color: '#2563eb' },
  'Won':         { bg: '#f0fdf4', color: '#16a34a' },
  'Lost':        { bg: '#fef2f2', color: '#ef4444' },
};

const SOURCE_COLORS = {
  'Self':      { bg: '#dcfce7', color: '#16a34a' },
  'Website':   { bg: '#dbeafe', color: '#2563eb' },
  'LinkedIn':  { bg: '#e0e7ff', color: '#4f46e5' },
  'WhatsApp':  { bg: '#dcfce7', color: '#16a34a' },
  'Direct':    { bg: '#fef3c7', color: '#d97706' },
};

// ─── Stage config ─────────────────────────────────────────────────────────────

export const DEFAULT_STAGES = [
  { id: 'new',         title: 'New',         color: getDynamicColor('new') },
  { id: 'contacted',   title: 'Contacted',   color: getDynamicColor('contacted') },
  { id: 'qualified',   title: 'Qualified',   color: getDynamicColor('qualified') },
  { id: 'proposal',    title: 'Proposal',    color: getDynamicColor('proposal') },
  { id: 'negotiation', title: 'Negotiation', color: getDynamicColor('negotiation') },
  { id: 'closed',      title: 'Closed',      color: getDynamicColor('closed') },
];

function slugifyLabel(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function getEntityAccentColor(entityId, entityName = '') {
  const seed = String(entityId ?? entityName ?? 'default');
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return ENTITY_COLOR_PALETTE[Math.abs(hash) % ENTITY_COLOR_PALETTE.length];
}

export function normalizeStageDefinitions(stages = []) {
  const normalized = (Array.isArray(stages) ? stages : [])
    .map((stage, index) => {
      const id    = String(stage.id ?? stage.value ?? slugifyLabel(stage.title || stage.label || stage.stage_name || `stage_${index + 1}`));
      const title = stage.title || stage.label || stage.stage_name || `Stage ${index + 1}`;
      return {
        id,
        title,
        color:     stage.color || getDynamicColor(id),
        sortOrder: Number(stage.sort_order ?? stage.sortOrder ?? index + 1),
      };
    })
    .filter((s) => s.id && s.title)
    .sort((a, b) => (a.sortOrder - b.sortOrder) || a.title.localeCompare(b.title));

  return normalized.length ? normalized : DEFAULT_STAGES;
}

function getStageBucketId(stageName = '', stages = DEFAULT_STAGES, stageId = '') {
  if (stageId) {
    const byId = stages.find((s) => String(s.id) === String(stageId));
    if (byId) return byId.id;
  }
  const normalized = slugifyLabel(stageName);
  if (normalized.includes('closed') || normalized.includes('won') || normalized.includes('lost')) {
    return 'closed';
  }
  const match = stages.find((s) => s.id === normalized || slugifyLabel(s.title) === normalized);
  return match?.id || 'new';
}

function buildPipelineItem(lead, stages = DEFAULT_STAGES) {
  const entityColor = getEntityAccentColor(lead.business_entity_id, lead.business_entity);
  const stageId     = getStageBucketId(lead.stage, stages, lead.lead_pipeline_stage_id || lead.leadPipelineStageId || '');
  const stageConfig = stages.find((s) => String(s.id) === String(stageId)) || null;
  const products    = Array.isArray(lead.products)
    ? lead.products.map((p) => p?.label || p?.name || p).filter(Boolean)
    : [];
  const expectedRevenue =
    Number(String(lead.expected_revenue ?? lead.expectedRevenue ?? 0).replace(/[^0-9.-]/g, '')) || 0;

  return {
    id:                  String(lead.id),
    name:                lead.client || lead.client_name || 'Untitled Lead',
    subtitle:            lead.business_entity || lead.businessEntity || '-',
    user:                lead.kam || lead.assigned_to_user || lead.assignedToUser || '-',
    source:              lead.source || '-',
    sourceId:            String(lead.source_id || lead.sourceId || ''),
    sourceInfo:          lead.source_info || lead.sourceInfo || '',
    leadAssignId:        lead.lead_assign_id || lead.leadAssignId || '',
    kamId:               lead.kam_id || lead.kamId || '',
    backofficeId:        lead.backoffice_id || lead.backofficeId || '',
    leadPipelineStageId: lead.lead_pipeline_stage_id || lead.leadPipelineStageId || '',
    stageLabel:          lead.stage || lead.stageLabel || stageConfig?.title || stageId,
    stageColor:          lead.stage_color || lead.stageColor || stageConfig?.color || getDynamicColor(stageId),
    businessEntity:      lead.business_entity || lead.businessEntity || '-',
    businessEntityId:    lead.business_entity_id || lead.businessEntityId || '',
    businessEntityColor: entityColor,
    client:              lead.client || lead.client_name || '-',
    clientId:            lead.client_id || lead.clientId || '',
    productsIds:         Array.isArray(lead.product_ids) ? lead.product_ids : [],
    amount:              expectedRevenue,
    expectedRevenue:     String(expectedRevenue),
    stage:               stageId,
    stageId,
    deadline:            lead.deadline || null,
    createdAt:           lead.created_at || null,
    status:              stageId === 'closed' ? 'Won' : 'In Progress',
    products:            products.length ? products.join(', ') : '-',
    assignedDate:        lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-',
    duration:            '-',
  };
}

export function createEmptyPipelineState(stages = DEFAULT_STAGES) {
  return normalizeStageDefinitions(stages).reduce((acc, stage) => {
    acc[stage.id] = { title: stage.title, items: [] };
    return acc;
  }, {});
}

export function buildPipelineStateFromLeads(leads = [], stages = DEFAULT_STAGES) {
  const normalizedStages = normalizeStageDefinitions(stages);
  const state = createEmptyPipelineState(normalizedStages);

  leads.forEach((lead) => {
    const item     = buildPipelineItem(lead, normalizedStages);
    const stageKey = item.stage;
    if (!state[stageKey]) state[stageKey] = { title: stageKey, items: [] };
    state[stageKey].items.push(item);
  });

  return state;
}

// ─── NEW: build pipeline state directly from the /stage-pipeline response ─────
/**
 * Accepts the raw `data` object from fetchLeadPipeline() and returns
 * the same { [stageId]: { title, items[] } } map that the rest of
 * this component already consumes — no external adapter needed.
 *
 * Soft-deleted stages (deleted_at !== null) are excluded from the board.
 *
 * @param {Object} data  – response.data from fetchLeadPipeline()
 * @returns {{ stageDefinitions: Array, pipelineState: Object }}
 */
// export function buildPipelineFromApiResponse(data = {}) {
//   const rawStages = Array.isArray(data.stages) ? data.stages : [];

//   // 1. Stage definitions — skip deleted ones
//   const stageDefs = rawStages
//     .filter((entry) => entry?.stage && !entry.stage.deleted_at)
//     .map((entry) => {
//       const { stage } = entry;
//       return {
//         id:        String(stage.id),
//         title:     stage.stage_name,
//         color:     stage.color || getDynamicColor(String(stage.id)),
//         sortOrder: stage.sort_order ?? 0,
//       };
//     })
//     .sort((a, b) => (a.sortOrder - b.sortOrder) || a.title.localeCompare(b.title));

//   // 2. Empty state skeleton
//   const pipelineState = stageDefs.reduce((acc, s) => {
//     acc[s.id] = { title: s.title, items: [] };
//     return acc;
//   }, {});

//   // 3. Fill leads — using buildPipelineItem so colour/status logic is centralised
//   rawStages.forEach((entry) => {
//     if (!entry?.stage) return;
//     const stageId = String(entry.stage.id);
//     if (!pipelineState[stageId]) return;   // deleted stage — skip

//     (Array.isArray(entry.leads) ? entry.leads : []).forEach((raw) => {
//       // Adapt field names from the pipeline endpoint to what buildPipelineItem expects
//       const adapted = {
//         ...raw,
//         // pipeline endpoint uses client_name / kam_name / source_name
//         client:          raw.client_name  ?? raw.client,
//         source:          raw.source_name  ?? raw.source,
//         kam:             raw.kam_name     ?? raw.kam,
//         business_entity: raw.business_entity_name ?? raw.business_entity,
//         // products array from pipeline: [{ lead_id, product_id, product_name }]
//         products: Array.isArray(raw.products)
//           ? raw.products.map((p) => ({ label: p.product_name ?? p.label ?? '', id: p.product_id ?? p.id }))
//           : [],
//       };
//       pipelineState[stageId].items.push(buildPipelineItem(adapted, stageDefs));
//     });
//   });

//   return { stageDefinitions: stageDefs, pipelineState };
// }

// ─── Formatting ───────────────────────────────────────────────────────────────

  export function buildPipelineFromApiResponse(data = {}) {
    const rawStages = Array.isArray(data.stages) ? data.stages : [];

    const stageDefs = rawStages
      .filter((entry) => entry?.stage && !entry.stage.deleted_at)
      .map((entry) => {
        const { stage } = entry;
        return {
          id:        String(stage.id),
          title:     stage.stage_name,
          color:     stage.color ?? getDynamicColor(String(stage.id)),  // ← stage.color not entry.color
          sortOrder: stage.sort_order ?? 0,
        };
      })
      .sort((a, b) => (a.sortOrder - b.sortOrder) || a.title.localeCompare(b.title));

    const pipelineState = stageDefs.reduce((acc, s) => {
      acc[s.id] = { title: s.title, items: [] };
      return acc;
    }, {});

    rawStages.forEach((entry) => {
      if (!entry?.stage) return;
      const stageId = String(entry.stage.id);
      if (!pipelineState[stageId]) return;

      (Array.isArray(entry.leads) ? entry.leads : []).forEach((raw) => {
        const adapted = {
          ...raw,
          client:          raw.client_name          ?? raw.client,
          source:          raw.source_name          ?? raw.source,
          kam:             raw.kam_name             ?? raw.kam,
          business_entity: raw.business_entity_name ?? raw.business_entity,
          // Force correct stage ID so stageId lookup works
          lead_pipeline_stage_id: stageId,
          products: Array.isArray(raw.products)
            ? raw.products.map((p) => ({
                label: p.product_name ?? p.label ?? '',
                id:    p.product_id   ?? p.id,
              }))
            : [],
        };
        pipelineState[stageId].items.push(buildPipelineItem(adapted, stageDefs));
      });
    });

    return { stageDefinitions: stageDefs, pipelineState };
  }
function formatAmount(amount) {
  if (typeof amount === 'number') return `৳${amount.toLocaleString()}`;
  return amount || '৳0';
}

function calculateColumnTotal(items) {
  const total = items.reduce((acc, item) => {
    const num = typeof item.amount === 'string'
      ? parseInt(item.amount.replace(/[^0-9]/g, ''), 10) || 0
      : item.amount || 0;
    return acc + num;
  }, 0);
  return `৳${total.toLocaleString()}`;
}

// ─── Filter ───────────────────────────────────────────────────────────────────

function toComparableDate(value, boundary = 'start') {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const d = new Date(date);
  if (boundary === 'end') d.setHours(23, 59, 59, 999);
  else d.setHours(0, 0, 0, 0);
  return d;
}

function filterPipelineState(leads, filters, memberships = {}) {
  const {
    business_entity_id: businessEntityId = '',
    group_id:  groupId  = '',
    team_id:   teamId   = '',
    kam_id:    kamId    = '',
    date_from: dateFrom = null,
    date_to:   dateTo   = null,
  } = filters || {};

  const fromDate = toComparableDate(dateFrom, 'start');
  const toDate   = toComparableDate(dateTo,   'end');
  const teamMembershipByKamId  = memberships.teamMembershipByKamId  || {};
  const groupMembershipByKamId = memberships.groupMembershipByKamId || {};

  const next = {};
  Object.entries(leads || {}).forEach(([stageKey, stage]) => {
    const items = Array.isArray(stage?.items) ? stage.items : [];
    next[stageKey] = {
      ...stage,
      items: items.filter((item) => {
        const itemTeamIds  = teamMembershipByKamId[String(item.kamId  || '')] || [];
        const itemGroupIds = groupMembershipByKamId[String(item.kamId || '')] || [];
        const createdAt    = toComparableDate(item.createdAt, 'start');

        return (
          (!businessEntityId || String(item.businessEntityId || '') === String(businessEntityId)) &&
          (!kamId   || String(item.kamId  || '') === String(kamId))   &&
          (!teamId  || itemTeamIds.includes(String(teamId)))          &&
          (!groupId || itemGroupIds.includes(String(groupId)))        &&
          (!fromDate || (createdAt && createdAt >= fromDate))         &&
          (!toDate   || (createdAt && createdAt <= toDate))
        );
      }),
    };
  });
  return next;
}

// ─── Action Menu ──────────────────────────────────────────────────────────────

function LeadActionMenu({ anchorEl, open, onClose, onAction }) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', minWidth: 180 } }}
    >
      {[
        { key: 'view',    icon: <VisibilityIcon fontSize="small" />, label: 'View Details' },
        { key: 'edit',    icon: <EditIcon       fontSize="small" />, label: 'Edit' },
        { key: 'addTask', icon: <AddTaskIcon    fontSize="small" />, label: 'Add Task' },
        { key: 'forward', icon: <ForwardIcon    fontSize="small" />, label: 'Forward Lead' },
      ].map((item) => (
        <MenuItem
          key={item.key}
          onClick={() => { onAction(item.key); onClose(); }}
          sx={{ fontSize: '0.85rem', py: 1 }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText>{item.label}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────

function LeadListView({ leads, onStageChange, onAction }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuLead,   setMenuLead]   = useState(null);

  const allLeads = Object.entries(leads).flatMap(([stageId, stage]) =>
    stage.items.map((item) => ({ ...item, stageId, stageTitle: stage.title })),
  );

  const handleStageSelect = (lead, newStageId) => {
    if (newStageId !== lead.stageId) onStageChange(lead, lead.stageId, newStageId);
  };

  return (
    <Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              {['Client', 'Products', 'Source', 'Assigned KAM', 'Stage', 'Status', 'Value', 'Assigned Date', 'Duration', ''].map((h) => (
                <TableCell
                  key={h}
                  sx={{ fontWeight: 700, color: '#475569', fontSize: '0.82rem', borderBottom: '1px solid #e2e8f0' }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {allLeads.map((lead) => {
              const statusCfg = STATUS_COLORS[lead.status] || { bg: '#f1f5f9', color: '#64748b' };
              const sourceCfg = SOURCE_COLORS[lead.source] || { bg: '#f1f5f9', color: '#64748b' };
              const accentColor = lead.businessEntityColor || getEntityAccentColor(lead.businessEntityId, lead.businessEntity);
              const stageColor  = lead.stageColor || '#2563eb';

              return (
                <TableRow
                  key={lead.id}
                  hover
                  sx={{
                    '&:hover': { bgcolor: '#f8fafc' },
                    '& td:first-of-type': { borderLeft: `3px solid ${accentColor}` },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="#1e293b">{lead.name}</Typography>
                    <Typography variant="caption" sx={{ color: accentColor, fontWeight: 700 }}>
                      {lead.subtitle || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: '#64748b', fontSize: '0.82rem' }}>{lead.products || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={lead.source}
                      size="small"
                      sx={{ fontWeight: 600, fontSize: '0.72rem', bgcolor: sourceCfg.bg, color: sourceCfg.color, height: 22 }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#475569', fontSize: '0.82rem' }}>{lead.user}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={lead.stageId}
                      onChange={(e) => handleStageSelect(lead, e.target.value)}
                      sx={{
                        fontSize: '0.75rem', fontWeight: 600, height: 28, borderRadius: '8px',
                        bgcolor: `${stageColor}18`, color: stageColor,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: `${stageColor}40` },
                        '& .MuiSelect-icon': { color: stageColor },
                      }}
                    >
                      {Object.entries(leads).map(([sId, s]) => (
                        <MenuItem key={sId} value={sId} sx={{ fontSize: '0.8rem' }}>{s.title}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={lead.status}
                      size="small"
                      sx={{ fontWeight: 600, fontSize: '0.72rem', bgcolor: statusCfg.bg, color: statusCfg.color, height: 22 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
                    {formatAmount(lead.amount)}
                  </TableCell>
                  <TableCell sx={{ color: '#64748b', fontSize: '0.82rem' }}>{lead.assignedDate || '-'}</TableCell>
                  <TableCell sx={{ color: '#64748b', fontSize: '0.82rem' }}>{lead.duration || '-'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuLead(lead); }}
                    >
                      <MoreHorizIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ p: 1.5, borderTop: '1px solid #e2e8f0' }}>
        <Typography variant="caption" color="text.secondary">
          Showing 1 – {allLeads.length} of {allLeads.length} leads
        </Typography>
      </Box>

      <LeadActionMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        onAction={(action) => { onAction(action, menuLead); setMenuAnchor(null); }}
      />
    </Box>
  );
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

function KanbanLeadCard({ item, index, onAction }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const accentColor = item.businessEntityColor || getEntityAccentColor(item.businessEntityId, item.businessEntity);
  const stageColor  = item.stageColor || '#2563eb';

  return (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          variant="outlined"
          sx={{
            mb: 1, borderRadius: '8px',
            boxShadow: snapshot.isDragging
              ? '0 6px 12px rgba(0,0,0,0.12)'
              : '0 1px 2px rgba(0,0,0,0.03)',
            borderColor: `${stageColor}30`,   // ← accentColor → stageColor
            borderLeft:  `4px solid ${stageColor}`,  // ← accentColor → stageColor
            bgcolor: '#fff',
          }}
        >
          <CardContent sx={{ p: '10px !important' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ minWidth: 0, pr: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, mb: 0.25, color: '#1e293b', fontSize: '0.78rem' }}
                >
                  {item.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: accentColor, fontWeight: 700, display: 'block', lineHeight: 1.2 }}
                >
                  {item.businessEntity}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
                sx={{ mt: -0.5, mr: -0.5 }}
              >
                <MoreHorizIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              </IconButton>
            </Stack>

            <Stack spacing={0.5} sx={{ mt: 0.75 }}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <PersonOutlineIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>
                  {item.user}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <LanguageIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>
                  {item.source}
                </Typography>
              </Stack>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 1, pt: 0.75, borderTop: '1px dashed #e2e8f0' }}
            >
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f172a' }}>
                {formatAmount(item.amount)}
              </Typography>
              {item.status && (
                <Chip
                  label={item.status}
                  size="small"
                  sx={{
                    bgcolor: (STATUS_COLORS[item.status] || {}).bg  || '#f1f5f9',
                    color:   (STATUS_COLORS[item.status] || {}).color || '#64748b',
                    fontWeight: 700, fontSize: '0.5rem', height: 16,
                  }}
                />
              )}
            </Stack>
          </CardContent>

          <LeadActionMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            onAction={(action) => { onAction(action, item); setAnchorEl(null); }}
          />
        </Card>
      )}
    </Draggable>
  );
}

// ─── Main Pipeline Component ──────────────────────────────────────────────────

export default function LeadPipeline({
  leads,
  setLeads,
  onFilterClick,
  loading       = null,
  stages        = DEFAULT_STAGES,
  filters       = {},
  teamMembershipByKamId  = {},
  groupMembershipByKamId = {},
  activeFilterCount      = 0,
  stagePagination = {},   // ← ADD
  onLoadMore,            // ← ADD
}) {
  const stageDefinitions = useMemo(() => normalizeStageDefinitions(stages), [stages]);
  const initialLoading   = useInitialTableLoading();
  const isLoading        = loading ?? initialLoading;

  const [view, setView] = useState('kanban');

  const [forwardDialog,      setForwardDialog]      = useState({ open: false, lead: null });
  const [taskDialog,         setTaskDialog]         = useState({ open: false, lead: null });
  const [viewDetailsDrawer,  setViewDetailsDrawer]  = useState({ open: false, lead: null });
  const [leadNotes,          setLeadNotes]          = useState({});
  const [leadActivities,     setLeadActivities]     = useState({});
  const [leadTasks,          setLeadTasks]          = useState({});
  const [stageChangeDialog,  setStageChangeDialog]  = useState({
    open: false, lead: null, fromStage: '', toStage: '', pendingResult: null,
  });

  const hasActiveFilters = activeFilterCount > 0;

  const getStageTitle = (id) =>
    stageDefinitions.find((s) => s.id === id)?.title || id;

  const displayLeads = useMemo(
    () => filterPipelineState(leads, filters, { teamMembershipByKamId, groupMembershipByKamId }),
    [filters, groupMembershipByKamId, leads, teamMembershipByKamId],
  );

  // ── Activity helpers ───────────────────────────────────────────────────────

  const appendLeadActivity = (leadId, activity) => {
    if (!leadId) return;
    setLeadActivities((prev) => ({
      ...prev,
      [leadId]: [
        {
          id: `${leadId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: new Date().toISOString(),
          ...activity,
        },
        ...(prev[leadId] || []),
      ],
    }));
  };

  const handleAddNote = (leadId, payload) => {
    const content     = typeof payload === 'string' ? payload : payload?.content || '';
    const attachments = Array.isArray(payload?.attachments) ? payload.attachments : [];
    if (!content.trim()) return;

    const note = {
      id:          `${leadId}-note-${Date.now()}`,
      content,
      author:      'You',
      createdAt:   new Date().toISOString(),
      attachments,
    };

    setLeadNotes((prev) => ({ ...prev, [leadId]: [note, ...(prev[leadId] || [])] }));
    appendLeadActivity(leadId, {
      title: 'Note added',
      description: attachments.length
        ? `${content} (${attachments.length} attachment${attachments.length > 1 ? 's' : ''})`
        : content,
    });
  };

  const appendLeadTask = (leadId, task) => {
    if (!leadId) return;
    setLeadTasks((prev) => ({
      ...prev,
      [leadId]: [
        {
          id:        `${leadId}-task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
          ...task,
        },
        ...(prev[leadId] || []),
      ],
    }));
  };

  // ── Stage change ───────────────────────────────────────────────────────────

  const handleStageChangeRequest = (lead, fromStageId, toStageId, pendingResult) => {
    setStageChangeDialog({
      open: true, lead,
      fromStage: getStageTitle(fromStageId),
      toStage:   getStageTitle(toStageId),
      fromStageId, toStageId, pendingResult,
    });
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (source.droppableId === destination.droppableId) {
      if (hasActiveFilters) return;
      const col   = leads[source.droppableId];
      const items = [...col.items];
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);
      setLeads({ ...leads, [source.droppableId]: { ...col, items } });
      return;
    }

    const lead = displayLeads[source.droppableId]?.items?.[source.index];
    if (!lead) return;
    handleStageChangeRequest(lead, source.droppableId, destination.droppableId, result);
  };

  // const handleConfirmStageChange = (note) => {
  //   const { lead, fromStageId, toStageId } = stageChangeDialog;
  //   const toStageConfig = stageDefinitions.find((s) => s.id === toStageId) || null;

  //   const updatedLead = {
  //     ...lead,
  //     stageId:    toStageId,
  //     stage:      toStageId,
  //     stageLabel: toStageConfig?.title || toStageId,
  //     stageColor: toStageConfig?.color || lead.stageColor,
  //     stageChangeNote: note,
  //   };

  //   const sourceCol   = leads[fromStageId];
  //   const destCol     = leads[toStageId];
  //   const sourceItems = sourceCol.items.filter((i) => i.id !== lead.id);
  //   const destItems   = [...destCol.items, updatedLead];

  //   setLeads({
  //     ...leads,
  //     [fromStageId]: { ...sourceCol, items: sourceItems },
  //     [toStageId]:   { ...destCol,   items: destItems   },
  //   });

  //   console.log('Stage changed:', { leadId: lead.id, from: fromStageId, to: toStageId, note });
  //   appendLeadActivity(lead.id, {
  //     title:       'Stage updated',
  //     description: `${lead.name} moved from ${getStageTitle(fromStageId)} to ${getStageTitle(toStageId)}.${note ? ` Note: ${note}` : ''}`,
  //   });

  //   setStageChangeDialog({ open: false, lead: null, fromStage: '', toStage: '', pendingResult: null });
  // };

  // ── Stage change ───────────────────────────────────────────────────────────

  const handleConfirmStageChange = async (note) => {
    const { lead, fromStageId, toStageId } = stageChangeDialog;
    const toStageConfig = stageDefinitions.find((s) => s.id === toStageId) || null;

    // Snapshot for rollback
    const sourceCol = leads[fromStageId];
    const destCol   = leads[toStageId];

    // Updated lead object
    const updatedLead = {
      ...lead,
      stageId:             toStageId,
      stage:               toStageId,
      leadPipelineStageId: toStageId,
      stageLabel:          toStageConfig?.title || toStageId,
      stageColor:          toStageConfig?.color || lead.stageColor,
      stageChangeNote:     note,
    };

    // ── 1. Optimistic UI update ──
    setLeads({
      ...leads,
      [fromStageId]: { ...sourceCol, items: sourceCol.items.filter((i) => i.id !== lead.id) },
      [toStageId]:   { ...destCol,   items: [...destCol.items, updatedLead] },
    });

    // ── 2. Close dialog immediately ──
    setStageChangeDialog({ open: false, lead: null, fromStage: '', toStage: '', pendingResult: null });

    // ── 3. API call ──
    try {
      await updateLeadStage(lead.id, toStageId);

      appendLeadActivity(lead.id, {
        title:       'Stage updated',
        description: `${lead.name} moved from ${getStageTitle(fromStageId)} to ${getStageTitle(toStageId)}.${note ? ` Note: ${note}` : ''}`,
      });

    } catch (error) {
      // ── 4. Rollback on failure ──
      setLeads({
        ...leads,
        [fromStageId]: sourceCol,
        [toStageId]:   destCol,
      });

      console.error('Stage update failed:', error);
      alert(error?.response?.data?.message || 'Stage update failed. Please try again.');
    }
  };

  const handleCancelStageChange = () => {
    setStageChangeDialog({ open: false, lead: null, fromStage: '', toStage: '', pendingResult: null });
  };

  const handleListStageChange = (lead, fromStageId, toStageId) => {
    handleStageChangeRequest(lead, fromStageId, toStageId, null);
  };

  // ── Action dispatcher ──────────────────────────────────────────────────────

  const handleLeadAction = (action, lead) => {
    switch (action) {
      case 'forward': setForwardDialog({ open: true, lead }); break;
      case 'addTask': setTaskDialog({ open: true, lead });    break;
      case 'view':    setViewDetailsDrawer({ open: true, lead }); break;
      case 'edit':
        if (lead?.id) window.open(`/leads/${lead.id}/edit`, '_blank', 'noopener,noreferrer');
        break;
      default: break;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e9eef4', overflow: 'hidden' }}>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TrendingUpIcon sx={{ fontSize: 22, color: '#1e293b' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem' }}>
            Sales Pipeline
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* View toggle */}
          <Box sx={{ display: 'inline-flex', bgcolor: '#f1f5f9', borderRadius: '10px', p: '3px' }}>
            {[
              { key: 'list',   icon: <ViewListIcon   sx={{ fontSize: 16 }} />, label: 'List'   },
              { key: 'kanban', icon: <ViewKanbanIcon sx={{ fontSize: 16 }} />, label: 'Kanban' },
            ].map(({ key, icon, label }) => (
              <Box
                key={key}
                onClick={() => setView(key)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  px: 1.5, py: 0.5, borderRadius: '8px', cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: view === key ? 700 : 500,
                  color:   view === key ? '#1e293b' : '#64748b',
                  bgcolor: view === key ? '#fff' : 'transparent',
                  boxShadow: view === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                  userSelect: 'none',
                }}
              >
                {icon} {label}
              </Box>
            ))}
          </Box>

          {/* Filter */}
          <Box
            onClick={onFilterClick}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.75,
              px: 1.6, py: 0.75,
              border: '1px solid currentColor', borderRadius: '5px', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 700, color: '#0f766e',
              bgcolor: 'white',
              boxShadow: hasActiveFilters ? '0 8px 18px rgba(15,118,110,0.14)' : 'none',
              '&:hover': { bgcolor: 'white' },
            }}
          >
            <FilterListIcon sx={{ fontSize: 16 }} />
            Filter
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                sx={{ height: 20, fontWeight: 800, fontSize: '0.68rem', bgcolor: '#0f766e', color: '#fff' }}
              />
            )}
          </Box>
        </Stack>
      </Stack>

      {/* Content */}
      {isLoading ? (
        <OrbitLoader title="Loading leads" minHeight={320} />
      ) : view === 'kanban' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box
            sx={{
              display: 'flex', gap: 1.5, overflowX: 'auto', px: 2, pb: 2,
              '&::-webkit-scrollbar': { height: 6 },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e0', borderRadius: 10 },
            }}
          >
            {stageDefinitions.map((stage) => {
              const col = displayLeads[stage.id] || { items: [] };
              return (
                <Box
                  key={stage.id}
                  sx={{
                    minWidth: 220, flex: '1 1 0',
                    display: 'flex', flexDirection: 'column',
                    borderRadius: '12px', bgcolor: '#f8fafc',
                    border: `1px solid ${stage.color}30`,
                  }}
                >
                  {/* Column header */}
                  <Box sx={{ bgcolor: stage.color, p: 1.5, borderRadius: '10px 10px 0 0' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '0.78rem' }}>
                          {stage.title}
                        </Typography>
                        <Chip
                          label={col.items.length}
                          size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700, height: 18, fontSize: '0.65rem' }}
                        />
                      </Stack>
                      <Box sx={{ bgcolor: '#fff', px: 1, py: 0.1, borderRadius: 10 }}>
                        <Typography sx={{ color: '#1a202c', fontSize: '0.68rem', fontWeight: 800 }}>
                          {calculateColumnTotal(col.items)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Droppable area */}
                  {/* <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <Box
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        sx={{
                          p: 1,
                          minHeight: 120,
                          height: 'calc(545px)',
                          flexGrow: 1,
                          bgcolor: snapshot.isDraggingOver ? '#edf2f7' : 'transparent',
                          transition: 'background-color 0.2s ease',
                          overflowY: 'auto',
                          '&::-webkit-scrollbar': { width: 4 },
                          '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 10 },
                        }}
                      >
                        {col.items.map((item, index) => (
                          <KanbanLeadCard
                            key={item.id}
                            item={item}
                            index={index}
                            onAction={handleLeadAction}
                          />
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable> */}
                  {/* Droppable area */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <Box
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        onScroll={(e) => {
                          const el = e.currentTarget;
                          const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
                          if (nearBottom) onLoadMore?.(stage.id);
                        }}
                        sx={{
                          p: 1,
                          minHeight: 120,
                          height: 'calc(545px)',
                          flexGrow: 1,
                          bgcolor: snapshot.isDraggingOver ? '#edf2f7' : 'transparent',
                          transition: 'background-color 0.2s ease',
                          overflowY: 'auto',
                          '&::-webkit-scrollbar': { width: 4 },
                          '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 10 },
                        }}
                      >
                        {col.items.map((item, index) => (
                          <KanbanLeadCard
                            key={item.id}
                            item={item}
                            index={index}
                            onAction={handleLeadAction}
                          />
                        ))}
                        {provided.placeholder}

                        {/* Load more indicator */}
                        {stagePagination[stage.id]?.hasMore && (
                          <Box sx={{ textAlign: 'center', py: 1 }}>
                            <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                              Scroll for more...
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Droppable>
                </Box>
              );
            })}
          </Box>
        </DragDropContext>
      ) : (
        <LeadListView
          leads={displayLeads}
          onStageChange={handleListStageChange}
          onAction={handleLeadAction}
        />
      )}

      {/* Stage Change Confirmation */}
      <Suspense fallback={DialogLoading}>
        {stageChangeDialog.open && (
          <StageChangeDialog
            open={stageChangeDialog.open}
            onClose={handleCancelStageChange}
            onConfirm={handleConfirmStageChange}
            leadName={stageChangeDialog.lead?.name || ''}
            fromStage={stageChangeDialog.fromStage}
            toStage={stageChangeDialog.toStage}
          />
        )}
      </Suspense>

      {/* Forward Lead */}
      {/* <Suspense fallback={DialogLoading}>
        {forwardDialog.open && (
          <LeadForwardDialog
            open={forwardDialog.open}
            onClose={() => setForwardDialog({ open: false, lead: null })}
            onForward={(data) => {
              console.log('Forward lead:', { leadId: forwardDialog.lead?.id, ...data });
              appendLeadActivity(forwardDialog.lead?.id, {
                title:       'Lead forwarded',
                description: `Lead was forwarded${data?.to ? ` to ${data.to}` : ''}${data?.note ? `. Note: ${data.note}` : '.'}`,
              });
              setForwardDialog({ open: false, lead: null });
            }}
            leadName={forwardDialog.lead?.name || ''}
          />
        )}
      </Suspense> */}
      {/* Forward Lead — LeadPipeline.jsx এ এই section replace করুন */}
      <Suspense fallback={DialogLoading}>
        {forwardDialog.open && (
          <LeadForwardDialog
            open={forwardDialog.open}
            onClose={() => setForwardDialog({ open: false, lead: null })}
            leadName={forwardDialog.lead?.name || ''}
            businessEntityId={forwardDialog.lead?.businessEntityId || ''}  /* ← add */
            onForward={async (data) => {
              try {
                await forwardLead(forwardDialog.lead?.id, {
                  to_type: 1,                  // 1 = KAM
                  to_id:   Number(data.kamId),
                  note:    data.reason,
                });
                appendLeadActivity(forwardDialog.lead?.id, {
                  title:       'Lead forwarded',
                  description: `Lead forwarded to KAM. Reason: ${data.reason}`,
                });
              } catch (error) {
                alert(error?.response?.data?.message || 'Forward failed. Please try again.');
              }
              setForwardDialog({ open: false, lead: null });
            }}
          />
        )}
      </Suspense>

      {/* Add Task */}
      <Dialog
        open={taskDialog.open}
        onClose={() => setTaskDialog({ open: false, lead: null })}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '14px' } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 2, sm: 3 },
            py: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700}>Add Task</Typography>
          <IconButton size="small" onClick={() => setTaskDialog({ open: false, lead: null })}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            px: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 3 },
            pt: 1.5,
            overflowX: 'hidden',
          }}
        >
          <Suspense fallback={DialogLoading}>
            {taskDialog.open && (
              <TaskForm
                initialValues={{
                  lead:        taskDialog.lead?.id || '',
                  client:      '',
                  taskType:    '',
                  title:       '',
                  details:     '',
                  scheduledAt: null,
                  location:    null,
                }}
                lockedAssociation={
                  taskDialog.lead
                    ? { mode: 'lead', option: { id: taskDialog.lead.id, label: taskDialog.lead.name } }
                    : null
                }
                onCancel={() => setTaskDialog({ open: false, lead: null })}
                onSubmit={(payload) => {
                  console.log('Task created:', payload);
                  appendLeadTask(taskDialog.lead?.id, {
                    leadName:    taskDialog.lead?.name || '',
                    taskType:    payload?.taskType  || '',
                    title:       payload?.title     || 'Untitled Task',
                    details:     payload?.details   || '',
                    scheduledAt: payload?.scheduledAt || null,
                    location:    payload?.location  || null,
                  });
                  appendLeadActivity(taskDialog.lead?.id, {
                    title:       'Task created',
                    description: `A follow-up task was added${payload?.title ? `: ${payload.title}` : ''}.`,
                  });
                  setTaskDialog({ open: false, lead: null });
                }}
              />
            )}
          </Suspense>
        </DialogContent>
      </Dialog>

      {/* View Details Drawer */}
      <Suspense fallback={DialogLoading}>
        {viewDetailsDrawer.open && (
          <ViewDetailsDrawer
            open={viewDetailsDrawer.open}
            onClose={() => setViewDetailsDrawer({ open: false, lead: null })}
            lead={viewDetailsDrawer.lead}
            notes={leadNotes[viewDetailsDrawer.lead?.id]      || []}
            activities={leadActivities[viewDetailsDrawer.lead?.id] || []}
            tasks={leadTasks[viewDetailsDrawer.lead?.id]       || []}
            onAddNote={handleAddNote}
          />
        )}
      </Suspense>
    </Box>
  );
}