// src/components/shared/DatePickerField.jsx
import React, { useState } from 'react';
import {
  format as formatDate,
  isValid,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isPast,
  isFuture,
  startOfDay,
} from 'date-fns';
import {
  Popover,
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  Button,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon         from '@mui/icons-material/Close';
import ChevronLeftIcon   from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon  from '@mui/icons-material/ChevronRight';
import { fieldSx }       from './SelectDropdownSingle';

const FIELD_HEIGHT = 45;
const DAY_LABELS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// ─── MINI CALENDAR ────────────────────────────────────────────────────────────
function MiniCalendar({ selectedDate, onSelectDate, disablePast, disableFuture }) {
  const [viewDate, setViewDate] = useState(selectedDate ?? new Date());

  const calStart = startOfWeek(startOfMonth(viewDate));
  const calEnd   = endOfWeek(endOfMonth(viewDate));
  const days     = [];
  let d = calStart;
  while (d <= calEnd) { days.push(d); d = addDays(d, 1); }

  return (
    <Box sx={{ width: 280, p: 1.5 }}>
      {/* Month nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton size="small" onClick={() => setViewDate(subMonths(viewDate, 1))}>
          <ChevronLeftIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          sx={{ flex: 1, textAlign: 'center', color: 'primary.main', fontSize: 14 }}
        >
          {formatDate(viewDate, 'MMMM yyyy')}
        </Typography>
        <IconButton size="small" onClick={() => setViewDate(addMonths(viewDate, 1))}>
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Day labels */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
        {DAY_LABELS.map((l) => (
          <Box key={l} sx={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'text.secondary', py: 0.5 }}>
            {l}
          </Box>
        ))}
      </Box>

      {/* Days */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map((day, i) => {
          const inMonth   = isSameMonth(day, viewDate);
          const isSel     = selectedDate && isSameDay(day, selectedDate);
          const isTod     = isToday(day);
          const isPastDay = disablePast   && isPast(startOfDay(day))   && !isToday(day);
          const isFutDay  = disableFuture && isFuture(startOfDay(day)) && !isToday(day);
          const isDisabled = isPastDay || isFutDay;

          return (
            <Box
              key={i}
              onClick={() => !isDisabled && onSelectDate(day)}
              sx={{
                textAlign:    'center',
                py:           '6px',
                fontSize:     13,
                borderRadius: '6px',
                cursor:       isDisabled ? 'default' : 'pointer',
                fontWeight:   isSel ? 700 : 400,
                color:        isSel ? '#fff' : isDisabled || !inMonth ? 'text.disabled' : isTod ? 'primary.main' : 'text.primary',
                bgcolor:      isSel ? 'primary.main' : 'transparent',
                border:       isTod && !isSel ? '1px solid' : 'none',
                borderColor:  'primary.main',
                userSelect:   'none',
                '&:hover': { bgcolor: isDisabled ? 'transparent' : isSel ? 'primary.main' : 'action.hover' },
              }}
            >
              {formatDate(day, 'd')}
            </Box>
          );
        })}
      </Box>

      {/* Today shortcut */}
      <Box sx={{ textAlign: 'center', mt: 1, borderTop: '1px dashed #e0e0e0', pt: 1 }}>
        <Button
          size="small"
          onClick={() => { const t = new Date(); setViewDate(t); onSelectDate(t); }}
          sx={{ textTransform: 'none', fontSize: 13, color: 'primary.main', fontWeight: 600 }}
        >
          Today
        </Button>
      </Box>
    </Box>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DatePickerField({
  label         = 'Select Date',
  value,
  onChange,
  disabled      = false,
  readOnly      = false,
  disablePast   = false,
  disableFuture = false,
  format        = 'MM/dd/yyyy',
  error         = false,
  helperText    = '',
  fullWidth     = true,
  size          = 'small',
  sx            = {},
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  function handleOpen(e)  { if (disabled || readOnly) return; setAnchorEl(e.currentTarget); }
  function handleClose()  { setAnchorEl(null); }
  function handleSelect(day) { onChange(day); handleClose(); }
  function handleClear(e) { e.stopPropagation(); onChange(null); }

  const displayValue = value && isValid(new Date(value))
    ? formatDate(new Date(value), format)
    : '';

  return (
    <>
      <TextField
        fullWidth={fullWidth}
        size={size}
        label={label}
        value={displayValue}
        placeholder="MM/DD/YYYY"
        error={error}
        helperText={helperText || undefined}
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
              <IconButton size="small" onClick={handleClear} disabled={disabled || readOnly}
                sx={{ padding: '4px', width: '28px', height: '28px' }}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        sx={{
          cursor: disabled || readOnly ? 'default' : 'pointer',
          ...fieldSx(FIELD_HEIGHT),
          '& .MuiInputBase-input': { cursor: disabled || readOnly ? 'default' : 'pointer' },
          ...sx,
        }}
        disabled={disabled}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ elevation: 4, sx: { borderRadius: '12px', overflow: 'hidden', mt: 0.5 } }}
      >
        <MiniCalendar
          selectedDate={value && isValid(new Date(value)) ? new Date(value) : null}
          onSelectDate={handleSelect}
          disablePast={disablePast}
          disableFuture={disableFuture}
        />
      </Popover>
    </>
  );
}