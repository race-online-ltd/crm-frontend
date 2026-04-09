import React, { useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import OrbitLoader from '../../../components/shared/OrbitLoader';

function formatCurrency(value) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getStatusMeta(status) {
  switch (status) {
    case 'approved':
      return {
        label: 'Approved',
        bgcolor: '#dcfce7',
        color: '#166534',
        borderColor: '#bbf7d0',
      };
    case 'pending':
      return {
        label: 'Pending',
        bgcolor: '#fef3c7',
        color: '#92400e',
        borderColor: '#fde68a',
        icon: null,
      };
    case 'rejected':
      return {
        label: 'Rejected',
        bgcolor: '#fee2e2',
        color: '#b91c1c',
        borderColor: '#fecaca',
        icon: null,
      };
    default:
      return {
        label: 'Posted in CRM',
        bgcolor: '#ede9fe',
        color: '#6d28d9',
        borderColor: '#ddd6fe',
        icon: null,
      };
  }
}

export default function ApprovalRequestsTable({
  rows = [],
  loading = false,
  selectedRows = [],
  onSelectAll,
  onToggleRow,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const maxPage = Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1);
  const safePage = Math.min(page, maxPage);

  const paginatedRows = useMemo(() => {
    const start = safePage * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, rowsPerPage, safePage]);

  const currentPageSelectedCount = paginatedRows.filter((row) => selectedRows.includes(row.id)).length;
  const currentPageAllSelected = paginatedRows.length > 0 && currentPageSelectedCount === paginatedRows.length;
  const currentPageIndeterminate = currentPageSelectedCount > 0 && currentPageSelectedCount < paginatedRows.length;

  const headerMinWidths = {
    kam: 160,
    client: 200,
    product: 210,
    service: 210,
    currentRate: 130,
    proposedUnitPrice: 160,
    proposedVolume: 130,
    proposedAmount: 160,
    currentUnitCost: 140,
    currentQuantity: 130,
    currentInvoice: 150,
    invoiceDifference: 160,
    itemStatus: 130,
    currentLevel: 180,
    effectiveDate: 140,
    requestedBy: 170,
    actions: 180,
  };

  const handlePageChange = (_, nextPage) => {
    setPage(nextPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {loading ? (
        <OrbitLoader title="Loading approval requests" subtitle="Fetching approvals, invoices, and ERP status." minHeight={260} />
      ) : (
        <>
          <TableContainer
            sx={{
              overflowX: 'auto',
              maxHeight: 'calc(100vh - 240px)',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <Table stickyHeader sx={{ minWidth: { xs: 2100, sm: 2340 } }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    padding="checkbox"
                    sx={{
                      bgcolor: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      minWidth: headerMinWidths.kam,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Checkbox
                        checked={currentPageAllSelected}
                        indeterminate={currentPageIndeterminate}
                        onChange={(event) => onSelectAll?.(event, paginatedRows)}
                        size="small"
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 800,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: 0.8,
                        }}
                      >
                        Select All
                      </Typography>
                    </Stack>
                  </TableCell>
                  {[
                    'KAM',
                    'Client',
                    'Product',
                    'Service',
                    'Current Rate',
                    'Proposed Unit Price',
                    'Proposed Volume',
                    'Proposed Amount',
                    'Current Unit Cost',
                    'Current Quantity',
                    'Current Invoice',
                    'Invoice Difference',
                    'Item Status',
                    'Current Level',
                    'Effective Date',
                    'Requested By',
                    'Actions',
                  ].map((label, index) => (
                    <TableCell
                      key={label}
                      sx={{
                        bgcolor: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        color: '#64748b',
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 0.8,
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        position: !isMobile && index === 16 ? 'sticky' : 'static',
                        right: !isMobile && index === 16 ? 0 : 'auto',
                        zIndex: !isMobile && index === 16 ? 2 : 1,
                        minWidth:
                          index === 0 ? headerMinWidths.kam
                            : index === 1 ? headerMinWidths.client
                              : index === 2 ? headerMinWidths.product
                                : index === 3 ? headerMinWidths.service
                                  : index === 4 ? headerMinWidths.currentRate
                                    : index === 5 ? headerMinWidths.proposedUnitPrice
                                      : index === 6 ? headerMinWidths.proposedVolume
                                        : index === 7 ? headerMinWidths.proposedAmount
                                          : index === 8 ? headerMinWidths.currentUnitCost
                                            : index === 9 ? headerMinWidths.currentQuantity
                                              : index === 10 ? headerMinWidths.currentInvoice
                                                : index === 11 ? headerMinWidths.invoiceDifference
                                                  : index === 12 ? headerMinWidths.itemStatus
                                                    : index === 13 ? headerMinWidths.currentLevel
                                                      : index === 14 ? headerMinWidths.effectiveDate
                                                        : index === 15 ? headerMinWidths.requestedBy
                                                          : headerMinWidths.actions,
                      }}
                    >
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedRows.map((row, index) => {
                  const selected = selectedRows.includes(row.id);
                  const statusMeta = getStatusMeta(row.status);

                  return (
                    <TableRow
                      key={row.id}
                      hover
                      selected={selected}
                      sx={{
                        bgcolor: index % 2 === 0 ? '#fff' : '#fafcff',
                        '&:hover': { bgcolor: '#f8fbff' },
                      }}
                    >
                      <TableCell
                        padding="checkbox"
                        sx={{
                          borderBottom: '1px solid #edf2f7',
                          ...(isMobile ? {} : { position: 'sticky', left: 0, bgcolor: index % 2 === 0 ? '#fff' : '#fafcff', zIndex: 1 }),
                        }}
                      >
                        <Checkbox checked={selected} onChange={() => onToggleRow?.(row.id)} size="small" />
                      </TableCell>

                      <TableCell sx={{ borderBottom: '1px solid #edf2f7', minWidth: headerMinWidths.kam }}>
                        <Typography fontWeight={700} color="#0f172a">
                          {row.kam}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ borderBottom: '1px solid #edf2f7', minWidth: headerMinWidths.client }}>
                        <Typography fontWeight={700} color="#0f172a" sx={{ lineHeight: 1.3 }}>
                          {row.client}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ borderBottom: '1px solid #edf2f7', minWidth: headerMinWidths.product }}>
                        <Typography sx={{ lineHeight: 1.3, color: '#0f172a' }}>
                          {row.product}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ borderBottom: '1px solid #edf2f7', minWidth: headerMinWidths.service }}>
                        <Typography sx={{ lineHeight: 1.3, color: '#0f172a' }}>
                          {row.service}
                        </Typography>
                      </TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #edf2f7', minWidth: headerMinWidths.currentRate }}>
                      <Typography fontWeight={700} color="#0f172a">
                        {formatCurrency(row.currentRate)}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #edf2f7', minWidth: headerMinWidths.proposedUnitPrice }}>
                      <Typography fontWeight={700} color="#0f172a">
                        {formatCurrency(row.proposedUnitPrice)}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #edf2f7', minWidth: headerMinWidths.proposedVolume }}>
                      <Typography fontWeight={700} color="#0f172a">
                        {row.proposedVolume}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #edf2f7', minWidth: headerMinWidths.proposedAmount }}>
                      <Typography fontWeight={800} color="#0f172a">
                        ৳ {row.proposedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #edf2f7', minWidth: headerMinWidths.currentUnitCost }}>
                      <Typography fontWeight={700} color="#0f172a">
                        {formatCurrency(row.currentUnitCost)}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #edf2f7', minWidth: headerMinWidths.currentQuantity }}>
                      <Typography fontWeight={700} color="#0f172a">
                        {row.currentQuantity}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #edf2f7', minWidth: headerMinWidths.currentInvoice }}>
                      <Typography fontWeight={700} color="#0f172a">
                        {formatCurrency(row.currentInvoice)}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #edf2f7', minWidth: headerMinWidths.invoiceDifference }}>
                      <Typography
                        fontWeight={800}
                        sx={{
                          color: row.invoiceDifference > 0 ? '#16a34a' : row.invoiceDifference < 0 ? '#dc2626' : '#0f172a',
                        }}
                      >
                        {formatCurrency(row.invoiceDifference)}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #edf2f7', minWidth: headerMinWidths.itemStatus }}>
                      <Chip
                        label={row.itemStatus}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: statusMeta.bgcolor,
                          color: statusMeta.color,
                          border: `1px solid ${statusMeta.borderColor}`,
                          borderRadius: '999px',
                          '& .MuiChip-icon': { color: statusMeta.color },
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #edf2f7', minWidth: headerMinWidths.currentLevel }}>
                      <Chip
                        label={row.currentLevel}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          borderRadius: '999px',
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #edf2f7', minWidth: headerMinWidths.effectiveDate }}>
                      <Typography fontWeight={700} color="#0f172a">
                        {formatDate(row.effectiveDate)}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ borderBottom: '1px solid #edf2f7', minWidth: headerMinWidths.requestedBy }}>
                      <Typography fontWeight={700} color="#0f172a">
                        {row.requestedBy}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        borderBottom: '1px solid #edf2f7',
                        minWidth: headerMinWidths.actions,
                        position: isMobile ? 'static' : 'sticky',
                        right: isMobile ? 'auto' : 0,
                        bgcolor: index % 2 === 0 ? '#fff' : '#fafcff',
                        zIndex: isMobile ? 1 : 1,
                      }}
                    >
                      <Button
                        variant="contained"
                        sx={{
                          width: { xs: '100%', sm: 'auto' },
                          textTransform: 'none',
                          fontWeight: 700,
                          borderRadius: '999px',
                          bgcolor: '#7c3aed',
                          color: '#fff',
                          px: 2,
                          minWidth: 130,
                          boxShadow: '0 8px 18px rgba(124,58,237,0.18)',
                          '&:hover': { bgcolor: '#6d28d9' },
                        }}
                      >
                        Posted in CRM
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={rows.length}
          page={safePage}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count}`}
          sx={{
            borderTop: '1px solid #e2e8f0',
            '& .MuiTablePagination-toolbar': {
              minHeight: 56,
              px: { xs: 1.5, sm: 2 },
            },
            '& .MuiTablePagination-spacer': {
              flex: '1 1 auto',
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              color: '#0f172a',
              fontSize: 14,
              fontWeight: 500,
            },
            '& .MuiTablePagination-select': {
              fontSize: 14,
            },
          }}
        />
        </>
      )}
    </Paper>
  );
}
