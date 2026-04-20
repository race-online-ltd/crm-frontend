import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

export function LeadStatsSkeleton() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            flex: 1,
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            p: 2,
            bgcolor: '#fff',
          }}
        >
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="text" width="60%" height={34} />
          <Skeleton variant="rounded" width="100%" height={72} sx={{ mt: 1 }} />
        </Box>
      ))}
    </Stack>
  );
}

export function LeadPipelineSkeleton() {
  return (
    <Box sx={{ mt: 3, borderRadius: '16px', border: '1px solid #e9eef4', bgcolor: '#fff', p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Skeleton variant="text" width={180} height={30} />
        <Stack direction="row" spacing={1.25}>
          <Skeleton variant="rounded" width={110} height={36} />
          <Skeleton variant="rounded" width={88} height={36} />
          <Skeleton variant="rounded" width={88} height={36} />
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 1 }}>
        {Array.from({ length: 6 }).map((_, stageIndex) => (
          <Box
            key={stageIndex}
            sx={{
              minWidth: 220,
              flex: '1 1 0',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              bgcolor: '#f8fafc',
              p: 1.5,
            }}
          >
            <Skeleton variant="rounded" width="100%" height={48} />
            <Stack spacing={1} sx={{ mt: 1.5 }}>
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <Skeleton key={cardIndex} variant="rounded" width="100%" height={78} />
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export function LeadCalendarSkeleton() {
  return (
    <Box sx={{ mt: 3, borderRadius: '16px', border: '1px solid #e9eef4', bgcolor: '#fff', p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Box>
          <Skeleton variant="text" width={160} height={28} />
          <Skeleton variant="text" width={120} height={22} />
        </Box>
        <Stack direction="row" spacing={1.25}>
          <Skeleton variant="rounded" width={104} height={36} />
          <Skeleton variant="rounded" width={104} height={36} />
        </Stack>
      </Stack>

      <Box
        sx={{
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          p: 2,
          bgcolor: '#f8fafc',
        }}
      >
        <Skeleton variant="rounded" width="100%" height={56} />
        <Skeleton variant="rounded" width="100%" height={420} sx={{ mt: 2 }} />
      </Box>
    </Box>
  );
}
