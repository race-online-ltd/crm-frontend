import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import AddRoleDialog from '../components/AddRoleDialog';
import EditButtonPermissionsDialog from '../components/EditButtonPermissionsDialog';
import {
  buildDefaultRolePermissions,
  ROLE_MAPPING_PAGES,
} from '../constants/roleMapping';
import { createRole, fetchRoles } from '../api/settingsApi';

export default function RoleMappingPage() {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [permissionsByRole, setPermissionsByRole] = useState({});
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');

  // Edit button permissions dialog state
  const [editDialogPage, setEditDialogPage] = useState(null); // the page row being edited

  useEffect(() => {
    let active = true;

    const loadRoles = async () => {
      try {
        setLoadError('');
        const roleData = await fetchRoles();

        if (!active) {
          return;
        }

        setRoles(roleData);
        setSelectedRoleId((current) => current || roleData[0]?.id || '');
        setPermissionsByRole((prev) => {
          const next = { ...prev };
          roleData.forEach((role) => {
            if (!next[role.id]) {
              next[role.id] = buildDefaultRolePermissions();
            }
          });
          return next;
        });
      } catch (error) {
        if (active) {
          setLoadError(error?.message || 'Unable to load roles.');
        }
      }
    };

    loadRoles();

    return () => {
      active = false;
    };
  }, []);

  const selectedRoleLabel = useMemo(
    () => roles.find((role) => role.id === selectedRoleId)?.label || '',
    [roles, selectedRoleId],
  );

  const fetchRoleOptions = useCallback(async () => roles, [roles]);

  function handleVisibilityToggle(pageId, checked) {
    setPermissionsByRole((prev) => ({
      ...prev,
      [selectedRoleId]: {
        ...(prev[selectedRoleId] || buildDefaultRolePermissions()),
        [pageId]: checked,
      },
    }));
  }

  /**
   * Called by EditButtonPermissionsDialog onSave.
   * Merges the updated button permission map back into the role's permission state.
   */
  function handleButtonPermissionsSave({ buttonPermissions }) {
    setPermissionsByRole((prev) => ({
      ...prev,
      [selectedRoleId]: {
        ...(prev[selectedRoleId] || buildDefaultRolePermissions()),
        ...buttonPermissions,
      },
    }));
  }

  async function handleAddRole(payload) {
    try {
      setSaveError('');
      const createdRole = await createRole({ name: payload.name });
      setRoles((prev) => [...prev, createdRole]);
      setPermissionsByRole((prev) => ({
        ...prev,
        [createdRole.id]: buildDefaultRolePermissions(),
      }));
      setSelectedRoleId(createdRole.id);
      setAddRoleOpen(false);
    } catch (error) {
      setSaveError(error?.message || 'Unable to create role.');
    }
  }

  function handleSaveAccess() {
    const payload = {
      roleId: selectedRoleId,
      permissions: permissionsByRole[selectedRoleId] || buildDefaultRolePermissions(),
    };

    // Backend-ready placeholder:
    // await saveRoleComponentAccess(payload);
    console.log('Role mapping payload:', payload);
  }

  const currentPermissions = permissionsByRole[selectedRoleId] || buildDefaultRolePermissions();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
      {/* Page header */}
      <Box mb={3}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
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
            <SecurityOutlinedIcon sx={{ fontSize: 22, color: '#2563eb' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
              Role Mapping
            </Typography>
            <Typography variant="body2" color="#64748b" mt={0.35}>
              Control which role can access specific sidebar tabs, settings subtabs, and buttons across the CRM.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Role selector row */}
      {loadError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {loadError}
        </Alert>
      )}

      {saveError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {saveError}
        </Alert>
      )}

      <Box
        sx={{
          mb: 2.5,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 320px) auto 1fr' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <SelectDropdownSingle
          name="roleId"
          label="Role"
          fetchOptions={fetchRoleOptions}
          value={selectedRoleId}
          onChange={(roleId) => setSelectedRoleId(roleId)}
        />

        <Button
          variant="contained"
          onClick={() => setAddRoleOpen(true)}
          sx={{
            minHeight: 45,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 13,
            px: 2.25,
            py: 0.95,
            boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
          }}
        >
          Add Role
        </Button>

        <Stack justifyContent="center" sx={{ minHeight: 45 }}>
          <Typography fontSize={13} color="#64748b">
            {selectedRoleLabel ? `${selectedRoleLabel} access matrix` : 'Select a role to manage access'}
          </Typography>
        </Stack>
      </Box>

      {/* Permissions table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid #d1d9e0',
          bgcolor: '#fff',
        }}
      >
        <TableContainer sx={{ height: { xs: 420, md: 500 }, overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, minWidth: 220, backgroundColor: '#f8fafc' }}>Page</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 160, backgroundColor: '#f8fafc' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 180, backgroundColor: '#f8fafc' }}>Section</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 280, backgroundColor: '#f8fafc' }}>Buttons</TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 700, minWidth: 92, backgroundColor: '#f8fafc' }}
                >
                  Visible
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 700, minWidth: 88, backgroundColor: '#f8fafc' }}
                >
                  Edit
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {ROLE_MAPPING_PAGES.map((page) => {
                const isVisible = Boolean(currentPermissions[page.id]);

                return (
                  <TableRow key={page.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>{page.label}</TableCell>
                    <TableCell sx={{ color: '#475569' }}>{page.type}</TableCell>
                    <TableCell sx={{ color: '#475569' }}>{page.routeGroup}</TableCell>

                    {/* Buttons column — read-only chips */}
                    <TableCell>
                      {page.buttons.length > 0 ? (
                        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                          {page.buttons.map((button) => {
                            const isEnabled = Boolean(currentPermissions[button.id]);
                            return (
                              <Chip
                                key={button.id}
                                label={button.label}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: 11.5,
                                  borderRadius: '6px',
                                  height: 24,
                                  bgcolor: isEnabled ? '#eff6ff' : '#f8fafc',
                                  color: isEnabled ? '#2563eb' : '#94a3b8',
                                  border: '1px solid',
                                  borderColor: isEnabled ? '#bfdbfe' : '#e2e8f0',
                                  cursor: 'default',
                                  // disable MUI's default clickable styles since these are display-only
                                  '& .MuiChip-label': { px: 1 },
                                }}
                              />
                            );
                          })}
                        </Stack>
                      ) : (
                        <Typography fontSize={13} color="#cbd5e1">
                          No buttons
                        </Typography>
                      )}
                    </TableCell>

                    {/* Visible column — checkbox + edit icon */}
                    <TableCell align="center" sx={{ verticalAlign: 'middle' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 28 }}>
                        <Checkbox
                          checked={isVisible}
                          onChange={(e) => handleVisibilityToggle(page.id, e.target.checked)}
                          size="small"
                          sx={{
                            color: '#cbd5e1',
                            '&.Mui-checked': { color: '#2563eb' },
                          }}
                        />
                      </Box>
                    </TableCell>

                    <TableCell align="center" sx={{ verticalAlign: 'middle' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 28 }}>
                        {page.buttons.length > 0 ? (
                          <Tooltip title="Edit button permissions" placement="top" arrow>
                            <IconButton
                              size="small"
                              onClick={() => setEditDialogPage(page)}
                              sx={{
                                color: '#94a3b8',
                                width: 28,
                                height: 28,
                                borderRadius: '7px',
                                '&:hover': { bgcolor: '#eff6ff', color: '#2563eb' },
                              }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Box sx={{ width: 28, height: 28 }} />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="flex-end"
          spacing={2}
          sx={{ px: 2.5, py: 2 }}
        >
          <Button
            variant="contained"
            onClick={handleSaveAccess}
            sx={{
              minWidth: { xs: '100%', sm: 140 },
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              bgcolor: '#2563eb',
              boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            Save Access
          </Button>
        </Stack>
      </Paper>

      {/* Add role dialog */}
      <AddRoleDialog
        open={addRoleOpen}
        onClose={() => setAddRoleOpen(false)}
        onSave={handleAddRole}
      />

      {/* Edit button permissions dialog */}
      <EditButtonPermissionsDialog
        open={Boolean(editDialogPage)}
        onClose={() => setEditDialogPage(null)}
        page={editDialogPage}
        permissions={currentPermissions}
        onSave={handleButtonPermissionsSave}
      />
    </Box>
  );
}
