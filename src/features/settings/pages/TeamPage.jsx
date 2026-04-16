import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Stack, Typography } from '@mui/material';
import Groups2Icon from '@mui/icons-material/Groups2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import TeamForm from '../components/TeamForm';
import TeamTable from '../components/TeamTable';
import {
  createTeam,
  fetchSystemUsersPaginated,
  fetchTeams,
  updateTeam,
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

function mapUserToOption(user) {
  return {
    id: String(user.id),
    label: `${user.full_name}${user.role_name ? ` (${user.role_name})` : ''}`,
  };
}

function mapTeamToForm(team) {
  return {
    id: team.id,
    teamName: team.team_name || '',
    supervisor: toArray(team.supervisor_id).map((value) => String(value)),
    assignKAM: toArray(team.kam_id).map((value) => String(value)),
    status: Boolean(team.status),
  };
}

function buildTeamPayload(values) {
  return {
    team_name: values.teamName.trim(),
    supervisor_id: values.supervisor.map((id) => Number(id)),
    kam_id: values.assignKAM.map((id) => Number(id)),
    status: values.status,
  };
}

export default function TeamPage() {
  const [view, setView] = useState('list');
  const [teams, setTeams] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadError('');

        const [teamResponse, userResponse] = await Promise.all([
          fetchTeams(),
          fetchSystemUsersPaginated({ page: 1, per_page: 100 }),
        ]);

        if (!active) {
          return;
        }

        setTeams((teamResponse || []).map(mapTeamToForm));
        setUserOptions((userResponse.data || []).map(mapUserToOption));
      } catch (error) {
        if (active) {
          setTeams([]);
          setUserOptions([]);
          setLoadError(error?.message || 'Unable to load team directory.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const supervisorOptions = useMemo(() => userOptions, [userOptions]);
  const kamOptions = useMemo(() => userOptions, [userOptions]);

  const handleSave = async (values) => {
    setLoadError('');

    const payload = buildTeamPayload(values);

    if (editingTeam) {
      const updatedTeam = mapTeamToForm(await updateTeam(editingTeam.id, payload));
      setTeams((prev) => prev.map((team) => (team.id === editingTeam.id ? updatedTeam : team)));
    } else {
      const nextTeam = mapTeamToForm(await createTeam(payload));
      setTeams((prev) => [nextTeam, ...prev]);
    }

    setEditingTeam(null);
    setView('list');
  };

  const handleCreate = () => {
    setEditingTeam(null);
    setView('form');
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setView('form');
  };

  const handleCancel = () => {
    setEditingTeam(null);
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
              <Groups2Icon sx={{ fontSize: 22, color: '#2563eb' }} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={700} color="#0f172a" lineHeight={1.2}>
                {editingTeam ? 'Edit Team' : 'Create Team'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <TeamForm
          supervisorOptions={supervisorOptions}
          kamOptions={kamOptions}
          initialValues={editingTeam}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
      {loadError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {loadError}
        </Alert>
      )}

      <TeamTable
        teams={teams}
        supervisorOptions={supervisorOptions}
        kamOptions={kamOptions}
        onAddNew={handleCreate}
        onEdit={handleEdit}
        loading={isLoading}
      />
    </Box>
  );
}
