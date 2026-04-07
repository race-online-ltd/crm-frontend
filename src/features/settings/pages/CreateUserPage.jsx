import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Stack, Typography, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SystemUserForm from '../components/SystemUserForm';

export default function CreateUserPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData || null;
  const isEdit = Boolean(editData);

  const handleSubmit = (values) => {
    // TODO: wire to backend
    console.log(editData ? 'Update user:' : 'Create user:', values);
    navigate('/settings/users');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
      <Box mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            onClick={() => navigate(-1)}
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
            {isEdit
              ? <EditNoteIcon sx={{ fontSize: 22, color: '#2563eb' }} />
              : <PersonAddAlt1Icon sx={{ fontSize: 22, color: '#2563eb' }} />}
          </Box>

          <Box>
            <Typography variant="h5" fontWeight={700} color="#0f172a" lineHeight={1.2}>
              {isEdit ? 'Edit System User' : 'Create System User'}
            </Typography>
            {/* <Typography variant="body2" color="text.secondary" mt={0.3}>
              {isEdit
                ? 'Update account details, access settings, and reporting assignments.'
                : 'Add a new internal user with the right role, access, and supervisor mapping.'}
            </Typography> */}
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <SystemUserForm
        editData={editData}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/settings/users')}
      />
    </Box>
  );
}
