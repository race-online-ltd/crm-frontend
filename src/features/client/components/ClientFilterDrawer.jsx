import React, { useMemo } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AppDrawer from '../../../components/shared/AppDrawer';
import { fieldSx } from '../../../components/shared/SelectDropdownSingle';

const DEFAULT_LICENCE_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Expire', label: 'Expire' },
  { value: 'Pending', label: 'Pending' },
  { value: 'None', label: 'None' },
];

const DEFAULT_FILTERS = {
  business_entity_id: '',
  division_id: '',
  licence: '',
};

function SelectField({ label, value, onChange, options, ariaLabel }) {
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
        <MenuItem key={option.id ?? option.value} value={option.id ?? option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default function ClientFilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onApply,
  onReset,
  businessEntityOptions = [],
  divisionOptions = [],
}) {
  const values = useMemo(() => ({
    ...DEFAULT_FILTERS,
    ...(filters || {}),
  }), [filters]);

  const handleChange = (field) => (event) => {
    onChange?.(field, event.target.value);
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
      open={open}
      onClose={onClose}
      title="Filters"
      width={420}
      footerActions={footerActions}
      paperProps={{ role: 'dialog', 'aria-label': 'Client filters' }}
    >
      <Stack spacing={2.25}>
        <Box>
          <SelectField
            label="Business Entity"
            value={values.business_entity_id}
            onChange={handleChange('business_entity_id')}
            options={businessEntityOptions}
            ariaLabel="Filter by business entity"
          />
        </Box>

        <Box>
          <SelectField
            label="Division"
            value={values.division_id}
            onChange={handleChange('division_id')}
            options={divisionOptions}
            ariaLabel="Filter by division"
          />
        </Box>

        <Box>
          <SelectField
            label="Licence"
            value={values.licence}
            onChange={handleChange('licence')}
            options={DEFAULT_LICENCE_OPTIONS}
            ariaLabel="Filter by licence"
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
          <Button
            variant="text"
            onClick={onReset}
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
