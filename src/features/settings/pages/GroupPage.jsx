import React, { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import GroupForm from '../components/GroupForm';
import GroupTable from '../components/GroupTable';

const supervisorOptions = [
  { id: 'sup1', label: 'Supervisor One' },
  { id: 'sup2', label: 'Supervisor Two' },
  { id: 'sup3', label: 'Supervisor Three' },
  { id: 'sup4', label: 'Supervisor Four' },
];

const teamOptions = [
  { id: 'team1', label: 'Enterprise Growth' },
  { id: 'team2', label: 'Regional Sales' },
  { id: 'team3', label: 'Corporate Accounts' },
  { id: 'team4', label: 'Strategic Partnerships' },
];

const initialGroups = [
  {
    id: 1,
    groupName: 'North Cluster',
    supervisor: ['sup1', 'sup2'],
    teamName: ['team1', 'team2'],
    status: true,
  },
  {
    id: 2,
    groupName: 'Key Accounts Circle',
    supervisor: ['sup3'],
    teamName: ['team3', 'team4'],
    status: false,
  },
];

export default function GroupPage() {
  const [view, setView] = useState('list');
  const [groups, setGroups] = useState(initialGroups);
  const [editingGroup, setEditingGroup] = useState(null);

  const handleSave = (values) => {
    if (editingGroup) {
      const updatedGroup = { ...editingGroup, ...values };
      setGroups((prev) => prev.map((group) => (group.id === editingGroup.id ? updatedGroup : group)));
      console.log('Update group:', updatedGroup);
    } else {
      const nextGroup = {
        id: Date.now(),
        ...values,
      };
      setGroups((prev) => [nextGroup, ...prev]);
      console.log('Create group:', nextGroup);
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
