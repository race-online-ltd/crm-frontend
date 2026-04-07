// src/features/leads/components/LeadForwardDialog.jsx
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, IconButton, Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import TextAreaInputField from '../../../components/shared/TextAreaInputField';

/* ── MOCK DATA — remove when backend is wired ── */
const fetchKAMs = async () => [
  { id: 'kam1', label: 'John Smith' },
  { id: 'kam2', label: 'Rimon Ahmed' },
  { id: 'kam3', label: 'Sarah Khan' },
];
/* ── END MOCK DATA ── */

const forwardSchema = Yup.object({
  kamId: Yup.string().required('Please select a KAM'),
  reason: Yup.string().trim().required('Reason is required'),
});

export default function LeadForwardDialog({ open, onClose, onForward, leadName }) {
  const formik = useFormik({
    initialValues: { kamId: '', reason: '' },
    validationSchema: forwardSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting, resetForm }) => {
      onForward?.(values);
      setSubmitting(false);
      resetForm();
      onClose();
    },
  });

  const { values, errors, touched, handleSubmit, setFieldValue, handleChange, isSubmitting } = formik;

  const handleCancel = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm"
      PaperProps={{ sx: { borderRadius: '14px' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.5 }}>
        <Typography variant="h6" fontWeight={700}>Forward Lead</Typography>
        <IconButton size="small" onClick={handleCancel}><CloseIcon /></IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, pb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Forward <strong>{leadName}</strong> to another KAM
        </Typography>
      </Box>

      <DialogContent sx={{ pt: 1.5 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SelectDropdownSingle
            name="kamId"
            label="Select KAM"
            fetchOptions={fetchKAMs}
            value={values.kamId}
            onChange={(id) => setFieldValue('kamId', id)}
            error={touched.kamId && Boolean(errors.kamId)}
            helperText={touched.kamId && errors.kamId}
          />

          <TextAreaInputField
            name="reason"
            label="Reason"
            placeholder="Enter reason for forwarding..."
            value={values.reason}
            onChange={handleChange}
            rows={4}
            error={touched.reason && Boolean(errors.reason)}
            helperText={touched.reason && errors.reason}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleCancel} variant="outlined" color="inherit" sx={{ borderRadius: '10px', px: 3 }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" loading={isSubmitting}
          sx={{ borderRadius: '10px', px: 3, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}>
          Forward
        </Button>
      </DialogActions>
    </Dialog>
  );
}
