// src/components/shared/DatePickerField.jsx
import React, { useRef } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function DatePickerField({
  label = 'Select Date',
  value,
  onChange,
  disabled = false,
  readOnly = false,
  minDate = null,
  maxDate = null,
  disablePast = false,
  disableFuture = false,
  format = 'MM/dd/yyyy',
  showTodayButton = true,
  placeholder = 'MM/DD/YYYY',
  error = false,
  helperText = '',
  fullWidth = true,
  size = 'small',
  sx = {},
}) {
  const pickerRef = useRef(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        minDate={minDate}
        maxDate={maxDate}
        disablePast={disablePast}
        disableFuture={disableFuture}
        format={format}
        views={['year', 'month', 'day']} // Year → Month → Day
        slotProps={{
          textField: {
            fullWidth,
            size,
            placeholder,
            error,
            helperText,
            ref: pickerRef,
            onClick: () => {
              if (!disabled && pickerRef.current) {
                // Programmatically open the picker
                const button = pickerRef.current.querySelector('button');
                if (button) button.click();
              }
            },
            sx: {
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '& .MuiIconButton-root:focus': { outline: 'none' },
                '& .MuiIconButton-root:focus-visible': { outline: 'none', boxShadow: 'none' },
              },
              '& .MuiInputLabel-shrink': {
                transform: 'translate(14px, -6px) scale(0.75)', // Shrink label
              },
              ...sx,
            },
          },
          popper: {
            sx: {
              '& .MuiPaper-root': {
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                overflow: 'hidden',
              },
            },
          },
          layout: {
            sx: {
              padding: '0px !important',
              '.MuiDateCalendar-root': { width: '100%', height: '100% !important', maxHeight: '290px !important', minHeight: 'auto !important', margin: '0px !important', padding: '0px !important', overflow: 'hidden' },
              '.MuiPickersCalendarHeader-root': { margin: '0px !important', padding: '8px 12px !important', minHeight: 'auto !important' },
              '.MuiDayCalendar-header': { margin: '0px !important', padding: '0px !important' },
              '.MuiDayCalendar-monthContainer': { margin: '0px !important', padding: '0px !important', position: 'relative' },
              '.MuiDayCalendar-weekContainer': { margin: '0px !important', padding: '0px !important' },
              '.MuiPickersDay-root': { margin: '0px !important' },
              '.MuiDayCalendar-slideTransition': { minHeight: 'auto !important', overflow: 'hidden' },
            
            
            
            },
          },
          actionBar: {
            actions: showTodayButton ? ['today'] : [],
            sx: {
              padding: '0px !important',
              margin: '0px !important',
              minHeight: '0px !important',
              height: 'auto !important',
              justifyContent: 'center',
              borderTop: '1px dashed #e0e0e0',
              backgroundColor: '#f8f9fa',
              display: showTodayButton ? 'flex' : 'none',
              '& > div': { padding: '0px !important', margin: '0px !important' },
              '& .MuiButton-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', width: '100%', margin: '0px !important', padding: '4px 8px !important', minHeight: '0px !important', height: 'auto !important', lineHeight: '1.2', '&.MuiButton-text': { padding: '12px 8px !important' } },
            },
          },
          openPickerButton: {
            sx: {
              '&:focus': { outline: 'none' },
              '&:focus-visible': { outline: 'none', boxShadow: 'none' },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}
