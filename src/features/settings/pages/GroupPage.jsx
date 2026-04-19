import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import GroupForm from '../components/GroupForm';
import GroupTable from '../components/GroupTable';
import {
  createGroup,
  fetchGroups,
  fetchSystemUsersPaginated,
  fetchTeams,
  updateGroup,
} from '../api/settingsApi';

function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === null || value === undefined || value === '') {
    return [];
  }

  return [value];
}

function toOptionList(items = []) {
  return toArray(items)
    .map((item) => {
      if (item && typeof item === 'object') {
        return {
          id: String(item.id),
          label: item.label || item.full_name || item.team_name || String(item.id),
        };
      }

      return {
        id: String(item),
        label: String(item),
      };
    })
    .filter((item) => item.id);
}

function mapGroupToForm(group) {
  const supervisorItems = toOptionList(group.supervisors);
  const teamItems = toOptionList(group.teams);

  return {
    id: group.id,
    groupName: group.group_name || group.name || '',
    supervisor: supervisorItems.length > 0
      ? supervisorItems.map((item) => item.id)
      : toArray(group.supervisor_id).map((value) => String(value)),
    teamName: teamItems.length > 0
      ? teamItems.map((item) => item.id)
      : toArray(group.team_id).map((value) => String(value)),
    supervisorItems,
    teamItems,
    supervisorName: group.supervisor_name || supervisorItems.map((item) => item.label).join(', '),
    teamLabel: group.team_name || teamItems.map((item) => item.label).join(', '),
    status: Boolean(group.status),
  };
}

function buildGroupPayload(values) {
  return {
    group_name: values.groupName.trim(),
    supervisor_id: values.supervisor.map((id) => Number(id)),
    team_id: values.teamName.map((id) => Number(id)),
    status: values.status,
  };
}

export default function GroupPage() {
  const [view, setView] = useState('list');
  const [groups, setGroups] = useState([]);
  const [supervisorOptions, setSupervisorOptions] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [groupData, userData, teamData] = await Promise.all([
          fetchGroups(),
          fetchSystemUsersPaginated({ page: 1, per_page: 100 }),
          fetchTeams(),
        ]);

        if (!active) return;
        setGroups((groupData || []).map(mapGroupToForm));
        setSupervisorOptions((userData.data || []).map((user) => ({
          id: String(user.id),
          label: `${user.full_name}${user.role_name ? ` (${user.role_name})` : ''}`,
        })));
        setTeamOptions((teamData || []).map((team) => ({
          id: String(team.id),
          label: team.team_name || team.name,
        })));
      } catch {
        if (active) {
          setGroups([]);
          setSupervisorOptions([]);
          setTeamOptions([]);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (values) => {
    const payload = buildGroupPayload(values);

    if (editingGroup) {
      const updatedGroup = mapGroupToForm(await updateGroup(editingGroup.id, payload));
      setGroups((prev) => prev.map((group) => (group.id === editingGroup.id ? updatedGroup : group)));
    } else {
      const nextGroup = mapGroupToForm(await createGroup(payload));
      setGroups((prev) => [nextGroup, ...prev]);
    }

    setEditingGroup(null);
    setView('list');
  };

  const handleCreate = () => {
    setEditingGroup(null);
    setView('form');
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setView('form');
  };

  const handleCancel = () => {
    setEditingGroup(null);
    setView('list');
  };

  if (view === 'form') {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
        <Box mb={3}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              onClick={() => setView('list')}
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
                '&:hover': {
                  bgcolor: '#f1f5f9',
                },
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
              <HubIcon sx={{ fontSize: 22, color: '#2563eb' }} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={700} color="#0f172a" lineHeight={1.2}>
                {editingGroup ? 'Edit Group' : 'Create Group'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <GroupForm
          supervisorOptions={supervisorOptions}
          teamOptions={teamOptions}
          initialValues={editingGroup}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
      <GroupTable
        groups={groups}
        supervisorOptions={supervisorOptions}
        teamOptions={teamOptions}
        onAddNew={handleCreate}
        onEdit={handleEdit}
      />
    </Box>
  );
}
