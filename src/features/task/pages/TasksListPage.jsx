// src/features/tasks/pages/TasksListPage.jsx
import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, TextField, InputAdornment, Paper,
} from '@mui/material';
import SearchIcon             from '@mui/icons-material/Search';
import AddIcon                from '@mui/icons-material/Add';
import AccessTimeIcon         from '@mui/icons-material/AccessTime';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import FilterButton           from '../../../components/shared/FilterButton';
import TasksTable             from '../components/TasksTable';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// Shape change from original:
//   - `lead`      now contains the lead name only (no parenthetical)
//   - `client`    new field — the client name. If the task is lead-based, this
//                 comes from the lead's associated client (resolved on the backend).
//                 If client-based, it's the client directly.
//   - `assocType` new field — 'lead' | 'client', reflects how the task was created.
//
// In production, `client` and `assocType` are returned by the backend alongside
// each task. No frontend resolution needed.
const MOCK_TASKS = [
  {
    id: 't1',
    title: 'Weekly Team Sync',
    details: 'Review team progress and KPIs',
    taskType: 'virtual_meeting',
    lead: 'Tech Corp Deal',
    client: 'Tech Corporation',
    assocType: 'lead',
    scheduledAt: new Date('2025-12-17T15:00:00'),
    status: 'overdue',
    location: null,
  },
  {
    id: 't2',
    title: 'On-site Product Demo',
    details: 'Present enterprise features to IT team',
    taskType: 'physical_meeting',
    lead: 'Tech Corp Deal',
    client: 'Tech Corporation',
    assocType: 'lead',
    scheduledAt: new Date('2025-12-17T16:00:00'),
    status: 'overdue',
    location: { address: 'Dhaka Trade Center, Gulshan, Dhaka 1212', latitude: 23.7936, longitude: 90.4066 },
  },
  {
    id: 't3',
    title: 'Contract Review Call',
    details: 'Review contract terms with legal team',
    taskType: 'virtual_meeting',
    lead: 'Global Systems',
    client: 'Global Systems Inc',
    assocType: 'lead',
    scheduledAt: new Date('2025-12-17T20:00:00'),
    status: 'overdue',
    location: null,
  },
  {
    id: 't4',
    title: 'Prepare Proposal',
    details: 'Draft contract proposal with pricing',
    taskType: 'follow_up',
    lead: 'Global Systems',
    client: 'Global Systems Inc',
    assocType: 'lead',
    scheduledAt: new Date('2025-12-18T15:00:00'),
    status: 'overdue',
    location: null,
  },
  {
    id: 't5',
    title: 'Client Site Visit',
    details: 'Meet with procurement team for contract finalization',
    taskType: 'physical_meeting',
    lead: 'Global Systems',
    client: 'Global Systems Inc',
    assocType: 'lead',
    scheduledAt: new Date('2025-12-18T20:00:00'),
    status: 'overdue',
    location: { address: 'Global Systems HQ, Motijheel, Dhaka 1000', latitude: 23.7275, longitude: 90.4179 },
  },
  {
    id: 't6',
    title: 'Partner Strategy Call',
    details: 'Discuss partnership expansion opportunities',
    taskType: 'call',
    lead: null,               // client-based task — no lead
    client: 'StartupXYZ',
    assocType: 'client',
    scheduledAt: new Date('2025-12-19T16:30:00'),
    status: 'overdue',
    location: null,
  },
  {
    id: 't7',
    title: 'Q4 Performance Review',
    details: 'Complete quarterly performance assessments',
    taskType: 'follow_up',
    lead: 'Tech Corp Deal',
    client: 'Tech Corporation',
    assocType: 'lead',
    scheduledAt: new Date('2025-12-20T17:00:00'),
    status: 'overdue',
    location: null,
  },
  {
    id: 't8',
    title: 'Post-Demo Follow-up',
    details: 'Check on decision progress',
    taskType: 'follow_up',
    lead: 'Tech Corp Deal',
    client: 'Tech Corporation',
    assocType: 'lead',
    scheduledAt: new Date('2025-12-20T21:00:00'),
    status: 'pending',
    location: null,
  },
  {
    id: 't9',
    title: 'Product Brochure Sent',
    details: 'Sent detailed product specifications',
    taskType: 'follow_up',
    lead: null,               // client-based task
    client: 'Retail Plus',
    assocType: 'client',
    scheduledAt: new Date('2025-12-15T15:00:00'),
    status: 'completed',
    location: null,
  },
  {
    id: 't10',
    title: 'Initial Discovery Call',
    details: 'Understand client needs and budget',
    taskType: 'call',
    lead: null,               // client-based task
    client: 'Alpha Corp',
    assocType: 'client',
    scheduledAt: new Date('2025-12-21T10:00:00'),
    status: 'pending',
    location: null,
  },
  {
    id: 't11',
    title: 'Demo Scheduling',
    details: 'Coordinate a product demo session',
    taskType: 'virtual_meeting',
    lead: 'Nexus Solutions',
    client: 'Nexus Solutions',
    assocType: 'lead',
    scheduledAt: new Date('2025-12-22T14:00:00'),
    status: 'pending',
    location: null,
  },
  {
    id: 't12',
    title: 'Renewal Discussion',
    details: 'Talk about contract renewal options',
    taskType: 'call',
    lead: null,               // client-based task
    client: 'Alpha Corp',
    assocType: 'client',
    scheduledAt: new Date('2025-12-23T11:00:00'),
    status: 'pending',
    location: null,
  },
];

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon, count, label, accent }) {
  return (
    <Paper elevation={0} sx={{
      flex: 1, display: 'flex', alignItems: 'center', gap: 1.5,
      px: 2.5, py: 2, borderRadius: 2.5, border: '1px solid #d1d9e0',
      bgcolor: '#fff', minWidth: 0,
    }}>
      <Box sx={{
        width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
        bgcolor: accent.bg, border: `1px solid ${accent.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {React.cloneElement(icon, { sx: { fontSize: 20, color: accent.color } })}
      </Box>
      <Box>
        <Typography fontWeight={800} fontSize={20} color="#111827" lineHeight={1}>{count}</Typography>
        <Typography fontSize={12} color="#6b7280">{label}</Typography>
      </Box>
    </Paper>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function TasksListPage({ onNewTask, onEditTask }) {
  const [tasks, setTasks]   = useState(MOCK_TASKS);
  const [search, setSearch] = useState('');

  const pending = tasks.filter((t) => t.status === 'pending').length;
  const overdue = tasks.filter((t) => t.status === 'overdue').length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>

      {/* ── HEADER ── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        mb={3} gap={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">Tasks</Typography>
          <Typography fontSize={13} color="text.secondary" mt={0.25}>
            Manage meetings, calls, and tasks for your leads
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNewTask}
          sx={{
            borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: 13,
            px: 2.5, py: 1, boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
            whiteSpace: 'nowrap', flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'auto' },
          }}
        >
          New Task
        </Button>
      </Stack>

      {/* ── STAT CARDS ── */}
      <Stack direction="row" gap={2} mb={3}>
        <StatCard
          icon={<AssignmentOutlinedIcon />}
          count={pending}
          label="Pending"
          accent={{ color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' }}
        />
        <StatCard
          icon={<AccessTimeIcon />}
          count={overdue}
          label="Overdue"
          accent={{ color: '#d97706', bg: '#fef3c7', border: '#fde68a' }}
        />
      </Stack>

      {/* ── SEARCH + FILTER ── */}
      <Stack direction="row" gap={1.5} mb={2.5} alignItems="center">
        <TextField
          fullWidth
          size="small"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
            sx: { borderRadius: 2, bgcolor: '#fff', fontSize: 13 },
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <FilterButton onClick={() => {}} label="Filter" />
      </Stack>

      {/* ── TABLE ── */}
      <TasksTable
        tasks={tasks}
        onEdit={onEditTask}
        onNewTask={onNewTask}
        onTasksChange={setTasks}
        searchQuery={search}
      />

    </Box>
  );
}