import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';

function DetailLine({ label, value }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      spacing={0.5}
      sx={{ py: 1.25 }}
    >
      <Typography variant="body2" color="#64748b">
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={700}
        color="#0f172a"
        sx={{ textAlign: { xs: 'left', sm: 'right' } }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export default function LeadDetailsTab({
  lead,
  detailItems,
  statusColors,
  sourceColors,
}) {
  return (
    <Box>
      <Stack spacing={1.5}>
        <Stack spacing={0} sx={{ px: 0.5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            sx={{
              mb: 1,
              pb: 1.5,
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0f172a">
                {lead?.name || 'Lead details'}
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ mt: 0.25 }}>
                {lead?.client || lead?.subtitle || 'Selected lead profile'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={lead?.status || 'No status'}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: (statusColors[lead?.status] || {}).bg || '#f1f5f9',
                  color: (statusColors[lead?.status] || {}).color || '#64748b',
                }}
              />
              <Chip
                label={lead?.source || 'No source'}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: (sourceColors[lead?.source] || {}).bg || '#f1f5f9',
                  color: (sourceColors[lead?.source] || {}).color || '#64748b',
                }}
              />
            </Stack>
          </Stack>

          {detailItems.map((item, index) => (
            <Box
              key={item.label}
              sx={{
                borderTop: index === 0 ? 'none' : '1px solid #eef2f7',
              }}
            >
              <DetailLine label={item.label} value={item.value} />
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
