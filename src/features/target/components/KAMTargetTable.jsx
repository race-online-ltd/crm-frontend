// src/features/target/components/KAMTargetTable.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
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
import KAMTargetFilterDrawer from './KAMTargetFilterDrawer';
import { fetchGroups, fetchTeams } from '../../settings/api/settingsApi';

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(Number(value || 0)).replace('BDT', '৳');
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

function toMonthIndex(period) {
  if (!period || typeof period.year !== 'number' || typeof period.month !== 'number') {
    return null;
  }

  return period.year * 12 + period.month;
}

function normalizeLabel(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.label || value.full_name || value.user_name || value.product_name || value.name || '';
}

export default function KAMTargetTable({
  rows = [],
  loading = false,
  onEdit,
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [teamOptions, setTeamOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [draftFilters, setDraftFilters] = useState({
    viewMode: 'all',
    fromMonth: null,
    toMonth: null,
    quarterYear: new Date().getFullYear(),
    quarters: [1, 2, 3, 4],
    kam: '',
    products: [],
    team: '',
    group: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    viewMode: 'all',
    fromMonth: null,
    toMonth: null,
    quarterYear: new Date().getFullYear(),
    quarters: [1, 2, 3, 4],
    kam: '',
    products: [],
    team: '',
    group: '',
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [teams, groups] = await Promise.all([
          fetchTeams(),
          fetchGroups(),
        ]);

        if (!active) {
          return;
        }

        setTeamOptions(
          (Array.isArray(teams) ? teams : [])
            .map((item) => ({
              id: String(item.id),
              label: item.label || item.team_name || item.name || `Team ${item.id}`,
            }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        );

        setGroupOptions(
          (Array.isArray(groups) ? groups : [])
            .map((item) => ({
              id: String(item.id),
              label: item.label || item.group_name || item.name || `Group ${item.id}`,
            }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        );
      } catch {
        if (active) {
          setTeamOptions([]);
          setGroupOptions([]);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const kamOptions = useMemo(() => (
    [...new Set(rows.map((item) => normalizeLabel(item.kam)).filter(Boolean))]
      .map((name) => ({ id: name, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label))
  ), [rows]);

  const productOptions = useMemo(() => (
    [...new Set(rows.flatMap((item) => item.products || []))]
      .map((name) => ({ id: name, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label))
  ), [rows]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const fromIndex = toMonthIndex(appliedFilters.fromMonth);
    const toIndex = toMonthIndex(appliedFilters.toMonth);

    return rows.filter((row) => {
      const periodLabel = row.period?.label || '';
      const businessEntity = normalizeLabel(row.businessEntity);
      const kam = normalizeLabel(row.kam);
      const products = Array.isArray(row.products) ? row.products : [];

      const matchesSearch = !query
        || periodLabel.toLowerCase().includes(query)
        || businessEntity.toLowerCase().includes(query)
        || kam.toLowerCase().includes(query)
        || products.some((product) => String(product).toLowerCase().includes(query));

      const matchesViewMode = appliedFilters.viewMode === 'all'
        || !appliedFilters.viewMode
        || row.periodMode === appliedFilters.viewMode;
      const matchesKam = !appliedFilters.kam || kam === appliedFilters.kam;
      const matchesProducts = !appliedFilters.products.length
        || appliedFilters.products.every((product) => products.includes(product));
      const matchesTeam = !appliedFilters.team
        || (Array.isArray(row.teamIds) && row.teamIds.includes(String(appliedFilters.team)));
      const matchesGroup = !appliedFilters.group
        || (Array.isArray(row.groupIds) && row.groupIds.includes(String(appliedFilters.group)));
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
          && row.period?.year === appliedFilters.quarterYear
          && appliedFilters.quarters.includes(row.period?.quarter)
        );

      return matchesSearch
        && matchesViewMode
        && matchesKam
        && matchesProducts
        && matchesTeam
        && matchesGroup
        && matchesMonthlyRange
        && matchesQuarterlySelection;
    });
  }, [appliedFilters, rows, searchQuery]);

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
      team: '',
      group: '',
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

        {loading ? (
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
                      ['Product', 170],
                      ['Target Amount', 180],
                      ['Created At', 160],
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
                        key={row.id}
                        hover
                        sx={{
                          bgcolor: index % 2 === 0 ? '#fff' : '#fafcff',
                          '&:hover': { bgcolor: '#f4f8ff' },
                        }}
                      >
                        <TableCell sx={{ verticalAlign: 'middle', borderBottom: '1px solid #eef2f7', py: 1.6, pl: 2.5 }}>
                          <Typography variant="body2" fontWeight={700} color="#0f172a">
                            {row.period?.label || 'N/A'}
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
                            {normalizeLabel(row.businessEntity) || 'N/A'}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ verticalAlign: 'middle', borderBottom: '1px solid #eef2f7', py: 1.6 }}>
                          <Typography variant="body2" color="#0f172a" fontWeight={600}>
                            {normalizeLabel(row.kam) || 'N/A'}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ verticalAlign: 'middle', borderBottom: '1px solid #eef2f7', py: 1.6 }}>
                          <Typography variant="body2" color="#0f172a" fontWeight={600}>
                            {Array.isArray(row.products) && row.products.length ? row.products[0] : 'N/A'}
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

                        <TableCell
                          align="center"
                          sx={{ verticalAlign: 'middle', borderBottom: '1px solid #eef2f7', py: 1.6, pr: 2.5 }}
                        >
                          <Tooltip title="Edit target">
                            <IconButton
                              size="small"
                              sx={{ color: '#94a3b8', '&:hover': { color: '#475569' } }}
                              onClick={() => onEdit?.(row)}
                            >
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
        teamOptions={teamOptions}
        groupOptions={groupOptions}
      />
    </>
  );
}
