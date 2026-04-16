import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import TextInputField from '../../../components/shared/TextInputField';
import SelectDropdownMultiple from '../../../components/shared/SelectDropdownMultiple';
import CustomToggle from '../../../components/shared/CustomToggle';

const validationSchema = Yup.object({
  teamName: Yup.string().trim().required('Team Name is required'),
  supervisor: Yup.array().min(1, 'Select at least one supervisor'),
  assignKAM: Yup.array().min(1, 'Select at least one KAM'),
  status: Yup.boolean(),
});

export default function TeamForm({
  supervisorOptions = [],
  kamOptions = [],
  onCancel,
  onSave,
  initialValues = null,
}) {
  const formik = useFormik({
    initialValues: {
      teamName: initialValues?.teamName || '',
      supervisor: initialValues?.supervisor || [],
      assignKAM: initialValues?.assignKAM || [],
      status: initialValues?.status ?? true,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      await onSave?.({
        teamName: values.teamName.trim(),
        supervisor: values.supervisor,
        assignKAM: values.assignKAM,
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
          name="teamName"
          label="Team Name *"
          value={formik.values.teamName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.teamName && Boolean(formik.errors.teamName)}
          helperText={formik.touched.teamName && formik.errors.teamName ? formik.errors.teamName : ' '}
        />

        <SelectDropdownMultiple
          name="supervisor"
          label="Supervisor *"
          options={supervisorOptions}
          value={formik.values.supervisor}
          onChange={(ids) => formik.setFieldValue('supervisor', ids)}
          onBlur={formik.handleBlur}
          error={formik.touched.supervisor && Boolean(formik.errors.supervisor)}
          helperText={formik.touched.supervisor && formik.errors.supervisor ? formik.errors.supervisor : ' '}
        />

        <SelectDropdownMultiple
          name="assignKAM"
          label="Assign KAM *"
          options={kamOptions}
          value={formik.values.assignKAM}
          onChange={(ids) => formik.setFieldValue('assignKAM', ids)}
          onBlur={formik.handleBlur}
          error={formik.touched.assignKAM && Boolean(formik.errors.assignKAM)}
          helperText={formik.touched.assignKAM && formik.errors.assignKAM ? formik.errors.assignKAM : ' '}
        />

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
