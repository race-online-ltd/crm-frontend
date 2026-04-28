import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Dialog,
  DialogContent,
  DialogTitle,
  Chip,
  useMediaQuery,
  useTheme,
  Menu,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO,
} from 'date-fns';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TaskForm from './TaskForm';
import TaskDetails from './TaskDetails';
import FilterButton from '../../../components/shared/FilterButton';
import { fetchLeadFormOptions } from '../../leads/api/leadApi';
import { fetchBusinessEntities, fetchGroups, fetchTeams } from '../../settings/api/settingsApi';
import { createTask, fetchTaskCalendar } from '../api/taskApi';
import '../styles/calendar.css';

const ACTIVITY_CONFIG = {
  call: { bg: '#818cf8', label: 'Call' },
  physical_meeting: { bg: '#10b981', label: 'Meeting' },
  virtual_meeting: { bg: '#3b82f6', label: 'Virtual' },
  follow_up: { bg: '#f59e0b', label: 'Follow Up' },
};

const DEFAULT_FILTERS = {
  businessEntityId: '',
  teamId: '',
  groupId: '',
  kamId: '',
};

const EMPTY_FILTER_OPTIONS = {
  businessEntities: [],
  teams: [],
  groups: [],
  kams: [],
};

const getConfig = (type) => ACTIVITY_CONFIG[type] || { bg: '#ec4899', label: 'Other' };

function parseTaskDate(value) {
  if (!value) return null;

  try {
    return typeof value === 'string' ? parseISO(value) : new Date(value);
  } catch {
    return null;
  }
}

function SidebarCard({ activity, onOpen }) {
  const cfg = getConfig(activity.taskType);
  const scheduledDate = parseTaskDate(activity.scheduledAt);

  return (
    <Box
      className="cal-sidebar-card"
      onClick={() => onOpen?.(activity)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen?.(activity);
        }
      }}
      sx={{
        borderLeft: `4px solid ${cfg.bg}`,
        cursor: 'pointer',
        transition: 'box-shadow 0.18s ease, transform 0.18s ease',
        '&:hover': {
          boxShadow: '0 10px 24px rgba(15,23,42,0.08)',
          transform: 'translateY(-1px)',
        },
        '&:focus-visible': {
          outline: '2px solid #2563eb',
          outlineOffset: '2px',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.875rem', lineHeight: 1.3 }}>
          {activity.title}
        </Typography>
        <Chip
          label={cfg.label}
          size="small"
          sx={{
            bgcolor: `${cfg.bg}22`,
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
          {scheduledDate ? format(scheduledDate, 'p') : 'No time set'}
        </Typography>
      </Stack>
      {activity.assigned_to_user_name && (
        <Typography sx={{ fontSize: '0.72rem', color: '#475569', mt: 0.5, lineHeight: 1.4, fontWeight: 600 }}>
          {activity.assigned_to_user_name}
        </Typography>
      )}
      {activity.details && (
        <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', mt: 0.5, lineHeight: 1.4 }}>
          {activity.details}
        </Typography>
      )}
    </Box>
  );
}

function MobileDaySheet({ date, activities, loading, onOpen }) {
  if (loading) {
    return (
      <Box sx={{ mt: 2, px: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>Loading activities…</Typography>
      </Box>
    );
  }

  if (!activities.length) return null;

  return (
    <Box sx={{ mt: 2, px: 0.5 }}>
      <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.8rem', mb: 1.5 }}>
        {format(date, 'EEEE, MMM d')}
      </Typography>
      <Stack spacing={1.5}>
        {activities.map((activity) => (
          <SidebarCard key={activity.id} activity={activity} onOpen={onOpen} />
        ))}
      </Stack>
    </Box>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(event) => onChange(event.target.value)}
        MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
      >
        <MenuItem value="">All</MenuItem>
        {options.map((option) => (
          <MenuItem key={option.id} value={String(option.id)}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function TaskCalendar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [detailTask, setDetailTask] = useState(null);
  const [filterOptions, setFilterOptions] = useState(EMPTY_FILTER_OPTIONS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  const nextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));
  const prevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const loadFilterOptions = useCallback(async () => {
    try {
      const [businessEntities, teams, groups] = await Promise.all([
        fetchBusinessEntities(),
        fetchTeams(),
        fetchGroups(),
      ]);

      setFilterOptions({
        businessEntities: businessEntities || [],
        teams: (teams || []).map((team) => ({
          id: String(team.id),
          label: team.team_name || team.name || `Team ${team.id}`,
        })),
        groups: (groups || []).map((group) => ({
          id: String(group.id),
          label: group.group_name || group.name || `Group ${group.id}`,
        })),
        kams: [],
      });
    } catch {
      setFilterOptions(EMPTY_FILTER_OPTIONS);
    }
  }, []);

  const loadKamOptions = useCallback(async (businessEntityId = '') => {
    try {
      const data = await fetchLeadFormOptions(businessEntityId);
      setFilterOptions((current) => ({
        ...current,
        kams: (data.kam_users || []).map((kam) => ({
          id: String(kam.id),
          label: kam.label,
        })),
      }));
    } catch {
      setFilterOptions((current) => ({
        ...current,
        kams: [],
      }));
    }
  }, []);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');

      const data = await fetchTaskCalendar({
        date_from: format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
        date_to: format(endOfMonth(currentMonth), 'yyyy-MM-dd'),
        business_entity_id: filters.businessEntityId || undefined,
        team_id: filters.teamId || undefined,
        group_id: filters.groupId || undefined,
        kam_id: filters.kamId || undefined,
      });

      setActivities(data || []);
    } catch (error) {
      setActivities([]);
      setLoadError(error?.message || 'Unable to load calendar tasks.');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, filters]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    loadKamOptions(filters.businessEntityId || '');
  }, [filters.businessEntityId, loadKamOptions]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    if (!isSameMonth(selectedDate, currentMonth)) {
      setSelectedDate(startOfMonth(currentMonth));
    }
  }, [currentMonth, selectedDate]);

  const handleActivitySubmit = async (_payload, formData) => {
    try {
      setSaveError('');
      await createTask(formData);
      setIsModalOpen(false);
      await loadActivities();
    } catch (error) {
      setSaveError(error?.message || 'Unable to create task.');
      throw error;
    }
  };

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters],
  );

  useEffect(() => {
    if (!draftFilters.kamId) return;

    const exists = filterOptions.kams.some((option) => String(option.id) === String(draftFilters.kamId));
    if (!exists) {
      setDraftFilters((current) => ({ ...current, kamId: '' }));
    }
  }, [draftFilters.kamId, filterOptions.kams]);

  const calendarGrid = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(endOfMonth(monthStart));
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push({
        date: day,
        events: activities.filter((activity) => {
          const scheduledDate = parseTaskDate(activity.scheduledAt);
          return scheduledDate ? isSameDay(scheduledDate, day) : false;
        }),
      });
      day = addDays(day, 1);
    }

    return days;
  }, [activities, currentMonth]);

  const selectedDayActivities = useMemo(
    () => activities.filter((activity) => {
      const scheduledDate = parseTaskDate(activity.scheduledAt);
      return scheduledDate ? isSameDay(scheduledDate, selectedDate) : false;
    }),
    [activities, selectedDate],
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#fff', minHeight: '100vh' }}>
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
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            >
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

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Box sx={{
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            p: '3px',
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f8fafc',
          }}
          >
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

          <FilterButton
            onClick={(event) => {
              setDraftFilters(filters);
              setFilterAnchorEl(event.currentTarget);
            }}
            label={activeFilterCount ? `Filter (${activeFilterCount})` : 'Filter'}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              px: 1.75,
              py: 0.9,
              borderColor: '#dbe4ee',
              color: '#334155',
            }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSaveError('');
              setIsModalOpen(true);
            }}
            sx={{
              bgcolor: '#2563eb',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: 'none',
              px: { xs: 2, sm: 3 },
              fontSize: '0.85rem',
              '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 4px 14px rgba(37,99,235,0.25)' },
            }}
          >
            {isMobile ? 'Add' : 'New Task'}
          </Button>
        </Stack>
      </Stack>

      {loadError && (
        <Box sx={{ mb: 2.5, px: 2, py: 1.5, borderRadius: '12px', border: '1px solid #fecaca', bgcolor: '#fff1f2' }}>
          <Typography sx={{ color: '#b91c1c', fontSize: '0.82rem', fontWeight: 600 }}>
            {loadError}
          </Typography>
        </Box>
      )}

      <Box
        className="cal-layout"
        sx={{
          display: 'grid',
          gridTemplateColumns: isTablet ? '1fr' : '1fr 320px',
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Box>
          <Box className="cal-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Box key={day} className="cal-weekday">{day}</Box>
            ))}
          </Box>

          <Box className="cal-grid">
            {calendarGrid.map(({ date, events }, index) => {
              const isToday = isSameDay(date, new Date());
              const currentMonthDate = isSameMonth(date, currentMonth);
              const isSelected = isSameDay(date, selectedDate);

              return (
                <Box
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={[
                    'cal-cell',
                    isSelected ? 'selected' : '',
                    !currentMonthDate ? 'other-month' : '',
                  ].join(' ')}
                >
                  <Box
                    className={[
                      'cal-date',
                      isToday ? 'today' : '',
                      isSelected && !isToday ? 'selected-date' : '',
                      !currentMonthDate ? 'other-month' : '',
                    ].join(' ')}
                  >
                    {format(date, 'd')}
                  </Box>

                  {events.slice(0, 3).map((event) => {
                    const scheduledDate = parseTaskDate(event.scheduledAt);

                    return (
                      <Box
                        key={event.id}
                        className="cal-pill"
                        sx={{ bgcolor: getConfig(event.taskType).bg }}
                      >
                        {scheduledDate ? format(scheduledDate, 'h:mma') : '--'} {event.title}
                      </Box>
                    );
                  })}
                  {events.length > 3 && (
                    <Box className="cal-more">+{events.length - 3} more</Box>
                  )}

                  <Box className="cal-dot-row">
                    {events.slice(0, 3).map((event) => (
                      <Box
                        key={event.id}
                        className="cal-dot"
                        sx={{ bgcolor: getConfig(event.taskType).bg }}
                      />
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {isTablet && (
            <MobileDaySheet
              date={selectedDate}
              activities={selectedDayActivities}
              loading={loading}
              onOpen={setDetailTask}
            />
          )}
        </Box>

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
            <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
              <Box sx={{
                bgcolor: '#eff6ff',
                p: 0.75,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              >
                <EventNoteIcon sx={{ fontSize: 18, color: '#2563eb' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem' }}>
                Activities
              </Typography>
            </Stack>

            <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.78rem', mb: 2 }}>
              {format(selectedDate, 'EEEE, MMMM d')}
            </Typography>

            <Stack spacing={1.5}>
              {loading ? (
                <Box sx={{ py: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress size={22} />
                </Box>
              ) : selectedDayActivities.length > 0 ? (
                selectedDayActivities.map((activity) => (
                  <SidebarCard key={activity.id} activity={activity} onOpen={setDetailTask} />
                ))
              ) : (
                <Box sx={{
                  py: 5,
                  textAlign: 'center',
                  bgcolor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px dashed #e2e8f0',
                }}
                >
                  <CalendarTodayIcon sx={{ fontSize: 28, color: '#cbd5e1', mb: 1 }} />
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 500 }}>
                    No activities on this day
                  </Typography>
                </Box>
              )}
            </Stack>

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

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              p: 1.5,
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 16px 36px rgba(15,23,42,0.12)',
              mt: 1,
            },
          },
        }}
      >
        <Stack spacing={1.5}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#1e293b', px: 0.5 }}>
            Filter Calendar
          </Typography>
          <FilterSelect
            label="Business Entity"
            value={draftFilters.businessEntityId}
            options={filterOptions.businessEntities}
            onChange={async (value) => {
              setDraftFilters((current) => ({
                ...current,
                businessEntityId: value,
                kamId: '',
              }));
              await loadKamOptions(value);
            }}
          />
          <FilterSelect
            label="Team"
            value={draftFilters.teamId}
            options={filterOptions.teams}
            onChange={(value) => setDraftFilters((current) => ({ ...current, teamId: value }))}
          />
          <FilterSelect
            label="Group"
            value={draftFilters.groupId}
            options={filterOptions.groups}
            onChange={(value) => setDraftFilters((current) => ({ ...current, groupId: value }))}
          />
          <FilterSelect
            label="KAM"
            value={draftFilters.kamId}
            options={filterOptions.kams}
            onChange={(value) => setDraftFilters((current) => ({ ...current, kamId: value }))}
          />
          <Divider />
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Button
              onClick={() => {
                setDraftFilters(DEFAULT_FILTERS);
                setFilters(DEFAULT_FILTERS);
                setFilterOptions((current) => ({ ...current, kams: [] }));
                setFilterAnchorEl(null);
              }}
              sx={{ textTransform: 'none', fontWeight: 700, color: '#64748b' }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setFilters(draftFilters);
                setFilterAnchorEl(null);
              }}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', boxShadow: 'none' }}
            >
              Apply
            </Button>
          </Stack>
        </Stack>
      </Menu>

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
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            >
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
          {saveError && (
            <Box sx={{ mb: 2, px: 2, py: 1.5, borderRadius: '12px', border: '1px solid #fecaca', bgcolor: '#fff1f2' }}>
              <Typography sx={{ color: '#b91c1c', fontSize: '0.82rem', fontWeight: 600 }}>
                {saveError}
              </Typography>
            </Box>
          )}
          <TaskForm
            onCancel={() => setIsModalOpen(false)}
            onSubmit={handleActivitySubmit}
          />
        </DialogContent>
      </Dialog>

      <TaskDetails
        open={Boolean(detailTask)}
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onEdit={(task) => {
          if (task?.id) {
            window.open(`/tasks/${task.id}/edit`, '_blank', 'noopener,noreferrer');
          }
        }}
        onCancelTask={() => {}}
        onMarkComplete={() => {}}
        onCheckIn={() => {}}
        onRecordMeeting={() => {}}
      />
    </Box>
  );
}
