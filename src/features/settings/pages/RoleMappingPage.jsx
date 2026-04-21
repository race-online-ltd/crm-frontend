import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
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
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import AddRoleDialog from '../components/AddRoleDialog';
import {
  createRole,
  fetchRolePermissions,
  fetchRoles,
  updateRolePermissionsPost,
} from '../api/settingsApi';
import SyncIcon from '@mui/icons-material/Sync';
import { syncPermissions } from '../api/settingsApi';

/* ══════════════════════════════════════════════════════════════════════════
   THEME COLOR
══════════════════════════════════════════════════════════════════════════ */
const PRIMARY       = '#5000f0';
const PRIMARY_DARK  = '#3d00c4';
const PRIMARY_LIGHT = '#ede8ff';
const PRIMARY_BORDER= '#c4b0ff';

/* ══════════════════════════════════════════════════════════════════════════
   NORMALIZE HELPERS
══════════════════════════════════════════════════════════════════════════ */
function normalizeRoleOption(role) {
  return { ...role, id: role?.id ?? '', label: role?.label || role?.name || 'Unnamed Role' };
}
function normalizeAction(action) {
  return {
    id: action?.id,
    key: action?.key || '',
    label: action?.label || action?.key || 'Unnamed Action',
    checked: Boolean(action?.checked),
  };
}
function normalizeItem(item) {
  return {
    key: item?.key || item?.id?.toString() || '',
    label: item?.label || item?.key || 'Unnamed Item',
    actions: Array.isArray(item?.actions)
      ? item.actions.map(normalizeAction)
      : Array.isArray(item?.permissions)
      ? item.permissions.map(normalizeAction)
      : [],
  };
}
function normalizePermissionResponse(payload) {
  const menus = Array.isArray(payload?.menus)
    ? payload.menus
    : Array.isArray(payload?.data?.menus)
    ? payload.data.menus
    : [];

  const groups = [];
  const standalone = [];

  menus.forEach((menu) => {
    const normalized = normalizeItem(menu);
    const children = Array.isArray(menu?.children) ? menu.children.map(normalizeItem) : [];

    if (children.length > 0) {
      groups.push({
        key: menu?.key || menu?.id?.toString() || `group-${groups.length}`,
        label: menu?.label || menu?.key || 'Unnamed Group',
        actions: normalized.actions,
        items: children,
      });
    } else {
      standalone.push(normalized);
    }
  });

  return { groups, standalone };
}
function countCheckedActions(items) {
  return items.reduce((t, item) => {
    if (Array.isArray(item?.actions)) {
      return t + item.actions.filter((a) => a.checked).length;
    }
    return t;
  }, 0);
}
function countAllActions(items) {
  return items.reduce((t, item) => {
    if (Array.isArray(item?.actions)) {
      return t + item.actions.length;
    }
    return t;
  }, 0);
}

/* ══════════════════════════════════════════════════════════════════════════
   BADGE STYLES  (screenshot colors)
══════════════════════════════════════════════════════════════════════════ */
function getBadgeStyle(label = '') {
  const k = label.toLowerCase();
  if (k.includes('create')) return { color: '#16a34a', bgcolor: '#f0fdf4', border: '1.5px solid #86efac', fontWeight: 600 };
  if (k.includes('export')) return { color: '#db2777', bgcolor: '#fdf2f8', border: '1.5px solid #f9a8d4', fontWeight: 600 };
  if (k.includes('update')) return { color: '#d97706', bgcolor: '#fffbeb', border: '1.5px solid #fcd34d', fontWeight: 600 };
  if (k.includes('delete')) return { color: '#dc2626', bgcolor: '#fff1f2', border: '1.5px solid #fca5a5', fontWeight: 600 };
  // Single View, List View etc.
  return { color: '#374151', bgcolor: '#fff', border: '1.5px solid #d1d5db', fontWeight: 400 };
}

function PermBadge({ label }) {
  return (
    <Box
      sx={{
        display: 'inline-flex', alignItems: 'center',
        px: 1.4, py: 0.35, borderRadius: '6px',
        fontSize: 12.5, lineHeight: 1.7, whiteSpace: 'nowrap',
        ...getBadgeStyle(label),
      }}
    >
      {label}
    </Box>
  );
}

/* BadgeCell — shows ALL actions whose checked=true */
function BadgeCell({ actions }) {
  const checkedActions = actions.filter((a) => a.checked);
  if (!checkedActions.length) return <Typography fontSize={12} color="#cbd5e1">—</Typography>;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
      {checkedActions.map((a) => <PermBadge key={a.key} label={a.label} />)}
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SHARED STYLES
══════════════════════════════════════════════════════════════════════════ */
const iconBtnBase = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 36, height: 36, borderRadius: '8px', border: '1.5px solid #e2e8f0',
  bgcolor: '#fff', cursor: 'pointer', userSelect: 'none', transition: 'all .15s',
};

const headCellSx = {
  color: PRIMARY, fontWeight: 700, fontSize: 13.5,
  py: 1.5, bgcolor: '#fff', borderBottom: `2px solid ${PRIMARY_BORDER}`,
};
const cellSx = {
  py: 1.15, px: 2, fontSize: 13.5,
  borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle',
};
const cbSx = {
  p: 0.4,
  color: '#d1d5db',
  '&.Mui-checked': { color: PRIMARY },
  '&.MuiCheckbox-indeterminate': { color: PRIMARY },
};

/* ══════════════════════════════════════════════════════════════════════════
   ICON BUTTONS
══════════════════════════════════════════════════════════════════════════ */
function ExpandBtn({ expanded, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        ...iconBtnBase, color: '#64748b',
        '&:hover': { borderColor: PRIMARY, bgcolor: PRIMARY_LIGHT, color: PRIMARY },
      }}
    >
      {expanded
        ? <KeyboardArrowUpRoundedIcon sx={{ fontSize: 18 }} />
        : <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />}
    </Box>
  );
}

function EditBtn({ onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        ...iconBtnBase, color: '#64748b',
        '&:hover': { borderColor: PRIMARY, bgcolor: PRIMARY_LIGHT, color: PRIMARY },
      }}
    >
      <EditOutlinedIcon sx={{ fontSize: 16 }} />
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   EDIT PERMISSIONS DIALOG
══════════════════════════════════════════════════════════════════════════ */
function EditPermissionsDialog({ open, item, onClose, onSave }) {
  const [checkedKeys, setCheckedKeys] = useState([]);

  // Re-sync whenever the item changes (i.e. different row opened)
  useEffect(() => {
    if (item) setCheckedKeys(item.actions.filter((a) => a.checked).map((a) => a.key));
  }, [item]);

  if (!item) return null;

  const allChecked  = item.actions.length > 0 && checkedKeys.length === item.actions.length;
  const someChecked = checkedKeys.length > 0 && !allChecked;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: '14px',
          border: `1px solid ${PRIMARY_BORDER}`,
          boxShadow: `0 12px 40px rgba(80,0,240,0.12)`,
        },
      }}
    >
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          px: 3, py: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `1px solid ${PRIMARY_BORDER}`,
        }}
      >
        <Typography fontSize={15} fontWeight={600} color="#0f172a">
          Role Permissions of{' '}
          <Box component="span" sx={{ color: PRIMARY }}>{item.label}</Box>
        </Typography>
        <Box
          onClick={onClose}
          sx={{
            ...iconBtnBase, width: 28, height: 28, borderRadius: '6px',
            color: '#94a3b8',
            '&:hover': { borderColor: PRIMARY, bgcolor: PRIMARY_LIGHT, color: PRIMARY },
          }}
        >
          <CloseIcon sx={{ fontSize: 15 }} />
        </Box>
      </DialogTitle>

      {/* ── Body ── */}
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {item.actions.length === 0 ? (
          <Typography fontSize={13} color="#94a3b8">No actions available.</Typography>
        ) : (
          <FormGroup>
            {/* All */}
            <FormControlLabel
              sx={{ mb: 0.5 }}
              control={
                <Checkbox
                  checked={allChecked}
                  indeterminate={someChecked}
                  onChange={(e) => setCheckedKeys(e.target.checked ? item.actions.map((a) => a.key) : [])}
                  sx={{ color: '#d1d5db', '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: PRIMARY } }}
                />
              }
              label={<Typography fontSize={13.5} fontWeight={600} color="#0f172a">All</Typography>}
            />
            <Divider sx={{ mb: 1.5 }} />

            {/* Individual */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px' }}>
              {item.actions.map((action) => (
                <FormControlLabel
                  key={action.key}
                  control={
                    <Checkbox
                      checked={checkedKeys.includes(action.key)}
                      onChange={(e) =>
                        setCheckedKeys((prev) =>
                          e.target.checked
                            ? [...prev, action.key]
                            : prev.filter((k) => k !== action.key),
                        )
                      }
                      sx={{ color: '#d1d5db', '&.Mui-checked': { color: PRIMARY } }}
                    />
                  }
                  label={
                    <Typography fontSize={13} color="#374151" sx={{ textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {action.label}
                    </Typography>
                  }
                />
              ))}
            </Box>
          </FormGroup>
        )}
      </DialogContent>

      <Divider sx={{ borderColor: PRIMARY_BORDER }} />

      {/* ── Footer ── */}
      <DialogActions sx={{ px: 3, py: 1.75, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: '8px', textTransform: 'none', fontWeight: 500,
            color: '#475569', borderColor: '#d1d5db', px: 2.5,
            '&:hover': { borderColor: PRIMARY, color: PRIMARY, bgcolor: PRIMARY_LIGHT },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => { onSave(item.key, checkedKeys); onClose(); }}
          variant="contained"
          sx={{
            borderRadius: '8px', textTransform: 'none', fontWeight: 600,
            bgcolor: PRIMARY, px: 3,
            '&:hover': { bgcolor: PRIMARY_DARK },
            boxShadow: `0 2px 8px rgba(80,0,240,0.3)`,
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PERMISSION TABLE
   — groups with expand/collapse
   — parent checkbox → auto-check all children
   — BadgeCell shows initial checked actions from API
══════════════════════════════════════════════════════════════════════════ */
function PermissionTable({ groups, standalone, loading, onSaveEdit, permissionData, setPermissionData }) {
  // expanded state per group (default: all expanded)
  const [expandedGroups, setExpandedGroups] = useState({});

  // checkbox state: true = checked, false = unchecked
  // keyed by group.key (parents) and `${groupKey}__${itemKey}` (children) or item.key (standalone)
  const [rowChecked, setRowChecked] = useState({});

  // select all state
  const [selectAll, setSelectAll] = useState(false);

  const [editItem, setEditItem] = useState(null);
  const [editOpen, setEditOpen]  = useState(false);

  // Init expand + checkbox from API data
  useEffect(() => {
    const expInit = {};
    const cbInit  = {};
    groups.forEach((g) => {
      expInit[g.key] = true;          // all expanded by default
      // parent checked if ANY child has a permission assigned
      const anyChildChecked = g.items.some((item) => item.actions.some((a) => a.checked));
      cbInit[g.key] = anyChildChecked;
      g.items.forEach((item) => {
        const ck = `${g.key}__${item.key}`;
        cbInit[ck] = item.actions.some((a) => a.checked);
      });
    });
    standalone.forEach((item) => {
      cbInit[item.key] = item.actions.some((a) => a.checked);
    });
    setExpandedGroups(expInit);
    setRowChecked(cbInit);
  }, [groups, standalone]);

  // Compute selectAll based on rowChecked
  useEffect(() => {
    const allKeys = [
      ...groups.map((g) => g.key),
      ...groups.flatMap((g) => g.items.map((item) => `${g.key}__${item.key}`)),
      ...standalone.map((item) => item.key),
    ];
    const allChecked = allKeys.every((key) => rowChecked[key] === true);
    const someChecked = allKeys.some((key) => rowChecked[key] === true);
    setSelectAll(allChecked ? true : someChecked ? 'indeterminate' : false);
  }, [rowChecked, groups, standalone]);

  /* ── Parent checkbox toggle → auto-check ALL children ── */
  function handleParentCheck(groupKey, checked) {
    const group = groups.find((g) => g.key === groupKey);
    if (!group) return;

    // Update rowChecked state for parent + all children
    setRowChecked((prev) => {
      const next = { ...prev, [groupKey]: checked };
      group.items.forEach((item) => {
        next[`${groupKey}__${item.key}`] = checked;
      });
      return next;
    });

    // Also update permissionData actions so badges update
    setPermissionData((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.key === groupKey
          ? {
              ...g,
              actions: g.actions?.map((a) => ({ ...a, checked })) ?? [],
              items: g.items.map((item) => ({
                ...item,
                actions: item.actions.map((a) => ({ ...a, checked })),
              })),
            }
          : g,
      ),
    }));
  }

  /* ── Child checkbox toggle ── */
  function handleChildCheck(groupKey, itemKey, checked) {
    const ck = `${groupKey}__${itemKey}`;
    setRowChecked((prev) => {
      const next = { ...prev, [ck]: checked };
      // re-evaluate parent: checked when any child item is checked
      const group = groups.find((g) => g.key === groupKey);
      if (group) {
        const anyChecked = group.items.some((item) =>
          next[`${groupKey}__${item.key}`] === true,
        );
        next[groupKey] = anyChecked;
      }
      return next;
    });

    // Update permissionData actions
    setPermissionData((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.key === groupKey
          ? {
              ...g,
              items: g.items.map((item) =>
                item.key === itemKey
                  ? { ...item, actions: item.actions.map((a) => ({ ...a, checked })) }
                  : item,
              ),
            }
          : g,
      ),
    }));
  }

  /* ── Select All toggle ── */
  function handleSelectAll(checked) {
    setRowChecked((prev) => {
      const next = { ...prev };
      groups.forEach((g) => {
        next[g.key] = checked;
        g.items.forEach((item) => {
          next[`${g.key}__${item.key}`] = checked;
        });
      });
      standalone.forEach((item) => {
        next[item.key] = checked;
      });
      return next;
    });

    // Update permissionData actions
    setPermissionData((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => ({
        ...g,
        actions: g.actions?.map((a) => ({ ...a, checked })) ?? [],
        items: g.items.map((item) => ({
          ...item,
          actions: item.actions.map((a) => ({ ...a, checked })),
        })),
      })),
      standalone: prev.standalone.map((item) => ({
        ...item,
        actions: item.actions.map((a) => ({ ...a, checked })),
      })),
    }));
  }

  /* ── Standalone checkbox toggle ── */
  function handleStandaloneCheck(itemKey, checked) {
    setRowChecked((prev) => ({ ...prev, [itemKey]: checked }));
    setPermissionData((prev) => ({
      ...prev,
      standalone: prev.standalone.map((item) =>
        item.key === itemKey
          ? { ...item, actions: item.actions.map((a) => ({ ...a, checked })) }
          : item,
      ),
    }));
  }

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={1.2} sx={{ minHeight: 200 }}>
        <CircularProgress size={24} sx={{ color: PRIMARY }} />
        <Typography fontSize={13} color="#64748b">Loading permissions…</Typography>
      </Stack>
    );
  }

  if (!groups.length && !standalone.length) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 160 }}>
        <Typography fontSize={13.5} color="#94a3b8">No permissions found for this role.</Typography>
      </Stack>
    );
  }

  return (
    <>
      <TableContainer>
        <Table size="small">
          {/* ── Head ── */}
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headCellSx, width: 64, pl: 2.5 }}>
                <Checkbox
                  checked={selectAll === true}
                  indeterminate={selectAll === 'indeterminate'}
                  onChange={() => {
                    const shouldCheck = selectAll !== true;
                    handleSelectAll(shouldCheck);
                  }}
                  sx={cbSx}
                />
              </TableCell>
              <TableCell sx={{ ...headCellSx, pl: 2 }}>Menu Name</TableCell>
              <TableCell sx={{ ...headCellSx }}>Permissions</TableCell>
              <TableCell sx={{ ...headCellSx, width: 80, textAlign: 'center', pr: 2 }}>Action</TableCell>
            </TableRow>
          </TableHead>

          {/* ── Body ── */}
          <TableBody>
            {/* ▸ Grouped rows */}
            {groups.map((group) => {
              const isExpanded  = expandedGroups[group.key] !== false;
              const pChecked    = rowChecked[group.key] === true;
              const pIndeterminate = !pChecked && group.items.some((item) => rowChecked[`${group.key}__${item.key}`] === true);

              return (
                <React.Fragment key={group.key}>
                  {/* Parent row */}
                  <TableRow sx={{ bgcolor: '#faf8ff', '&:hover td': { bgcolor: '#f3eeff' } }}>
                    <TableCell sx={{ ...cellSx, pl: 2.5 }}>
                      <Checkbox
                        checked={pChecked}
                        indeterminate={pIndeterminate}
                        onChange={(e) => handleParentCheck(group.key, e.target.checked)}
                        sx={cbSx}
                      />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, fontWeight: 700, color: '#111827', pl: 2 }}>
                      {group.label}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <BadgeCell actions={group.actions ?? []} />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, textAlign: 'center', pr: 2 }}>
                      <ExpandBtn
                        expanded={isExpanded}
                        onClick={() =>
                          setExpandedGroups((prev) => ({ ...prev, [group.key]: !isExpanded }))
                        }
                      />
                    </TableCell>
                  </TableRow>

                  {/* Child rows */}
                  {isExpanded &&
                    group.items.map((item) => {
                      const ck       = `${group.key}__${item.key}`;
                      const cChecked = rowChecked[ck] === true;
                      return (
                        <TableRow key={item.key} sx={{ bgcolor: '#fff', '&:hover td': { bgcolor: '#faf8ff' } }}>
                          <TableCell sx={{ ...cellSx, pl: 2.5 }}>
                            <Checkbox
                              checked={cChecked}
                              onChange={(e) => handleChildCheck(group.key, item.key, e.target.checked)}
                              sx={cbSx}
                            />
                          </TableCell>
                          <TableCell sx={{ ...cellSx, color: '#374151', pl: 3.5 }}>
                            — {item.label}
                          </TableCell>
                          <TableCell sx={cellSx}>
                            <BadgeCell actions={item.actions} />
                          </TableCell>
                          <TableCell sx={{ ...cellSx, textAlign: 'center', pr: 2 }}>
                            <EditBtn
                              onClick={() => {
                                setEditItem(item);
                                setEditOpen(true);
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </React.Fragment>
              );
            })}

            {/* ▸ Standalone rows */}
            {standalone.map((item) => {
              const cChecked = rowChecked[item.key] === true;
              return (
                <TableRow key={item.key} sx={{ bgcolor: '#fff', '&:hover td': { bgcolor: '#faf8ff' } }}>
                  <TableCell sx={{ ...cellSx, pl: 2.5 }}>
                    <Checkbox
                      checked={cChecked}
                      onChange={(e) => handleStandaloneCheck(item.key, e.target.checked)}
                      sx={cbSx}
                    />
                  </TableCell>
                  <TableCell sx={{ ...cellSx, fontWeight: 600, color: '#111827', pl: 2 }}>
                    {item.label}
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <BadgeCell actions={item.actions} />
                  </TableCell>
                  <TableCell sx={{ ...cellSx, textAlign: 'center', pr: 2 }}>
                            <EditBtn
                              onClick={() => {
                                setEditItem(item);
                                setEditOpen(true);
                              }}
                            />
                          </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <EditPermissionsDialog
        open={editOpen}
        item={editItem}
        onClose={() => { setEditOpen(false); setEditItem(null); }}
        onSave={(itemKey, checkedKeys) => {
          // 1. Propagate up to permissionData (badges update)
          onSaveEdit(itemKey, checkedKeys);
          // 2. Refresh local editItem so dialog shows updated state if reopened
          setEditItem((prev) =>
            prev
              ? {
                  ...prev,
                  actions: prev.actions.map((a) => ({
                    ...a,
                    checked: checkedKeys.includes(a.key),
                  })),
                }
              : null,
          );
        }}
      />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function RoleMappingPage() {
  const [roles, setRoles]                   = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [permissionData, setPermissionData] = useState({ groups: [], standalone: [] });
  const [addRoleOpen, setAddRoleOpen]       = useState(false);
  const [loadError, setLoadError]           = useState('');
  const [saveError, setSaveError]           = useState('');
  const [rolesLoading, setRolesLoading]     = useState(true);
  const [pageLoading, setPageLoading]       = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  /* ── Load roles ── */
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setRolesLoading(true); setLoadError('');
        const data = await fetchRoles();
        if (!active) return;
        const normalized = data.map(normalizeRoleOption);
        setRoles(normalized);
        setSelectedRoleId((prev) => prev || normalized[0]?.id || '');
      } catch (e) {
        if (active) setLoadError(e?.message || 'Unable to load roles.');
      } finally {
        if (active) setRolesLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  /* ── Load permissions ── */
  const loadRolePermissions = useCallback(async (roleId) => {
    if (!roleId) { setPermissionData({ groups: [], standalone: [] }); return; }
    try {
      setPageLoading(true); setLoadError(''); setSaveError('');
      setPermissionData(normalizePermissionResponse(await fetchRolePermissions(roleId)));
    } catch (e) {
      setLoadError(e?.message || 'Unable to load permissions.');
      setPermissionData({ groups: [], standalone: [] });
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => { loadRolePermissions(selectedRoleId); }, [loadRolePermissions, selectedRoleId]);

  const selectedRoleLabel = useMemo(
    () => roles.find((r) => r.id === selectedRoleId)?.label || '',
    [roles, selectedRoleId],
  );
  const summary = useMemo(() => {
    const all = [
      ...permissionData.groups.flatMap((g) => [
        ...(Array.isArray(g.actions) ? g.actions : []),
        ...g.items,
      ]),
      ...permissionData.standalone,
    ];
    return { total: countAllActions(all), checked: countCheckedActions(all) };
  }, [permissionData]);

  const fetchRoleOptions = useCallback(async () => roles, [roles]);

  /* ── Save edit from modal → update permissionData ── */
  function handleSaveEdit(itemKey, checkedKeys) {
    setPermissionData((prev) => ({
      groups: prev.groups.map((g) => ({
        ...g,
        items: g.items.map((item) =>
          item.key === itemKey
            ? { ...item, actions: item.actions.map((a) => ({ ...a, checked: checkedKeys.includes(a.key) })) }
            : item,
        ),
      })),
      standalone: prev.standalone.map((item) =>
        item.key === itemKey
          ? { ...item, actions: item.actions.map((a) => ({ ...a, checked: checkedKeys.includes(a.key) })) }
          : item,
      ),
    }));
  }

  /* ── Build payload ── */
  function buildPermissionPayload() {
    const ids = [];
    permissionData.groups.forEach((g) => {
      if (Array.isArray(g.actions)) {
        g.actions.forEach((a) => { if (a.checked && a.id) ids.push(a.id); });
      }
      g.items.forEach((item) =>
        item.actions.forEach((a) => { if (a.checked && a.id) ids.push(a.id); }),
      );
    });
    permissionData.standalone.forEach((item) =>
      item.actions.forEach((a) => { if (a.checked && a.id) ids.push(a.id); }),
    );
    return ids;
  }

  /* ── Add role ── */
  async function handleAddRole(payload) {
    try {
      setSaveError('');
      const created = normalizeRoleOption(await createRole({ name: payload.name }));
      setRoles((prev) => [...prev, created]);
      setSelectedRoleId(created.id);
      setAddRoleOpen(false);
    } catch (e) {
      setSaveError(e?.message || 'Unable to create role.');
    }
  }

  /* ── Submit permissions ── */
  async function handleSubmitPermissions() {
    try {
      setSaveError('');
      await updateRolePermissionsPost(selectedRoleId, { permissions: buildPermissionPayload() });
      alert('Permissions saved successfully');
    } catch (e) {
      setSaveError(e?.message || 'Failed to save permissions.');
    }
  }

  async function handleSyncPermissions() {
  try {
    setSyncLoading(true);
    await syncPermissions();
    alert('Permissions synced successfully ✅');
  } catch (e) {
    alert(e?.message || 'Sync failed');
  } finally {
    setSyncLoading(false);
  }
}
  /* ══════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f6ff', px: { xs: 2, sm: 3 }, py: 3 }}>

      {/* ── Header ── */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: '12px',
            bgcolor: PRIMARY_LIGHT, border: `1.5px solid ${PRIMARY_BORDER}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <SecurityOutlinedIcon sx={{ fontSize: 22, color: PRIMARY }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0f172a" letterSpacing="-0.4px">
            Role Mapping
          </Typography>
          <Typography variant="body2" color="#64748b" mt={0.2}>
            Manage role-based permissions across all menu items.
          </Typography>
        </Box>
      </Stack>

      {loadError && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{loadError}</Alert>}
      {saveError && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{saveError}</Alert>}

      {/* ── Toolbar ── */}
      <Paper
        elevation={0}
        sx={{ mb: 2.5, borderRadius: '12px', border: `1px solid ${PRIMARY_BORDER}`, overflow: 'hidden', bgcolor: '#fff' }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          sx={{ px: 2.5, py: 2 }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} sx={{ flex: 1 }}>
            <Box sx={{ width: { xs: '100%', sm: 280 } }}>
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
                minHeight: 42, borderRadius: '8px', textTransform: 'none', fontWeight: 600,
                borderColor: PRIMARY_BORDER, color: PRIMARY,
                '&:hover': { borderColor: PRIMARY, bgcolor: PRIMARY_LIGHT },
              }}
            >
              Refresh
            </Button>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {selectedRoleLabel && (
              <Chip
                label={`${selectedRoleLabel} · ${summary.checked} / ${summary.total}`}
                size="small"
                sx={{
                  bgcolor: PRIMARY_LIGHT, color: PRIMARY,
                  fontWeight: 600, border: `1px solid ${PRIMARY_BORDER}`,
                  borderRadius: '6px', fontSize: 12.5,
                }}
              />
            )}
            <Button
  variant="outlined"
  startIcon={
    syncLoading ? <CircularProgress size={16} /> : <SyncIcon />
  }
  onClick={handleSyncPermissions}
  disabled={syncLoading}
  sx={{
    minHeight: 42,
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    borderColor: PRIMARY_BORDER,
    color: PRIMARY,
    '&:hover': { borderColor: PRIMARY, bgcolor: PRIMARY_LIGHT },
  }}
>
  Sync Permissions
</Button>
            <Button
              variant="contained"
              onClick={() => setAddRoleOpen(true)}
              sx={{
                minHeight: 42, borderRadius: '8px', textTransform: 'none',
                fontWeight: 600, px: 2.5,
                bgcolor: PRIMARY, boxShadow: `0 2px 8px rgba(80,0,240,0.25)`,
                '&:hover': { bgcolor: PRIMARY_DARK },
              }}
            >
              + Add Role
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* ── Permissions Table ── */}
      <Paper
        elevation={0}
        sx={{ borderRadius: '12px', border: `1px solid ${PRIMARY_BORDER}`, overflow: 'hidden', bgcolor: '#fff' }}
      >
        <PermissionTable
          groups={permissionData.groups}
          standalone={permissionData.standalone}
          loading={pageLoading}
          onSaveEdit={handleSaveEdit}
          permissionData={permissionData}
          setPermissionData={setPermissionData}
        />
      </Paper>

      {/* ── Save ── */}
      <Stack direction="row" justifyContent="flex-end" mt={2.5}>
        <Button
          variant="contained"
          onClick={handleSubmitPermissions}
          disabled={!selectedRoleId || pageLoading}
          sx={{
            borderRadius: '8px', textTransform: 'none', fontWeight: 600,
            px: 3.5, minHeight: 42,
            bgcolor: PRIMARY, boxShadow: `0 2px 8px rgba(80,0,240,0.25)`,
            '&:hover': { bgcolor: PRIMARY_DARK },
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
