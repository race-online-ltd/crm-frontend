import React from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import FacebookSettingsSection from '../components/social/FacebookSettingsSection';
import WhatsAppSettingsSection from '../components/social/WhatsAppSettingsSection';
import EmailSettingsSection from '../components/social/EmailSettingsSection';

export default function SocialSettingsPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
      <Box mb={3}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
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
            <SettingsEthernetIcon sx={{ fontSize: 22, color: '#2563eb' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} color="#0f172a" lineHeight={1.2}>
              Social Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.35}>
              Manage Facebook, WhatsApp, and email connections per business entity so the Social inbox can route receive and send flows dynamically.
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Stack spacing={3}>
        <FacebookSettingsSection />
        <WhatsAppSettingsSection />
        <EmailSettingsSection />
      </Stack>
    </Box>
  );
}
