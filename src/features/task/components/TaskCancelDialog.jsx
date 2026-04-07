// src/features/tasks/components/TaskCancelDialog.jsx
import React, { useEffect } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, Stack, Typography, Box, IconButton,
} from '@mui/material';
import BlockIcon  from '@mui/icons-material/Block';
import CloseIcon  from '@mui/icons-material/Close';
import { useFormik } from 'formik';
import TextAreaInputField from '@/components/shared/TextAreaInputField';

export default function TaskCancelDialog({ open, task, onClose, onConfirm }) {
  const formik = useFormik({
    initialValues: { cancellationReason: '' },
    validate: (values) => {
      const errors = {};
      if (!values.cancellationReason.trim())
        errors.cancellationReason = 'Cancellation reason is required';
      return errors;
    },
    onSubmit: (values) => {
      const trimmedReason = values.cancellationReason.trim();
      if (!task?.id || !trimmedReason) return;
      onConfirm?.(task.id, { cancellationReason: trimmedReason });
      formik.resetForm();
    },
  });

  const { values, touched, errors, handleChange, handleBlur, handleSubmit, resetForm } = formik;

  useEffect(() => {
    if (!open) { resetForm(); return; }
    resetForm({ values: { cancellationReason: task?.cancellationReason || '' } });
  }, [open, task, resetForm]);

  function handleClose() { resetForm(); onClose?.(); }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          border: '0.5px solid',
          borderColor: 'divider',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          overflow: 'visible',
        },
      }}
    >
      {/* ── HEADER ── */}
      <DialogTitle sx={{ px: 2.5, pt: 2, pb: 1.75, borderBottom: '0.5px solid', borderColor: '#ffffff' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1.25}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
              bgcolor: '#fef2f2', border: '0.5px solid #fecaca',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BlockIcon sx={{ fontSize: 17, color: '#b91c1c' }} />
            </Box>
            <Box>
              <Typography fontWeight={500} fontSize={15} color="text.primary" lineHeight={1.3}>
                Cancel task
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
      <DialogContent sx={{ px: 2.5, pt: 2.25, pb: 2, overflow: 'visible' }}>
        <TextAreaInputField
          label="Cancellation reason *"
          name="cancellationReason"
          value={values.cancellationReason}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.cancellationReason && Boolean(errors.cancellationReason)}
          helperText={touched.cancellationReason ? errors.cancellationReason : ''}
          placeholder="Explain why this task is being cancelled"
          rows={4}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#e3eaf2' },
              '&:hover fieldset': { borderColor: '#d3deea' },
              '&.Mui-focused fieldset': { borderColor: '#b91c1c' },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: '#b91c1c' },
          }}
        />
      </DialogContent>

      {/* ── FOOTER ── */}
      <DialogActions sx={{ px: 2.5, py: 1.625, borderTop: '0.5px solid', borderColor: 'divider', gap: 0.75 }}>
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
          Discard
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="small"
          disabled={!values.cancellationReason.trim()}
          disableElevation
          sx={{
            borderRadius: '8px', fontSize: 12.5, fontWeight: 500,
            bgcolor: '#b91c1c',
            '&:hover': { bgcolor: '#991b1b' },
            '&.Mui-disabled': { bgcolor: '#fecaca', color: '#fff' },
          }}
        >
          Confirm cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}