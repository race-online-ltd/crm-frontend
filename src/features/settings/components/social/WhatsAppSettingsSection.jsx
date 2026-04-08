import React from 'react';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SocialConnectionSection from './SocialConnectionSection';
import { WHATSAPP_FIELDS } from '../../constants/socialSettings';

export default function WhatsAppSettingsSection() {
  return (
    <SocialConnectionSection
      title="WhatsApp Cloud API"
      subtitle="Save Cloud API credentials per business entity so inbound webhook events and outbound messages can switch dynamically."
      icon={<WhatsAppIcon sx={{ fontSize: 22 }} />}
      accent={{ color: '#25D366', bg: '#ecfdf3', border: '#bbf7d0' }}
      channelKey="whatsapp"
      fields={WHATSAPP_FIELDS}
      primaryField="displayPhoneNumber"
      identifierFields={['businessAccountId', 'phoneNumberId', 'graphApiVersion']}
      // docs={[
      //   { label: 'WhatsApp Cloud API', href: 'https://developers.facebook.com/docs/whatsapp/cloud-api/' },
      //   { label: 'WhatsApp Webhooks', href: 'https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/' },
      // ]}
    />
  );
}
