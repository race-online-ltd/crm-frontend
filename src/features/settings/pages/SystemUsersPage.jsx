import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Typography, Button, Stack, InputAdornment } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import TextInputField from '../../../components/shared/TextInputField';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import SystemUserList from '../components/SystemUserList';
import { fetchSystemUsers } from '../api/settingsApi';

export default function SystemUsersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [users, setUsers] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      try {
        setLoadError('');
        const data = await fetchSystemUsers();
        if (!active) {
          return;
        }

        setUsers(
          data.map((user) => ({
            id: user.id,
            fullName: user.full_name,
            full_name: user.full_name,
            userName: user.user_name,
            user_name: user.user_name,
            email: user.email,
            phone: user.phone,
            role: String(user.role_id),
            role_id: user.role_id,
            roleName: user.role_name,
            status: user.status,
          })),
        );
      } catch (error) {
        if (active) {
          setLoadError(error?.message || 'Unable to load system users.');
        }
      }
    };

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  const roleOptions = useMemo(() => {
    const uniqueRoles = [...new Set(users.map((user) => user.roleName).filter(Boolean))];
    return uniqueRoles.map((role) => ({
      id: role,
      label: role,
    }));
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = !query || [user.fullName, user.userName, user.email]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));

      const matchesRole = !roleFilter || user.roleName === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const handleEdit = (user) => {
    navigate('/settings/users/create', { state: { editData: user } });
  };

  const handleAssign = (user) => {
    navigate('/settings/users/mapping', { state: { user } });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        sx={{ mb: 3 }}
        gap={2}
      >
        <Box>
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
              <GroupIcon sx={{ fontSize: 22, color: '#2563eb' }} />
            </Box>
            <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
              System Users
            </Typography>
          </Stack>
          
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => navigate('/settings/users/create')}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 13,
            px: 2.5,
            py: 1,
            boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
            whiteSpace: 'nowrap',
            alignSelf: { xs: 'stretch', sm: 'auto' },
          }}
        >
          Add User
        </Button>
      </Stack>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {loadError}
        </Alert>
      )}

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{ mb: 2 }}
      >
        <Box sx={{ flex: 1 }}>
          <TextInputField
            name="system-user-search"
            label="Search Users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by full name, username, or email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ width: { xs: '100%', md: 240 } }}>
          <SelectDropdownSingle
            name="roleFilter"
            label="Filter by Role"
            fetchOptions={async () => roleOptions}
            value={roleFilter}
            onChange={(id) => setRoleFilter(id)}
          />
        </Box>
      </Stack>

      <SystemUserList users={filteredUsers} onEdit={handleEdit} onAssign={handleAssign} />
    </Box>
  );
}
