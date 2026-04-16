import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import AddRoleDialog from '../components/AddRoleDialog';
import {
  createRole,
  fetchRolePermissions,
  fetchRoles,
} from '../api/settingsApi';

function normalizeRoleOption(role) {
  return {
    ...role,
    id: role?.id ?? '',
    label: role?.label || role?.name || 'Unnamed Role',
  };
}

function normalizeAction(action) {
  return {
    key: action?.key || '',
    label: action?.label || action?.key || 'Unnamed Action',
    checked: Boolean(action?.checked),
  };
}

function normalizeItem(item) {
  return {
    key: item?.key || '',
    label: item?.label || item?.key || 'Unnamed Item',
    actions: Array.isArray(item?.actions) ? item.actions.map(normalizeAction) : [],
  };
}

function normalizePermissionResponse(payload) {
  return {
    groups: Array.isArray(payload?.groups)
      ? payload.groups.map((group) => ({
          key: group?.key || '',
          label: group?.label || group?.key || 'Unnamed Group',
          items: Array.isArray(group?.items) ? group.items.map(normalizeItem) : [],
        }))
      : [],
    standalone: Array.isArray(payload?.standalone) ? payload.standalone.map(normalizeItem) : [],
  };
}

function countCheckedActions(items) {
  return items.reduce(
    (total, item) => total + item.actions.filter((action) => action.checked).length,
    0,
  );
}

function countAllActions(items) {
  return items.reduce((total, item) => total + item.actions.length, 0);
}

function getGroupMeta(group) {
  const totalActions = countAllActions(group.items);
  const checkedActions = countCheckedActions(group.items);

  return {
    totalActions,
    checkedActions,
    checked: totalActions > 0 && checkedActions === totalActions,
    indeterminate: checkedActions > 0 && checkedActions < totalActions,
  };
}

function updateActionList(actions, nextChecked) {
  return actions.map((action) => ({ ...action, checked: nextChecked }));
}

function PermissionItemCard({ item, onActionToggle, sectionLabel }) {
  const checkedCount = item.actions.filter((action) => action.checked).length;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        bgcolor: '#fff',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ px: 2, py: 1.6 }}
      >
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
            <Typography fontWeight={700} color="#0f172a" fontSize={14.5}>
              {item.label}
            </Typography>
            <Chip
              label={sectionLabel}
              size="small"
              sx={{
                height: 24,
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: '999px',
                bgcolor: '#eff6ff',
                color: '#1d4ed8',
              }}
            />
          </Stack>

          <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
            <Chip
              label={`Key: ${item.key || 'N/A'}`}
              size="small"
              variant="outlined"
              sx={{ borderRadius: '8px', fontSize: 11.5, color: '#475569' }}
            />
            <Chip
              label={`Actions: ${checkedCount}/${item.actions.length}`}
              size="small"
              variant="outlined"
              sx={{ borderRadius: '8px', fontSize: 11.5, color: '#475569' }}
            />
          </Stack>
        </Stack>

        <Typography fontSize={12.5} color="#64748b">
          Backend checked state অনুযায়ী initial selection load হয়েছে
        </Typography>
      </Stack>

      <Divider />

      <Box sx={{ px: 2, py: 1.75 }}>
        {item.actions.length > 0 ? (
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {item.actions.map((action) => (
              <Box
                key={`${item.key}-${action.key}`}
                sx={{
                  border: '1px solid',
                  borderColor: action.checked ? '#bfdbfe' : '#e2e8f0',
                  bgcolor: action.checked ? '#eff6ff' : '#f8fafc',
                  borderRadius: '12px',
                  px: 1.1,
                  py: 0.8,
                }}
              >
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Checkbox
                    checked={action.checked}
                    onChange={(event) => onActionToggle(action.key, event.target.checked)}
                    size="small"
                    sx={{
                      p: 0.25,
                      color: '#cbd5e1',
                      '&.Mui-checked': { color: '#2563eb' },
                    }}
                  />
                  <Stack spacing={0.15}>
                    <Typography fontSize={13} fontWeight={700} color={action.checked ? '#1d4ed8' : '#334155'}>
                      {action.label}
                    </Typography>
                    <Typography fontSize={11.5} color="#94a3b8">
                      {action.key}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography fontSize={13} color="#94a3b8">
            No actions found for this item.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function GroupSection({ group, onToggleAll, onToggleAction }) {
  const groupMeta = getGroupMeta(group);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: '1px solid #dbe4ee',
        overflow: 'hidden',
        bgcolor: '#fff',
      }}
    >
      <Box sx={{ px: 2.25, py: 1.8, bgcolor: '#f8fafc' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={1.5}
        >
          <Stack spacing={0.9}>
            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
              <Checkbox
                checked={groupMeta.checked}
                indeterminate={groupMeta.indeterminate}
                disabled={groupMeta.totalActions === 0}
                onChange={(event) => onToggleAll(event.target.checked)}
                size="small"
                sx={{
                  p: 0.3,
                  color: '#cbd5e1',
                  '&.Mui-checked': { color: '#2563eb' },
                  '&.MuiCheckbox-indeterminate': { color: '#2563eb' },
                }}
              />
              <Typography fontWeight={800} fontSize={15.5} color="#0f172a">
                {group.label}
              </Typography>
              <Chip
                label="Grouped Navigation"
                size="small"
                sx={{
                  height: 24,
                  fontSize: 11.5,
                  fontWeight: 700,
                  borderRadius: '999px',
                  bgcolor: '#dbeafe',
                  color: '#1d4ed8',
                }}
              />
            </Stack>

            <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
              <Chip
                label={`Group Key: ${group.key || 'N/A'}`}
                size="small"
                variant="outlined"
                sx={{ borderRadius: '8px', fontSize: 11.5, color: '#475569', bgcolor: '#fff' }}
              />
              <Chip
                label={`Items: ${group.items.length}`}
                size="small"
                variant="outlined"
                sx={{ borderRadius: '8px', fontSize: 11.5, color: '#475569', bgcolor: '#fff' }}
              />
              <Chip
                label={`Actions: ${groupMeta.checkedActions}/${groupMeta.totalActions}`}
                size="small"
                variant="outlined"
                sx={{ borderRadius: '8px', fontSize: 11.5, color: '#475569', bgcolor: '#fff' }}
              />
            </Stack>
          </Stack>

          <Typography fontSize={12.5} color="#64748b">
            Group checkbox use করলে এই group-এর সব action একসাথে toggle হবে
          </Typography>
        </Stack>
      </Box>

      <Divider />

      <Stack spacing={1.5} sx={{ p: 2 }}>
        {group.items.map((item) => (
          <PermissionItemCard
            key={item.key}
            item={item}
            sectionLabel={group.label}
            onActionToggle={(actionKey, checked) => onToggleAction(item.key, actionKey, checked)}
          />
        ))}
      </Stack>
    </Paper>
  );
}

export default function RoleMappingPage() {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [permissionData, setPermissionData] = useState({ groups: [], standalone: [] });
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [rolesLoading, setRolesLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadRoles = async () => {
      try {
        setRolesLoading(true);
        setLoadError('');
        const roleData = await fetchRoles();

        if (!active) {
          return;
        }

        const normalizedRoles = roleData.map(normalizeRoleOption);
        setRoles(normalizedRoles);
        setSelectedRoleId((prev) => prev || normalizedRoles[0]?.id || '');
      } catch (error) {
        if (active) {
          setLoadError(error?.message || 'Unable to load roles.');
        }
      } finally {
        if (active) {
          setRolesLoading(false);
        }
      }
    };

    loadRoles();

    return () => {
      active = false;
    };
  }, []);

  const loadRolePermissions = useCallback(async (roleId) => {
    if (!roleId) {
      setPermissionData({ groups: [], standalone: [] });
      return;
    }

    try {
      setPageLoading(true);
      setLoadError('');
      setSaveError('');

      const response = await fetchRolePermissions(roleId);
      setPermissionData(normalizePermissionResponse(response));
    } catch (error) {
      setLoadError(error?.message || 'Unable to load role permissions.');
      setPermissionData({ groups: [], standalone: [] });
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRolePermissions(selectedRoleId);
  }, [loadRolePermissions, selectedRoleId]);

  const selectedRoleLabel = useMemo(
    () => roles.find((role) => role.id === selectedRoleId)?.label || '',
    [roles, selectedRoleId],
  );

  const summary = useMemo(() => {
    const groupedItems = permissionData.groups.flatMap((group) => group.items);
    const allItems = [...groupedItems, ...permissionData.standalone];
    const totalActions = countAllActions(allItems);
    const checkedActions = countCheckedActions(allItems);

    return {
      groups: permissionData.groups.length,
      standalone: permissionData.standalone.length,
      totalActions,
      checkedActions,
    };
  }, [permissionData]);

  const fetchRoleOptions = useCallback(async () => roles, [roles]);

  function updateGroupActions(groupKey, nextChecked) {
    setPermissionData((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => (
        group.key === groupKey
          ? {
              ...group,
              items: group.items.map((item) => ({
                ...item,
                actions: updateActionList(item.actions, nextChecked),
              })),
            }
          : group
      )),
    }));
  }

  function updateGroupedAction(groupKey, itemKey, actionKey, nextChecked) {
    setPermissionData((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => (
        group.key === groupKey
          ? {
              ...group,
              items: group.items.map((item) => (
                item.key === itemKey
                  ? {
                      ...item,
                      actions: item.actions.map((action) => (
                        action.key === actionKey ? { ...action, checked: nextChecked } : action
                      )),
                    }
                  : item
              )),
            }
          : group
      )),
    }));
  }

  function updateStandaloneAction(itemKey, actionKey, nextChecked) {
    setPermissionData((prev) => ({
      ...prev,
      standalone: prev.standalone.map((item) => (
        item.key === itemKey
          ? {
              ...item,
              actions: item.actions.map((action) => (
                action.key === actionKey ? { ...action, checked: nextChecked } : action
              )),
            }
          : item
      )),
    }));
  }

  async function handleAddRole(payload) {
    try {
      setSaveError('');
      const createdRole = normalizeRoleOption(await createRole({ name: payload.name }));
      setRoles((prev) => [...prev, createdRole]);
      setSelectedRoleId(createdRole.id);
      setAddRoleOpen(false);
    } catch (error) {
      setSaveError(error?.message || 'Unable to create role.');
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
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
              Role select করলে backend response-এর group, item, আর action permission exactly সেই structure-এ দেখাবে।
            </Typography>
          </Box>
        </Stack>
      </Box>

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

      <Paper
        elevation={0}
        sx={{
          mb: 2.5,
          borderRadius: '16px',
          border: '1px solid #dbe4ee',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          justifyContent="space-between"
          sx={{ px: 2.25, py: 2.25 }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'flex-start' }}
            sx={{ flex: 1 }}
          >
            <Box sx={{ width: { xs: '100%', md: 320 } }}>
              <SelectDropdownSingle
                name="roleId"
                label="Role"
                fetchOptions={fetchRoleOptions}
                value={selectedRoleId}
                onChange={setSelectedRoleId}
                disabled={rolesLoading}
              />
            </Box>

            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => loadRolePermissions(selectedRoleId)}
              disabled={!selectedRoleId || pageLoading}
              sx={{
                minHeight: 45,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Refresh
            </Button>
          </Stack>

          <Button
            variant="contained"
            onClick={() => setAddRoleOpen(true)}
            sx={{
              minHeight: 45,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              px: 2.25,
              alignSelf: { xs: 'stretch', lg: 'flex-start' },
            }}
          >
            Add Role
          </Button>
        </Stack>

        <Divider />

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.2}
          useFlexGap
          flexWrap="wrap"
          sx={{ px: 2.25, py: 1.75, bgcolor: '#f8fafc' }}
        >
          <Chip
            label={`Role: ${selectedRoleLabel || 'No role selected'}`}
            sx={{ borderRadius: '999px', bgcolor: '#fff', fontWeight: 700 }}
          />
          <Chip
            label={`Groups: ${summary.groups}`}
            sx={{ borderRadius: '999px', bgcolor: '#fff' }}
          />
          <Chip
            label={`Standalone: ${summary.standalone}`}
            sx={{ borderRadius: '999px', bgcolor: '#fff' }}
          />
          <Chip
            label={`Assigned Actions: ${summary.checkedActions}/${summary.totalActions}`}
            sx={{ borderRadius: '999px', bgcolor: '#fff' }}
          />
        </Stack>
      </Paper>

      <Stack spacing={2}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: '16px',
            border: '1px solid #dbe4ee',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 2.25, py: 2 }}>
            <Typography fontSize={16} fontWeight={800} color="#0f172a">
              Group Permissions
            </Typography>
            <Typography fontSize={13} color="#64748b" mt={0.5}>
              `groups` array থেকে আসা navigation sections এখানে render হচ্ছে।
            </Typography>
          </Box>

          <Divider />

          {pageLoading ? (
            <Stack alignItems="center" justifyContent="center" spacing={1.2} sx={{ minHeight: 220 }}>
              <CircularProgress size={28} />
              <Typography fontSize={13} color="#64748b">
                Loading role permissions...
              </Typography>
            </Stack>
          ) : permissionData.groups.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" spacing={1.2} sx={{ minHeight: 180 }}>
              <Typography fontSize={14} fontWeight={700} color="#334155">
                No grouped permissions found.
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ p: 2 }}>
              {permissionData.groups.map((group) => (
                <GroupSection
                  key={group.key}
                  group={group}
                  onToggleAll={(checked) => updateGroupActions(group.key, checked)}
                  onToggleAction={(itemKey, actionKey, checked) => (
                    updateGroupedAction(group.key, itemKey, actionKey, checked)
                  )}
                />
              ))}
            </Stack>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: '16px',
            border: '1px solid #dbe4ee',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 2.25, py: 2 }}>
            <Typography fontSize={16} fontWeight={800} color="#0f172a">
              Standalone Permissions
            </Typography>
            <Typography fontSize={13} color="#64748b" mt={0.5}>
              `standalone` array-এর items এখানে দেখাবে।
            </Typography>
          </Box>

          <Divider />

          {pageLoading ? (
            <Stack alignItems="center" justifyContent="center" spacing={1.2} sx={{ minHeight: 220 }}>
              <CircularProgress size={28} />
              <Typography fontSize={13} color="#64748b">
                Loading standalone permissions...
              </Typography>
            </Stack>
          ) : permissionData.standalone.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" spacing={1.2} sx={{ minHeight: 180 }}>
              <Typography fontSize={14} fontWeight={700} color="#334155">
                No standalone permissions found.
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={1.5} sx={{ p: 2 }}>
              {permissionData.standalone.map((item) => (
                <PermissionItemCard
                  key={item.key}
                  item={item}
                  sectionLabel="Standalone"
                  onActionToggle={(actionKey, checked) => updateStandaloneAction(item.key, actionKey, checked)}
                />
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>

      <AddRoleDialog
        open={addRoleOpen}
        onClose={() => setAddRoleOpen(false)}
        onSave={handleAddRole}
      />
    </Box>
  );
}
