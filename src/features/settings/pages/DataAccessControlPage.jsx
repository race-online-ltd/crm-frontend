import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
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
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import OrbitLoader from '../../../components/shared/OrbitLoader';
import useInitialTableLoading from '../../../components/shared/useInitialTableLoading';
import {
  BUSINESS_ENTITIES,
  CRITERIA_OPTIONS,
  FEATURE_OPTIONS,
  ROLE_OPTIONS,
  getMockBusinessEntityAccessControl,
  getMockFieldLevelAccessControl,
  permissionLabel,
} from '../constants/dataAccessControl';
import { fetchRoles, fetchPageNames, fetchPageFeatures, getUserViewPermissions, updateUserViewPermissions } from '../api/settingsApi';


export default function DataAccessControlPage() {
  const isLoading = useInitialTableLoading();
  const [selectedCriteria, setSelectedCriteria] = useState(CRITERIA_OPTIONS[0].id);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('');
  const [roleOptions, setRoleOptions] = useState([]);
  const [pageOptions, setPageOptions] = useState([]);
  const [pageFeatures, setPageFeatures] = useState([]);
  const [selectedFieldIds, setSelectedFieldIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [accessControl, setAccessControl] = useState(() => (
    getMockBusinessEntityAccessControl(ROLE_OPTIONS[0].id, FEATURE_OPTIONS[0].id)
  ));

  const selectedRoleLabel = useMemo(
    () => roleOptions.find((item) => item.id === selectedRole)?.label
      || ROLE_OPTIONS.find((item) => item.id === selectedRole)?.label
      || '',
    [roleOptions, selectedRole],
  );

  const selectedFeatureLabel = useMemo(
    () => pageOptions.find((item) => item.id === selectedFeature)?.label
      || FEATURE_OPTIONS.find((item) => item.id === selectedFeature)?.label
      || '',
    [pageOptions, selectedFeature],
  );

  async function fetchCriteriaOptions() {
    return CRITERIA_OPTIONS;
  }

  const fetchRoleOptions = useCallback(async () => {
    try {
      const rawRoles = await fetchRoles();
      const normalizedRoles = Array.isArray(rawRoles)
        ? rawRoles.map((role) => ({
            ...role,
            id: role?.id ?? '',
            label: role?.label || role?.name || 'Unnamed Role',
          }))
        : [];
      setRoleOptions(normalizedRoles);
      return normalizedRoles;
    } catch {
      setRoleOptions([]);
      return [];
    }
  }, []);

  const fetchPageOptions = useCallback(async () => {
    try {
      const rawPages = await fetchPageNames();
      const normalizedPages = Array.isArray(rawPages)
        ? rawPages.map((page) => ({
            ...page,
            id: page?.id ?? '',
            label: page?.label || 'Unnamed Page',
          }))
        : [];
      setPageOptions(normalizedPages);
      return normalizedPages;
    } catch {
      setPageOptions([]);
      return [];
    }
  }, []);

 

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
    setSelectedFieldIds([]); // Reset selections when page changes
    setSelectAll(false);
    loadAccessControl(selectedCriteria, selectedRole, featureKey);
    setActiveField(null);
  }

  function handleFieldSelection(fieldId, checked) {
    setSelectedFieldIds((prev) =>
      checked
        ? [...prev, fieldId]
        : prev.filter((id) => id !== fieldId)
    );
  }

  function handleSelectAll(checked) {
    if (checked) {
      const allIds = accessControl.fields.map((field) => field.id);
      setSelectedFieldIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedFieldIds([]);
      setSelectAll(false);
    }
  }

  useEffect(() => {
    if (!selectedRole && roleOptions.length > 0) {
      const firstRoleId = roleOptions[0].id;
      setSelectedRole(firstRoleId);
      loadAccessControl(selectedCriteria, firstRoleId, selectedFeature);
    }
  }, [roleOptions, selectedRole, selectedCriteria, selectedFeature]);

  useEffect(() => {
    if (!selectedFeature && pageOptions.length > 0) {
      const firstPageId = pageOptions[0].id;
      setSelectedFeature(firstPageId);
      loadAccessControl(selectedCriteria, selectedRole, firstPageId);
    }
  }, [pageOptions, selectedFeature, selectedCriteria, selectedRole]);

  useEffect(() => {
    const loadPageFeatures = async () => {
      if (selectedFeature) {
        try {
          const features = await fetchPageFeatures(selectedFeature);
          const normalizedFeatures = Array.isArray(features)
            ? features.map((feature) => ({
                id: feature?.id,
                fieldName: feature?.feature_name || 'Unnamed Feature',
                permissions: {}, // Initialize with empty permissions
              }))
            : [];
          setPageFeatures(normalizedFeatures);
          setAccessControl((prev) => ({
            ...prev,
            fields: normalizedFeatures,
          }));
        } catch (error) {
          console.error('Failed to load page features:', error);
          setPageFeatures([]);
          setAccessControl((prev) => ({
            ...prev,
            fields: [],
          }));
        }
      } else {
        setPageFeatures([]);
        setAccessControl((prev) => ({
          ...prev,
          fields: [],
        }));
      }
    };

    loadPageFeatures();
  }, [selectedFeature]);

  useEffect(() => {
    const loadExistingPermissions = async () => {
      if (selectedRole && selectedFeature) {
        try {
          const existing = await getUserViewPermissions(selectedRole, selectedFeature);
          const selectedIds = Array.isArray(existing)
            ? existing.map((featureId) => featureId)
            : [];
          setSelectedFieldIds(selectedIds.filter(Boolean));
          setSelectAll(selectedIds.length === accessControl.fields.length && accessControl.fields.length > 0);
        } catch (error) {
          console.error('Failed to load existing permissions:', error);
          setSelectedFieldIds([]);
          setSelectAll(false);
        }
      } else {
        setSelectedFieldIds([]);
        setSelectAll(false);
      }
    };

    loadExistingPermissions();
  }, [selectedRole, selectedFeature, accessControl.fields]);

  useEffect(() => {
    setSelectAll(selectedFieldIds.length === accessControl.fields.length && accessControl.fields.length > 0);
  }, [selectedFieldIds, accessControl.fields]);

  function handleSave() {
    updateUserViewPermissions({
      role_id: selectedRole,
      navigation_id: selectedFeature,
      feature_ids: selectedFieldIds,
    })
      .then(() => {
        alert('Permissions updated successfully');
      })
      .catch((error) => {
        console.error('Failed to update permissions:', error);
        alert('Failed to update permissions');
      });
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
            Access Control
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
          name="roleId"
          label="Role *"
          fetchOptions={fetchRoleOptions}
          value={selectedRole}
          onChange={handleRoleChange}
        />

        <SelectDropdownSingle
          name="featureKey"
          label="Page Name *"
          fetchOptions={fetchPageOptions}
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
          {isLoading ? (
            <OrbitLoader title="Loading access control" minHeight={260} />
          ) : selectedCriteria === 'business_entity' ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>Fields</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, minWidth: 90 }}>
                    <Checkbox
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      indeterminate={selectedFieldIds.length > 0 && selectedFieldIds.length < accessControl.fields.length}
                    />
                    Select All
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accessControl.fields.map((field) => (
                  <TableRow key={field.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>{field.fieldName}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={selectedFieldIds.includes(field.id)}
                        onChange={(e) => handleFieldSelection(field.id, e.target.checked)}
                      />
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
                  <TableCell align="center" sx={{ fontWeight: 700, minWidth: 90 }}>
                    <Checkbox
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      indeterminate={selectedFieldIds.length > 0 && selectedFieldIds.length < accessControl.fields.length}
                    />
                    Select All
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accessControl.fields.map((field) => (
                  <TableRow key={field.id} hover>
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
                      <Checkbox
                        checked={selectedFieldIds.includes(field.id)}
                        onChange={(e) => handleFieldSelection(field.id, e.target.checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={handleSave}>
          Save Permissions
        </Button>
      </Box>
    </Box>
  );
}
