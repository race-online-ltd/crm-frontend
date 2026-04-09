import React from 'react';
import { Button, Chip, Stack, Typography } from '@mui/material';

function StatusTabButton({ label, badge, badgeColor, badgeBg, active = false, onClick }) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      sx={{
        flex: 1,
        minWidth: 0,
        width: { xs: '100%', sm: 'auto' },
        textTransform: 'none',
        borderRadius: '10px',
        px: { xs: 1.5, sm: 1.75 },
        py: { xs: 1.15, sm: 1 },
        minHeight: { xs: 44, sm: 38 },
        borderColor: active ? badgeColor : '#dbe4ef',
        bgcolor: active ? badgeColor : '#fff',
        color: active ? '#fff' : badgeColor,
        boxShadow: active ? '0 8px 18px rgba(0,0,0,0.08)' : 'none',
        position: 'relative',
        '&:hover': {
          bgcolor: active ? badgeColor : '#edf2f7',
          borderColor: badgeColor,
          boxShadow: active ? '0 8px 18px rgba(0,0,0,0.08)' : 'none',
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="center"
        sx={{ width: '100%' }}
      >
        <Typography fontWeight={700} fontSize={13}>
          {label}
        </Typography>
        <Chip
          label={badge}
          size="small"
          sx={{
            height: 20,
            minWidth: 22,
            fontSize: 11,
            fontWeight: 800,
            color: active ? '#fff' : badgeColor,
            bgcolor: active ? 'rgba(255,255,255,0.18)' : badgeBg,
            border: 'none',
            display: { xs: 'none', sm: 'inline-flex' },
          }}
        />
      </Stack>
      <Chip
        label={badge}
        size="small"
        sx={{
          position: 'absolute',
          top: { xs: 6, sm: 'auto' },
          right: { xs: 8, sm: 'auto' },
          height: 20,
          minWidth: 22,
          fontSize: 11,
          fontWeight: 800,
          color: active ? '#fff' : badgeColor,
          bgcolor: active ? 'rgba(255,255,255,0.18)' : badgeBg,
          border: 'none',
          display: { xs: 'inline-flex', sm: 'none' },
        }}
      />
    </Button>
  );
}

export default function ApprovalStatusTabs({ tabs = [], value, onChange }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      sx={{
        mb: 2.5,
        p: 0.5,
        bgcolor: '#f8fafc',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        '& > *': {
          width: { xs: '100%', sm: 'auto' },
        },
      }}
    >
      {tabs.map((tab) => (
        <StatusTabButton
          key={tab.key}
          label={tab.label}
          badge={tab.badge}
          badgeColor={tab.color}
          badgeBg={tab.bg}
          active={value === tab.key}
          onClick={() => onChange?.(tab.key)}
        />
      ))}
    </Stack>
  );
}
