import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import TextInputField from '../../../components/shared/TextInputField';

const validationSchema = Yup.object({
  roleName: Yup.string().trim().required('Role name is required'),
});

export default function AddRoleDialog({ open, onClose, onSave }) {
  const formik = useFormik({
    initialValues: {
      roleName: '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const normalizedName = values.roleName.trim();
        const payload = {
          name: normalizedName,
          slug: normalizedName.toLowerCase().replace(/\s+/g, '_'),
        };

        await onSave?.(payload);
        resetForm();
      } finally {
        setSubmitting(false);
      }
    },
  });

  function handleClose() {
    formik.resetForm();
    onClose?.();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography fontWeight={700} fontSize={16}>Add Role</Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <TextInputField
          name="roleName"
          label="Role Name"
          value={formik.values.roleName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(formik.touched.roleName && formik.errors.roleName)}
          helperText={formik.touched.roleName && formik.errors.roleName ? formik.errors.roleName : undefined}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" color="inherit" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={formik.handleSubmit} disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
