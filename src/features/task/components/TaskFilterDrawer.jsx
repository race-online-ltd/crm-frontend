import React, { useMemo } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import AppDrawer from '../../../components/shared/AppDrawer';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import DatePickerField from '../../../components/shared/DatePickerField';

const STATUS_OPTIONS = [
  { id: '', label: 'All Statuses' },
  { id: 'pending', label: 'Pending' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function TaskFilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onApply,
  onReset,
  taskTypeOptions = [],
}) {
  const statusFetchOptions = useMemo(() => async () => STATUS_OPTIONS, []);
  const taskTypeFetchOptions = useMemo(() => async () => [
    { id: '', label: 'All Task Types' },
    ...taskTypeOptions,
  ], [taskTypeOptions]);

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title="Filters"
      width={420}
      footerActions={(
        <Stack direction="row" spacing={1.25}>
          <Button
            variant="outlined"
            onClick={onReset}
            fullWidth
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              px: 2.5,
              py: 1.2,
              borderColor: '#e2e8f0',
              color: '#475569',
            }}
          >
            Reset
          </Button>
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
            Apply
          </Button>
        </Stack>
      )}
    >
      <Stack spacing={2.25}>
        <Box>
         
          <SelectDropdownSingle
            name="taskTypeId"
            label="Task Type"
            fetchOptions={taskTypeFetchOptions}
            value={filters.taskTypeId || ''}
            onChange={(id) => onChange('taskTypeId', id)}
          />
        </Box>

        <Box>
         
          <SelectDropdownSingle
            name="status"
            label="Status"
            fetchOptions={statusFetchOptions}
            value={filters.status || ''}
            onChange={(id) => onChange('status', id)}
          />
        </Box>

        <Box>
          <Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ mb: 1 }}>
            Scheduled Date
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <DatePickerField
              label="From"
              value={filters.dateFrom}
              onChange={(value) => onChange('dateFrom', value ? new Date(value).toISOString() : null)}
            />
            <DatePickerField
              label="To"
              value={filters.dateTo}
              onChange={(value) => onChange('dateTo', value ? new Date(value).toISOString() : null)}
            />
          </Stack>
        </Box>
      </Stack>
    </AppDrawer>
  );
}
