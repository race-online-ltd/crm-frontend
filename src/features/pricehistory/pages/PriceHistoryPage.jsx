import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import useInitialTableLoading from '@/components/shared/useInitialTableLoading';

import DataTable, { StatusChip } from '../components/DataTable';
import FilterDrawer from '../components/FilterDrawer';

const PRICE_HISTORY_ROWS = [
  {
    id: 'ph-001',
    proposalRef: 'PH-2401',
    clientName: 'M/s. BD Cloud International Limited',
    product: 'Dedicated Internet',
    kam: 'Rimon',
    filterBy: 'Client',
    status: 'Approved',
    previousRate: 5200,
    revisedRate: 4800,
    difference: -400,
    billingAmount: 38400,
    effectiveDate: '2026-04-01',
    remarks: 'Repriced after bandwidth optimization and annual commitment review.',
  },
  {
    id: 'ph-002',
    proposalRef: 'PH-2402',
    clientName: 'M/s. Delta Network Solutions',
    product: 'Enterprise Connectivity',
    kam: 'Nusrat',
    filterBy: 'KAM',
    status: 'Pending',
    previousRate: 6400,
    revisedRate: 6700,
    difference: 300,
    billingAmount: 53600,
    effectiveDate: '2026-04-04',
    remarks: 'Awaiting finance confirmation for revised commercial terms.',
  },
  {
    id: 'ph-003',
    proposalRef: 'PH-2403',
    clientName: 'M/s. Khulna IX',
    product: 'Cloud Backup',
    kam: 'Arefin',
    filterBy: 'Product',
    status: 'Rejected',
    previousRate: 2100,
    revisedRate: 2600,
    difference: 500,
    billingAmount: 20800,
    effectiveDate: '2026-03-28',
    remarks: 'Rejected due to unsupported SLA change and budget mismatch.',
  },
  {
    id: 'ph-004',
    proposalRef: 'PH-2404',
    clientName: 'M/s. Orbit Data Center',
    product: 'Managed Firewall',
    kam: 'Rimon',
    filterBy: 'Contract',
    status: 'On Hold',
    previousRate: 3000,
    revisedRate: 3000,
    difference: 0,
    billingAmount: 24000,
    effectiveDate: '2026-04-10',
    remarks: 'Commercial review paused until contract renewal is finalized.',
  },
  {
    id: 'ph-005',
    proposalRef: 'PH-2405',
    clientName: 'M/s. NextGen Telecom',
    product: 'IP Transit',
    kam: 'Nusrat',
    filterBy: 'Client',
    status: 'Approved',
    previousRate: 8900,
    revisedRate: 8450,
    difference: -450,
    billingAmount: 67600,
    effectiveDate: '2026-04-12',
    remarks: 'Approved with a volume-based discount for the new quarter.',
  },
  {
    id: 'ph-006',
    proposalRef: 'PH-2406',
    clientName: 'M/s. Summit Broadband',
    product: 'Last Mile Access',
    kam: 'Arefin',
    filterBy: 'KAM',
    status: 'Pending',
    previousRate: 4700,
    revisedRate: 4950,
    difference: 250,
    billingAmount: 39600,
    effectiveDate: '2026-04-15',
    remarks: 'Customer requested a revised SLA clause before final sign-off.',
  },
  {
    id: 'ph-007',
    proposalRef: 'PH-2407',
    clientName: 'M/s. Horizon Cloud',
    product: 'Dedicated Internet',
    kam: 'Rimon',
    filterBy: 'Product',
    status: 'Approved',
    previousRate: 7600,
    revisedRate: 7350,
    difference: -250,
    billingAmount: 58800,
    effectiveDate: '2026-04-18',
    remarks: 'Implemented a better rate after contract tenure extension.',
  },
  {
    id: 'ph-008',
    proposalRef: 'PH-2408',
    clientName: 'M/s. CityNet Holdings',
    product: 'Cloud Connect',
    kam: 'Nusrat',
    filterBy: 'Contract',
    status: 'Pending',
    previousRate: 5600,
    revisedRate: 6000,
    difference: 400,
    billingAmount: 48000,
    effectiveDate: '2026-04-20',
    remarks: 'Pending approval from the contract owner and finance team.',
  },
];

const PRICE_HISTORY_COLUMNS = [
  {
    key: 'proposalRef',
    header: 'Proposal Ref',
    minWidth: 120,
  },
  {
    key: 'clientName',
    header: 'Client / Organization',
    minWidth: 220,
    render: (value) => (
      <Typography fontWeight={700} color="#0f172a" sx={{ whiteSpace: 'normal', lineHeight: 1.35 }}>
        {value || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'product',
    header: 'Product',
    minWidth: 170,
  },
  {
    key: 'kam',
    header: 'KAM',
    minWidth: 120,
  },
  {
    key: 'filterBy',
    header: 'Filter By',
    minWidth: 120,
  },
  {
    key: 'status',
    header: 'Status',
    minWidth: 120,
    render: (value) => <StatusChip value={value} />,
  },
  {
    key: 'previousRate',
    header: 'Previous Rate',
    type: 'currency',
    minWidth: 140,
  },
  {
    key: 'revisedRate',
    header: 'Revised Rate',
    type: 'currency',
    minWidth: 140,
  },
  {
    key: 'difference',
    header: 'Difference',
    minWidth: 140,
    render: (value) => {
      const numericValue = Number(value || 0);
      return (
        <Typography
          fontWeight={700}
          sx={{ color: numericValue > 0 ? '#16a34a' : numericValue < 0 ? '#dc2626' : '#475569' }}
        >
          {numericValue > 0 ? '+' : numericValue < 0 ? '-' : ''}
          ৳ {Math.abs(numericValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
      );
    },
  },
  {
    key: 'billingAmount',
    header: 'Billing Amount',
    type: 'currency',
    minWidth: 150,
  },
  {
    key: 'effectiveDate',
    header: 'Effective Date',
    type: 'date',
    minWidth: 140,
  },
  {
    key: 'remarks',
    header: 'Remarks',
    minWidth: 260,
  },
];

function buildOptions(items) {
  return Array.from(new Set(items.filter(Boolean))).map((item) => ({ value: item, label: item }));
}

function countActiveFilters(filters) {
  return Object.values(filters).filter(Boolean).length;
}

export default function PriceHistoryPage() {
  const isLoading = useInitialTableLoading();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    filterBy: '',
    kam: '',
    product: '',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const statusOptions = useMemo(() => buildOptions(PRICE_HISTORY_ROWS.map((row) => row.status)), []);
  const filterByOptions = useMemo(() => buildOptions(PRICE_HISTORY_ROWS.map((row) => row.filterBy)), []);
  const kamOptions = useMemo(() => buildOptions(PRICE_HISTORY_ROWS.map((row) => row.kam)), []);
  const productOptions = useMemo(() => buildOptions(PRICE_HISTORY_ROWS.map((row) => row.product)), []);

  const filteredRows = useMemo(() => {
    return PRICE_HISTORY_ROWS.filter((row) => (
      (!filters.status || row.status === filters.status)
      && (!filters.filterBy || row.filterBy === filters.filterBy)
      && (!filters.kam || row.kam === filters.kam)
      && (!filters.product || row.product === filters.product)
    ));
  }, [filters]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const activeFilterCount = countActiveFilters(filters);
  const tableLoading = isLoading;

  const activeFilterChips = useMemo(() => {
    const chipItems = [
      filters.status ? { key: 'status', label: 'Status', value: filters.status } : null,
      filters.filterBy ? { key: 'filterBy', label: 'Filter By', value: filters.filterBy } : null,
      filters.kam ? { key: 'kam', label: 'KAM', value: filters.kam } : null,
      filters.product ? { key: 'product', label: 'Product', value: filters.product } : null,
    ];

    return chipItems.filter(Boolean);
  }, [filters]);

  const handleApplyFilters = (nextFilters) => {
    setFilters(nextFilters);
    setPage(0);
    setDrawerOpen(false);
  };

  const handleChangePage = (_, nextPage) => {
    setPage(nextPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRemoveFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: '' }));
    setPage(0);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        px: { xs: 1.5, sm: 3 },
        py: { xs: 2.5, sm: 3 },
        bgcolor: '#ffffff',
      }}
    >
      <Box sx={{ width: '100%', mx: 'auto' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'flex-start' }}
          spacing={2}
          mb={3}
        >
          <Stack spacing={1.25} sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '12px',
                  bgcolor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <HistoryOutlinedIcon sx={{ fontSize: 22, color: '#2563eb' }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  color="#0f172a"
                  lineHeight={1.2}
                  sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' } }}
                >
                  Price History
                </Typography>
                <Typography variant="body2" color="#64748b" sx={{ mt: 0.4 }}>
                  Track proposal revisions, approvals, and commercial changes in one place.
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ minWidth: 0 }}>
              <Chip
                label={`${filteredRows.length} Records`}
                sx={{
                  fontWeight: 800,
                  bgcolor: '#eff6ff',
                  color: '#2563eb',
                  borderRadius: '999px',
                }}
              />
              <Chip
                label={`${activeFilterCount} Active Filters`}
                sx={{
                  fontWeight: 800,
                  bgcolor: '#f8fafc',
                  color: '#475569',
                  borderRadius: '999px',
                }}
              />
            </Stack>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            justifyContent="flex-end"
            sx={{ minWidth: 0 }}
          >
            <Button
              onClick={() => setDrawerOpen(true)}
              variant="outlined"
              startIcon={<FilterListIcon />}
              sx={{
                width: { xs: 'fit-content', sm: 'fit-content' },
                minWidth: 82,
                height: 40,
                px: 1.5,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 14,
                lineHeight: 1,
                color: '#2563eb',
                borderColor: '#bfdbfe',
                bgcolor: '#fff',
                boxShadow: 'none',
                '& .MuiButton-startIcon': {
                  marginRight: 0.75,
                },
                '& .MuiButton-startIcon svg': {
                  fontSize: 18,
                },
                '&:hover': {
                  bgcolor: '#f8fbff',
                  borderColor: '#93c5fd',
                  boxShadow: 'none',
                },
              }}
            >
              Filter
            </Button>
          </Stack>
        </Stack>

        {activeFilterChips.length > 0 ? (
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            spacing={1.75}
            sx={{ mb: 1.5, flexWrap: 'wrap' }}
          >
            {activeFilterChips.map((chip) => (
              <Stack
                key={chip.key}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ whiteSpace: 'nowrap' }}
              >
                <Typography variant="body2" color="#64748b" fontWeight={600}>
                  Filtering by {chip.label}:
                </Typography>
                <Chip
                  label={chip.value}
                  onDelete={() => handleRemoveFilter(chip.key)}
                  size="small"
                  sx={{
                    bgcolor: '#eef2ff',
                    color: '#2563eb',
                    fontWeight: 700,
                    border: '1px solid #c7d2fe',
                    '& .MuiChip-deleteIcon': {
                      color: '#2563eb',
                    },
                  }}
                />
              </Stack>
            ))}
          </Stack>
        ) : null}

        <DataTable
          data={filteredRows}
          columns={PRICE_HISTORY_COLUMNS}
          loading={tableLoading}
          pagination={{
            count: filteredRows.length,
            page,
            rowsPerPage,
            rowsPerPageOptions: [5, 10, 25],
            paginatedData: paginatedRows,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleChangeRowsPerPage,
          }}
        />
      </Box>

      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onApply={handleApplyFilters}
        onReset={() => {
          const emptyFilters = {
            status: '',
            filterBy: '',
            kam: '',
            product: '',
          };

          setFilters(emptyFilters);
          setPage(0);
        }}
        initialValues={filters}
        statusOptions={statusOptions}
        filterByOptions={filterByOptions}
        kamOptions={kamOptions}
        productOptions={productOptions}
      />
    </Box>
  );
}
