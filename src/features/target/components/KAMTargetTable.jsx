// src/features/target/components/KAMTargetTable.jsx
import React, { useState } from 'react';
import {
  Box, Paper, Typography, Stack, Chip, Avatar, LinearProgress,
  IconButton, Tooltip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, TextField, InputAdornment, Pagination,
} from '@mui/material';
import MoreVertIcon        from '@mui/icons-material/MoreVert';
import EmojiEventsIcon     from '@mui/icons-material/EmojiEvents';
import SearchIcon          from '@mui/icons-material/Search';
import OrbitLoader from '../../../components/shared/OrbitLoader';
import useInitialTableLoading from '../../../components/shared/useInitialTableLoading';

// ─── Mock KAM target data ─────────────────────────────────────────────────────
const KAM_TARGETS = [
  {
    id: 'k1',
    kam: { name: 'Arif Rahman', initials: 'AR', division: 'Dhaka Central' },
    lastMonth: { achieved: 920000,  set: 1000000, type: 'revenue' },
    thisMonth: { achieved: 780000,  set: 900000,  type: 'revenue' },
    reward: 'iPhone 15',
    rewardEligible: true,
  },
  {
    id: 'k2',
    kam: { name: 'Priya Sharma',   initials: 'PS', division: 'Chattogram' },
    lastMonth: { achieved: 42,      set: 50,       type: 'client' },
    thisMonth: { achieved: 38,      set: 50,       type: 'client' },
    reward: 'Cash ৳10,000',
    rewardEligible: false,
  },
  {
    id: 'k3',
    kam: { name: 'Tanvir Hossain', initials: 'TH', division: 'Sylhet' },
    lastMonth: { achieved: 580000,  set: 600000,   type: 'revenue' },
    thisMonth: { achieved: 610000,  set: 700000,   type: 'revenue' },
    reward: '',
    rewardEligible: false,
  },
  {
    id: 'k4',
    kam: { name: 'Nadia Islam',    initials: 'NI', division: 'Khulna' },
    lastMonth: { achieved: 28,      set: 30,       type: 'client' },
    thisMonth: { achieved: 19,      set: 30,       type: 'client' },
    reward: 'Shopping Voucher',
    rewardEligible: false,
  },
  {
    id: 'k5',
    kam: { name: 'Rakib Ahmed',    initials: 'RA', division: 'Rajshahi' },
    lastMonth: { achieved: 1150000, set: 1000000,  type: 'revenue' },
    thisMonth: { achieved: 890000,  set: 1200000,  type: 'revenue' },
    reward: 'Trip to Cox\'s Bazar',
    rewardEligible: true,
  },
];

const ROWS_PER_PAGE = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPct(achieved, set) {
  return Math.min(Math.round((achieved / set) * 100), 100);
}

function formatValue(value, type) {
  if (type === 'revenue') {
    if (value >= 1000000) return `৳${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000)    return `৳${(value / 1000).toFixed(0)}K`;
    return `৳${value}`;
  }
  return `${value} clients`;
}

function ProgressCell({ achieved, set, type }) {
  const pct       = getPct(achieved, set);
  const exceeded  = achieved > set;
  const color     = exceeded ? '#16a34a' : pct >= 75 ? '#2563eb' : pct >= 50 ? '#d97706' : '#ef4444';
  const trackColor = exceeded ? '#dcfce7' : pct >= 75 ? '#dbeafe' : pct >= 50 ? '#fef3c7' : '#fee2e2';

  return (
    <Box sx={{ minWidth: 160 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Typography variant="caption" fontWeight={700} color={color}>
          {formatValue(achieved, type)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          / {formatValue(set, type)}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 6,
          borderRadius: 4,
          bgcolor: trackColor,
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
        }}
      />
      <Typography variant="caption" color={color} fontWeight={600} mt={0.25} display="block">
        {exceeded ? `+${pct - 100}% exceeded` : `${pct}% achieved`}
      </Typography>
    </Box>
  );
}

function KAMCell({ kam }) {
  const colors = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#dc2626'];
  const bg     = colors[kam.initials.charCodeAt(0) % colors.length];
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Avatar sx={{ width: 34, height: 34, bgcolor: bg, fontSize: '0.75rem', fontWeight: 700 }}>
        {kam.initials}
      </Avatar>
      <Box>
        <Typography variant="body2" fontWeight={600} color="#0f172a" lineHeight={1.3}>
          {kam.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {kam.division}
        </Typography>
      </Box>
    </Stack>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────
export default function KAMTargetTable({ sx = {} }) {
  const isLoading = useInitialTableLoading();
  const [order, setOrder]   = useState('asc');
  const [orderBy, setOrderBy] = useState('kam');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (col) => {
    if (orderBy === col) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setOrderBy(col); setOrder('asc'); }
  };

  const filtered = KAM_TARGETS.filter((row) =>
    row.kam.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let aVal, bVal;
    if (orderBy === 'kam')       { aVal = a.kam.name; bVal = b.kam.name; }
    else if (orderBy === 'last') { aVal = getPct(a.lastMonth.achieved, a.lastMonth.set); bVal = getPct(b.lastMonth.achieved, b.lastMonth.set); }
    else                         { aVal = getPct(a.thisMonth.achieved, a.thisMonth.set); bVal = getPct(b.thisMonth.achieved, b.thisMonth.set); }
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1  : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: '14px', borderColor: '#e2e8f0', overflow: 'hidden', ...sx }}
    >
      {/* Table header bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        px={2.5}
        py={1.75}
        gap={1.5}
        sx={{ borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontWeight={700} fontSize="0.9rem" color="#0f172a">
            KAM Performance
          </Typography>
          <Chip
            label={`${filtered.length} KAMs`}
            size="small"
            sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.72rem' }}
          />
        </Stack>
        <TextField
          size="small"
          placeholder="Search by KAM name..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          sx={{
            width: { xs: '100%', sm: 260 },
            ml: { sm: 'auto' },
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              bgcolor: '#fff',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <TableContainer>
        {isLoading ? (
          <OrbitLoader title="Loading KAM performance" minHeight={280} />
        ) : (
          <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ '& th': { bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', py: 1.25 } }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569', pl: 2.5 }}>
                <TableSortLabel
                  active={orderBy === 'kam'}
                  direction={orderBy === 'kam' ? order : 'asc'}
                  onClick={() => handleSort('kam')}
                >
                  KAM
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569' }}>
                <TableSortLabel
                  active={orderBy === 'last'}
                  direction={orderBy === 'last' ? order : 'asc'}
                  onClick={() => handleSort('last')}
                >
                  Last Month
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569' }}>
                <TableSortLabel
                  active={orderBy === 'this'}
                  direction={orderBy === 'this' ? order : 'asc'}
                  onClick={() => handleSort('this')}
                >
                  This Month
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569' }}>
                Reward
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569' }} align="right" />
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 6, textAlign: 'center', borderBottom: 0 }}>
                  <Typography fontWeight={600} color="text.secondary" gutterBottom>
                    No KAMs found
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Try a different KAM name
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginated.map((row, idx) => (
              <TableRow
                key={row.id}
                sx={{
                  '&:last-child td': { border: 0 },
                  '& td': { py: 1.75, borderColor: '#f1f5f9' },
                  '&:hover': { bgcolor: '#fafbff' },
                  bgcolor: idx % 2 === 0 ? '#fff' : '#fcfcfe',
                }}
              >
                {/* KAM */}
                <TableCell sx={{ pl: 2.5 }}>
                  <KAMCell kam={row.kam} />
                </TableCell>

                {/* Last month */}
                <TableCell>
                  <ProgressCell
                    achieved={row.lastMonth.achieved}
                    set={row.lastMonth.set}
                    type={row.lastMonth.type}
                  />
                </TableCell>

                {/* This month */}
                <TableCell>
                  <ProgressCell
                    achieved={row.thisMonth.achieved}
                    set={row.thisMonth.set}
                    type={row.thisMonth.type}
                  />
                </TableCell>

                {/* Reward */}
                <TableCell>
                  {row.reward ? (
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <EmojiEventsIcon
                        sx={{ fontSize: 15, color: row.rewardEligible ? '#d97706' : '#94a3b8' }}
                      />
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        color={row.rewardEligible ? '#92400e' : '#64748b'}
                        sx={{
                          bgcolor: row.rewardEligible ? '#fef3c7' : '#f1f5f9',
                          px: 1, py: 0.25, borderRadius: '6px',
                        }}
                      >
                        {row.reward}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.disabled">—</Typography>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell align="right" sx={{ pr: 2 }}>
                  <IconButton size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#475569' } }}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        )}
      </TableContainer>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'center', sm: 'space-between' },
          px: 2.5,
          py: 1.375,
          borderTop: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Typography fontSize={12} color="#6b7280" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {sorted.length === 0
            ? 'Showing 0 of 0 KAMs'
            : `Showing ${((safePage - 1) * ROWS_PER_PAGE) + 1}-${Math.min(safePage * ROWS_PER_PAGE, sorted.length)} of ${sorted.length} KAMs`}
        </Typography>
        <Pagination
          count={totalPages}
          page={safePage}
          onChange={(_, value) => setPage(value)}
          size="small"
          shape="rounded"
          sx={{
            '& .MuiPaginationItem-root': {
              fontSize: 12,
              borderRadius: '6px',
              minWidth: 28,
              height: 28,
            },
            '& .Mui-selected': { fontWeight: 700 },
          }}
        />
      </Box>
    </Paper>
  );
}
