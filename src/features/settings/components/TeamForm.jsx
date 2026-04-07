import React, { useEffect, useMemo } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import TextInputField from '../../../components/shared/TextInputField';
import SelectDropdownMultiple from '../../../components/shared/SelectDropdownMultiple';
import CustomToggle from '../../../components/shared/CustomToggle';

const validationSchema = Yup.object({
  teamName: Yup.string().trim().required('Team Name is required'),
  businessEntity: Yup.array().min(1, 'Select at least one business entity'),
  assignKAM: Yup.array().min(1, 'Select at least one KAM'),
  supervisor: Yup.array().min(1, 'Select at least one supervisor'),
  selectAllBusinessEntities: Yup.boolean(),
  status: Yup.boolean(),
});

export default function TeamForm({
  businessEntityOptions = [],
  kamOptions = [],
  supervisorOptions = [],
  onCancel,
  onSave,
  initialValues = null,
}) {
  const allBusinessEntityIds = useMemo(
    () => businessEntityOptions.map((option) => option.id),
    [businessEntityOptions]
  );
  const hasBusinessEntities = allBusinessEntityIds.length > 0;

  const formik = useFormik({
    initialValues: {
      teamName: initialValues?.teamName || '',
      businessEntity: initialValues?.businessEntity || [],
      assignKAM: initialValues?.assignKAM || [],
      supervisor: initialValues?.supervisor || [],
      status: initialValues?.status ?? true,
      selectAllBusinessEntities:
        Boolean(initialValues?.selectAllBusinessEntities) ||
        (hasBusinessEntities && (initialValues?.businessEntity?.length || 0) === allBusinessEntityIds.length),
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      const payload = {
        teamName: values.teamName.trim(),
        businessEntity: values.businessEntity,
        assignKAM: values.assignKAM,
        supervisor: values.supervisor,
        status: values.status,
      };

      onSave?.(payload);
      resetForm();
    },
  });

  const { setFieldValue, values } = formik;

  useEffect(() => {
    if (!values.selectAllBusinessEntities) return;

    if (values.businessEntity.length !== allBusinessEntityIds.length) {
      setFieldValue('businessEntity', allBusinessEntityIds, false);
    }
  }, [allBusinessEntityIds, setFieldValue, values.businessEntity.length, values.selectAllBusinessEntities]);

  const handleBusinessEntityToggle = (event) => {
    const checked = event.target.checked;
    setFieldValue('selectAllBusinessEntities', checked);

    if (checked) {
      setFieldValue('businessEntity', allBusinessEntityIds);
    }
  };

  const handleBusinessEntityChange = (ids) => {
    setFieldValue('businessEntity', ids);

    if (ids.length !== allBusinessEntityIds.length && values.selectAllBusinessEntities) {
      setFieldValue('selectAllBusinessEntities', false);
    }

    if (ids.length === allBusinessEntityIds.length && !values.selectAllBusinessEntities) {
      setFieldValue('selectAllBusinessEntities', true);
    }
  };

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
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            minHeight: 45,
          }}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'flex-start',
            minHeight: 45,
            mt: { xs: -0.25, md: 0.25 },
            mb: { xs: 1, md: 0 },
            gridColumn: { xs: '1', md: '2' },
            gridRow: { xs: '3', md: '1' },
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.5, sm: 1.25 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Typography fontSize={13} fontWeight={600} color="#475569">
              Select All Business Entity
            </Typography>
            <CustomToggle
              size="sm"
              label={formik.values.selectAllBusinessEntities ? 'Enabled' : 'Manual'}
              checked={values.selectAllBusinessEntities}
              onChange={handleBusinessEntityToggle}
            />
          </Stack>
        </Box>

        <TextInputField
          name="teamName"
          label="Team Name *"
          value={formik.values.teamName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.teamName && Boolean(formik.errors.teamName)}
          helperText={formik.touched.teamName && formik.errors.teamName ? formik.errors.teamName : ' '}
          sx={{ gridRow: { xs: '2', md: '2' } }}
        />

        <Box sx={{ gridRow: { xs: '4', md: '2' } }}>
          <SelectDropdownMultiple
            name="businessEntity"
            label="Business Entity *"
            options={businessEntityOptions}
            value={values.businessEntity}
            onChange={handleBusinessEntityChange}
            onBlur={formik.handleBlur}
            disabled={values.selectAllBusinessEntities}
            error={formik.touched.businessEntity && Boolean(formik.errors.businessEntity)}
            helperText={
              formik.touched.businessEntity && formik.errors.businessEntity
                ? formik.errors.businessEntity
                : values.selectAllBusinessEntities
                  ? 'All business entities are selected automatically.'
                  : ' '
            }
          />
        </Box>

        <SelectDropdownMultiple
          name="supervisor"
          label="Supervisor *"
          options={supervisorOptions}
          value={values.supervisor}
          onChange={(ids) => setFieldValue('supervisor', ids)}
          onBlur={formik.handleBlur}
          error={formik.touched.supervisor && Boolean(formik.errors.supervisor)}
          helperText={formik.touched.supervisor && formik.errors.supervisor ? formik.errors.supervisor : ' '}
          sx={{ gridRow: { xs: '5', md: '3' } }}
        />

        <SelectDropdownMultiple
          name="assignKAM"
          label="Assign KAM *"
          options={kamOptions}
          value={values.assignKAM}
          onChange={(ids) => setFieldValue('assignKAM', ids)}
          onBlur={formik.handleBlur}
          error={formik.touched.assignKAM && Boolean(formik.errors.assignKAM)}
          helperText={formik.touched.assignKAM && formik.errors.assignKAM ? formik.errors.assignKAM : ' '}
          sx={{ gridRow: { xs: '6', md: '3' } }}
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
            label={values.status ? 'Active' : 'Inactive'}
            checked={values.status}
            onChange={(event) => setFieldValue('status', event.target.checked)}
          />
        </Stack>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
