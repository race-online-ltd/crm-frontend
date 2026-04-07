// src/features/leads/components/LeadStatCards.jsx
import React from 'react';
import { Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CancelIcon from '@mui/icons-material/Cancel';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import StatCard from '../../../components/shared/StatCard';

export default function LeadStatCards({ stats }) {
  /* ── MOCK DATA — remove when wiring backend ── */
  const defaultStats = {
    totalPipeline: { value: '৳0', percentage: 0, footerLabel: 'Last month', footerValue: '৳0' },
    wonLeads:      { value: '0 (৳0)', percentage: 0, footerLabel: 'Last month', footerValue: '0 (৳0)' },
    lostLeads:     { value: '0 (৳0)', percentage: 0, footerLabel: 'Last month', footerValue: '0 (৳0)' },
    activeLeads:   { value: '2', footerLabel: 'In progress', footerValue: '2 leads' },
  };
  /* ── END MOCK DATA ── */

  const s = stats || defaultStats;

  const cards = [
    {
      icon: <TrendingUpIcon />,
      iconBg: '#eff6ff',
      iconColor: '#3b82f6',
      title: 'TOTAL PIPELINE (Current Month)',
      value: s.totalPipeline?.value,
      percentage: s.totalPipeline?.percentage,
      footerLabel: s.totalPipeline?.footerLabel,
      footerValue: s.totalPipeline?.footerValue,
    },
    {
      icon: <EmojiEventsIcon />,
      iconBg: '#f0fdf4',
      iconColor: '#22c55e',
      title: 'WON LEADS (Current Month)',
      value: s.wonLeads?.value,
      percentage: s.wonLeads?.percentage,
      footerLabel: s.wonLeads?.footerLabel,
      footerValue: s.wonLeads?.footerValue,
    },
    {
      icon: <CancelIcon />,
      iconBg: '#fef2f2',
      iconColor: '#ef4444',
      title: 'LOST LEADS (Current Month)',
      value: s.lostLeads?.value,
      percentage: s.lostLeads?.percentage,
      footerLabel: s.lostLeads?.footerLabel,
      footerValue: s.lostLeads?.footerValue,
    },
    {
      icon: <TrackChangesIcon />,
      iconBg: '#f0fdf4',
      iconColor: '#22c55e',
      title: 'ACTIVE LEADS',
      value: s.activeLeads?.value,
      footerLabel: s.activeLeads?.footerLabel,
      footerValue: s.activeLeads?.footerValue,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        },
      }}
    >
      {cards.map((card, idx) => (
        <StatCard key={idx} {...card} />
      ))}
    </Box>
  );
}
