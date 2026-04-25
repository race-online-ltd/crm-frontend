import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Stack, Button, TextField, InputAdornment, Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import FilterButton from '../../../components/shared/FilterButton';
import TasksTable from '../components/TasksTable';
import TaskFilterDrawer from '../components/TaskFilterDrawer';
import { fetchTaskFormOptions, fetchTasks } from '../api/taskApi';

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

const DEFAULT_FILTERS = {
  taskTypeId: '',
  status: '',
  dateFrom: null,
  dateTo: null,
};

export default function TasksListPage({ onNewTask, onEditTask }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('scheduled_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [taskTypeOptions, setTaskTypeOptions] = useState([]);
  const [stats, setStats] = useState({ pending: 0, overdue: 0 });

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      try {
        const data = await fetchTaskFormOptions();
        if (!active) return;
        setTaskTypeOptions((data.task_types || []).map((option) => ({
          id: String(option.id),
          label: option.label,
        })));
      } catch {
        if (active) {
          setTaskTypeOptions([]);
        }
      }
    };

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  const queryParams = useMemo(() => ({
    page: page + 1,
    per_page: rowsPerPage,
    search: search.trim() || undefined,
    task_type_id: filters.taskTypeId || undefined,
    status: filters.status || undefined,
    date_from: filters.dateFrom || undefined,
    date_to: filters.dateTo || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  }), [page, rowsPerPage, search, filters, sortBy, sortOrder]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const response = await fetchTasks(queryParams);
      setTasks(response.data || []);
      setTotalCount(response.meta?.total ?? 0);

      const items = response.data || [];
      setStats({
        pending: items.filter((task) => task.status === 'pending').length,
        overdue: items.filter((task) => task.status === 'overdue').length,
      });
    } catch (error) {
      setTasks([]);
      setTotalCount(0);
      setLoadError(error?.message || 'Unable to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams.page, queryParams.per_page, queryParams.search, queryParams.task_type_id, queryParams.status, queryParams.date_from, queryParams.date_to, queryParams.sort_by, queryParams.sort_order]);

  const handleEdit = (task) => {
    onEditTask?.(task);
  };

  const handleApplyFilters = () => {
    setFilters(draftFilters);
    setPage(0);
    setDrawerOpen(false);
  };

  const handleResetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setPage(0);
    setDrawerOpen(false);
  };

  const handleSortRequest = (columnId) => {
    const nextOrder = sortBy === columnId && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(columnId);
    setSortOrder(nextOrder);
    setPage(0);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        mb={3}
        gap={2}
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
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 13,
            px: 2.5,
            py: 1,
            boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            alignSelf: { xs: 'stretch', sm: 'auto' },
          }}
        >
          New Task
        </Button>
      </Stack>

      <Stack direction="row" gap={2} mb={3}>
        <StatCard
          icon={<AssignmentOutlinedIcon />}
          count={stats.pending}
          label="Pending"
          accent={{ color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' }}
        />
        <StatCard
          icon={<AccessTimeIcon />}
          count={stats.overdue}
          label="Overdue"
          accent={{ color: '#d97706', bg: '#fef3c7', border: '#fde68a' }}
        />
      </Stack>

      <Stack direction="row" gap={1.5} mb={2.5} alignItems="center">
        <TextField
          fullWidth
          size="small"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
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
        <FilterButton onClick={() => {
          setDraftFilters(filters);
          setDrawerOpen(true);
        }} label="Filter" />
      </Stack>

      {loadError && (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #fecaca', bgcolor: '#fff1f2', color: '#b91c1c' }}>
          {loadError}
        </Paper>
      )}

      <TasksTable
        tasks={tasks}
        onEdit={handleEdit}
        onNewTask={onNewTask}
        onReload={loadTasks}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onRequestSort={handleSortRequest}
      />

      <TaskFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={draftFilters}
        onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        taskTypeOptions={taskTypeOptions}
      />
    </Box>
  );
}
