// src/features/leads/components/LeadStatCards.jsx
import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CancelIcon from '@mui/icons-material/Cancel';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { useUserProfile } from '../../settings/context/UserProfileContext';
import StatCard from '../../../components/shared/StatCard';

function formatMonthYear(date = new Date(), locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function toNumber(value) {
  if (typeof value === 'number') {
    return value;
  }

  const normalized = String(value ?? '')
    .replace(/[^0-9.-]/g, '')
    .trim();

  return normalized ? Number(normalized) : 0;
}

function formatNumber(value) {
  return toNumber(value).toLocaleString('en-US');
}

function formatCurrency(value) {
  return `৳${toNumber(value).toLocaleString('en-US')}`;
}

function formatCountAmount(count, amount) {
  return `${formatNumber(count)} (${formatCurrency(amount)})`;
}

function normalizeRole(role = '') {
  return String(role).trim().toLowerCase();
}

function getRoleKey(role = '') {
  const normalized = normalizeRole(role);

  if (normalized.includes('backoffice') || normalized.includes('back office')) {
    return 'backoffice';
  }

  if (normalized.includes('kam')) {
    return 'kam';
  }

  return 'helpdesk';
}

function getTitleLabel(roleKey) {
  if (roleKey === 'backoffice') {
    return 'Total Pending Lead';
  }

  if (roleKey === 'kam') {
    return 'Total Pipeline';
  }

  return 'Forwarded Lead';
}

function buildLeadCards(roleKey, currentMonthLabel, stats) {
  const showCountAndAmount = roleKey === 'kam' || roleKey === 'backoffice';

  const sharedCards = [
    {
      icon: <EmojiEventsIcon />,
      iconBg: '#f0fdf4',
      iconColor: '#22c55e',
      title: 'Won Lead',
      subtitle: currentMonthLabel,
      value: showCountAndAmount ? formatCountAmount(stats.won?.count, stats.won?.amount) : formatNumber(stats.won?.count),
      footerLabel: 'Last Month Won Lead',
      footerValue: showCountAndAmount
        ? formatCountAmount(stats.won?.footerCount ?? stats.won?.footer ?? 0, stats.won?.footerAmount ?? stats.won?.footer ?? 0)
        : (stats.won?.footer || formatCurrency(0)),
    },
    {
      icon: <CancelIcon />,
      iconBg: '#fef2f2',
      iconColor: '#ef4444',
      title: 'Lost Lead',
      subtitle: currentMonthLabel,
      value: showCountAndAmount ? formatCountAmount(stats.lost?.count, stats.lost?.amount) : formatNumber(stats.lost?.count),
      footerLabel: 'Last Month Lost Lead',
      footerValue: showCountAndAmount
        ? formatCountAmount(stats.lost?.footerCount ?? stats.lost?.footer ?? 0, stats.lost?.footerAmount ?? stats.lost?.footer ?? 0)
        : (stats.lost?.footer || formatCurrency(0)),
    },
    {
      icon: <TrackChangesIcon />,
      iconBg: '#eff6ff',
      iconColor: '#3b82f6',
      title: 'Active Leads',
      subtitle: currentMonthLabel,
      value: showCountAndAmount ? formatCountAmount(stats.active?.count, stats.active?.amount) : formatNumber(stats.active?.count),
      footerLabel: 'In Progress',
      footerValue: showCountAndAmount
        ? formatCountAmount(
            stats.active?.footerCount ?? stats.active?.footer ?? stats.active?.count ?? 0,
            stats.active?.footerAmount ?? stats.active?.footer ?? 0,
          )
        : formatNumber(stats.active?.footer || stats.active?.count || 0),
    },
  ];

  const firstCard = roleKey === 'backoffice'
    ? {
        icon: <PendingActionsIcon />,
        iconBg: '#fff7ed',
        iconColor: '#f97316',
        title: getTitleLabel(roleKey),
        subtitle: '',
        value: formatNumber(stats.pending?.count),
        footerLabel: 'Pending in 24 hours',
        footerValue: formatNumber(stats.pending?.footer || 0),
      }
    : roleKey === 'kam'
      ? {
          icon: <AccountBalanceWalletIcon />,
          iconBg: '#eef2ff',
          iconColor: '#4f46e5',
          title: getTitleLabel(roleKey),
          subtitle: currentMonthLabel,
          value: formatCountAmount(stats.pipeline?.count, stats.pipeline?.amount),
          footerLabel: 'Last Month Pipeline',
          footerValue: formatCountAmount(
            stats.pipeline?.footerCount || stats.pipeline?.count || 0,
            stats.pipeline?.footerAmount || stats.pipeline?.footer || 0,
          ),
      }
      : {
          icon: <ForwardToInboxIcon />,
          iconBg: '#eff6ff',
          iconColor: '#2563eb',
          title: getTitleLabel(roleKey),
          subtitle: currentMonthLabel,
          value: formatNumber(stats.forwarded?.count),
          footerLabel: 'Last Month Forwarded Lead',
          footerValue: formatNumber(stats.forwarded?.footer || 0),
      };

  return [firstCard, ...sharedCards];
}

export default function LeadStatCards({ stats }) {
  const { profile, can } = useUserProfile();
  const canViewLeads = can?.('page_leads') ?? true;

  const currentMonthLabel = useMemo(() => formatMonthYear(new Date()), []);
  const roleKey = useMemo(() => getRoleKey(profile?.role), [profile?.role]);

  // const normalizedStats = useMemo(() => ({
  //   forwarded: { count: 0, footer: 0 },
  //   pipeline: { amount: 0, footer: '৳0' },
  //   pending: { count: 0, footer: 0 },
  //   won: { count: 0, footer: '৳0' },
  //   lost: { count: 0, footer: '৳0' },
  //   active: { count: 0, footer: 0 },
  //   ...(stats || {}),
  // }), [stats]);
  const normalizedStats = useMemo(() => ({
    forwarded: { count: 0, footer: 0 },   // '৳0' → 0
    pipeline:  { count: 0, amount: 0, footer: 0 },  // '৳0' → 0
    pending:   { count: 0, footer: 0 },
    won:       { count: 0, amount: 0, footer: 0 },  // '৳0' → 0
    lost:      { count: 0, amount: 0, footer: 0 },  // '৳0' → 0
    active:    { count: 0, footer: 0 },
    ...(stats || {}),
  }), [stats]);

  const cards = useMemo(
    () => buildLeadCards(roleKey, currentMonthLabel, normalizedStats),
    [currentMonthLabel, normalizedStats, roleKey],
  );

  if (!canViewLeads) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
        },
      }}
    >
      {cards.map((card, idx) => (
        <StatCard key={`${card.title}-${idx}`} {...card} />
      ))}
    </Box>
  );
}
