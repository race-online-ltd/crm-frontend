// src/features/tasks/components/TaskDetails.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PinDropIcon from '@mui/icons-material/PinDrop';
import PhoneIcon from '@mui/icons-material/Phone';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import BlockIcon from '@mui/icons-material/Block';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import { format } from 'date-fns';

import AppDrawer from '../../../components/shared/AppDrawer';
import AttachmentField from '../../../components/shared/AttachmentField';
import TextAreaInputField from '@/components/shared/TextAreaInputField';
import api from '@/api/config/axiosInstance';
import { buildMultipartFormData } from '../../../utils/formData';
import { addTaskNote, fetchTask } from '../api/taskApi';
import { STATUS_CONFIG, TYPE_CONFIG } from './TaskDetails.constants.jsx';

// ─── SHARED CHIPS ─────────────────────────────────────────────────────────────
export function TypeChip({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.follow_up;
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        px: '9px',
        py: '3px',
        borderRadius: '6px',
        border: `0.5px solid ${cfg.border}`,
        bgcolor: cfg.bg,
        color: cfg.color,
        fontSize: 11.5,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        lineHeight: 1.7,
      }}
    >
      {cfg.icon}
      {cfg.label}
    </Box>
  );
}

export function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        px: '9px',
        py: '3px',
        borderRadius: '6px',
        border: `0.5px solid ${cfg.border}`,
        bgcolor: cfg.bg,
        color: cfg.color,
        fontSize: 11.5,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        lineHeight: 1.7,
      }}
    >
      {cfg.icon}
      {cfg.label}
    </Box>
  );
}

function formatDateTime(value) {
  if (!value) return '—';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return format(date, 'd MMM, yyyy h:mm a');
}

function formatDateOnly(value) {
  if (!value) return '—';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return format(date, 'd MMM, yyyy');
}

function formatTimeOnly(value) {
  if (!value) return '—';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return format(date, 'h:mm a');
}

async function fetchAttachmentBlob(file) {
  const response = await api.get(file.download_url, { responseType: 'blob' });
  return {
    blob: new Blob([response.data], {
      type: response.headers?.['content-type'] || file.mime_type || 'application/octet-stream',
    }),
    mimeType: String(response.headers?.['content-type'] || file.mime_type || '').toLowerCase(),
  };
}

function safeText(value) {
  return value || '—';
}

function getAttachmentTypeLabel(file) {
  const sourceName = String(file?.file_name || file?.name || '').trim();
  const extMatch = sourceName.match(/\.([a-z0-9]+)$/i);
  const mimeType = String(file?.mime_type || '').toLowerCase();

  if (extMatch?.[1]) {
    return extMatch[1].toUpperCase();
  }

  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('wordprocessingml')) return 'DOCX';
  if (mimeType.includes('msword')) return 'DOC';
  if (mimeType.includes('spreadsheetml')) return 'XLSX';
  if (mimeType.includes('excel')) return 'XLS';
  if (mimeType.includes('csv')) return 'CSV';
  if (mimeType.startsWith('image/')) return 'IMG';

  return 'FILE';
}

// ─── FIELD LABEL + VALUE ──────────────────────────────────────────────────────
function LabelText({ label, value, icon }) {
  return (
    <Box>
      <Typography
        fontSize={10.5}
        fontWeight={500}
        color="text.disabled"
        textTransform="uppercase"
        letterSpacing="0.5px"
        mb={0.625}
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

// ─── READ-ONLY LOCATION ──────────────────────────────────────────────────────
function LocationDisplayField({ address }) {
  return (
    <Box>
      <Typography
        fontSize={10.5}
        fontWeight={500}
        color="text.disabled"
        textTransform="uppercase"
        letterSpacing="0.5px"
        mb={0.625}
      >
        Meeting location
      </Typography>
      <Stack direction="row" alignItems="flex-start" gap={0.75}>
        <PinDropIcon sx={{ fontSize: 13, color: 'primary.main', flexShrink: 0, mt: '1px' }} />
        <Typography fontSize={13} color={address ? 'text.primary' : 'text.disabled'} lineHeight={1.45}>
          {address || 'No location set'}
        </Typography>
      </Stack>
    </Box>
  );
}

function NoteCard({ note, formatTime, onOpenAttachment, loadingAttachmentId }) {
  const attachments = Array.isArray(note.attachments) ? note.attachments : [];

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.1,
        borderRadius: '12px',
        borderColor: '#e2e8f0',
        bgcolor: '#fff',
      }}
    >
      <Stack direction="row" spacing={0.9} alignItems="flex-start">
        <Avatar sx={{ width: 28, height: 28, bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700, fontSize: 12 }}>
          {(note.author || 'U').slice(0, 1)}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <Typography variant="body2" fontWeight={600} color="#0f172a" fontSize={12.5} noWrap>
              {note.author || 'System User'}
            </Typography>
            <Typography variant="caption" color="#94a3b8" sx={{ flexShrink: 0, whiteSpace: 'nowrap', fontSize: 11 }}>
              {formatTime(note.createdAt)}
            </Typography>
          </Stack>
          <Typography variant="body2" color="#334155" sx={{ mt: 0.35, whiteSpace: 'pre-wrap', fontSize: 12.5, lineHeight: 1.45 }}>
            {note.content}
          </Typography>

          {attachments.length > 0 ? (
            <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mt: 0.75 }}>
              {attachments.map((file, index) => (
                <Chip
                  key={file.id ?? `${file.file_name || file.name}-${index}`}
                  onClick={() => onOpenAttachment?.(file)}
                  disabled={!file.download_url || loadingAttachmentId === file.id}
                  size="small"
                  icon={<AttachFileOutlinedIcon sx={{ fontSize: 11 }} />}
                  label={getAttachmentTypeLabel(file)}
                  sx={{
                    height: 24,
                    borderRadius: '999px',
                    bgcolor: '#eff6ff',
                    border: '1px solid #dbeafe',
                    color: '#1d4ed8',
                    fontWeight: 800,
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    minWidth: 0,
                    px: 0.5,
                    '& .MuiChip-icon': {
                      color: '#1d4ed8',
                      marginLeft: '5px',
                      marginRight: '-1px',
                    },
                    '& .MuiChip-label': {
                      px: 0.5,
                    },
                    '&:hover': {
                      bgcolor: '#dbeafe',
                      borderColor: '#93c5fd',
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#f1f5f9',
                      borderColor: '#e2e8f0',
                      color: '#94a3b8',
                    },
                  }}
                />
              ))}
            </Stack>
          ) : null}
        </Box>
      </Stack>
    </Paper>
  );
}

// ─── TASK DETAILS ─────────────────────────────────────────────────────────────
export default function TaskDetails({
  open,
  task,
  onClose,
  onEdit,
  onCancelTask,
  onMarkComplete,
  onCheckIn,
  onRecordMeeting,
}) {
  const [detailTask, setDetailTask] = useState(task);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [loadingAttachmentId, setLoadingAttachmentId] = useState(null);

  useEffect(() => {
    setDetailTask(task || null);
  }, [task]);

  useEffect(() => {
    if (!open || !task?.id) {
      return undefined;
    }

    let active = true;

    const loadTask = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const data = await fetchTask(task.id);

        if (active && data) {
          setDetailTask(data);
        }
      } catch (error) {
        if (active) {
          setLoadError(error?.message || 'Unable to load task details.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadTask();

    return () => {
      active = false;
    };
  }, [open, task?.id]);

  useEffect(() => {
    if (!open) {
      setIsAddingNote(false);
      setNoteText('');
      setAttachments([]);
      setSavingNote(false);
      setNoteError('');
      setLoadError('');
      setLoading(false);
    }
  }, [open]);

  const activeTask = detailTask || task;

  const taskTypeKey = activeTask?.taskType || 'follow_up';
  const tc = TYPE_CONFIG[taskTypeKey] || TYPE_CONFIG.follow_up;
  const isPhysical = taskTypeKey === 'physical_meeting';
  const isVirtual = taskTypeKey === 'virtual_meeting';
  const isMeeting = isPhysical || isVirtual;
  const isCompleted = activeTask?.status === 'completed';
  const isCancelled = activeTask?.status === 'cancelled';
  const completionMessage = activeTask?.completionMessage || activeTask?.completion_message;
  const cancellationReason = activeTask?.cancellationReason || activeTask?.cancellation_reason;
  const notes = Array.isArray(activeTask?.notes) ? activeTask.notes : [];

  const headerIconProps = { sx: { fontSize: 17, color: tc.color } };
  const headerIcon = taskTypeKey === 'call'
    ? <PhoneIcon {...headerIconProps} />
    : taskTypeKey === 'physical_meeting'
      ? <PinDropIcon {...headerIconProps} />
      : taskTypeKey === 'virtual_meeting'
        ? <VideocamOutlinedIcon {...headerIconProps} />
        : <AssignmentOutlinedIcon {...headerIconProps} />;

  const footerActions = useMemo(() => {
    if (!activeTask) return null;

    return (
      <>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<EditOutlinedIcon sx={{ fontSize: '13px !important' }} />}
          onClick={() => onEdit?.(activeTask)}
          sx={{
            borderRadius: '8px',
            mr: 'auto',
            fontSize: 12.5,
            fontWeight: 400,
            borderColor: 'divider',
            color: 'text.secondary',
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
            onClick={() => onCancelTask?.(activeTask)}
            sx={{
              borderRadius: '8px',
              fontSize: 12.5,
              fontWeight: 400,
              borderColor: '#fecaca',
              color: '#b91c1c',
              bgcolor: '#fef2f2',
              '&:hover': { bgcolor: '#fee2e2', borderColor: '#fca5a5' },
            }}
          >
            Cancel
          </Button>
        )}

        {isPhysical && activeTask.location && !activeTask.checked_in_at && !isCompleted && !isCancelled && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<GpsFixedIcon sx={{ fontSize: '13px !important' }} />}
            onClick={() => {
              onClose?.();
              onCheckIn?.(activeTask);
            }}
            sx={{
              borderRadius: '8px',
              fontSize: 12.5,
              fontWeight: 400,
              borderColor: '#bfdbfe',
              color: '#2563eb',
              bgcolor: '#eff6ff',
              '&:hover': { bgcolor: '#dbeafe', borderColor: '#93c5fd' },
            }}
          >
            Check In
          </Button>
        )}

        {isMeeting && !isCompleted && !isCancelled && (
          <Tooltip title="Open meeting recorder">
            <IconButton
              size="small"
              aria-label="Record meeting"
              onClick={() => {
                onClose?.();
                onRecordMeeting?.(activeTask);
              }}
              sx={{
                borderRadius: '8px',
                width: 32,
                height: 32,
                border: '1px solid #fbcfe8',
                borderColor: '#fbcfe8',
                color: '#be123c',
                bgcolor: '#fff1f2',
                '&:hover': { bgcolor: '#ffe4e6', borderColor: '#fda4af' },
              }}
            >
              <FiberManualRecordIcon sx={{ fontSize: 16, color: '#dc2626' }} />
            </IconButton>
          </Tooltip>
        )}

        {!isCompleted && !isCancelled && (
          <Button
            variant="contained"
            size="small"
            startIcon={<CheckCircleOutlineIcon sx={{ fontSize: '13px !important' }} />}
            onClick={() => onMarkComplete?.(activeTask)}
            disableElevation
            sx={{
              borderRadius: '8px',
              fontSize: 12.5,
              fontWeight: 500,
              bgcolor: '#16a34a',
              '&:hover': { bgcolor: '#15803d' },
            }}
          >
            Complete
          </Button>
        )}
      </>
    );
  }, [activeTask, isCancelled, isCompleted, isMeeting, isPhysical, onCancelTask, onCheckIn, onClose, onEdit, onMarkComplete, onRecordMeeting]);

  async function handleSubmitNote() {
    if (!activeTask?.id || !noteText.trim() || savingNote) return;

    try {
      setSavingNote(true);
      setNoteError('');

      const formData = buildMultipartFormData({
        content: noteText.trim(),
        attachments,
      });

      const response = await addTaskNote(activeTask.id, formData);
      if (response?.task) {
        setDetailTask(response.task);
      }

      setNoteText('');
      setAttachments([]);
      setIsAddingNote(false);
    } catch (error) {
      setNoteError(error?.message || 'Unable to add note.');
    } finally {
      setSavingNote(false);
    }
  }

  async function handleOpenAttachment(file) {
    if (!file?.download_url || loadingAttachmentId === file.id) return;

    try {
      setLoadingAttachmentId(file.id ?? null);
      const { blob, mimeType } = await fetchAttachmentBlob(file);
      const objectUrl = window.URL.createObjectURL(blob);
      const previewable = mimeType.startsWith('image/') || mimeType.includes('pdf') || mimeType.startsWith('text/');

      if (previewable) {
        window.open(objectUrl, '_blank', 'noopener,noreferrer');
      } else {
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = file.file_name || file.name || 'attachment';
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      window.setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
      }, 1000);
    } catch (error) {
      setNoteError(error?.message || 'Unable to open attachment.');
    } finally {
      setLoadingAttachmentId(null);
    }
  }

  if (!open) return null;

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title="Task Details"
      width={540}
      contentSx={{ p: 0, bgcolor: '#f8fafc' }}
      footerActions={footerActions}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.25, minHeight: '100%' }}>
        {loadError ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {loadError}
          </Alert>
        ) : null}

        {loading && !detailTask ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Loading task details...
          </Alert>
        ) : null}

        {activeTask ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.25,
                borderRadius: '18px',
                borderColor: '#dbe4ee',
                bgcolor: '#fff',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              }}
            >
              <Stack direction="row" alignItems="flex-start" gap={1.5} sx={{ mb: 2.25 }}>
                <Stack direction="row" alignItems="center" gap={1.5} minWidth={0}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      flexShrink: 0,
                      bgcolor: tc.bg,
                      border: `0.5px solid ${tc.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {headerIcon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize={16} color="#0f172a" lineHeight={1.3}>
                      {activeTask.title}
                    </Typography>
                    <Stack direction="row" alignItems="center" gap={0.75} mt={0.75} flexWrap="wrap" useFlexGap>
                      <TypeChip type={taskTypeKey} />
                      <StatusChip status={activeTask.status} />
                    </Stack>
                  </Box>
                </Stack>
              </Stack>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                <LabelText
                  label="Lead"
                  value={safeText(activeTask.lead)}
                  icon={<AssignmentOutlinedIcon />}
                />
                <LabelText
                  label="Client"
                  value={safeText(activeTask.client)}
                  icon={<BusinessOutlinedIcon />}
                />

                <Box>
                  <Typography
                    fontSize={10.5}
                    fontWeight={500}
                    color="text.disabled"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                    mb={0.625}
                  >
                    Scheduled
                  </Typography>
                  <Typography fontSize={13} color="text.primary" fontWeight={500} lineHeight={1.4}>
                    {formatDateOnly(activeTask.scheduledAt)}
                  </Typography>
                  <Typography fontSize={12} color="text.secondary" mt="2px">
                    {formatTimeOnly(activeTask.scheduledAt)}
                  </Typography>
                </Box>

                {(activeTask.assignedToUserName || activeTask.createdByUserName) && (
                  <>
                    <LabelText
                      label="Assigned to"
                      value={safeText(activeTask.assignedToUserName)}
                      icon={<PersonOutlineIcon />}
                    />
                    <LabelText
                      label="Created by"
                      value={safeText(activeTask.createdByUserName)}
                      icon={<AssignmentOutlinedIcon />}
                    />
                  </>
                )}

                {isPhysical && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <LocationDisplayField address={activeTask.location?.address} />
                  </Box>
                )}

                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextAreaInputField
                    label="Details"
                    value={activeTask.details}
                    rows={3}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </Box>

                {isCancelled && cancellationReason && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <TextAreaInputField
                      label="Cancellation reason"
                      value={cancellationReason}
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

                {isCompleted && completionMessage && (
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <TextAreaInputField
                      label="Completion message"
                      value={completionMessage}
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
            </Paper>

            <Paper
                variant="outlined"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '18px',
                  borderColor: '#dbe4ee',
                  bgcolor: '#fff',
                  minHeight: { xs: 340, sm: 400 },
                  maxHeight: { xs: 360, sm: 430 },
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} minWidth={0}>
                    <DescriptionOutlinedIcon sx={{ fontSize: 17, color: '#2563eb' }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontSize={13} fontWeight={700} color="#0f172a" lineHeight={1.2}>
                        Task Notes
                      </Typography>
                      <Typography fontSize={11.5} color="#64748b">
                        {notes.length} note{notes.length === 1 ? '' : 's'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Button
                    onClick={() => {
                      setIsAddingNote((value) => !value);
                      setNoteError('');
                    }}
                    size="small"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      backgroundColor: isAddingNote ? '#e2e8f0' : '#2563eb',
                      color: isAddingNote ? '#0f172a' : '#fff',
                      borderRadius: '10px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      '&:hover': {
                        backgroundColor: isAddingNote ? '#cbd5e1' : '#1d4ed8',
                      },
                    }}
                  >
                    {isAddingNote ? 'Close' : '+ Add Note'}
                  </Button>
                </Box>
                <Divider />

                {isAddingNote ? (
                  <Box sx={{ p: 1.25, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fbff' }}>
                    <Stack spacing={1.1}>
                      <TextField
                        multiline
                        minRows={2}
                        maxRows={5}
                        autoFocus
                        value={noteText}
                        onChange={(event) => setNoteText(event.target.value)}
                        placeholder="Add a note for follow-up, context, or next steps..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            bgcolor: '#fff',
                          },
                        }}
                      />
                      <AttachmentField
                        value={attachments}
                        onChange={setAttachments}
                        label=""
                      />
                      {noteError ? (
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                          {noteError}
                        </Alert>
                      ) : null}
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button
                          onClick={() => {
                            setIsAddingNote(false);
                            setNoteText('');
                            setAttachments([]);
                            setNoteError('');
                          }}
                          sx={{ textTransform: 'none', fontWeight: 700, color: '#64748b' }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleSubmitNote}
                          disabled={!noteText.trim() || savingNote}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: '10px',
                            boxShadow: 'none',
                          }}
                        >
                          Save Note
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                ) : null}

                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    p: 1.25,
                    bgcolor: '#f8fafc',
                    '&::-webkit-scrollbar': { width: 6 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 999 },
                  }}
                >
                  {notes.length ? (
                    <Stack spacing={1}>
                      {notes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          formatTime={formatDateTime}
                          onOpenAttachment={handleOpenAttachment}
                          loadingAttachmentId={loadingAttachmentId}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: '12px' }}>
                      No notes added yet. Use Add Note + to capture context for this task.
                    </Alert>
                  )}
                </Box>
              </Paper>
          </Box>
        ) : (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No task selected.
          </Alert>
        )}
      </Box>
    </AppDrawer>
  );
}
