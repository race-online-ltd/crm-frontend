// src/features/tasks/pages/TaskCreation.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, Breadcrumbs, Link, Divider,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon    from '@mui/icons-material/ArrowBack';
import EventNoteIcon    from '@mui/icons-material/EventNote';
import EditNoteIcon     from '@mui/icons-material/EditNote';
import TaskForm         from '../components/TaskForm';

/**
 * Props:
 *  - initialValues: null → create mode | task object → edit mode
 *  - onCancel()
 *  - onSubmit(payload)
 */
export default function TaskCreation({ initialValues = null, onCancel, onSubmit }) {
  const navigate = useNavigate();
  const isEdit = Boolean(initialValues);
  const associationMode = initialValues?.assocType === 'client' ? 'client' : 'lead';
  const associationOption = isEdit
    ? {
        id: associationMode === 'lead'
          ? (initialValues.leadId || initialValues.lead || '')
          : (initialValues.clientId || initialValues.client || ''),
        label: associationMode === 'lead'
          ? (initialValues.lead || initialValues.leadName || '')
          : (initialValues.client || initialValues.clientName || ''),
      }
    : null;

  // Map a task record back to formik shape
  const formikInitial = initialValues
    ? {
        assignToUserId: initialValues.assignedToUserId || initialValues.assignedToKamId || '',
        lead:        initialValues.leadId    || initialValues.lead || '',
        client:      initialValues.clientId  || initialValues.client || '',
        taskType:    initialValues.taskType  || '',
        title:       initialValues.title     || '',
        details:     initialValues.details   || '',
        scheduledAt: initialValues.scheduledAt ? new Date(initialValues.scheduledAt) : null,
        location:    initialValues.location  || null,
        attachment:  Array.isArray(initialValues.attachment) ? initialValues.attachment : [],
        reminderEnabled: Boolean(initialValues.reminder?.enabled ?? initialValues.reminderEnabled),
        reminderOffsetMinutes: String(
          initialValues.reminder?.offsetMinutes
          ?? initialValues.reminderOffsetMinutes
          ?? '30'
        ),
        reminderChannels: Array.isArray(initialValues.reminder?.channels)
          ? initialValues.reminder.channels
          : (Array.isArray(initialValues.reminderChannels) ? initialValues.reminderChannels : ['google_calendar', 'sms']),
      }
    : undefined; // TaskForm will use its own INITIAL_VALUES

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 1.5, sm: 2 } }}>

      {/* ── Header ── */}
      <Box mb={2}>
        {/* <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 14, color: '#94a3b8' }} />}
          sx={{ mb: 1.5 }}
        >
          <Link
            underline="hover"
            onClick={onCancel}
            sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, cursor: 'pointer' }}
          >
            Tasks
          </Link>
          <Typography sx={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 600 }}>
            {isEdit ? 'Edit Task' : 'New Task'}
          </Typography>
        </Breadcrumbs> */}

        <Stack direction="row" alignItems="center" spacing={2}>          {/* Back Button */}
          <Box
            onClick={() => navigate(-1)}
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
              flexShrink: 0,
              '&:hover': {
                bgcolor: '#f1f5f9',
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </Box>

          {/* Icon */}          <Box sx={{
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
