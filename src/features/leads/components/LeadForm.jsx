// src/features/leads/components/LeadForm.jsx
import React, { useState, useCallback } from 'react';
import {
  Box, Button, Typography, Stack, Paper, Divider, IconButton,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PersonAddAltIcon       from '@mui/icons-material/PersonAddAlt';
import CloudUploadIcon        from '@mui/icons-material/CloudUpload';
import FileDownloadIcon       from '@mui/icons-material/FileDownload';
import BusinessIcon           from '@mui/icons-material/Business';
import PersonIcon             from '@mui/icons-material/Person';
import PhoneIcon              from '@mui/icons-material/Phone';
import EmailIcon              from '@mui/icons-material/Email';
import LocationOnIcon         from '@mui/icons-material/LocationOn';
import MapIcon                from '@mui/icons-material/Map';
import PublicIcon             from '@mui/icons-material/Public';
import InsertDriveFileIcon    from '@mui/icons-material/InsertDriveFile';
import DeleteOutlineIcon      from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useDropzone }        from 'react-dropzone';
import { useNavigate } from 'react-router-dom';

import SelectDropdownSingle   from '../../../components/shared/SelectDropdownSingle';
import SelectDropdownMultiple from '../../../components/shared/SelectDropdownMultiple';
import AmountInputField       from '../../../components/shared/AmountInputField';
import DatePickerField        from '../../../components/shared/DatePickerField';

// ─── Mock data ───────────────────────────────────────────────────────────────
const fetchBusinessEntities = async () => [
  { id: 'be1', label: 'Alpha Corp' },
  { id: 'be2', label: 'Beta Holdings' },
  { id: 'be3', label: 'Gamma Ltd' },
];
const fetchSource = async () => [
  { id: 'bt1', label: 'Facebook' },
  { id: 'bt2', label: 'Whatsapp' },
  { id: 'bt3', label: 'Website' },
];
const fetchClients = async () => [
  { id: 'c1', label: 'Global Systems Inc' },
  { id: 'c2', label: 'Nexus Solutions' },
];
const fetchStages = async () => [
  { id: 'new',         label: 'New' },
  { id: 'qualified',   label: 'Qualified' },
  { id: 'proposal',    label: 'Proposal' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'closed_won',  label: 'Closed Won' },
  { id: 'closed_lost', label: 'Closed Lost' },
];

const PRODUCT_OPTIONS = [
  { id: 'p1', label: 'Product Alpha' },
  { id: 'p2', label: 'Product Beta' },
  { id: 'p3', label: 'Product Gamma' },
  { id: 'p4', label: 'Product Delta' },
];

const CLIENT_META = {
  c1: { contactPerson: 'Jennifer Lee', phone: '+1 (555) 333-4444', email: 'j.lee@globalsys.com', address: '200 Global Ave, Los Angeles, CA', city: 'Los Angeles', region: 'West',    lat: 34.0522, lng: -118.2437 },
  c2: { contactPerson: 'Arif Rahman',  phone: '+880 1711-223344',  email: 'arif@nexus.bd',        address: '45 Gulshan Ave, Dhaka',          city: 'Dhaka',       region: 'Central', lat: 23.7935, lng:   90.4066 },
};

// ─── Validation schema ───────────────────────────────────────────────────────
const singleLeadSchema = Yup.object({
  businessEntity:  Yup.string().required('Business entity is required'),
  source:    Yup.string().required('Source is required'),
  products:        Yup.array().min(1, 'Select at least one product'),
  client:          Yup.string().required('Client is required'),
  stage:    Yup.string().required('Stage is required'),
  deadline: Yup.date().nullable().required('Deadline is required'),
});

const INITIAL_VALUES = {
  businessEntity: '',
  source:    '',
  products:       [],
  client:         '',
  expectedRevenue: '',
  stage:          '',
  deadline:       null,
};

// ─── InfoRow ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, text, isLink }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="flex-start">
      {React.cloneElement(icon, {
        sx: { fontSize: 13, color: '#94a3b8', mt: '3px', flexShrink: 0 },
      })}
      <Typography
        variant="caption"
        sx={{
          color: isLink ? '#2563eb' : '#475569',
          fontWeight: 500,
          lineHeight: 1.5,
          wordBreak: 'break-word',
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
}

// ─── BulkUploadTab ───────────────────────────────────────────────────────────
function BulkUploadTab({ onCancel }) {
  const [file, setFile]         = useState(null);
  const [rejected, setRejected] = useState(false);

  const onDrop = useCallback((accepted, rejectedFiles) => {
    setRejected(rejectedFiles.length > 0);
    if (accepted.length) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:   { 'text/csv': ['.csv'] },
    maxFiles: 1,
    maxSize:  10 * 1024 * 1024,
  });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
        <Typography variant="body2" color="text.secondary">
          Upload a CSV file to create multiple leads at once.
        </Typography>
        <Button
          size="small"
          startIcon={<FileDownloadIcon />}
          sx={{
            textTransform: 'none', fontWeight: 600, color: '#475569',
            border: '1px solid #e2e8f0', borderRadius: '8px', whiteSpace: 'nowrap',
          }}
        >
          Download Template
        </Button>
      </Stack>

      <Paper
        {...getRootProps()}
        variant="outlined"
        sx={{
          py: 7, textAlign: 'center', cursor: 'pointer', border: '2px dashed',
          borderColor: isDragActive ? '#2563eb' : rejected ? '#ef4444' : '#e2e8f0',
          bgcolor:     isDragActive ? '#eff6ff'  : rejected ? '#fef2f2' : '#fafafa',
          borderRadius: '14px', transition: 'all 0.2s ease',
          '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 44, color: isDragActive ? '#2563eb' : '#94a3b8', mb: 1.5 }} />
        <Typography fontWeight={600} fontSize="0.9rem">
          {isDragActive ? 'Drop your CSV here' : 'Click to upload or drag & drop'}
        </Typography>
        <Typography variant="caption" color="text.secondary">CSV only · Max 10MB</Typography>
      </Paper>

      {rejected && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
          Invalid file. Please upload a .csv file under 10MB.
        </Typography>
      )}

      {file && !rejected && (
        <Stack
          direction="row" alignItems="center" spacing={1.5} mt={2}
          sx={{ p: '10px 14px', bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px' }}
        >
          <InsertDriveFileIcon sx={{ color: '#16a34a', fontSize: 20 }} />
          <Box flex={1} minWidth={0}>
            <Typography variant="caption" fontWeight={700} color="#166534" noWrap>{file.name}</Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {(file.size / 1024).toFixed(1)} KB
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setFile(null)}>
            <DeleteOutlineIcon fontSize="small" sx={{ color: '#ef4444' }} />
          </IconButton>
        </Stack>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={5}>
        <Button
          fullWidth variant="outlined" onClick={onCancel}
          sx={{
            textTransform: 'none', fontWeight: 600, borderRadius: '10px',
            borderColor: '#e2e8f0', color: '#64748b',
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth variant="contained" disabled={!file}
          sx={{
            textTransform: 'none', fontWeight: 600, borderRadius: '10px',
            bgcolor: '#2563eb',
            '&:hover': { bgcolor: '#1d4ed8' },
            '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
          }}
        >
          Import Leads
        </Button>
      </Stack>
    </Box>
  );
}

// ─── Main LeadForm ────────────────────────────────────────────────────────────
export default function LeadForm({ onCancel, onSubmit, tab = 0, initialValues = null, isEdit = false }) {
  const navigate = useNavigate();
  const formInitialValues = initialValues ?? INITIAL_VALUES;

  // ── useFormik hook ──────────────────────────────────────────────────────────
  const formik = useFormik({
    initialValues:    formInitialValues,
    validationSchema: singleLeadSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) => {
      onSubmit?.(values);
      setSubmitting(false);
    },
  });

  const {
    values,
    errors,
    touched,
    isSubmitting,
    setFieldValue,
    handleBlur,
    handleSubmit,
  } = formik;
  const clientMeta = values.client ? CLIENT_META[values.client] ?? null : null;

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Bulk Upload tab ── */}
      {tab === 1 && <BulkUploadTab onCancel={onCancel} />}

      {/* ── Single Lead tab ── */}
      {tab === 0 && (
        <form noValidate onSubmit={handleSubmit}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: '4px 20px',
              width: '100%',
            }}
          >
            {/* Business Entity */}
           <SelectDropdownSingle
              name="businessEntity"
              label="Business Entity *"
              fetchOptions={fetchBusinessEntities}
              value={values.businessEntity}
              onChange={(id) => setFieldValue('businessEntity', id)}
              onBlur={handleBlur}
              error={Boolean(touched.businessEntity && errors.businessEntity)}
              helperText={touched.businessEntity && errors.businessEntity ? errors.businessEntity : ' '}
              disabled={isEdit}
              searchable={!isEdit}
            />

            {/* Source */}
            <SelectDropdownSingle
              name="source"
              label="Source *"
              fetchOptions={fetchSource}
              value={values.source}
              onChange={(id) => setFieldValue('source', id)}
              onBlur={handleBlur}
              error={Boolean(touched.source && errors.source)}
              helperText={touched.source && errors.source ? errors.source : ' '}
            />

            {/* Products — full width */}
            <Box sx={{ gridColumn: '1 / -1' }}>
              <SelectDropdownMultiple
                name="products"
                label="Select Products *"
                options={PRODUCT_OPTIONS}
                value={values.products}
                onChange={(ids) => setFieldValue('products', ids)}
                onBlur={handleBlur}
                error={Boolean(touched.products && errors.products)}
                helperText={touched.products && errors.products ? errors.products : ' '}
              />
            </Box>

            {/* Client + Add button — full width row */}
            <Box
              sx={{
                gridColumn: '1 / -1',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '20px',
                alignItems: 'start',
              }}
            >
              <SelectDropdownSingle
                name="client"
                label="Select Client *"
                fetchOptions={fetchClients}
                value={values.client}
                onChange={(id) => {
                  setFieldValue('client', id);
                }}
                onBlur={handleBlur}
                error={Boolean(touched.client && errors.client)}
                helperText={touched.client && errors.client ? errors.client : ' '}
                disabled={isEdit}
                searchable={!isEdit}
              />
              {!isEdit && (
                <Button
                  variant="contained"
                  startIcon={<PersonAddAltIcon />}
                  onClick={() => navigate('/client/new')}
                  sx={{
                    height: '45px', fontWeight: 600, fontSize: '0.8rem',
                    bgcolor: '#2563eb', borderRadius: '8px', boxShadow: 'none',
                    whiteSpace: 'nowrap', px: 2,
                    '&:hover': { bgcolor: '#1d4ed8', boxShadow: 'none' },
                  }}
                >
                  Add Client
                </Button>
              )}
            </Box>

            {/* Conditional Map & Info Section */}
            {clientMeta && (
              <Box
                sx={{
                  gridColumn: '1 / -1',
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: '20px',
                }}
              >
                {/* Map */}
                <Paper
                  variant="outlined"
                  sx={{
                    height: 210, borderRadius: '12px', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mb: 3, bgcolor: '#f8fafc',
                  }}
                >
                  <iframe
                    title="client-map"
                    width="100%" height="100%"
                    style={{ border: 0, display: 'block' }}
                    loading="lazy"
                    src={`https://maps.google.com/maps?q=${clientMeta.lat},${clientMeta.lng}&z=13&output=embed`}
                  />
                </Paper>

                {/* Client info card */}
                <Paper
                  variant="outlined"
                  sx={{ height: 210, p: 2, borderRadius: '12px', mb: 3, overflow: 'auto' }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.75} mb={1.25}>
                    <BusinessIcon sx={{ fontSize: 14, color: '#2563eb' }} />
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
                      Client Information
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 1.25 }} />
                  <Stack spacing={0.75}>
                    <InfoRow icon={<PersonIcon />}     text={clientMeta.contactPerson} />
                    <InfoRow icon={<PhoneIcon />}      text={clientMeta.phone} />
                    <InfoRow icon={<EmailIcon />}      text={clientMeta.email} isLink />
                    <InfoRow icon={<LocationOnIcon />} text={clientMeta.address} />
                    <InfoRow icon={<MapIcon />}        text={clientMeta.city} />
                    <InfoRow icon={<PublicIcon />}     text={clientMeta.region} />
                  </Stack>
                </Paper>
              </Box>
            )}

            {/* Expected Revenue */}
            <AmountInputField
              name="expectedRevenue"
              label="Expected Revenue (৳)"
              value={values.expectedRevenue}
              onChange={(e) => setFieldValue('expectedRevenue', e.target.value)}
              onBlur={handleBlur}
              error={Boolean(touched.expectedRevenue && errors.expectedRevenue)}
              helperText={
                touched.expectedRevenue && errors.expectedRevenue
                  ? errors.expectedRevenue
                  : ' '
              }
            />

            {/* Stage */}
            <SelectDropdownSingle
              name="stage"
              label="Stage *"
              fetchOptions={fetchStages}
              value={values.stage}
              onChange={(id) => setFieldValue('stage', id)}
              onBlur={handleBlur}
              error={Boolean(touched.stage && errors.stage)}
              helperText={touched.stage && errors.stage ? errors.stage : ' '}
            />

            {/* Deadline — full width */}
            <Box sx={{ gridColumn: '1 / -1' }}>
              <DatePickerField
                label="Lead Deadline *"
                value={values.deadline}
                onChange={(val) => setFieldValue('deadline', val)}
                disablePast
                error={Boolean(touched.deadline && errors.deadline)}
                helperText={
                  touched.deadline && errors.deadline
                    ? errors.deadline
                    : ' '
                }
              />
            </Box>

          </Box>{/* end grid */}

          {/* ── Actions ── */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={4}>
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
              fullWidth
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={<CheckCircleOutlineIcon />}
              sx={{
                fontWeight: 700, borderRadius: '10px', bgcolor: '#2563eb',
                py: 1.2, boxShadow: 'none',
                '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' },
                '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
              }}
            >
              {isEdit ? 'Update Lead' : 'Create Lead'}
            </Button>
          </Stack>
        </form>
      )}
    </Box>
  );
}
