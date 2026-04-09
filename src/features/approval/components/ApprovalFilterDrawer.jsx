import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import AppDrawer from '../../../components/shared/AppDrawer';
import SelectDropdownMultiple from '../../../components/shared/SelectDropdownMultiple';

export default function ApprovalFilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onApply,
  onReset,
  kamOptions,
}) {
  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title="Filters"
      width={420}
      footerActions={(
        <Button
          variant="contained"
          onClick={onApply}
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
      )}
    >
      <Stack spacing={2.25}>
        <Box>
          <Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ mb: 1 }}>
            KAM
          </Typography>
          <SelectDropdownMultiple
            name="kam"
            label="Select KAM"
            options={kamOptions}
            value={filters.kam || []}
            onChange={(value) => onChange('kam', value)}
            limitTags={4}
            placeholder="Select KAM"
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
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
