import React from 'react';
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import OrbitLoader from '@/components/shared/OrbitLoader';

function isEmptyValue(value) {
  return value === null || value === undefined || value === '';
}

function formatDate(value) {
  if (isEmptyValue(value)) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function StatusChip({ value }) {
  const status = String(value || '').toLowerCase();
  const style = status === 'active'
    ? { bg: '#dcfce7', color: '#166534' }
    : { bg: '#fee2e2', color: '#b91c1c' };

  return (
    <Chip
      label={value || 'N/A'}
      size="small"
      sx={{
        height: 24,
        borderRadius: '999px',
        bgcolor: style.bg,
        color: style.color,
        fontWeight: 700,
        fontSize: 11,
        '& .MuiChip-label': {
          px: 1,
        },
      }}
    />
  );
}

function getDisplayValue(value, column) {
  if (column?.render) {
    return null;
  }

  switch (column?.type) {
    case 'date':
      return formatDate(value);
    case 'status':
      return <StatusChip value={value} />;
    default:
      return isEmptyValue(value) ? 'N/A' : value;
  }
}

export default function ClientsTable({
  data = [],
  columns = [],
  loading = false,
  pagination,
}) {
  const rows = Array.isArray(data) ? data : [];
  const visibleRows = pagination?.paginatedData || rows;
  const rowsPerPageOptions = pagination?.rowsPerPageOptions || [5, 10, 25];

  const minTableWidth = Math.max(
    1400,
    columns.reduce((sum, column) => sum + (column.minWidth || 140), 0),
  );

  return (
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
      {loading ? (
        <OrbitLoader
          title="Loading clients"
          subtitle="Fetching client records and contact details."
          minHeight={260}
        />
      ) : (
        <>
          <TableContainer
            sx={{
              overflowX: 'auto',
              maxHeight: 'calc(100vh - 240px)',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <Table
              stickyHeader
              aria-label="Clients data table"
              sx={{ minWidth: minTableWidth }}
            >
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      component="th"
                      scope="col"
                      aria-label={column.ariaLabel || column.header}
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
                        minWidth: column.minWidth || 140,
                        maxWidth: column.maxWidth || column.minWidth || 180,
                        py: 1.4,
                      }}
                    >
                      {column.header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {visibleRows.length ? (
                  visibleRows.map((row, rowIndex) => (
                    <TableRow
                      key={row.id || rowIndex}
                      hover
                      sx={{
                        bgcolor: rowIndex % 2 === 0 ? '#fff' : '#fafcff',
                        '&:hover': { bgcolor: '#f4f8ff' },
                      }}
                    >
                  {columns.map((column) => {
                    const value = row[column.key];
                    const rendered = column.render ? column.render(value, row) : getDisplayValue(value, column);

                        return (
                          <TableCell
                            key={column.key}
                            sx={{
                              verticalAlign: 'middle',
                              borderBottom: '1px solid #eef2f7',
                              color: '#0f172a',
                              fontSize: 13,
                              py: 1.4,
                              minWidth: column.minWidth || 140,
                              maxWidth: column.maxWidth || column.minWidth || 180,
                              whiteSpace: column.wrap === false ? 'nowrap' : 'normal',
                              wordBreak: column.wrap === false ? 'normal' : 'break-word',
                            }}
                          >
                            {rendered ?? 'N/A'}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} sx={{ py: 8, textAlign: 'center' }}>
                      <Typography fontWeight={700} color="#64748b">
                        No clients found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination ? (
            <TablePagination
              component="div"
              count={pagination.count ?? rows.length}
              page={pagination.page ?? 0}
              onPageChange={pagination.onPageChange}
              rowsPerPage={pagination.rowsPerPage ?? 10}
              onRowsPerPageChange={pagination.onRowsPerPageChange}
              rowsPerPageOptions={rowsPerPageOptions}
              labelRowsPerPage="Rows per page:"
              labelDisplayedRows={({ from, to, count: totalCount }) => `${from}–${to} of ${totalCount}`}
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
          ) : null}
        </>
      )}
    </Paper>
  );
}
