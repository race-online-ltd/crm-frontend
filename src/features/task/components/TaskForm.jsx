// src/features/tasks/components/TaskForm.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Typography, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, InputAdornment, TextField, IconButton, Tabs, Tab,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import DateTimePickerField      from '../../../components/shared/DateTimePickerField';
import SelectDropdownSingle     from '../../../components/shared/SelectDropdownSingle';
import TextInputField           from '../../../components/shared/TextInputField';
import CheckCircleOutlineIcon   from '@mui/icons-material/CheckCircleOutline';
import PinDropIcon              from '@mui/icons-material/PinDrop';
import SearchIcon               from '@mui/icons-material/Search';
import CloseIcon                from '@mui/icons-material/Close';
import MyLocationIcon           from '@mui/icons-material/MyLocation';

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
    details:     Yup.string().trim().required('Details is required'),
    scheduledAt: Yup.date().nullable().required('Scheduled time is required'),
    location:    Yup.object().nullable(),
  });

// ─── DEFAULT INITIAL VALUES ─────────────────
const DEFAULT_VALUES = {
  lead:        '',
  client:      '',
  taskType:    '',
  title:       '',
  details:     '',
  scheduledAt: null,
  location:    null,
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
export default function TaskForm({ initialValues, onCancel, onSubmit }) {
  const startMode = initialValues?.client ? 'client' : 'lead';
  const [mode, setMode]               = useState(startMode);
  const [locationOpen, setLocationOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState(null);

  const formik = useFormik({
    initialValues: initialValues ?? DEFAULT_VALUES,
    validationSchema: taskSchema(mode),
    enableReinitialize: true,

    onSubmit: (values, { setSubmitting }) => {
      const payload = {
        ...(mode === 'lead' ? { leadId: values.lead } : { clientId: values.client }),
        taskType:    values.taskType,
        title:       values.title.trim(),
        details:     values.details.trim(),
        scheduledAt: values.scheduledAt?.toISOString(),
        location: values.location
          ? { address: values.location.address, latitude: values.location.latitude, longitude: values.location.longitude }
          : null,
      };
      onSubmit?.(payload);
      setSubmitting(false);
    },
  });

  const { values, errors, touched, setFieldValue, handleChange, handleSubmit, isSubmitting } = formik;

  // Handle switching between tabs
  const handleTabChange = (event, newValue) => {
    setMode(newValue);
    // Reset specific fields when switching modes
    setFieldValue('lead', '');
    setFieldValue('client', '');
  };

  const entity = {
    lead:   { name: 'lead',   label: 'Lead *',   fetch: fetchLeads },
    client: { name: 'client', label: 'Client *', fetch: fetchClients },
  }[mode];

  function handleOpenLocationDialog() { setTempLocation(values.location); setLocationOpen(true); }
  function handleConfirmLocation()    { setFieldValue('location', tempLocation); setLocationOpen(false); }
  function handleCancelLocation()     { setTempLocation(null); setLocationOpen(false); }
  function handleClearLocation()      { setFieldValue('location', null); }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>

      {/* TAB SELECTOR */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={mode} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          indicatorColor="primary" 
          textColor="primary"
        >
          <Tab label="Lead Based" value="lead" sx={{ fontWeight: 600 }} />
          <Tab label="Client Based" value="client" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>

        {/* ENTITY */}
        <SelectDropdownSingle
          name={entity.name}
          label={entity.label}
          fetchOptions={entity.fetch}
          value={values[entity.name]}
          onChange={(id) => setFieldValue(entity.name, id)}
          error={touched[entity.name] && Boolean(errors[entity.name])}
          helperText={touched[entity.name] && errors[entity.name]}
        />

        {/* TASK TYPE */}
        <SelectDropdownSingle
          name="taskType"
          label="Task Type *"
          fetchOptions={async () => TASK_TYPE_OPTIONS}
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

        {/* TITLE */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <TextInputField
            name="title" label="Title *"
            value={values.title} onChange={handleChange}
            error={touched.title && Boolean(errors.title)}
            helperText={touched.title && errors.title}
          />
        </Box>

        {/* DETAILS */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <TextInputField
            name="details" label="Details *"
            value={values.details} onChange={handleChange}
            multiline rows={4}
            error={touched.details && Boolean(errors.details)}
            helperText={touched.details && errors.details}
          />
        </Box>

        {/* DATE */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <DateTimePickerField
            label="Scheduled Time *"
            value={values.scheduledAt}
            onChange={(v) => setFieldValue('scheduledAt', v)}
            error={touched.scheduledAt && Boolean(errors.scheduledAt)}
            helperText={touched.scheduledAt && errors.scheduledAt}
          />
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
                '& fieldset': { borderColor: values.location ? 'primary.main' : undefined },
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
      <Stack direction="row" spacing={2} mt={2.5}>
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