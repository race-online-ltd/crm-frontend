import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Paper,
  Divider,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BusinessIcon from '@mui/icons-material/Business';
import PinDropIcon from '@mui/icons-material/PinDrop';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CloseIcon from '@mui/icons-material/Close';
import MapIcon from '@mui/icons-material/Map';

import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import TextInputField from '../../../components/shared/TextInputField';
import NumberInputField from '../../../components/shared/NumberInputField';
import {
  createClient,
  fetchAreas,
  fetchBusinessEntities,
  updateClient,
} from '../api/clientApi';

const SOURCE_OPTIONS = [
  { id: 'Prism', label: 'Prism' },
  { id: 'MQ', label: 'MQ' },
  { id: 'maxim Orbit', label: 'maxim Orbit' },
  { id: 'maxim Race', label: 'maxim Race' },
];

const clientSchema = Yup.object({
  name: Yup.string().trim().required('Client name is required'),
  businessEntity: Yup.mixed().required('Business entity is required'),
  source: Yup.string().required('Source is required'),
  contactPerson: Yup.string().trim().required('Contact person is required'),
  contactNumber: Yup.string().trim().required('Contact number is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  address: Yup.string().trim().required('Address is required'),
  division: Yup.mixed().required('Division is required'),
  district: Yup.mixed().required('District is required'),
  thana: Yup.mixed().required('Thana is required'),
  licenseStatus: Yup.string().required('License status is required'),
});

function buildInitialValues(client) {
  return {
    clientId: client?.client_id || '',
    name: client?.client_name || '',
    businessEntity: client?.business_entity_id ? Number(client.business_entity_id) : '',
    source: client?.client_from || '',
    contactPerson: client?.contact_person || '',
    contactNumber: client?.contact_no || '',
    email: client?.email || '',
    address: client?.address || '',
    division: client?.division_id ? Number(client.division_id) : '',
    district: client?.district_id ? Number(client.district_id) : '',
    thana: client?.thana_id ? Number(client.thana_id) : '',
    licenseStatus: client?.licence || '',
    location:
      client?.lat !== null && client?.lat !== undefined && client?.long !== null && client?.long !== undefined
        ? {
            address: client?.address || '',
            latitude: Number(client.lat),
            longitude: Number(client.long),
          }
        : null,
  };
}

function TextareaInputField({ name, label, value, onChange, onBlur, error, helperText, rows = 2, disabled = false }) {
  return (
    <TextField
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      variant="outlined"
      fullWidth
      multiline
      rows={rows}
      size="small"
      disabled={disabled}
      sx={{
        '& .MuiInputBase-input': { fontSize: '0.8125rem', lineHeight: 1.6 },
        '& .MuiInputLabel-root': { fontSize: '0.8125rem', transform: 'translate(14px, 10px) scale(1)' },
        '& .MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75)' },
        '& .MuiOutlinedInput-root': { borderRadius: '8px' },
      }}
    />
  );
}

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

function LocationPicker({ value, onChange }) {
  const mapRef = React.useRef(null);
  const mapInstance = React.useRef(null);
  const markerRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const searchBoxRef = React.useRef(null);
  const [searchText, setSearchText] = useState(value?.address || '');

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
        position: pos,
        map: mapInstance.current,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
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
      center,
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    });

    mapInstance.current.addListener('click', (e) => {
      placeMarker(e.latLng.lat(), e.latLng.lng());
      reverseGeocode(e.latLng.lat(), e.latLng.lng());
    });

    if (value?.latitude) {
      placeMarker(value.latitude, value.longitude);
    }
  }, [value, placeMarker, reverseGeocode]);

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
      const addr = place.formatted_address || place.name;
      setSearchText(addr);
      placeMarker(lat, lng);
      mapInstance.current?.setZoom(15);
      onChange({ address: addr, latitude: lat, longitude: lng });
    });
  }, [onChange, placeMarker]);

  return (
    <Box>
      <Stack direction="row" spacing={1} mb={1.5}>
        <TextField
          inputRef={inputRef}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search for a location…"
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
              </InputAdornment>
            ),
            endAdornment: searchText ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => { setSearchText(''); onChange(null); }}>
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
          variant="outlined"
          onClick={() => {
            if (!navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition(({ coords }) => {
              placeMarker(coords.latitude, coords.longitude);
              reverseGeocode(coords.latitude, coords.longitude);
              mapInstance.current?.setZoom(15);
            });
          }}
          sx={{
            minWidth: 42,
            width: 42,
            height: 40,
            p: 0,
            flexShrink: 0,
            borderColor: '#e2e8f0',
            borderRadius: '8px',
            color: '#2563eb',
            '&:hover': { borderColor: '#2563eb', bgcolor: '#eff6ff' },
          }}
        >
          <MyLocationIcon sx={{ fontSize: 18 }} />
        </Button>
      </Stack>

      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: 320,
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          bgcolor: '#f8fafc',
        }}
      />

      {value?.address && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          mt={1.5}
          sx={{ p: '8px 12px', bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}
        >
          <PinDropIcon sx={{ fontSize: 15, color: '#2563eb', flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 600, lineHeight: 1.4 }}>
            {value.address}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}

export default function ClientForm({
  initialClient = null,
  mode = 'create',
  onCancel,
  onSaved,
}) {
  const isReadOnly = mode === 'view';
  const isEdit = mode === 'edit';
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [pendingLocation, setPendingLocation] = useState(null);
  const [businessEntities, setBusinessEntities] = useState([]);
  const [areas, setAreas] = useState({
    divisions: [],
    districts: [],
    thanas: [],
  });
  const [loadError, setLoadError] = useState('');

  const formik = useFormik({
    initialValues: buildInitialValues(initialClient),
    enableReinitialize: true,
    validationSchema: clientSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          business_entity_id: Number(values.businessEntity),
          client_id: values.clientId?.trim() || undefined,
          client_name: values.name.trim(),
          client_from: values.source,
          contact_person: values.contactPerson.trim() || null,
          contact_no: values.contactNumber.trim() || null,
          email: values.email.trim() || null,
          address: values.address.trim() || null,
          lat: values.location?.latitude ?? null,
          long: values.location?.longitude ?? null,
          division_id: Number(values.division),
          district_id: Number(values.district),
          thana_id: Number(values.thana),
          licence: values.licenseStatus,
          status: initialClient?.status || 'active',
        };

        const savedClient = isEdit && initialClient?.id
          ? await updateClient(initialClient.id, payload)
          : await createClient(payload);

        onSaved?.(savedClient);
      } catch (error) {
        setLoadError(error?.response?.data?.message || error?.message || 'Unable to save client.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const {
    values,
    errors,
    touched,
    isSubmitting,
    setFieldValue,
    handleBlur,
    handleChange,
    handleSubmit,
  } = formik;

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      try {
        const [entityData, areaData] = await Promise.all([
          fetchBusinessEntities(),
          fetchAreas(),
        ]);

        if (!active) return;

        setBusinessEntities(Array.isArray(entityData) ? entityData : []);
        setAreas({
          divisions: Array.isArray(areaData?.divisions) ? areaData.divisions : [],
          districts: Array.isArray(areaData?.districts) ? areaData.districts : [],
          thanas: Array.isArray(areaData?.thanas) ? areaData.thanas : [],
        });
      } catch (error) {
        if (active) {
          setLoadError(error?.response?.data?.message || error?.message || 'Unable to load client form options.');
        }
      }
    };

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  const businessEntityOptions = useMemo(
    () => businessEntities.map((entity) => ({
      id: Number(entity.id),
      label: entity.name || entity.label,
    })),
    [businessEntities],
  );

  const divisionOptions = useMemo(
    () => areas.divisions.map((division) => ({
      id: Number(division.id),
      label: division.name,
    })),
    [areas.divisions],
  );

  const districtOptions = useMemo(() => {
    const selectedDivision = values.division ? Number(values.division) : null;

    return areas.districts
      .filter((district) => !selectedDivision || Number(district.division_id) === selectedDivision)
      .map((district) => ({
        id: Number(district.id),
        label: district.name,
      }));
  }, [areas.districts, values.division]);

  const thanaOptions = useMemo(() => {
    const selectedDistrict = values.district ? Number(values.district) : null;

    return areas.thanas
      .filter((thana) => !selectedDistrict || Number(thana.district_id) === selectedDistrict)
      .map((thana) => ({
        id: Number(thana.id),
        label: thana.name,
      }));
  }, [areas.thanas, values.district]);

  const fetchBusinessEntityOptions = useCallback(async () => businessEntityOptions, [businessEntityOptions]);
  const fetchDivisionOptions = useCallback(async () => divisionOptions, [divisionOptions]);
  const fetchDistrictOptions = useCallback(async () => districtOptions, [districtOptions]);
  const fetchThanaOptions = useCallback(async () => thanaOptions, [thanaOptions]);
  const fetchSourceOptions = useCallback(async () => SOURCE_OPTIONS, []);

  useEffect(() => {
    if (!values.division || !values.district || !districtOptions.length) {
      return;
    }

    const districtExists = districtOptions.some((option) => Number(option.id) === Number(values.district));
    if (!districtExists) {
      setFieldValue('district', '');
      setFieldValue('thana', '');
    }
  }, [districtOptions, setFieldValue, values.district, values.division]);

  useEffect(() => {
    if (!values.district || !values.thana || !thanaOptions.length) {
      return;
    }

    const thanaExists = thanaOptions.some((option) => Number(option.id) === Number(values.thana));
    if (!thanaExists) {
      setFieldValue('thana', '');
    }
  }, [setFieldValue, thanaOptions, values.district, values.thana]);

  const field = (name) => ({
    error: Boolean(touched[name] && errors[name]),
    helperText: touched[name] && errors[name] ? errors[name] : ' ',
  });

  const handleConfirmLocation = () => {
    if (pendingLocation) setFieldValue('location', pendingLocation);
    setMapModalOpen(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {loadError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {loadError}
        </Alert>
      )}

      <form noValidate onSubmit={handleSubmit}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: '2px 20px',
            width: '100%',
          }}
        >
          <SectionHeader icon={<BusinessIcon />} title="Basic Information" />
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextInputField
              name="clientId"
              label="Client ID"
              value={values.clientId}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled
              helperText={isEdit ? 'Existing client reference' : 'Will be generated automatically'}
              error={false}
            />
          </Box>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextInputField
              name="name"
              label="Client Name *"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isReadOnly}
              {...field('name')}
            />
          </Box>
          <SelectDropdownSingle
            name="businessEntity"
            label="Business Entity *"
            fetchOptions={fetchBusinessEntityOptions}
            value={values.businessEntity}
            onChange={(id) => setFieldValue('businessEntity', Number(id))}
            onBlur={handleBlur}
            disabled={isReadOnly}
            {...field('businessEntity')}
          />
          <SelectDropdownSingle
            name="source"
            label="Source *"
            fetchOptions={fetchSourceOptions}
            value={values.source}
            onChange={(id) => setFieldValue('source', id)}
            onBlur={handleBlur}
            disabled={isReadOnly}
            {...field('source')}
          />

          <Box sx={{ gridColumn: '1 / -1', mt: 0.5, mb: 0.5 }}>
            <Divider />
          </Box>

          <SectionHeader icon={<BusinessIcon />} title="Contact Information" mt={1} />
          <Box sx={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: '4px 20px' }}>
            <TextInputField
              name="contactPerson"
              label="Contact Person *"
              value={values.contactPerson}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isReadOnly}
              {...field('contactPerson')}
            />
            <NumberInputField
              name="contactNumber"
              label="Contact Number *"
              value={values.contactNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isReadOnly}
              {...field('contactNumber')}
            />
            <TextInputField
              name="email"
              label="Email *"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isReadOnly}
              {...field('email')}
            />
          </Box>

          <Box sx={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'start' }}>
            <TextareaInputField
              name="address"
              label="Address *"
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isReadOnly}
              {...field('address')}
            />
            <Stack alignItems="center" spacing={0.5} sx={{ pt: '2px' }}>
              <IconButton
                onClick={() => {
                  setPendingLocation(values.location);
                  setMapModalOpen(true);
                }}
                disabled={isReadOnly}
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: values.location ? '#eff6ff' : '#e3e8ec',
                  border: `1px solid ${values.location ? '#bfdbfe' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  color: values.location ? '#2563eb' : '#94a3b8',
                  '&:hover': { bgcolor: '#eff6ff', borderColor: '#2563eb', color: '#2563eb' },
                  '&:focus': { outline: 'none' },
                }}
              >
                <MapIcon fontSize="small" />
              </IconButton>
              <Typography sx={{ fontSize: '0.6rem', color: values.location ? '#2563eb' : '#94a3b8', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                Map Location
              </Typography>
            </Stack>
          </Box>

          {values.location?.address && (
            <Box sx={{ gridColumn: '1 / -1', mt: '-8px' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ p: '6px 10px', bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
                <PinDropIcon sx={{ fontSize: 13, color: '#2563eb', flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 600, lineHeight: 1.3, flex: 1 }} noWrap>
                  {values.location.address}
                </Typography>
                {!isReadOnly && (
                  <IconButton size="small" onClick={() => setFieldValue('location', null)} sx={{ p: 0.25, '&:focus': { outline: 'none' } }}>
                    <ClearIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                  </IconButton>
                )}
              </Stack>
            </Box>
          )}

          <Box sx={{ gridColumn: '1 / -1', mt: 0.75, mb: 0.5 }}>
            <Divider />
          </Box>

          <SectionHeader icon={<BusinessIcon />} title="Classification" mt={1} />
          <Box sx={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: '4px 20px' }}>
            <SelectDropdownSingle
              name="division"
              label="Division *"
              fetchOptions={fetchDivisionOptions}
              value={values.division}
              onChange={(id) => {
                setFieldValue('division', Number(id));
                setFieldValue('district', '');
                setFieldValue('thana', '');
              }}
              onBlur={handleBlur}
              disabled={isReadOnly}
              {...field('division')}
            />
            <SelectDropdownSingle
              name="district"
              label="District *"
              fetchOptions={fetchDistrictOptions}
              value={values.district}
              onChange={(id) => {
                setFieldValue('district', Number(id));
                setFieldValue('thana', '');
              }}
              onBlur={handleBlur}
              disabled={isReadOnly || !values.division}
              {...field('district')}
            />
            <SelectDropdownSingle
              name="thana"
              label="Thana *"
              fetchOptions={fetchThanaOptions}
              value={values.thana}
              onChange={(id) => setFieldValue('thana', Number(id))}
              onBlur={handleBlur}
              disabled={isReadOnly || !values.district}
              {...field('thana')}
            />
          </Box>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <SelectDropdownSingle
              name="licenseStatus"
              label="License Status *"
              fetchOptions={async () => [
                { id: 'Active', label: 'Active' },
                { id: 'Expire', label: 'Expire' },
                { id: 'Pending', label: 'Pending' },
                { id: 'None', label: 'None' },
              ]}
              value={values.licenseStatus}
              onChange={(id) => setFieldValue('licenseStatus', id)}
              onBlur={handleBlur}
              disabled={isReadOnly}
              {...field('licenseStatus')}
            />
          </Box>
        </Box>

        {!isReadOnly && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={5}>
            <Button
              fullWidth
              variant="outlined"
              onClick={onCancel}
              sx={{ fontWeight: 600, borderRadius: '10px', borderColor: '#e2e8f0', color: '#64748b' }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={<CheckCircleOutlineIcon />}
              sx={{ fontWeight: 700, borderRadius: '10px', bgcolor: '#2563eb', py: 1.2, boxShadow: 'none' }}
            >
              {isEdit ? 'Update Client' : 'Create Client'}
            </Button>
          </Stack>
        )}

        {isReadOnly && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={5}>
            <Button
              fullWidth
              variant="outlined"
              onClick={onCancel}
              sx={{ fontWeight: 600, borderRadius: '10px', borderColor: '#e2e8f0', color: '#64748b' }}
            >
              Back
            </Button>
          </Stack>
        )}
      </form>

      <Dialog open={mapModalOpen} onClose={() => setMapModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1.5, borderBottom: '1px solid #f1f5f9' }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <PinDropIcon sx={{ color: '#2563eb' }} />
            <Typography fontWeight={700} fontSize="0.95rem">Pin Location</Typography>
            <Box flex={1} />
            <IconButton size="small" onClick={() => setMapModalOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <LocationPicker value={pendingLocation} onChange={setPendingLocation} />
        </DialogContent>
        <Stack direction="row" spacing={1.5} sx={{ px: 3, py: 2, borderTop: '1px solid #f1f5f9' }}>
          <Button fullWidth variant="outlined" onClick={() => setMapModalOpen(false)}>Cancel</Button>
          <Button fullWidth variant="contained" disabled={!pendingLocation} onClick={handleConfirmLocation} startIcon={<PinDropIcon />}>
            Confirm Location
          </Button>
        </Stack>
      </Dialog>
    </Box>
  );
}
