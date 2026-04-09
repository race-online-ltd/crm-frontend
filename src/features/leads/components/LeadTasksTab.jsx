import React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

export default function LeadTasksTab({
  taskHistory,
  formatDateTime,
  formatTaskType,
}) {
  return (
    <Box>
      <Stack spacing={1.5}>
        {taskHistory.length ? (
          taskHistory.map((task) => (
            <Stack key={task.id} direction="row" spacing={1.5} alignItems="flex-start">
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#eff6ff',
                  color: '#2563eb',
                }}
              >
                <AccessTimeRoundedIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Paper
                variant="outlined"
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: '14px',
                  borderColor: '#e2e8f0',
                  bgcolor: '#fff',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={0.75}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={700} color="#0f172a">
                      {task.title || 'Untitled Task'}
                    </Typography>
                    <Typography variant="caption" color="#64748b">
                      {formatTaskType(task.taskType)}
                    </Typography>
                  </Box>
                  <Chip
                    label={task.scheduledAt ? `Scheduled: ${formatDateTime(task.scheduledAt)}` : 'Schedule not set'}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: '#f8fafc',
                      color: '#475569',
                    }}
                  />
                </Stack>
                <Typography variant="body2" color="#475569" sx={{ mt: 1 }}>
                  {task.details || 'No task details provided.'}
                </Typography>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  sx={{ mt: 1.25, pt: 1.25, borderTop: '1px solid #eef2f7' }}
                >
                  <Typography variant="caption" color="#94a3b8">
                    Created: {formatDateTime(task.createdAt)}
                  </Typography>
                  <Typography variant="caption" color="#64748b" sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    {task.location?.address || 'No meeting location added'}
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          ))
        ) : (
          <Alert severity="info" sx={{ borderRadius: '12px' }}>
            No task history is available for this lead yet.
          </Alert>
        )}
      </Stack>
    </Box>
  );
}
