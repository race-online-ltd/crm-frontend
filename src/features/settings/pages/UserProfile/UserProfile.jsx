import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

import { useUserProfile } from '../../context/UserProfileContext';
import {
  changePassword as changeUserPassword,
  getProfile,
  updateProfile as updateProfileApi,
} from '../../../../api/authAPI';
import {
  UserProfileHeader,
  ProfileHeaderCard,
  EditProfileModal,
  ChangePasswordModal,
} from '../../components/UserProfile';

export default function UserProfile() {
  const { profile, updateUser, isAuthenticated } = useUserProfile();
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const user = await getProfile();
        if (active && user) {
          updateUser(user);
        }
      } catch {
        // Keep the current cached profile if the API round-trip fails.
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [isAuthenticated, updateUser]);

  const handleSaveProfile = async (values) => {
    const nextUser = await updateProfileApi({
      full_name: values.fullName,
      email: values.email?.trim() ? values.email.trim() : null,
      phone: values.mobile?.trim() ? values.mobile.trim() : null,
    });

    updateUser(nextUser);
  };

  const handlePasswordSave = async (values) => {
    await changeUserPassword({
      current_password: values.oldPassword,
      new_password: values.newPassword,
      new_password_confirmation: values.confirmPassword,
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 1.5, sm: 3, md: 3 }, py: { xs: 2.5, sm: 3 } }}>
      <UserProfileHeader onChangePassword={() => setPasswordOpen(true)} />

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
