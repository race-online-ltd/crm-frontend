// src/features/tasks/pages/TasksListPage.jsx
import React, { useState, useCallback } from 'react';
import {
  Box, Typography, Stack, Button, TextField, InputAdornment,
  IconButton, Menu, MenuItem, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Tooltip,
  Paper, Pagination, useMediaQuery, useTheme,
} from '@mui/material';
import SearchIcon             from '@mui/icons-material/Search';
import AddIcon                from '@mui/icons-material/Add';
import MoreHorizIcon          from '@mui/icons-material/MoreHoriz';
import EditOutlinedIcon       from '@mui/icons-material/EditOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineIcon      from '@mui/icons-material/DeleteOutline';
import PinDropIcon            from '@mui/icons-material/PinDrop';
import AccessTimeIcon         from '@mui/icons-material/AccessTime';
import PhoneIcon              from '@mui/icons-material/Phone';
import VideocamOutlinedIcon   from '@mui/icons-material/VideocamOutlined';
import PeopleAltOutlinedIcon  from '@mui/icons-material/PeopleAltOutlined';
import ReplayIcon             from '@mui/icons-material/Replay';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import TaskAltIcon            from '@mui/icons-material/TaskAlt';
import GpsFixedIcon           from '@mui/icons-material/GpsFixed';
import WarningAmberIcon       from '@mui/icons-material/WarningAmber';
import { format }             from 'date-fns';
import FilterButton           from '../../../components/shared/FilterButton';

const ROWS_PER_PAGE = 6;

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_TASKS = [
  { id: 't1',  title: 'Weekly Team Sync',        details: 'Review team progress and KPIs',                        taskType: 'virtual_meeting',  lead: 'Tech Corp Deal (Tech Corporation)',            scheduledAt: new Date('2025-12-17T15:00:00'), status: 'overdue',   location: null },
  { id: 't2',  title: 'On-site Product Demo',    details: 'Present enterprise features to IT team',               taskType: 'physical_meeting', lead: 'Tech Corp Deal (Tech Corporation)',            scheduledAt: new Date('2025-12-17T16:00:00'), status: 'overdue',   location: { address: 'Dhaka Trade Center, Gulshan, Dhaka 1212', latitude: 23.7936, longitude: 90.4066 } },
  { id: 't3',  title: 'Contract Review Call',    details: 'Review contract terms with legal team',                taskType: 'virtual_meeting',  lead: 'Global Systems (Global Systems Inc)',          scheduledAt: new Date('2025-12-17T20:00:00'), status: 'overdue',   location: null },
  { id: 't4',  title: 'Prepare Proposal',        details: 'Draft contract proposal with pricing',                 taskType: 'follow_up',        lead: 'Global Systems (Global Systems Inc)',          scheduledAt: new Date('2025-12-18T15:00:00'), status: 'overdue',   location: null },
  { id: 't5',  title: 'Client Site Visit',       details: 'Meet with procurement team for contract finalization', taskType: 'physical_meeting', lead: 'Global Systems (Global Systems Inc)',          scheduledAt: new Date('2025-12-18T20:00:00'), status: 'overdue',   location: { address: 'Global Systems HQ, Motijheel, Dhaka 1000', latitude: 23.7275, longitude: 90.4179 } },
  { id: 't6',  title: 'Partner Strategy Call',   details: 'Discuss partnership expansion opportunities',          taskType: 'call',             lead: 'StartupXYZ Platform (StartupXYZ)',             scheduledAt: new Date('2025-12-19T16:30:00'), status: 'overdue',   location: null },
  { id: 't7',  title: 'Q4 Performance Review',   details: 'Complete quarterly performance assessments',           taskType: 'follow_up',        lead: 'Tech Corp Deal (Tech Corporation)',            scheduledAt: new Date('2025-12-20T17:00:00'), status: 'overdue',   location: null },
  { id: 't8',  title: 'Post-Demo Follow-up',     details: 'Check on decision progress',                           taskType: 'follow_up',        lead: 'Tech Corp Deal (Tech Corporation)',            scheduledAt: new Date('2025-12-20T21:00:00'), status: 'pending',   location: null },
  { id: 't9',  title: 'Product Brochure Sent',   details: 'Sent detailed product specifications',                 taskType: 'follow_up',        lead: 'Retail Plus Expansion (Retail Plus)',          scheduledAt: new Date('2025-12-15T15:00:00'), status: 'completed', location: null },
  { id: 't10', title: 'Initial Discovery Call',  details: 'Understand client needs and budget',                   taskType: 'call',             lead: 'Alpha Corp – Product Alpha',                  scheduledAt: new Date('2025-12-21T10:00:00'), status: 'pending',   location: null },
  { id: 't11', title: 'Demo Scheduling',         details: 'Coordinate a product demo session',                    taskType: 'virtual_meeting',  lead: 'Nexus Solutions – Product Beta',              scheduledAt: new Date('2025-12-22T14:00:00'), status: 'pending',   location: null },
  { id: 't12', title: 'Renewal Discussion',      details: 'Talk about contract renewal options',                  taskType: 'call',             lead: 'Alpha Corp – Product Alpha',                  scheduledAt: new Date('2025-12-23T11:00:00'), status: 'pending',   location: null },
];

// ─── TYPE / STATUS CONFIG ─────────────────────────────────────────────────────
const TYPE_CONFIG = {
  call:             { label: 'Call',             icon: <PhoneIcon sx={{ fontSize: 12 }} />,             color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  physical_meeting: { label: 'Physical Meeting', icon: <PeopleAltOutlinedIcon sx={{ fontSize: 12 }} />, color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  virtual_meeting:  { label: 'Virtual Meeting',  icon: <VideocamOutlinedIcon sx={{ fontSize: 12 }} />,  color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff' },
  follow_up:        { label: 'Follow Up',        icon: <ReplayIcon sx={{ fontSize: 12 }} />,            color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
};

const STATUS_CONFIG = {
  overdue:   { label: 'Overdue',   color: '#d97706', icon: <AccessTimeIcon sx={{ fontSize: 12 }} /> },
  pending:   { label: 'Pending',   color: '#2563eb', icon: <AccessTimeIcon sx={{ fontSize: 12 }} /> },
  completed: { label: 'Completed', color: '#16a34a', icon: <TaskAltIcon    sx={{ fontSize: 12 }} /> },
};

// ─── CHIPS ────────────────────────────────────────────────────────────────────
function TypeChip({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.follow_up;
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      px: 1, py: '2px', borderRadius: '20px',
      border: `1px solid ${cfg.border}`, bgcolor: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', lineHeight: 1.7,
    }}>
      {cfg.icon}{cfg.label}
    </Box>
  );
}

function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: cfg.color, fontSize: 11, fontWeight: 600 }}>
      {cfg.icon}{cfg.label}
    </Box>
  );
}

function RowIcon({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.follow_up;
  const iconMap = {
    call:             <PhoneIcon             sx={{ fontSize: 15, color: cfg.color }} />,
    physical_meeting: <PinDropIcon           sx={{ fontSize: 15, color: cfg.color }} />,
    virtual_meeting:  <VideocamOutlinedIcon  sx={{ fontSize: 15, color: cfg.color }} />,
    follow_up:        <AssignmentOutlinedIcon sx={{ fontSize: 15, color: cfg.color }} />,
  };
  return (
    <Box sx={{
      width: 30, height: 30, borderRadius: '8px', flexShrink: 0,
      bgcolor: cfg.bg, border: `1px solid ${cfg.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {iconMap[type]}
    </Box>
  );
}

// ─── CHECK-IN DIALOG ──────────────────────────────────────────────────────────
function CheckInDialog({ open, task, onClose, onSuccess }) {
  const [state, setState]       = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const Δφ = toRad(lat2 - lat1), Δλ = toRad(lon2 - lon1);
    const a  = Math.sin(Δφ / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async function handleCheckIn() {
    if (!navigator.geolocation) { setErrorMsg('Geolocation not supported.'); setState('error'); return; }
    setState('locating');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setState('checking');
        const dist = haversine(pos.coords.latitude, pos.coords.longitude, task.location.latitude, task.location.longitude);
        await new Promise((r) => setTimeout(r, 700));
        if (dist <= 200) {
          setState('success');
          setTimeout(() => { onSuccess(task.id); onClose(); setState('idle'); }, 1200);
        } else {
          setErrorMsg(`You are ${Math.round(dist)} m away. Must be within 200 m to check in.`);
          setState('error');
        }
      },
      (err) => {
        setErrorMsg(err.code === 1 ? 'Location permission denied.' : 'Unable to get your location.');
        setState('error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleClose() { setState('idle'); setErrorMsg(''); onClose(); }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <GpsFixedIcon color="primary" fontSize="small" />
          <Typography fontWeight={700} fontSize={15}>Check In</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" fontWeight={600} mb={1.5}>{task?.title}</Typography>
        {task?.location?.address && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <PinDropIcon fontSize="small" color="primary" sx={{ flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary">{task.location.address}</Typography>
          </Box>
        )}
        {state === 'idle'    && <Typography variant="body2" color="text.secondary">We'll verify your GPS matches the venue (within 200 m).</Typography>}
        {(state === 'locating' || state === 'checking') && (
          <Stack alignItems="center" gap={1.5} py={2}>
            <CircularProgress size={36} />
            <Typography variant="body2" color="text.secondary">{state === 'locating' ? 'Acquiring location…' : 'Verifying…'}</Typography>
          </Stack>
        )}
        {state === 'success' && (
          <Stack alignItems="center" gap={1} py={2}>
            <TaskAltIcon sx={{ fontSize: 44, color: '#16a34a' }} />
            <Typography fontWeight={700} color="#16a34a">Check-in successful!</Typography>
          </Stack>
        )}
        {state === 'error' && (
          <Stack direction="row" gap={1} p={1.5} bgcolor="#fff7ed" borderRadius={2} border="1px solid #fed7aa" mt={1}>
            <WarningAmberIcon sx={{ color: '#ea580c', flexShrink: 0, fontSize: 18 }} />
            <Typography variant="body2" color="#9a3412">{errorMsg}</Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" color="inherit" size="small" sx={{ borderRadius: 2 }}>Cancel</Button>
        {(state === 'idle' || state === 'error') && (
          <Button onClick={handleCheckIn} variant="contained" size="small" startIcon={<GpsFixedIcon />} sx={{ borderRadius: 2 }}>
            {state === 'error' ? 'Retry' : 'Share Location & Check In'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ─── DELETE DIALOG ────────────────────────────────────────────────────────────
function DeleteDialog({ open, task, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle><Typography fontWeight={700}>Delete Task?</Typography></DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to delete <strong>"{task?.title}"</strong>? This cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" size="small" sx={{ borderRadius: 2 }}>Cancel</Button>
        <Button onClick={() => onConfirm(task?.id)} variant="contained" color="error" size="small" sx={{ borderRadius: 2 }}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── ROW MENU ─────────────────────────────────────────────────────────────────
function RowMenu({ task, onEdit, onMarkComplete, onDelete }) {
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}
        sx={{ color: 'text.secondary', '&:hover': { bgcolor: '#f1f5f9' } }}>
        <MoreHorizIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} onClick={() => setAnchor(null)}
        PaperProps={{ elevation: 2, sx: { borderRadius: 2, minWidth: 160, mt: 0.5, border: '1px solid #e2e8f0' } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <MenuItem onClick={() => onEdit(task)} sx={{ gap: 1.5, py: 0.875, fontSize: 13 }}>
          <EditOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} />Edit
        </MenuItem>
        {task.status !== 'completed' && (
          <MenuItem onClick={() => onMarkComplete(task.id)} sx={{ gap: 1.5, py: 0.875, fontSize: 13 }}>
            <CheckCircleOutlineIcon fontSize="small" sx={{ color: '#16a34a' }} />Mark as Complete
          </MenuItem>
        )}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => onDelete(task)} sx={{ gap: 1.5, py: 0.875, fontSize: 13, color: '#dc2626' }}>
          <DeleteOutlineIcon fontSize="small" />Delete
        </MenuItem>
      </Menu>
    </>
  );
}

// ─── DESKTOP ROW ─────────────────────────────────────────────────────────────
function DesktopRow({ task, onEdit, onMarkComplete, onDelete, onCheckIn, isLast }) {
  const isOverdue   = task.status === 'overdue';
  const isCompleted = task.status === 'completed';
  const isPhysical  = task.taskType === 'physical_meeting';

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: '2fr 145px 1.5fr 155px 95px 140px',
      alignItems: 'center',
      gap: 1.5,
      px: 2.5,
      py: 1.5,
      borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
      transition: 'background 0.12s',
      '&:hover': { bgcolor: '#fafbfc' },
    }}>
      {/* Task */}
      <Stack direction="row" alignItems="center" gap={1.25} minWidth={0}>
        <RowIcon type={task.taskType} />
        <Box minWidth={0}>
          <Typography variant="body2" fontWeight={600} noWrap fontSize={13}
            color={isCompleted ? '#94a3b8' : '#0f172a'}
            sx={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
            {task.title}
          </Typography>
          <Typography variant="caption" color="text.disabled" noWrap fontSize={11}>
            {task.details}
          </Typography>
        </Box>
      </Stack>

      {/* Type */}
      <Box sx={{ overflow: 'hidden' }}><TypeChip type={task.taskType} /></Box>

      {/* Lead */}
      <Typography variant="body2" color="#64748b" noWrap fontSize={12}>{task.lead}</Typography>

      {/* Scheduled */}
      <Typography variant="body2" fontWeight={500} noWrap fontSize={12}
        sx={{ color: isOverdue ? '#d97706' : isCompleted ? '#94a3b8' : '#374151' }}>
        {task.scheduledAt ? format(task.scheduledAt, 'MMM d, yyyy, hh:mm aa') : '—'}
      </Typography>

      {/* Status */}
      <Box><StatusChip status={task.status} /></Box>

      {/* Actions */}
      <Stack direction="row" alignItems="center" gap={0.5} justifyContent="flex-end">
        {isPhysical && task.location && task.status !== 'completed' && (
          <Tooltip title="Check In (GPS required)">
            <Button size="small" variant="outlined" onClick={() => onCheckIn(task)}
              startIcon={<PinDropIcon sx={{ fontSize: 12 }} />}
              sx={{
                fontSize: 11, fontWeight: 600, borderRadius: 1.5, textTransform: 'none',
                borderColor: '#bfdbfe', color: '#2563eb', bgcolor: '#eff6ff',
                '&:hover': { bgcolor: '#dbeafe', borderColor: '#93c5fd' },
                height: 27, px: 1, whiteSpace: 'nowrap',
              }}>
              Check In
            </Button>
          </Tooltip>
        )}
        <RowMenu task={task} onEdit={onEdit} onMarkComplete={onMarkComplete} onDelete={onDelete} />
      </Stack>
    </Box>
  );
}

// ─── MOBILE CARD ─────────────────────────────────────────────────────────────
function MobileCard({ task, onEdit, onMarkComplete, onDelete, onCheckIn }) {
  const isOverdue   = task.status === 'overdue';
  const isCompleted = task.status === 'completed';
  const isPhysical  = task.taskType === 'physical_meeting';

  return (
    <Box sx={{
      p: 2,
      borderBottom: '1px solid #f1f5f9',
      '&:last-child': { borderBottom: 'none' },
      '&:hover': { bgcolor: '#fafbfc' },
    }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1} mb={1}>
        <Stack direction="row" gap={1.25} alignItems="flex-start" minWidth={0} flex={1}>
          <RowIcon type={task.taskType} />
          <Box minWidth={0} flex={1}>
            <Typography variant="body2" fontWeight={600} fontSize={13}
              color={isCompleted ? '#94a3b8' : '#0f172a'}
              sx={{ textDecoration: isCompleted ? 'line-through' : 'none', mb: '2px' }}>
              {task.title}
            </Typography>
            <Typography variant="caption" color="text.disabled" fontSize={11} sx={{ display: 'block' }}>
              {task.details}
            </Typography>
          </Box>
        </Stack>
        <RowMenu task={task} onEdit={onEdit} onMarkComplete={onMarkComplete} onDelete={onDelete} />
      </Stack>

      {/* Chips */}
      <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center" mb={1} sx={{ pl: '42px' }}>
        <TypeChip type={task.taskType} />
        <StatusChip status={task.status} />
      </Stack>

      {/* Meta */}
      <Box sx={{ pl: '42px' }}>
        <Stack direction="row" alignItems="center" gap={0.5} mb={0.25}>
          <AccessTimeIcon sx={{ fontSize: 11, color: isOverdue ? '#d97706' : '#94a3b8' }} />
          <Typography variant="caption" fontSize={11} fontWeight={500}
            sx={{ color: isOverdue ? '#d97706' : '#64748b' }}>
            {task.scheduledAt ? format(task.scheduledAt, 'MMM d, yyyy · hh:mm aa') : '—'}
          </Typography>
        </Stack>
        <Typography variant="caption" color="#94a3b8" fontSize={11}>{task.lead}</Typography>

        {isPhysical && task.location && task.status !== 'completed' && (
          <Box mt={1}>
            <Button size="small" variant="outlined" onClick={() => onCheckIn(task)}
              startIcon={<PinDropIcon sx={{ fontSize: 12 }} />}
              sx={{
                fontSize: 11, fontWeight: 600, borderRadius: 1.5, textTransform: 'none',
                borderColor: '#bfdbfe', color: '#2563eb', bgcolor: '#eff6ff',
                '&:hover': { bgcolor: '#dbeafe' }, height: 28,
              }}>
              Check In
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon, count, label, accent }) {
  return (
    <Paper elevation={0} sx={{
      flex: 1, display: 'flex', alignItems: 'center', gap: 1.5,
      px: 2.5, py: 2, borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#fff', minWidth: 0,
    }}>
      <Box sx={{
        width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
        bgcolor: accent.bg, border: `1px solid ${accent.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {React.cloneElement(icon, { sx: { fontSize: 20, color: accent.color } })}
      </Box>
      <Box>
        <Typography fontWeight={800} fontSize={20} color="#0f172a" lineHeight={1}>{count}</Typography>
        <Typography variant="caption" color="text.secondary" fontSize={12}>{label}</Typography>
      </Box>
    </Paper>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function TasksListPage({ onNewTask, onEditTask }) {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [tasks, setTasks]             = useState(MOCK_TASKS);
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);
  const [checkInTask, setCheckInTask] = useState(null);
  const [deleteTask, setDeleteTask]   = useState(null);

  const pending  = tasks.filter((t) => t.status === 'pending').length;
  const overdue  = tasks.filter((t) => t.status === 'overdue').length;

  const filtered = tasks.filter((t) => {
    const q = search.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.details.toLowerCase().includes(q) || t.lead.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  const handleSearch      = (e)  => { setSearch(e.target.value); setPage(1); };
  const handleMarkComplete = useCallback((id) => setTasks((p) => p.map((t) => t.id === id ? { ...t, status: 'completed' } : t)), []);
  const handleDelete       = useCallback((id) => { setTasks((p) => p.filter((t) => t.id !== id)); setDeleteTask(null); }, []);
  const handleCheckInSuccess = useCallback((id) => setTasks((p) => p.map((t) => t.id === id ? { ...t, status: 'completed' } : t)), []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2.5, md: 4 } }}>

      {/* ── HEADER ── */}
      <Stack direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        mb={3} gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0f172a" letterSpacing="-0.3px">Tasks</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.25} fontSize={13}>
            Manage meetings, calls, and tasks for your leads
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onNewTask}
          sx={{
            borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: 13,
            px: 2.5, py: 1, boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
            whiteSpace: 'nowrap', flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'auto' },
          }}>
        New Task
        </Button>
      </Stack>

      {/* ── STAT CARDS ── */}
      <Stack direction="row" gap={2} mb={3}>
        <StatCard icon={<AssignmentOutlinedIcon />} count={pending} label="Pending"
          accent={{ color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' }} />
        <StatCard icon={<AccessTimeIcon />} count={overdue} label="Overdue"
          accent={{ color: '#d97706', bg: '#fef3c7', border: '#fde68a' }} />
      </Stack>

      {/* ── SEARCH + FILTER ── */}
      <Stack direction="row" gap={1.5} mb={2.5} alignItems="center">
        <TextField fullWidth size="small" placeholder="Search tasks..."
          value={search} onChange={handleSearch}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} /></InputAdornment>,
            sx: { borderRadius: 2, bgcolor: '#fff', fontSize: 13 },
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <FilterButton onClick={() => {}} label="Filter" />
      </Stack>

      {/* ── TABLE ── */}
      <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: '#fff' }}>

        {/* Desktop column headers */}
        {!isMobile && (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: '2fr 145px 1.5fr 155px 95px 140px',
            gap: 1.5, px: 2.5, py: 1.25,
            borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc',
          }}>
            {['Task', 'Type', 'Lead', 'Scheduled', 'Status', ''].map((h, i) => (
              <Typography key={i} variant="caption" fontWeight={700} color="text.secondary"
                sx={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                {h}
              </Typography>
            ))}
          </Box>
        )}

        {/* Rows */}
        {paginated.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <AssignmentOutlinedIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1.5 }} />
            <Typography fontWeight={600} color="text.secondary" gutterBottom>No tasks found</Typography>
            <Typography variant="body2" color="text.disabled" mb={2.5} fontSize={13}>
              {search ? 'Try a different search term' : 'Create your first task to get started'}
            </Typography>
            {!search && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={onNewTask}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: 13 }}>
                New Task
              </Button>
            )}
          </Box>
        ) : (
          paginated.map((task, i) =>
            isMobile ? (
              <MobileCard key={task.id} task={task}
                onEdit={onEditTask || (() => {})}
                onMarkComplete={handleMarkComplete}
                onDelete={(t) => setDeleteTask(t)}
                onCheckIn={(t) => setCheckInTask(t)}
              />
            ) : (
              <DesktopRow key={task.id} task={task} isLast={i === paginated.length - 1}
                onEdit={onEditTask || (() => {})}
                onMarkComplete={handleMarkComplete}
                onDelete={(t) => setDeleteTask(t)}
                onCheckIn={(t) => setCheckInTask(t)}
              />
            )
          )
        )}

        {/* ── PAGINATION ── */}
        {filtered.length > ROWS_PER_PAGE && (
          <Box sx={{
            display: 'flex', alignItems: 'center',
            justifyContent: { xs: 'center', sm: 'space-between' },
            px: 2.5, py: 1.5,
            borderTop: '1px solid #f1f5f9',
            bgcolor: '#fafafa',
            flexWrap: 'wrap', gap: 1.5,
          }}>
            <Typography variant="caption" color="text.secondary" fontSize={12}
              sx={{ display: { xs: 'none', sm: 'block' } }}>
              Showing {((safePage - 1) * ROWS_PER_PAGE) + 1}–{Math.min(safePage * ROWS_PER_PAGE, filtered.length)} of {filtered.length} tasks
            </Typography>
            <Pagination count={totalPages} page={safePage} onChange={(_, v) => setPage(v)}
              size="small" shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': { fontSize: 12, borderRadius: 1.5, minWidth: 28, height: 28 },
                '& .Mui-selected': { fontWeight: 700 },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* ── DIALOGS ── */}
      <CheckInDialog open={Boolean(checkInTask)} task={checkInTask}
        onClose={() => setCheckInTask(null)} onSuccess={handleCheckInSuccess} />
      <DeleteDialog open={Boolean(deleteTask)} task={deleteTask}
        onClose={() => setDeleteTask(null)} onConfirm={handleDelete} />
    </Box>
  );
}