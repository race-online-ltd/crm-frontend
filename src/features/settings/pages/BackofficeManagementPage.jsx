import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import SelectDropdownMultiple from '../../../components/shared/SelectDropdownMultiple';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import TextInputField from '../../../components/shared/TextInputField';
import {
  createBackoffice,
  deleteBackoffice,
  fetchBackofficeOptions,
  fetchBackoffices,
  updateBackoffice,
} from '../api/settingsApi';

const validationSchema = Yup.object({
  backoffice_name: Yup.string().trim().required('Back Office Name is required'),
  business_entity_id: Yup.mixed().required('Business entity is required'),
  user_ids: Yup.array().min(1, 'At least one system user is required'),
});

export default function BackofficeManagementPage() {
  const [showForm, setShowForm] = useState(false);
  const [rows, setRows] = useState([]);
  const [businessEntities, setBusinessEntities] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [editingRowId, setEditingRowId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadPageData = async () => {
      try {
        setLoadError('');
        const [backofficeRows, optionData] = await Promise.all([
          fetchBackoffices(),
          fetchBackofficeOptions(),
        ]);

        if (!active) {
          return;
        }

        setRows(backofficeRows);
        setBusinessEntities(optionData.business_entities ?? []);
        setSystemUsers(optionData.system_users ?? []);
      } catch (error) {
        if (active) {
          setLoadError(error?.message || 'Unable to load backoffice management data.');
        }
      }
    };

    loadPageData();

    return () => {
      active = false;
    };
  }, []);

  const businessEntityFetcher = useMemo(
    () => async () => businessEntities,
    [businessEntities],
  );

  const formik = useFormik({
    initialValues: {
      backoffice_name: '',
      business_entity_id: '',
      user_ids: [],
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setSaveError('');
        const payload = {
          backoffice_name: values.backoffice_name.trim(),
          business_entity_id: values.business_entity_id,
          user_ids: values.user_ids,
        };

        if (editingRowId) {
          const updated = await updateBackoffice(editingRowId, payload);
          setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
        } else {
          const created = await createBackoffice(payload);
          setRows((prev) => [created, ...prev]);
        }

        resetForm();
        setShowForm(false);
        setEditingRowId(null);
      } catch (error) {
        setSaveError(error?.message || `Unable to ${editingRowId ? 'update' : 'save'} backoffice configuration.`);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleStartCreate = () => {
    formik.resetForm();
    setSaveError('');
    setDeleteError('');
    setEditingRowId(null);
    setShowForm(true);
  };

  const handleStartEdit = (row) => {
    formik.setValues({
      backoffice_name: row.backoffice_name || '',
      business_entity_id: row.business_entity_id ? String(row.business_entity_id) : '',
      user_ids: (row.system_users || []).map((user) => String(user.id)),
    });
    setSaveError('');
    setDeleteError('');
    setEditingRowId(row.id);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    formik.resetForm();
    setSaveError('');
    setEditingRowId(null);
    setShowForm(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError('');
      await deleteBackoffice(deleteTarget.id);
      setRows((prev) => prev.filter((row) => row.id !== deleteTarget.id));

      if (editingRowId === deleteTarget.id) {
        handleCancelForm();
      }

      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(error?.message || 'Unable to delete backoffice configuration.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        sx={{ mb: 3 }}
        gap={2}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={0.75}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                bgcolor: '#eff6ff',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DomainAddIcon sx={{ fontSize: 22, color: '#2563eb' }} />
            </Box>
            <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
              Backoffice Management
            </Typography>
          </Stack>
          <Typography variant="body2" color="#64748b">
            Manage backoffice setup by business entity and connect the relevant system users.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => {
            setSaveError('');
            setDeleteError('');
            if (showForm) {
              handleCancelForm();
            } else {
              handleStartCreate();
            }
          }}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 13,
            px: 2.5,
            py: 1,
            boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
            whiteSpace: 'nowrap',
            alignSelf: { xs: 'stretch', sm: 'auto' },
          }}
        >
          {showForm ? 'Hide Form' : 'Add'}
        </Button>
      </Stack>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {loadError}
        </Alert>
      )}

      {showForm && (
        <Paper
          elevation={0}
          sx={{
            mb: 2.5,
            borderRadius: '14px',
            border: '1px solid #d1d9e0',
            bgcolor: '#fff',
            p: { xs: 2, sm: 2.5 },
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} color="#0f172a" mb={0.5}>
            {editingRowId ? 'Edit Backoffice Configuration' : 'Add Backoffice Configuration'}
          </Typography>
          <Typography variant="body2" color="#64748b" mb={2}>
            {editingRowId
              ? 'Update the backoffice details and assigned system users.'
              : 'The form stays hidden until you click Add, then saves directly to the backend.'}
          </Typography>

          {saveError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
              {saveError}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={formik.handleSubmit}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: '0px 20px',
                width: '100%',
              }}
            >
              <TextInputField
                name="backoffice_name"
                label="Back Office Name"
                value={formik.values.backoffice_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.backoffice_name && Boolean(formik.errors.backoffice_name)}
                helperText={formik.touched.backoffice_name && formik.errors.backoffice_name ? formik.errors.backoffice_name : ' '}
              />

              <SelectDropdownSingle
                name="business_entity_id"
                label="Business Entity"
                fetchOptions={businessEntityFetcher}
                value={formik.values.business_entity_id}
                onChange={(id) => formik.setFieldValue('business_entity_id', id)}
                onBlur={() => formik.setFieldTouched('business_entity_id', true)}
                error={formik.touched.business_entity_id && Boolean(formik.errors.business_entity_id)}
                helperText={formik.touched.business_entity_id && formik.errors.business_entity_id ? formik.errors.business_entity_id : ' '}
              />

              <Box sx={{ gridColumn: '1 / -1' }}>
                <SelectDropdownMultiple
                  name="user_ids"
                  label="System Users"
                  options={systemUsers}
                  value={formik.values.user_ids}
                  onChange={(ids) => formik.setFieldValue('user_ids', ids)}
                  onBlur={formik.handleBlur}
                  error={formik.touched.user_ids && Boolean(formik.errors.user_ids)}
                  helperText={formik.touched.user_ids && formik.errors.user_ids ? formik.errors.user_ids : undefined}
                  limitTags={4}
                  fixedHeight
                />
              </Box>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end" mt={2.5}>
              <Button
                variant="outlined"
                onClick={handleCancelForm}
                sx={{
                  minWidth: { xs: '100%', sm: 120 },
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '10px',
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting}
                sx={{
                  minWidth: { xs: '100%', sm: 120 },
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '10px',
                  bgcolor: '#2563eb',
                  boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
                  '&:hover': { bgcolor: '#1d4ed8' },
                }}
              >
                {formik.isSubmitting ? (editingRowId ? 'Updating...' : 'Saving...') : (editingRowId ? 'Update' : 'Save')}
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {deleteError}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid #d1d9e0',
          bgcolor: '#fff',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700 }}>Back Office Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Business Entity</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>System Users</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 120 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#64748b' }}>
                    No backoffice configuration saved yet.
                  </TableCell>
                </TableRow>
              ) : rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ color: '#0f172a', fontWeight: 600 }}>
                    {row.backoffice_name}
                  </TableCell>
                  <TableCell sx={{ color: '#475569' }}>
                    {row.business_entity_name}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                      {(row.system_users || []).map((user) => (
                        <Chip
                          key={user.id}
                          label={user.full_name || user.user_name}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: 11.5,
                            borderRadius: '6px',
                            height: 24,
                            bgcolor: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                          }}
                        />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => handleStartEdit(row)}
                        sx={{ color: '#94a3b8' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setDeleteError('');
                          setDeleteTarget(row);
                        }}
                        sx={{ color: '#ef4444' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
      </Paper>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Backoffice Configuration</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget
              ? `Delete "${deleteTarget.backoffice_name}"? This will also remove its system user mappings.`
              : 'Delete this backoffice configuration?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            sx={{ textTransform: 'none' }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
