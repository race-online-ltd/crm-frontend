import React from 'react';
import {
  Box,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ProposalRow from './ProposalRow';

const columns = [
  'Product',
  'Service ID',
  'Current Price',
  'Current Volume',
  'Propose Price',
  'Propose Volume',
  'Proposed Amount',
  'Current Unit Invoice',
  'Unit Based Invoice Difference',
  'Current Total Invoice',
  'New Total Invoice',
  'Invoice Difference',
  'Effective Date',
  'Actions',
];

export default function ProposalTable({ rows, onChangeRow, onDeleteRow }) {
  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 2.5 }, borderBottom: '1px solid #e2e8f0' }}>
        <Stack spacing={0.3}>
          <Typography variant="h6" fontWeight={800} color="#0f172a">
            Dynamic Pricing Table
          </Typography>
          <Typography variant="body2" color="#64748b">
            Update proposal values and dates for each auto-generated service row.
          </Typography>
        </Stack>
      </Box>

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table stickyHeader sx={{ minWidth: 1850 }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column}
                  sx={{
                    px: 1.25,
                    py: 1.25,
                    bgcolor: '#f8fafc',
                    color: '#64748b',
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    borderBottom: '1px solid #e2e8f0',
                    verticalAlign: 'middle',
                    maxWidth: 140,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      lineHeight: 1.2,
                    }}
                  >
                    {column}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <ProposalRow
                  key={row.id}
                  row={row}
                  onChange={onChangeRow}
                  onDelete={onDeleteRow}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ py: 6, textAlign: 'center' }}>
                  <Typography fontWeight={700} color="#64748b">
                    Select a client and products to generate proposal rows.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
