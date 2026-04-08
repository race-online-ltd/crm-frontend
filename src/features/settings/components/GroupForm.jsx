import React, { useEffect, useMemo } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import TextInputField from '../../../components/shared/TextInputField';
import SelectDropdownMultiple from '../../../components/shared/SelectDropdownMultiple';
import CustomToggle from '../../../components/shared/CustomToggle';

const validationSchema = Yup.object({
  groupName: Yup.string().trim().required('Group Name is required'),
  supervisor: Yup.array().min(1, 'Select at least one supervisor'),
  teamName: Yup.array().min(1, 'Select at least one team'),
  selectAllSupervisors: Yup.boolean(),
  selectAllTeams: Yup.boolean(),
  status: Yup.boolean(),
});

export default function GroupForm({
  supervisorOptions = [],
  teamOptions = [],
  onCancel,
  onSave,
  initialValues = null,
}) {
  const allSupervisorIds = useMemo(
    () => supervisorOptions.map((option) => option.id),
    [supervisorOptions]
  );
  const allTeamIds = useMemo(
    () => teamOptions.map((option) => option.id),
    [teamOptions]
  );

  const hasSupervisors = allSupervisorIds.length > 0;
  const hasTeams = allTeamIds.length > 0;

  const formik = useFormik({
    initialValues: {
      groupName: initialValues?.groupName || '',
      supervisor: initialValues?.supervisor || [],
      teamName: initialValues?.teamName || [],
      status: initialValues?.status ?? true,
      selectAllSupervisors:
        Boolean(initialValues?.selectAllSupervisors) ||
        (hasSupervisors && (initialValues?.supervisor?.length || 0) === allSupervisorIds.length),
      selectAllTeams:
        Boolean(initialValues?.selectAllTeams) ||
        (hasTeams && (initialValues?.teamName?.length || 0) === allTeamIds.length),
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      onSave?.({
        groupName: values.groupName.trim(),
        supervisor: values.supervisor,
        teamName: values.teamName,
        status: values.status,
      });
      resetForm();
    },
  });

  const { setFieldValue, values } = formik;

  useEffect(() => {
    if (!values.selectAllSupervisors) return;

    if (values.supervisor.length !== allSupervisorIds.length) {
      setFieldValue('supervisor', allSupervisorIds, false);
    }
  }, [allSupervisorIds, setFieldValue, values.selectAllSupervisors, values.supervisor.length]);

  useEffect(() => {
    if (!values.selectAllTeams) return;

    if (values.teamName.length !== allTeamIds.length) {
      setFieldValue('teamName', allTeamIds, false);
    }
  }, [allTeamIds, setFieldValue, values.selectAllTeams, values.teamName.length]);

  const handleSupervisorToggle = (event) => {
    const checked = event.target.checked;
    setFieldValue('selectAllSupervisors', checked);

    if (checked) {
      setFieldValue('supervisor', allSupervisorIds);
    }
  };

  const handleTeamToggle = (event) => {
    const checked = event.target.checked;
    setFieldValue('selectAllTeams', checked);

    if (checked) {
      setFieldValue('teamName', allTeamIds);
    }
  };

  const handleSupervisorChange = (ids) => {
    setFieldValue('supervisor', ids);

    if (ids.length !== allSupervisorIds.length && values.selectAllSupervisors) {
      setFieldValue('selectAllSupervisors', false);
    }

    if (ids.length === allSupervisorIds.length && !values.selectAllSupervisors) {
      setFieldValue('selectAllSupervisors', true);
    }
  };

  const handleTeamChange = (ids) => {
    setFieldValue('teamName', ids);

    if (ids.length !== allTeamIds.length && values.selectAllTeams) {
      setFieldValue('selectAllTeams', false);
    }

    if (ids.length === allTeamIds.length && !values.selectAllTeams) {
      setFieldValue('selectAllTeams', true);
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
            mt: { xs: 0, md: 0.25 },
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
              Select All Supervisor
            </Typography>
            <CustomToggle
              size="sm"
              label={values.selectAllSupervisors ? 'Enabled' : 'Manual'}
              checked={values.selectAllSupervisors}
              onChange={handleSupervisorToggle}
            />
          </Stack>
        </Box>

        <TextInputField
          name="groupName"
          label="Group Name *"
          value={formik.values.groupName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.groupName && Boolean(formik.errors.groupName)}
          helperText={formik.touched.groupName && formik.errors.groupName ? formik.errors.groupName : ' '}
          sx={{ gridRow: { xs: '2', md: '2' } }}
        />

        <Box sx={{ gridRow: { xs: '4', md: '2' } }}>
          <SelectDropdownMultiple
            name="supervisor"
            label="Supervisor *"
            options={supervisorOptions}
            value={values.supervisor}
            onChange={handleSupervisorChange}
            onBlur={formik.handleBlur}
            disabled={values.selectAllSupervisors}
            error={formik.touched.supervisor && Boolean(formik.errors.supervisor)}
            helperText={
              formik.touched.supervisor && formik.errors.supervisor
                ? formik.errors.supervisor
                : values.selectAllSupervisors
                  ? 'All supervisors are selected automatically.'
                  : ' '
            }
          />
        </Box>

        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            minHeight: 24,
            mt: -0.5,
            mb: 0.25,
            gridRow: '5',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.5, sm: 1.25 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Typography fontSize={13} fontWeight={600} color="#475569">
              Select All Team
            </Typography>
            <CustomToggle
              size="sm"
              label={values.selectAllTeams ? 'Enabled' : 'Manual'}
              checked={values.selectAllTeams}
              onChange={handleTeamToggle}
            />
          </Stack>
        </Box>

        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            minHeight: 24,
            mt: 0,
            mb: -0.25,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.5, sm: 1.25 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Typography fontSize={13} fontWeight={600} color="#475569">
              Select All Team
            </Typography>
            <CustomToggle
              size="sm"
              label={values.selectAllTeams ? 'Enabled' : 'Manual'}
              checked={values.selectAllTeams}
              onChange={handleTeamToggle}
            />
          </Stack>
        </Box>

        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            minHeight: 24,
            mt: 0,
            mb: -0.25,
          }}
        />

        <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
          <SelectDropdownMultiple
            name="teamName"
            label="Team Name *"
            options={teamOptions}
            value={values.teamName}
            onChange={handleTeamChange}
            onBlur={formik.handleBlur}
            disabled={values.selectAllTeams}
            error={formik.touched.teamName && Boolean(formik.errors.teamName)}
            helperText={
              formik.touched.teamName && formik.errors.teamName
                ? formik.errors.teamName
                : values.selectAllTeams
                  ? 'All teams are selected automatically.'
                  : ' '
            }
          />
        </Box>
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
