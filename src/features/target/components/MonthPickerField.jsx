// src/features/target/components/MonthPickerField.jsx
import React, { useState } from 'react';
import {
  format as formatDate,
  isValid,
  addYears,
  subYears,
  isPast,
  endOfMonth,
  startOfMonth,
  isToday,
} from 'date-fns';
import {
  Popover,
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon         from '@mui/icons-material/Close';
import ChevronLeftIcon   from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon  from '@mui/icons-material/ChevronRight';
import { fieldSx }       from '../../../components/shared/SelectDropdownSingle';

const FIELD_HEIGHT = 45;

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr',
  'May', 'Jun', 'Jul', 'Aug',
  'Sep', 'Oct', 'Nov', 'Dec',
];

// ─── MONTH GRID ───────────────────────────────────────────────────────────────
function MonthGrid({ selectedDate, onSelectMonth, disablePast }) {
  const [year, setYear] = useState(
    selectedDate && isValid(selectedDate) ? selectedDate.getFullYear() : new Date().getFullYear()
  );

  return (
    <Box sx={{ width: 260, p: 2 }}>
      {/* Year nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton size="small" onClick={() => setYear((y) => y - 1)}>
          <ChevronLeftIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Typography
          fontWeight={700}
          sx={{ flex: 1, textAlign: 'center', color: 'primary.main', fontSize: 15 }}
        >
          {year}
        </Typography>
        <IconButton size="small" onClick={() => setYear((y) => y + 1)}>
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Month grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
        {MONTHS.map((label, idx) => {
          const monthDate  = new Date(year, idx, 1);
          const isSel      = selectedDate && isValid(selectedDate)
            && selectedDate.getFullYear() === year
            && selectedDate.getMonth()    === idx;
          const isPastMonth = disablePast && isPast(endOfMonth(monthDate)) && !isToday(endOfMonth(monthDate));

          return (
            <Box
              key={label}
              onClick={() => !isPastMonth && onSelectMonth(monthDate)}
              sx={{
                py:           1,
                borderRadius: '8px',
                textAlign:    'center',
                fontSize:     13,
                fontWeight:   isSel ? 700 : 400,
                cursor:       isPastMonth ? 'default' : 'pointer',
                color:        isSel ? '#fff' : isPastMonth ? 'text.disabled' : 'text.primary',
                bgcolor:      isSel ? 'primary.main' : 'transparent',
                userSelect:   'none',
                '&:hover': { bgcolor: isPastMonth ? 'transparent' : isSel ? 'primary.main' : 'action.hover' },
              }}
            >
              {label}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function MonthPickerField({
  label       = 'Target Month',
  value       = null,
  onChange,
  error       = false,
  helperText  = ' ',
  disablePast = false,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  function handleOpen(e)  { setAnchorEl(e.currentTarget); }
  function handleClose()  { setAnchorEl(null); }
  function handleSelect(monthDate) { onChange?.(monthDate); handleClose(); }
  function handleClear(e) { e.stopPropagation(); onChange?.(null); }

  const displayValue = value && isValid(new Date(value))
    ? formatDate(new Date(value), 'MMM yyyy')
    : '';

  return (
    <>
      <TextField
        fullWidth
        size="small"
        label={label}
        value={displayValue}
        placeholder="MMM YYYY"
        error={error}
        helperText={helperText}
        onClick={handleOpen}
        inputProps={{ readOnly: true }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <CalendarMonthIcon sx={{ fontSize: 18, color: open ? 'primary.main' : '#94a3b8' }} />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear}
                sx={{ padding: '4px', width: '28px', height: '28px' }}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        sx={{
          cursor: 'pointer',
          ...fieldSx(FIELD_HEIGHT),
          '& .MuiInputBase-input': { cursor: 'pointer' },
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ elevation: 4, sx: { borderRadius: '12px', overflow: 'hidden', mt: 0.5 } }}
      >
        <MonthGrid
          selectedDate={value && isValid(new Date(value)) ? new Date(value) : null}
          onSelectMonth={handleSelect}
          disablePast={disablePast}
        />
      </Popover>
    </>
  );
}