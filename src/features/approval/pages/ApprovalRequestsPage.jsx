import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import useInitialTableLoading from '../../../components/shared/useInitialTableLoading';
import ApprovalFilterDrawer from '../components/ApprovalFilterDrawer';
import ApprovalStatusTabs from '../components/ApprovalStatusTabs';
import ApprovalRequestsTable from '../components/ApprovalRequestsTable';

const approvalRows = [
  {
    id: 1,
    kam: 'Sultana Akter',
    client: 'Arpon Communication Limited',
    product: 'Internet / Support & Maintenance',
    service: 'Installation and monthly support',
    currentRate: 12000,
    proposedUnitPrice: 10500,
    proposedVolume: 10,
    proposedAmount: 120000,
    currentUnitCost: 11000,
    currentQuantity: 10,
    currentInvoice: 110000,
    invoiceDifference: 0,
    status: 'approved',
    itemStatus: 'Approved',
    currentLevel: 'L-2 (Nasir Uddin Ahmed)',
    effectiveDate: '2026-04-08',
    requestedBy: 'Nasir Uddin Ahmed',
    postedInERP: true,
  },
  {
    id: 2,
    kam: 'Nasir Uddin Ahmed',
    client: 'Apex Telecommunication Services',
    product: 'Enterprise Connectivity',
    service: 'Connectivity and maintenance',
    currentRate: 9000,
    proposedUnitPrice: 8600,
    proposedVolume: 8,
    proposedAmount: 84500,
    currentUnitCost: 8800,
    currentQuantity: 8,
    currentInvoice: 86740,
    invoiceDifference: -2240,
    status: 'pending',
    itemStatus: 'Pending',
    currentLevel: 'L-2 (Sultana Akter)',
    effectiveDate: '2026-04-07',
    requestedBy: 'Sultana Akter',
    postedInERP: true,
  },
  {
    id: 3,
    kam: 'Rahim Ahmed',
    client: 'Metro Networks BD',
    product: 'Managed Support / Fiber',
    service: 'Support service pack',
    currentRate: 7000,
    proposedUnitPrice: 7200,
    proposedVolume: 6,
    proposedAmount: 56000,
    currentUnitCost: 6800,
    currentQuantity: 6,
    currentInvoice: 54750,
    invoiceDifference: 1250,
    status: 'rejected',
    itemStatus: 'Rejected',
    currentLevel: 'L-3 (Nasir Uddin Ahmed)',
    effectiveDate: '2026-04-06',
    requestedBy: 'Nasir Uddin Ahmed',
    postedInERP: false,
  },
  {
    id: 4,
    kam: 'Sadia Islam',
    client: 'Prime Digital Solutions',
    product: 'Dedicated Internet Link',
    service: 'Dedicated link with SLA',
    currentRate: 14000,
    proposedUnitPrice: 13800,
    proposedVolume: 7,
    proposedAmount: 98000,
    currentUnitCost: 13900,
    currentQuantity: 7,
    currentInvoice: 98000,
    invoiceDifference: 0,
    status: 'approved',
    itemStatus: 'Approved',
    currentLevel: 'L-2 (Sultana Akter)',
    effectiveDate: '2026-04-08',
    requestedBy: 'Sultana Akter',
    postedInERP: true,
  },
  {
    id: 5,
    kam: 'Mizanur Rahman',
    client: 'Arpon Communication Limited',
    product: 'Internet / Support & Maintenance',
    service: 'Monthly internet and support',
    currentRate: 15000,
    proposedUnitPrice: 14500,
    proposedVolume: 11,
    proposedAmount: 152000,
    currentUnitCost: 14950,
    currentQuantity: 11,
    currentInvoice: 157200,
    invoiceDifference: -5200,
    status: 'pending',
    itemStatus: 'Pending',
    currentLevel: 'L-1 (Nasir Uddin Ahmed)',
    effectiveDate: '2026-04-05',
    requestedBy: 'Nasir Uddin Ahmed',
    postedInERP: false,
  },
];

export default function ApprovalRequestsPage() {
  const isLoading = useInitialTableLoading();
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedRows, setSelectedRows] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    kam: [],
  });
  const [appliedFilters, setAppliedFilters] = useState({
    kam: [],
  });

  const kamOptions = useMemo(
    () => [...new Map(approvalRows.map((row) => [row.kam, { id: row.kam, label: row.kam }])).values()],
    []
  );

  const kamFilteredRows = useMemo(() => {
    const selectedKams = appliedFilters.kam || [];
    if (!selectedKams.length) return approvalRows;
    return approvalRows.filter((row) => selectedKams.includes(row.kam));
  }, [appliedFilters.kam]);

  const tabCounts = useMemo(() => ({
    pending: kamFilteredRows.filter((row) => row.status === 'pending').length,
    approved: kamFilteredRows.filter((row) => row.status === 'approved').length,
    rejected: kamFilteredRows.filter((row) => row.status === 'rejected').length,
    posted: kamFilteredRows.filter((row) => row.postedInERP).length,
  }), [kamFilteredRows]);

  const tabLoadingTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (tabLoadingTimerRef.current) {
        window.clearTimeout(tabLoadingTimerRef.current);
      }
    };
  }, []);

  const visibleRows = useMemo(() => {
    const tabFiltered = kamFilteredRows.filter((row) => (
      selectedTab === 'approved'
        ? row.status === 'approved'
        : selectedTab === 'pending'
          ? row.status === 'pending'
          : selectedTab === 'rejected'
            ? row.status === 'rejected'
            : row.postedInERP
    ));

    return tabFiltered;
  }, [kamFilteredRows, selectedTab]);

  const handleSelectAll = (event, rowsToToggle = visibleRows) => {
    if (event.target.checked) {
      setSelectedRows((prev) => Array.from(new Set([...prev, ...rowsToToggle.map((row) => row.id)])));
    } else {
      setSelectedRows((prev) => prev.filter((id) => !rowsToToggle.some((row) => row.id === id)));
    }
  };

  const handleRowToggle = (rowId) => {
    setSelectedRows((prev) => (
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    ));
  };

  const handleTabChange = (nextTab) => {
    if (nextTab === selectedTab) return;

    setSelectedTab(nextTab);
    setTabLoading(true);

    if (tabLoadingTimerRef.current) {
      window.clearTimeout(tabLoadingTimerRef.current);
    }

    tabLoadingTimerRef.current = window.setTimeout(() => {
      setTabLoading(false);
    }, 500);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      kam: [],
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const handleRemoveKamFilter = (labelToRemove) => {
    setFilters((prev) => ({
      ...prev,
      kam: prev.kam.filter((label) => label !== labelToRemove),
    }));
    setAppliedFilters((prev) => ({
      ...prev,
      kam: prev.kam.filter((label) => label !== labelToRemove),
    }));
  };

  const tabItems = useMemo(() => ([
    { key: 'pending', label: 'Pending', badge: tabCounts.pending, color: '#f59e0b', bg: '#fef3c7' },
    { key: 'approved', label: 'Approved', badge: tabCounts.approved, color: '#16a34a', bg: '#dcfce7' },
    { key: 'rejected', label: 'Rejected', badge: tabCounts.rejected, color: '#dc2626', bg: '#fee2e2' },
    { key: 'posted', label: 'Posted in CRM', badge: tabCounts.posted, color: '#7c3aed', bg: '#ede9fe' },
  ]), [tabCounts]);

  const tableLoading = isLoading || tabLoading;

  const selectedKamLabel = useMemo(() => {
    if (!appliedFilters.kam?.length) return [];
    return kamOptions
      .filter((option) => appliedFilters.kam.includes(option.id))
      .map((option) => option.label);
  }, [appliedFilters.kam, kamOptions]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 1.5, sm: 3, md: 3 }, py: { xs: 2.5, sm: 3 } }}>
      <Box sx={{ width: '100%', mx: 'auto' }}>
        <Stack
          direction={{ xs: 'column', xl: 'row' }}
          alignItems={{ xs: 'stretch', xl: 'center' }}
          justifyContent="space-between"
          spacing={2}
          mb={3}
        >
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
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
              <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 22, color: '#2563eb' }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h5"
                fontWeight={800}
                color="#0f172a"
                lineHeight={1.2}
                sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' } }}
              >
                Approval Requests
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ mt: 0.4 }}>
                Review requests, compare invoices, and post approved items to ERP.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            alignItems={{ xs: 'stretch', lg: 'center' }}
            justifyContent="flex-end"
            spacing={1.5}
            sx={{ minWidth: 0 }}
          >

            <Box
              sx={{
                px: 1.5,
                py: 1.05,
                borderRadius: '999px',
                bgcolor: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="body2" fontWeight={700} color="#1d4ed8">
                User Path
              </Typography>
              <Typography variant="body2" fontWeight={600} color="#1d4ed8">
                Sultana Akter
              </Typography>
              <ArrowForwardIosRoundedIcon sx={{ fontSize: 12, color: '#60a5fa' }} />
              <Typography variant="body2" fontWeight={600} color="#1d4ed8">
                Nasir Uddin Ahmed
              </Typography>
            </Box>
            
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterOpen(true)}
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

        <ApprovalStatusTabs
          tabs={tabItems}
          value={selectedTab}
          onChange={handleTabChange}
        />

        {appliedFilters.kam.length > 0 && (
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            spacing={1}
            sx={{ mb: 1.5 }}
            flexWrap="wrap"
          >
            <Typography variant="body2" color="#64748b" fontWeight={600}>
              Filtering by KAM:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {selectedKamLabel.map((label) => (
                <Chip
                  key={label}
                  label={label}
                  onDelete={() => handleRemoveKamFilter(label)}
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
              ))}
            </Stack>
          </Stack>
        )}

        <ApprovalRequestsTable
          rows={visibleRows}
          loading={tableLoading}
          selectedRows={selectedRows}
          onSelectAll={handleSelectAll}
          onToggleRow={handleRowToggle}
        />

        <ApprovalFilterDrawer
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          filters={filters}
          onChange={handleFilterChange}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          kamOptions={kamOptions}
        />
      </Box>
    </Box>
  );
}
