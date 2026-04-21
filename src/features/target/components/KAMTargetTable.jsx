// src/features/target/components/KAMTargetTable.jsx
import React, { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FilterButton from '../../../components/shared/FilterButton';
import OrbitLoader from '../../../components/shared/OrbitLoader';
import useInitialTableLoading from '../../../components/shared/useInitialTableLoading';
import KAMTargetFilterDrawer from './KAMTargetFilterDrawer';

const KAM_TARGETS = [
  {
    periodMode: 'monthly',
    period: { year: 2026, month: 3, label: 'Apr 2026' },
    businessEntity: 'Alpha Trading',
    kam: 'Arif Rahman',
    products: ['Rice', 'Oil'],
    targetAmount: 1000000,
    createdAt: '2026-04-01',
    achieved: 920000,
  },
  {
    periodMode: 'quarterly',
    period: { year: 2026, quarter: 1, label: 'Q1 2026' },
    businessEntity: 'Green Valley Ltd.',
    kam: 'Priya Sharma',
    products: ['Soap', 'Detergent'],
    targetAmount: 2500000,
    createdAt: '2026-03-18',
    achieved: 1820000,
  },
  {
    periodMode: 'monthly',
    period: { year: 2026, month: 3, label: 'Apr 2026' },
    businessEntity: 'Nova Foods',
    kam: 'Tanvir Hossain',
    products: ['Biscuits', 'Tea'],
    targetAmount: 750000,
    createdAt: '2026-04-08',
    achieved: 610000,
  },
  {
    periodMode: 'quarterly',
    period: { year: 2026, quarter: 2, label: 'Q2 2026' },
    businessEntity: 'Skyline Retail',
    kam: 'Nadia Islam',
    products: ['Sugar', 'Salt'],
    targetAmount: 3200000,
    createdAt: '2026-02-25',
    achieved: 2100000,
  },
  {
    periodMode: 'monthly',
    period: { year: 2026, month: 3, label: 'Apr 2026' },
    businessEntity: 'Prime Logistics',
    kam: 'Rakib Ahmed',
    products: ['Packaging', 'Tape'],
    targetAmount: 1500000,
    createdAt: '2026-04-12',
    achieved: 1150000,
  },
];

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(value).replace('BDT', '৳');
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value || 'N/A';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function getAchievementLabel(achieved, targetAmount) {
  if (!targetAmount) {
    return 'N/A';
  }

  const percentage = Math.min(Math.round((achieved / targetAmount) * 100), 100);
  return `${percentage}%`;
}

function toMonthIndex(period) {
  if (!period || typeof period.year !== 'number' || typeof period.month !== 'number') {
    return null;
  }

  return period.year * 12 + period.month;
}

export default function KAMTargetTable({ sx = {} }) {
  const isLoading = useInitialTableLoading();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState({
    viewMode: 'all',
    fromMonth: null,
    toMonth: null,
    quarterYear: new Date().getFullYear(),
    quarters: [1, 2, 3, 4],
    kam: '',
    products: [],
  });
  const [appliedFilters, setAppliedFilters] = useState({
    viewMode: 'all',
    fromMonth: null,
    toMonth: null,
    quarterYear: new Date().getFullYear(),
    quarters: [1, 2, 3, 4],
    kam: '',
    products: [],
  });

  const kamOptions = useMemo(() => (
    [...new Set(KAM_TARGETS.map((item) => item.kam))]
      .map((name) => ({ id: name, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label))
  ), []);

  const productOptions = useMemo(() => (
    [...new Set(KAM_TARGETS.flatMap((item) => item.products))]
      .map((name) => ({ id: name, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label))
  ), []);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const fromIndex = toMonthIndex(appliedFilters.fromMonth);
    const toIndex = toMonthIndex(appliedFilters.toMonth);

    return KAM_TARGETS.filter((row) => {
      const matchesSearch = !query
        || row.period.label.toLowerCase().includes(query)
        || row.businessEntity.toLowerCase().includes(query)
        || row.kam.toLowerCase().includes(query)
        || row.products.some((product) => product.toLowerCase().includes(query));

      const matchesViewMode = appliedFilters.viewMode === 'all'
        || !appliedFilters.viewMode
        || row.periodMode === appliedFilters.viewMode;
      const matchesKam = !appliedFilters.kam || row.kam === appliedFilters.kam;
      const matchesProducts = !appliedFilters.products.length
        || appliedFilters.products.every((product) => row.products.includes(product));
      const matchesMonthlyRange = appliedFilters.viewMode !== 'monthly'
        || fromIndex === null
        || toIndex === null
        || (
          row.periodMode === 'monthly'
          && (() => {
            const rowIndex = toMonthIndex(row.period);
            return rowIndex !== null && rowIndex >= fromIndex && rowIndex <= toIndex;
          })()
        );
      const matchesQuarterlySelection = appliedFilters.viewMode !== 'quarterly'
        || (
          row.periodMode === 'quarterly'
          && row.period.year === appliedFilters.quarterYear
          && appliedFilters.quarters.includes(row.period.quarter)
        );

      return matchesSearch
        && matchesViewMode
        && matchesKam
        && matchesProducts
        && matchesMonthlyRange
        && matchesQuarterlySelection;
    });
  }, [appliedFilters, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const safePage = Math.min(page, totalPages - 1);
  const visibleRows = filteredRows.slice(
    safePage * rowsPerPage,
    safePage * rowsPerPage + rowsPerPage,
  );

  const handleOpenFilterDrawer = () => {
    setDraftFilters(appliedFilters);
    setFilterDrawerOpen(true);
  };

  const handleFilterChange = (field, value) => {
    setDraftFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    setPage(0);
    setFilterDrawerOpen(false);
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      viewMode: 'all',
      fromMonth: null,
      toMonth: null,
      quarterYear: new Date().getFullYear(),
      quarters: [1, 2, 3, 4],
      kam: '',
      products: [],
    };

    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(0);
    setFilterDrawerOpen(false);
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          bgcolor: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          ...sx,
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          gap={1.5}
          px={2.5}
          py={1.75}
          sx={{ borderBottom: '1px solid #e2e8f0' }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography fontWeight={700} fontSize="0.9rem" color="#0f172a">
              KAM Targets
            </Typography>
            <Chip
              label={`${filteredRows.length} records`}
              size="small"
              sx={{
                bgcolor: '#f1f5f9',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.72rem',
              }}
            />
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.25}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ width: { xs: '100%', lg: 'auto' } }}
          >
            <TextField
              size="small"
              placeholder="Search by period, KAM, entity..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(0);
              }}
              sx={{
                width: { xs: '100%', sm: 320 },
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

            <FilterButton
              onClick={handleOpenFilterDrawer}
              label="Filter"
              sx={{
                height: 40,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                borderColor: '#cbd5e1',
                color: '#334155',
                px: 2,
                whiteSpace: 'nowrap',
              }}
            />
          </Stack>
        </Stack>

        {isLoading ? (
          <OrbitLoader
            title="Loading KAM targets"
            subtitle="Fetching target records."
            minHeight={260}
          />
        ) : (
          <>
            <TableContainer
              sx={{
                overflowX: 'auto',
                maxHeight: 'calc(100vh - 340px)',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <Table stickyHeader aria-label="KAM target table" sx={{ minWidth: 1400 }}>
                <TableHead>
                  <TableRow>
                    {[
                      ['Period', 160],
                      ['Target Mode', 150],
                      ['Business Entity', 190],
                      ['KAM', 180],
                      ['Target Amount', 180],
                      ['Created At', 160],
                      ['Achieve', 120],
                      ['Action', 90],
                    ].map(([label, minWidth], index) => (
                      <TableCell
                        key={label}
                        component="th"
                        scope="col"
                        sx={{
                          bgcolor: '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                          color: '#334155',
                          fontWeight: 800,
                          fontSize: 11,
                          textTransform: 'uppercase',
                          letterSpacing: 0.7,
                          whiteSpace: 'nowrap',
                          verticalAlign: 'middle',
                          minWidth,
                          py: 1.4,
                          pl: index === 0 ? 2.5 : 2,
                          pr: label === 'Action' ? 2.5 : 2,
                        }}
                      >
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {visibleRows.length ? (
                    visibleRows.map((row, index) => (
                      <TableRow
                        key={`${row.businessEntity}-${row.createdAt}`}
                        hover
                        sx={{
                          bgcolor: index % 2 === 0 ? '#fff' : '#fafcff',
                          '&:hover': { bgcolor: '#f4f8ff' },
                        }}
                      >
                      <TableCell sx={{ verticalAlign: 'middle', borderBottom: '1px solid #eef2f7', py: 1.6, pl: 2.5 }}>
                          <Typography variant="body2" fontWeight={700} color="#0f172a">
                            {row.period.label}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ verticalAlign: 'middle', borderBottom: '1px solid #eef2f7', py: 1.6 }}>
                          <Chip
                            label={row.periodMode === 'monthly' ? 'Monthly' : 'Quarterly'}
                            size="small"
                            sx={{
                              bgcolor: row.periodMode === 'monthly' ? '#dbeafe' : '#ede9fe',
                              color: row.periodMode === 'monthly' ? '#1d4ed8' : '#6d28d9',
                              fontWeight: 700,
                              fontSize: 11,
                            }}
                          />
                        </TableCell>

                        <TableCell sx={{ verticalAlign: 'middle', borderBottom: '1px solid #eef2f7', py: 1.6 }}>
                          <Typography variant="body2" color="#0f172a" fontWeight={600}>
                            {row.businessEntity}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ verticalAlign: 'middle', borderBottom: '1px solid #eef2f7', py: 1.6 }}>
                          <Typography variant="body2" color="#0f172a" fontWeight={600}>
                            {row.kam}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ verticalAlign: 'middle', borderBottom: '1px solid #eef2f7', py: 1.6 }}>
                          <Typography variant="body2" color="#0f172a" fontWeight={600}>
                            {formatCurrency(row.targetAmount)}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ verticalAlign: 'middle', borderBottom: '1px solid #eef2f7', py: 1.6 }}>
                          <Typography variant="body2" color="#0f172a">
                            {formatDate(row.createdAt)}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ verticalAlign: 'middle', borderBottom: '1px solid #eef2f7', py: 1.6 }}>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color={row.achieved >= row.targetAmount ? '#16a34a' : '#0f172a'}
                          >
                            {getAchievementLabel(row.achieved, row.targetAmount)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatCurrency(row.achieved)}
                          </Typography>
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{ verticalAlign: 'middle', borderBottom: '1px solid #eef2f7', py: 1.6, pr: 2.5 }}
                        >
                          <Tooltip title="Edit target">
                            <IconButton size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#475569' } }}>
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ py: 8, textAlign: 'center', borderBottom: 0 }}>
                        <Typography fontWeight={700} color="#64748b">
                          No KAM targets found.
                        </Typography>
                        <Typography variant="body2" color="#94a3b8" mt={0.5}>
                          Try a different search term or filter.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredRows.length}
              page={safePage}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              labelRowsPerPage="Rows per page:"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count}`}
              sx={{
                borderTop: '1px solid #e2e8f0',
                '& .MuiTablePagination-toolbar': {
                  minHeight: 56,
                  px: { xs: 1.5, sm: 2 },
                },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  color: '#0f172a',
                  fontSize: 14,
                },
                '& .MuiTablePagination-select': {
                  fontSize: 14,
                },
              }}
            />
          </>
        )}
      </Paper>

    <KAMTargetFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={draftFilters}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        kamOptions={kamOptions}
        productOptions={productOptions}
      />
  </>
  );
}
