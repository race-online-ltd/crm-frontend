// DateRangePickerField.jsx
import React from 'react';
import { TextField, Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

export default function DateRangePickerField({
  startValue,
  endValue,
  onChange,
  label = 'Date Range',
  disabled = false,
}) {
  const handleStartChange = (date) => {
    onChange({ start: date ? date.toISOString() : null, end: endValue });
  };

  const handleEndChange = (date) => {
    onChange({ start: startValue, end: date ? date.toISOString() : null });
  };

  return (
    <Box display="flex" gap={2}>
      <DatePicker
        label={`${label} Start`}
        value={startValue ? dayjs(startValue) : null}
        onChange={handleStartChange}
        disabled={disabled}
        renderInput={(params) => <TextField {...params} fullWidth />}
      />
      <DatePicker
        label={`${label} End`}
        value={endValue ? dayjs(endValue) : null}
        onChange={handleEndChange}
        disabled={disabled}
        renderInput={(params) => <TextField {...params} fullWidth />}
      />
    </Box>
  );
}
