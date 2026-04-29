// src/features/tasks/components/TaskForm.jsx

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box, Button, Typography, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, InputAdornment, TextField, IconButton,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { subMinutes } from 'date-fns';

import DateTimePickerField      from '../../../components/shared/DateTimePickerField';
import SelectDropdownSingle     from '../../../components/shared/SelectDropdownSingle';
import TextInputField           from '../../../components/shared/TextInputField';
import TextAreaInputField       from '../../../components/shared/TextAreaInputField';
import AttachmentField          from '../../../components/shared/AttachmentField';
import CustomToggle             from '../../../components/shared/CustomToggle';
import FormActionButtons        from '../../../components/shared/FormActionButtons';
import useGoogleMapsLoader      from '../../../components/shared/useGoogleMapsLoader';
import CheckCircleOutlineIcon   from '@mui/icons-material/CheckCircleOutline';
import PinDropIcon              from '@mui/icons-material/PinDrop';
import SearchIcon               from '@mui/icons-material/Search';
import CloseIcon                from '@mui/icons-material/Close';
import MyLocationIcon           from '@mui/icons-material/MyLocation';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { buildMultipartFormData } from '../../../utils/formData';
import { useUserProfile } from '../../settings/context/UserProfileContext';
import { fetchSystemUsers } from '../../settings/api/settingsApi';
import { fetchTaskFormOptions } from '../api/taskApi';

const LIGHT_BORDER_COLOR = '#e3eaf2';
const LIGHT_BORDER_HOVER = '#d3deea';

const PHYSICAL_MEETING_TASK_TYPE_ID = '1';
const isPhysicalMeetingTaskType = (value) => String(value || '') === PHYSICAL_MEETING_TASK_TYPE_ID;

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
    location:    Yup.object().nullable().when('taskType', {
      is: (taskType) => isPhysicalMeetingTaskType(taskType),
      then: (schema) => schema.required('Meeting location is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    reminderAt: Yup.date().nullable().when('reminderEnabled', {
      is: true,
      then: (s) => s.required('Reminder time is required').test(
        'before-scheduled',
        'Reminder must be on or before the scheduled time',
        function validateReminderAt(value) {
          const scheduledAt = this.parent.scheduledAt;
          if (!value || !scheduledAt) return true;
          return new Date(value).getTime() <= new Date(scheduledAt).getTime();
        },
      ),
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
  reminderAt: null,
  reminderChannels: ['google_calendar', 'sms'],
};

// ─── REVERSE GEOCODE ────────────────────────
async function reverseGeocode(lat, lng) {
  return new Promise((resolve) => {
    if (!window.google) return resolve('');
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      resolve(status === 'OK' && results[0]
        ? results[0].formatted_address
        : ''
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
  const [locationError, setLocationError] = useState('');
  const { isLoaded, error: googleMapsError } = useGoogleMapsLoader();
  const canUseGoogleMaps = isLoaded && Boolean(window.google?.maps);
  const placeMarker = useCallback(({ lat, lng }) => {
    if (!mapInstance.current || !canUseGoogleMaps) return;
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
    } else {
      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng }, map: mapInstance.current,
        animation: window.google.maps.Animation.DROP,
      });
    }
  }, [canUseGoogleMaps]);

  useEffect(() => {
    if (!mapRef.current || !canUseGoogleMaps || mapInstance.current) return;
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
  }, [canUseGoogleMaps, value, placeMarker]); // eslint-disable-line

  useEffect(() => {
    if (!inputRef.current || !canUseGoogleMaps || !window.google || searchBoxRef.current) return;
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
  }, [canUseGoogleMaps, onChange, placeMarker]);

  function handleMyLocation() {
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Your browser does not support GPS location.');
      return;
    }

    setLoading(true);

    const requestCurrentPosition = () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          if (mapInstance.current) {
            mapInstance.current.panTo({ lat, lng });
            mapInstance.current.setZoom(16);
          }

          if (!canUseGoogleMaps) {
            setSearchQuery('');
            onChange({ address: '', latitude: lat, longitude: lng });
            setLoading(false);
            return;
          }

          placeMarker({ lat, lng });

          try {
            const address = await reverseGeocode(lat, lng);
            setSearchQuery(address);
            onChange({ address, latitude: lat, longitude: lng });
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          setLoading(false);

          if (error?.code === error.PERMISSION_DENIED) {
            setLocationError('Location access is blocked. Please enable browser permission for this site and try again.');
            return;
          }

          if (error?.code === error.POSITION_UNAVAILABLE) {
            setLocationError('Unable to determine your location right now.');
            return;
          }

          if (error?.code === error.TIMEOUT) {
            setLocationError('Location request timed out. Please try again.');
            return;
          }

          setLocationError('Unable to fetch your location.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    };

    if (navigator.permissions?.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((permission) => {
        if (permission.state === 'denied') {
          setLoading(false);
          setLocationError('Location access is blocked. Please enable browser permission for this site and try again.');
          return;
        }

        requestCurrentPosition();
      }).catch(() => {
        requestCurrentPosition();
      });
      return;
    }

    requestCurrentPosition();
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
          disabled={!canUseGoogleMaps}
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
          disabled={loading}
          sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          {loading ? 'Locating...' : 'My Location'}
        </Button>
      </Box>
      {locationError && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
          {locationError}
        </Typography>
      )}
      {!locationError && !canUseGoogleMaps && (
        <Typography variant="caption" color={googleMapsError ? 'error' : 'text.secondary'} sx={{ display: 'block', mb: 1 }}>
          {googleMapsError || 'Google Maps is unavailable right now. Use My Location to save coordinates.'}
        </Typography>
      )}
      {canUseGoogleMaps ? (
        <Box ref={mapRef} sx={{ height: 350, width: '100%', borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }} />
      ) : (
        <Box sx={{ height: 350, width: '100%', borderRadius: 1, overflow: 'hidden', border: '1px dashed', borderColor: 'divider', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Map preview is unavailable. Use My Location to set coordinates manually.
          </Typography>
        </Box>
      )}
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
export default function TaskForm({
  initialValues,
  onCancel,
  onSubmit,
  lockedAssociation = null,
  actionWidth = '100%',
}) {
  const { profile } = useUserProfile();
  const isEditMode = Boolean(initialValues);
  const startMode = lockedAssociation?.mode ?? (initialValues?.client ? 'client' : 'lead');
  const [mode, setMode]               = useState(startMode);
  const [locationOpen, setLocationOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState(null);
  const [userOptions, setUserOptions] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [optionData, setOptionData] = useState({
    leads: [],
    clients: [],
    task_types: [],
  });
  const [optionsLoading, setOptionsLoading] = useState(true);
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

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      try {
        setOptionsLoading(true);
        const data = await fetchTaskFormOptions();
        if (!active) {
          return;
        }

        setOptionData({
          leads: data.leads || [],
          clients: data.clients || [],
          task_types: data.task_types || [],
        });
      } catch {
        if (active) {
          setOptionData({
            leads: [],
            clients: [],
            task_types: [],
          });
        }
      } finally {
        if (active) {
          setOptionsLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  const formik = useFormik({
    initialValues: { ...DEFAULT_VALUES, ...(initialValues || {}) },
    validationSchema: taskSchema(effectiveMode),
    enableReinitialize: true,

    onSubmit: async (values, { setSubmitting }) => {
      try {
        const associationId = isAssociationLocked
          ? lockedAssociation.option.id
          : (effectiveMode === 'lead' ? values.lead : values.client);
        const totalAttachmentSize = values.attachment.reduce((sum, file) => sum + file.size, 0);
        if (totalAttachmentSize > 25 * 1024 * 1024) {
          return;
        }

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
            ? { lead_id: associationId }
            : { client_id: associationId }),
          assigned_to_user_id: assignedUser?.id || null,
          assignment_mode: isSelfAssignment ? 'self' : 'manual',
          task_type_id: values.taskType,
          title: values.title.trim(),
          details: values.details.trim(),
          scheduled_at: values.scheduledAt?.toISOString(),
          location: isPhysicalMeetingTaskType(values.taskType) && values.location
            ? { address: values.location.address, latitude: values.location.latitude, longitude: values.location.longitude }
            : null,
          attachment: values.attachment,
          reminder_enabled: values.reminderEnabled,
          reminder_at: values.reminderEnabled && values.reminderAt ? values.reminderAt.toISOString() : null,
          reminder_offset_minutes: null,
          reminder_channels: reminderChannels,
        };

        const formData = buildMultipartFormData(payload);
        await Promise.resolve(onSubmit?.(payload, formData));
      } catch (error) {
        console.error('Unable to save task:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, errors, touched, setFieldValue, handleChange, handleSubmit, isSubmitting } = formik;
  const assignToFetchOptions = useMemo(() => async () => userOptions, [userOptions]);
  const taskTypeFetchOptions = useMemo(() => async () => optionData.task_types, [optionData.task_types]);
  const leadFetchOptions = useMemo(() => async () => optionData.leads, [optionData.leads]);
  const clientFetchOptions = useMemo(() => async () => optionData.clients, [optionData.clients]);
  const lockedAssociationFetchOptions = useMemo(
    () => async () => (lockedAssociation?.option ? [lockedAssociation.option] : []),
    [lockedAssociation?.option],
  );

  const entity = {
    lead:   { name: 'lead',   label: 'Lead *',   fetch: leadFetchOptions },
    client: { name: 'client', label: 'Client *', fetch: clientFetchOptions },
  }[effectiveMode];

  const entityFetchOptions = isAssociationLocked
    ? lockedAssociationFetchOptions
    : entity.fetch;

  function handleOpenLocationDialog() {
    if (isEditMode) return;
    setTempLocation(values.location);
    setLocationOpen(true);
  }
  function handleConfirmLocation() {
    if (isEditMode) return;
    setFieldValue('location', tempLocation);
    setLocationOpen(false);
  }
  function handleCancelLocation() {
    setTempLocation(null);
    setLocationOpen(false);
  }
  function handleClearLocation() {
    if (isEditMode) return;
    setFieldValue('location', null);
  }

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

  useEffect(() => {
    if (!values.reminderEnabled || !values.scheduledAt) return;

    if (!values.reminderAt || values.reminderAt > values.scheduledAt) {
      setFieldValue('reminderAt', subMinutes(values.scheduledAt, 30), false);
    }
  }, [setFieldValue, values.reminderAt, values.reminderEnabled, values.scheduledAt]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>

      {/* ── Tab Switcher ── */}
      {!isAssociationLocked && (
        <Box
          sx={{
            display: 'inline-flex',
            flexWrap: 'wrap',
            maxWidth: '100%',
            bgcolor: '#f1f5f9',
            borderRadius: '12px',
            p: '4px',
            mb: 1.5,
            gap: 0.5,
          }}
        >
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
                  whiteSpace: 'normal',
                  textAlign: 'center',
                }}
              >
                {label}
              </Box>
            );
          })}
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5 }}>

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
          loading={optionsLoading}
        />

        {/* TASK TYPE */}
        <SelectDropdownSingle
          name="taskType"
          label="Task Type *"
          fetchOptions={taskTypeFetchOptions}
          value={values.taskType}
          onChange={(id) => {
            setFieldValue('taskType', id);
            if (isPhysicalMeetingTaskType(id) && !isEditMode) {
              handleOpenLocationDialog();
            } else {
              setFieldValue('location', null);
            }
          }}
          error={touched.taskType && Boolean(errors.taskType)}
          helperText={touched.taskType && errors.taskType}
          loading={optionsLoading}
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
            gap: 1.25,
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

        {/* LOCATION (physical meeting only) */}
        {isPhysicalMeetingTaskType(values.taskType) && (
          <Box sx={{ gridColumn: '1 / -1', mt: 0.5, mb: 0.5 }}>
            <TextField
              fullWidth
              label="Meeting Location"
              value={values.location?.address || ''}
              placeholder="No location selected — click to pick on map"
              size="small"
              disabled={isEditMode}
              error={Boolean(errors.location)}
              helperText={typeof errors.location === 'string' ? errors.location : ' '}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <PinDropIcon fontSize="small" color={values.location ? 'primary' : 'disabled'} />
                  </InputAdornment>
                ),
                endAdornment: values.location ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearLocation} disabled={isEditMode}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                '& .MuiInputBase-input': {
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: values.location ? 'primary.main' : LIGHT_BORDER_COLOR,
                  },
                  '&:hover fieldset': {
                    borderColor: values.location ? 'primary.main' : LIGHT_BORDER_HOVER,
                  },
                  '&.Mui-disabled': {
                    bgcolor: '#f8fafc',
                    color: '#334155',
                    '& fieldset': {
                      borderColor: LIGHT_BORDER_COLOR,
                    },
                  },
                },
              }}
              onClick={handleOpenLocationDialog}
            />
            {!isEditMode && (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                sx={{ mt: 1 }}
              >
                <Typography fontSize={12} color="text.secondary">
                  {values.location ? 'Update the pinned place if the meeting location changed.' : 'Pick a place from the map for physical meetings.'}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleOpenLocationDialog}
                  sx={{
                    textTransform: 'none',
                    alignSelf: { xs: 'stretch', sm: 'flex-start' },
                    minWidth: { sm: 112 },
                  }}
                >
                  {values.location ? 'Change location' : 'Pick location'}
                </Button>
              </Stack>
            )}
            {isEditMode && (
              <Typography fontSize={12} color="text.secondary" mt={0.75}>
                Location is locked for existing tasks.
              </Typography>
            )}
          </Box>
        )}

        <Box
          sx={{
            gridColumn: '1 / -1',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 1.25,
            alignItems: 'center',
          }}
        >
          <Box sx={{ alignSelf: 'stretch' }}>
            <AttachmentField
              label=""
              value={values.attachment}
              onChange={(files) => setFieldValue('attachment', files)}
            />
          </Box>

          <Box
            sx={{
              alignSelf: 'center',
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.25}
              alignItems={{ xs: 'stretch', md: 'center' }}
              sx={{ width: '100%' }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.25}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{ minWidth: 0, flexShrink: 0 }}
              >
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
                <Typography fontSize={14} fontWeight={700} color="#0f172a" sx={{ whiteSpace: { xs: 'normal', sm: 'nowrap' } }}>
                  Set Reminder
                </Typography>
                <CustomToggle
                  size="md"
                  checked={values.reminderEnabled}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setFieldValue('reminderEnabled', checked);
                    setFieldValue('reminderAt', checked && values.scheduledAt ? subMinutes(values.scheduledAt, 30) : null);
                  }}
                  label={values.reminderEnabled ? 'On' : 'Off'}
                />
              </Stack>

              <Box
                sx={{
                  width: { xs: '100%', md: 300 },
                  minWidth: 0,
                  minHeight: { xs: 'auto', md: 88 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    visibility: values.reminderEnabled ? 'visible' : 'hidden',
                  }}
                >
                  <DateTimePickerField
                    name="reminderAt"
                    label="Reminder Date & Time"
                    value={values.reminderAt}
                    onChange={(v) => setFieldValue('reminderAt', v)}
                    error={touched.reminderAt && Boolean(errors.reminderAt)}
                    helperText={touched.reminderAt ? errors.reminderAt : (values.scheduledAt ? 'Must be on or before the scheduled time.' : 'Choose a scheduled time first.')}
                    disablePast
                    maxDateTime={values.scheduledAt || null}
                    disabled={!values.scheduledAt}
                    fullWidth
                  />
                </Box>
              </Box>
            </Stack>
          </Box>
        </Box>
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
      <FormActionButtons
        onCancel={onCancel}
        submitLabel="Save Task"
        submitIcon={<CheckCircleOutlineIcon />}
        loading={isSubmitting}
        disabled={isSubmitting}
        mt={3}
        width={actionWidth}
        containerSx={{
          justifyContent: { xs: 'stretch', sm: 'flex-end' },
        }}
        cancelSx={{
          flex: { xs: 1, sm: '0 0 140px' },
          maxWidth: { xs: '100%', sm: 160 },
        }}
        submitSx={{
          flex: { xs: 1, sm: '0 0 160px' },
          maxWidth: { xs: '100%', sm: 180 },
        }}
      />
    </Box>
  );
}
