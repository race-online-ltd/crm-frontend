// src/features/tasks/pages/TaskCreation.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { subMinutes } from 'date-fns';
import {
  Box, Typography, Stack, Divider,
} from '@mui/material';
import ArrowBackIcon    from '@mui/icons-material/ArrowBack';
import EventNoteIcon    from '@mui/icons-material/EventNote';
import EditNoteIcon     from '@mui/icons-material/EditNote';
import TaskForm         from '../components/TaskForm';

export default function TaskCreation({ initialValues = null, onCancel, onSubmit }) {
  const navigate = useNavigate();
  const isEdit = Boolean(initialValues);
  const associationMode = initialValues?.client_id || initialValues?.client ? 'client' : 'lead';
  const associationOption = isEdit
    ? {
        id: associationMode === 'lead'
          ? (initialValues.lead_id || initialValues.leadId || initialValues.lead || '')
          : (initialValues.client_id || initialValues.clientId || initialValues.client || ''),
        label: associationMode === 'lead'
          ? (initialValues.lead || initialValues.leadName || '')
          : (initialValues.client || initialValues.clientName || ''),
      }
    : null;

  const formikInitial = initialValues
    ? {
        assignToUserId: initialValues.assigned_to_user_id || initialValues.assignedToUserId || '',
        lead:        initialValues.lead_id    || initialValues.leadId || initialValues.lead || '',
        client:      initialValues.client_id  || initialValues.clientId || initialValues.client || '',
        taskType:    String(initialValues.task_type_id || initialValues.taskType || ''),
        title:       initialValues.title     || '',
        details:     initialValues.details   || '',
        scheduledAt: initialValues.scheduledAt
          ? new Date(initialValues.scheduledAt)
          : (initialValues.scheduled_at ? new Date(initialValues.scheduled_at) : null),
        location:    initialValues.location  || null,
        attachment:  Array.isArray(initialValues.attachment)
          ? initialValues.attachment.map((file) => ({
              name: file.file_name || file.name,
              size: file.file_size || 0,
              lastModified: file.lastModified || 0,
            }))
          : [],
        reminderEnabled: Boolean(initialValues.reminderEnabled ?? initialValues.reminder_enabled),
        reminderAt: initialValues.reminderAt
          ? new Date(initialValues.reminderAt)
          : (initialValues.reminder_at
            ? new Date(initialValues.reminder_at)
            : (initialValues.reminder_offset_minutes && (initialValues.scheduledAt || initialValues.scheduled_at)
              ? subMinutes(new Date(initialValues.scheduledAt || initialValues.scheduled_at), Number(initialValues.reminder_offset_minutes))
              : null)),
        reminderChannels: Array.isArray(initialValues.reminder?.channels)
          ? initialValues.reminder.channels
          : (Array.isArray(initialValues.reminderChannels)
            ? initialValues.reminderChannels
            : (Array.isArray(initialValues.reminder_channels)
              ? initialValues.reminder_channels
              : ['google_calendar', 'sms'])),
      }
    : undefined;

  return (
    <Box sx={{ bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 1.5, sm: 2 } }}>

      {/* ── Header ── */}
      <Box mb={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            onClick={() => navigate(-1)}
            sx={{
              width: 36, height: 36, borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#475569', flexShrink: 0,
              '&:hover': { bgcolor: '#f1f5f9' },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </Box>

          <Box sx={{
            width: 42, height: 42, borderRadius: '12px',
            bgcolor: '#eff6ff', border: '1px solid #bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {isEdit
              ? <EditNoteIcon  sx={{ fontSize: 22, color: '#2563eb' }} />
              : <EventNoteIcon sx={{ fontSize: 22, color: '#2563eb' }} />}
          </Box>

          <Box>
            <Typography variant="h5" fontWeight={700} color="#0f172a" lineHeight={1.2}>
              {isEdit ? 'Edit Task' : 'Create New Task'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.3}>
              {isEdit
                ? 'Update the details of this activity.'
                : 'Log a call, meeting, or follow-up against a lead.'}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <TaskForm
        initialValues={formikInitial}
        onCancel={onCancel}
        onSubmit={onSubmit}
        lockedAssociation={isEdit ? { mode: associationMode, option: associationOption } : null}
      />
    </Box>
  );
}
