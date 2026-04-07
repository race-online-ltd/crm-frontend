// src/features/target/pages/TargetList.jsx
import React, { useState } from 'react';
import {
  Box, Button, Typography, Stack, Paper, Chip,
  LinearProgress, Tooltip, IconButton, Avatar,
} from '@mui/material';
import AddIcon             from '@mui/icons-material/Add';
import FilterListIcon      from '@mui/icons-material/FilterList';
import MoreVertIcon        from '@mui/icons-material/MoreVert';
import TrendingUpIcon      from '@mui/icons-material/TrendingUp';
import TrendingDownIcon    from '@mui/icons-material/TrendingDown';
import EmojiEventsIcon     from '@mui/icons-material/EmojiEvents';
import { useNavigate }     from 'react-router-dom';
import KAMTargetTable      from '../components/KAMTargetTable';

// ─── Mock summary stats ───────────────────────────────────────────────────────
const SUMMARY_STATS = [
  { label: 'Total KAMs',        value: '12',    sub: 'Active this month' },
  { label: 'Avg Achievement',   value: '73%',   sub: 'This month' },
  { label: 'Top Performer',     value: 'Arif R', sub: 'Reward eligible' },
  { label: 'Targets Set',       value: '36',    sub: 'Across all KAMs' },
];

export default function TargetList() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, mx: 'auto' }}>

      {/* ── Page header ── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        mb={3}
        gap={2}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            color="#0f172a"
            sx={{ fontSize: '1.35rem', letterSpacing: '-0.3px' }}
          >
            KAM Targets
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.25}>
            Monitor monthly targets and performance for all Key Account Managers
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton
            size="small"
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              p: 0.75,
              color: '#64748b',
              '&:hover': { bgcolor: '#f8fafc' },
            }}
          >
            <FilterListIcon fontSize="small" />
          </IconButton>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/target/set')}
            sx={{
              fontWeight: 700,
              fontSize: '0.82rem',
              bgcolor: '#2563eb',
              borderRadius: '9px',
              boxShadow: 'none',
              px: 2.5,
              py: 1,
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 4px 14px rgba(37,99,235,0.25)' },
            }}
          >
            Add Target
          </Button>
        </Stack>
      </Stack>

      {/* ── Summary stat cards ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
          gap: '12px',
          mb: 3,
        }}
      >
        {SUMMARY_STATS.map((stat) => (
          <Paper
            key={stat.label}
            variant="outlined"
            sx={{
              p: '14px 16px',
              borderRadius: '12px',
              borderColor: '#e2e8f0',
              bgcolor: '#fff',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" mb={0.5}>
              {stat.label}
            </Typography>
            <Typography fontWeight={700} fontSize="1.3rem" color="#0f172a" lineHeight={1.2}>
              {stat.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" mt={0.25} display="block">
              {stat.sub}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* ── Target Table ── */}
      <KAMTargetTable />
    </Box>
  );
}