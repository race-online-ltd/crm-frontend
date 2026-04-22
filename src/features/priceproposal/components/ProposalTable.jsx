import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import DatePickerField from '@/components/shared/DatePickerField';

function formatCurrency(value) {
  if (value === '' || value === null || value === undefined) return '—';
  const number = Number(value);
  if (Number.isNaN(number)) return '—';
  return `৳ ${number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function SectionCard({ title, description, action, children, emptyText, minWidth = 0 }) {
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth,
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={2}
        sx={{ p: { xs: 2, sm: 2.25 }, borderBottom: '1px solid #e2e8f0' }}
      >
        <Box>
          <Typography variant="h6" fontWeight={800} color="#0f172a">
            {title}
          </Typography>
          <Typography variant="body2" color="#64748b" sx={{ mt: 0.4 }}>
            {description}
          </Typography>
        </Box>
        {action}
      </Stack>

      {children || (
        <Box sx={{ px: 2.5, py: 6, textAlign: 'center' }}>
          <Typography fontWeight={700} color="#64748b">
            {emptyText}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

function ReadOnlyCell({ value, tone = '#0f172a' }) {
  return (
    <Box
      sx={{
        minHeight: 36,
        px: 1,
        py: 0.75,
        borderRadius: '8px',
        bgcolor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Typography fontWeight={700} color={tone} sx={{ lineHeight: 1.2 }}>
        {value}
      </Typography>
    </Box>
  );
}

const editableFieldSx = {
  '& .MuiOutlinedInput-root': {
    height: 38,
    borderRadius: '8px',
    bgcolor: '#fff',
    '& fieldset': {
      borderColor: '#dbe4ef',
      borderWidth: 1,
    },
    '&:hover fieldset': {
      borderColor: '#93c5fd',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563eb',
      borderWidth: 1,
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.8125rem',
    py: 0,
  },
};

function ExistingTable({ rows }) {
  const columns = ['Product', 'Service ID', 'Current Price', 'Current Volume', 'Current Unit Invoice', 'Current Total Invoice'];

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 760 }}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column}
                sx={{
                  px: 1.5,
                  py: 1.25,
                  bgcolor: '#f8fafc',
                  color: '#64748b',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 0.7,
                  textTransform: 'uppercase',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#fafcff' } }}>
              <TableCell sx={{ minWidth: 170, px: 1.5 }}>
                <Typography fontWeight={700} color="#0f172a">{row.productLabel}</Typography>
              </TableCell>
              <TableCell sx={{ minWidth: 160, px: 1.5 }}>
                <Typography fontWeight={700} color="#0f172a">{row.serviceId}</Typography>
              </TableCell>
              <TableCell sx={{ minWidth: 120, px: 1.5 }}>
                <ReadOnlyCell value={formatCurrency(row.currentPrice)} tone="#475569" />
              </TableCell>
              <TableCell sx={{ minWidth: 110, px: 1.5 }}>
                <ReadOnlyCell value={row.currentVolume} tone="#475569" />
              </TableCell>
              <TableCell sx={{ minWidth: 140, px: 1.5 }}>
                <ReadOnlyCell value={formatCurrency(row.currentUnitInvoice)} tone="#475569" />
              </TableCell>
              <TableCell sx={{ minWidth: 150, px: 1.5 }}>
                <ReadOnlyCell value={formatCurrency(row.currentTotalInvoice)} tone="#475569" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ProposalInputTable({ rows, onChangeRow, onDeleteRow }) {
  const columns = ['Propose Price', 'Propose Volume', 'Proposed Amount', 'Effective Date', 'Actions'];

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column}
                sx={{
                  px: 1.5,
                  py: 1.25,
                  bgcolor: '#f8fafc',
                  color: '#64748b',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 0.7,
                  textTransform: 'uppercase',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#fafcff' } }}>
              <TableCell sx={{ minWidth: 120, px: 1.5 }}>
                <TextField
                  size="small"
                  type="number"
                  value={row.proposePrice}
                  onChange={(event) => onChangeRow(row.id, 'proposePrice', event.target.value)}
                  inputProps={{ min: 0, step: '0.01' }}
                  sx={editableFieldSx}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ minWidth: 120, px: 1.5 }}>
                <TextField
                  size="small"
                  type="number"
                  value={row.proposeVolume}
                  onChange={(event) => onChangeRow(row.id, 'proposeVolume', event.target.value)}
                  inputProps={{ min: 0, step: '0.01' }}
                  sx={editableFieldSx}
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ minWidth: 140, px: 1.5 }}>
                <ReadOnlyCell value={formatCurrency(row.proposedAmount)} />
              </TableCell>
              <TableCell sx={{ minWidth: 170, px: 1.5 }}>
                <DatePickerField
                  label="Effective Date"
                  value={row.effectiveDate}
                  onChange={(value) => onChangeRow(row.id, 'effectiveDate', value)}
                  fullWidth
                  sx={{
                    ...editableFieldSx,
                    '& .MuiOutlinedInput-root': {
                      ...editableFieldSx['& .MuiOutlinedInput-root'],
                      borderRadius: '8px',
                      bgcolor: '#fff',
                    },
                  }}
                />
              </TableCell>
              <TableCell sx={{ minWidth: 84, px: 1.5 }}>
                <IconButton
                  onClick={() => onDeleteRow(row.id)}
                  size="small"
                  sx={{
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    bgcolor: '#fff1f2',
                    '&:hover': { bgcolor: '#ffe4e6' },
                  }}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ComparisonTable({ rows }) {
  const columns = ['Product', 'Service ID', 'Unit Based Invoice Difference', 'Invoice Difference'];

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column}
                sx={{
                  px: 1.5,
                  py: 1.25,
                  bgcolor: '#f8fafc',
                  color: '#64748b',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 0.7,
                  textTransform: 'uppercase',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#fafcff' } }}>
              <TableCell sx={{ minWidth: 170, px: 1.5 }}>
                <Typography fontWeight={700} color="#0f172a">{row.productLabel}</Typography>
              </TableCell>
              <TableCell sx={{ minWidth: 160, px: 1.5 }}>
                <Typography fontWeight={700} color="#0f172a">{row.serviceId}</Typography>
              </TableCell>
              <TableCell sx={{ minWidth: 190, px: 1.5 }}>
                <ReadOnlyCell
                  value={formatCurrency(row.unitBasedInvoiceDifference)}
                  tone={row.unitBasedInvoiceDifference >= 0 ? '#16a34a' : '#dc2626'}
                />
              </TableCell>
              <TableCell sx={{ minWidth: 170, px: 1.5 }}>
                <ReadOnlyCell
                  value={formatCurrency(row.invoiceDifference)}
                  tone={row.invoiceDifference >= 0 ? '#16a34a' : '#dc2626'}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function ProposalTable({
  existingRows,
  proposalRows,
  comparisonRows,
  canCreateNew,
  onCreateNew,
  onChangeRow,
  onDeleteRow,
}) {
  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems="stretch"
      >
        <SectionCard
          title="Existing Invoice"
          description="Current invoice data from the selected client, product, and service."
          emptyText="No existing invoice found for this selection."
          minWidth={0}
        >
          {existingRows.length ? <ExistingTable rows={existingRows} /> : null}
        </SectionCard>

        <SectionCard
          title="New Proposal"
          description="Create or edit the proposed pricing for the selected service."
          emptyText="Select a service, then use Create New to start a proposal row."
          minWidth={0}
          action={(
            <Button
              variant="contained"
              onClick={onCreateNew}
              disabled={!canCreateNew}
              startIcon={<AddRoundedIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '10px',
                bgcolor: '#2563eb',
                boxShadow: '0 8px 18px rgba(37,99,235,0.18)',
                '&:hover': {
                  bgcolor: '#1d4ed8',
                  boxShadow: '0 10px 22px rgba(37,99,235,0.22)',
                },
              }}
            >
              Create New
            </Button>
          )}
        >
          {proposalRows.length ? (
            <ProposalInputTable
              rows={proposalRows}
              onChangeRow={onChangeRow}
              onDeleteRow={onDeleteRow}
            />
          ) : null}
        </SectionCard>
      </Stack>

      <SectionCard
        title="Comparison"
        description="Compare current invoice values against the new proposal."
        emptyText="Add a proposal row to see the invoice comparison."
      >
        {comparisonRows.length ? <ComparisonTable rows={comparisonRows} /> : null}
      </SectionCard>
    </Stack>
  );
}
