import React, { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

import { useUserProfile } from '../../context/UserProfileContext';
import ProfileHeaderCard from './components/ProfileHeaderCard';
import EditProfileModal from './forms/EditProfileModal';
import ChangePasswordModal from './forms/ChangePasswordModal';

export default function UserProfile() {
  const { profile, updateProfile } = useUserProfile();
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const handleSaveProfile = (values) => {
    updateProfile({
      fullName: values.fullName,
      email: values.email,
      mobile: values.mobile,
      avatar: values.avatar || '',
    });
  };

  const handlePasswordSave = async (values) => {
    console.log('Change password:', values);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 1.5, sm: 3, md: 3 }, py: { xs: 2.5, sm: 3 } }}>
      <Box sx={{ mx: 'auto', width: '100%' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          spacing={2}
          mb={3}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0 }}>

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
              <AccountCircleOutlinedIcon sx={{ fontSize: 22, color: '#2563eb' }} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h5"
                fontWeight={700}
                color="#0f172a"
                lineHeight={1.2}
                sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' }, wordBreak: 'break-word' }}
              >
                User Profile
              </Typography>
              <Typography
                variant="body2"
                color="#64748b"
                sx={{ mt: 0.4, fontSize: { xs: '0.82rem', sm: '0.875rem' }, wordBreak: 'break-word' }}
              >
                All profile details are visible here. Edit only the allowed fields.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            startIcon={<LockOutlinedIcon />}
            onClick={() => setPasswordOpen(true)}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: '100%', sm: 'fit-content' },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 13,
              px: 2.5,
              py: 1,
              boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
              whiteSpace: 'nowrap',
              alignSelf: { xs: 'stretch', md: 'auto' },
              bgcolor: '#2563eb',
              '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 4px 14px rgba(37,99,235,0.25)' },
            }}
          >
            Change Password
          </Button>
        </Stack>
      </Box>

      <ProfileHeaderCard profile={profile} onEdit={() => setEditOpen(true)} />

      <EditProfileModal
        open={editOpen}
        profile={profile}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveProfile}
      />

      <ChangePasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSave={handlePasswordSave}
      />
    </Box>
  );
}
