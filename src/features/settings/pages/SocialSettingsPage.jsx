import React, { useCallback, useState } from 'react';
import { Box, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import FacebookSettingsSection from '../components/social/FacebookSettingsSection';
import WhatsAppSettingsSection from '../components/social/WhatsAppSettingsSection';
import EmailSettingsSection from '../components/social/EmailSettingsSection';
import { fetchBusinessEntities } from '../api/settingsApi';
import {
  activateSocialConnection,
  deactivateSocialConnection,
  deleteSocialConnection,
  fetchSocialConnections,
  saveSocialConnection,
} from '../api/socialConnectionsApi';

const CHANNEL_TABS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
];

export default function SocialSettingsPage() {
  const [activeTab, setActiveTab] = useState('facebook');
  const fetchActiveBusinessEntities = useCallback(async () => {
    const entities = await fetchBusinessEntities();
    return entities.filter((entity) => entity.status !== false);
  }, []);

  const fetchConnectionsByChannel = useCallback(async ({ channelKey }) => (
    fetchSocialConnections(channelKey)
  ), []);

  const saveConnection = useCallback(async ({ channelKey, payload }) => (
    saveSocialConnection({ channelKey, payload })
  ), []);

  const deleteConnection = useCallback(async ({ row }) => (
    deleteSocialConnection(row.id)
  ), []);

  const toggleConnectionActive = useCallback(async ({ row, nextIsActive }) => (
    nextIsActive
      ? activateSocialConnection(row.id)
      : deactivateSocialConnection(row.id)
  ), []);

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

      {activeTab === 'facebook' && (
        <FacebookSettingsSection
          fetchBusinessEntities={fetchActiveBusinessEntities}
          fetchConnections={fetchConnectionsByChannel}
          saveConnection={saveConnection}
          deleteConnection={deleteConnection}
          toggleConnectionActive={toggleConnectionActive}
        />
      )}
      {activeTab === 'whatsapp' && (
        <WhatsAppSettingsSection
          fetchBusinessEntities={fetchActiveBusinessEntities}
          fetchConnections={fetchConnectionsByChannel}
          saveConnection={saveConnection}
          deleteConnection={deleteConnection}
          toggleConnectionActive={toggleConnectionActive}
        />
      )}
      {activeTab === 'email' && (
        <EmailSettingsSection
          fetchBusinessEntities={fetchActiveBusinessEntities}
          fetchConnections={fetchConnectionsByChannel}
          saveConnection={saveConnection}
          deleteConnection={deleteConnection}
          toggleConnectionActive={toggleConnectionActive}
        />
      )}
    </Box>
  );
}
