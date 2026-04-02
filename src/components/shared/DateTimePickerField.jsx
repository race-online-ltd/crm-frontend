// src/components/shared/DateTimePickerField.jsx
import React, { useState, useRef, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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
  Divider,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// ─── SCROLL COLUMN ────────────────────────────────────────────────────────────
function ScrollColumn({ items, selected, onSelect, width = 72 }) {
  const containerRef = useRef(null);
  const itemHeight = 44;

  useEffect(() => {
    const idx = items.findIndex((i) => i.value === selected);
    if (idx < 0 || !containerRef.current) return;
    containerRef.current.scrollTo({ top: idx * itemHeight, behavior: 'smooth' });
  }, [selected, items]);

  return (
    <Box sx={{ width, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      {/* Up */}
      <Box
        onClick={() => {
          const idx = items.findIndex((i) => i.value === selected);
          if (idx > 0) onSelect(items[idx - 1].value);
        }}
        sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 0.5, cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
      >
        <ArrowUpwardIcon sx={{ fontSize: 18 }} />
      </Box>

      {/* List */}
      <Box
        ref={containerRef}
        sx={{ height: itemHeight * 3, overflowY: 'auto', width: '100%', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
      >
        {items.map((item) => {
          const isSel = item.value === selected;
          return (
            <Box
              key={item.value}
              onClick={() => onSelect(item.value)}
              sx={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: '8px',
                fontWeight: isSel ? 700 : 400,
                fontSize: 16,
                color: isSel ? '#fff' : 'text.primary',
                bgcolor: isSel ? 'primary.main' : 'transparent',
                mx: 0.5,
                userSelect: 'none',
                transition: 'background 0.15s',
                '&:hover': { bgcolor: isSel ? 'primary.main' : 'action.hover' },
              }}
            >
              {item.label}
            </Box>
          );
        })}
      </Box>

      {/* Down */}
      <Box
        onClick={() => {
          const idx = items.findIndex((i) => i.value === selected);
          if (idx < items.length - 1) onSelect(items[idx + 1].value);
        }}
        sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 0.5, cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
      >
        <ArrowDownwardIcon sx={{ fontSize: 18 }} />
      </Box>
    </Box>
  );
}

// ─── MINI CALENDAR ────────────────────────────────────────────────────────────
function MiniCalendar({ selectedDate, onSelectDate, disablePast }) {
  const [viewDate, setViewDate] = useState(selectedDate ?? new Date());
  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const calStart = startOfWeek(startOfMonth(viewDate));
  const calEnd = endOfWeek(endOfMonth(viewDate));
  const days = [];
  let d = calStart;
  while (d <= calEnd) { days.push(d); d = addDays(d, 1); }

  return (
    <Box sx={{ width: 280, p: 1.5 }}>
      {/* Month nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          sx={{ flex: 1, color: 'primary.main', fontSize: 14, cursor: 'default' }}
        >
          {formatDate(viewDate, 'MMMM yyyy')} ▾
        </Typography>
        <IconButton size="small" onClick={() => setViewDate(subMonths(viewDate, 1))}>
          <ArrowUpwardIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <IconButton size="small" onClick={() => setViewDate(addMonths(viewDate, 1))}>
          <ArrowDownwardIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Day labels */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
        {DAY_LABELS.map((l, i) => (
          <Box key={i} sx={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'text.secondary', py: 0.5 }}>
            {l}
          </Box>
        ))}
      </Box>

      {/* Days grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, viewDate);
          const isSel = selectedDate && isSameDay(day, selectedDate);
          const isTod = isToday(day);
          const isPastDay = disablePast && isPast(startOfDay(day)) && !isToday(day);

          return (
            <Box
              key={i}
              onClick={() => !isPastDay && onSelectDate(day)}
              sx={{
                textAlign: 'center',
                py: '6px',
                fontSize: 13,
                borderRadius: '6px',
                cursor: isPastDay ? 'default' : 'pointer',
                fontWeight: isSel ? 700 : 400,
                color: isSel ? '#fff' : isPastDay || !inMonth ? 'text.disabled' : isTod ? 'primary.main' : 'text.primary',
                bgcolor: isSel ? 'primary.main' : 'transparent',
                border: isTod && !isSel ? '1px solid' : 'none',
                borderColor: 'primary.main',
                userSelect: 'none',
                '&:hover': { bgcolor: isPastDay ? 'transparent' : isSel ? 'primary.main' : 'action.hover' },
              }}
            >
              {formatDate(day, 'd')}
            </Box>
          );
        })}
      </Box>

      {/* Today shortcut */}
      <Box sx={{ textAlign: 'center', mt: 1 }}>
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

// ─── TIME OPTIONS ─────────────────────────────────────────────────────────────
const HOURS   = Array.from({ length: 12 }, (_, i) => { const v = i + 1; return { value: v, label: String(v).padStart(2, '0') }; });
const MINUTES = Array.from({ length: 60 }, (_, i) => ({ value: i, label: String(i).padStart(2, '0') }));
const AMPM_OPTIONS = [{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DateTimePickerField({
  label = 'Select Date & Time',
  value,
  onChange,
  disabled = false,
  readOnly = false,
  disablePast = false,
  format = 'MM/dd/yyyy, hh:mm aa',
  error = false,
  helperText,
  fullWidth = true,
  size = 'small',
  sx = {},
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [draftDate, setDraftDate] = useState(null);
  const [hour,   setHour]   = useState(10);
  const [minute, setMinute] = useState(30);
  const [ampm,   setAmpm]   = useState('AM');

  function syncFromValue(v) {
    const d = v && isValid(new Date(v)) ? new Date(v) : new Date();
    setDraftDate(d);
    const h24 = d.getHours();
    setAmpm(h24 >= 12 ? 'PM' : 'AM');
    setHour(h24 % 12 || 12);
    setMinute(d.getMinutes());
  }

  function handleOpen(e) {
    if (disabled || readOnly) return;
    syncFromValue(value);
    setAnchorEl(e.currentTarget);
  }

  function handleClose() { setAnchorEl(null); }

  function handleAccept() {
    if (!draftDate) return handleClose();
    const result = new Date(draftDate);
    let h24 = hour % 12;
    if (ampm === 'PM') h24 += 12;
    result.setHours(h24, minute, 0, 0);
    onChange(result);
    handleClose();
  }

  function handleClear(e) {
    e.stopPropagation();
    onChange(null);
  }

  const displayValue = value && isValid(new Date(value)) ? formatDate(new Date(value), format) : '';

  // Live preview
  const previewStr = (() => {
    if (!draftDate) return '—';
    const d = new Date(draftDate);
    let h24 = hour % 12;
    if (ampm === 'PM') h24 += 12;
    d.setHours(h24, minute, 0, 0);
    return formatDate(d, 'dd/MM/yyyy, hh:mm aa');
  })();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* Trigger field */}
      <TextField
        fullWidth={fullWidth}
        size={size}
        label={label}
        value={displayValue}
        placeholder="MM/DD/YYYY HH:MM"
        error={error}
        helperText={helperText || undefined}
        onClick={handleOpen}
        inputProps={{ readOnly: true }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <CalendarMonthIcon fontSize="small" color={open ? 'primary' : 'action'} />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear} disabled={disabled || readOnly}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        sx={{
          cursor: disabled || readOnly ? 'default' : 'pointer',
          '& .MuiOutlinedInput-root': { borderRadius: '8px', cursor: disabled || readOnly ? 'default' : 'pointer' },
          '& .MuiInputBase-input': { cursor: disabled || readOnly ? 'default' : 'pointer' },
          ...sx,
        }}
        disabled={disabled}
      />

      {/* Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ elevation: 4, sx: { borderRadius: '12px', overflow: 'hidden', mt: 0.5 } }}
      >
        {/* Preview header */}
        <Box sx={{ px: 2, pt: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: 22, letterSpacing: 0.5 }}>
            {previewStr}
          </Typography>
        </Box>

        {/* Calendar + time columns */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <MiniCalendar selectedDate={draftDate} onSelectDate={setDraftDate} disablePast={disablePast} />
          <Divider orientation="vertical" flexItem />
          <Box sx={{ display: 'flex', px: 1, py: 1 }}>
            <ScrollColumn items={HOURS}        selected={hour}   onSelect={setHour}   />
            <ScrollColumn items={MINUTES}      selected={minute} onSelect={setMinute} />
            <ScrollColumn items={AMPM_OPTIONS} selected={ampm}   onSelect={setAmpm}   />
          </Box>
        </Box>

        {/* Action bar */}
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, px: 2, py: 1 }}>
          <Button size="small" onClick={handleClose} sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button size="small" variant="contained" onClick={handleAccept} disabled={!draftDate} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}>
            OK
          </Button>
        </Box>
      </Popover>
    </LocalizationProvider>
  );
}



// // src/components/shared/DateTimePickerField.jsx
// import React, { useState, useRef, useEffect } from 'react';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import {
//   format as formatDate,
//   isValid,
//   startOfMonth,
//   endOfMonth,
//   startOfWeek,
//   endOfWeek,
//   addDays,
//   addMonths,
//   subMonths,
//   isSameMonth,
//   isSameDay,
//   isToday,
//   isPast,
//   startOfDay,
// } from 'date-fns';
// import {
//   Popover,
//   TextField,
//   InputAdornment,
//   IconButton,
//   Box,
//   Typography,
//   Button,
//   Divider,
//   Tabs,
//   Tab,
//   useTheme,
//   useMediaQuery,
// } from '@mui/material';
// import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// import CloseIcon from '@mui/icons-material/Close';
// import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
// import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// // ─── SCROLL COLUMN ────────────────────────────────────────────────────────────
// function ScrollColumn({ items, selected, onSelect, width = 72 }) {
//   const containerRef = useRef(null);
//   const itemHeight = 44;

//   useEffect(() => {
//     const idx = items.findIndex((i) => i.value === selected);
//     if (idx < 0 || !containerRef.current) return;
//     containerRef.current.scrollTo({ top: idx * itemHeight, behavior: 'smooth' });
//   }, [selected, items]);

//   return (
//     <Box sx={{ width, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
//       {/* Up */}
//       <Box
//         onClick={() => {
//           const idx = items.findIndex((i) => i.value === selected);
//           if (idx > 0) onSelect(items[idx - 1].value);
//         }}
//         sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 0.5, cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
//       >
//         <ArrowUpwardIcon sx={{ fontSize: 18 }} />
//       </Box>

//       {/* List */}
//       <Box
//         ref={containerRef}
//         sx={{ height: itemHeight * 3, overflowY: 'auto', width: '100%', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
//       >
//         {items.map((item) => {
//           const isSel = item.value === selected;
//           return (
//             <Box
//               key={item.value}
//               onClick={() => onSelect(item.value)}
//               sx={{
//                 height: itemHeight,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 cursor: 'pointer',
//                 borderRadius: '8px',
//                 fontWeight: isSel ? 700 : 400,
//                 fontSize: 16,
//                 color: isSel ? '#fff' : 'text.primary',
//                 bgcolor: isSel ? 'primary.main' : 'transparent',
//                 mx: 0.5,
//                 userSelect: 'none',
//                 transition: 'background 0.15s',
//                 '&:hover': { bgcolor: isSel ? 'primary.main' : 'action.hover' },
//               }}
//             >
//               {item.label}
//             </Box>
//           );
//         })}
//       </Box>

//       {/* Down */}
//       <Box
//         onClick={() => {
//           const idx = items.findIndex((i) => i.value === selected);
//           if (idx < items.length - 1) onSelect(items[idx + 1].value);
//         }}
//         sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 0.5, cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
//       >
//         <ArrowDownwardIcon sx={{ fontSize: 18 }} />
//       </Box>
//     </Box>
//   );
// }

// // ─── MINI CALENDAR ────────────────────────────────────────────────────────────
// function MiniCalendar({ selectedDate, onSelectDate, disablePast }) {
//   const [viewDate, setViewDate] = useState(selectedDate ?? new Date());
//   const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

//   const calStart = startOfWeek(startOfMonth(viewDate));
//   const calEnd = endOfWeek(endOfMonth(viewDate));
//   const days = [];
//   let d = calStart;
//   while (d <= calEnd) { days.push(d); d = addDays(d, 1); }

//   return (
//     <Box sx={{ width: 280, p: 1.5 }}>
//       {/* Month nav */}
//       <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//         <Typography
//           variant="subtitle2"
//           fontWeight={700}
//           sx={{ flex: 1, color: 'primary.main', fontSize: 14, cursor: 'default' }}
//         >
//           {formatDate(viewDate, 'MMMM yyyy')} ▾
//         </Typography>
//         <IconButton size="small" onClick={() => setViewDate(subMonths(viewDate, 1))}>
//           <ArrowUpwardIcon sx={{ fontSize: 16 }} />
//         </IconButton>
//         <IconButton size="small" onClick={() => setViewDate(addMonths(viewDate, 1))}>
//           <ArrowDownwardIcon sx={{ fontSize: 16 }} />
//         </IconButton>
//       </Box>

//       {/* Day labels */}
//       <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
//         {DAY_LABELS.map((l, i) => (
//           <Box key={i} sx={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'text.secondary', py: 0.5 }}>
//             {l}
//           </Box>
//         ))}
//       </Box>

//       {/* Days grid */}
//       <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
//         {days.map((day, i) => {
//           const inMonth = isSameMonth(day, viewDate);
//           const isSel = selectedDate && isSameDay(day, selectedDate);
//           const isTod = isToday(day);
//           const isPastDay = disablePast && isPast(startOfDay(day)) && !isToday(day);

//           return (
//             <Box
//               key={i}
//               onClick={() => !isPastDay && onSelectDate(day)}
//               sx={{
//                 textAlign: 'center',
//                 py: '6px',
//                 fontSize: 13,
//                 borderRadius: '6px',
//                 cursor: isPastDay ? 'default' : 'pointer',
//                 fontWeight: isSel ? 700 : 400,
//                 color: isSel ? '#fff' : isPastDay || !inMonth ? 'text.disabled' : isTod ? 'primary.main' : 'text.primary',
//                 bgcolor: isSel ? 'primary.main' : 'transparent',
//                 border: isTod && !isSel ? '1px solid' : 'none',
//                 borderColor: 'primary.main',
//                 userSelect: 'none',
//                 '&:hover': { bgcolor: isPastDay ? 'transparent' : isSel ? 'primary.main' : 'action.hover' },
//               }}
//             >
//               {formatDate(day, 'd')}
//             </Box>
//           );
//         })}
//       </Box>

//       {/* Today shortcut */}
//       <Box sx={{ textAlign: 'center', mt: 1 }}>
//         <Button
//           size="small"
//           onClick={() => { const t = new Date(); setViewDate(t); onSelectDate(t); }}
//           sx={{ textTransform: 'none', fontSize: 13, color: 'primary.main', fontWeight: 600 }}
//         >
//           Today
//         </Button>
//       </Box>
//     </Box>
//   );
// }

// // ─── TIME OPTIONS ─────────────────────────────────────────────────────────────
// const HOURS   = Array.from({ length: 12 }, (_, i) => { const v = i + 1; return { value: v, label: String(v).padStart(2, '0') }; });
// const MINUTES = Array.from({ length: 60 }, (_, i) => ({ value: i, label: String(i).padStart(2, '0') }));
// const AMPM_OPTIONS = [{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }];

// // ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// export default function DateTimePickerField({
//   label = 'Select Date & Time',
//   value,
//   onChange,
//   disabled = false,
//   readOnly = false,
//   disablePast = false,
//   format = 'MM/dd/yyyy, hh:mm aa',
//   error = false,
//   helperText = '',
//   fullWidth = true,
//   size = 'small',
//   sx = {},
// }) {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

//   const [anchorEl, setAnchorEl] = useState(null);
//   const open = Boolean(anchorEl);
//   const [mobileTab, setMobileTab] = useState(0); // 0 = Date, 1 = Time

//   const [draftDate, setDraftDate] = useState(null);
//   const [hour,   setHour]   = useState(10);
//   const [minute, setMinute] = useState(30);
//   const [ampm,   setAmpm]   = useState('AM');

//   function syncFromValue(v) {
//     const d = v && isValid(new Date(v)) ? new Date(v) : new Date();
//     setDraftDate(d);
//     const h24 = d.getHours();
//     setAmpm(h24 >= 12 ? 'PM' : 'AM');
//     setHour(h24 % 12 || 12);
//     setMinute(d.getMinutes());
//   }

//   function handleOpen(e) {
//     if (disabled || readOnly) return;
//     syncFromValue(value);
//     setAnchorEl(e.currentTarget);
//   }

//   function handleClose() { setAnchorEl(null); }

//   function handleAccept() {
//     if (!draftDate) return handleClose();
//     const result = new Date(draftDate);
//     let h24 = hour % 12;
//     if (ampm === 'PM') h24 += 12;
//     result.setHours(h24, minute, 0, 0);
//     onChange(result);
//     handleClose();
//   }

//   function handleClear(e) {
//     e.stopPropagation();
//     onChange(null);
//   }

//   const displayValue = value && isValid(new Date(value)) ? formatDate(new Date(value), format) : '';

//   // Live preview
//   const previewStr = (() => {
//     if (!draftDate) return '—';
//     const d = new Date(draftDate);
//     let h24 = hour % 12;
//     if (ampm === 'PM') h24 += 12;
//     d.setHours(h24, minute, 0, 0);
//     return formatDate(d, 'dd/MM/yyyy, hh:mm aa');
//   })();

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       {/* Trigger field */}
//       <TextField
//         fullWidth={fullWidth}
//         size={size}
//         label={label}
//         value={displayValue}
//         placeholder="MM/DD/YYYY HH:MM"
//         error={error}
//         helperText={helperText}
//         onClick={handleOpen}
//         inputProps={{ readOnly: true }}
//         InputProps={{
//           startAdornment: (
//             <InputAdornment position="start">
//               <CalendarMonthIcon fontSize="small" color={open ? 'primary' : 'action'} />
//             </InputAdornment>
//           ),
//           endAdornment: value ? (
//             <InputAdornment position="end">
//               <IconButton size="small" onClick={handleClear} disabled={disabled || readOnly}>
//                 <CloseIcon fontSize="small" />
//               </IconButton>
//             </InputAdornment>
//           ) : null,
//         }}
//         sx={{
//           cursor: disabled || readOnly ? 'default' : 'pointer',
//           '& .MuiOutlinedInput-root': { borderRadius: '8px', cursor: disabled || readOnly ? 'default' : 'pointer' },
//           '& .MuiInputBase-input': { cursor: disabled || readOnly ? 'default' : 'pointer' },
//           ...sx,
//         }}
//         disabled={disabled}
//       />

//       {/* Popover */}
//       <Popover
//         open={open}
//         anchorEl={anchorEl}
//         onClose={handleClose}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
//         transformOrigin={{ vertical: 'top', horizontal: 'left' }}
//         PaperProps={{
//           elevation: 4,
//           sx: {
//             borderRadius: '12px',
//             overflow: 'hidden',
//             mt: 0.5,
//             // On mobile: fill most of the screen width
//             width: { xs: 'calc(100vw - 32px)', sm: 'auto' },
//             maxWidth: { xs: 'calc(100vw - 32px)', sm: 'none' },
//           },
//         }}
//       >
//         {/* Preview header */}
//         <Box sx={{ px: 2, pt: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
//           <Typography variant="caption" color="text.secondary">{label}</Typography>
//           <Typography variant="h6" fontWeight={700} sx={{ fontSize: 22, letterSpacing: 0.5 }}>
//             {previewStr}
//           </Typography>
//         </Box>

//         {isMobile ? (
//           /* ── MOBILE: tabbed layout ── */
//           <>
//             <Tabs
//               value={mobileTab}
//               onChange={(_, v) => setMobileTab(v)}
//               variant="fullWidth"
//               sx={{
//                 borderBottom: '1px solid',
//                 borderColor: 'divider',
//                 minHeight: 40,
//                 '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 40, fontSize: 13 },
//                 '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
//               }}
//             >
//               <Tab label="📅  Date" />
//               <Tab label="🕐  Time" />
//             </Tabs>

//             {mobileTab === 0 && (
//               <Box sx={{ display: 'flex', justifyContent: 'center' }}>
//                 <MiniCalendar selectedDate={draftDate} onSelectDate={(d) => { setDraftDate(d); setMobileTab(1); }} disablePast={disablePast} />
//               </Box>
//             )}

//             {mobileTab === 1 && (
//               <Box sx={{ display: 'flex', justifyContent: 'center', px: 1, py: 2 }}>
//                 <ScrollColumn items={HOURS}        selected={hour}   onSelect={setHour}   width={88} />
//                 <ScrollColumn items={MINUTES}      selected={minute} onSelect={setMinute} width={88} />
//                 <ScrollColumn items={AMPM_OPTIONS} selected={ampm}   onSelect={setAmpm}   width={88} />
//               </Box>
//             )}
//           </>
//         ) : (
//           /* ── DESKTOP: side-by-side layout ── */
//           <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
//             <MiniCalendar selectedDate={draftDate} onSelectDate={setDraftDate} disablePast={disablePast} />
//             <Divider orientation="vertical" flexItem />
//             <Box sx={{ display: 'flex', px: 1, py: 1 }}>
//               <ScrollColumn items={HOURS}        selected={hour}   onSelect={setHour}   />
//               <ScrollColumn items={MINUTES}      selected={minute} onSelect={setMinute} />
//               <ScrollColumn items={AMPM_OPTIONS} selected={ampm}   onSelect={setAmpm}   />
//             </Box>
//           </Box>
//         )}

//         {/* Action bar */}
//         <Divider />
//         <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, px: 2, py: 1 }}>
//           <Button size="small" onClick={handleClose} sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}>
//             Cancel
//           </Button>
//           <Button size="small" variant="contained" onClick={handleAccept} disabled={!draftDate} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}>
//             OK
//           </Button>
//         </Box>
//       </Popover>
//     </LocalizationProvider>
//   );
// }
