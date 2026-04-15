import React from 'react';
import {
  Avatar,
  Box,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function DetailLine({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: '10px',
          bgcolor: '#eff6ff',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="#64748b">
          {label}
        </Typography>
        <Typography fontWeight={700} color="#0f172a">
          {value || 'Not available'}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function ProfileHeaderCard({ profile, onEdit }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.25, sm: 3.5 },
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        bgcolor: '#fff',
        position: 'relative',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <IconButton
        onClick={onEdit}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 38,
          height: 38,
          bgcolor: '#eff6ff',
          border: '1px solid #bfdbfe',
          '&:hover': { bgcolor: '#dbeafe' },
        }}
      >
        <EditOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} />
      </IconButton>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 2.25, md: 3 }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
      >
        <Box
          sx={{
            width: { xs: 64, sm: 72 },
            height: { xs: 64, sm: 72 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Avatar
            src={profile.avatar || ''}
            sx={{
              width: { xs: 54, sm: 60 },
              height: { xs: 54, sm: 60 },
              bgcolor: '#2563eb',
              fontWeight: 800,
              fontSize: { xs: 22, sm: 24 },
              boxShadow: '0 10px 24px rgba(37,99,235,0.18)',
            }}
          >
            {!profile.avatar ? getInitials(profile.fullName) || 'U' : null}
          </Avatar>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
            <Box>
              <Typography variant="h5" fontWeight={700} color="#0f172a" lineHeight={1.2}>
                {profile.fullName}
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                Basic profile details and editable contact information.
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              mt: { xs: 2.25, sm: 3 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 1.5,
            }}
          >
            <DetailLine
              icon={<AccountCircleOutlinedIcon sx={{ fontSize: 17 }} />}
              label="Full Name"
              value={profile.fullName}
            />
            <DetailLine
              icon={<BadgeOutlinedIcon sx={{ fontSize: 17 }} />}
              label="User Name"
              value={profile.userName}
            />
            <DetailLine
              icon={<PhoneOutlinedIcon sx={{ fontSize: 17 }} />}
              label="Mobile Number"
              value={profile.mobile}
            />
            <DetailLine
              icon={<ApartmentOutlinedIcon sx={{ fontSize: 17 }} />}
              label="Department"
              value={profile.department}
            />
            <DetailLine
              icon={<WorkOutlineOutlinedIcon sx={{ fontSize: 17 }} />}
              label="Role"
              value={profile.role}
            />
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}
