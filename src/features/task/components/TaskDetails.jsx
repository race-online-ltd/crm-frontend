// src/features/tasks/components/TaskDetails.jsx
import React from 'react';
import {
  Box, Typography, Stack, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
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
import PersonOutlineIcon      from '@mui/icons-material/PersonOutline';
import BusinessOutlinedIcon   from '@mui/icons-material/BusinessOutlined';
import CloseIcon              from '@mui/icons-material/Close';
import { format }             from 'date-fns';

// ─── SHARED CONFIG ────────────────────────────────────────────────────────────
// Exported so TasksTable (and any other consumer) can import from one place
// instead of duplicating the same objects.
export const TYPE_CONFIG = {
  call:             { label: 'Call',             icon: <PhoneIcon sx={{ fontSize: 11 }} />,             color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
  physical_meeting: { label: 'Physical Meeting', icon: <PeopleAltOutlinedIcon sx={{ fontSize: 11 }} />, color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  virtual_meeting:  { label: 'Virtual Meeting',  icon: <VideocamOutlinedIcon sx={{ fontSize: 11 }} />,  color: '#6d28d9', bg: '#faf5ff', border: '#e9d5ff' },
  follow_up:        { label: 'Follow Up',        icon: <ReplayIcon sx={{ fontSize: 11 }} />,            color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
};

export const STATUS_CONFIG = {
  overdue:   { label: 'Overdue',   color: '#b45309', bg: '#fef3c7', border: '#fcd34d', icon: <AccessTimeIcon sx={{ fontSize: 11 }} /> },
  pending:   { label: 'Pending',   color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', icon: <AccessTimeIcon sx={{ fontSize: 11 }} /> },
  completed: { label: 'Completed', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', icon: <TaskAltIcon    sx={{ fontSize: 11 }} /> },
};

// ─── SHARED CHIPS ─────────────────────────────────────────────────────────────
// Exported so TasksTable rows can reuse them without re-defining.
export function TypeChip({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.follow_up;
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      px: '7px', py: '2px', borderRadius: '5px',
      border: `1px solid ${cfg.border}`, bgcolor: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', lineHeight: 1.7,
    }}>
      {cfg.icon}{cfg.label}
    </Box>
  );
}

export function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      px: '7px', py: '2px', borderRadius: '5px',
      border: `1px solid ${cfg.border}`, bgcolor: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', lineHeight: 1.7,
    }}>
      {cfg.icon}{cfg.label}
    </Box>
  );
}

// ─── FIELD LABEL + VALUE ──────────────────────────────────────────────────────
function LabelText({ label, value, icon }) {
  return (
    <Box>
      <Typography
        fontSize={11} fontWeight={600} color="text.disabled"
        textTransform="uppercase" letterSpacing="0.4px" mb={0.5}
      >
        {label}
      </Typography>
      <Stack direction="row" alignItems="center" gap={0.5}>
        {icon && React.cloneElement(icon, { sx: { fontSize: 14, color: 'text.secondary' } })}
        <Typography fontSize={13} color="text.primary" fontWeight={400}>
          {value || '—'}
        </Typography>
      </Stack>
    </Box>
  );
}

// ─── TASK DETAILS ─────────────────────────────────────────────────────────────
/**
 * TaskDetails
 *
 * A standalone modal component that displays all task fields in read-only mode,
 * mirroring the TaskForm field structure. Opens as a Dialog when `open` is true.
 *
 * Props:
 *   open           {boolean}  — controls dialog visibility
 *   task           {object}   — task to display (see shape below)
 *   onClose        {Function} — called when the modal is dismissed
 *   onEdit         {Function} — (task) => void, called when Edit is clicked
 *   onDelete       {Function} — (task) => void, called when Delete is clicked
 *   onMarkComplete {Function} — (taskId) => void, called when Mark Complete is clicked
 *   onCheckIn      {Function} — (task) => void, called when Check In is clicked
 *
 * Task shape:
 * {
 *   id:          string
 *   title:       string
 *   details:     string
 *   taskType:    'call' | 'physical_meeting' | 'virtual_meeting' | 'follow_up'
 *   status:      'pending' | 'overdue' | 'completed'
 *   lead:        string | null   — lead name; null if assocType is 'client'
 *   client:      string          — always present; resolved from lead by backend if lead-based
 *   assocType:   'lead' | 'client'
 *   scheduledAt: Date | null
 *   location:    { address: string, latitude: number, longitude: number } | null
 * }
 */
export default function TaskDetails({ open, task, onClose, onEdit, onDelete, onMarkComplete, onCheckIn }) {
  if (!task) return null;

  const tc = TYPE_CONFIG[task.taskType] || TYPE_CONFIG.follow_up;
  const isPhysical  = task.taskType === 'physical_meeting';
  const isCompleted = task.status === 'completed';

  // Icon rendered larger for the modal header
  const HeaderIcon = () => {
    const iconProps = { sx: { fontSize: 18, color: tc.color } };
    if (task.taskType === 'call')             return <PhoneIcon              {...iconProps} />;
    if (task.taskType === 'physical_meeting') return <PinDropIcon            {...iconProps} />;
    if (task.taskType === 'virtual_meeting')  return <VideocamOutlinedIcon   {...iconProps} />;
    return <AssignmentOutlinedIcon {...iconProps} />;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* ── HEADER ── */}
      <DialogTitle sx={{ pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1.5}>
          <Stack direction="row" alignItems="center" gap={1.25}>
            {/* Task type icon badge */}
            <Box sx={{
              width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
              bgcolor: tc.bg, border: `1px solid ${tc.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HeaderIcon />
            </Box>

            {/* Title + client */}
            <Box>
              <Typography fontWeight={700} fontSize={15} color="text.primary" lineHeight={1.3}>
                {task.title}
              </Typography>
              {task.client && (
                <Stack direction="row" alignItems="center" gap={0.5} mt={0.375}>
                  <PersonOutlineIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                  <Typography fontSize={12} color="text.secondary">{task.client}</Typography>
                </Stack>
              )}
            </Box>
          </Stack>

          <IconButton size="small" onClick={onClose} sx={{ mt: '-2px' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* ── BODY ── */}
      <DialogContent sx={{ pt: 2.5, pb: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>

          {/* Row 1: Association + Task type */}
          <LabelText
            label="Association"
            value={task.assocType === 'lead' ? 'Lead-based' : 'Client-based'}
            icon={task.assocType === 'lead' ? <AssignmentOutlinedIcon /> : <BusinessOutlinedIcon />}
          />
          <Box>
            <Typography
              fontSize={11} fontWeight={600} color="text.disabled"
              textTransform="uppercase" letterSpacing="0.4px" mb={0.75}
            >
              Task type
            </Typography>
            <TypeChip type={task.taskType} />
          </Box>

          {/* Row 2: Lead + Client */}
          <LabelText label="Lead"   value={task.lead}   icon={<AssignmentOutlinedIcon />} />
          <LabelText label="Client" value={task.client} icon={<BusinessOutlinedIcon />} />

          {/* Row 3: Scheduled + Status */}
          <Box>
            <Typography
              fontSize={11} fontWeight={600} color="text.disabled"
              textTransform="uppercase" letterSpacing="0.4px" mb={0.75}
            >
              Scheduled
            </Typography>
            {task.scheduledAt ? (
              <Box>
                <Typography fontSize={13} color="text.primary" fontWeight={500} lineHeight={1.4}>
                  {format(task.scheduledAt, 'd MMM, yyyy')}
                </Typography>
                <Typography fontSize={12} color="text.secondary" mt="2px">
                  {format(task.scheduledAt, 'h:mm a')}
                </Typography>
              </Box>
            ) : (
              <Typography fontSize={13} color="text.disabled">—</Typography>
            )}
          </Box>
          <Box>
            <Typography
              fontSize={11} fontWeight={600} color="text.disabled"
              textTransform="uppercase" letterSpacing="0.4px" mb={0.75}
            >
              Status
            </Typography>
            <StatusChip status={task.status} />
          </Box>

          {/* Row 4: Title — full width */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Typography
              fontSize={11} fontWeight={600} color="text.disabled"
              textTransform="uppercase" letterSpacing="0.4px" mb={0.75}
            >
              Title
            </Typography>
            <Box sx={{
              px: 1.5, py: 1,
              bgcolor: 'action.hover',
              borderRadius: 1.5,
              border: '1px solid', borderColor: 'divider',
            }}>
              <Typography fontSize={13} color="text.primary">{task.title}</Typography>
            </Box>
          </Box>

          {/* Row 5: Details — full width */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Typography
              fontSize={11} fontWeight={600} color="text.disabled"
              textTransform="uppercase" letterSpacing="0.4px" mb={0.75}
            >
              Details
            </Typography>
            <Box sx={{
              px: 1.5, py: 1.25,
              bgcolor: 'action.hover',
              borderRadius: 1.5,
              border: '1px solid', borderColor: 'divider',
              minHeight: 72,
            }}>
              <Typography fontSize={13} color="text.primary" lineHeight={1.7}>
                {task.details}
              </Typography>
            </Box>
          </Box>

          {/* Row 6: Location — only for physical meetings */}
          {isPhysical && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography
                fontSize={11} fontWeight={600} color="text.disabled"
                textTransform="uppercase" letterSpacing="0.4px" mb={0.75}
              >
                Meeting location
              </Typography>
              {task.location?.address ? (
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  px: 1.5, py: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1.5,
                  border: '1px solid', borderColor: 'divider',
                }}>
                  <PinDropIcon fontSize="small" color="primary" sx={{ flexShrink: 0 }} />
                  <Typography fontSize={13} color="text.secondary">
                    {task.location.address}
                  </Typography>
                </Box>
              ) : (
                <Typography fontSize={13} color="text.disabled" fontStyle="italic">
                  No location set
                </Typography>
              )}
            </Box>
          )}

        </Box>
      </DialogContent>

      {/* ── FOOTER ACTIONS ── */}
      <DialogActions sx={{ px: 2.5, py: 1.75, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}>

        {/* Delete — always shown, pushed to the left */}
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<DeleteOutlineIcon />}
          onClick={() => onDelete?.(task)}
          sx={{ borderRadius: 2, mr: 'auto' }}
        >
          Delete
        </Button>

        {/* Edit — always shown */}
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<EditOutlinedIcon />}
          onClick={() => onEdit?.(task)}
          sx={{ borderRadius: 2 }}
        >
          Edit
        </Button>

        {/* Check In — physical_meeting + has location + not completed */}
        {isPhysical && task.location && !isCompleted && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<GpsFixedIcon />}
            onClick={() => { onClose(); onCheckIn?.(task); }}
            sx={{
              borderRadius: 2,
              borderColor: '#bfdbfe', color: '#2563eb', bgcolor: '#eff6ff',
              '&:hover': { bgcolor: '#dbeafe', borderColor: '#93c5fd' },
            }}
          >
            Check In
          </Button>
        )}

        {/* Mark Complete — hidden once already completed */}
        {!isCompleted && (
          <Button
            variant="contained"
            size="small"
            startIcon={<CheckCircleOutlineIcon />}
            onClick={() => { onMarkComplete?.(task.id); onClose(); }}
            sx={{ borderRadius: 2 }}
          >
            Mark Complete
          </Button>
        )}

      </DialogActions>
    </Dialog>
  );
}