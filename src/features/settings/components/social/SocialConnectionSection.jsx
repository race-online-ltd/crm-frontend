import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  Link,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import { useFormik } from 'formik';
import SelectDropdownSingle, { fieldSx } from '../../../../components/shared/SelectDropdownSingle';
import TextInputField from '../../../../components/shared/TextInputField';
import { SOCIAL_BUSINESS_ENTITIES } from '../../constants/socialSettings';

const EMPTY_ROWS = [];

function buildInitialValues(fields) {
  return fields.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {
    businessEntity: '',
    connectionName: '',
    isActive: false,
  });
}

function generateRowId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatTimestamp(value) {
  return new Date(value).toLocaleString();
}

function createLocalRecord({ channelKey, primaryField, identifierFields, values }) {
  return {
    id: generateRowId(),
    channelKey,
    businessEntity: values.businessEntity,
    connectionName: values.connectionName.trim(),
    isActive: Boolean(values.isActive),
    status: 'saved',
    savedAt: new Date().toISOString(),
    primaryValue: values[primaryField] || '',
    identifiers: identifierFields
      .map((fieldName) => values[fieldName])
      .filter(Boolean),
    config: values,
  };
}

function normalizeRow(row, { fields, primaryField, identifierFields, channelKey }) {
  const config = row.config || {};
  const nextConfig = fields.reduce((acc, field) => {
    acc[field.name] = row[field.name] ?? config[field.name] ?? '';
    return acc;
  }, {});

  return {
    ...row,
    id: row.id || generateRowId(),
    channelKey: row.channelKey || channelKey,
    businessEntity: row.businessEntity || '',
    connectionName: row.connectionName || '',
    isActive: Boolean(row.isActive),
    status: row.status || 'saved',
    savedAt: row.savedAt || new Date().toISOString(),
    primaryValue: row.primaryValue ?? row[primaryField] ?? nextConfig[primaryField] ?? '',
    identifiers: row.identifiers || identifierFields.map((fieldName) => row[fieldName] ?? nextConfig[fieldName]).filter(Boolean),
    config: nextConfig,
  };
}

function buildValidationErrors(values, fields) {
  const nextErrors = {};

  if (!values.businessEntity) nextErrors.businessEntity = 'Business entity is required';
  if (!values.connectionName?.trim()) nextErrors.connectionName = 'Connection name is required';

  fields.forEach((field) => {
    if (field.required && !String(values[field.name] ?? '').trim()) {
      nextErrors[field.name] = `${field.label.replace(' *', '')} is required`;
    }
  });

  return nextErrors;
}

function buildFieldComponentSx(field) {
  if (field.multiline) {
    return {
      '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        alignItems: 'flex-start',
        '& fieldset': { borderColor: '#e3eaf2' },
        '&:hover fieldset': { borderColor: '#d3deea' },
        '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: 2 },
        '&.Mui-error fieldset': { borderColor: '#ef4444' },
      },
      '& .MuiInputBase-input': {
        fontSize: '0.8125rem',
        lineHeight: 1.5,
      },
      '& .MuiInputLabel-root': {
        fontSize: '0.8125rem',
        '&.Mui-focused': { color: '#2563eb' },
        '&.Mui-error': { color: '#ef4444' },
      },
      '& .MuiFormHelperText-root': {
        mx: 0,
        minHeight: 20,
        '&.Mui-error': { color: '#ef4444' },
      },
    };
  }

  return {
    ...fieldSx(45),
    '& .MuiFormHelperText-root': {
      mx: 0,
      minHeight: 20,
      '&.Mui-error': { color: '#ef4444' },
    },
  };
}

export default function SocialConnectionSection({
  title,
  subtitle,
  icon,
  accent,
  channelKey,
  fields,
  docs = [],
  backendNotes = [],
  identifierFields = [],
  primaryField,
  initialRows = EMPTY_ROWS,
  fetchBusinessEntities,
  fetchConnections,
  saveConnection,
  deleteConnection,
  toggleConnectionActive,
}) {
  const normalizedInitialRows = useMemo(
    () => initialRows.map((row) => normalizeRow(row, { fields, primaryField, identifierFields, channelKey })),
    [channelKey, fields, identifierFields, initialRows, primaryField],
  );

  const [rows, setRows] = useState(() => normalizedInitialRows);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [rowsError, setRowsError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [actionRowId, setActionRowId] = useState(null);
  const [view, setView] = useState('list');

  const entityOptionsFetcher = useMemo(
    () => fetchBusinessEntities || (async () => SOCIAL_BUSINESS_ENTITIES),
    [fetchBusinessEntities],
  );

  const loadRows = useCallback(async () => {
    if (!fetchConnections) {
      setRows(normalizedInitialRows);
      return;
    }

    setRowsLoading(true);
    setRowsError('');

    try {
      const response = await fetchConnections({ channelKey });
      const loadedRows = Array.isArray(response) ? response : response?.rows || [];
      setRows(loadedRows.map((row) => normalizeRow(row, { fields, primaryField, identifierFields, channelKey })));
    } catch (error) {
      setRowsError(error?.message || 'Failed to load saved connections.');
    } finally {
      setRowsLoading(false);
    }
  }, [channelKey, fetchConnections, fields, identifierFields, normalizedInitialRows, primaryField]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const formik = useFormik({
    initialValues: buildInitialValues(fields),
    enableReinitialize: true,
    validate: (values) => buildValidationErrors(values, fields),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      setSubmitError('');

      const payload = {
        channelKey,
        businessEntity: values.businessEntity,
        connectionName: values.connectionName.trim(),
        isActive: Boolean(values.isActive),
        config: fields.reduce((acc, field) => {
          acc[field.name] = values[field.name];
          return acc;
        }, {}),
      };

      try {
        if (saveConnection) {
          const response = await saveConnection({ channelKey, values, payload });
          const nextRow = normalizeRow(response?.row || response || payload, { fields, primaryField, identifierFields, channelKey });
          setRows((prev) => {
            const withoutEntityActiveRows = nextRow.isActive
              ? prev.map((row) => (
                  row.businessEntity === nextRow.businessEntity
                    ? { ...row, isActive: false, status: 'saved' }
                    : row
                ))
              : prev;

            return [nextRow, ...withoutEntityActiveRows.filter((row) => row.id !== nextRow.id)];
          });
        } else {
          const nextRow = createLocalRecord({
            channelKey,
            primaryField,
            identifierFields,
            values: payload,
          });

          setRows((prev) => {
            const withoutEntityActiveRows = nextRow.isActive
              ? prev.map((row) => (
                  row.businessEntity === nextRow.businessEntity
                    ? { ...row, isActive: false, status: 'saved' }
                    : row
                ))
              : prev;

            return [nextRow, ...withoutEntityActiveRows];
          });
        }

        resetForm({ values: buildInitialValues(fields) });
        setView('list');
      } catch (error) {
        setSubmitError(error?.message || 'Failed to save the connection configuration.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  async function handleToggleActive(targetRow) {
    const nextIsActive = !targetRow.isActive;
    setActionRowId(targetRow.id);
    setRowsError('');

    try {
      if (toggleConnectionActive) {
        const response = await toggleConnectionActive({
          channelKey,
          row: targetRow,
          nextIsActive,
        });
        const normalizedRow = normalizeRow(
          response?.row || { ...targetRow, isActive: nextIsActive },
          { fields, primaryField, identifierFields, channelKey },
        );

        setRows((prev) => prev.map((row) => {
          if (row.businessEntity !== normalizedRow.businessEntity) return row;
          return row.id === normalizedRow.id
            ? normalizedRow
            : { ...row, isActive: false, status: 'saved' };
        }));
      } else {
        setRows((prev) => prev.map((row) => {
          if (row.businessEntity !== targetRow.businessEntity) return row;
          return row.id === targetRow.id
            ? { ...row, isActive: nextIsActive, status: 'saved' }
            : { ...row, isActive: false, status: 'saved' };
        }));
      }
    } catch (error) {
      setRowsError(error?.message || 'Failed to update active connection.');
    } finally {
      setActionRowId(null);
    }
  }

  async function handleDelete(row) {
    setActionRowId(row.id);
    setRowsError('');

    try {
      if (deleteConnection) {
        await deleteConnection({ channelKey, row });
      }

      setRows((prev) => prev.filter((currentRow) => currentRow.id !== row.id));
    } catch (error) {
      setRowsError(error?.message || 'Failed to delete the connection.');
    } finally {
      setActionRowId(null);
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: '16px',
        border: '1px solid #d1d9e0',
        bgcolor: '#fff',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        mb={2.5}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              bgcolor: accent.bg,
              border: `1px solid ${accent.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accent.color,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#0f172a">
              {view === 'form' ? `Add ${title} Configuration` : title}
            </Typography>
            <Typography fontSize={13} color="text.secondary" mt={0.35}>
              {subtitle}
            </Typography>
          </Box>
        </Stack>

        {view === 'list' ? (
          <Button
            variant="contained"
            onClick={() => {
              setSubmitError('');
              formik.resetForm({ values: buildInitialValues(fields) });
              setView('form');
            }}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              px: 2.5,
              py: 1,
              alignSelf: { xs: 'stretch', sm: 'auto' },
            }}
          >
            Add Configuration
          </Button>
        ) : (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              setSubmitError('');
              formik.resetForm({ values: buildInitialValues(fields) });
              setView('list');
            }}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '10px',
              alignSelf: { xs: 'stretch', sm: 'auto' },
            }}
          >
            Back To List
          </Button>
        )}
      </Stack>

      {backendNotes.length > 0 && view === 'form' && (
        <Alert
          icon={<HubOutlinedIcon fontSize="inherit" />}
          severity="info"
          sx={{ mb: 2, borderRadius: '12px', alignItems: 'flex-start' }}
        >
          <Typography fontSize={13} fontWeight={700} mb={0.5}>
            Backend-ready expectation
          </Typography>
          {backendNotes.map((note) => (
            <Typography key={note} fontSize={12.5} color="text.secondary">
              {note}
            </Typography>
          ))}
        </Alert>
      )}

      {submitError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {submitError}
        </Alert>
      )}

      {rowsError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {rowsError}
        </Alert>
      )}

      {view === 'form' ? (
        <>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {docs.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                target="_blank"
                rel="noreferrer"
                underline="hover"
                sx={{ fontSize: 12.5, fontWeight: 600 }}
              >
                {doc.label}
              </Link>
            ))}
          </Stack>

          <Box
            component="form"
            noValidate
            onSubmit={formik.handleSubmit}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: '0px 20px',
              width: '100%',
              mb: 2,
            }}
          >
            <SelectDropdownSingle
              name="businessEntity"
              label="Business Entity *"
              fetchOptions={entityOptionsFetcher}
              value={formik.values.businessEntity}
              onChange={(value) => formik.setFieldValue('businessEntity', value)}
              onBlur={() => formik.setFieldTouched('businessEntity', true)}
              error={formik.touched.businessEntity && Boolean(formik.errors.businessEntity)}
              helperText={formik.touched.businessEntity && formik.errors.businessEntity ? formik.errors.businessEntity : ' '}
            />

            <TextInputField
              name="connectionName"
              label="Connection Name *"
              value={formik.values.connectionName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.connectionName && Boolean(formik.errors.connectionName)}
              helperText={formik.touched.connectionName && formik.errors.connectionName ? formik.errors.connectionName : ' '}
            />

            {fields.map((field) => (
              <TextField
                key={field.name}
                name={field.name}
                fullWidth
                size="small"
                type={field.type || 'text'}
                label={field.label}
                value={formik.values[field.name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
                helperText={formik.touched[field.name] && formik.errors[field.name] ? formik.errors[field.name] : ' '}
              placeholder={field.placeholder}
              multiline={field.multiline}
              rows={field.rows}
              select={field.select}
              sx={{
                ...(field.multiline ? { gridColumn: '1 / -1' } : {}),
                ...buildFieldComponentSx(field),
              }}
            >
                {field.select && field.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ))}
          </Box>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
            spacing={2}
          >
            <FormControlLabel
              control={(
                <Switch
                  checked={formik.values.isActive}
                  onChange={(event) => formik.setFieldValue('isActive', event.target.checked)}
                />
              )}
              label="Set this connection as active for the selected business entity"
            />

            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '10px',
                px: 3,
                alignSelf: { xs: 'stretch', md: 'auto' },
              }}
            >
              {formik.isSubmitting ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Stack>
        </>
      ) : (
        <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700 }}>Business Entity</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Connection</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Primary ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Identifiers</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Active</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Saved</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rowsLoading && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3, color: '#64748b' }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <CircularProgress size={18} />
                      <span>Loading saved configurations...</span>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}

              {!rowsLoading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3, color: '#64748b' }}>
                    No saved configuration yet.
                  </TableCell>
                </TableRow>
              )}

              {!rowsLoading && rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.businessEntity}</TableCell>
                  <TableCell>{row.connectionName}</TableCell>
                  <TableCell>{row.primaryValue || '—'}</TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography fontSize={12.5} color="#475569">
                      {row.identifiers.join(' • ') || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={row.isActive}
                      onChange={() => handleToggleActive(row)}
                      size="small"
                      disabled={actionRowId === row.id}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      color={row.isActive ? 'success' : 'default'}
                      variant={row.isActive ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>{formatTimestamp(row.savedAt)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleDelete(row)} disabled={actionRowId === row.id}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
