// src/features/tasks/components/TaskDetails.jsx
import React from 'react';
import {
  Box, Typography, Stack, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import EditOutlinedIcon       from '@mui/icons-material/EditOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
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
import BlockIcon              from '@mui/icons-material/Block';
import { format }             from 'date-fns';
import TextInputField         from '@/components/shared/TextInputField';
import TextAreaInputField     from '@/components/shared/TextAreaInputField';

// ─── SHARED CONFIG ─────────────────────────────────────────────────────────────
export const TYPE_CONFIG = {
  call:             { label: 'Call',             icon: <PhoneIcon sx={{ fontSize: 11 }} />,             color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
  physical_meeting: { label: 'Physical Meeting', icon: <PeopleAltOutlinedIcon sx={{ fontSize: 11 }} />, color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  virtual_meeting:  { label: 'Virtual Meeting',  icon: <VideocamOutlinedIcon sx={{ fontSize: 11 }} />,  color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff' },
  follow_up:        { label: 'Follow Up',        icon: <ReplayIcon sx={{ fontSize: 11 }} />,            color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
};

export const STATUS_CONFIG = {
  overdue:   { label: 'Overdue',   color: '#b45309', bg: '#fef3c7', border: '#fcd34d', icon: <AccessTimeIcon sx={{ fontSize: 11 }} /> },
  pending:   { label: 'Pending',   color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', icon: <AccessTimeIcon sx={{ fontSize: 11 }} /> },
  completed: { label: 'Completed', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', icon: <TaskAltIcon    sx={{ fontSize: 11 }} /> },
  cancelled: { label: 'Cancelled', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', icon: <BlockIcon      sx={{ fontSize: 11 }} /> },
};

// ─── SHARED CHIPS ─────────────────────────────────────────────────────────────
export function TypeChip({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.follow_up;
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      px: '9px', py: '3px', borderRadius: '6px',
      border: `0.5px solid ${cfg.border}`, bgcolor: cfg.bg, color: cfg.color,
      fontSize: 11.5, fontWeight: 500, whiteSpace: 'nowrap', lineHeight: 1.7,
    }}>
      {cfg.icon}{cfg.label}
    </Box>
  );
}

export function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      px: '9px', py: '3px', borderRadius: '6px',
      border: `0.5px solid ${cfg.border}`, bgcolor: cfg.bg, color: cfg.color,
      fontSize: 11.5, fontWeight: 500, whiteSpace: 'nowrap', lineHeight: 1.7,
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
        fontSize={10.5} fontWeight={500} color="text.disabled"
        textTransform="uppercase" letterSpacing="0.5px" mb={0.625}
      >
        {label}
      </Typography>
      <Stack direction="row" alignItems="center" gap={0.625}>
        {icon && React.cloneElement(icon, { sx: { fontSize: 13, color: 'text.secondary' } })}
        <Typography fontSize={13} color="text.primary" fontWeight={400}>
          {value || '—'}
        </Typography>
      </Stack>
    </Box>
  );
}

// ─── FLOATING LABEL READ-ONLY LOCATION ────────────────────────────────────────
// Mimics MUI outlined TextField with a shrunk floating label, but displays
// a read-only address with a pin icon. No form interaction.
function LocationDisplayField({ address }) {
  return (
    <Box sx={{ position: 'relative' }}>
      {/* Floating label — always shrunk since there's always a value */}
      <Typography
        component="label"
        sx={{
          position: 'absolute',
          top: '-9px',
          left: '10px',
          px: '4px',
          fontSize: '0.609375rem', // 0.8125rem * 0.75 — matches MuiInputLabel-shrink scale
          fontWeight: 400,
          color: 'text.secondary',
          bgcolor: 'background.paper',
          lineHeight: 1,
          zIndex: 1,
          pointerEvents: 'none',
          letterSpacing: '0.01em',
        }}
      >
        Meeting location
      </Typography>

      {/* Field body */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 1.125,
        border: '1px solid #e3eaf2',
        borderRadius: '8px',
        bgcolor: 'background.paper',
        minHeight: 45,
      }}>
        {address ? (
          <>
            <PinDropIcon sx={{ fontSize: 15, color: 'primary.main', flexShrink: 0 }} />
            <Typography fontSize={13} color="text.primary" lineHeight={1.5}>
              {address}
            </Typography>
          </>
        ) : (
          <Typography fontSize={13} color="text.disabled" fontStyle="italic">
            No location set
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ─── TASK DETAILS ─────────────────────────────────────────────────────────────
export default function TaskDetails({
  open, task, onClose, onEdit, onCancelTask, onMarkComplete, onCheckIn,
}) {
  if (!task) return null;

  const tc = TYPE_CONFIG[task.taskType] || TYPE_CONFIG.follow_up;
  const isPhysical  = task.taskType === 'physical_meeting';
  const isCompleted = task.status === 'completed';
  const isCancelled = task.status === 'cancelled';

  const headerIconProps = { sx: { fontSize: 17, color: tc.color } };
  const headerIcon = task.taskType === 'call'
    ? <PhoneIcon {...headerIconProps} />
    : task.taskType === 'physical_meeting'
      ? <PinDropIcon {...headerIconProps} />
      : task.taskType === 'virtual_meeting'
        ? <VideocamOutlinedIcon {...headerIconProps} />
        : <AssignmentOutlinedIcon {...headerIconProps} />;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          border: '0.5px solid',
          borderColor: 'divider',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        },
      }}
    >
      {/* ── HEADER ── */}
      <DialogTitle sx={{ pb: 1.75, pt: 2, px: 2.5, borderBottom: '0.5px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1.5}>
          <Stack direction="row" alignItems="center" gap={1.375}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
              bgcolor: tc.bg, border: `0.5px solid ${tc.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {headerIcon}
            </Box>
            <Box>
              <Typography fontWeight={500} fontSize={15} color="text.primary" lineHeight={1.3}>
                {task.title}
              </Typography>
              {task.client && (
                <Stack direction="row" alignItems="center" gap={0.5} mt={0.5}>
                  <PersonOutlineIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                  <Typography fontSize={12} color="text.secondary">{task.client}</Typography>
                </Stack>
              )}
            </Box>
          </Stack>

          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              mt: '-2px',
              borderRadius: '8px',
              border: '0.5px solid',
              borderColor: 'divider',
              width: 28,
              height: 28,
              color: 'text.secondary',
            }}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* ── BODY ── */}
      <DialogContent sx={{ pt: 2.5, pb: 2, px: 2.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.25 }}>

          {/* Row 1: Association + Task type */}
          <LabelText
            label="Association"
            value={task.assocType === 'lead' ? 'Lead-based' : 'Client-based'}
            icon={task.assocType === 'lead' ? <AssignmentOutlinedIcon /> : <BusinessOutlinedIcon />}
          />
          <Box>
            <Typography fontSize={10.5} fontWeight={500} color="text.disabled"
              textTransform="uppercase" letterSpacing="0.5px" mb={0.75}>
              Task type
            </Typography>
            <TypeChip type={task.taskType} />
          </Box>

          {/* Row 2: Lead + Client */}
          <LabelText label="Lead"   value={task.lead}   icon={<AssignmentOutlinedIcon />} />
          <LabelText label="Client" value={task.client} icon={<BusinessOutlinedIcon />} />

          {/* Row 3: Scheduled + Status */}
          <Box>
            <Typography fontSize={10.5} fontWeight={500} color="text.disabled"
              textTransform="uppercase" letterSpacing="0.5px" mb={0.75}>
              Scheduled
            </Typography>
            {task.scheduledAt ? (
              <>
                <Typography fontSize={13} color="text.primary" fontWeight={500} lineHeight={1.4}>
                  {format(task.scheduledAt, 'd MMM, yyyy')}
                </Typography>
                <Typography fontSize={12} color="text.secondary" mt="2px">
                  {format(task.scheduledAt, 'h:mm a')}
                </Typography>
              </>
            ) : (
              <Typography fontSize={13} color="text.disabled">—</Typography>
            )}
          </Box>
          <Box>
            <Typography fontSize={10.5} fontWeight={500} color="text.disabled"
              textTransform="uppercase" letterSpacing="0.5px" mb={0.75}>
              Status
            </Typography>
            <StatusChip status={task.status} />
          </Box>

          {/* Row 4: Title — full width, floating label via TextInputField */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextInputField
              label="Title"
              value={task.title}
              disabled
              InputProps={{ readOnly: true }}
            />
          </Box>

          {/* Row 5: Details — full width, floating label via TextAreaInputField */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextAreaInputField
              label="Details"
              value={task.details}
              rows={3}
              disabled
              InputProps={{ readOnly: true }}
            />
          </Box>

          {/* Row 6: Location — floating label display, physical meetings only */}
          {isPhysical && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <LocationDisplayField address={task.location?.address} />
            </Box>
          )}

          {/* Cancellation reason */}
          {isCancelled && task.cancellationReason && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextAreaInputField
                label="Cancellation reason"
                value={task.cancellationReason}
                rows={2}
                disabled
                InputProps={{ readOnly: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fef2f2',
                    '& fieldset': { borderColor: '#fecaca' },
                    '&:hover fieldset': { borderColor: '#fecaca' },
                  },
                  '& .MuiInputBase-input': { color: '#7f1d1d' },
                  '& .MuiInputLabel-root': { color: '#b91c1c' },
                  '& .MuiInputLabel-shrink': { color: '#b91c1c' },
                }}
              />
            </Box>
          )}

          {/* Completion message */}
          {isCompleted && task.completionMessage && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextAreaInputField
                label="Completion message"
                value={task.completionMessage}
                rows={2}
                disabled
                InputProps={{ readOnly: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f0fdf4',
                    '& fieldset': { borderColor: '#bbf7d0' },
                    '&:hover fieldset': { borderColor: '#bbf7d0' },
                  },
                  '& .MuiInputBase-input': { color: '#166534' },
                  '& .MuiInputLabel-root': { color: '#15803d' },
                  '& .MuiInputLabel-shrink': { color: '#15803d' },
                }}
              />
            </Box>
          )}

        </Box>
      </DialogContent>

      {/* ── FOOTER ACTIONS ── */}
      <DialogActions sx={{
        px: 2.5, py: 1.625,
        borderTop: '0.5px solid', borderColor: 'divider',
        gap: 0.75,
      }}>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<EditOutlinedIcon sx={{ fontSize: '13px !important' }} />}
          onClick={() => onEdit?.(task)}
          sx={{
            borderRadius: '8px', mr: 'auto',
            fontSize: 12.5, fontWeight: 400,
            borderColor: 'divider', color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' },
          }}
        >
          Edit
        </Button>

        {!isCompleted && !isCancelled && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<BlockIcon sx={{ fontSize: '13px !important' }} />}
            onClick={() => onCancelTask?.(task)}
            sx={{
              borderRadius: '8px',
              fontSize: 12.5, fontWeight: 400,
              borderColor: '#fecaca', color: '#b91c1c', bgcolor: '#fef2f2',
              '&:hover': { bgcolor: '#fee2e2', borderColor: '#fca5a5' },
            }}
          >
            Cancel
          </Button>
        )}

        {isPhysical && task.location && !isCompleted && !isCancelled && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<GpsFixedIcon sx={{ fontSize: '13px !important' }} />}
            onClick={() => { onClose(); onCheckIn?.(task); }}
            sx={{
              borderRadius: '8px',
              fontSize: 12.5, fontWeight: 400,
              borderColor: '#bfdbfe', color: '#2563eb', bgcolor: '#eff6ff',
              '&:hover': { bgcolor: '#dbeafe', borderColor: '#93c5fd' },
            }}
          >
            Check In
          </Button>
        )}

        {!isCompleted && !isCancelled && (
          <Button
            variant="contained"
            size="small"
            startIcon={<CheckCircleOutlineIcon sx={{ fontSize: '13px !important' }} />}
            onClick={() => onMarkComplete?.(task)}
            disableElevation
            sx={{
              borderRadius: '8px',
              fontSize: 12.5, fontWeight: 500,
              bgcolor: '#16a34a',
              '&:hover': { bgcolor: '#15803d' },
            }}
          >
            Complete
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}