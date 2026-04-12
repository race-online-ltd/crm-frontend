import React, { useMemo } from 'react';
import { useFormik } from 'formik';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import SelectDropdownMultiple from '../../../components/shared/SelectDropdownMultiple';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import CustomToggle from '../../../components/shared/CustomToggle';

const BUSINESS_ENTITY_OPTIONS = [
  { id: 'race_online', label: 'Race Online Ltd.' },
  { id: 'earth_telecom', label: 'Earth Telecom' },
  { id: 'dhaka_colo', label: 'Dhaka COLO' },
  { id: 'orbit_internet', label: 'Orbit Internet' },
];

const KAM_OPTIONS = [
  { id: 'kam_1', label: 'KAM - Arif Rahman' },
  { id: 'kam_2', label: 'KAM - Sadia Noor' },
  { id: 'kam_3', label: 'KAM - Shahid Hasan' },
  { id: 'kam_4', label: 'KAM - Tania Akter' },
];

const TEAM_OPTIONS = [
  { id: 'team_alpha', label: 'Team Alpha' },
  { id: 'team_beta', label: 'Team Beta' },
  { id: 'team_gamma', label: 'Team Gamma' },
];

const GROUP_OPTIONS = [
  { id: 'group_north', label: 'Group North' },
  { id: 'group_south', label: 'Group South' },
  { id: 'group_enterprise', label: 'Group Enterprise' },
];

const SECTION_CONFIG = [
  {
    title: 'Business Entity',
    toggleName: 'businessEntitySelectAll',
    selectedName: 'businessEntityIds',
    defaultName: 'defaultBusinessEntityId',
    options: BUSINESS_ENTITY_OPTIONS,
  },
  {
    title: 'KAM',
    toggleName: 'kamSelectAll',
    selectedName: 'kamIds',
    defaultName: 'defaultKamId',
    options: KAM_OPTIONS,
  },
  {
    title: 'Team',
    toggleName: 'teamSelectAll',
    selectedName: 'teamIds',
    defaultName: 'defaultTeamId',
    options: TEAM_OPTIONS,
  },
  {
    title: 'Group',
    toggleName: 'groupSelectAll',
    selectedName: 'groupIds',
    defaultName: 'defaultGroupId',
    options: GROUP_OPTIONS,
  },
];

const EMPTY_MAPPING_VALUES = {
  businessEntitySelectAll: false,
  businessEntityIds: [],
  defaultBusinessEntityId: '',
  kamSelectAll: false,
  kamIds: [],
  defaultKamId: '',
  teamSelectAll: false,
  teamIds: [],
  defaultTeamId: '',
  groupSelectAll: false,
  groupIds: [],
  defaultGroupId: '',
};

function normalizeMapping(mapping) {
  const safeMapping = mapping ?? {};

  return {
    businessEntitySelectAll: Boolean(safeMapping.businessEntities?.selectAll),
    businessEntityIds: Array.isArray(safeMapping.businessEntities?.ids) ? safeMapping.businessEntities.ids : [],
    defaultBusinessEntityId: safeMapping.businessEntities?.defaultId || '',
    kamSelectAll: Boolean(safeMapping.kamUsers?.selectAll),
    kamIds: Array.isArray(safeMapping.kamUsers?.ids) ? safeMapping.kamUsers.ids : [],
    defaultKamId: safeMapping.kamUsers?.defaultId || '',
    teamSelectAll: Boolean(safeMapping.teams?.selectAll),
    teamIds: Array.isArray(safeMapping.teams?.ids) ? safeMapping.teams.ids : [],
    defaultTeamId: safeMapping.teams?.defaultId || '',
    groupSelectAll: Boolean(safeMapping.groups?.selectAll),
    groupIds: Array.isArray(safeMapping.groups?.ids) ? safeMapping.groups.ids : [],
    defaultGroupId: safeMapping.groups?.defaultId || '',
  };
}

function getSelectedOptions(selectAll, selectedIds, options) {
  return selectAll
    ? options
    : options.filter((option) => selectedIds.includes(option.id));
}

function MappingRow({
  title,
  toggleName,
  selectedName,
  defaultName,
  options,
  values,
  touched,
  errors,
  handleBlur,
  setFieldValue,
}) {
  const selectedOptions = useMemo(
    () => getSelectedOptions(values[toggleName], values[selectedName], options),
    [options, selectedName, toggleName, values],
  );

  const defaultOptionsFetcher = useMemo(
    () => async () => selectedOptions,
    [selectedOptions],
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0, 1fr) minmax(0, 1fr)',
        alignItems: 'start',
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: 80,
          mt: '10px',
        }}
      >
        <CustomToggle
          size="sm"
          label="Select All"
          checked={values[toggleName]}
          onChange={(event) => {
            const checked = event.target.checked;
            const nextSelectedIds = checked ? options.map((option) => option.id) : [];

            setFieldValue(toggleName, checked);
            setFieldValue(selectedName, nextSelectedIds);

            if (!nextSelectedIds.includes(values[defaultName])) {
              setFieldValue(defaultName, '');
            }
          }}
        />
      </Box>

      <SelectDropdownMultiple
        name={selectedName}
        label={title}
        options={options}
        value={values[selectedName]}
        onChange={(ids) => {
          setFieldValue(selectedName, ids);

          if (!ids.includes(values[defaultName])) {
            setFieldValue(defaultName, '');
          }
        }}
        onBlur={handleBlur}
        disabled={values[toggleName]}
        error={Boolean(touched[selectedName] && errors[selectedName])}
        helperText={touched[selectedName] && errors[selectedName] ? errors[selectedName] : undefined}
        limitTags={3}
        fixedHeight
      />

      <SelectDropdownSingle
        name={defaultName}
        label={`Default ${title}`}
        fetchOptions={defaultOptionsFetcher}
        value={values[defaultName]}
        onChange={(id) => setFieldValue(defaultName, id)}
        onBlur={handleBlur}
        disabled={selectedOptions.length === 0}
        error={Boolean(touched[defaultName] && errors[defaultName])}
        helperText={touched[defaultName] && errors[defaultName] ? errors[defaultName] : undefined}
      />
    </Box>
  );
}

export default function UserMappingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || null;
  const initialMapping = location.state?.mapping || null;

  const initialValues = useMemo(
    () => ({
      ...EMPTY_MAPPING_VALUES,
      ...normalizeMapping(initialMapping),
    }),
    [initialMapping],
  );

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      const payload = {
        userId: user?.id || null,
        mapping: {
          businessEntities: {
            selectAll: values.businessEntitySelectAll,
            ids: values.businessEntityIds,
            defaultId: values.defaultBusinessEntityId || null,
          },
          kamUsers: {
            selectAll: values.kamSelectAll,
            ids: values.kamIds,
            defaultId: values.defaultKamId || null,
          },
          teams: {
            selectAll: values.teamSelectAll,
            ids: values.teamIds,
            defaultId: values.defaultTeamId || null,
          },
          groups: {
            selectAll: values.groupSelectAll,
            ids: values.groupIds,
            defaultId: values.defaultGroupId || null,
          },
        },
      };

      // await saveUserMapping(payload);
      console.log('User mapping payload:', payload);
      setSubmitting(false);
      navigate('/settings/users');
    },
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box
          onClick={() => navigate(-1)}
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#475569',
            flexShrink: 0,
            '&:hover': { bgcolor: '#f1f5f9' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </Box>

        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            bgcolor: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: '#2563eb' }} />
        </Box>

        <Box>
          <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
            User Mapping
          </Typography>
        </Box>
      </Stack>

      <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ pt: 0.5 }}>
        <Stack spacing={1.5}>
          {SECTION_CONFIG.map((section) => (
            <MappingRow
              key={section.selectedName}
              title={section.title}
              toggleName={section.toggleName}
              selectedName={section.selectedName}
              defaultName={section.defaultName}
              options={section.options}
              values={formik.values}
              touched={formik.touched}
              errors={formik.errors}
              handleBlur={formik.handleBlur}
              setFieldValue={formik.setFieldValue}
            />
          ))}
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/settings/users')}
            sx={{
              minWidth: { xs: '100%', sm: 120 },
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
            variant="contained"
            disabled={formik.isSubmitting}
            sx={{
              minWidth: { xs: '100%', sm: 150 },
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              bgcolor: '#2563eb',
              boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            {formik.isSubmitting ? 'Saving...' : 'Save Mapping'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}