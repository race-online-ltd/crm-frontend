import React, { useState } from 'react';
import { Box, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import FacebookSettingsSection from '../components/social/FacebookSettingsSection';
import WhatsAppSettingsSection from '../components/social/WhatsAppSettingsSection';
import EmailSettingsSection from '../components/social/EmailSettingsSection';

const CHANNEL_TABS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
];

export default function SocialSettingsPage() {
  const [activeTab, setActiveTab] = useState('facebook');

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

      <Divider sx={{ mb: 2.5 }} />

      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, nextValue) => setActiveTab(nextValue)}
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{
            minHeight: 44,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 999,
            },
            '& .MuiTab-root': {
              minHeight: 44,
              textTransform: 'none',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#64748b',
              px: 2,
            },
            '& .Mui-selected': {
              color: '#0f172a',
            },
          }}
        >
          {CHANNEL_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {activeTab === 'facebook' && <FacebookSettingsSection />}
      {activeTab === 'whatsapp' && <WhatsAppSettingsSection />}
      {activeTab === 'email' && <EmailSettingsSection />}
    </Box>
  );
}
