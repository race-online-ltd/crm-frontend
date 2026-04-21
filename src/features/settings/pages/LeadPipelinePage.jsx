import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import TextInputField from '../../../components/shared/TextInputField';
import {
  fetchLeadPipelineOptions,
  fetchLeadPipelineStages,
  saveLeadPipelineStages,
} from '../api/settingsApi';

const EMPTY_MODAL = {
  id: null,
  stage_name: '',
  color: '#2563EB',
};

function toStageRow(stage, index) {
  return {
    id: stage.id ?? null,
    clientKey: stage.id ? `persisted-${stage.id}` : `new-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    stage_name: stage.stage_name || '',
    color: (stage.color || '#2563EB').toUpperCase(),
    sort_order: stage.sort_order ?? index + 1,
  };
}

function reorderRows(rows, fromIndex, toIndex) {
  const next = [...rows];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);

  return next.map((row, index) => ({
    ...row,
    sort_order: index + 1,
  }));
}

export default function LeadPipelinePage() {
  const [businessEntities, setBusinessEntities] = useState([]);
  const [selectedBusinessEntityId, setSelectedBusinessEntityId] = useState('');
  const [rows, setRows] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isStagesLoading, setIsStagesLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalValues, setModalValues] = useState(EMPTY_MODAL);
  const [modalError, setModalError] = useState('');
  const [draggedKey, setDraggedKey] = useState(null);

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      try {
        setIsBootstrapping(true);
        setLoadError('');
        const data = await fetchLeadPipelineOptions();

        if (!active) {
          return;
        }

        const mappedBusinessEntities = (data.business_entities ?? []).map((entity) => ({
          id: String(entity.id),
          label: entity.label || entity.name || `Business Entity ${entity.id}`,
        }));

        setBusinessEntities(mappedBusinessEntities);
      } catch (error) {
        if (active) {
          setLoadError(error?.message || 'Unable to load lead pipeline options.');
          setBusinessEntities([]);
        }
      } finally {
        if (active) {
          setIsBootstrapping(false);
        }
      }
    };

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadStages = async () => {
      if (!selectedBusinessEntityId) {
        setRows([]);
        setSaveError('');
        setSuccessMessage('');
        return;
      }

      try {
        setIsStagesLoading(true);
        setLoadError('');
        setSaveError('');
        setSuccessMessage('');
        const data = await fetchLeadPipelineStages(selectedBusinessEntityId);

        if (!active) {
          return;
        }

        setRows((data.stages ?? []).map((stage, index) => toStageRow(stage, index)));
      } catch (error) {
        if (active) {
          setRows([]);
          setLoadError(error?.message || 'Unable to load stages for the selected business entity.');
        }
      } finally {
        if (active) {
          setIsStagesLoading(false);
        }
      }
    };

    loadStages();

    return () => {
      active = false;
    };
  }, [selectedBusinessEntityId]);

  const businessEntityFetcher = useMemo(() => async () => businessEntities, [businessEntities]);

  const openCreateModal = () => {
    setModalValues(EMPTY_MODAL);
    setModalError('');
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setModalValues({
      id: row.id,
      clientKey: row.clientKey,
      stage_name: row.stage_name,
      color: row.color,
    });
    setModalError('');
    setModalOpen(true);
  };

  const handleModalSave = () => {
    const stageName = modalValues.stage_name.trim();
    const color = (modalValues.color || '').toUpperCase();
    const duplicateExists = rows.some((row) => {
      if (modalValues.clientKey && row.clientKey === modalValues.clientKey) {
        return false;
      }

      return row.stage_name.trim().toLowerCase() === stageName.toLowerCase();
    });

    if (!stageName) {
      setModalError('Stage name is required.');
      return;
    }

    if (!/^#[A-F0-9]{6}$/.test(color)) {
      setModalError('Choose a valid hex color.');
      return;
    }

    if (duplicateExists) {
      setModalError('Stage name must be unique for this business entity.');
      return;
    }

    setRows((prev) => {
      if (modalValues.clientKey) {
        return prev.map((row) => (
          row.clientKey === modalValues.clientKey
            ? {
              ...row,
              stage_name: stageName,
              color,
            }
            : row
        ));
      }

      return [
        ...prev,
        toStageRow(
          {
            id: null,
            stage_name: stageName,
            color,
            sort_order: prev.length + 1,
          },
          prev.length,
        ),
      ];
    });

    setModalOpen(false);
    setModalValues(EMPTY_MODAL);
    setModalError('');
    setSaveError('');
    setSuccessMessage('');
  };

  const handleDeleteRow = (clientKey) => {
    setRows((prev) => prev
      .filter((row) => row.clientKey !== clientKey)
      .map((row, index) => ({
        ...row,
        sort_order: index + 1,
      })));
    setSaveError('');
    setSuccessMessage('');
  };

  const handleMoveRow = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= rows.length) {
      return;
    }

    setRows((prev) => reorderRows(prev, index, targetIndex));
    setSaveError('');
    setSuccessMessage('');
  };

  const handleSave = async () => {
    try {
      setSaveError('');
      setSuccessMessage('');

      if (!selectedBusinessEntityId) {
        setSaveError('Select a business entity first.');
        return;
      }

      setIsSaving(true);
      const data = await saveLeadPipelineStages({
        business_entity_id: Number(selectedBusinessEntityId),
        stages: rows.map((row) => ({
          id: row.id ?? null,
          stage_name: row.stage_name.trim(),
          color: row.color,
        })),
      });

      setRows((data.stages ?? []).map((stage, index) => toStageRow(stage, index)));
      setSuccessMessage('Lead pipeline saved successfully.');
    } catch (error) {
      setSaveError(error?.message || 'Unable to save lead pipeline stages.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
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
            flexShrink: 0,
          }}
        >
          <AccountTreeOutlinedIcon sx={{ fontSize: 22, color: '#2563eb' }} />
        </Box>

        <Box>
          <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
            Lead Pipeline
          </Typography>
          <Typography variant="body2" color="#64748b">
            Configure stage names, colors, and order by business entity for future Kanban usage.
          </Typography>
        </Box>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid #d1d9e0',
          bgcolor: '#fff',
          p: { xs: 2, sm: 2.5 },
        }}
      >
        {loadError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
            {loadError}
          </Alert>
        )}

        {saveError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
            {saveError}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>
            {successMessage}
          </Alert>
        )}

        <Box sx={{ maxWidth: 420, mb: 3 }}>
          <SelectDropdownSingle
            name="business_entity_id"
            label="Business Entity"
            placeholder={isBootstrapping ? 'Loading business entities...' : 'Select business entity'}
            fetchOptions={businessEntityFetcher}
            value={selectedBusinessEntityId}
            onChange={(value) => setSelectedBusinessEntityId(value ? String(value) : '')}
            disabled={isBootstrapping}
          />
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          gap={1.5}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#0f172a">
              Stages
            </Typography>
            <Typography variant="body2" color="#64748b">
              Add, edit, drag, or move stages up and down to define the exact order.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateModal}
            disabled={!selectedBusinessEntityId}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              alignSelf: { xs: 'stretch', sm: 'auto' },
            }}
          >
            Add Stage
          </Button>
        </Stack>

        <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: '14px' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, width: 70 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 90 }}>Move</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Stage Name</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 180 }}>Color</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, width: 140 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!selectedBusinessEntityId ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5, color: '#64748b' }}>
                    Select a business entity to configure its lead pipeline stages.
                  </TableCell>
                </TableRow>
              ) : isStagesLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5, color: '#64748b' }}>
                    Loading stages...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5, color: '#64748b' }}>
                    No stages added yet. Use Add Stage to build the pipeline.
                  </TableCell>
                </TableRow>
              ) : rows.map((row, index) => (
                <TableRow
                  key={row.clientKey}
                  hover
                  draggable
                  onDragStart={() => setDraggedKey(row.clientKey)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    const fromIndex = rows.findIndex((item) => item.clientKey === draggedKey);
                    if (fromIndex === -1 || fromIndex === index) {
                      return;
                    }
                    setRows((prev) => reorderRows(prev, fromIndex, index));
                    setDraggedKey(null);
                    setSaveError('');
                    setSuccessMessage('');
                  }}
                  onDragEnd={() => setDraggedKey(null)}
                  sx={{
                    cursor: 'grab',
                    '&:active': {
                      cursor: 'grabbing',
                    },
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <DragIndicatorIcon sx={{ color: '#94a3b8' }} />
                      <IconButton size="small" onClick={() => handleMoveRow(index, 'up')} disabled={index === 0}>
                        <ArrowUpwardIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleMoveRow(index, 'down')} disabled={index === rows.length - 1}>
                        <ArrowDownwardIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.stage_name}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          bgcolor: row.color,
                          border: '1px solid rgba(15, 23, 42, 0.12)',
                        }}
                      />
                      <Chip
                        label={row.color}
                        size="small"
                        sx={{
                          bgcolor: `${row.color}20`,
                          color: '#0f172a',
                          borderRadius: '999px',
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit stage">
                      <IconButton size="small" onClick={() => openEditModal(row)}>
                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete stage">
                      <IconButton size="small" color="error" onClick={() => handleDeleteRow(row.clientKey)}>
                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!selectedBusinessEntityId || isSaving || isStagesLoading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              minWidth: 140,
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Paper>

      <Dialog
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalError('');
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{modalValues.clientKey ? 'Edit Stage' : 'Add Stage'}</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {modalError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
              {modalError}
            </Alert>
          )}

          <Stack spacing={2}>
            <TextInputField
              name="stage_name"
              label="Stage Name"
              value={modalValues.stage_name}
              onChange={(event) => setModalValues((prev) => ({ ...prev, stage_name: event.target.value }))}
            />

            <Stack spacing={0.75}>
              <Typography variant="body2" fontWeight={600} color="#0f172a">
                Stage Color
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <TextField
                  type="color"
                  value={modalValues.color}
                  onChange={(event) => setModalValues((prev) => ({ ...prev, color: event.target.value.toUpperCase() }))}
                  sx={{
                    width: { xs: '100%', sm: 90 },
                    '& .MuiOutlinedInput-root': {
                      p: 0.5,
                      height: 48,
                    },
                    '& input': {
                      p: 0,
                      width: '100%',
                      height: 36,
                      border: 0,
                      background: 'transparent',
                      cursor: 'pointer',
                    },
                  }}
                />

                <TextInputField
                  name="color"
                  label="Hex Color"
                  value={modalValues.color}
                  onChange={(event) => setModalValues((prev) => ({ ...prev, color: event.target.value.toUpperCase() }))}
                />
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setModalOpen(false)} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleModalSave} sx={{ textTransform: 'none', fontWeight: 700 }}>
            {modalValues.clientKey ? 'Save Changes' : 'Add Stage'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
