import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { format, parseISO, isValid } from 'date-fns';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  GlobalStyles,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from '@mui/icons-material/Close';
import { fieldSx } from './SelectDropdownSingle';
import "react-datepicker/dist/react-datepicker.css";

const FIELD_HEIGHT = 45;

// ─── Custom Input (MUI TextField) ─────────────────────────────────────────────
const CustomInput = forwardRef(
  ({ value, onClick, onClear, label, error, helperText, disabled, readOnly }, ref) => (
    <TextField
      fullWidth
      size="small"
      label={label}
      value={value || ''}
      onClick={onClick}
      inputRef={ref}
      error={error}
      helperText={helperText}
      inputProps={{ readOnly: true }}
      disabled={disabled}
      sx={{
        cursor: disabled || readOnly ? 'default' : 'pointer',
        ...fieldSx(FIELD_HEIGHT),
        '& .MuiInputBase-input': {
          cursor: disabled || readOnly ? 'default' : 'pointer',
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <CalendarMonthIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation(); // Prevent opening calendar when clearing
                onClear();
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  )
);

// ─── Main Month Picker Component ──────────────────────────────────────────────
export default function MonthPicker({
  label = 'Select Month',
  value, // Expects YYYY-MM-DD string or Date object
  onChange,
  disabled = false,
  readOnly = false,
  error = false,
  helperText = '',
  formatStr = 'MM/yyyy',
}) {
  
  // Safely parse the incoming value to a Date object
  const selectedDate = React.useMemo(() => {
    if (!value) return null;
    const d = typeof value === 'string' ? parseISO(value) : value;
    return isValid(d) ? d : null;
  }, [value]);

  const displayValue = selectedDate ? format(selectedDate, formatStr) : '';

  return (
    <Box sx={{ width: '100%' }}>
      <GlobalStyles
        styles={{
          '.react-datepicker': {
            fontFamily: 'inherit',
            border: '1px solid #ccc',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
          '.react-datepicker__header': {
            backgroundColor: '#f3f4f6',
            borderBottom: '1px solid #e5e7eb',
            padding: '10px 0',
          },
          '.react-datepicker__current-month': {
            fontSize: '1rem',
            fontWeight: '700',
            color: '#1e293b',
          },
          '.react-datepicker__month-text': {
            width: '4.5rem !important',
            padding: '10px 0 !important',
            margin: '4px !important',
            borderRadius: '4px !important',
            transition: 'all 0.2s',
          },
          '.react-datepicker__month-text--selected': {
            backgroundColor: '#1d70b8 !important',
            color: '#fff !important',
            borderRadius: '20px !important', 
            fontWeight: '600',
          },
          '.react-datepicker__month-text:hover': {
            backgroundColor: '#e2e8f0 !important',
            borderRadius: '20px !important',
          },
          '.react-datepicker__navigation': {
            top: '12px',
          },
          '.react-datepicker__triangle': {
            display: 'none',
          }
        }}
      />

      <DatePicker
        selected={selectedDate}
        onChange={(date) => onChange(date)}
        showMonthYearPicker
        dateFormat={formatStr}
        disabled={disabled}
        readOnly={readOnly}
        // Force the picker to show the year of the current value
        openToDate={selectedDate || new Date()} 
        customInput={
          <CustomInput
            label={label}
            error={error}
            helperText={helperText}
            disabled={disabled}
            readOnly={readOnly}
            value={displayValue}
            onClear={() => onChange(null)}
          />
        }
      />
    </Box>
  );
}