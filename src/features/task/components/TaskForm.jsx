// src/features/tasks/components/TaskForm.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box, Button, Typography, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, InputAdornment, TextField, IconButton,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import DateTimePickerField      from '../../../components/shared/DateTimePickerField';
import SelectDropdownSingle     from '../../../components/shared/SelectDropdownSingle';
import TextInputField           from '../../../components/shared/TextInputField';
import TextAreaInputField       from '../../../components/shared/TextAreaInputField';
import AttachmentField          from '../../../components/shared/AttachmentField';
import CustomToggle             from '../../../components/shared/CustomToggle';
import CheckCircleOutlineIcon   from '@mui/icons-material/CheckCircleOutline';
import PinDropIcon              from '@mui/icons-material/PinDrop';
import SearchIcon               from '@mui/icons-material/Search';
import CloseIcon                from '@mui/icons-material/Close';
import MyLocationIcon           from '@mui/icons-material/MyLocation';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { buildMultipartFormData } from '../../../utils/formData';
import { useUserProfile } from '../../settings/context/UserProfileContext';
import { fetchSystemUsers } from '../../settings/api/settingsApi';

const LIGHT_BORDER_COLOR = '#e3eaf2';
const LIGHT_BORDER_HOVER = '#d3deea';

// ─── MOCK DATA ─────────────────────────────
const fetchLeads = async () => [
  { id: 'l1', label: 'Alpha Corp – Product Alpha' },
  { id: 'l2', label: 'Nexus Solutions – Product Beta' },
  { id: 'l3', label: 'Global Systems – Product Gamma' },
];

const fetchClients = async () => [
  { id: 'c1', label: 'Alpha Client' },
  { id: 'c2', label: 'Beta Client' },
  { id: 'c3', label: 'Gamma Client' },
];

const TASK_TYPE_OPTIONS = [
  { id: 'call',             label: 'Call' },
  { id: 'physical_meeting', label: 'Physical Meeting' },
  { id: 'virtual_meeting',  label: 'Virtual Meeting' },
  { id: 'follow_up',        label: 'Follow Up' },
];

const REMINDER_TIME_OPTIONS = [
  { id: '15', label: '15 minutes before' },
  { id: '30', label: '30 minutes before' },
  { id: '60', label: '1 hour before' },
  { id: '180', label: '3 hours before' },
  { id: '1440', label: '1 day before' },
];

// ─── VALIDATION ─────────────────────────────
const taskSchema = (mode) =>
  Yup.object({
    lead: Yup.string().when([], {
      is: () => mode === 'lead',
      then: (s) => s.required('Lead is required'),
      otherwise: (s) => s.notRequired(),
    }),
    client: Yup.string().when([], {
      is: () => mode === 'client',
      then: (s) => s.required('Client is required'),
      otherwise: (s) => s.notRequired(),
    }),
    taskType:    Yup.string().required('Task type is required'),
    title:       Yup.string().trim().required('Title is required'),
    scheduledAt: Yup.date().nullable().required('Scheduled time is required'),
    location:    Yup.object().nullable(),
    reminderOffsetMinutes: Yup.string().when('reminderEnabled', {
      is: true,
      then: (s) => s.required('Reminder time is required'),
      otherwise: (s) => s.notRequired(),
    }),
  });

// ─── DEFAULT INITIAL VALUES ─────────────────
const DEFAULT_VALUES = {
  assignToUserId: '',
  lead:        '',
  client:      '',
  taskType:    '',
  title:       '',
  details:     '',
  scheduledAt: null,
  location:    null,
  attachment:  [],
  reminderEnabled: false,
  reminderOffsetMinutes: '30',
  reminderChannels: ['google_calendar', 'sms'],
};

// ─── REVERSE GEOCODE ────────────────────────
async function reverseGeocode(lat, lng) {
  return new Promise((resolve) => {
    if (!window.google) return resolve(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      resolve(status === 'OK' && results[0]
        ? results[0].formatted_address
        : `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      );
    });
  });
}

// ─── LOCATION PICKER ────────────────────────
function LocationPicker({ value, onChange }) {
  const mapRef       = useRef(null);
  const mapInstance  = useRef(null);
  const markerRef    = useRef(null);
  const searchBoxRef = useRef(null);
  const inputRef     = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading]         = useState(false);

  function placeMarker({ lat, lng }) {
    if (!mapInstance.current) return;
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
    } else {
      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng }, map: mapInstance.current,
        animation: window.google.maps.Animation.DROP,
      });
    }
  }

  useEffect(() => {
    if (!mapRef.current || !window.google || mapInstance.current) return;
    const center = value?.latitude
      ? { lat: value.latitude, lng: value.longitude }
      : { lat: 23.8103, lng: 90.4125 };

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center, zoom: 13,
      mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
    });

    if (value?.latitude) {
      markerRef.current = new window.google.maps.Marker({
        position: center, map: mapInstance.current,
        animation: window.google.maps.Animation.DROP,
      });
    }

    mapInstance.current.addListener('click', async (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      placeMarker({ lat, lng });
      setLoading(true);
      const address = await reverseGeocode(lat, lng);
      setLoading(false);
      onChange({ address, latitude: lat, longitude: lng });
    });
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!inputRef.current || !window.google || searchBoxRef.current) return;
    searchBoxRef.current = new window.google.maps.places.SearchBox(inputRef.current);
    searchBoxRef.current.addListener('places_changed', () => {
      const places = searchBoxRef.current.getPlaces();
      if (!places?.length) return;
      const place = places[0];
      if (!place.geometry?.location) return;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || place.name || '';
      if (mapInstance.current) { mapInstance.current.panTo({ lat, lng }); mapInstance.current.setZoom(16); }
      placeMarker({ lat, lng });
      onChange({ address, latitude: lat, longitude: lng });
      setSearchQuery(address);
    });
  }, [onChange]);

  function handleMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      if (mapInstance.current) { mapInstance.current.panTo({ lat, lng }); mapInstance.current.setZoom(16); }
      placeMarker({ lat, lng });
      setLoading(true);
      const address = await reverseGeocode(lat, lng);
      setLoading(false);
      setSearchQuery(address);
      onChange({ address, latitude: lat, longitude: lng });
    });
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <TextField
          inputRef={inputRef}
          fullWidth size="small"
          placeholder="Search for a place or address…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>,
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}><CloseIcon fontSize="small" /></IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: LIGHT_BORDER_COLOR },
              '&:hover fieldset': { borderColor: LIGHT_BORDER_HOVER },
            },
          }}
        />
        <Button variant="outlined" size="small" onClick={handleMyLocation}
          startIcon={<MyLocationIcon fontSize="small" />}
          sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          My Location
        </Button>
      </Box>
      <Box ref={mapRef} sx={{ height: 350, width: '100%', borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }} />
      {value?.address && (
        <Box sx={{ mt: 1.5, px: 1.5, py: 1, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PinDropIcon fontSize="small" color="primary" />
          <Typography variant="body2" color="text.secondary" noWrap>
            {loading ? 'Fetching address…' : value.address}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ─── MAIN COMPONENT ─────────────────────────
export default function TaskForm({ initialValues, onCancel, onSubmit, lockedAssociation = null }) {
  const { profile } = useUserProfile();
  const startMode = lockedAssociation?.mode ?? (initialValues?.client ? 'client' : 'lead');
  const [mode, setMode]               = useState(startMode);
  const [locationOpen, setLocationOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState(null);
  const [userOptions, setUserOptions] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const isAssociationLocked = Boolean(lockedAssociation?.mode && lockedAssociation?.option);
  const effectiveMode = isAssociationLocked ? lockedAssociation.mode : mode;
  const isKamUser = String(profile?.role || '').trim().toLowerCase() === 'kam';

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      try {
        setUsersLoading(true);
        const response = await fetchSystemUsers();
        if (!active) {
          return;
        }

        setUserOptions((response.data || []).map((user) => ({
          id: String(user.id),
          label: `${user.full_name}${user.role_name ? ` (${user.role_name})` : ''}`,
          role: user.role_name || '',
          userName: user.user_name || '',
          fullName: user.full_name || '',
        })));
      } catch {
        if (active) {
          setUserOptions([]);
        }
      } finally {
        if (active) {
          setUsersLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  const formik = useFormik({
    initialValues: { ...DEFAULT_VALUES, ...(initialValues || {}) },
    validationSchema: taskSchema(effectiveMode),
    enableReinitialize: true,

    onSubmit: (values, { setSubmitting }) => {
      const associationId = isAssociationLocked
        ? lockedAssociation.option.id
        : (effectiveMode === 'lead' ? values.lead : values.client);
      const associationLabel = isAssociationLocked
        ? lockedAssociation.option.label
        : (effectiveMode === 'lead'
          ? fetchLeads().then((options) => options.find((option) => option.id === values.lead)?.label || '')
          : fetchClients().then((options) => options.find((option) => option.id === values.client)?.label || ''));
      const totalAttachmentSize = values.attachment.reduce((sum, file) => sum + file.size, 0);
      if (totalAttachmentSize > 25 * 1024 * 1024) {
        setSubmitting(false);
        return;
      }

      Promise.resolve(associationLabel)
        .then((resolvedAssociationLabel) => {
          const reminderChannels = values.reminderEnabled ? ['google_calendar', 'sms'] : [];
          const selectedUser = userOptions.find((option) => option.id === values.assignToUserId) || null;
          const currentUser = {
            id: profile?.id ?? null,
            fullName: profile?.fullName || profile?.userName || 'Current User',
            role: profile?.role || '',
          };
          const assignedUser = selectedUser || currentUser;
          const isSelfAssignment = !selectedUser || String(assignedUser.id) === String(currentUser.id);
          const payload = {
            ...(effectiveMode === 'lead'
              ? { leadId: associationId, leadName: resolvedAssociationLabel }
              : { clientId: associationId, clientName: resolvedAssociationLabel }),
            assignedToUserId: assignedUser?.id || null,
            assignedToUserName: assignedUser?.fullName || null,
            assignedToUserRole: assignedUser?.role || null,
            assignedToKamId: assignedUser?.id || null,
            assignedToKamName: assignedUser?.fullName || null,
            assignmentMode: isSelfAssignment ? 'self' : 'manual',
            createdByUserId: currentUser.id,
            createdByUserName: currentUser.fullName,
            createdByUserRole: currentUser.role,
            taskType:    values.taskType,
            title:       values.title.trim(),
            details:     values.details.trim(),
            scheduledAt: values.scheduledAt?.toISOString(),
            location: values.location
              ? { address: values.location.address, latitude: values.location.latitude, longitude: values.location.longitude }
              : null,
            attachment: values.attachment,
            reminderEnabled: values.reminderEnabled,
            reminderOffsetMinutes: values.reminderEnabled ? Number(values.reminderOffsetMinutes) : null,
            reminderChannels,
            reminder: {
              enabled: values.reminderEnabled,
              offsetMinutes: values.reminderEnabled ? Number(values.reminderOffsetMinutes) : null,
              channels: reminderChannels,
            },
          };
          const formData = buildMultipartFormData(payload);
          onSubmit?.(payload, formData);
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
  });

  const { values, errors, touched, setFieldValue, handleChange, handleSubmit, isSubmitting } = formik;
  const assignToFetchOptions = useMemo(() => async () => userOptions, [userOptions]);
  const taskTypeFetchOptions = useMemo(() => async () => TASK_TYPE_OPTIONS, []);
  const reminderFetchOptions = useMemo(() => async () => REMINDER_TIME_OPTIONS, []);

  const entity = {
    lead:   { name: 'lead',   label: 'Lead *',   fetch: fetchLeads },
    client: { name: 'client', label: 'Client *', fetch: fetchClients },
  }[effectiveMode];

  const entityFetchOptions = isAssociationLocked
    ? async () => [lockedAssociation.option]
    : entity.fetch;

  function handleOpenLocationDialog() { setTempLocation(values.location); setLocationOpen(true); }
  function handleConfirmLocation()    { setFieldValue('location', tempLocation); setLocationOpen(false); }
  function handleCancelLocation()     { setTempLocation(null); setLocationOpen(false); }
  function handleClearLocation()      { setFieldValue('location', null); }

  useEffect(() => {
    if (!userOptions.length) return;
    if (values.assignToUserId) return;
    if (!isKamUser || !profile?.id) return;

    const currentUserId = String(profile.id);
    const hasCurrentUser = userOptions.some((option) => option.id === currentUserId);
    if (hasCurrentUser) {
      setFieldValue('assignToUserId', currentUserId, false);
    }
  }, [isKamUser, profile?.id, setFieldValue, userOptions, values.assignToUserId]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>

      {/* ── Tab Switcher ── */}
      {!isAssociationLocked && (
        <Box sx={{ display: 'inline-flex', bgcolor: '#f1f5f9', borderRadius: '12px', p: '4px', mb: 1.5 }}>
          {['Lead Based', 'Client Based'].map((label, i) => {
            const tabValue = i === 0 ? 'lead' : 'client';
            return (
              <Box
                key={label}
                onClick={() => {
                  setMode(tabValue);
                  setFieldValue('lead', '');
                  setFieldValue('client', '');
                }}
                sx={{
                  px: 2.5, py: 0.8, borderRadius: '9px', cursor: 'pointer',
                  fontSize: '0.825rem',
                  fontWeight: effectiveMode === tabValue ? 700 : 500,
                  color:     effectiveMode === tabValue ? '#1e293b' : '#64748b',
                  bgcolor:   effectiveMode === tabValue ? '#fff' : 'transparent',
                  boxShadow: effectiveMode === tabValue ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.18s ease',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </Box>
            );
          })}
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1 }}>

        {/* ENTITY */}
        <SelectDropdownSingle
          name={entity.name}
          label={entity.label}
          fetchOptions={entityFetchOptions}
          value={values[entity.name]}
          onChange={(id) => setFieldValue(entity.name, id)}
          error={touched[entity.name] && Boolean(errors[entity.name])}
          helperText={touched[entity.name] && errors[entity.name]}
          disabled={isAssociationLocked}
          searchable={!isAssociationLocked}
        />

        {/* TASK TYPE */}
        <SelectDropdownSingle
          name="taskType"
          label="Task Type *"
          fetchOptions={taskTypeFetchOptions}
          value={values.taskType}
          onChange={(id) => {
            setFieldValue('taskType', id);
            if (id === 'physical_meeting') {
              handleOpenLocationDialog();
            } else {
              setFieldValue('location', null);
            }
          }}
          error={touched.taskType && Boolean(errors.taskType)}
          helperText={touched.taskType && errors.taskType}
        />

        <Box sx={{ minWidth: 0 }}>
          <SelectDropdownSingle
            name="assignToUserId"
            label="Assign to"
            placeholder="Search user"
            fetchOptions={assignToFetchOptions}
            value={values.assignToUserId}
            onChange={(id) => setFieldValue('assignToUserId', id)}
            loading={usersLoading}
            fullWidth
          />
        </Box>

        <Box
          sx={{
            gridColumn: '1 / -1',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 1,
          }}
        >
          {/* TITLE */}
          <Box>
            <TextInputField
              name="title" label="Title *"
              value={values.title} onChange={handleChange}
              error={touched.title && Boolean(errors.title)}
              helperText={touched.title && errors.title}
            />
          </Box>

          {/* DATE */}
          <Box>
            <DateTimePickerField
              label="Scheduled Time *"
              value={values.scheduledAt}
              onChange={(v) => setFieldValue('scheduledAt', v)}
              error={touched.scheduledAt && Boolean(errors.scheduledAt)}
              helperText={touched.scheduledAt && errors.scheduledAt}
            />
          </Box>
        </Box>

        {/* DETAILS */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <TextAreaInputField
            name="details" label="Details"
            value={values.details} onChange={handleChange}
            minRows={2}
            maxRows={8}
            resize="vertical"
            error={touched.details && Boolean(errors.details)}
            helperText={touched.details && errors.details}
          />
        </Box>

        <Box
          sx={{
            gridColumn: '1 / -1',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 1,
            alignItems: 'start',
          }}
        >
          <Box>
            <AttachmentField
              label="Attachment"
              value={values.attachment}
              onChange={(files) => setFieldValue('attachment', files)}
            />
          </Box>

          <Box
            sx={{
              alignSelf: { xs: 'stretch', md: 'center' },
              mt: { xs: 0, md: 1.5 },
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.25}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              sx={{ width: '100%' }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flexShrink: 0 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '10px',
                    bgcolor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <NotificationsActiveOutlinedIcon sx={{ fontSize: 17, color: '#2563eb' }} />
                </Box>
                <Typography fontSize={14} fontWeight={700} color="#0f172a" sx={{ whiteSpace: 'nowrap' }}>
                  Set Reminder
                </Typography>
                <CustomToggle
                  size="md"
                  checked={values.reminderEnabled}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setFieldValue('reminderEnabled', checked);

                    if (!checked) {
                      setFieldValue('reminderOffsetMinutes', DEFAULT_VALUES.reminderOffsetMinutes);
                    }
                  }}
                  label={values.reminderEnabled ? 'On' : 'Off'}
                />
              </Stack>

              {values.reminderEnabled && (
                <Box
                  sx={{
                    width: { xs: '100%', md: 190 },
                    minWidth: { xs: '100%', md: 190 },
                    ml: { xs: 0, md: 0.5 },
                    mt: { xs: 0, md: 0.75 },
                  }}
                >
                  <SelectDropdownSingle
                    name="reminderOffsetMinutes"
                    label="Remind Before"
                    fetchOptions={reminderFetchOptions}
                    value={values.reminderOffsetMinutes}
                    onChange={(id) => setFieldValue('reminderOffsetMinutes', id)}
                    error={touched.reminderOffsetMinutes && Boolean(errors.reminderOffsetMinutes)}
                    helperText={touched.reminderOffsetMinutes ? errors.reminderOffsetMinutes : ' '}
                    fullWidth
                  />
                </Box>
              )}
            </Stack>
          </Box>
        </Box>

        {/* LOCATION (physical meeting only) */}
        {values.taskType === 'physical_meeting' && (
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextField
              fullWidth
              label="Meeting Location"
              value={values.location?.address || ''}
              placeholder="No location selected — click to pick on map"
              size="small"
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <PinDropIcon fontSize="small" color={values.location ? 'primary' : 'disabled'} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Stack direction="row" spacing={0.5}>
                      <Button size="small" onClick={handleOpenLocationDialog} sx={{ fontSize: 12 }}>
                        {values.location ? 'Change' : 'Pick'}
                      </Button>
                      {values.location && (
                        <IconButton size="small" onClick={handleClearLocation}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInputBase-input': { cursor: 'pointer' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: values.location ? 'primary.main' : LIGHT_BORDER_COLOR,
                  },
                  '&:hover fieldset': {
                    borderColor: values.location ? 'primary.main' : LIGHT_BORDER_HOVER,
                  },
                },
              }}
              onClick={handleOpenLocationDialog}
            />
          </Box>
        )}
      </Box>

      {/* LOCATION DIALOG */}
      <Dialog
        open={locationOpen}
        onClose={handleCancelLocation}
        fullWidth maxWidth="md"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PinDropIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>Select Meeting Location</Typography>
          </Box>
          <IconButton size="small" onClick={handleCancelLocation}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <LocationPicker value={tempLocation} onChange={(loc) => setTempLocation(loc)} />
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5, gap: 1 }}>
          <Button onClick={handleCancelLocation} variant="outlined" color="inherit">Cancel</Button>
          <Button
            onClick={handleConfirmLocation}
            variant="contained"
            disabled={!tempLocation}
            startIcon={<CheckCircleOutlineIcon />}
          >
            Confirm Location
          </Button>
        </DialogActions>
      </Dialog>

      {/* FORM ACTIONS */}
      <Stack direction="row" spacing={2} mt={3}>
        <Button onClick={onCancel} variant="outlined" fullWidth disabled={isSubmitting}>Cancel</Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<CheckCircleOutlineIcon />}
          fullWidth
          loading={isSubmitting}
        >
          Save Task
        </Button>
      </Stack>
    </Box>
  );
}
