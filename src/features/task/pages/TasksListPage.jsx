// src/features/tasks/pages/TasksListPage.jsx
import React, { useMemo, useState } from 'react';
import {
  Box, Typography, Stack, Button, TextField, InputAdornment, Paper,
} from '@mui/material';
import SearchIcon             from '@mui/icons-material/Search';
import AddIcon                from '@mui/icons-material/Add';
import AccessTimeIcon         from '@mui/icons-material/AccessTime';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import FilterButton           from '../../../components/shared/FilterButton';
import TasksTable             from '../components/TasksTable';
import { MOCK_TASKS } from '../data/mockTasks';

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
export default function TasksListPage({
  tasks: tasksProp,
  onTasksChange,
  onNewTask,
  onEditTask,
}) {
  const [search, setSearch] = useState('');
  const tasks = useMemo(
    () => (Array.isArray(tasksProp) && tasksProp.length > 0 ? tasksProp : (Array.isArray(tasksProp) ? [] : MOCK_TASKS)),
    [tasksProp],
  );

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
        onTasksChange={onTasksChange}
        searchQuery={search}
      />

    </Box>
  );
}
