// src/features/target/pages/TargetList.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import KAMTargetTable from '../components/KAMTargetTable';
import SetTarget from '../components/SetTarget';
import { createTarget, fetchTargets, updateTarget } from '../api/targetApi';

function formatPeriodLabel(target) {
  const targetMode = target.target_mode;
  const year = Number(target.target_year);
  const value = Number(target.target_value);

  if (!Number.isFinite(year) || !Number.isFinite(value)) {
    return targetMode === 'quarterly' ? 'Quarter' : 'Month';
  }

  if (targetMode === 'quarterly') {
    return `Q${value} ${year}`;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
  }).format(new Date(year, Math.max(value - 1, 0), 1)) + ` ${year}`;
}

function mapTargetToRow(target) {
  const periodMode = target.target_mode === 'quarterly' ? 'quarterly' : 'monthly';
  const targetYear = Number(target.target_year);
  const targetValue = Number(target.target_value);
  const period = periodMode === 'monthly'
    ? {
      year: targetYear,
      month: Math.max(targetValue - 1, 0),
      label: formatPeriodLabel(target),
    }
    : {
      year: targetYear,
      quarter: targetValue,
      label: formatPeriodLabel(target),
    };

  return {
    id: target.id,
    periodMode,
    period,
    businessEntity: target.business_entity?.name || '',
    kam: target.kam?.label || target.kam?.full_name || target.kam?.user_name || '',
    teamIds: Array.isArray(target.team_ids) ? target.team_ids.map((value) => String(value)) : [],
    groupIds: Array.isArray(target.group_ids) ? target.group_ids.map((value) => String(value)) : [],
    teamNames: Array.isArray(target.team_names) ? target.team_names : [],
    groupNames: Array.isArray(target.group_names) ? target.group_names : [],
    products: [target.product?.label || target.product?.product_name].filter(Boolean),
    targetAmount: Number(target.revenue_target || 0),
    createdAt: target.created_at,
    raw: target,
  };
}

function getRowsForViewMode(rows, viewMode) {
  if (viewMode === 'monthly' || viewMode === 'quarterly') {
    return rows.filter((row) => row.periodMode === viewMode);
  }

  return rows;
}

function buildSummary(rows, viewMode) {
  const scopedRows = getRowsForViewMode(rows, viewMode);
  const uniqueKams = new Set(scopedRows.map((row) => row.kam).filter(Boolean)).size;
  const totalAmount = scopedRows.reduce((sum, row) => sum + Number(row.targetAmount || 0), 0);

  return [
    {
      label: 'Total KAMs',
      value: String(uniqueKams),
    },
    {
      label: 'Total Target',
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'BDT',
        maximumFractionDigits: 0,
      }).format(totalAmount).replace('BDT', '৳'),
    },
  ];
}

export default function TargetList() {
  const navigate = useNavigate();
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [viewMode, setViewMode] = useState('monthly');

  const loadTargets = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetchTargets();
      const items = Array.isArray(response.data) ? response.data : [];
      setTargets(items.map(mapTargetToRow));
    } catch (error) {
      setTargets([]);
      toast.error(error?.response?.data?.message || error?.message || 'Unable to load targets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTargets();
  }, [loadTargets]);

  const summaryStats = useMemo(() => buildSummary(targets, viewMode), [targets, viewMode]);

  const handleOpenEdit = (row) => {
    setEditingTarget(row?.raw || null);
    setFormOpen(true);
  };

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditingTarget(null);
  }, []);

  const handleSaveTarget = useCallback(async (payload) => {
    try {
      if (editingTarget?.id) {
        await updateTarget(editingTarget.id, payload);
        toast.success('Target updated successfully.');
      } else {
        await createTarget(payload);
        toast.success('Target created successfully.');
      }

      await loadTargets();
      handleCloseForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Unable to save target.');
    }
  }, [editingTarget, handleCloseForm, loadTargets]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        mb={3}
        gap={2}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            color="#0f172a"
            sx={{ fontSize: '1.35rem', letterSpacing: '-0.3px' }}
          >
            KAM Targets
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.25}>
            Monitor monthly targets and performance for all Key Account Managers
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/target/set')}
            sx={{
              fontWeight: 700,
              fontSize: '0.82rem',
              bgcolor: '#2563eb',
              borderRadius: '9px',
              boxShadow: 'none',
              px: 2.5,
              py: 1,
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 4px 14px rgba(37,99,235,0.25)' },
            }}
          >
            Add Target
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: '12px',
          mb: 3,
        }}
      >
        {summaryStats.map((stat) => (
          <Paper
            key={stat.label}
            variant="outlined"
            sx={{
              p: '14px 16px',
              borderRadius: '12px',
              borderColor: '#e2e8f0',
              bgcolor: '#fff',
            }}
          >
            <Stack spacing={0.9}>
              <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">
                {stat.label}
              </Typography>
              <Typography fontWeight={700} fontSize="1.3rem" color="#0f172a" lineHeight={1.2}>
                {stat.value}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Box>

      <KAMTargetTable
        rows={targets}
        loading={loading && targets.length === 0}
        onEdit={handleOpenEdit}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <Dialog
        open={formOpen && Boolean(editingTarget)}
        onClose={handleCloseForm}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: '18px' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#0f172a">
              Edit KAM Target
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update the target details and save changes.
            </Typography>
          </Box>
          <IconButton onClick={handleCloseForm} aria-label="Close target form">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 3, overflow: 'visible' }}>
          <SetTarget
            initialTarget={editingTarget}
            submitLabel="Update Target"
            onCancel={handleCloseForm}
            onSubmit={handleSaveTarget}
            onSuccess={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
