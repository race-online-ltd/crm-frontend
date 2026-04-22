// src/features/tasks/components/TasksTable.jsx
import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, IconButton, Menu, MenuItem,
  Tooltip, Paper, Pagination,
  useMediaQuery, useTheme,
} from '@mui/material';
import EditOutlinedIcon       from '@mui/icons-material/EditOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PinDropIcon            from '@mui/icons-material/PinDrop';
import AccessTimeIcon         from '@mui/icons-material/AccessTime';
import PhoneIcon              from '@mui/icons-material/Phone';
import VideocamOutlinedIcon   from '@mui/icons-material/VideocamOutlined';
import FiberManualRecordIcon  from '@mui/icons-material/FiberManualRecord';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import MoreHorizIcon          from '@mui/icons-material/MoreHoriz';
import AddIcon                from '@mui/icons-material/Add';
import PersonOutlineIcon      from '@mui/icons-material/PersonOutline';
import BlockIcon              from '@mui/icons-material/Block';
import { format }             from 'date-fns';
import OrbitLoader from '../../../components/shared/OrbitLoader';
import useInitialTableLoading from '../../../components/shared/useInitialTableLoading';

// Shared config and chips live in TaskDetails so they stay in sync
import TaskDetails, { TYPE_CONFIG, TypeChip, StatusChip } from './TaskDetails';
import TaskCheckInDialog from './TaskCheckInDialog';
import TaskCancelDialog from './TaskCancelDialog';
import TaskCompleteDialog from './TaskCompleteDialog';
import { getMeetingRecorderLaunchUrl } from '../api/meetingRecorderApi';

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

// ─── ROW MENU ─────────────────────────────────────────────────────────────────
function RowMenu({ task, onEdit, onMarkComplete, onCancelTask }) {
  const [anchor, setAnchor] = useState(null);
  const isDone = task.status === 'completed' || task.status === 'cancelled';
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
        {!isDone && (
          <MenuItem onClick={(e) => { e.stopPropagation(); onMarkComplete(task); }} sx={{ gap: 1.5, py: 0.875, fontSize: 13 }}>
            <CheckCircleOutlineIcon fontSize="small" sx={{ color: '#16a34a' }} />Mark as Complete
          </MenuItem>
        )}
        {!isDone && (
          <MenuItem onClick={(e) => { e.stopPropagation(); onCancelTask(task); }} sx={{ gap: 1.5, py: 0.875, fontSize: 13, color: '#dc2626' }}>
            <BlockIcon fontSize="small" />Cancel
          </MenuItem>
        )}
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
function DesktopRow({ task, onEdit, onMarkComplete, onCancelTask, onCheckIn, onRecordMeeting, isLast, onRowClick }) {
  const isCompleted = task.status === 'completed';
  const isCancelled = task.status === 'cancelled';
  const isPhysical  = task.taskType === 'physical_meeting';
  const isVirtual   = task.taskType === 'virtual_meeting';

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
        {isPhysical && task.location && !isCompleted && !isCancelled && (
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
        {isVirtual && !isCompleted && !isCancelled && (
          <Tooltip title="Open meeting recorder">
            <span>
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => { e.stopPropagation(); onRecordMeeting(task); }}
                startIcon={<FiberManualRecordIcon sx={{ fontSize: 11, color: '#dc2626' }} />}
                sx={{
                  fontSize: 11, fontWeight: 600, borderRadius: '6px', textTransform: 'none',
                  borderColor: '#fbcfe8', color: '#be123c', bgcolor: '#fff1f2',
                  '&:hover': { bgcolor: '#ffe4e6', borderColor: '#fda4af' },
                  height: 26, px: '8px', whiteSpace: 'nowrap',
                }}
              >
                Record Meeting
              </Button>
            </span>
          </Tooltip>
        )}
        <RowMenu task={task} onEdit={onEdit} onMarkComplete={onMarkComplete} onCancelTask={onCancelTask} />
      </Stack>
    </Box>
  );
}

// ─── MOBILE CARD ─────────────────────────────────────────────────────────────
function MobileCard({ task, onEdit, onMarkComplete, onCancelTask, onCheckIn, onRecordMeeting, onRowClick }) {
  const isOverdue   = task.status === 'overdue';
  const isCompleted = task.status === 'completed';
  const isCancelled = task.status === 'cancelled';
  const isPhysical  = task.taskType === 'physical_meeting';
  const isVirtual   = task.taskType === 'virtual_meeting';

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
          <RowMenu task={task} onEdit={onEdit} onMarkComplete={onMarkComplete} onCancelTask={onCancelTask} />
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
        {isPhysical && task.location && !isCompleted && !isCancelled && (
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
        {isVirtual && !isCompleted && !isCancelled && (
          <Box mt={1} onClick={(e) => e.stopPropagation()}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onRecordMeeting(task)}
              startIcon={<FiberManualRecordIcon sx={{ fontSize: 11, color: '#dc2626' }} />}
              sx={{
                fontSize: 11, fontWeight: 600, borderRadius: '6px', textTransform: 'none',
                borderColor: '#fbcfe8', color: '#be123c', bgcolor: '#fff1f2',
                '&:hover': { bgcolor: '#ffe4e6' }, height: 27,
              }}
            >
              Record Meeting
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
 *   onTasksChange {Function} – (updatedTasks) => void — fires on complete/cancel
 *   searchQuery   {string}   – filters rows (optional, default '')
 *
 * Task shape — see TaskDetails.jsx for full JSDoc.
 */
export default function TasksTable({ tasks = [], onEdit, onNewTask, onTasksChange, searchQuery = '' }) {
  const isLoading = useInitialTableLoading();
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [page, setPage]               = useState(1);
  const [checkInTask, setCheckInTask] = useState(null);
  const [cancelTask, setCancelTask]   = useState(null);
  const [completeTask, setCompleteTask] = useState(null);
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

  const handleMarkComplete = (task) => {
    setDetailTask(null);
    setCompleteTask(task);
  };

  const handleCompleteTask = (id, payload) => {
    onTasksChange?.(tasks.map((t) => (
      t.id === id
        ? { ...t, status: 'completed', completionMessage: payload.completionMessage }
        : t
    )));
    setCompleteTask(null);
    setDetailTask(null);
  };

  const handleCancelTask = (id, payload) => {
    onTasksChange?.(tasks.map((t) => (
      t.id === id
        ? { ...t, status: 'cancelled', cancellationReason: payload.cancellationReason }
        : t
    )));
    setCancelTask(null);
    setDetailTask(null);
  };

  const handleCheckInSuccess = (id) => {
    onTasksChange?.(tasks.map((t) => t.id === id ? { ...t, status: 'completed' } : t));
  };

  const handleRecordMeeting = async (task) => {
    const launchUrl = await getMeetingRecorderLaunchUrl(task);
    if (launchUrl) {
      window.open(launchUrl, '_blank', 'noopener,noreferrer');
    }
  };

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
        {isLoading ? (
          <OrbitLoader title="Loading tasks" minHeight={260} />
        ) : paginated.length === 0 ? (
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
                onCancelTask={(t) => setCancelTask(t)}
                onCheckIn={(t) => setCheckInTask(t)}
                onRecordMeeting={handleRecordMeeting}
                onRowClick={(t) => setDetailTask(t)}
              />
            ) : (
              <DesktopRow
                key={task.id}
                task={task}
                isLast={i === paginated.length - 1}
                onEdit={onEdit || (() => {})}
                onMarkComplete={handleMarkComplete}
                onCancelTask={(t) => setCancelTask(t)}
                onCheckIn={(t) => setCheckInTask(t)}
                onRecordMeeting={handleRecordMeeting}
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
        onCancelTask={(t) => { setDetailTask(null); setCancelTask(t); }}
        onMarkComplete={handleMarkComplete}
        onCheckIn={(t) => { setDetailTask(null); setCheckInTask(t); }}
        onRecordMeeting={(t) => { setDetailTask(null); handleRecordMeeting(t); }}
      />

      {/* ── Check-in dialog ── */}
      <TaskCheckInDialog
        open={Boolean(checkInTask)}
        task={checkInTask}
        onClose={() => setCheckInTask(null)}
        onSuccess={handleCheckInSuccess}
      />

      <TaskCompleteDialog
        open={Boolean(completeTask)}
        task={completeTask}
        onClose={() => setCompleteTask(null)}
        onConfirm={handleCompleteTask}
      />

      {/* ── Cancel task dialog ── */}
      <TaskCancelDialog
        open={Boolean(cancelTask)}
        task={cancelTask}
        onClose={() => setCancelTask(null)}
        onConfirm={handleCancelTask}
      />
    </>
  );
}
