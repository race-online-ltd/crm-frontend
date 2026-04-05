// src/features/target/components/MonthPickerField.jsx
// A month-only picker field following the same pattern as DatePickerField.
// Uses MUI DatePicker with views limited to ['year', 'month'] and openTo="month".
// If your project already uses @mui/x-date-pickers, this drops in seamlessly.

import React, { useState } from 'react';
import { DatePicker }      from '@mui/x-date-pickers/DatePicker';
import CalendarMonthIcon   from '@mui/icons-material/CalendarMonth';

/**
 * MonthPickerField
 * @param {string}    label
 * @param {Date|null} value
 * @param {Function}  onChange    — called with (Date | null)
 * @param {boolean}   error
 * @param {string}    helperText
 * @param {boolean}   disablePast — prevents selecting past months
 */
export default function MonthPickerField({
  label      = 'Target Month',
  value      = null,
  onChange,
  error      = false,
  helperText = ' ',
  disablePast = false,
}) {
  const [open, setOpen] = useState(false);

  return (
    <DatePicker
      open={open}
      label={label}
      value={value}
      onChange={(newValue) => {
        onChange?.(newValue);
      }}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      views={['year', 'month']}
      openTo="month"
      disablePast={disablePast}
      slotProps={{
        textField: {
          fullWidth:  true,
          size:       'small',
            error:      error,
            helperText: helperText,
            onClick: () => setOpen(true),
            InputProps: {
              sx: {
                borderRadius: '8px',
                fontSize:     '0.875rem',
              },
            },
            sx: {
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              fontSize:     '0.875rem',
              '& fieldset':        { borderColor: '#e2e8f0' },
              '&:hover fieldset':  { borderColor: '#94a3b8' },
              '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: 2 },
              '&.Mui-error fieldset':   { borderColor: '#ef4444' },
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.875rem',
              '&.Mui-focused': { color: '#2563eb' },
              '&.Mui-error':   { color: '#ef4444' },
            },
            '& .MuiFormHelperText-root': {
              mx: 0,
              '&.Mui-error': { color: '#ef4444' },
            },
          },
        },
        openPickerIcon: {
          component: () => (
            <CalendarMonthIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
          ),
        },
      }}
    />
  );
}
