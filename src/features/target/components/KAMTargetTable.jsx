// src/features/target/components/KAMTargetTable.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Button,
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
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FilterButton from '../../../components/shared/FilterButton';
import OrbitLoader from '../../../components/shared/OrbitLoader';
import KAMTargetFilterDrawer from './KAMTargetFilterDrawer';
import { fetchGroups, fetchTeams } from '../../settings/api/settingsApi';

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

const TARGET_COLUMNS = [
  { id: 'period', label: 'Period', minWidth: 160, sortable: true },
  { id: 'targetMode', label: 'Target Mode', minWidth: 150, sortable: true },
  { id: 'businessEntity', label: 'Business Entity', minWidth: 190, sortable: true },
  { id: 'kam', label: 'KAM', minWidth: 180, sortable: true },
  { id: 'product', label: 'Product', minWidth: 170, sortable: true },
  { id: 'targetAmount', label: 'Target Amount', minWidth: 180, sortable: true },
  { id: 'createdAt', label: 'Created At', minWidth: 160, sortable: true },
  { id: 'action', label: 'Action', minWidth: 90, sortable: false },
];

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

function getSortValue(row, orderBy) {
  switch (orderBy) {
    case 'period':
      if (row.periodMode === 'quarterly') {
        return Number(row.period?.year || 0) * 12 + ((Number(row.period?.quarter || 1) - 1) * 3);
      }
      return Number(row.period?.year || 0) * 12 + Number(row.period?.month || 0);
    case 'targetMode':
      return row.periodMode === 'monthly' ? 0 : 1;
    case 'businessEntity':
      return normalizeLabel(row.businessEntity).toLowerCase();
    case 'kam':
      return normalizeLabel(row.kam).toLowerCase();
    case 'product':
      return normalizeLabel(Array.isArray(row.products) ? row.products[0] : row.products).toLowerCase();
    case 'targetAmount':
      return Number(row.targetAmount || 0);
    case 'createdAt':
      return new Date(row.createdAt || 0).getTime();
    default:
      return normalizeLabel(row[orderBy]).toLowerCase();
  }
}

function descendingComparator(a, b, orderBy) {
  const left = getSortValue(a, orderBy);
  const right = getSortValue(b, orderBy);

  if (right < left) return -1;
  if (right > left) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function KAMTargetTable({
  rows = [],
  loading = false,
  onEdit,
  viewMode = 'all',
  onViewModeChange,
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [teamOptions, setTeamOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [draftFilters, setDraftFilters] = useState({
    viewMode,
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
    viewMode,
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
    const frameId = window.requestAnimationFrame(() => {
      setAppliedFilters((prev) => ({
        ...prev,
        viewMode,
      }));
      setDraftFilters((prev) => ({
        ...prev,
        viewMode,
      }));
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [viewMode]);

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

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

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

  const sortedRows = useMemo(
    () => [...filteredRows].sort(getComparator(order, orderBy)),
    [filteredRows, order, orderBy],
  );

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));
  const safePage = Math.min(page, totalPages - 1);
  const visibleRows = sortedRows.slice(
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
    onViewModeChange?.(draftFilters.viewMode);
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
    onViewModeChange?.('all');
    setPage(0);
    setFilterDrawerOpen(false);
  };

  const handleQuickViewModeChange = (mode) => {
    setAppliedFilters((prev) => ({
      ...prev,
      viewMode: mode,
    }));
    setDraftFilters((prev) => ({
      ...prev,
      viewMode: mode,
    }));
    onViewModeChange?.(mode);
    setPage(0);
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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr auto 1fr' },
            alignItems: 'center',
            gap: 1.5,
            px: 2.5,
            py: 1.75,
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
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
            direction="row"
            spacing={1.25}
            alignItems="center"
            flexWrap="wrap"
            sx={{ justifySelf: { xs: 'flex-start', lg: 'center' } }}
          >
            <Stack
              direction="row"
              spacing={0.75}
              sx={{
                p: 0.5,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '999px',
              }}
            >
              <Button
                type="button"
                size="small"
                onClick={() => handleQuickViewModeChange('monthly')}
                sx={{
                  minWidth: 76,
                  height: 28,
                  px: 1.5,
                  borderRadius: '999px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: 12,
                  color: appliedFilters.viewMode === 'monthly' ? '#1d4ed8' : '#64748b',
                  bgcolor: appliedFilters.viewMode === 'monthly' ? '#dbeafe' : 'transparent',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: appliedFilters.viewMode === 'monthly' ? '#bfdbfe' : 'rgba(37,99,235,0.06)',
                    boxShadow: 'none',
                  },
                }}
              >
                Month
              </Button>
              <Button
                type="button"
                size="small"
                onClick={() => handleQuickViewModeChange('quarterly')}
                sx={{
                  minWidth: 82,
                  height: 28,
                  px: 1.5,
                  borderRadius: '999px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: 12,
                  color: appliedFilters.viewMode === 'quarterly' ? '#6d28d9' : '#64748b',
                  bgcolor: appliedFilters.viewMode === 'quarterly' ? '#ede9fe' : 'transparent',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: appliedFilters.viewMode === 'quarterly' ? '#ddd6fe' : 'rgba(109,40,217,0.06)',
                    boxShadow: 'none',
                  },
                }}
              >
                Quarter
              </Button>
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.25}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ width: { xs: '100%', lg: 'auto' }, justifySelf: { lg: 'end' } }}
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
        </Box>

        {loading ? (
          <OrbitLoader
            title="Loading KAM targets"
            subtitle="Fetching target records."
            minHeight={160}
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
                    {TARGET_COLUMNS.map(({ id, label, minWidth, sortable }, index) => (
                      <TableCell
                        key={label}
                        component="th"
                        scope="col"
                        sortDirection={sortable && orderBy === id ? order : false}
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
                        {sortable ? (
                          <TableSortLabel
                            active={orderBy === id}
                            direction={orderBy === id ? order : 'asc'}
                            hideSortIcon={false}
                            onClick={() => handleRequestSort(id)}
                            sx={{
                              fontWeight: 800,
                              color: '#334155',
                              '&.Mui-active': { color: '#0f172a' },
                              '& .MuiTableSortLabel-icon': {
                                opacity: 0.22,
                                color: '#64748b !important',
                                transition: 'opacity 0.15s ease, color 0.15s ease',
                              },
                              '&:hover .MuiTableSortLabel-icon': {
                                opacity: 0.45,
                              },
                              '&.Mui-active .MuiTableSortLabel-icon': {
                                opacity: 0.7,
                              },
                            }}
                          >
                            {label}
                            {orderBy === id ? (
                              <Box component="span" sx={visuallyHidden}>
                                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                              </Box>
                            ) : null}
                          </TableSortLabel>
                        ) : (
                          label
                        )}
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
