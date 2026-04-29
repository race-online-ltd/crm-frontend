import React, { useMemo } from 'react';
import { Box, Button, MenuItem, Stack, TextField } from '@mui/material';
import AppDrawer from '../../../components/shared/AppDrawer';
import DatePickerField from '../../../components/shared/DatePickerField';
import { fieldSx } from '../../../components/shared/SelectDropdownSingle';

const DEFAULT_FILTERS = {
  business_entity_id: '',
  group_id: '',
  team_id: '',
  kam_id: '',
  date_from: null,
  date_to: null,
};

export default function LeadFilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onApply,
  onReset,
  businessEntityOptions = [],
  groupOptions = [],
  teamOptions = [],
  kamOptions = [],
}) {
  const values = useMemo(() => ({
    ...DEFAULT_FILTERS,
    ...(filters || {}),
  }), [filters]);

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

  const handleSelectChange = (field) => (event) => {
    onChange?.(field, event.target.value);
  };

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title="Lead Filters"
      width={420}
      footerActions={footerActions}
      paperProps={{ role: 'dialog', 'aria-label': 'Lead filters' }}
    >
      <Stack spacing={2.25}>
        <Box>
          <TextField
            select
            fullWidth
            size="small"
            label="Business Entity"
            value={values.business_entity_id}
            onChange={handleSelectChange('business_entity_id')}
            inputProps={{ 'aria-label': 'Filter by business entity' }}
            sx={fieldSx(45)}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {businessEntityOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box>
          <TextField
            select
            fullWidth
            size="small"
            label="Group"
            value={values.group_id}
            onChange={handleSelectChange('group_id')}
            inputProps={{ 'aria-label': 'Filter by group' }}
            sx={fieldSx(45)}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {groupOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box>
          <TextField
            select
            fullWidth
            size="small"
            label="Team"
            value={values.team_id}
            onChange={handleSelectChange('team_id')}
            inputProps={{ 'aria-label': 'Filter by team' }}
            sx={fieldSx(45)}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {teamOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box>
          <TextField
            select
            fullWidth
            size="small"
            label="KAM"
            value={values.kam_id}
            onChange={handleSelectChange('kam_id')}
            inputProps={{ 'aria-label': 'Filter by KAM' }}
            sx={fieldSx(45)}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {kamOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Stack direction="row" spacing={2}>
          <DatePickerField
            label="From Date"
            value={values.date_from}
            onChange={(value) => onChange?.('date_from', value)}
            helperText=" "
          />
          <DatePickerField
            label="To Date"
            value={values.date_to}
            onChange={(value) => onChange?.('date_to', value)}
            helperText=" "
          />
        </Stack>

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
