import React, { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import Groups2Icon from '@mui/icons-material/Groups2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import TeamForm from '../components/TeamForm';
import TeamTable from '../components/TeamTable';

const businessEntityOptions = [
  { id: 'be1', label: 'Race Online Ltd.' },
  { id: 'be2', label: 'Earth Telecommunication' },
  { id: 'be3', label: 'Orbit Internet' },
  { id: 'be4', label: 'Creative Communications' },
];

const kamOptions = [
  { id: 'kam1', label: 'John Doe' },
  { id: 'kam2', label: 'Jane Smith' },
  { id: 'kam3', label: 'Rahim Ahmed' },
  { id: 'kam4', label: 'Sadia Islam' },
];

const supervisorOptions = [
  { id: 'sup1', label: 'Supervisor One' },
  { id: 'sup2', label: 'Supervisor Two' },
  { id: 'sup3', label: 'Supervisor Three' },
  { id: 'sup4', label: 'Supervisor Four' },
];

const initialTeams = [
  {
    id: 1,
    teamName: 'Enterprise Growth',
    businessEntity: ['be1', 'be2'],
    assignKAM: ['kam1', 'kam2'],
    supervisor: ['sup1'],
    status: true,
  },
  {
    id: 2,
    teamName: 'Regional Sales',
    businessEntity: ['be3'],
    assignKAM: ['kam3'],
    supervisor: ['sup2', 'sup3'],
    status: false,
  },
];

export default function TeamPage() {
  const [view, setView] = useState('list');
  const [teams, setTeams] = useState(initialTeams);
  const [editingTeam, setEditingTeam] = useState(null);

  const handleSave = (values) => {
    if (editingTeam) {
      const updatedTeam = { ...editingTeam, ...values };
      setTeams((prev) => prev.map((team) => (team.id === editingTeam.id ? updatedTeam : team)));
      console.log('Update team:', updatedTeam);
    } else {
      const nextTeam = {
        id: Date.now(),
        ...values,
      };
      setTeams((prev) => [nextTeam, ...prev]);
      console.log('Create team:', nextTeam);
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
          businessEntityOptions={businessEntityOptions}
          kamOptions={kamOptions}
          supervisorOptions={supervisorOptions}
          initialValues={editingTeam}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
      <TeamTable
        teams={teams}
        businessEntityOptions={businessEntityOptions}
        kamOptions={kamOptions}
        supervisorOptions={supervisorOptions}
        onAddNew={handleCreate}
        onEdit={handleEdit}
      />
    </Box>
  );
}
