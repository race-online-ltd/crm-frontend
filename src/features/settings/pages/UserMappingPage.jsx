import React, { useMemo, useCallback } from 'react';
import { useFormik } from 'formik';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Stack,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SelectDropdownMultiple from '../../../components/shared/SelectDropdownMultiple';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import CustomToggle from '../../../components/shared/CustomToggle';

// ---------------------------------------------------------------------------
// Static option lists
// ---------------------------------------------------------------------------

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

const DIVISION_OPTIONS = [
  { id: 'div_commercial', label: 'Commercial Division' },
  { id: 'div_enterprise', label: 'Enterprise Division' },
  { id: 'div_retail', label: 'Retail Division' },
  { id: 'div_wholesale', label: 'Wholesale Division' },
];

// ---------------------------------------------------------------------------
// Section config for Team / Group / Division
// ---------------------------------------------------------------------------

const SECTION_CONFIG = [
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
  {
    title: 'Division',
    toggleName: 'divisionSelectAll',
    selectedName: 'divisionIds',
    defaultName: 'defaultDivisionId',
    options: DIVISION_OPTIONS,
  },
];

// ---------------------------------------------------------------------------
// Initial / empty values
// ---------------------------------------------------------------------------

const EMPTY_ENTITY_KAM_ROW = () => ({
  id: crypto.randomUUID(),
  entityId: '',
  kamIds: [],
});

const EMPTY_MAPPING_VALUES = {
  entityKamBindings: [EMPTY_ENTITY_KAM_ROW()],
  defaultEntityId: '',
  teamSelectAll: false,
  teamIds: [],
  defaultTeamId: '',
  groupSelectAll: false,
  groupIds: [],
  defaultGroupId: '',
  divisionSelectAll: false,
  divisionIds: [],
  defaultDivisionId: '',
};

// ---------------------------------------------------------------------------
// Normalize incoming mapping data
// ---------------------------------------------------------------------------

function normalizeMapping(mapping) {
  const safeMapping = mapping ?? {};

  const rawBindings = safeMapping.entityKamBindings;
  const entityKamBindings =
    Array.isArray(rawBindings) && rawBindings.length > 0
      ? rawBindings.map((b) => ({
          id: b.id || crypto.randomUUID(),
          entityId: b.entityId || '',
          kamIds: Array.isArray(b.kamIds) ? b.kamIds : [],
        }))
      : [EMPTY_ENTITY_KAM_ROW()];

  return {
    entityKamBindings,
    defaultEntityId: safeMapping.defaultEntityId || '',
    teamSelectAll: Boolean(safeMapping.teams?.selectAll),
    teamIds: Array.isArray(safeMapping.teams?.ids) ? safeMapping.teams.ids : [],
    defaultTeamId: safeMapping.teams?.defaultId || '',
    groupSelectAll: Boolean(safeMapping.groups?.selectAll),
    groupIds: Array.isArray(safeMapping.groups?.ids) ? safeMapping.groups.ids : [],
    defaultGroupId: safeMapping.groups?.defaultId || '',
    divisionSelectAll: Boolean(safeMapping.divisions?.selectAll),
    divisionIds: Array.isArray(safeMapping.divisions?.ids) ? safeMapping.divisions.ids : [],
    defaultDivisionId: safeMapping.divisions?.defaultId || '',
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSelectedOptions(selectAll, selectedIds, options) {
  return selectAll
    ? options
    : options.filter((option) => selectedIds.includes(option.id));
}

// ---------------------------------------------------------------------------
// Section label component
// ---------------------------------------------------------------------------

function SectionLabel({ icon, title, subtitle }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: '9px',
          bgcolor: '#f0f9ff',
          border: '1px solid #bae6fd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={700} color="#0f172a" lineHeight={1.2}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="#64748b">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// EntityKamBindingRow — one row in the binding section
// ---------------------------------------------------------------------------

function EntityKamBindingRow({
  row,
  rowIndex,
  totalRows,
  usedEntityIds,   // entity ids already selected in OTHER rows (for disabling)
  onEntityChange,
  onKamChange,
  onRemove,
}) {
  // Disable entities already chosen in other rows
  const entityOptions = useMemo(
    () =>
      BUSINESS_ENTITY_OPTIONS.map((opt) => ({
        ...opt,
        disabled: usedEntityIds.includes(opt.id),
      })),
    [usedEntityIds],
  );

  const entityFetcher = useMemo(() => async () => entityOptions, [entityOptions]);
  const isKamSelectAll = row.kamIds.length === KAM_OPTIONS.length;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr) 36px',
        alignItems: 'start',
        gap: 1.5,
      }}
    >
      {/* Business Entity — single select */}
      <SelectDropdownSingle
        name={`entityKamBindings[${rowIndex}].entityId`}
        label="Business Entity"
        fetchOptions={entityFetcher}
        value={row.entityId}
        onChange={(id) => onEntityChange(rowIndex, id)}
      />

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
          checked={isKamSelectAll}
          onChange={(event) => {
            onKamChange(
              rowIndex,
              event.target.checked ? KAM_OPTIONS.map((option) => option.id) : [],
            );
          }}
        />
      </Box>

      {/* KAM — multi select */}
      <SelectDropdownMultiple
        name={`entityKamBindings[${rowIndex}].kamIds`}
        label="KAM (System Users)"
        options={KAM_OPTIONS}
        value={row.kamIds}
        onChange={(ids) => onKamChange(rowIndex, ids)}
        disabled={isKamSelectAll}
        limitTags={3}
        fixedHeight
      />

      {/* Remove row button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mt: '10px' }}>
        <IconButton
          onClick={() => onRemove(rowIndex)}
          disabled={totalRows === 1}
          size="small"
          sx={{
            color: totalRows === 1 ? '#cbd5e1' : '#ef4444',
            '&:hover': { bgcolor: '#fef2f2' },
          }}
        >
          <RemoveCircleOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// MappingRow — reused for Team / Group / Division
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

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
          entityKamBindings: values.entityKamBindings.map((b) => ({
            entityId: b.entityId || null,
            kamIds: b.kamIds,
          })),
          defaultEntityId: values.defaultEntityId || null,
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
          divisions: {
            selectAll: values.divisionSelectAll,
            ids: values.divisionIds,
            defaultId: values.defaultDivisionId || null,
          },
        },
      };

      console.log('User mapping payload:', payload);
      setSubmitting(false);
      navigate('/settings/users');
    },
  });

  // ---- Entity-KAM binding handlers ----

  const handleAddRow = useCallback(() => {
    formik.setFieldValue('entityKamBindings', [
      ...formik.values.entityKamBindings,
      EMPTY_ENTITY_KAM_ROW(),
    ]);
  }, [formik]);

  const handleRemoveRow = useCallback(
    (index) => {
      const updated = formik.values.entityKamBindings.filter((_, i) => i !== index);
      const removedEntityId = formik.values.entityKamBindings[index].entityId;

      formik.setFieldValue('entityKamBindings', updated);

      // If the removed row held the default entity, clear defaultEntityId
      if (removedEntityId && formik.values.defaultEntityId === removedEntityId) {
        formik.setFieldValue('defaultEntityId', '');
      }
    },
    [formik],
  );

  const handleEntityChange = useCallback(
    (index, entityId) => {
      const updated = formik.values.entityKamBindings.map((row, i) =>
        i === index ? { ...row, entityId } : row,
      );
      formik.setFieldValue('entityKamBindings', updated);

      // If the old entity for this row was the default, clear it
      const oldEntityId = formik.values.entityKamBindings[index].entityId;
      if (oldEntityId && formik.values.defaultEntityId === oldEntityId) {
        formik.setFieldValue('defaultEntityId', '');
      }
    },
    [formik],
  );

  const handleKamChange = useCallback(
    (index, kamIds) => {
      const updated = formik.values.entityKamBindings.map((row, i) =>
        i === index ? { ...row, kamIds } : row,
      );
      formik.setFieldValue('entityKamBindings', updated);
    },
    [formik],
  );

  // Collect entity ids already selected across all rows (to prevent duplicate entity selection)
  const selectedEntityIds = formik.values.entityKamBindings
    .map((b) => b.entityId)
    .filter(Boolean);

  // Default entity options — only entities that have been chosen in binding rows
  const defaultEntityOptions = useMemo(
    () => BUSINESS_ENTITY_OPTIONS.filter((opt) => selectedEntityIds.includes(opt.id)),
    [selectedEntityIds],
  );

  const defaultEntityFetcher = useMemo(
    () => async () => defaultEntityOptions,
    [defaultEntityOptions],
  );

  // ---- Card wrapper style ----
  const cardSx = {
    bgcolor: '#fff',
    border: '1px solid #d1d9e0',
    borderRadius: '16px',
    p: { xs: 2, sm: 2.5 },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#ffffff',
        px: { xs: 2, sm: 3, md: 3 },
        py: { xs: 3, sm: 3 },
      }}
    >
      {/* ---- Header ---- */}
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
          {user && (
            <Typography variant="caption" color="#64748b">
              Mapping for: <strong>{user.name || user.id}</strong>
            </Typography>
          )}
        </Box>
      </Stack>

      {/* ---- Form ---- */}
      <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ pt: 0.5 }}>
        <Stack spacing={2.5}>

          {/* ================================================================
              SECTION 1 — Business Entity ↔ KAM Bindings
          ================================================================ */}
          <Box sx={cardSx}>
            <SectionLabel
              icon={<BusinessIcon sx={{ fontSize: 18, color: '#0284c7' }} />}
              title="Business Entity & KAM Binding"
              subtitle="Bind KAMs to specific business entities for visibility control"
            />

            <Stack spacing={1.5}>
              {formik.values.entityKamBindings.map((row, index) => {
                // "used" ids = all selected entity ids except THIS row's own selection
                const usedByOthers = selectedEntityIds.filter((id) => id !== row.entityId);

                return (
                  <EntityKamBindingRow
                    key={row.id}
                    row={row}
                    rowIndex={index}
                    totalRows={formik.values.entityKamBindings.length}
                    usedEntityIds={usedByOthers}
                    onEntityChange={handleEntityChange}
                    onKamChange={handleKamChange}
                    onRemove={handleRemoveRow}
                  />
                );
              })}
            </Stack>

            {/* Add row button */}
            <Box sx={{ mt: 1.5 }}>
              <Button
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddRow}
                size="small"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#2563eb',
                  borderRadius: '8px',
                  px: 1.5,
                  py: 0.5,
                  '&:hover': { bgcolor: '#eff6ff' },
                }}
              >
                Add Entity Binding
              </Button>
            </Box>

            {/* Default Entity */}
            <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto minmax(0, 1fr) 36px' },
                gap: 1.5,
                alignItems: 'end',
              }}
            >
              <SelectDropdownSingle
                name="defaultEntityId"
                label="Default Business Entity"
                fetchOptions={defaultEntityFetcher}
                value={formik.values.defaultEntityId}
                onChange={(id) => formik.setFieldValue('defaultEntityId', id)}
                onBlur={formik.handleBlur}
                disabled={defaultEntityOptions.length === 0}
                helperText={
                  defaultEntityOptions.length === 0
                    ? 'Select at least one entity above'
                    : undefined
                }
              />
              <Box />
              <Box />
              <Box />
            </Box>
          </Box>

          {/* ================================================================
              SECTION 2 — Team / Group / Division
          ================================================================ */}
          <Box sx={cardSx}>
            <SectionLabel
              icon={<PeopleAltOutlinedIcon sx={{ fontSize: 18, color: '#0284c7' }} />}
              title="Team, Group & Division"
              subtitle="Select all applicable teams, groups, and divisions with defaults"
            />

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
          </Box>

        </Stack>

        {/* ---- Actions ---- */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="flex-end"
          sx={{ mt: 3 }}
        >
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
