// src/features/activity/components/ActivityCalendar.jsx
import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Button, IconButton, Stack,
  Dialog, DialogContent, DialogTitle, Chip,
  useMediaQuery, useTheme,
} from '@mui/material';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO,
} from 'date-fns';
import ChevronLeftIcon    from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon   from '@mui/icons-material/ChevronRight';
import AddIcon            from '@mui/icons-material/Add';
import CalendarTodayIcon  from '@mui/icons-material/CalendarToday';
import CloseIcon          from '@mui/icons-material/Close';
import AccessTimeIcon     from '@mui/icons-material/AccessTime';
import EventNoteIcon      from '@mui/icons-material/EventNote';
import TaskForm       from './TaskForm';
import '../styles/calendar.css';

// ─── Activity type config ─────────────────────────────────────────────────────
const ACTIVITY_CONFIG = {
  call:             { bg: '#818cf8', label: 'Call' },
  physical_meeting: { bg: '#10b981', label: 'Meeting' },
  virtual_meeting:  { bg: '#3b82f6', label: 'Virtual' },
  follow_up:        { bg: '#f59e0b', label: 'Follow Up' },
};

const getConfig = (type) => ACTIVITY_CONFIG[type] || { bg: '#ec4899', label: 'Other' };

// ─── Mock activities ──────────────────────────────────────────────────────────
const MOCK_ACTIVITIES = [
  { id: 1, title: 'Weekly Team Sync',       scheduledAt: '2026-04-01T09:00:00Z', activityType: 'call',             details: 'Weekly sync with the full team.' },
  { id: 2, title: 'Client Site Visit',      scheduledAt: '2026-04-01T12:00:00Z', activityType: 'physical_meeting', details: 'Visit client office to review progress.' },
  { id: 3, title: 'Partner Strategy Call',  scheduledAt: '2026-04-07T10:30:00Z', activityType: 'virtual_meeting',  details: 'Zoom call with partner to align on Q2 goals.' },
  { id: 4, title: 'Check Deal Pipeline',    scheduledAt: '2026-04-07T14:00:00Z', activityType: 'follow_up',        details: 'Review all open deals in CRM.' },
  { id: 5, title: 'Board Presentation',     scheduledAt: '2026-04-14T13:00:00Z', activityType: 'virtual_meeting',  details: 'Q1 results presentation to the board.' },
  { id: 6, title: 'Prospect Lunch',         scheduledAt: '2026-04-14T18:30:00Z', activityType: 'physical_meeting', details: 'Lunch with new prospect at Dhaka Club.' },
  { id: 7, title: 'Follow-up: Alpha Corp',  scheduledAt: '2026-04-21T08:00:00Z', activityType: 'follow_up',        details: 'Follow up on proposal sent last week.' },
];

// ─── Sidebar card ─────────────────────────────────────────────────────────────
function SidebarCard({ activity }) {
  const cfg = getConfig(activity.activityType);
  return (
    <Box className="cal-sidebar-card" sx={{ borderLeft: `4px solid ${cfg.bg}` }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.875rem', lineHeight: 1.3 }}>
          {activity.title}
        </Typography>
        <Chip
          label={cfg.label}
          size="small"
          sx={{
            bgcolor: cfg.bg + '22',
            color: cfg.bg,
            fontWeight: 700,
            fontSize: '0.6rem',
            height: 20,
            ml: 1,
            flexShrink: 0,
          }}
        />
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5} mt={0.75}>
        <AccessTimeIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
        <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
          {format(parseISO(activity.scheduledAt), 'p')}
        </Typography>
      </Stack>
      {activity.details && (
        <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', mt: 0.5, lineHeight: 1.4 }}>
          {activity.details}
        </Typography>
      )}
    </Box>
  );
}

// ─── Mobile day sheet (bottom area below calendar) ────────────────────────────
function MobileDaySheet({ date, activities }) {
  if (!activities.length) return null;
  return (
    <Box sx={{ mt: 2, px: 0.5 }}>
      <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.8rem', mb: 1.5 }}>
        {format(date, 'EEEE, MMM d')}
      </Typography>
      <Stack spacing={1.5}>
        {activities.map((ev) => <SidebarCard key={ev.id} activity={ev} />)}
      </Stack>
    </Box>
  );
}

// ─── Main Calendar ────────────────────────────────────────────────────────────
export default function ActivityCalendar() {
  const theme   = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [activities,   setActivities]   = useState(MOCK_ACTIVITIES);

  const nextMonth  = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth  = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday  = () => { const t = new Date(); setCurrentMonth(t); setSelectedDate(t); };

  const handleActivitySubmit = (payload) => {
    setActivities((prev) => [...prev, { ...payload, id: Date.now() }]);
    setIsModalOpen(false);
  };

  // Build calendar grid
  const calendarGrid = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const startDate  = startOfWeek(monthStart);
    const endDate    = endOfWeek(endOfMonth(monthStart));
    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push({
        date:   day,
        events: activities.filter((a) => isSameDay(parseISO(a.scheduledAt), day)),
      });
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth, activities]);

  const selectedDayActivities = useMemo(
    () => activities.filter((a) => isSameDay(parseISO(a.scheduledAt), selectedDate)),
    [activities, selectedDate],
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#fff', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
        mb={3}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 38, height: 38, borderRadius: '10px',
              bgcolor: '#eff6ff', border: '1px solid #bfdbfe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CalendarTodayIcon sx={{ fontSize: 20, color: '#2563eb' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: { xs: '1.1rem', sm: '1.3rem' } }}>
                My Calendar
              </Typography>
              <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.85rem' }}>
                {format(currentMonth, 'MMMM yyyy')}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Nav */}
          <Box sx={{
            border: '1px solid #e2e8f0', borderRadius: '10px', p: '3px',
            display: 'flex', alignItems: 'center', bgcolor: '#f8fafc',
          }}>
            <IconButton onClick={prevMonth} size="small" sx={{ '&:focus': { outline: 'none' } }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Button
              onClick={goToToday}
              sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600, px: 1.5, fontSize: '0.82rem', minWidth: 0 }}
            >
              Today
            </Button>
            <IconButton onClick={nextMonth} size="small" sx={{ '&:focus': { outline: 'none' } }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Add button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            sx={{
              bgcolor: '#2563eb', borderRadius: '10px', textTransform: 'none',
              fontWeight: 700, boxShadow: 'none', px: { xs: 2, sm: 3 },
              fontSize: '0.85rem',
              '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 4px 14px rgba(37,99,235,0.25)' },
            }}
          >
            {isMobile ? 'Add' : 'New Task'}
          </Button>
        </Stack>
      </Stack>            

      {/* ── Main layout: calendar + sidebar ── */}
      <Box
        className="cal-layout"
        sx={{
          display: 'grid',
          gridTemplateColumns: isTablet ? '1fr' : '1fr 320px',
          gap: 3,
          alignItems: 'start',
        }}
      >

        {/* ── Calendar grid ── */}
        <Box>
          {/* Weekday headers */}
          <Box className="cal-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <Box key={d} className="cal-weekday">{d}</Box>
            ))}
          </Box>

          {/* Day cells */}
          <Box className="cal-grid">
            {calendarGrid.map(({ date, events }, idx) => {
              const isToday        = isSameDay(date, new Date());
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isSelected     = isSameDay(date, selectedDate);

              return (
                <Box
                  key={idx}
                  onClick={() => setSelectedDate(date)}
                  className={[
                    'cal-cell',
                    isSelected     ? 'selected'     : '',
                    !isCurrentMonth ? 'other-month' : '',
                  ].join(' ')}
                >
                  {/* Date number */}
                  <Box
                    className={[
                      'cal-date',
                      isToday         ? 'today'         : '',
                      isSelected && !isToday ? 'selected-date' : '',
                      !isCurrentMonth ? 'other-month'   : '',
                    ].join(' ')}
                  >
                    {format(date, 'd')}
                  </Box>

                  {/* Desktop/tablet: event pills */}
                  {events.slice(0, 3).map((ev) => (
                    <Box
                      key={ev.id}
                      className="cal-pill"
                      sx={{ bgcolor: getConfig(ev.activityType).bg }}
                    >
                      {format(parseISO(ev.scheduledAt), 'h:mma')} {ev.title}
                    </Box>
                  ))}
                  {events.length > 3 && (
                    <Box className="cal-more">+{events.length - 3} more</Box>
                  )}

                  {/* Mobile: colored dots instead of pills */}
                  <Box className="cal-dot-row">
                    {events.slice(0, 3).map((ev) => (
                      <Box
                        key={ev.id}
                        className="cal-dot"
                        sx={{ bgcolor: getConfig(ev.activityType).bg }}
                      />
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Mobile: show selected day events below calendar */}
          {isTablet && (
            <MobileDaySheet date={selectedDate} activities={selectedDayActivities} />
          )}
        </Box>

        {/* ── Desktop sidebar ── */}
        {!isTablet && (
          <Box
            className="cal-sidebar"
            sx={{
              border: '1px solid #e9eef4',
              borderRadius: '14px',
              p: 2.5,
              bgcolor: '#fff',
              position: 'sticky',
              top: 80,
            }}
          >
            {/* Sidebar header */}
            <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
              <Box sx={{
                bgcolor: '#eff6ff', p: 0.75, borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <EventNoteIcon sx={{ fontSize: 18, color: '#2563eb' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem' }}>
                Activities
              </Typography>
            </Stack>

            {/* Selected date label */}
            <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.78rem', mb: 2 }}>
              {format(selectedDate, 'EEEE, MMMM d')}
            </Typography>

            {/* Event list */}
            <Stack spacing={1.5}>
              {selectedDayActivities.length > 0 ? (
                selectedDayActivities.map((ev) => (
                  <SidebarCard key={ev.id} activity={ev} />
                ))
              ) : (
                <Box sx={{
                  py: 5, textAlign: 'center', bgcolor: '#f8fafc',
                  borderRadius: '12px', border: '1px dashed #e2e8f0',
                }}>
                  <CalendarTodayIcon sx={{ fontSize: 28, color: '#cbd5e1', mb: 1 }} />
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 500 }}>
                    No activities on this day
                  </Typography>
                </Box>
              )}
            </Stack>

            {/* Legend */}
            <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid #f1f5f9' }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', mb: 1.5, letterSpacing: '0.05em' }}>
                ACTIVITY TYPES
              </Typography>
              <Stack spacing={1}>
                {Object.entries(ACTIVITY_CONFIG).map(([, cfg]) => (
                  <Stack key={cfg.label} direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: cfg.bg, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
                      {cfg.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Add Activity Modal ── */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : '18px',
            boxShadow: '0 8px 40px rgba(15,23,42,0.12)',
            border: '1px solid #e9eef4',
            m: isMobile ? 0 : 2,
          },
        }}
      >
        <DialogTitle sx={{ px: 3.5, pt: 3, pb: 2, borderBottom: '1px solid #f1f5f9' }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px',
              bgcolor: '#eff6ff', border: '1px solid #bfdbfe',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <EventNoteIcon sx={{ fontSize: 18, color: '#2563eb' }} />
            </Box>
            <Box>
              <Typography fontWeight={700} fontSize="1rem" color="#0f172a" lineHeight={1.2}>
                Create New Activity
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Log a call, meeting, or follow-up against a lead.
              </Typography>
            </Box>
            <Box flex={1} />
            <IconButton
              size="small"
              onClick={() => setIsModalOpen(false)}
              sx={{ color: '#94a3b8', '&:hover': { bgcolor: '#f1f5f9' }, '&:focus': { outline: 'none' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 3.5, py: 3 }}>
          <TaskForm
            onCancel={() => setIsModalOpen(false)}
            onSubmit={handleActivitySubmit}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
