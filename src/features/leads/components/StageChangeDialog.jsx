// src/features/leads/components/StageChangeDialog.jsx
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Stack, Box, TextField, Chip,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const validationSchema = Yup.object({
  note: Yup.string().trim().required('Stage change note is required').max(500, 'Note must be under 500 characters'),
});

export default function StageChangeDialog({ open, onClose, onConfirm, leadName, fromStage, toStage }) {
  const formik = useFormik({
    initialValues: { note: '' },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      onConfirm(values.note);
      resetForm();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '16px', border: '1px solid #e9eef4' },
      }}
    >
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            bgcolor: '#fff7ed', border: '1px solid #fed7aa',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SwapHorizIcon sx={{ fontSize: 18, color: '#f97316' }} />
          </Box>
          <Box>
            <Typography fontWeight={700} fontSize="1rem" color="#0f172a">
              Confirm Stage Change
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Add a note to proceed with the stage change.
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent sx={{ px: 3, py: 2 }}>
          {/* Lead & Stage Info */}
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', mb: 2.5 }}>
            <Typography variant="body2" fontWeight={700} color="#1e293b" mb={1}>
              {leadName}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip label={fromStage} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
              <SwapHorizIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              <Chip label={toStage} size="small" color="primary" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
            </Stack>
          </Box>

          {/* Note Input */}
          <TextField
            fullWidth
            multiline
            rows={3}
            name="note"
            label="Stage Change Note *"
            placeholder="Enter reason for stage change..."
            value={formik.values.note}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.note && formik.errors.note)}
            helperText={formik.touched.note && formik.errors.note}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: '10px' },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClose}
            sx={{
              textTransform: 'none', fontWeight: 600, color: '#64748b',
              borderRadius: '10px', border: '1px solid #e2e8f0', px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              textTransform: 'none', fontWeight: 600, borderRadius: '10px',
              bgcolor: '#2563eb', px: 3, boxShadow: 'none',
              '&:hover': { bgcolor: '#1d4ed8', boxShadow: 'none' },
            }}
          >
            Confirm Change
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
