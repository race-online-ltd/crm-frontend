import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TablePagination,
  TableSortLabel,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PinDropIcon from '@mui/icons-material/PinDrop';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneIcon from '@mui/icons-material/Phone';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AddIcon from '@mui/icons-material/Add';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BlockIcon from '@mui/icons-material/Block';
import { format } from 'date-fns';
import OrbitLoader from '../../../components/shared/OrbitLoader';
import useInitialTableLoading from '../../../components/shared/useInitialTableLoading';
import TaskDetails, { TypeChip, StatusChip } from './TaskDetails';
import { TYPE_CONFIG } from './TaskDetails.constants.jsx';
import TaskCheckInDialog from './TaskCheckInDialog';
import TaskCancelDialog from './TaskCancelDialog';
import TaskCompleteDialog from './TaskCompleteDialog';
import { getMeetingRecorderLaunchUrl } from '../api/meetingRecorderApi';
import { checkInTask, cancelTask as cancelTaskRequest, completeTask as completeTaskRequest } from '../api/taskApi';

function RowIcon({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.follow_up;
  const iconProps = { sx: { fontSize: 14, color: cfg.color } };
  const icon = {
    call: <PhoneIcon {...iconProps} />,
    physical_meeting: <PinDropIcon {...iconProps} />,
    virtual_meeting: <VideocamOutlinedIcon {...iconProps} />,
    follow_up: <AssignmentOutlinedIcon {...iconProps} />,
  }[type] || <AssignmentOutlinedIcon {...iconProps} />;

  return (
    <Box sx={{
      width: 32,
      height: 32,
      borderRadius: '8px',
      flexShrink: 0,
      bgcolor: cfg.bg,
      border: `1px solid ${cfg.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {icon}
    </Box>
  );
}

function ScheduledCell({ scheduledAt, status }) {
  if (!scheduledAt) return <Typography fontSize={12} color="text.disabled">—</Typography>;
  const isOverdue = status === 'overdue';
  const isCompleted = status === 'completed';

  return (
    <Box>
      <Typography
        fontSize={12}
        fontWeight={500}
        lineHeight={1.4}
        sx={{ color: isOverdue ? '#b45309' : isCompleted ? '#94a3b8' : '#374151' }}
      >
        {format(new Date(scheduledAt), 'd MMM, yyyy')}
      </Typography>
      <Typography
        fontSize={11}
        mt="2px"
        sx={{ color: isOverdue ? '#b45309' : isCompleted ? '#94a3b8' : '#6b7280' }}
      >
        {format(new Date(scheduledAt), 'h:mm a')}
      </Typography>
    </Box>
  );
}

function RowMenu({ task, onView, onEdit, onMarkComplete, onCancelTask }) {
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
        <MenuItem onClick={(e) => { e.stopPropagation(); onView(task); }} sx={{ gap: 1.5, py: 0.875, fontSize: 13 }}>
          <VisibilityOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} />View
        </MenuItem>
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

function DesktopRow({ task, onView, onEdit, onMarkComplete, onCancelTask, onCheckIn, onRecordMeeting, isLast, onRowClick }) {
  const isCompleted = task.status === 'completed';
  const isCancelled = task.status === 'cancelled';
  const isPhysical = task.taskType === 'physical_meeting';
  const isVirtual = task.taskType === 'virtual_meeting';
  const isMeeting = isPhysical || isVirtual;
  const hasCheckIn = isPhysical && task.location && !task.checked_in_at && !isCompleted && !isCancelled;

  return (
    <Box
      onClick={() => onRowClick(task)}
      sx={{
        display: 'grid',
        gridTemplateColumns: '1.8fr 138px 1.45fr 124px 106px 170px',
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
      <Stack direction="row" alignItems="center" gap={1.25} minWidth={0}>
        <RowIcon type={task.taskType} />
        <Box minWidth={0}>
          <Typography
            fontWeight={600}
            noWrap
            fontSize={13}
            lineHeight={1.4}
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

      <Box><TypeChip type={task.taskType} /></Box>
      <Typography fontSize={12} color="#4b5563" noWrap fontWeight={500}>
        {task.lead || '—'}
      </Typography>
      <ScheduledCell scheduledAt={task.scheduledAt} status={task.status} />
      <Box><StatusChip status={task.status} /></Box>

      <Stack
        direction="row"
        alignItems="center"
        gap={0.5}
        justifyContent="flex-end"
        onClick={(e) => e.stopPropagation()}
        sx={{ minWidth: 0 }}
      >
        <Box sx={{ width: 68, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
          {isMeeting && !isCompleted && !isCancelled ? (
          <Tooltip title="Open meeting recorder">
            <Button
              size="small"
              aria-label="Record meeting"
              onClick={(e) => { e.stopPropagation(); onRecordMeeting(task); }}
              variant="outlined"
              sx={{
                minWidth: 62,
                height: 26,
                borderRadius: '8px',
                border: '1px solid #fbcfe8',
                bgcolor: '#fff1f2',
                color: '#be123c',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'none',
                px: 1,
                '&:hover': { bgcolor: '#ffe4e6', borderColor: '#fda4af' },
              }}
            >
              Record
            </Button>
          </Tooltip>
          ) : null}
        </Box>
        <Box sx={{ width: 88, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
          {hasCheckIn ? (
            <Tooltip title="GPS check-in required">
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => { e.stopPropagation(); onCheckIn(task); }}
                startIcon={<PinDropIcon sx={{ fontSize: 11 }} />}
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: '6px',
                  textTransform: 'none',
                  borderColor: '#bfdbfe',
                  color: '#2563eb',
                  bgcolor: '#eff6ff',
                  '&:hover': { bgcolor: '#dbeafe', borderColor: '#93c5fd' },
                  height: 26,
                  px: '8px',
                  whiteSpace: 'nowrap',
                }}
              >
                Check In
              </Button>
            </Tooltip>
          ) : null}
        </Box>
        <RowMenu task={task} onView={onView} onEdit={onEdit} onMarkComplete={onMarkComplete} onCancelTask={onCancelTask} />
      </Stack>
    </Box>
  );
}

function MobileCard({ task, onView, onEdit, onMarkComplete, onCancelTask, onCheckIn, onRecordMeeting, onRowClick }) {
  const isOverdue = task.status === 'overdue';
  const isCompleted = task.status === 'completed';
  const isCancelled = task.status === 'cancelled';
  const isPhysical = task.taskType === 'physical_meeting';
  const isVirtual = task.taskType === 'virtual_meeting';
  const isMeeting = isPhysical || isVirtual;
  const hasCheckIn = isPhysical && task.location && !task.checked_in_at && !isCompleted && !isCancelled;

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
              fontWeight={600}
              fontSize={13}
              lineHeight={1.4}
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
          <RowMenu task={task} onView={onView} onEdit={onEdit} onMarkComplete={onMarkComplete} onCancelTask={onCancelTask} />
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
              {format(new Date(task.scheduledAt), 'd MMM, yyyy')} · {format(new Date(task.scheduledAt), 'h:mm a')}
            </Typography>
          </Stack>
        )}
        {task.lead && (
          <Typography fontSize={11} color="#94a3b8">{task.lead}</Typography>
        )}
        {(isMeeting || hasCheckIn) && (
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            flexWrap="wrap"
            mt={1}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ width: 68, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isMeeting && !isCompleted && !isCancelled ? (
                <Tooltip title="Open meeting recorder">
                  <Button
                    size="small"
                    aria-label="Record meeting"
                    onClick={() => onRecordMeeting(task)}
                    variant="outlined"
                    sx={{
                      minWidth: 62,
                      height: 30,
                      borderRadius: '8px',
                      border: '1px solid #fbcfe8',
                      bgcolor: '#fff1f2',
                      color: '#be123c',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 1,
                      '&:hover': { bgcolor: '#ffe4e6', borderColor: '#fda4af' },
                    }}
                  >
                    Record
                  </Button>
                </Tooltip>
              ) : null}
            </Box>
            <Box sx={{ width: 84, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {hasCheckIn ? (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onCheckIn(task)}
                  startIcon={<PinDropIcon sx={{ fontSize: 11 }} />}
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: '6px',
                    textTransform: 'none',
                    borderColor: '#bfdbfe',
                    color: '#2563eb',
                    bgcolor: '#eff6ff',
                    '&:hover': { bgcolor: '#dbeafe' },
                    height: 27,
                  }}
                >
                  Check In
                </Button>
              ) : null}
            </Box>
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default function TasksTable({
  tasks = [],
  onEdit,
  onNewTask,
  onReload,
  loading = false,
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange,
  sortBy = 'scheduled_at',
  sortOrder = 'desc',
  onRequestSort,
}) {
  const isLoading = useInitialTableLoading();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [checkInTaskDialog, setCheckInTaskDialog] = useState(null);
  const [cancelTaskDialog, setCancelTaskDialog] = useState(null);
  const [completeTaskDialog, setCompleteTaskDialog] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleRecordMeeting = async (task) => {
    const launchUrl = await getMeetingRecorderLaunchUrl(task);
    if (launchUrl) {
      window.open(launchUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleMarkComplete = (task) => {
    setDetailTask(null);
    setCompleteTaskDialog(task);
  };

  const handleCompleteTask = async (id, payload) => {
    try {
      setActionLoading(true);
      await completeTaskRequest(id, payload);
      await onReload?.();
      setCompleteTaskDialog(null);
      setDetailTask(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelTask = (task) => {
    setDetailTask(null);
    setCancelTaskDialog(task);
  };

  const handleCancelTaskConfirm = async (id, payload) => {
    try {
      setActionLoading(true);
      await cancelTaskRequest(id, payload);
      await onReload?.();
      setCancelTaskDialog(null);
      setDetailTask(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckIn = (task) => {
    setDetailTask(null);
    setCheckInTaskDialog(task);
  };

  const handleCheckInSuccess = async (task, locationPayload) => {
    try {
      setActionLoading(true);
      await checkInTask(task.id, locationPayload);
      await onReload?.();
      setCheckInTaskDialog(null);
      setDetailTask(null);
    } finally {
      setActionLoading(false);
    }
  };

  const sortLabel = (columnId, label) => (
    <TableSortLabel
      active={sortBy === columnId}
      direction={sortBy === columnId ? sortOrder : 'asc'}
      hideSortIcon={false}
      onClick={() => onRequestSort?.(columnId)}
      sx={{
        color: '#4b5563',
        '& .MuiTableSortLabel-icon': {
          opacity: 0.22,
          transition: 'opacity 0.15s ease, color 0.15s ease',
        },
        '&:hover .MuiTableSortLabel-icon': {
          opacity: 0.45,
        },
        '&.Mui-active': {
          color: '#1e293b',
          '& .MuiTableSortLabel-icon': {
            opacity: 0.7,
          },
        },
      }}
    >
      {label}
    </TableSortLabel>
  );

  return (
    <>
      <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid #d1d9e0', overflow: 'hidden', bgcolor: '#fff' }}>
        {!isMobile && (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: '1.8fr 138px 1.45fr 124px 106px 170px',
            gap: 1.5,
            px: 2.5,
            py: 1.375,
            borderBottom: '1px solid #d1d9e0',
            bgcolor: '#f0f3f7',
          }}>
            <Box sx={{ fontSize: 11, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.55px' }}>
              {sortLabel('title', 'Task')}
            </Box>
            <Box sx={{ fontSize: 11, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.55px' }}>
              {sortLabel('task_type', 'Type')}
            </Box>
            <Box sx={{ fontSize: 11, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.55px' }}>
              {sortLabel('lead', 'Lead')}
            </Box>
            <Box sx={{ fontSize: 11, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.55px' }}>
              {sortLabel('scheduled_at', 'Scheduled')}
            </Box>
            <Box sx={{ fontSize: 11, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.55px' }}>
              {sortLabel('status', 'Status')}
            </Box>
            <Box sx={{ fontSize: 11, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.55px' }} />
          </Box>
        )}

        {loading || isLoading ? (
          <OrbitLoader title="Loading tasks" minHeight={260} />
        ) : tasks.length === 0 ? (
          <Box sx={{ py: 9, textAlign: 'center' }}>
            <AssignmentOutlinedIcon sx={{ fontSize: 42, color: '#d1d5db', mb: 1.5 }} />
            <Typography fontWeight={600} color="text.secondary" gutterBottom fontSize={14}>No tasks found</Typography>
            <Typography fontSize={13} color="text.disabled" mb={2.5}>
              Try adjusting the search or filters.
            </Typography>
            {onNewTask && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={onNewTask}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: 13 }}>
                New Task
              </Button>
            )}
          </Box>
        ) : (
          tasks.map((task, index) => (
            isMobile ? (
              <MobileCard
                key={task.id}
                task={task}
                onView={(row) => setDetailTask(row)}
                onEdit={onEdit || (() => {})}
                onMarkComplete={handleMarkComplete}
                onCancelTask={handleCancelTask}
                onCheckIn={handleCheckIn}
                onRecordMeeting={handleRecordMeeting}
                onRowClick={(row) => setDetailTask(row)}
              />
            ) : (
              <DesktopRow
                key={task.id}
                task={task}
                isLast={index === tasks.length - 1}
                onView={(row) => setDetailTask(row)}
                onEdit={onEdit || (() => {})}
                onMarkComplete={handleMarkComplete}
                onCancelTask={handleCancelTask}
                onCheckIn={handleCheckIn}
                onRecordMeeting={handleRecordMeeting}
                onRowClick={(row) => setDetailTask(row)}
              />
            )
          ))
        )}

        <TablePagination
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            backgroundColor: '#fff',
            borderTop: '1px solid #d1d9e0',
            '& .MuiTablePagination-toolbar': {
              minHeight: 56,
              px: 2,
            },
            '& .MuiTablePagination-spacer': {
              flex: '1 1 auto',
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: 13,
              color: '#475569',
            },
            '& .MuiTablePagination-select': {
              fontSize: 13,
            },
          }}
        />
      </Paper>

      <TaskDetails
        open={Boolean(detailTask)}
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onEdit={(t) => { setDetailTask(null); onEdit?.(t); }}
        onCancelTask={(t) => { setDetailTask(null); setCancelTaskDialog(t); }}
        onMarkComplete={handleMarkComplete}
        onCheckIn={(t) => { setDetailTask(null); setCheckInTaskDialog(t); }}
        onRecordMeeting={(t) => { setDetailTask(null); handleRecordMeeting(t); }}
      />

      <TaskCheckInDialog
        open={Boolean(checkInTaskDialog)}
        task={checkInTaskDialog}
        onClose={() => setCheckInTaskDialog(null)}
        onSuccess={handleCheckInSuccess}
        loading={actionLoading}
      />

      <TaskCompleteDialog
        open={Boolean(completeTaskDialog)}
        task={completeTaskDialog}
        onClose={() => setCompleteTaskDialog(null)}
        onConfirm={handleCompleteTask}
      />

      <TaskCancelDialog
        open={Boolean(cancelTaskDialog)}
        task={cancelTaskDialog}
        onClose={() => setCancelTaskDialog(null)}
        onConfirm={handleCancelTaskConfirm}
      />
    </>
  );
}
