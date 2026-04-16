import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import AddRoleDialog from '../components/AddRoleDialog';
import {
  createRole,
  fetchRolePermissions,
  fetchRoles,
  updateRolePermissions,
  updateRolePermissionsPost,
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
    id: action?.id, // ✅ MUST
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

/* ─── Action Pills ─────────────────────────────────────────────────────── */
function ActionPills({ item, onActionToggle }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, px: 2, py: 1.25, bgcolor: '#f8fafc' }}>
      {item.actions.length === 0 ? (
        <Typography fontSize={12} color="#94a3b8">No actions</Typography>
      ) : (
        item.actions.map((action) => (
          <Box
            key={action.key}
            component="label"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              px: 1.1,
              py: 0.5,
              borderRadius: '999px',
              border: '1px solid',
              borderColor: action.checked ? '#bfdbfe' : '#e2e8f0',
              bgcolor: action.checked ? '#eff6ff' : '#fff',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'background .1s, border-color .1s',
              '&:hover': { bgcolor: action.checked ? '#dbeafe' : '#f1f5f9' },
            }}
          >
            <Checkbox
              checked={action.checked}
              onChange={(e) => onActionToggle(action.key, e.target.checked)}
              size="small"
              sx={{
                p: 0,
                width: 14,
                height: 14,
                color: '#cbd5e1',
                '&.Mui-checked': { color: '#2563eb' },
              }}
            />
            <Typography
              fontSize={12.5}
              fontWeight={action.checked ? 700 : 400}
              color={action.checked ? '#1d4ed8' : '#475569'}
            >
              {action.label}
            </Typography>
            <Typography fontSize={11} color="#94a3b8" sx={{ fontFamily: 'monospace' }}>
              {action.key}
            </Typography>
          </Box>
        ))
      )}
    </Box>
  );
}

/* ─── Tree Item Row ─────────────────────────────────────────────────────── */
function TreeItemRow({ item, onActionToggle, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const checkedCount = item.actions.filter((a) => a.checked).length;

  return (
    <Box
      sx={{
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
        bgcolor: '#fff',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{
          px: 1.25,
          py: 0.9,
          cursor: 'pointer',
          '&:hover': { bgcolor: '#f8fafc' },
          userSelect: 'none',
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronRightIcon
          sx={{
            fontSize: 16,
            color: '#94a3b8',
            flexShrink: 0,
            transition: 'transform .15s',
            transform: open ? 'rotate(90deg)' : 'none',
          }}
        />
        <ArticleOutlinedIcon sx={{ fontSize: 15, color: '#64748b', flexShrink: 0 }} />
        <Typography fontSize={13} color="#0f172a" sx={{ flex: 1 }}>
          {item.label}
        </Typography>
        <Chip
          label={item.key}
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: 11, borderRadius: '4px', fontFamily: 'monospace', color: '#64748b' }}
        />
        <Typography fontSize={12} color="#94a3b8" sx={{ whiteSpace: 'nowrap', pr: 0.5 }}>
          {checkedCount}/{item.actions.length}
        </Typography>
      </Stack>

      <Collapse in={open} unmountOnExit>
        <Divider />
        <ActionPills item={item} onActionToggle={onActionToggle} />
      </Collapse>
    </Box>
  );
}

/* ─── Tree Group ────────────────────────────────────────────────────────── */
function TreeGroupSection({ group, onToggleAll, onToggleAction }) {
  const [open, setOpen] = useState(true);
  const groupMeta = getGroupMeta(group);

  return (
    <Box
      sx={{
        border: '1px solid #dbe4ee',
        borderRadius: '12px',
        overflow: 'hidden',
        bgcolor: '#fff',
      }}
    >
      {/* Group header row */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: '#f1f5f9',
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': { bgcolor: '#e8edf3' },
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronRightIcon
          sx={{
            fontSize: 17,
            color: '#64748b',
            flexShrink: 0,
            transition: 'transform .15s',
            transform: open ? 'rotate(90deg)' : 'none',
          }}
        />
        <Checkbox
          checked={groupMeta.checked}
          indeterminate={groupMeta.indeterminate}
          disabled={groupMeta.totalActions === 0}
          onChange={(e) => { e.stopPropagation(); onToggleAll(e.target.checked); }}
          onClick={(e) => e.stopPropagation()}
          size="small"
          sx={{
            p: 0.2,
            color: '#cbd5e1',
            '&.Mui-checked': { color: '#2563eb' },
            '&.MuiCheckbox-indeterminate': { color: '#2563eb' },
          }}
        />
        <FolderOutlinedIcon sx={{ fontSize: 16, color: '#3b82f6', flexShrink: 0 }} />
        <Typography fontSize={13.5} fontWeight={700} color="#0f172a" sx={{ flex: 1 }}>
          {group.label}
        </Typography>
        <Chip
          label={`${group.key}`}
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: 11, borderRadius: '4px', fontFamily: 'monospace', color: '#64748b' }}
        />
        <Chip
          label={`${groupMeta.checkedActions}/${groupMeta.totalActions}`}
          size="small"
          sx={{
            height: 20,
            fontSize: 11,
            borderRadius: '999px',
            bgcolor: '#dbeafe',
            color: '#1d4ed8',
            fontWeight: 700,
          }}
        />
      </Stack>

      <Collapse in={open} unmountOnExit>
        <Divider />
        {/* All items in one single div / Box */}
        <Box sx={{ p: 1.25 }}>
          <Stack spacing={0.75}>
            {group.items.map((item) => (
              <TreeItemRow
                key={item.key}
                item={item}
                onActionToggle={(actionKey, checked) => onToggleAction(item.key, actionKey, checked)}
              />
            ))}
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
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
        if (!active) return;
        const normalizedRoles = roleData.map(normalizeRoleOption);
        setRoles(normalizedRoles);
        setSelectedRoleId((prev) => prev || normalizedRoles[0]?.id || '');
      } catch (error) {
        if (active) setLoadError(error?.message || 'Unable to load roles.');
      } finally {
        if (active) setRolesLoading(false);
      }
    };
    loadRoles();
    return () => { active = false; };
  }, []);

  const loadRolePermissions = useCallback(async (roleId) => {
    if (!roleId) { setPermissionData({ groups: [], standalone: [] }); return; }
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

  useEffect(() => { loadRolePermissions(selectedRoleId); }, [loadRolePermissions, selectedRoleId]);

  const selectedRoleLabel = useMemo(
    () => roles.find((role) => role.id === selectedRoleId)?.label || '',
    [roles, selectedRoleId],
  );

  const summary = useMemo(() => {
    const groupedItems = permissionData.groups.flatMap((group) => group.items);
    const allItems = [...groupedItems, ...permissionData.standalone];
    return {
      groups: permissionData.groups.length,
      standalone: permissionData.standalone.length,
      totalActions: countAllActions(allItems),
      checkedActions: countCheckedActions(allItems),
    };
  }, [permissionData]);

  const fetchRoleOptions = useCallback(async () => roles, [roles]);

  function updateGroupActions(groupKey, nextChecked) {
    setPermissionData((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.key === groupKey
          ? { ...group, items: group.items.map((item) => ({ ...item, actions: updateActionList(item.actions, nextChecked) })) }
          : group,
      ),
    }));
  }

  function updateGroupedAction(groupKey, itemKey, actionKey, nextChecked) {
    setPermissionData((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.key === groupKey
          ? {
              ...group,
              items: group.items.map((item) =>
                item.key === itemKey
                  ? { ...item, actions: item.actions.map((action) => (action.key === actionKey ? { ...action, checked: nextChecked } : action)) }
                  : item,
              ),
            }
          : group,
      ),
    }));
  }
function buildPermissionPayload() {
  const selected = [];

  permissionData.groups.forEach((group) => {
    group.items.forEach((item) => {
      item.actions.forEach((action) => {
        if (action.checked && action.id) {
          selected.push(action.id);
        }
      });
    });
  });

  permissionData.standalone.forEach((item) => {
    item.actions.forEach((action) => {
      if (action.checked && action.id) {
        selected.push(action.id);
      }
    });
  });

  return selected;
}
  function updateStandaloneAction(itemKey, actionKey, nextChecked) {
    setPermissionData((prev) => ({
      ...prev,
      standalone: prev.standalone.map((item) =>
        item.key === itemKey
          ? { ...item, actions: item.actions.map((action) => (action.key === actionKey ? { ...action, checked: nextChecked } : action)) }
          : item,
      ),
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


async function handleSubmitPermissions() {
  try {
    setSaveError('');

    const permissions = buildPermissionPayload();

    await updateRolePermissionsPost(selectedRoleId, permissions);

    alert('Permissions saved successfully');
  } catch (error) {
    setSaveError(error?.message || 'Failed to save permissions');
  }
}
  const LoadingState = (
    <Stack alignItems="center" justifyContent="center" spacing={1.2} sx={{ minHeight: 180 }}>
      <CircularProgress size={26} />
      <Typography fontSize={13} color="#64748b">Loading permissions...</Typography>
    </Stack>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', px: { xs: 2, sm: 3 }, py: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <SecurityOutlinedIcon sx={{ fontSize: 20, color: '#2563eb' }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
            Role Mapping
          </Typography>
          <Typography variant="body2" color="#64748b" mt={0.3}>
            Role select করলে backend response-এর group, item, আর action tree view-এ দেখাবে।
          </Typography>
        </Box>
      </Stack>

      {loadError && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{loadError}</Alert>}
      {saveError && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{saveError}</Alert>}

      {/* Toolbar */}
      <Paper elevation={0} sx={{ mb: 2.5, borderRadius: '14px', border: '1px solid #dbe4ee', overflow: 'hidden' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} justifyContent="space-between" sx={{ px: 2.25, py: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'flex-start' }} sx={{ flex: 1 }}>
            <Box sx={{ width: { xs: '100%', md: 300 } }}>
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
              sx={{ minHeight: 45, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              Refresh
            </Button>
          </Stack>
          <Button
            variant="contained"
            onClick={() => setAddRoleOpen(true)}
            sx={{ minHeight: 45, borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2.5, alignSelf: { xs: 'stretch', lg: 'flex-start' } }}
          >
            Add Role
          </Button>
        </Stack>

        <Divider />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} useFlexGap flexWrap="wrap" sx={{ px: 2.25, py: 1.5, bgcolor: '#f8fafc' }}>
          <Chip label={`Role: ${selectedRoleLabel || 'No role selected'}`} sx={{ borderRadius: '999px', bgcolor: '#fff', fontWeight: 700 }} />
          <Chip label={`Groups: ${summary.groups}`} sx={{ borderRadius: '999px', bgcolor: '#fff' }} />
          <Chip label={`Standalone: ${summary.standalone}`} sx={{ borderRadius: '999px', bgcolor: '#fff' }} />
          <Chip label={`Assigned Actions: ${summary.checkedActions}/${summary.totalActions}`} sx={{ borderRadius: '999px', bgcolor: '#fff' }} />
        </Stack>
      </Paper>

      {/* Two-column grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
        {/* Group Permissions */}
        <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid #dbe4ee', overflow: 'hidden' }}>
          <Box sx={{ px: 2.25, py: 1.75 }}>
            <Typography fontSize={15} fontWeight={800} color="#0f172a">Group Permissions</Typography>
            <Typography fontSize={12.5} color="#64748b" mt={0.4}>
              groups array — collapse/expand করে items ও actions দেখুন।
            </Typography>
          </Box>
          <Divider />

          {pageLoading ? LoadingState : permissionData.groups.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 150 }}>
              <Typography fontSize={13.5} fontWeight={700} color="#334155">No grouped permissions found.</Typography>
            </Stack>
          ) : (
            /* ── All groups in one single Box ── */
            <Box sx={{ p: 1.75 }}>
              <Stack spacing={1.25}>
                {permissionData.groups.map((group) => (
                  <TreeGroupSection
                    key={group.key}
                    group={group}
                    onToggleAll={(checked) => updateGroupActions(group.key, checked)}
                    onToggleAction={(itemKey, actionKey, checked) =>
                      updateGroupedAction(group.key, itemKey, actionKey, checked)
                    }
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Standalone Permissions */}
        <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid #dbe4ee', overflow: 'hidden' }}>
          <Box sx={{ px: 2.25, py: 1.75 }}>
            <Typography fontSize={15} fontWeight={800} color="#0f172a">Standalone Permissions</Typography>
            <Typography fontSize={12.5} color="#64748b" mt={0.4}>
              standalone array — সরাসরি items ও actions।
            </Typography>
          </Box>
          <Divider />

          {pageLoading ? LoadingState : permissionData.standalone.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 150 }}>
              <Typography fontSize={13.5} fontWeight={700} color="#334155">No standalone permissions found.</Typography>
            </Stack>
          ) : (
            /* ── All standalone items in one single Box ── */
            <Box sx={{ p: 1.75 }}>
              <Stack spacing={0.75}>
                {permissionData.standalone.map((item) => (
                  <TreeItemRow
                    key={item.key}
                    item={item}
                    onActionToggle={(actionKey, checked) => updateStandaloneAction(item.key, actionKey, checked)}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Paper>
      </Box>

      <Stack direction="row" justifyContent="flex-end" mt={2}>
  <Button
    variant="contained"
    onClick={handleSubmitPermissions}
    disabled={!selectedRoleId || pageLoading}
    sx={{
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 700,
      px: 3,
    }}
  >
    Save Permissions
  </Button>
</Stack>

      <AddRoleDialog
        open={addRoleOpen}
        onClose={() => setAddRoleOpen(false)}
        onSave={handleAddRole}
      />
    </Box>
  );
}




