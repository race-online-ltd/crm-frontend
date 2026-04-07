// src/features/tasks/components/TaskCompleteDialog.jsx
import React, { useEffect } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, Stack, Typography, Box, IconButton,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon              from '@mui/icons-material/Close';
import { useFormik }          from 'formik';
import TextAreaInputField     from '@/components/shared/TextAreaInputField';

export default function TaskCompleteDialog({ open, task, onClose, onConfirm }) {
  const formik = useFormik({
    initialValues: { completionMessage: '' },
    validate: (values) => {
      const errors = {};
      if (!values.completionMessage.trim())
        errors.completionMessage = 'Completion message is required';
      return errors;
    },
    onSubmit: (values) => {
      const trimmedMessage = values.completionMessage.trim();
      if (!task?.id || !trimmedMessage) return;
      onConfirm?.(task.id, { completionMessage: trimmedMessage });
      formik.resetForm();
    },
  });

  const { values, touched, errors, handleChange, handleBlur, handleSubmit, resetForm } = formik;

  useEffect(() => {
    if (!open) { resetForm(); return; }
    resetForm({ values: { completionMessage: task?.completionMessage || '' } });
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
              bgcolor: '#f0fdf4', border: '0.5px solid #bbf7d0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 17, color: '#16a34a' }} />
            </Box>
            <Box>
              <Typography fontWeight={500} fontSize={15} color="text.primary" lineHeight={1.3}>
                Complete task
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
      <DialogContent sx={{ px: 2.5, pt: 4, pb: 2, overflow: 'visible' }}>
        <TextAreaInputField
          label="Completion message *"
          name="completionMessage"
          value={values.completionMessage}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.completionMessage && Boolean(errors.completionMessage)}
          helperText={touched.completionMessage ? errors.completionMessage : ''}
          placeholder="Explain how this task was completed"
          rows={4}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#e3eaf2' },
              '&:hover fieldset': { borderColor: '#d3deea' },
              '&.Mui-focused fieldset': { borderColor: '#16a34a' },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: '#16a34a' },
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
          disabled={!values.completionMessage.trim()}
          disableElevation
          sx={{
            borderRadius: '8px', fontSize: 12.5, fontWeight: 500,
            bgcolor: '#16a34a',
            '&:hover': { bgcolor: '#15803d' },
            '&.Mui-disabled': { bgcolor: '#bbf7d0', color: '#fff' },
          }}
        >
          Complete
        </Button>
      </DialogActions>
    </Dialog>
  );
}