// src/features/leads/components/LeadStatCards.jsx
import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CancelIcon from '@mui/icons-material/Cancel';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import StatCard from '../../../components/shared/StatCard';

function formatMonthYear(date = new Date(), locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

function toNumber(value) {
  if (typeof value === 'number') return value;
  const normalized = String(value ?? '').replace(/[^0-9.-]/g, '').trim();
  return normalized ? Number(normalized) : 0;
}

function formatNumber(value) {
  return toNumber(value).toLocaleString('en-US');
}

function formatCurrency(value) {
  return `৳${toNumber(value).toLocaleString('en-US')}`;
}

function getPreviousMonthName(date = new Date(), locale = 'en-US') {
  const prev = new Date(date);
  prev.setMonth(prev.getMonth() - 1);
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(prev);
}

function buildLeadCards(currentMonthLabel, stats) {
  const prevMonthName = getPreviousMonthName();

  return [
    // 1. Forwarded Lead — footer: Last 24 Hours, amount only if > 0
    {
      icon:        <ForwardToInboxIcon />,
      iconBg:      '#eff6ff',
      iconColor:   '#2563eb',
      title:       'Forwarded Lead',
      subtitle:    currentMonthLabel,
      value:       formatNumber(stats.forwarded?.count),
      amount:      formatCurrency(stats.forwarded?.amount),
      footerLabel: 'Last 24 Hours',
      footerCount: formatNumber(stats.forwarded?.last24hCount ?? 0),
      footerAmount: formatCurrency(stats.forwarded?.last24hAmount),
    },
    // 2. Pending Leads (Back Office) — footer: Last 24 Hours, amount only if > 0
    {
      icon:      <PendingActionsIcon />,
      iconBg:    '#fff7ed',
      iconColor: '#f97316',
      title: (
        <>
          PENDING LEADS{' '}
          <small style={{ color: '#f97316', marginLeft: '4px', textTransform: 'none' }}>
            (Back Office)
          </small>
        </>
      ),
      subtitle:    '',
      value:       formatNumber(stats.pending?.count),
      amount:      formatCurrency(stats.pending?.amount),
      footerLabel: 'Last 24 Hours',
      footerCount: formatNumber(stats.pending?.last24hCount ?? 0),
      footerAmount: formatCurrency(stats.pending?.last24hAmount),
    },
    // 3. Total Pipeline (Active) — footer: Last 24 Hours, amount only if > 0
    {
      icon:      <AccountBalanceWalletIcon />,
      iconBg:    '#eef2ff',
      iconColor: '#4f46e5',
      title: (
        <>
          TOTAL PIPELINE{' '}
          <small style={{ color: '#4f46e5', marginLeft: '4px', textTransform: 'none' }}>
            (active)
          </small>
        </>
      ),
      subtitle:    currentMonthLabel,
      value:       formatNumber(stats.pipeline?.count),
      amount:      formatCurrency(stats.pipeline?.amount),
      footerLabel: 'Last 24 Hours',
      footerCount: formatNumber(stats.pipeline?.last24hCount ?? 0),
      footerAmount: formatCurrency(stats.pipeline?.last24hAmount),
    },
    // 4. Won Lead — footer: previous month, amount only if > 0
    {
      icon:        <EmojiEventsIcon />,
      iconBg:      '#f0fdf4',
      iconColor:   '#22c55e',
      title:       'Won Lead',
      subtitle:    currentMonthLabel,
      value:       formatNumber(stats.won?.count),
      amount:      formatCurrency(stats.won?.amount),
      footerLabel: prevMonthName,
      footerCount: formatNumber(stats.won?.lastMonthCount ?? 0),
      footerAmount: formatCurrency(stats.won?.lastMonthAmount),
    },
    // 5. Lost Lead — footer: previous month, amount only if > 0
    {
      icon:        <CancelIcon />,
      iconBg:      '#fef2f2',
      iconColor:   '#ef4444',
      title:       'Lost Lead',
      subtitle:    currentMonthLabel,
      value:       formatNumber(stats.lost?.count),
      amount:      formatCurrency(stats.lost?.amount),
      footerLabel: prevMonthName,
      footerCount: formatNumber(stats.lost?.lastMonthCount ?? 0),
      footerAmount: formatCurrency(stats.lost?.lastMonthAmount),
    },
    // 6. Cancelled Lead — footer: previous month, amount only if > 0
    {
      icon:        <DoDisturbIcon />,
      iconBg:      '#fdf4ff',
      iconColor:   '#a855f7',
      title:       'Cancelled Lead',
      subtitle:    currentMonthLabel,
      value:       formatNumber(stats.cancelled?.count),
      amount:      formatCurrency(stats.cancelled?.amount),
      footerLabel: prevMonthName,
      footerCount: formatNumber(stats.cancelled?.lastMonthCount ?? 0),
      footerAmount: formatCurrency(stats.cancelled?.lastMonthAmount),
    },
  ];
}

export default function LeadStatCards({ stats }) {
  const currentMonthLabel = useMemo(() => formatMonthYear(new Date()), []);

  const normalizedStats = useMemo(() => ({
    forwarded: { count: 0, amount: 0, lastMonthCount: 0, lastMonthAmount: 0, last24hCount: 0, last24hAmount: 0 },
    pending:   { count: 0, amount: 0, lastMonthCount: 0, lastMonthAmount: 0, last24hCount: 0, last24hAmount: 0 },
    pipeline:  { count: 0, amount: 0, lastMonthCount: 0, lastMonthAmount: 0, last24hCount: 0, last24hAmount: 0 },
    won:       { count: 0, amount: 0, lastMonthCount: 0, lastMonthAmount: 0, last24hCount: 0, last24hAmount: 0 },
    lost:      { count: 0, amount: 0, lastMonthCount: 0, lastMonthAmount: 0, last24hCount: 0, last24hAmount: 0 },
    cancelled: { count: 0, amount: 0, lastMonthCount: 0, lastMonthAmount: 0, last24hCount: 0, last24hAmount: 0 },
    ...(stats || {}),
  }), [stats]);

  const cards = useMemo(
    () => buildLeadCards(currentMonthLabel, normalizedStats),
    [currentMonthLabel, normalizedStats],
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          lg: 'repeat(6, minmax(0, 1fr))',
        },
      }}
    >
      {cards.map((card, idx) => (
        <StatCard key={idx} {...card} />
      ))}
    </Box>
  );
}
