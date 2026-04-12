import React from 'react';
import {
  Box,
  IconButton,
  MenuItem,
  Stack,
  TableCell,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import DatePickerField from '@/components/shared/DatePickerField';

const UNIT_OPTIONS = ['MB', 'Unit', 'GB', 'Month'];

function formatCurrency(value) {
  if (value === '' || value === null || value === undefined) return '—';
  const number = Number(value);
  if (Number.isNaN(number)) return '—';
  return `৳ ${number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function NumberField({ value, onChange, placeholder, sx }) {
  return (
    <TextField
      size="small"
      type="number"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      inputProps={{ min: 0, step: '0.01' }}
      sx={sx}
      fullWidth
    />
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

function ReadOnlyValue({ value, tone = '#0f172a' }) {
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

export default function ProposalRow({ row, onChange, onDelete }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const currentUnitBasedDiff = row.unitBasedInvoiceDifference ?? (Number(row.proposePrice || 0) - Number(row.currentPrice || 0));
  const proposedAmount = row.proposedAmount ?? (Number(row.proposePrice || 0) * Number(row.proposeVolume || 0));
  const currentUnitInvoice = row.currentUnitInvoice ?? row.currentPrice;
  const currentTotalInvoice = row.currentTotalInvoice ?? (Number(row.currentPrice || 0) * Number(row.currentVolume || 0));
  const newTotalInvoice = row.newTotalInvoice ?? proposedAmount;
  const invoiceDifference = row.invoiceDifference ?? (newTotalInvoice - currentTotalInvoice);

  const handleNumberChange = (key) => (value) => {
    onChange(row.id, key, value);
  };

  const handleUnitChange = (event) => {
    onChange(row.id, 'priceUnit', event.target.value);
  };

  return (
    <TableRow
      hover
      sx={{
        '&:nth-of-type(even)': { bgcolor: '#fafcff' },
        '&:hover': { bgcolor: '#f8fbff' },
      }}
    >
      <TableCell sx={{ minWidth: 170, px: 1.25 }}>
        <Typography fontWeight={700} color="#0f172a" sx={{ lineHeight: 1.25 }}>
          {row.productLabel}
        </Typography>
      </TableCell>

      <TableCell sx={{ minWidth: 150, px: 1.25 }}>
        <Typography fontWeight={700} color="#0f172a">
          {row.serviceId}
        </Typography>
      </TableCell>

      <TableCell sx={{ minWidth: 135, px: 1.25 }}>
        <ReadOnlyValue value={formatCurrency(row.currentPrice)} tone="#475569" />
      </TableCell>

      <TableCell sx={{ minWidth: 110, px: 1.25 }}>
        <ReadOnlyValue value={row.currentVolume} tone="#475569" />
      </TableCell>

      <TableCell sx={{ minWidth: 180, px: 1.25 }}>
        <Stack direction="row" spacing={0} sx={{ width: '100%' }}>
          <Box sx={{ flex: 1 }}>
            <NumberField
              value={row.proposePrice}
              onChange={handleNumberChange('proposePrice')}
              placeholder="Price"
              sx={{
                ...editableFieldSx,
                '& .MuiOutlinedInput-root': {
                  ...editableFieldSx['& .MuiOutlinedInput-root'],
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            />
          </Box>
          <TextField
            select
            size="small"
            value={row.priceUnit}
            onChange={handleUnitChange}
            sx={{
              width: 82,
              ...editableFieldSx,
              '& .MuiOutlinedInput-root': {
                ...editableFieldSx['& .MuiOutlinedInput-root'],
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                ml: '-1px',
              },
            }}
          >
            {UNIT_OPTIONS.map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </TableCell>

      <TableCell sx={{ minWidth: 120, px: 1.25 }}>
        <NumberField
          value={row.proposeVolume}
          onChange={handleNumberChange('proposeVolume')}
          placeholder="Volume"
          sx={editableFieldSx}
        />
      </TableCell>

      <TableCell sx={{ minWidth: 145, px: 1.25 }}>
        <ReadOnlyValue value={formatCurrency(proposedAmount)} />
      </TableCell>

      <TableCell sx={{ minWidth: 145, px: 1.25 }}>
        <ReadOnlyValue value={formatCurrency(currentUnitInvoice)} tone="#64748b" />
      </TableCell>

      <TableCell sx={{ minWidth: 160, px: 1.25 }}>
        <ReadOnlyValue
          value={formatCurrency(currentUnitBasedDiff)}
          tone={currentUnitBasedDiff >= 0 ? '#16a34a' : '#dc2626'}
        />
      </TableCell>

      <TableCell sx={{ minWidth: 145, px: 1.25 }}>
        <ReadOnlyValue value={formatCurrency(currentTotalInvoice)} tone="#64748b" />
      </TableCell>

      <TableCell sx={{ minWidth: 145, px: 1.25 }}>
        <ReadOnlyValue value={formatCurrency(newTotalInvoice)} tone="#0f172a" />
      </TableCell>

      <TableCell sx={{ minWidth: 155, px: 1.25 }}>
        <ReadOnlyValue
          value={formatCurrency(invoiceDifference)}
          tone={invoiceDifference >= 0 ? '#16a34a' : '#dc2626'}
        />
      </TableCell>

      <TableCell sx={{ minWidth: 150, px: 1.25 }}>
        <DatePickerField
          label="Effective Date"
          value={row.effectiveDate}
          onChange={(value) => onChange(row.id, 'effectiveDate', value)}
          fullWidth
          sx={{
            ...editableFieldSx,
            '& .MuiOutlinedInput-root': {
              ...editableFieldSx['& .MuiOutlinedInput-root'],
              borderRadius: '8px',
              bgcolor: '#fff',
            },
            '& .MuiInputAdornment-root': {
              mr: 0.5,
            },
            '& .MuiInputBase-input': {
              fontSize: '0.8125rem',
              py: 0,
            },
          }}
        />
      </TableCell>

      <TableCell
        sx={{
          minWidth: 84,
          position: isMobile ? 'static' : 'sticky',
          right: isMobile ? 'auto' : 0,
          bgcolor: '#fff',
          zIndex: 1,
          px: 1.25,
        }}
      >
        <IconButton
          onClick={() => onDelete(row.id)}
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
  );
}
