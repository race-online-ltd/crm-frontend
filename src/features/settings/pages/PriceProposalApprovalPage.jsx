import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
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
  Tooltip,
  Typography,
} from '@mui/material';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import {
  fetchApprovalPipelineOptions,
  fetchApprovalPipelineSteps,
  saveApprovalPipelineSteps,
} from '../api/settingsApi';

const EMPTY_MODAL = {
  id: null,
  user_id: '',
};

function toStepRow(step, index) {
  return {
    id: step.id ?? null,
    clientKey: step.id ? `persisted-${step.id}` : `new-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    user_id: String(step.user_id ?? ''),
    user_label: step.user_label || step.user_name || '',
    level: step.level ?? index + 1,
  };
}

function reorderRows(rows, fromIndex, toIndex) {
  const next = [...rows];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);

  return next.map((row, index) => ({
    ...row,
    level: index + 1,
  }));
}

export default function PriceProposalApprovalPage() {
  const [businessEntities, setBusinessEntities] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [selectedBusinessEntityId, setSelectedBusinessEntityId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [rows, setRows] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isStepsLoading, setIsStepsLoading] = useState(false);
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
        const data = await fetchApprovalPipelineOptions();

        if (!active) {
          return;
        }

        setBusinessEntities((data.business_entities ?? []).map((entity) => ({
          id: String(entity.id),
          label: entity.label || entity.name || `Business Entity ${entity.id}`,
        })));

        setSystemUsers((data.system_users ?? []).map((user) => ({
          id: String(user.id),
          label: user.label || user.full_name || user.user_name || `User ${user.id}`,
        })));
      } catch (error) {
        if (active) {
          setLoadError(error?.message || 'Unable to load approval workflow options.');
          setBusinessEntities([]);
          setSystemUsers([]);
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

    const loadSteps = async () => {
      if (!selectedBusinessEntityId) {
        setRows([]);
        setSaveError('');
        setSuccessMessage('');
        setSelectedUserId('');
        return;
      }

      try {
        setIsStepsLoading(true);
        setLoadError('');
        setSaveError('');
        setSuccessMessage('');
        const data = await fetchApprovalPipelineSteps(selectedBusinessEntityId);

        if (!active) {
          return;
        }

        setRows((data.steps ?? []).map((step, index) => toStepRow(step, index)));
        setSelectedUserId('');
      } catch (error) {
        if (active) {
          setRows([]);
          setLoadError(error?.message || 'Unable to load approval steps for the selected business entity.');
        }
      } finally {
        if (active) {
          setIsStepsLoading(false);
        }
      }
    };

    loadSteps();

    return () => {
      active = false;
    };
  }, [selectedBusinessEntityId]);

  const businessEntityFetcher = useMemo(() => async () => businessEntities, [businessEntities]);
  const systemUserFetcher = useMemo(() => async () => systemUsers, [systemUsers]);

  const duplicateUserExists = (userId, clientKey = null) => rows.some((row) => {
    if (clientKey && row.clientKey === clientKey) {
      return false;
    }

    return row.user_id === String(userId);
  });

  const addApprover = () => {
    if (!selectedBusinessEntityId) {
      setSaveError('Select a business entity first.');
      return;
    }

    if (!selectedUserId) {
      setSaveError('Select a system user first.');
      return;
    }

    if (duplicateUserExists(selectedUserId)) {
      setSaveError('This user is already part of the selected workflow.');
      return;
    }

    setRows((prev) => [
      ...prev,
      toStepRow(
        {
          id: null,
          user_id: selectedUserId,
          user_label: systemUsers.find((user) => user.id === selectedUserId)?.label || '',
          level: prev.length + 1,
        },
        prev.length,
      ),
    ]);
    setSelectedUserId('');
    setSaveError('');
    setSuccessMessage('');
  };

  const openEditModal = (row) => {
    setModalValues({
      id: row.id,
      clientKey: row.clientKey,
      user_id: row.user_id,
    });
    setModalError('');
    setModalOpen(true);
  };

  const handleModalSave = () => {
    const userId = String(modalValues.user_id || '');

    if (!userId) {
      setModalError('System user is required.');
      return;
    }

    if (duplicateUserExists(userId, modalValues.clientKey)) {
      setModalError('This user is already part of the selected workflow.');
      return;
    }

    setRows((prev) => prev.map((row) => (
      row.clientKey === modalValues.clientKey
        ? {
          ...row,
          user_id: userId,
          user_label: systemUsers.find((user) => user.id === userId)?.label || row.user_label,
        }
        : row
    )));

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
        level: index + 1,
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
      const data = await saveApprovalPipelineSteps({
        business_entity_id: Number(selectedBusinessEntityId),
        steps: rows.map((row) => ({
          id: row.id ?? null,
          user_id: Number(row.user_id),
          level: row.level,
        })),
      });

      setRows((data.steps ?? []).map((step, index) => toStepRow(step, index)));
      setSuccessMessage('Approval workflow saved successfully.');
    } catch (error) {
      setSaveError(error?.message || 'Unable to save approval workflow.');
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
          <RequestQuoteOutlinedIcon sx={{ fontSize: 22, color: '#2563eb' }} />
        </Box>

        <Box>
          <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
            Approval Workflows
          </Typography>
          <Typography variant="body2" color="#64748b">
            Define the approval hierarchy for price proposals by business entity.
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

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', md: 'flex-end' }}
          sx={{ mb: 2.5 }}
        >
          <Box sx={{ flex: 1.1, minWidth: 0 }}>
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

          <Box sx={{ flex: 1.1, minWidth: 0 }}>
            <SelectDropdownSingle
              name="user_id"
              label="System User"
              placeholder={isBootstrapping ? 'Loading users...' : 'Select user'}
              fetchOptions={systemUserFetcher}
              value={selectedUserId}
              onChange={(value) => setSelectedUserId(value ? String(value) : '')}
              disabled={!selectedBusinessEntityId || isBootstrapping}
            />
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={addApprover}
            disabled={!selectedBusinessEntityId || !selectedUserId || isStepsLoading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              minWidth: { xs: '100%', md: 130 },
              alignSelf: { xs: 'stretch', md: 'auto' },
            }}
          >
            Add Approver
          </Button>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          gap={1.5}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#0f172a">
              Approval Steps
            </Typography>
            <Typography variant="body2" color="#64748b">
              Add approvers, reorder them, and save one workflow per business entity.
            </Typography>
          </Box>
        </Stack>

        <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: '14px' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700, width: 140 }}>Level</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 90 }}>Order</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>System User</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, width: 140 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!selectedBusinessEntityId ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5, color: '#64748b' }}>
                    Select a business entity to configure its approval workflow.
                  </TableCell>
                </TableRow>
              ) : isStepsLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5, color: '#64748b' }}>
                    Loading approval steps...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5, color: '#64748b' }}>
                    No approvers added yet. Use Add Approver to build the workflow.
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
                  <TableCell>{row.level}</TableCell>
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
                  <TableCell>{row.user_label}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit approver">
                      <IconButton size="small" onClick={() => openEditModal(row)}>
                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete approver">
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
            disabled={!selectedBusinessEntityId || isSaving || isStepsLoading}
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
        <DialogTitle>Edit Approver</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {modalError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
              {modalError}
            </Alert>
          )}

          <SelectDropdownSingle
            name="user_id"
            label="System User"
            fetchOptions={systemUserFetcher}
            value={modalValues.user_id}
            onChange={(value) => setModalValues((prev) => ({ ...prev, user_id: value ? String(value) : '' }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setModalOpen(false)} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleModalSave} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
