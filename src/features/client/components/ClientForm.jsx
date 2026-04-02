// src/features/clients/components/ClientForm.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box, Button, Stack, Paper, Divider, Typography, IconButton,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BusinessIcon           from '@mui/icons-material/Business';
import PinDropIcon            from '@mui/icons-material/PinDrop';
import SearchIcon             from '@mui/icons-material/Search';
import ClearIcon              from '@mui/icons-material/Clear';
import MyLocationIcon         from '@mui/icons-material/MyLocation';
import CloseIcon              from '@mui/icons-material/Close';
import AddLocationAltIcon     from '@mui/icons-material/AddLocationAlt';
import EditLocationAltIcon    from '@mui/icons-material/EditLocationAlt';

import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import TextInputField       from '../../../components/shared/TextInputField';
import NumberInputField     from '../../../components/shared/NumberInputField';

// ─── Mock fetchers ────────────────────────────────────────────────────────────
const fetchBusinessEntities = async () => [
  { id: 'be1', label: 'Race Online Ltd.' },
  { id: 'be2', label: 'Earth Telecommunication' },
  { id: 'be3', label: 'Orbit Internet' },
];
const fetchSource = async () => [
  { id: 'bt1', label: 'Facebook' },
  { id: 'bt2', label: 'Whatsapp' },
  { id: 'bt3', label: 'Website' },
];
const fetchDivisions = async () => [
  { id: 'd1', label: 'Dhaka' },
  { id: 'd2', label: 'Chittagong' },
  { id: 'd3', label: 'Sylhet' },
  { id: 'd4', label: 'Rajshahi' },
];
const fetchZones = async () => [
  { id: 'z1', label: 'Zone A' },
  { id: 'z2', label: 'Zone B' },
  { id: 'z3', label: 'Zone C' },
];
const fetchLicenseStatuses = async () => [
  { id: 'active',  label: 'Active' },
  { id: 'expired', label: 'Expired' },
  { id: 'pending', label: 'Pending' },
  { id: 'none',    label: 'None' },
];

// ─── Validation ───────────────────────────────────────────────────────────────
const clientSchema = Yup.object({
  name:          Yup.string().trim().required('Client name is required'),
  businessEntity:Yup.string().required('Business entity is required'),
  source:        Yup.string(),                                          // optional
  contactPerson: Yup.string().trim().required('Contact person is required'),
  contactNumber: Yup.string().trim().required('Contact number is required'),
  email:         Yup.string().email('Invalid email').required('Email is required'),
  address:       Yup.string().trim().required('Address is required'),
  division:      Yup.string().required('Division is required'),
  zone:          Yup.string().required('Zone is required'),
  licenseStatus: Yup.string(),                                          // optional
});

const INITIAL_VALUES = {
  name: '', businessEntity: '', source: '',
  contactPerson: '', contactNumber: '', email: '',
  address: '', division: '', zone: '', licenseStatus: '',
  location: null,
};

// ─── Map Location Picker (inside modal) ──────────────────────────────────────
function LocationPicker({ value, onChange }) {
  const mapRef       = useRef(null);
  const mapInstance  = useRef(null);
  const markerRef    = useRef(null);
  const inputRef     = useRef(null);
  const searchBoxRef = useRef(null);
  const [searchText, setSearchText] = useState(value?.address || '');
  const [mapReady,   setMapReady]   = useState(false);

  const reverseGeocode = useCallback((lat, lng) => {
    if (!window.google) return;
    new window.google.maps.Geocoder().geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const addr = results[0].formatted_address;
        setSearchText(addr);
        onChange({ address: addr, latitude: lat, longitude: lng });
      }
    });
  }, [onChange]);

  const placeMarker = useCallback((lat, lng) => {
    if (!mapInstance.current) return;
    const pos = { lat, lng };
    if (markerRef.current) {
      markerRef.current.setPosition(pos);
    } else {
      markerRef.current = new window.google.maps.Marker({
        position: pos, map: mapInstance.current,
        draggable: true, animation: window.google.maps.Animation.DROP,
      });
      markerRef.current.addListener('dragend', (e) =>
        reverseGeocode(e.latLng.lat(), e.latLng.lng()),
      );
    }
    mapInstance.current.panTo(pos);
  }, [reverseGeocode]);

  useEffect(() => {
    if (!mapRef.current || !window.google || mapInstance.current) return;
    const center = value?.latitude
      ? { lat: value.latitude, lng: value.longitude }
      : { lat: 23.8103, lng: 90.4125 };
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center, zoom: 13, disableDefaultUI: true, zoomControl: true,
      styles: [
        { featureType: 'poi',     stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    });
    mapInstance.current.addListener('click', (e) => {
      placeMarker(e.latLng.lat(), e.latLng.lng());
      reverseGeocode(e.latLng.lat(), e.latLng.lng());
    });
    if (value?.latitude) placeMarker(value.latitude, value.longitude);
    setMapReady(true);
  }, [value, placeMarker, reverseGeocode]);

  useEffect(() => {
    if (!mapReady || !inputRef.current || !window.google || searchBoxRef.current) return;
    searchBoxRef.current = new window.google.maps.places.SearchBox(inputRef.current);
    searchBoxRef.current.addListener('places_changed', () => {
      const places = searchBoxRef.current.getPlaces();
      if (!places?.length) return;
      const place = places[0];
      if (!place.geometry?.location) return;
      const lat  = place.geometry.location.lat();
      const lng  = place.geometry.location.lng();
      const addr = place.formatted_address || place.name;
      setSearchText(addr);
      placeMarker(lat, lng);
      mapInstance.current?.setZoom(15);
      onChange({ address: addr, latitude: lat, longitude: lng });
    });
  }, [mapReady, onChange, placeMarker]);

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      placeMarker(coords.latitude, coords.longitude);
      reverseGeocode(coords.latitude, coords.longitude);
      mapInstance.current?.setZoom(15);
    });
  };

  const handleClear = () => {
    setSearchText('');
    onChange(null);
    if (markerRef.current) { markerRef.current.setMap(null); markerRef.current = null; }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} mb={1.5}>
        <TextField
          inputRef={inputRef}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search for a location…"
          size="small" fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
              </InputAdornment>
            ),
            endAdornment: searchText ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClear}>
                  <ClearIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
            '& .MuiInputBase-input': { fontSize: '0.8125rem' },
          }}
        />
        <Button
          variant="outlined" onClick={handleMyLocation}
          sx={{
            minWidth: 42, width: 42, height: 40, p: 0, flexShrink: 0,
            borderColor: '#e2e8f0', borderRadius: '8px', color: '#2563eb',
            '&:hover': { borderColor: '#2563eb', bgcolor: '#eff6ff' },
          }}
        >
          <MyLocationIcon sx={{ fontSize: 18 }} />
        </Button>
      </Stack>

      <Box
        ref={mapRef}
        sx={{
          width: '100%', height: 320, borderRadius: '12px',
          border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: '#f8fafc',
        }}
      />

      {value?.address && (
        <Stack direction="row" spacing={1} alignItems="center" mt={1.5}
          sx={{ p: '8px 12px', bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
          <PinDropIcon sx={{ fontSize: 15, color: '#2563eb', flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 600, lineHeight: 1.4 }}>
            {value.address}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
function TextareaInputField({ name, label, value, onChange, onBlur, error, helperText, rows = 2 }) {
  return (
    <TextField
      name={name} label={label} value={value}
      onChange={onChange} onBlur={onBlur}
      error={error} helperText={helperText}
      variant="outlined" fullWidth multiline rows={rows} size="small"
      sx={{
        '& .MuiInputBase-input': { fontSize: '0.8125rem', lineHeight: 1.6 },
        '& .MuiInputLabel-root': { fontSize: '0.8125rem', transform: 'translate(14px, 10px) scale(1)' },
        '& .MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75)' },
        '& .MuiOutlinedInput-root': { borderRadius: '8px' },
      }}
    />
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, mt = 0.5 }) {
  return (
    <Box sx={{ gridColumn: '1 / -1', mt }}>
      <Stack direction="row" alignItems="center" spacing={0.75} mb={1.5}>
        {React.cloneElement(icon, { sx: { fontSize: 14, color: '#2563eb' } })}
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
          {title}
        </Typography>
      </Stack>
    </Box>
  );
}

// ─── Main ClientForm ──────────────────────────────────────────────────────────
export default function ClientForm({ onCancel, onSubmit }) {
  const navigate = useNavigate();
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [pendingLocation, setPendingLocation] = useState(null);

  const formik = useFormik({
    initialValues: INITIAL_VALUES,
    validationSchema: clientSchema,
    onSubmit: (values, { setSubmitting }) => {
      const payload = {
        name:          values.name.trim(),
        businessEntity:values.businessEntity,
        ...(values.source        ? { source: values.source }               : {}),
        contactPerson: values.contactPerson.trim(),
        contactNumber: values.contactNumber.trim(),
        email:         values.email.trim(),
        address:       values.address.trim(),
        division:      values.division,
        zone:          values.zone,
        ...(values.licenseStatus ? { licenseStatus: values.licenseStatus } : {}),
        ...(values.location      ? { location: values.location }           : {}),
      };
      onSubmit?.(payload);
      setSubmitting(false);
    },
  });

  const { values, errors, touched, isSubmitting, setFieldValue, handleBlur, handleChange, handleSubmit } = formik;

  const field = (name) => ({
    error:      Boolean(touched[name] && errors[name]),
    helperText: touched[name] && errors[name] ? errors[name] : ' ',
  });

  // Confirm location from modal
  const handleConfirmLocation = () => {
    if (pendingLocation) setFieldValue('location', pendingLocation);
    setMapModalOpen(false);
  };

  const handleOpenMap = () => {
    setPendingLocation(values.location);
    setMapModalOpen(true);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <form noValidate onSubmit={handleSubmit}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: '2px 20px',
            width: '100%',
          }}
        >

          {/* ── Basic Info ── */}
          <SectionHeader icon={<BusinessIcon />} title="Basic Information" />

          {/* Name full width */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextInputField
              name="name" label="Client Name *"
              value={values.name} onChange={handleChange} onBlur={handleBlur}
              {...field('name')}
            />
          </Box>

          <SelectDropdownSingle
            name="businessEntity" label="Business Entity *"
            fetchOptions={fetchBusinessEntities}
            value={values.businessEntity}
            onChange={(id) => setFieldValue('businessEntity', id)}
            onBlur={handleBlur}
            {...field('businessEntity')}
          />

          <SelectDropdownSingle
            name="source" label="Source"
            fetchOptions={fetchSource}
            value={values.source}
            onChange={(id) => setFieldValue('source', id)}
            onBlur={handleBlur}
            error={false} helperText=" "
          />

          <Box sx={{ gridColumn: '1 / -1', mt: 0.5, mb: 0.5 }}>
            <Divider />
          </Box>

          {/* ── Contact Info ── */}
          <SectionHeader icon={<BusinessIcon />} title="Contact Information" mt={1} />

          {/* Three fields in one row */}
          <Box sx={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: '4px 20px' }}>
            <TextInputField
              name="contactPerson" label="Contact Person *"
              value={values.contactPerson} onChange={handleChange} onBlur={handleBlur}
              {...field('contactPerson')}
            />
            <NumberInputField
              name="contactNumber" label="Contact Number *"
              value={values.contactNumber} onChange={handleChange} onBlur={handleBlur}
              {...field('contactNumber')}
            />
            <TextInputField
              name="email" label="Email *" type="email"
              value={values.email} onChange={handleChange} onBlur={handleBlur}
              {...field('email')}
            />
          </Box>

          {/* Address + location pin button on same row */}
          <Box sx={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'start' }}>
            <TextareaInputField
              name="address" label="Address *"
              value={values.address} onChange={handleChange} onBlur={handleBlur}
              {...field('address')}
            />

            {/* Location pin button */}
            <Stack alignItems="center" spacing={0.5} sx={{ pt: '2px' }}>
              <IconButton
                onClick={handleOpenMap}
                sx={{
                  width: 44, height: 44,
                  bgcolor: values.location ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${values.location ? '#bfdbfe' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  color: values.location ? '#2563eb' : '#94a3b8',
                  '&:hover': { bgcolor: '#eff6ff', borderColor: '#2563eb', color: '#2563eb' },
                  '&:focus': { outline: 'none' },
                }}
              >
                {values.location ? <EditLocationAltIcon fontSize="small" /> : <AddLocationAltIcon fontSize="small" />}
              </IconButton>
              <Typography sx={{ fontSize: '0.6rem', color: values.location ? '#2563eb' : '#94a3b8', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                {values.location ? 'Edit' : 'Pin'}
              </Typography>
            </Stack>
          </Box>

          {/* Pinned address preview pill */}
          {values.location?.address && (
            <Box sx={{ gridColumn: '1 / -1', mt: '-8px' }}>
              <Stack direction="row" spacing={1} alignItems="center"
                sx={{ p: '6px 10px', bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
                <PinDropIcon sx={{ fontSize: 13, color: '#2563eb', flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 600, lineHeight: 1.3, flex: 1 }} noWrap>
                  {values.location.address}
                </Typography>
                <IconButton size="small" onClick={() => setFieldValue('location', null)}
                  sx={{ p: 0.25, '&:focus': { outline: 'none' } }}>
                  <ClearIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                </IconButton>
              </Stack>
            </Box>
          )}

          <Box sx={{ gridColumn: '1 / -1', mt: 0.75, mb: 0.5 }}>
            <Divider />
          </Box>

          {/* ── Classification ── */}
          <SectionHeader icon={<BusinessIcon />} title="Classification" mt={1} />

          <SelectDropdownSingle
            name="division" label="Division *"
            fetchOptions={fetchDivisions}
            value={values.division}
            onChange={(id) => setFieldValue('division', id)}
            onBlur={handleBlur}
            {...field('division')}
          />

          <SelectDropdownSingle
            name="zone" label="Zone *"
            fetchOptions={fetchZones}
            value={values.zone}
            onChange={(id) => setFieldValue('zone', id)}
            onBlur={handleBlur}
            {...field('zone')}
          />

          <Box sx={{ gridColumn: '1 / -1' }}>
            <SelectDropdownSingle
              name="licenseStatus" label="License Status"
              fetchOptions={fetchLicenseStatuses}
              value={values.licenseStatus}
              onChange={(id) => setFieldValue('licenseStatus', id)}
              onBlur={handleBlur}
              error={false} helperText=" "
            />
          </Box>

        </Box>

        {/* ── Actions ── */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={1}>
          <Button
            fullWidth variant="outlined" onClick={onCancel}
            sx={{
              fontWeight: 600, borderRadius: '10px',
              borderColor: '#e2e8f0', color: '#64748b',
              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth type="submit" variant="contained"
            disabled={isSubmitting}
            startIcon={<CheckCircleOutlineIcon />}
            sx={{
              fontWeight: 700, borderRadius: '10px', bgcolor: '#2563eb',
              py: 1.2, boxShadow: 'none',
              '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' },
              '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
            }}
          >
            Create Client
          </Button>
        </Stack>
      </form>

      {/* ── Map Modal ── */}
      <Dialog
        open={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px', boxShadow: '0 8px 40px rgba(15,23,42,0.12)' },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1.5, borderBottom: '1px solid #f1f5f9' }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 34, height: 34, borderRadius: '9px',
              bgcolor: '#eff6ff', border: '1px solid #bfdbfe',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <PinDropIcon sx={{ fontSize: 17, color: '#2563eb' }} />
            </Box>
            <Box>
              <Typography fontWeight={700} fontSize="0.95rem" color="#0f172a">
                Pin Location
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Search, click on the map, or use your current location.
              </Typography>
            </Box>
            <Box flex={1} />
            <IconButton size="small" onClick={() => setMapModalOpen(false)}
              sx={{ color: '#94a3b8', '&:hover': { bgcolor: '#f1f5f9' }, '&:focus': { outline: 'none' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <LocationPicker
            value={pendingLocation}
            onChange={setPendingLocation}
          />
        </DialogContent>

        {/* Modal actions */}
        <Stack direction="row" spacing={1.5} sx={{ px: 3, py: 2, borderTop: '1px solid #f1f5f9' }}>
          <Button
            fullWidth variant="outlined"
            onClick={() => setMapModalOpen(false)}
            sx={{
              fontWeight: 600, borderRadius: '10px',
              borderColor: '#e2e8f0', color: '#64748b',
              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth variant="contained"
            disabled={!pendingLocation}
            onClick={handleConfirmLocation}
            startIcon={<PinDropIcon />}
            sx={{
              fontWeight: 700, borderRadius: '10px', bgcolor: '#2563eb',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1d4ed8' },
              '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
            }}
          >
            Confirm Location
          </Button>
        </Stack>
      </Dialog>
    </Box>
  );
}
