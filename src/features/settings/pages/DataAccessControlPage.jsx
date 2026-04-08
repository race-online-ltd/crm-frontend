import React, { useMemo, useState } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import DataAccessPermissionDialog from '../components/DataAccessPermissionDialog';
import {
  BUSINESS_ENTITIES,
  CRITERIA_OPTIONS,
  FEATURE_OPTIONS,
  ROLE_OPTIONS,
  getMockBusinessEntityAccessControl,
  getMockFieldLevelAccessControl,
  permissionLabel,
} from '../constants/dataAccessControl';

export default function DataAccessControlPage() {
  const [selectedCriteria, setSelectedCriteria] = useState(CRITERIA_OPTIONS[0].id);
  const [selectedRole, setSelectedRole] = useState(ROLE_OPTIONS[0].id);
  const [selectedFeature, setSelectedFeature] = useState(FEATURE_OPTIONS[0].id);
  const [accessControl, setAccessControl] = useState(() => (
    getMockBusinessEntityAccessControl(ROLE_OPTIONS[0].id, FEATURE_OPTIONS[0].id)
  ));
  const [activeField, setActiveField] = useState(null);

  const selectedRoleLabel = useMemo(
    () => ROLE_OPTIONS.find((item) => item.id === selectedRole)?.label || '',
    [selectedRole],
  );

  const selectedFeatureLabel = useMemo(
    () => FEATURE_OPTIONS.find((item) => item.id === selectedFeature)?.label || '',
    [selectedFeature],
  );

  async function fetchCriteriaOptions() {
    return CRITERIA_OPTIONS;
  }

  async function fetchRoleOptions() {
    return ROLE_OPTIONS;
  }

  async function fetchFeatureOptions() {
    return FEATURE_OPTIONS;
  }

  function loadAccessControl(criteriaId, roleId, featureKey) {
    if (criteriaId === 'field_level') {
      setAccessControl(structuredClone(getMockFieldLevelAccessControl(roleId, featureKey)));
      return;
    }

    setAccessControl(structuredClone(getMockBusinessEntityAccessControl(roleId, featureKey)));
  }

  function handleCriteriaChange(criteriaId) {
    setSelectedCriteria(criteriaId);
    loadAccessControl(criteriaId, selectedRole, selectedFeature);
    setActiveField(null);
  }

  function handleRoleChange(roleId) {
    setSelectedRole(roleId);
    loadAccessControl(selectedCriteria, roleId, selectedFeature);
    setActiveField(null);
  }

  function handleFeatureChange(featureKey) {
    setSelectedFeature(featureKey);
    loadAccessControl(selectedCriteria, selectedRole, featureKey);
    setActiveField(null);
  }

  function handleSavePermissions(fieldName, permissions) {
    setAccessControl((prev) => ({
      ...prev,
      fields: prev.fields.map((field) => (
        field.fieldName === fieldName
          ? { ...field, permissions }
          : field
      )),
    }));

    // Ready for backend integration later:
    // await axios.post('/settings/data-access-control', { criteria: selectedCriteria, ...updatedPayload });
    setActiveField(null);
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
      <Box mb={3}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={0.75}>
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
            }}
          >
            <AdminPanelSettingsIcon sx={{ fontSize: 22, color: '#2563eb' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
            Data Access Control
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          mb: 3,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: '0px 20px',
        }}
      >
        <SelectDropdownSingle
          name="criteria"
          label="Criteria *"
          fetchOptions={fetchCriteriaOptions}
          value={selectedCriteria}
          onChange={handleCriteriaChange}
        />

        <SelectDropdownSingle
          name="roleId"
          label="Role *"
          fetchOptions={fetchRoleOptions}
          value={selectedRole}
          onChange={handleRoleChange}
        />

        <SelectDropdownSingle
          name="featureKey"
          label="Feature *"
          fetchOptions={fetchFeatureOptions}
          value={selectedFeature}
          onChange={handleFeatureChange}
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid #d1d9e0',
          bgcolor: '#fff',
        }}
      >
        <TableContainer>
          {selectedCriteria === 'business_entity' ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>Fields</TableCell>
                  {BUSINESS_ENTITIES.map((entity) => (
                    <TableCell key={entity.id} sx={{ fontWeight: 700, minWidth: 140 }}>
                      {entity.label}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 700, minWidth: 90 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accessControl.fields.map((field) => (
                  <TableRow key={field.fieldName} hover>
                    <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>{field.fieldName}</TableCell>
                    {BUSINESS_ENTITIES.map((entity) => (
                      <TableCell key={entity.id} sx={{ color: '#475569' }}>
                        {permissionLabel(field.permissions?.[entity.label]) || '—'}
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => setActiveField(field)}>
                        <EditOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>Fields</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, minWidth: 100 }}>Read</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, minWidth: 100 }}>Write</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, minWidth: 100 }}>Modify</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, minWidth: 90 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accessControl.fields.map((field) => (
                  <TableRow key={field.fieldName} hover>
                    <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>{field.fieldName}</TableCell>
                    <TableCell align="center" sx={{ color: '#475569' }}>
                      {field.permissions?.read ? 'Yes' : '—'}
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#475569' }}>
                      {field.permissions?.write ? 'Yes' : '—'}
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#475569' }}>
                      {field.permissions?.modify ? 'Yes' : '—'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => setActiveField(field)}>
                        <EditOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>

      <DataAccessPermissionDialog
        open={Boolean(activeField)}
        criteria={selectedCriteria}
        fieldConfig={activeField}
        roleLabel={selectedRoleLabel}
        featureLabel={selectedFeatureLabel}
        onClose={() => setActiveField(null)}
        onSave={handleSavePermissions}
      />
    </Box>
  );
}
