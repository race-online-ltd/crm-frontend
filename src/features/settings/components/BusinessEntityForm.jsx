import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import TextInputField from '../../../components/shared/TextInputField';
import CustomToggle from '../../../components/shared/CustomToggle';

const validationSchema = Yup.object({
  name: Yup.string().trim().required('Business Entity Name is required'),
  status: Yup.boolean(),
});

export default function BusinessEntityForm({
  initialValues = null,
  onCancel,
  onSave,
}) {
  const formik = useFormik({
    initialValues: {
      name: initialValues?.name || '',
      status: initialValues?.status ?? true,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      await onSave?.({
        name: values.name.trim(),
        status: values.status,
      });
      resetForm();
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: '0px 20px',
          width: '100%',
        }}
      >
        <TextInputField
          name="name"
          label="Business Entity Name *"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name ? formik.errors.name : ' '}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          minHeight: 32,
          px: 1.5,
          mt: 1.5,
          mb: 1,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Typography fontSize={13} fontWeight={600} color="#475569">
            Status
          </Typography>
          <CustomToggle
            size="sm"
            label={formik.values.status ? 'Active' : 'Inactive'}
            checked={formik.values.status}
            onChange={(event) => formik.setFieldValue('status', event.target.checked)}
          />
        </Stack>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={5}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onCancel}
          sx={{
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
          fullWidth
          variant="contained"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
            bgcolor: '#2563eb',
            '&:hover': { bgcolor: '#1d4ed8' },
          }}
        >
          Save
        </Button>
      </Stack>
    </Box>
  );
}
