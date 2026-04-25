// src/features/tasks/components/TaskCheckInDialog.jsx
import React, { useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, Stack, Typography,
} from '@mui/material';
import GpsFixedIcon      from '@mui/icons-material/GpsFixed';
import PinDropIcon       from '@mui/icons-material/PinDrop';
import TaskAltIcon       from '@mui/icons-material/TaskAlt';
import WarningAmberIcon  from '@mui/icons-material/WarningAmber';
import CloseIcon         from '@mui/icons-material/Close';
import RefreshIcon       from '@mui/icons-material/Refresh';

export default function TaskCheckInDialog({ open, task, onClose, onSuccess, loading = false }) {
  const CHECK_IN_RADIUS_METERS = 50;
  const [state,    setState]    = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function haversine(lat1, lon1, lat2, lon2) {
    const R     = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dPhi    = toRad(lat2 - lat1);
    const dLambda = toRad(lon2 - lon1);
    const a = Math.sin(dPhi / 2) ** 2
      + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLambda / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async function handleCheckIn() {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation not supported.');
      setState('error');
      return;
    }

    if (!task?.location?.latitude || !task?.location?.longitude) {
      setErrorMsg('This task does not have valid check-in coordinates.');
      setState('error');
      return;
    }

    setState('locating');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setState('checking');
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        const dist = haversine(
          latitude, longitude,
          task.location.latitude, task.location.longitude,
        );

        if (dist <= CHECK_IN_RADIUS_METERS) {
          try {
            await onSuccess?.(task, {
              latitude,
              longitude,
              distance_meters: Math.round(dist),
            });
            setState('success');
            setTimeout(() => { onClose?.(); setState('idle'); }, 1200);
          } catch (error) {
            setErrorMsg(error?.message || 'Unable to record check-in.');
            setState('error');
          }
          return;
        }

        setErrorMsg(`You are ${Math.round(dist)} m away. Must be within ${CHECK_IN_RADIUS_METERS} m to check in.`);
        setState('error');
      },
      (err) => {
        setErrorMsg(err.code === 1 ? 'Location permission denied.' : 'Unable to get your location.');
        setState('error');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function handleClose() {
    setState('idle');
    setErrorMsg('');
    onClose?.();
  }

  const isLoading = state === 'locating' || state === 'checking';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          border: '0.5px solid',
          borderColor: 'divider',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        },
      }}
    >
      {/* ── HEADER ── */}
      <DialogTitle sx={{ px: 2.5, pt: 2, pb: 1.75, borderBottom: '0.5px solid', borderColor: 'white' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1.25}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
              bgcolor: '#eff6ff', border: '0.5px solid #bfdbfe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GpsFixedIcon sx={{ fontSize: 17, color: '#2563eb' }} />
            </Box>
            <Box>
              <Typography fontWeight={500} fontSize={15} color="text.primary" lineHeight={1.3}>
                Check in
              </Typography>
              <Typography fontSize={12} color="text.secondary" mt={0.375} lineHeight={1.3}>
                {task?.title}
              </Typography>
            </Box>
          </Stack>

          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              borderRadius: '8px', border: '0.5px solid', borderColor: 'divider',
              width: 28, height: 28, color: 'text.secondary',
            }}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* ── BODY ── */}
      <DialogContent sx={{ px: 2.5, pt: 2.25, pb: 2 }}>
        <Stack gap={2}>

          {/* Location address pill */}
          {task?.location?.address && (
            <Box sx={{
              display: 'flex', alignItems: 'flex-start', gap: 1,
              px: 1.5, py: 1.125,
              bgcolor: 'action.hover',
              borderRadius: '8px',
              border: '0.5px solid', borderColor: 'divider',
            }}>
              <PinDropIcon sx={{ fontSize: 15, color: 'primary.main', flexShrink: 0, mt: '1px' }} />
              <Typography fontSize={13} color="text.secondary" lineHeight={1.5}>
                {task.location.address}
              </Typography>
            </Box>
          )}

          {/* State-driven content */}
          {state === 'idle' && (
            <Typography fontSize={13} color="text.secondary" lineHeight={1.7}>
              We'll verify your GPS matches the venue location. You must be within 50 m to check in.
            </Typography>
          )}

          {isLoading && (
            <Stack alignItems="center" gap={1.5} py={2.5}>
              <CircularProgress size={32} thickness={3.5} sx={{ color: '#2563eb' }} />
              <Typography fontSize={13} color="text.secondary">
                {state === 'locating' ? 'Acquiring your location…' : 'Verifying distance…'}
              </Typography>
            </Stack>
          )}

          {state === 'success' && (
            <Stack alignItems="center" gap={1.25} py={2.5}>
              <Box sx={{
                width: 52, height: 52, borderRadius: '14px',
                bgcolor: '#f0fdf4', border: '0.5px solid #bbf7d0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TaskAltIcon sx={{ fontSize: 26, color: '#16a34a' }} />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography fontSize={14} fontWeight={500} color="#16a34a" lineHeight={1.4}>
                  Check-in successful
                </Typography>
                <Typography fontSize={12} color="text.secondary" mt={0.5}>
                  Your attendance has been recorded
                </Typography>
              </Box>
            </Stack>
          )}

          {state === 'error' && (
            <Box sx={{
              display: 'flex', gap: 1.25,
              px: 1.5, py: 1.25,
              bgcolor: '#fff7ed',
              borderRadius: '8px',
              border: '0.5px solid #fed7aa',
            }}>
              <WarningAmberIcon sx={{ fontSize: 15, color: '#ea580c', flexShrink: 0, mt: '1px' }} />
              <Typography fontSize={13} color="#9a3412" lineHeight={1.6}>
                {errorMsg}
              </Typography>
            </Box>
          )}

        </Stack>
      </DialogContent>

      {/* ── FOOTER ── */}
      <DialogActions sx={{ px: 2.5, py: 1.625, borderTop: '0.5px solid', borderColor: 'white', gap: 0.75 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          size="small"
          sx={{
            borderRadius: '8px', fontSize: 12.5, fontWeight: 400,
            borderColor: 'divider', color: 'text.secondary', mr: 'auto',
            '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' },
          }}
        >
          Dismiss
        </Button>

        {(state === 'idle' || state === 'error') && (
          <Button
            onClick={handleCheckIn}
            variant="contained"
            size="small"
            disableElevation
            disabled={loading || isLoading}
            startIcon={
              state === 'error'
                ? <RefreshIcon sx={{ fontSize: '13px !important' }} />
                : <GpsFixedIcon sx={{ fontSize: '13px !important' }} />
            }
            sx={{
              borderRadius: '8px', fontSize: 12.5, fontWeight: 500,
              bgcolor: '#2563eb',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            {state === 'error' ? 'Retry' : 'Share location & check in'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
