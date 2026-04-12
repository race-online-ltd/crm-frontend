import React, { useMemo, useState } from 'react';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import AppDrawer from '@/components/shared/AppDrawer';
import { fieldSx } from '@/components/shared/SelectDropdownSingle';

const DEFAULT_VALUES = {
  status: '',
  filterBy: '',
  kam: '',
  product: '',
};

function FilterSelect({ label, value, onChange, options, ariaLabel }) {
  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      value={value}
      onChange={onChange}
      inputProps={{ 'aria-label': ariaLabel || label }}
      sx={fieldSx(45)}
    >
      <MenuItem value="">
        <em>All</em>
      </MenuItem>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default function FilterDrawer({
  isOpen,
  onClose,
  onApply,
  onReset,
  initialValues,
  statusOptions = [],
  filterByOptions = [],
  kamOptions = [],
  productOptions = [],
}) {
  const [values, setValues] = useState(() => ({ ...DEFAULT_VALUES, ...(initialValues || {}) }));

  const handleChange = (key) => (event) => {
    const nextValue = event.target.value;
    setValues((prev) => ({ ...prev, [key]: nextValue }));
  };

  const footerActions = useMemo(() => (
    <Button
      variant="contained"
      onClick={() => onApply?.(values)}
      fullWidth
      sx={{
        textTransform: 'none',
        fontWeight: 700,
        borderRadius: '10px',
        px: 2.5,
        py: 1.2,
        bgcolor: '#2563eb',
        '&:hover': { bgcolor: '#1d4ed8' },
      }}
    >
      Apply Filters
    </Button>
  ), [onApply, values]);

  return (
    <AppDrawer
      open={isOpen}
      onClose={onClose}
      title="Filters"
      width={420}
      footerActions={footerActions}
      paperProps={{ role: 'dialog', 'aria-label': 'Price history filters' }}
    >
      <Stack spacing={2.25}>
        <Box>
          <Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ mb: 1 }}>
            Status
          </Typography>
          <FilterSelect
            label="Status"
            value={values.status}
            onChange={handleChange('status')}
            options={statusOptions}
            ariaLabel="Filter by status"
          />
        </Box>

        <Box>
          <Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ mb: 1 }}>
            Filter By
          </Typography>
          <FilterSelect
            label="Filter By"
            value={values.filterBy}
            onChange={handleChange('filterBy')}
            options={filterByOptions}
            ariaLabel="Filter by category"
          />
        </Box>

        <Box>
          <Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ mb: 1 }}>
            KAM
          </Typography>
          <FilterSelect
            label="KAM"
            value={values.kam}
            onChange={handleChange('kam')}
            options={kamOptions}
            ariaLabel="Filter by KAM"
          />
        </Box>

        <Box>
          <Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ mb: 1 }}>
            Product
          </Typography>
          <FilterSelect
            label="Product"
            value={values.product}
            onChange={handleChange('product')}
            options={productOptions}
            ariaLabel="Filter by product"
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
          <Button
            variant="text"
            onClick={() => {
              setValues({ ...DEFAULT_VALUES });
              onReset?.();
            }}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              color: '#ef4444',
              '&:hover': { bgcolor: 'rgba(239,68,68,0.06)' },
            }}
          >
            Clear All Filters
          </Button>
        </Box>
      </Stack>
    </AppDrawer>
  );
}
