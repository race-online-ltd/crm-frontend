// src/components/shared/StatCard.jsx
import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

export default function StatCard({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  value,
  amount,
  footerLabel,
  footerCount,
  footerAmount,
}) {
  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        height: '100%',
      }}
    >
      {/* Top row: icon + title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            bgcolor: iconBg,
            color: iconColor,
            borderRadius: '8px',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            '& svg': { fontSize: 18 },
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography
            variant="caption"
            fontWeight={600}
            color="#64748b"
            sx={{ letterSpacing: 0.5, lineHeight: 1.2 }}
          >
            {title}
          </Typography>
        </Box>
      </Box>

      {/* This month values - Centered */}
      <Box
        sx={{
          textAlign: 'center',
          py: 0.5,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {subtitle ? (
          <Typography variant="caption" color="#94a3b8" display="block" sx={{ mb: 0.25 }}>
            {subtitle}
          </Typography>
        ) : (
          <Box sx={{ height: '16.8px' }} />
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: 0.5,
          }}
        >
          <Typography variant="h6" fontWeight={700} color="#0f172a" lineHeight={1}>
            {value}
          </Typography>

          {/* Only show amount when it exists and is not zero */}
          {amount ? (
            <Typography variant="caption" color="#64748b" fontWeight={500}>
              ({amount})
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Divider />

      {/* Footer */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="#94a3b8" fontWeight={500}>
          {footerLabel}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" fontWeight={600} color="#475569">
            {footerCount}
          </Typography>

          {/* Only show footer amount when it exists and is not zero */}
          {footerAmount ? (
            <Typography variant="caption" fontWeight={500} color="#64748b">
              ({footerAmount})
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}