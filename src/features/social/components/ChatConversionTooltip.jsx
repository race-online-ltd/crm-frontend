import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

function StatRow({ label, value, color }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, minWidth: 160 }}>
      <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ color, fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function ChatConversionTooltip({ contact, children }) {
  const counts = contact?.conversionCounts || {};
  const leadCount = Number(counts.lead ?? 0);
  const taskCount = Number(counts.task ?? 0);
  const ticketCount = Number(counts.ticket ?? 0);

  return (
    <Tooltip
      arrow
      placement="right-start"
      enterDelay={180}
      title={(
        <Box sx={{ p: 0.25 }}>
          <Typography variant="caption" sx={{ display: 'block', color: '#fff', fontWeight: 700, mb: 0.75 }}>
            Chat conversions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <StatRow label="Lead" value={leadCount} color="#60a5fa" />
            <StatRow label="Task" value={taskCount} color="#34d399" />
            <StatRow label="Ticket" value={ticketCount} color="#fbbf24" />
          </Box>
        </Box>
      )}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: '#0f172a',
            border: '1px solid rgba(148, 163, 184, 0.22)',
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.22)',
            px: 1.25,
            py: 1,
          },
        },
        arrow: {
          sx: { color: '#0f172a' },
        },
      }}
    >
      <Box component="span" sx={{ display: 'block', width: '100%' }}>
        {children}
      </Box>
    </Tooltip>
  );
}
