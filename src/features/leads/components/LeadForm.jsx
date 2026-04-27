// src/features/leads/components/LeadForm.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box, Button, Typography, Stack, Paper, Divider, IconButton,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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
import TextInputField         from '../../../components/shared/TextInputField';
import AmountInputField       from '../../../components/shared/AmountInputField';
import DatePickerField        from '../../../components/shared/DatePickerField';
import AttachmentField        from '../../../components/shared/AttachmentField';
import AddClientButton        from '../../../components/shared/AddClientButton';
import { buildMultipartFormData } from '../../../utils/formData';
import { fetchLeadFormOptions, createLead, updateLead } from '../api/leadApi';

const CLIENT_META = {
  1: { contactPerson: 'Jennifer Lee', phone: '+1 (555) 333-4444', email: 'j.lee@globalsys.com', address: '200 Global Ave, Los Angeles, CA', city: 'Los Angeles', region: 'West', lat: 34.0522, lng: -118.2437 },
  2: { contactPerson: 'Arif Rahman', phone: '+880 1711-223344', email: 'arif@nexus.bd', address: '45 Gulshan Ave, Dhaka', city: 'Dhaka', region: 'Central', lat: 23.7935, lng: 90.4066 },
};

// ─── Validation schema ───────────────────────────────────────────────────────
const singleLeadSchema = Yup.object({
  business_entity_id:  Yup.string().required('Business entity is required'),
  source_id:    Yup.string().required('Source is required'),
  lead_assign_id:    Yup.string().required('Assign To is required'),
  products:        Yup.array().min(1, 'Select at least one product'),
  client_id:          Yup.string().required('Client is required'),
  lead_pipeline_stage_id:    Yup.string().required('Stage is required'),
  deadline: Yup.date().nullable().required('Deadline is required'),
});

const INITIAL_VALUES = {
  business_entity_id: '',
  source_id:    '',
  source_info:     '',
  products:       [],
  client_id:         '',
  lead_assign_id:    '',
  kam_id: '',
  backoffice_id:    '',
  expected_revenue: '',
  lead_pipeline_stage_id:          '',
  deadline:       null,
  attachment:     [],
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
  const formInitialValues = { ...INITIAL_VALUES, ...(initialValues || {}) };
  const [optionData, setOptionData] = useState({
    business_entities: [],
    sources: [],
    clients: [],
    lead_assigns: [],
    kam_users: [],
    backoffices: [],
    products: [],
    stages: [],
  });
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoadingOptions(true);
        const data = await fetchLeadFormOptions(formInitialValues.business_entity_id || '');
        if (!active) {
          return;
        }

        setOptionData({
          business_entities: data.business_entities || [],
          sources: data.sources || [],
          clients: data.clients || [],
          lead_assigns: data.lead_assigns || [],
          kam_users: data.kam_users || [],
          backoffices: data.backoffices || [],
          products: data.products || [],
          stages: data.stages || [],
        });
      } catch {
        if (active) {
          setOptionData({
            business_entities: [],
            sources: [],
            clients: [],
            lead_assigns: [],
            kam_users: [],
            backoffices: [],
            products: [],
            stages: [],
          });
        }
      } finally {
        if (active) {
          setLoadingOptions(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [formInitialValues.business_entity_id]);

  const businessEntityFetchOptions = useMemo(() => async () => optionData.business_entities, [optionData.business_entities]);
  const sourceFetchOptions = useMemo(() => async () => optionData.sources, [optionData.sources]);
  const leadAssignFetchOptions = useMemo(() => async () => optionData.lead_assigns, [optionData.lead_assigns]);
  const clientFetchOptions = useMemo(() => async () => optionData.clients, [optionData.clients]);
  const stageOptions = useMemo(
    () => [...optionData.stages].sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)),
    [optionData.stages],
  );
  const stageFetchOptions = useMemo(() => async () => stageOptions, [stageOptions]);

  // ── useFormik hook ──────────────────────────────────────────────────────────
  const formik = useFormik({
    initialValues:    formInitialValues,
    validationSchema: singleLeadSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const totalAttachmentSize = values.attachment.reduce((sum, file) => sum + file.size, 0);
        if (totalAttachmentSize > 25 * 1024 * 1024) {
          return;
        }

        const payload = {
          business_entity_id: values.business_entity_id,
          source_id: values.source_id,
          source_info: values.source_info || null,
          product_ids: values.products,
          client_id: values.client_id,
          lead_assign_id: values.lead_assign_id || null,
          kam_id: values.kam_id || null,
          backoffice_id: values.backoffice_id || null,
          expected_revenue: values.expected_revenue || null,
          lead_pipeline_stage_id: values.lead_pipeline_stage_id,
          deadline: values.deadline?.toISOString() || null,
          attachment: values.attachment,
        };

        const formData = buildMultipartFormData(payload);

        const savedLead = isEdit && formInitialValues?.id
          ? await updateLead(formInitialValues.id, formData)
          : await createLead(formData);

        await Promise.resolve(onSubmit?.(savedLead || payload, formData));
      } catch (error) {
        console.error('Unable to save lead:', error);
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
    handleSubmit,
  } = formik;
  const clientMeta = values.client_id ? CLIENT_META[Number(values.client_id)] ?? null : null;
  const getIsOtherSource = (sourceId) => {
    const source = optionData.sources.find((option) => String(option.id) === String(sourceId)) || null;
    return Boolean(String(source?.label || '').trim().toLowerCase().includes('other'));
  };
  const isOtherSource = getIsOtherSource(values.source_id);
  const selectedLeadAssign = optionData.lead_assigns.find((option) => String(option.id) === String(values.lead_assign_id)) || null;
  const selectedLeadAssignName = String(selectedLeadAssign?.label || '').trim().toLowerCase();
  const isBackOfficeAssign = selectedLeadAssignName.includes('back office');
  const assignTargetOptions = isBackOfficeAssign
    ? optionData.backoffices
    : optionData.kam_users;
  const getDefaultAssignmentForBusinessEntity = useCallback((businessEntityId) => {
    const selectedBusinessEntity = optionData.business_entities.find(
      (option) => String(option.id) === String(businessEntityId),
    ) || null;
    const businessEntityName = String(selectedBusinessEntity?.label || '').trim().toLowerCase();

    if (!businessEntityName) {
      return null;
    }

    if (businessEntityName.includes('race') || businessEntityName.includes('orbit')) {
      const backOfficeAssign = optionData.lead_assigns.find((option) =>
        String(option.label || '').trim().toLowerCase().includes('back office'),
      );

      return backOfficeAssign
        ? { lead_assign_id: backOfficeAssign.id, target_type: 'backoffice' }
        : null;
    }

    if (businessEntityName.includes('dhaka colo')) {
      const kamAssign = optionData.lead_assigns.find((option) =>
        String(option.label || '').trim().toLowerCase().includes('kam'),
      );

      return kamAssign
        ? { lead_assign_id: kamAssign.id, target_type: 'kam' }
        : null;
    }

    return null;
  }, [optionData.business_entities, optionData.lead_assigns]);

  useEffect(() => {
    if (!values.business_entity_id || !stageOptions.length) {
      return;
    }

    const currentStageExists = stageOptions.some((option) => String(option.id) === String(values.lead_pipeline_stage_id));
    const defaultStageId = stageOptions[0]?.id || '';

    if ((!values.lead_pipeline_stage_id || !currentStageExists) && defaultStageId) {
      setFieldValue('lead_pipeline_stage_id', defaultStageId, false);
    }
  }, [setFieldValue, stageOptions, values.business_entity_id, values.lead_pipeline_stage_id]);

  useEffect(() => {
    if (!values.business_entity_id || isEdit || values.lead_assign_id) {
      return;
    }

    const defaultAssignment = getDefaultAssignmentForBusinessEntity(values.business_entity_id);
    if (!defaultAssignment) {
      return;
    }

    setFieldValue('lead_assign_id', defaultAssignment.lead_assign_id, false);
    if (defaultAssignment.target_type === 'backoffice') {
      setFieldValue('backoffice_id', '', false);
      setFieldValue('kam_id', '', false);
    } else {
      setFieldValue('kam_id', '', false);
      setFieldValue('backoffice_id', '', false);
    }
  }, [
    getDefaultAssignmentForBusinessEntity,
    isEdit,
    setFieldValue,
    values.business_entity_id,
    values.lead_assign_id,
  ]);

  useEffect(() => {
    if (!values.business_entity_id) {
      return;
    }

    let active = true;

    const loadByBusinessEntity = async () => {
      try {
        const data = await fetchLeadFormOptions(values.business_entity_id);
        if (!active) {
          return;
        }

        setOptionData((current) => ({
          ...current,
          products: data.products || [],
          stages: data.stages || [],
        }));
      } catch {
        if (active) {
          setOptionData((current) => ({
            ...current,
            products: [],
            stages: [],
          }));
        }
      }
    };

    loadByBusinessEntity();

    return () => {
      active = false;
    };
  }, [values.business_entity_id]);

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
              gridTemplateColumns: {
                xs: '1fr',
                sm: isOtherSource ? '1fr 1fr 1fr' : '1fr 1fr',
              },
              gap: '4px 20px',
              width: '100%',
            }}
          >
            {/* Business Entity */}
            <SelectDropdownSingle
              name="business_entity_id"
              label="Business Entity *"
              fetchOptions={businessEntityFetchOptions}
              value={values.business_entity_id}
              onChange={(id) => {
                setFieldValue('business_entity_id', id);
                setFieldValue('products', []);
                setFieldValue('lead_pipeline_stage_id', '');

                const defaultAssignment = getDefaultAssignmentForBusinessEntity(id);
                if (defaultAssignment) {
                  setFieldValue('lead_assign_id', defaultAssignment.lead_assign_id);
                  if (defaultAssignment.target_type === 'backoffice') {
                    setFieldValue('backoffice_id', '');
                    setFieldValue('kam_id', '');
                  } else {
                    setFieldValue('kam_id', '');
                    setFieldValue('backoffice_id', '');
                  }
                } else {
                  setFieldValue('lead_assign_id', '');
                  setFieldValue('kam_id', '');
                  setFieldValue('backoffice_id', '');
                }
              }}
              onBlur={handleBlur}
              error={Boolean(touched.business_entity_id && errors.business_entity_id)}
              helperText={touched.business_entity_id && errors.business_entity_id ? errors.business_entity_id : ' '}
              disabled={isEdit}
              searchable={!isEdit}
              loading={loadingOptions}
            />

            {/* Source */}
            <SelectDropdownSingle
              name="source_id"
              label="Source *"
              fetchOptions={sourceFetchOptions}
              value={values.source_id}
              onChange={(id) => {
                setFieldValue('source_id', id);
                if (!getIsOtherSource(id)) {
                  setFieldValue('source_info', '');
                }
              }}
              onBlur={handleBlur}
              error={Boolean(touched.source_id && errors.source_id)}
              helperText={touched.source_id && errors.source_id ? errors.source_id : ' '}
              loading={loadingOptions}
            />

            {/* Other Info */}
            {isOtherSource && (
              <TextInputField
                name="source_info"
                label="Other Info"
                value={values.source_info}
                onChange={(e) => setFieldValue('source_info', e.target.value)}
                onBlur={handleBlur}
              />
            )}

            {/* Products + Assign To Type + Target */}
            <Box
              sx={{
                gridColumn: '1 / -1',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                gap: '4px 20px',
                alignItems: 'start',
              }}
            >
              <SelectDropdownMultiple
                name="products"
                label="Select Products *"
                options={optionData.products}
                value={values.products}
                onChange={(ids) => setFieldValue('products', ids)}
                onBlur={handleBlur}
                error={Boolean(touched.products && errors.products)}
                helperText={touched.products && errors.products ? errors.products : ' '}
              />
              <SelectDropdownSingle
                name="lead_assign_id"
                label="Assign Type *"
                fetchOptions={leadAssignFetchOptions}
                value={values.lead_assign_id}
                onChange={(id) => {
                  setFieldValue('lead_assign_id', id);
                  setFieldValue('kam_id', '');
                  setFieldValue('backoffice_id', '');
                }}
                onBlur={handleBlur}
                loading={loadingOptions}
                error={Boolean(touched.lead_assign_id && errors.lead_assign_id)}
                helperText={touched.lead_assign_id && errors.lead_assign_id ? errors.lead_assign_id : ' '}
              />
              <SelectDropdownSingle
                name={isBackOfficeAssign ? 'backoffice_id' : 'kam_id'}
                label={isBackOfficeAssign ? 'Select Back Office *' : 'Select KAM User *'}
                options={assignTargetOptions}
                value={isBackOfficeAssign ? values.backoffice_id : values.kam_id}
                onChange={(id) => {
                  if (isBackOfficeAssign) {
                    setFieldValue('backoffice_id', id);
                  } else {
                    setFieldValue('kam_id', id);
                  }
                }}
                onBlur={handleBlur}
                searchable
              />
            </Box>

            {/* Client + Stage row */}
            <Box
              sx={{
                gridColumn: '1 / -1',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr 1fr' },
                gap: { xs: '12px', sm: '4px 20px' },
                alignItems: 'start',
              }}
            >
              <AddClientButton
                onClick={() => navigate('/clients/new', { state: { returnTo: '/leads/new' } })}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              />
              <SelectDropdownSingle
                name="client_id"
                label="Select Client *"
                fetchOptions={clientFetchOptions}
                value={values.client_id}
                onChange={(id) => {
                  setFieldValue('client_id', id);
                }}
                onBlur={handleBlur}
                error={Boolean(touched.client_id && errors.client_id)}
                helperText={touched.client_id && errors.client_id ? errors.client_id : ' '}
                disabled={isEdit}
                searchable={!isEdit}
                loading={loadingOptions}
              />
              <SelectDropdownSingle
                name="lead_pipeline_stage_id"
                label="Stage *"
                fetchOptions={stageFetchOptions}
                value={values.lead_pipeline_stage_id}
                onChange={(id) => setFieldValue('lead_pipeline_stage_id', id)}
                onBlur={handleBlur}
                error={Boolean(touched.lead_pipeline_stage_id && errors.lead_pipeline_stage_id)}
                helperText={touched.lead_pipeline_stage_id && errors.lead_pipeline_stage_id ? errors.lead_pipeline_stage_id : ' '}
                loading={loadingOptions}
              />
            </Box>

            {/* Conditional Client Information */}
            {clientMeta && (
              <Box
                sx={{
                  gridColumn: '1 / -1',
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: '20px',
                }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    height: 210,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    bgcolor: '#f8fafc',
                  }}
                >
                  <iframe
                    title="client-map"
                    width="100%"
                    height="100%"
                    style={{ border: 0, display: 'block' }}
                    loading="lazy"
                    src={`https://maps.google.com/maps?q=${clientMeta.lat},${clientMeta.lng}&z=13&output=embed`}
                  />
                </Paper>

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

            {/* Expected Revenue + Lead Deadline */}
            <Box
              sx={{
                gridColumn: '1 / -1',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: '4px 20px',
                alignItems: 'start',
              }}
            >
              <AmountInputField
                name="expected_revenue"
                label="Expected Monthly Revenue (৳)"
                value={values.expected_revenue}
                onChange={(e) => setFieldValue('expected_revenue', e.target.value)}
                onBlur={handleBlur}
                error={Boolean(touched.expected_revenue && errors.expected_revenue)}
                helperText={
                  touched.expected_revenue && errors.expected_revenue
                    ? errors.expected_revenue
                    : ' '
                }
              />

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

            <Box sx={{ gridColumn: '1 / -1' }}>
              <AttachmentField
                // label="Attachment"
                value={values.attachment}
                onChange={(files) => setFieldValue('attachment', files)}
              />
            </Box>

          </Box>{/* end grid */}

          {/* ── Actions ── */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: '30%' } }}>
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
          </Box>
        </form>
      )}
    </Box>
  );
}
