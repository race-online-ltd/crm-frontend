// src/features/tasks/components/TasksTable.jsx
import React, { useState, useCallback } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Menu, MenuItem,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Tooltip, Paper, Pagination,
  useMediaQuery, useTheme,
} from '@mui/material';
import EditOutlinedIcon       from '@mui/icons-material/EditOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineIcon      from '@mui/icons-material/DeleteOutline';
import PinDropIcon            from '@mui/icons-material/PinDrop';
import AccessTimeIcon         from '@mui/icons-material/AccessTime';
import PhoneIcon              from '@mui/icons-material/Phone';
import VideocamOutlinedIcon   from '@mui/icons-material/VideocamOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import TaskAltIcon            from '@mui/icons-material/TaskAlt';
import GpsFixedIcon           from '@mui/icons-material/GpsFixed';
import WarningAmberIcon       from '@mui/icons-material/WarningAmber';
import MoreHorizIcon          from '@mui/icons-material/MoreHoriz';
import AddIcon                from '@mui/icons-material/Add';
import PersonOutlineIcon      from '@mui/icons-material/PersonOutline';
import { format }             from 'date-fns';

// Shared config and chips live in TaskDetails so they stay in sync
import TaskDetails, { TYPE_CONFIG, STATUS_CONFIG, TypeChip, StatusChip } from './TaskDetails';

const ROWS_PER_PAGE = 5;

// ─── ROW ICON ─────────────────────────────────────────────────────────────────
function RowIcon({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.follow_up;
  const iconProps = { sx: { fontSize: 14, color: cfg.color } };
  const icon = {
    call:             <PhoneIcon              {...iconProps} />,
    physical_meeting: <PinDropIcon            {...iconProps} />,
    virtual_meeting:  <VideocamOutlinedIcon   {...iconProps} />,
    follow_up:        <AssignmentOutlinedIcon {...iconProps} />,
  }[type] || <AssignmentOutlinedIcon {...iconProps} />;

  return (
    <Box sx={{
      width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
      bgcolor: cfg.bg, border: `1px solid ${cfg.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </Box>
  );
}

// ─── SCHEDULED DATE CELL ──────────────────────────────────────────────────────
function ScheduledCell({ scheduledAt, status }) {
  if (!scheduledAt) return <Typography fontSize={12} color="text.disabled">—</Typography>;
  const isOverdue   = status === 'overdue';
  const isCompleted = status === 'completed';
  return (
    <Box>
      <Typography
        fontSize={12} fontWeight={500} lineHeight={1.4}
        sx={{ color: isOverdue ? '#b45309' : isCompleted ? '#94a3b8' : '#374151' }}
      >
        {format(scheduledAt, 'd MMM, yyyy')}
      </Typography>
      <Typography
        fontSize={11} mt="2px"
        sx={{ color: isOverdue ? '#b45309' : isCompleted ? '#94a3b8' : '#6b7280' }}
      >
        {format(scheduledAt, 'h:mm a')}
      </Typography>
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
    const dφ = toRad(lat2 - lat1), dλ = toRad(lon2 - lon1);
    const a  = Math.sin(dφ / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dλ / 2) ** 2;
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
        {state === 'idle' && (
          <Typography variant="body2" color="text.secondary">
            We'll verify your GPS matches the venue (within 200 m).
          </Typography>
        )}
        {(state === 'locating' || state === 'checking') && (
          <Stack alignItems="center" gap={1.5} py={2}>
            <CircularProgress size={36} />
            <Typography variant="body2" color="text.secondary">
              {state === 'locating' ? 'Acquiring location…' : 'Verifying…'}
            </Typography>
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
        <Button onClick={handleClose} variant="outlined" color="inherit" size="small" sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
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
        <Button onClick={onClose} variant="outlined" color="inherit" size="small" sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button onClick={() => onConfirm(task?.id)} variant="contained" color="error" size="small" sx={{ borderRadius: 2 }}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── ROW MENU ─────────────────────────────────────────────────────────────────
function RowMenu({ task, onEdit, onMarkComplete, onDelete }) {
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}
        sx={{ color: 'text.disabled', borderRadius: '6px', '&:hover': { bgcolor: '#f1f5f9', color: 'text.secondary' } }}
      >
        <MoreHorizIcon sx={{ fontSize: 17 }} />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        onClick={() => setAnchor(null)}
        PaperProps={{ elevation: 3, sx: { borderRadius: 2, minWidth: 164, mt: 0.5, border: '1px solid #e2e8f0' } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={(e) => { e.stopPropagation(); onEdit(task); }} sx={{ gap: 1.5, py: 0.875, fontSize: 13 }}>
          <EditOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} />Edit
        </MenuItem>
        {task.status !== 'completed' && (
          <MenuItem onClick={(e) => { e.stopPropagation(); onMarkComplete(task.id); }} sx={{ gap: 1.5, py: 0.875, fontSize: 13 }}>
            <CheckCircleOutlineIcon fontSize="small" sx={{ color: '#16a34a' }} />Mark as Complete
          </MenuItem>
        )}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={(e) => { e.stopPropagation(); onDelete(task); }} sx={{ gap: 1.5, py: 0.875, fontSize: 13, color: '#dc2626' }}>
          <DeleteOutlineIcon fontSize="small" />Delete
        </MenuItem>
      </Menu>
    </>
  );
}

// ─── DESKTOP ROW ─────────────────────────────────────────────────────────────
/**
 * Columns:
 *   1. Task title + client name (line 2)
 *   2. Type chip
 *   3. Lead name only
 *   4. Date (line 1) + Time (line 2)
 *   5. Status chip
 *   6. Check In button (physical only) + ⋯ menu
 */
function DesktopRow({ task, onEdit, onMarkComplete, onDelete, onCheckIn, onRowClick, isLast }) {
  const isCompleted = task.status === 'completed';
  const isPhysical  = task.taskType === 'physical_meeting';

  return (
    <Box
      onClick={() => onRowClick(task)}
      sx={{
        display: 'grid',
        gridTemplateColumns: '2fr 148px 1.6fr 130px 110px 148px',
        alignItems: 'center',
        gap: 1.5,
        px: 2.5,
        py: 1.375,
        borderBottom: isLast ? 'none' : '1px solid #edf0f4',
        cursor: 'pointer',
        transition: 'background 0.1s',
        '&:hover': { bgcolor: '#f7f9fb' },
      }}
    >
      {/* Col 1: Task title + client */}
      <Stack direction="row" alignItems="center" gap={1.25} minWidth={0}>
        <RowIcon type={task.taskType} />
        <Box minWidth={0}>
          <Typography
            fontWeight={600} noWrap fontSize={13} lineHeight={1.4}
            color={isCompleted ? '#94a3b8' : '#111827'}
            sx={{ textDecoration: isCompleted ? 'line-through' : 'none' }}
          >
            {task.title}
          </Typography>
          {task.client && (
            <Stack direction="row" alignItems="center" gap={0.5} mt="2px">
              <PersonOutlineIcon sx={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }} />
              <Typography fontSize={11} color="#94a3b8" noWrap>{task.client}</Typography>
            </Stack>
          )}
        </Box>
      </Stack>

      {/* Col 2: Type chip */}
      <Box><TypeChip type={task.taskType} /></Box>

      {/* Col 3: Lead name */}
      <Typography fontSize={12} color="#4b5563" noWrap fontWeight={500}>
        {task.lead || '—'}
      </Typography>

      {/* Col 4: Date + Time */}
      <ScheduledCell scheduledAt={task.scheduledAt} status={task.status} />

      {/* Col 5: Status chip */}
      <Box><StatusChip status={task.status} /></Box>

      {/* Col 6: Actions — stop propagation so row click doesn't fire */}
      <Stack
        direction="row" alignItems="center" gap={0.5} justifyContent="flex-end"
        onClick={(e) => e.stopPropagation()}
      >
        {isPhysical && task.location && !isCompleted && (
          <Tooltip title="GPS check-in required">
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => { e.stopPropagation(); onCheckIn(task); }}
              startIcon={<PinDropIcon sx={{ fontSize: 11 }} />}
              sx={{
                fontSize: 11, fontWeight: 600, borderRadius: '6px', textTransform: 'none',
                borderColor: '#bfdbfe', color: '#2563eb', bgcolor: '#eff6ff',
                '&:hover': { bgcolor: '#dbeafe', borderColor: '#93c5fd' },
                height: 26, px: '8px', whiteSpace: 'nowrap',
              }}
            >
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
function MobileCard({ task, onEdit, onMarkComplete, onDelete, onCheckIn, onRowClick }) {
  const isOverdue   = task.status === 'overdue';
  const isCompleted = task.status === 'completed';
  const isPhysical  = task.taskType === 'physical_meeting';

  return (
    <Box
      onClick={() => onRowClick(task)}
      sx={{
        p: 2,
        cursor: 'pointer',
        borderBottom: '1px solid #edf0f4',
        '&:last-child': { borderBottom: 'none' },
        '&:hover': { bgcolor: '#f7f9fb' },
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1} mb={1}>
        <Stack direction="row" gap={1.25} alignItems="flex-start" minWidth={0} flex={1}>
          <RowIcon type={task.taskType} />
          <Box minWidth={0} flex={1}>
            <Typography
              fontWeight={600} fontSize={13} lineHeight={1.4}
              color={isCompleted ? '#94a3b8' : '#111827'}
              sx={{ textDecoration: isCompleted ? 'line-through' : 'none', mb: '2px' }}
            >
              {task.title}
            </Typography>
            {task.client && (
              <Stack direction="row" alignItems="center" gap={0.5}>
                <PersonOutlineIcon sx={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }} />
                <Typography fontSize={11} color="#94a3b8">{task.client}</Typography>
              </Stack>
            )}
          </Box>
        </Stack>
        <Box onClick={(e) => e.stopPropagation()}>
          <RowMenu task={task} onEdit={onEdit} onMarkComplete={onMarkComplete} onDelete={onDelete} />
        </Box>
      </Stack>

      <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center" mb={1} sx={{ pl: '44px' }}>
        <TypeChip type={task.taskType} />
        <StatusChip status={task.status} />
      </Stack>

      <Box sx={{ pl: '44px' }}>
        {task.scheduledAt && (
          <Stack direction="row" alignItems="center" gap={0.5} mb={0.25}>
            <AccessTimeIcon sx={{ fontSize: 11, color: isOverdue ? '#b45309' : '#94a3b8' }} />
            <Typography fontSize={11} fontWeight={500} sx={{ color: isOverdue ? '#b45309' : '#64748b' }}>
              {format(task.scheduledAt, 'd MMM, yyyy')} · {format(task.scheduledAt, 'h:mm a')}
            </Typography>
          </Stack>
        )}
        {task.lead && (
          <Typography fontSize={11} color="#94a3b8">{task.lead}</Typography>
        )}
        {isPhysical && task.location && !isCompleted && (
          <Box mt={1} onClick={(e) => e.stopPropagation()}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onCheckIn(task)}
              startIcon={<PinDropIcon sx={{ fontSize: 11 }} />}
              sx={{
                fontSize: 11, fontWeight: 600, borderRadius: '6px', textTransform: 'none',
                borderColor: '#bfdbfe', color: '#2563eb', bgcolor: '#eff6ff',
                '&:hover': { bgcolor: '#dbeafe' }, height: 27,
              }}
            >
              Check In
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── TASKS TABLE ─────────────────────────────────────────────────────────────
/**
 * TasksTable
 *
 * Props:
 *   tasks         {Array}    – task objects (managed by parent)
 *   onEdit        {Function} – (task) => void
 *   onNewTask     {Function} – () => void — used in empty-state CTA
 *   onTasksChange {Function} – (updatedTasks) => void — fires on complete/delete
 *   searchQuery   {string}   – filters rows (optional, default '')
 *
 * Task shape — see TaskDetails.jsx for full JSDoc.
 */
export default function TasksTable({ tasks = [], onEdit, onNewTask, onTasksChange, searchQuery = '' }) {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [page, setPage]               = useState(1);
  const [checkInTask, setCheckInTask] = useState(null);
  const [deleteTask, setDeleteTask]   = useState(null);
  const [detailTask, setDetailTask]   = useState(null); // drives <TaskDetails>

  const filtered = tasks.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q)          ||
      t.details.toLowerCase().includes(q)        ||
      (t.lead   || '').toLowerCase().includes(q) ||
      (t.client || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  const handleMarkComplete = useCallback((id) => {
    onTasksChange?.(tasks.map((t) => t.id === id ? { ...t, status: 'completed' } : t));
  }, [tasks, onTasksChange]);

  const handleDelete = useCallback((id) => {
    onTasksChange?.(tasks.filter((t) => t.id !== id));
    setDeleteTask(null);
    setDetailTask(null);
  }, [tasks, onTasksChange]);

  const handleCheckInSuccess = useCallback((id) => {
    onTasksChange?.(tasks.map((t) => t.id === id ? { ...t, status: 'completed' } : t));
  }, [tasks, onTasksChange]);

  React.useEffect(() => { setPage(1); }, [searchQuery]);

  const COL_HEADERS = ['Task', 'Type', 'Lead', 'Scheduled', 'Status', ''];

  return (
    <>
      <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid #d1d9e0', overflow: 'hidden', bgcolor: '#fff' }}>

        {/* ── Desktop column headers ── */}
        {!isMobile && (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: '2fr 148px 1.6fr 130px 110px 148px',
            gap: 1.5, px: 2.5, py: 1.375,
            borderBottom: '1px solid #d1d9e0',
            bgcolor: '#f0f3f7',
          }}>
            {COL_HEADERS.map((h, i) => (
              <Typography key={i} sx={{
                fontSize: 11, fontWeight: 700, color: '#4b5563',
                textTransform: 'uppercase', letterSpacing: '0.55px',
              }}>
                {h}
              </Typography>
            ))}
          </Box>
        )}

        {/* ── Rows ── */}
        {paginated.length === 0 ? (
          <Box sx={{ py: 9, textAlign: 'center' }}>
            <AssignmentOutlinedIcon sx={{ fontSize: 42, color: '#d1d5db', mb: 1.5 }} />
            <Typography fontWeight={600} color="text.secondary" gutterBottom fontSize={14}>No tasks found</Typography>
            <Typography fontSize={13} color="text.disabled" mb={2.5}>
              {searchQuery ? 'Try a different search term' : 'Create your first task to get started'}
            </Typography>
            {!searchQuery && onNewTask && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={onNewTask}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: 13 }}>
                New Task
              </Button>
            )}
          </Box>
        ) : (
          paginated.map((task, i) =>
            isMobile ? (
              <MobileCard
                key={task.id}
                task={task}
                onEdit={onEdit || (() => {})}
                onMarkComplete={handleMarkComplete}
                onDelete={(t) => setDeleteTask(t)}
                onCheckIn={(t) => setCheckInTask(t)}
                onRowClick={(t) => setDetailTask(t)}
              />
            ) : (
              <DesktopRow
                key={task.id}
                task={task}
                isLast={i === paginated.length - 1}
                onEdit={onEdit || (() => {})}
                onMarkComplete={handleMarkComplete}
                onDelete={(t) => setDeleteTask(t)}
                onCheckIn={(t) => setCheckInTask(t)}
                onRowClick={(t) => setDetailTask(t)}
              />
            )
          )
        )}

        {/* ── Pagination ── */}
        {filtered.length > ROWS_PER_PAGE && (
          <Box sx={{
            display: 'flex', alignItems: 'center',
            justifyContent: { xs: 'center', sm: 'space-between' },
            px: 2.5, py: 1.375,
            borderTop: '1px solid #d1d9e0',
            bgcolor: '#f0f3f7',
            flexWrap: 'wrap', gap: 1.5,
          }}>
            <Typography fontSize={12} color="#6b7280" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Showing {((safePage - 1) * ROWS_PER_PAGE) + 1}–{Math.min(safePage * ROWS_PER_PAGE, filtered.length)} of {filtered.length} tasks
            </Typography>
            <Pagination
              count={totalPages} page={safePage}
              onChange={(_, v) => setPage(v)}
              size="small" shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': { fontSize: 12, borderRadius: '6px', minWidth: 28, height: 28 },
                '& .Mui-selected': { fontWeight: 700 },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* ── TaskDetails — separate component, opened on row click ── */}
      <TaskDetails
        open={Boolean(detailTask)}
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onEdit={(t) => { setDetailTask(null); onEdit?.(t); }}
        onDelete={(t) => { setDetailTask(null); setDeleteTask(t); }}
        onMarkComplete={handleMarkComplete}
        onCheckIn={(t) => { setDetailTask(null); setCheckInTask(t); }}
      />

      {/* ── Check-in dialog ── */}
      <CheckInDialog
        open={Boolean(checkInTask)}
        task={checkInTask}
        onClose={() => setCheckInTask(null)}
        onSuccess={handleCheckInSuccess}
      />

      {/* ── Delete confirm dialog ── */}
      <DeleteDialog
        open={Boolean(deleteTask)}
        task={deleteTask}
        onClose={() => setDeleteTask(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}